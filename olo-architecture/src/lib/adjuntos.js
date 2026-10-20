// Adjuntos de una consulta al asesor (fotos, capturas, videos cortos, PDF, Word, texto).
// En el navegador se prepara lo que el modelo necesita para responder:
//   · imagen → JPEG reducido · PDF → texto (o sus primeras páginas como imagen si es
//     escaneado) · Word → texto · video → fotogramas (y una hoja de fotogramas)
// y se decide dónde se guarda el original:
//   · «oficial»  → Documentación oficial ePRAC (solicitud de cambio o documento de
//     desarrollo de ePRAC): bucket eprac-docs + eprac_cargas (lo procesa el job eprac_docs)
//   · «abstracto» → Conocimiento abstracto (todo lo demás): bucket asesor-abstracto +
//     asesor_abstracto, y la función asesor-abstracto lo clasifica al momento
import * as pdfjsLib from "pdfjs-dist";
import { supabase } from "./supabaseClient.js";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();

export const MAX_MB = 15;
export const MAX_IMAGENES = 8;            // imágenes que viajan al modelo por consulta
export const DESTINOS = { oficial: "Documentación oficial ePRAC", abstracto: "Conocimiento abstracto" };
export const seguro = n => n.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^\w.-]+/g, "_").slice(-80);

// Texto de un .docx (zip; word/document.xml trae el texto)
export async function textoDocx(file) {
  const buf = await file.arrayBuffer(), dv = new DataView(buf);
  let eocd = buf.byteLength - 22; while (eocd > 0 && dv.getUint32(eocd, true) !== 0x06054b50) eocd--;
  let off = dv.getUint32(eocd + 16, true); const n = dv.getUint16(eocd + 10, true);
  for (let i = 0; i < n; i++) {
    const metodo = dv.getUint16(off + 10, true), comp = dv.getUint32(off + 20, true), ln = dv.getUint16(off + 28, true), le = dv.getUint16(off + 30, true), lc = dv.getUint16(off + 32, true), loc = dv.getUint32(off + 42, true);
    const nombre = new TextDecoder().decode(new Uint8Array(buf, off + 46, ln));
    if (nombre === "word/document.xml") {
      const ini = loc + 30 + dv.getUint16(loc + 26, true) + dv.getUint16(loc + 28, true);
      let datos = new Uint8Array(buf, ini, comp);
      if (metodo === 8) datos = new Uint8Array(await new Response(new Blob([datos]).stream().pipeThrough(new DecompressionStream("deflate-raw"))).arrayBuffer());
      const xml = new TextDecoder().decode(datos);
      return xml.replace(/<\/w:p>/g, "\n").replace(/<w:tab\/>/g, "\t").replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/\n{3,}/g, "\n\n").trim();
    }
    off += 46 + ln + le + lc;
  }
  return "";
}

// Imagen (o canvas) → JPEG reducido como data URL
function aJpeg(fuente, ancho, alto, max = 1280, calidad = 0.78) {
  const k = Math.min(1, max / Math.max(ancho, alto));
  const c = document.createElement("canvas"); c.width = Math.round(ancho * k); c.height = Math.round(alto * k);
  c.getContext("2d").drawImage(fuente, 0, 0, c.width, c.height);
  return c.toDataURL("image/jpeg", calidad);
}
async function imagenDe(file) {
  const bmp = await createImageBitmap(file);
  const url = aJpeg(bmp, bmp.width, bmp.height); bmp.close?.(); return url;
}
async function pdfDe(file) {
  const doc = await pdfjsLib.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
  let texto = "";
  for (let p = 1; p <= Math.min(doc.numPages, 20); p++) {
    const c = await (await doc.getPage(p)).getTextContent();
    texto += c.items.map(i => i.str).join(" ") + "\n";
  }
  texto = texto.replace(/[ \t]+/g, " ").trim();
  const imagenes = [];
  if (texto.length < 200) for (let p = 1; p <= Math.min(doc.numPages, 3); p++) {   // escaneado: las páginas como imagen
    const pag = await doc.getPage(p), vp = pag.getViewport({ scale: 1.6 });
    const c = document.createElement("canvas"); c.width = vp.width; c.height = vp.height;
    await pag.render({ canvasContext: c.getContext("2d"), viewport: vp }).promise;
    imagenes.push(aJpeg(c, c.width, c.height));
  }
  return { texto, imagenes, paginas: doc.numPages };
}
// Video corto → 6 fotogramas repartidos + una hoja de fotogramas (3×2) para archivarla
async function videoDe(file, n = 6) {
  const v = document.createElement("video"); v.muted = true; v.preload = "auto"; v.src = URL.createObjectURL(file);
  await new Promise((ok, mal) => { v.onloadedmetadata = ok; v.onerror = () => mal(new Error("El navegador no pudo leer el video (usa MP4 o WebM).")); });
  const dur = v.duration || 0, cuadros = [];
  for (let i = 0; i < n; i++) {
    v.currentTime = Math.min(dur - 0.05, (dur * (i + 0.5)) / n);
    await new Promise(ok => { v.onseeked = ok; });
    const c = document.createElement("canvas"); c.width = v.videoWidth; c.height = v.videoHeight;
    c.getContext("2d").drawImage(v, 0, 0); cuadros.push({ c, t: v.currentTime });
  }
  URL.revokeObjectURL(v.src);
  // hoja de fotogramas
  const w = 480, h = Math.round(w * (v.videoHeight / v.videoWidth || 0.5625));
  const hoja = document.createElement("canvas"); hoja.width = w * 3; hoja.height = h * 2;
  const g = hoja.getContext("2d"); g.fillStyle = "#000"; g.fillRect(0, 0, hoja.width, hoja.height);
  cuadros.forEach((q, i) => { g.drawImage(q.c, (i % 3) * w, Math.floor(i / 3) * h, w, h); g.fillStyle = "#fff"; g.font = "16px sans-serif"; g.fillText(`${q.t.toFixed(1)} s`, (i % 3) * w + 8, Math.floor(i / 3) * h + 22); });
  const hojaBlob = await new Promise(ok => hoja.toBlob(ok, "image/jpeg", 0.8));
  return { imagenes: cuadros.map(q => aJpeg(q.c, q.c.width, q.c.height, 960)), duracion: dur, hojaBlob };
}

// Destino por defecto: lo mismo que reconoce la ingesta de la documentación de ePRAC
function destinoDe(nombre, texto) {
  const ini = (texto || "").slice(0, 800);
  if (/SOLICITUD DE CAMBIO/i.test(ini) && !/formato/i.test(nombre)) return "oficial";
  if (/^ePRAC\s*-\s*\d+/i.test(nombre) || /especificaci[oó]n t[eé]cnica|documento de desarrollo|entrega de desarrollo/i.test(ini)) return "oficial";
  return "abstracto";
}

// Prepara un archivo: { id, file, nombre, tipo, texto, imagenes, destino, nota, error }
export async function prepararAdjunto(file) {
  const base = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, file, nombre: file.name, texto: "", imagenes: [] };
  if (file.size > MAX_MB * 1048576) return { ...base, tipo: "otro", error: `Pesa más de ${MAX_MB} MB` };
  const ext = file.name.split(".").pop().toLowerCase();
  try {
    if (file.type.startsWith("image/")) return { ...base, tipo: "imagen", imagenes: [await imagenDe(file)], destino: "abstracto" };
    if (file.type.startsWith("video/")) { const r = await videoDe(file); return { ...base, tipo: "video", imagenes: r.imagenes, hojaBlob: r.hojaBlob, destino: "abstracto", nota: `${r.duracion.toFixed(0)} s · ${r.imagenes.length} fotogramas` }; }
    if (file.type === "application/pdf" || ext === "pdf") { const r = await pdfDe(file); return { ...base, tipo: "pdf", texto: r.texto, imagenes: r.imagenes, destino: destinoDe(file.name, r.texto), nota: `${r.paginas} pág.${r.imagenes.length ? " · escaneado" : ""}` }; }
    if (ext === "docx") { const texto = await textoDocx(file); return { ...base, tipo: "docx", texto, destino: destinoDe(file.name, texto) }; }
    if (["txt", "eml", "md", "csv", "json", "log"].includes(ext) || file.type.startsWith("text/")) return { ...base, tipo: ext === "eml" ? "correo" : "texto", texto: (await file.text()).slice(0, 60000), destino: "abstracto" };
    return { ...base, tipo: "otro", error: "Formato no soportado (usa imagen, video, PDF, Word, .txt o .eml)" };
  } catch (e) { return { ...base, tipo: "otro", error: e.message }; }
}

// Lo que viaja al modelo para responder (texto recortado e imágenes con tope total)
export function paraElModelo(adjuntos) {
  let quedan = MAX_IMAGENES;
  return adjuntos.filter(a => !a.error).map(a => {
    const imagenes = a.imagenes.slice(0, quedan); quedan -= imagenes.length;
    return { nombre: a.nombre, tipo: a.tipo, nota: a.nota || null, texto: a.texto ? a.texto.slice(0, 15000) : null, imagenes };
  });
}

// Guarda el original donde corresponde; devuelve { nombre, tipo, destino, ref }
export async function guardarAdjunto(a, { pregunta, perfil }) {
  const quien = perfil?.nombre || perfil?.email || null;
  if (a.destino === "oficial") {
    const path = `cargas/${Date.now()}_${seguro(a.nombre)}`;
    const up = await supabase.storage.from("eprac-docs").upload(path, a.file, { contentType: a.file.type || undefined, upsert: false });
    if (up.error) throw new Error(`No se pudo guardar ${a.nombre}: ${up.error.message}`);
    const { data, error } = await supabase.from("eprac_cargas").insert({ nombre: a.nombre, path, tamano: a.file.size, subido_nombre: quien ? `${quien} (desde una consulta)` : "desde una consulta" }).select("id").single();
    if (error) throw new Error(error.message);
    return { nombre: a.nombre, tipo: a.tipo, destino: "oficial", ref: data.id };
  }
  // Conocimiento abstracto: imagen y PDF van como archivo; Word y texto, como contenido; el video, como su hoja de fotogramas
  const carpeta = crypto.randomUUID ? crypto.randomUUID() : String(Date.now());
  let archivo = null, mime = null, archivoNombre = a.nombre;
  if (a.tipo === "imagen" || a.tipo === "pdf") { archivo = a.file; mime = a.file.type || (a.tipo === "pdf" ? "application/pdf" : "image/jpeg"); }
  if (a.tipo === "video") { archivo = a.hojaBlob; mime = "image/jpeg"; archivoNombre = `${a.nombre} (fotogramas).jpg`; }
  let archivo_path = null;
  if (archivo) {
    archivo_path = `${carpeta}/${seguro(archivoNombre)}`;
    const up = await supabase.storage.from("asesor-abstracto").upload(archivo_path, archivo, { contentType: mime, upsert: false });
    if (up.error) throw new Error(`No se pudo guardar ${a.nombre}: ${up.error.message}`);
  }
  const fuente = { imagen: "imagen", video: "imagen", pdf: "documento", docx: "documento", correo: "correo", texto: "documento" }[a.tipo] || "documento";
  const contexto = `Adjuntado en una consulta al asesor: «${String(pregunta).slice(0, 300)}»${a.tipo === "video" ? `. Es un video (${a.nota}); el archivo guardado es su hoja de fotogramas.` : ""}`;
  const { data, error } = await supabase.from("asesor_abstracto").insert({ titulo: a.nombre, fuente, contenido: a.texto ? `${contexto}\n\n${a.texto.slice(0, 200000)}` : contexto,
    archivo_path, archivo_nombre: archivo ? archivoNombre : null, mime }).select("id").single();
  if (error) throw new Error(error.message);
  // se clasifica y entra a la base de conocimiento en segundo plano (30–90 s)
  supabase.functions.invoke("asesor-abstracto", { body: { id: data.id } });
  return { nombre: a.nombre, tipo: a.tipo, destino: "abstracto", ref: data.id };
}
