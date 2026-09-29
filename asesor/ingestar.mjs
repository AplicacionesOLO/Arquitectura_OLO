// asesor/ingestar.mjs — alimenta la base de conocimiento del «Asesor de cambios».
//   1. Solicitudes de cambio (.docx / .pdf de la carpeta indicada): extrae el
//      texto, lo estructura según la plantilla de ePRAC y detecta las tablas,
//      reglas, pantallas y procesos que menciona → solicitudes_cambio.
//      El estado y las notas que se editan en el BPA NO se pisan al re-ingerir.
//   2. Todo lo que el BPA ya sabe, como documentos consultables (asesor_docs):
//      tablas (estructura real de la instantánea de schema_watch + lo mapeado),
//      pantallas de eFlow WMS / Torre de Control / SORTER / Softland, los 67
//      procesos, reglas operativas y contexto.
//   3. Documentación oficial ePRAC cargada desde el BPA (bucket privado eprac-docs,
//      registro en eprac_cargas): se suma a la carpeta con la misma lógica y cada
//      carga queda procesada, duplicada o con error.
// Uso: node asesor/ingestar.mjs ["C:\ruta\a\las\solicitudes"] [--solo-si-pendientes]
//   --solo-si-pendientes: termina de inmediato si no hay cargas pendientes (job eprac_docs)
// Credenciales: ../.env (clave de servicio de Supabase). Solo escribe en Supabase.
import fs from "fs";
import os from "os";
import path from "path";
import zlib from "zlib";
import crypto from "crypto";
import { execFileSync } from "child_process";
import { pathToFileURL, fileURLToPath } from "url";

const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const DATA = path.join(RAIZ, "olo-architecture", "src", "data");
const POSICIONALES = process.argv.slice(2).filter(a => !a.startsWith("--"));
const CARPETA = POSICIONALES[0] || "C:/Users/arojast/Desktop/ar/Eprac";
const SOLO_SI_PENDIENTES = process.argv.includes("--solo-si-pendientes");
const imp = f => import(pathToFileURL(path.join(DATA, f)).href);

// ── Supabase (clave de servicio) ────────────────────────────────────────────
const env = {};
fs.readFileSync(path.join(RAIZ, ".env"), "utf8").split("\n").forEach(l => {
  const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
  if (m && !l.trim().startsWith("#")) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
});
const H = { apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`, "Content-Type": "application/json" };
async function api(metodo, ruta, cuerpo, prefer = "return=minimal") {
  const r = await fetch(`${env.SUPABASE_URL}/rest/v1/${ruta}`, { method: metodo, headers: { ...H, Prefer: prefer }, body: cuerpo ? JSON.stringify(cuerpo) : undefined });
  if (!r.ok) throw new Error(`${metodo} ${ruta.split("?")[0]}: ${r.status} ${(await r.text()).slice(0, 200)}`);
  return r.status === 204 || prefer.includes("minimal") ? null : r.json();
}
async function upsert(tabla, filas, conflicto = "id") {
  for (let i = 0; i < filas.length; i += 200)
    await api("POST", `${tabla}?on_conflict=${conflicto}`, filas.slice(i, i + 200), "resolution=merge-duplicates,return=minimal");
}

// ── Documentación ePRAC cargada desde el BPA ────────────────────────────────
const CARGAS = await api("GET", "eprac_cargas?select=id,nombre,path,estado,tipo,mensaje,created_at&order=created_at", null, "count=none");
const esPendiente = c => c.estado === "pendiente" || c.estado === "procesando"; // «procesando» = corrida anterior que no terminó
if (SOLO_SI_PENDIENTES && !CARGAS.some(esPendiente)) { console.log("sin cargas pendientes: nada que procesar"); process.exit(0); }
// el BPA muestra «Procesando» mientras corre
if (CARGAS.some(c => c.estado === "pendiente")) await api("PATCH", "eprac_cargas?estado=eq.pendiente", { estado: "procesando" });
// Se descargan todas (no solo las pendientes): la base de conocimiento se regenera completa en cada corrida
const DIR_CARGAS = path.join(os.tmpdir(), "bpa-eprac-cargas");
fs.mkdirSync(DIR_CARGAS, { recursive: true });
for (const c of CARGAS) {
  if (c.estado === "error") continue; // se reintenta solo si el admin la vuelve a dejar pendiente
  c.local = path.join(DIR_CARGAS, `${c.id}${path.extname(c.nombre).toLowerCase()}`);
  if (fs.existsSync(c.local)) continue;
  const r = await fetch(`${env.SUPABASE_URL}/storage/v1/object/eprac-docs/${c.path.split("/").map(encodeURIComponent).join("/")}`, { headers: H });
  if (!r.ok) { c.fallo = `no se pudo descargar (${r.status})`; delete c.local; continue; }
  fs.writeFileSync(c.local, Buffer.from(await r.arrayBuffer()));
}

// ── Datos del BPA ───────────────────────────────────────────────────────────
const { PROCESOS } = await imp("procesos_fichas.js");
const WMS = JSON.parse(fs.readFileSync(path.join(DATA, "wms_manual.json"), "utf8"));
const { WMS_INDEX, PANTALLA_TABLAS, TABLA_PANTALLAS, PANTALLA_PROCESOS } = await imp("wms_links.js");
const { WMH_PANTALLAS } = await imp("wmh_manual.js");
const { SORTER_PANTALLAS } = await imp("sorter_manual.js");
const { HH_PANTALLAS, HH_META, HH_HALLAZGOS, pantallaHhDePaso } = await imp("hh_manual.js");
const CTX = await imp("contexto.js");
const { GAPS } = await imp("softland.js");
const DD = JSON.parse(fs.readFileSync(path.join(DATA, "softland_dd.json"), "utf8"));
const { EFW_TABLE_DEFS } = await imp("efw.js");
const { WMH_CR_TABLE_DEFS } = await imp("wmh_cr.js");
const snap = (() => { try { return JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(RAIZ, "schema_watch", "snapshots", "latest.json.gz")))); } catch { return null; } })();

const norm = s => String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const fichas = Object.values(PROCESOS);
// qué procesos usan cada tabla (según las fichas)
const procPorTabla = {};
fichas.forEach(p => (p.tablas || []).forEach(t => (procPorTabla[t.tabla.toUpperCase()] ||= new Set()).add(`${p.codigo} · ${p.nombre}`)));

// ── 1. Solicitudes de cambio ────────────────────────────────────────────────
function textoDocx(p) {
  // .docx = zip; el texto está en word/document.xml (unzip con PowerShell no hace falta: se lee con zlib vía el directorio central)
  const buf = fs.readFileSync(p);
  const xml = leerZip(buf, "word/document.xml");
  return xml.replace(/<\/w:p>/g, "\n").replace(/<w:tab\/>/g, "\t").replace(/<[^>]+>/g, "")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/\n{3,}/g, "\n\n").trim();
}
function leerZip(buf, nombre) {
  // lector mínimo de ZIP (directorio central) para no depender de paquetes
  let eocd = buf.length - 22; while (eocd >= 0 && buf.readUInt32LE(eocd) !== 0x06054b50) eocd--;
  const n = buf.readUInt16LE(eocd + 10); let off = buf.readUInt32LE(eocd + 16);
  for (let i = 0; i < n; i++) {
    const metodo = buf.readUInt16LE(off + 10), comp = buf.readUInt32LE(off + 20), ln = buf.readUInt16LE(off + 28), le = buf.readUInt16LE(off + 30), lc = buf.readUInt16LE(off + 32), local = buf.readUInt32LE(off + 42);
    const nom = buf.toString("utf8", off + 46, off + 46 + ln);
    if (nom === nombre) {
      const lnl = buf.readUInt16LE(local + 26), lel = buf.readUInt16LE(local + 28), ini = local + 30 + lnl + lel;
      const datos = buf.subarray(ini, ini + comp);
      return (metodo === 8 ? zlib.inflateRawSync(datos) : datos).toString("utf8");
    }
    off += 46 + ln + le + lc;
  }
  throw new Error(`${nombre} no está en el documento`);
}
// pdftotext (Poppler): la tarea de Windows del despachador no tiene en su PATH la carpeta de Git
// donde suele estar, así que se busca en las ubicaciones conocidas (o en la variable PDFTOTEXT).
const PDFTOTEXT = [process.env.PDFTOTEXT, env.PDFTOTEXT,
  path.join(os.homedir(), "AppData/Local/Programs/Git/mingw64/bin/pdftotext.exe"),
  "C:/Program Files/Git/mingw64/bin/pdftotext.exe", "C:/Program Files/poppler/Library/bin/pdftotext.exe"].find(p => p && fs.existsSync(p)) || "pdftotext";
const textoPdf = p => {
  try { return execFileSync(PDFTOTEXT, ["-layout", "-enc", "UTF-8", p, "-"], { encoding: "utf8", maxBuffer: 32 * 1024 * 1024, stdio: ["ignore", "pipe", "pipe"] }); }
  catch (e) { if (e.code === "ENOENT") { const err = new Error("pdftotext no está instalado en el equipo del despachador"); err.sinPdftotext = true; throw err; } throw e; }
};

// Estructura según la plantilla de ePRAC
function estructurar(texto) {
  const L = texto.split("\n").map(s => s.trim());
  const idx = re => L.findIndex(l => re.test(l));
  const valoresTras = (i, n) => { const out = []; for (let k = i + 1; k < L.length && out.length < n; k++) if (L[k]) out.push(L[k]); return out; };
  const r = {};
  const iComp = idx(/^Compa[ñn][ií]a/i);
  if (iComp >= 0) [r.cliente, r.almacen, r.compania] = valoresTras(iComp, 3);
  const iPrio = idx(/^Prioridad$/i);
  if (iPrio >= 0) { const v = valoresTras(iPrio, 4); [r.solicitante, r.fechaTxt, r.modulo, r.prioridad] = v; }
  const iPara = idx(/^Para$/i);
  if (iPara >= 0) [r.como, r.necesito, r.para] = valoresTras(iPara, 3);
  const iSit = idx(/^Situaci[oó]n Actual/i), iDes = idx(/^Descripci[oó]n del cambio/i), iFin = idx(/^Fecha Atenci[oó]n/i);
  const tramo = (a, b) => a >= 0 ? L.slice(a + 1, b > a ? b : undefined).join("\n").trim() : "";
  r.situacion = tramo(iSit, iDes >= 0 ? iDes : iFin);
  r.descripcion = tramo(iDes, iFin);
  if (!r.situacion && !r.descripcion) r.descripcion = texto;
  // lo que llena ePRAC al atender (si está lleno, es señal de que se atendió)
  if (iFin >= 0) {
    const pie = L.slice(iFin).join("\n");
    // solo la línea inmediata al rótulo; vacía, texto de ayuda o el rótulo siguiente = no se llenó
    const ROTULO = /^(Fecha Atenci|Atendido por|N[uú]mero |\*Campos|\*Esta solicitud|\*Despu)/i;
    const campo = re => { const m = pie.match(re); const v = m?.[1]?.trim(); return v && !ROTULO.test(v) && !/Seleccione una fecha|Nombre de colaborar/i.test(v) ? v : null; };
    r.atencion = { fecha: campo(/Fecha Atenci[oó]n\*?[ \t]*\n[ \t]*([^\n]*)/), atendidoPor: campo(/Atendido por\*?[ \t]*\n[ \t]*([^\n]*)/), proforma: campo(/N[uú]mero Proforma\*?[ \t]*\n[ \t]*([^\n]*)/),
      solicitud: campo(/N[uú]mero Solicitud[ \t]*\n[ \t]*([^\n]*)/), factura: campo(/N[uú]mero de Factura[ \t]*\n[ \t]*([^\n]*)/) };
    Object.keys(r.atencion).forEach(k => { if (!r.atencion[k]) delete r.atencion[k]; });
  }
  const f = (r.fechaTxt || "").match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
  if (f) r.fecha = `${f[3].length === 2 ? "20" + f[3] : f[3]}-${f[2].padStart(2, "0")}-${f[1].padStart(2, "0")}`;
  return r;
}

// Tablas y reglas conocidas (para detectar lo que menciona cada solicitud)
const tablasConocidas = new Set([...Object.keys(EFW_TABLE_DEFS), ...Object.keys(WMH_CR_TABLE_DEFS)].map(t => t.toUpperCase()));
if (snap) for (const [inst, x] of Object.entries(snap.instancias)) for (const [db, b] of Object.entries(x.bases || {}))
  if (!b.error && /EFLOW|WMH/.test(db)) Object.values(b.esquemas).forEach(e => Object.keys(e.tablas).forEach(t => tablasConocidas.add(t.toUpperCase())));
const pantallasWms = Object.values(WMS.modules).flatMap(m => m.screens.map(s => ({ id: s.id, nombre: s.option, modulo: m.name }))).filter(s => s.nombre && s.nombre.length >= 6);
// Ficha de un documento de desarrollo: pares «rótulo / valor» de su tabla de información general
const ROTULOS_FICHA = { "id": "ID", "id desarrollo": "ID", "nombre": "Nombre", "proyecto": "Proyecto", "cliente": "Cliente", "sistema": "Sistema", "modulo": "Módulo",
  "responsable": "Responsable", "fecha": "Fecha", "version": "Versión", "estado": "Estado" };
function fichaDe(texto) {
  const L = texto.split("\n").map(s => s.trim()).filter(Boolean).slice(0, 80), out = {};
  for (let i = 0; i < L.length - 1; i++) {
    const k = ROTULOS_FICHA[norm(L[i]).replace(/[:*]/g, "").trim()];
    const v = L[i + 1];
    if (k && !out[k] && v && !ROTULOS_FICHA[norm(v).replace(/[:*]/g, "").trim()] && v.length <= 80) { out[k] = v; i++; }
  }
  return Object.keys(out).length >= 2 ? out : null;
}
// Primeras líneas con contenido (sin índice ni puntos de relleno)
const extractoDe = (texto) => texto.split("\n").map(s => s.replace(/\s+/g, " ").trim())
  .filter(s => s.length > 25 && !/tabla de contenido|confidencial/i.test(s) && !/(\.\s?){4,}|…{2,}/.test(s)).slice(0, 4).join(" ").slice(0, 420);

function detectar(texto, titulo) {
  const n = norm(`${titulo}\n${texto}`);
  // solo palabras escritas en MAYÚSCULAS en el documento; una tabla cuenta si tiene "_" o un nombre largo (no palabras comunes)
  const tokens = new Set(texto.match(/\b[A-Z][A-Z0-9_]{3,}\b/g) || []);
  const COMUNES = new Set(["PROCESO", "PEDIDOS", "USUARIOS", "CLIENTES", "TIPOS", "DIAS", "VALIDANDO", "CONSULTA", "PERMISOS", "RECURSOS", "ALMACENES", "MODULOS", "PERFIL", "PROVEEDORES", "CONTENEDOR", "ARTICULOS", "ZONAS", "RUTAS"]);
  const tablas = [...tokens].filter(t => tablasConocidas.has(t) && !COMUNES.has(t) && (t.includes("_") || t.length >= 10)).slice(0, 25);
  const reglas = [...tokens].filter(t => t.includes("_") && !tablasConocidas.has(t)).slice(0, 20);
  const pantallas = pantallasWms.filter(s => n.includes(norm(s.nombre))).map(s => `${s.modulo} › ${s.nombre}`).slice(0, 12);
  // procesos: por nombre completo o por palabras clave del título en común
  const clave = new Set(norm(titulo).split(/[^a-z0-9]+/).filter(w => w.length >= 5));
  const procesos = fichas.map(p => { const pn = norm(p.nombre), comunes = [...clave].filter(w => pn.includes(w)).length;
    return { p, sc: n.includes(pn) ? 10 : comunes }; }).filter(x => x.sc >= 1).sort((a, b) => b.sc - a.sc).slice(0, 6).map(x => `${x.p.codigo} · ${x.p.nombre}`);
  return { tablas, reglas, pantallas, procesos };
}

const archivos = [];
if (fs.existsSync(CARPETA)) (function recorrer(d) { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) recorrer(p); else if (/\.(docx|pdf)$/i.test(f)) archivos.push({ p, rel: path.relative(CARPETA, p), nombre: f }); } })(CARPETA);
archivos.sort((a, b) => a.rel.localeCompare(b.rel));
// después de la carpeta, lo cargado desde el BPA (si ya estaba en la carpeta, queda como duplicado)
for (const c of CARGAS) if (c.local) archivos.push({ p: c.local, rel: `BPA/${c.nombre}`, nombre: c.nombre, carga: c });
const vistos = new Map(), solicitudes = [], otrosDocs = [];
const resultadoCarga = (c, cambios) => { if (c) Object.assign(c, { resultado: { ...cambios, procesado_at: new Date().toISOString() } }); };
for (const { p, rel, nombre, carga } of archivos) {
  let texto;
  try { texto = /\.pdf$/i.test(p) ? textoPdf(p) : textoDocx(p); } catch (e) { console.log(`  ✗ ${nombre}: ${e.message}`); resultadoCarga(carga, e.sinPdftotext ? { estado: "pendiente", mensaje: "El equipo del despachador no tiene el lector de PDF (pdftotext): el archivo está bien y se procesará cuando se instale." }
    : { estado: "error", mensaje: /\.pdf$/i.test(p) ? "No se pudo leer el PDF: está dañado, protegido o no es un PDF válido." : "No se pudo leer el Word: está dañado o no es un .docx válido (los .doc antiguos no se aceptan)." }); continue; }
  if (!texto.trim()) { resultadoCarga(carga, { estado: "error", mensaje: "El documento no tiene texto legible (¿PDF escaneado?)." }); continue; }
  const hash = crypto.createHash("sha1").update(texto.replace(/\s+/g, " ")).digest("hex");
  if (vistos.has(hash)) { console.log(`  = ${rel} (duplicado, se omite)`); resultadoCarga(carga, { estado: "duplicado", mensaje: `Es el mismo documento que «${vistos.get(hash)}».` }); continue; }
  vistos.set(hash, rel);
  const base = nombre.replace(/\.(docx|pdf)$/i, "").replace(/\.docx$/i, "");
  // «FORMATO» es la plantilla en blanco: va como estándar, no como solicitud
  const esSolicitud = (/SOLICITUD DE CAMBIO/i.test(texto.slice(0, 400)) || /^ePRAC\s*-\s*\d+/i.test(base)) && !/FORMATO/i.test(base);
  if (!esSolicitud) {
    // Documentación de desarrollos (especificaciones, flujos, diseños) o plantilla / estándar en blanco
    const plantilla = /plantilla|formato|est[aá]ndar/i.test(base);
    const titulo = base.replace(/[_]+/g, " ").replace(/\s*-\s*copia$/i, "").trim();
    otrosDocs.push({ id: `${plantilla ? "estandar" : "desarrollo"}:${base}`, tipo: plantilla ? "estandar" : "desarrollo", ref: base, titulo, texto: texto.slice(0, 150000),
      meta: { archivo: rel, fuente: carga ? "Cargado en el BPA" : "Carpeta ePRAC", categoria: plantilla ? "plantilla" : "desarrollo",
        fecha: carga ? carga.created_at : fs.statSync(p).mtime.toISOString(), carga_id: carga?.id || null, carga_path: carga?.path || null,
        // una plantilla en blanco no tiene ficha ni menciona tablas o procesos reales
        ficha: plantilla ? null : fichaDe(texto), extracto: extractoDe(texto), entidades: plantilla ? null : detectar(texto, titulo) } });
    resultadoCarga(carga, { estado: "procesado", tipo: plantilla ? "plantilla" : "desarrollo",
      mensaje: plantilla ? "Plantilla o estándar de ePRAC: está en Documentación de desarrollos › Plantillas y estándares." : "Documentación de desarrollo: está en la sección Documentación de desarrollos." });
    continue;
  }
  const r = estructurar(texto);
  const numero = base.match(/ePRAC\s*-\s*(\d+)/i)?.[1] || null;
  const titulo = base.replace(/^SOLICITUD[ _]DE[ _]CAMBIO[ _]*/i, "").replace(/^ePRAC\s*-\s*\d+\s*-\s*/i, "").replace(/[_]+/g, " ").replace(/\.+$/, "").trim() || base;
  const id = "SC-" + norm(rel.replace(/\.(docx|pdf)$/i, "")).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
  solicitudes.push({ id, titulo, archivo: rel, numero_eprac: numero, cliente: r.cliente || null, almacen: r.almacen || null, compania: r.compania || null,
    solicitante: r.solicitante || null, fecha: r.fecha || null, modulo: r.modulo || null, prioridad: r.prioridad || null,
    como: r.como || null, necesito: r.necesito || null, para: r.para || null, situacion_actual: r.situacion || null, descripcion: r.descripcion || null,
    atencion: r.atencion || {}, entidades: detectar(texto, `${titulo} ${r.modulo || ""}`), hash });
  resultadoCarga(carga, { estado: "procesado", tipo: "solicitud", solicitud_id: id, mensaje: `Solicitud de cambio «${titulo}»${numero ? ` (ePRAC ${numero})` : ""}.` });
}
// Cargas que no se pudieron descargar del bucket
for (const c of CARGAS) if (c.fallo) resultadoCarga(c, { estado: "error", mensaje: c.fallo });
// Relaciones entre solicitudes del mismo tema: duplicado (texto casi idéntico),
// versión anterior (mismo módulo y la otra declara una versión mayor) o relacionada.
const tema = t => norm(t).replace(/\b(v\s*\d+|\d+(\.\d+)?|olo|epra?c?)\b/g, " ").replace(/[^a-z]+/g, " ").trim().split(" ").slice(0, 3).join(" ");
const version = t => { const m = norm(t).match(/\bv\s*(\d+)|\b(\d+)\.(\d+)\b/); return m ? Number(m[1] || m[2]) + (m[3] ? Number(m[3]) / 10 : 0) : 1; };
const palabras = s => new Set(norm(`${s.situacion_actual} ${s.descripcion}`).split(/[^a-z0-9]+/).filter(w => w.length > 3));
const parecido = (a, b) => { const A = palabras(a), B = palabras(b); let n = 0; A.forEach(w => { if (B.has(w)) n++; }); return n / Math.max(1, Math.min(A.size, B.size)); };
const porTema = {}; solicitudes.forEach(s => (porTema[tema(s.titulo)] ||= []).push(s));
for (const grupo of Object.values(porTema)) {
  if (grupo.length < 2) continue;
  for (const s of grupo) {
    for (const o of grupo) {
      if (o === s) continue;
      const mismoModulo = norm(o.modulo) === norm(s.modulo);
      if (parecido(s, o) >= 0.9 && mismoModulo) {
        // se queda la que tiene número de ePRAC o, si no, la más reciente
        const principal = [s, o].sort((a, b) => (b.numero_eprac ? 1 : 0) - (a.numero_eprac ? 1 : 0) || String(b.fecha).localeCompare(String(a.fecha)))[0];
        if (principal === o && !s.relacion) s.relacion = { tipo: "duplicado", de: o.id, titulo: `${o.titulo}${o.fecha ? ` (${o.fecha})` : ""}` };
      } else if (mismoModulo && version(o.titulo) > version(s.titulo)) {
        if (!s.relacion || s.relacion.tipo === "relacionada") s.relacion = { tipo: "version_anterior", de: o.id, titulo: o.titulo };
      } else if (mismoModulo && (version(o.titulo) < version(s.titulo) || parecido(s, o) >= 0.9)) {
        // s es la versión vigente o la principal del duplicado: no se marca
      } else if (!s.relacion) s.relacion = { tipo: "relacionada", de: o.id, titulo: o.titulo };
    }
  }
}
solicitudes.forEach(s => { s.relacion ??= null; });
// Solicitudes relacionadas con cada documento de desarrollo: palabras del título en común
const clavesDe = s => new Set(norm(s).split(/[^a-z0-9]+/).filter(w => w.length >= 4 && !/^(solicitud|cambio|olo|eprac|desarrollo|documento|especificacion|tecnica|ejemplo|plantilla|para)$/.test(w)));
for (const d of otrosDocs) {
  if (d.meta.categoria !== "desarrollo") { d.meta.solicitudes = []; continue; }
  const k = clavesDe(`${d.titulo} ${d.meta.ficha?.Nombre || ""}`), tx = norm(d.texto.slice(0, 4000));
  d.meta.solicitudes = solicitudes.map(s => { const ks = clavesDe(s.titulo); let n = 0; ks.forEach(w => { if (k.has(w)) n += 2; else if (tx.includes(w)) n += 1; }); return { s, n: ks.size ? n / ks.size : 0 }; })
    .filter(x => x.n >= 0.75).sort((a, b) => b.n - a.n).slice(0, 4).map(x => ({ id: x.s.id, titulo: x.s.titulo }));
}
console.log(`Solicitudes: ${solicitudes.length} · otros documentos: ${otrosDocs.length} · con relación: ${solicitudes.filter(s => s.relacion).map(s => `${s.titulo} → ${s.relacion.tipo} de «${s.relacion.titulo}»`).join(" · ")}`);
// estado y notas no se envían: al re-ingerir se conservan los que se editaron en el BPA
await upsert("solicitudes_cambio", solicitudes);
// Resultado de cada carga del BPA (solo cambia lo que estaba pendiente o cuyo resultado cambió)
for (const c of CARGAS) if (c.resultado && (esPendiente(c) || c.resultado.estado !== c.estado || (c.resultado.tipo || null) !== (c.tipo || null) || c.resultado.mensaje !== c.mensaje))
  await api("PATCH", `eprac_cargas?id=eq.${c.id}`, { tipo: null, solicitud_id: null, ...c.resultado });
const conCarga = CARGAS.filter(c => c.resultado);
if (conCarga.length) console.log(`Cargas del BPA: ${conCarga.map(c => `${c.nombre} → ${c.resultado.estado}`).join(" · ")}`);

// ── 2. Base de conocimiento ─────────────────────────────────────────────────
const docs = [];
const add = (tipo, ref, titulo, texto, meta = {}) => docs.push({ id: `${tipo}:${ref}`, tipo, ref, titulo, texto, meta });

// solicitudes como documentos
for (const s of solicitudes) add("solicitud", s.id, `Solicitud de cambio · ${s.titulo}`, [
  `Módulo: ${s.modulo || "—"} · Prioridad: ${s.prioridad || "—"} · Fecha: ${s.fecha || "—"} · Solicitante: ${s.solicitante || "—"}`,
  `Cliente: ${s.cliente || "—"} · Almacén: ${s.almacen || "—"} · Compañía: ${s.compania || "—"}${s.numero_eprac ? ` · N.º ePRAC ${s.numero_eprac}` : ""}`,
  s.relacion && `Relación: ${{ duplicado: "DUPLICADO de", version_anterior: "VERSIÓN ANTERIOR de", relacionada: "relacionada con" }[s.relacion.tipo]} «${s.relacion.titulo}» (${s.relacion.de})${s.relacion.tipo !== "relacionada" ? " — no contarla como precedente aparte" : ""}`,
  s.como && `Como: ${s.como}`, s.necesito && `Necesito: ${s.necesito}`, s.para && `Para: ${s.para}`,
  s.situacion_actual && `Situación actual:\n${s.situacion_actual}`, s.descripcion && `Cambio solicitado:\n${s.descripcion}`,
  `Tablas: ${s.entidades.tablas.join(", ") || "—"} · Reglas/parámetros: ${s.entidades.reglas.join(", ") || "—"} · Pantallas: ${s.entidades.pantallas.join(", ") || "—"} · Procesos: ${s.entidades.procesos.join(", ") || "—"}`,
].filter(Boolean).join("\n"), { modulo: s.modulo, fecha: s.fecha, archivo: s.archivo });
docs.push(...otrosDocs);

// tablas: estructura real (instantánea) + lo mapeado en el BPA
function docTabla(tabla, cols, pk, fks, fuente, extra = "") {
  const T = tabla.toUpperCase();
  const procs = [...(procPorTabla[T] || [])], pant = (TABLA_PANTALLAS[T] || []).map(id => WMS_INDEX[id] ? `${WMS_INDEX[id].module} › ${WMS_INDEX[id].option}` : id);
  const scs = solicitudes.filter(s => s.entidades.tablas.includes(T)).map(s => s.titulo);
  add("tabla", `${fuente.clave}:${T}`, `Tabla ${T} (${fuente.nombre})`, [
    `Base: ${fuente.nombre}.${pk?.length ? ` Llave primaria: ${pk.join(", ")}.` : ""}`,
    `Columnas (${cols.length}): ${cols.join(" · ")}`,
    fks?.length && `Relaciones: ${fks.join(" · ")}`,
    procs.length && `Procesos del BPA que la usan: ${procs.join(" · ")}`,
    pant.length && `Pantallas de eFlow que la muestran: ${pant.join(" · ")}`,
    scs.length && `Solicitudes de cambio que la mencionan: ${scs.join(" · ")}`, extra,
  ].filter(Boolean).join("\n"), { base: fuente.nombre, columnas: cols.length });
}
const tablasHechas = new Set();
if (snap) {
  // eFlow: la base real de OLO Costa Rica (EFLOW_OLO); si no se puede leer, se usa Beval VE (mismo producto)
  const eflowCR = !snap.instancias["eflow-prod-cr"]?.bases?.EFLOW_OLO?.error && Object.keys(snap.instancias["eflow-prod-cr"]?.bases?.EFLOW_OLO?.esquemas || {}).length;
  const bases = [eflowCR ? ["eflow-prod-cr", "EFLOW_OLO", "eflow", "eFlow WMS · EFLOW_OLO (producción Costa Rica)"] : ["eflow-prod-ve", "EFLOW_BEVAL", "eflow", "eFlow WMS (estructura del producto, tomada de Beval VE porque EFLOW_OLO no se pudo leer)"],
    ["eflow-prod-cr", "EFLOW_WMH", "wmh", "Torre de Control WMH (Costa Rica)"], ["softland-qa-ve", "EINTEGRA_CONFIG", "eintegra", "eIntegra (middleware ERP↔WMS)"]];
  for (const [inst, db, clave, nombre] of bases) {
    const b = snap.instancias[inst]?.bases?.[db]; if (!b || b.error) continue;
    const fksDe = {}; (b.fks || []).forEach(f => { const t = f.de.split(".")[1].toUpperCase(); (fksDe[t] ||= []).push(`${f.de.split(".").slice(2).join(".")} → ${f.a.split(".").slice(1).join(".")}`); });
    for (const [sch, e] of Object.entries(b.esquemas)) for (const [t, d] of Object.entries(e.tablas)) {
      const cols = Object.entries(d.cols).map(([c, v]) => `${c} ${v.t}${v.n ? "" : " NOT NULL"}`);
      docTabla(`${sch === "dbo" ? "" : sch + "."}${t}`, cols, d.pk, fksDe[t.toUpperCase()], { clave, nombre }, d.filas ? "" : "Tabla sin datos en esa base.");
      tablasHechas.add(`${clave}:${t.toUpperCase()}`);
    }
  }
}
// tablas del BPA que no vinieron de la instantánea (p. ej. EFW CR mapeadas a mano)
for (const [t, d] of Object.entries(EFW_TABLE_DEFS)) if (!tablasHechas.has(`eflow:${t.toUpperCase()}`))
  docTabla(t, (d.cols || []).map(String), d.pk ? [d.pk] : [], null, { clave: "eflow", nombre: "eFlow WMS · EFLOW_OLO (Costa Rica, columnas clave mapeadas en el BPA)" });
// Softland: tablas de los módulos instalados en Cofersa
for (const [k, m] of Object.entries(DD.modulos)) if (m.instaladoEnCofersa) for (const t of m.tablas.filter(x => x.enCofersa))
  add("tabla", `softland:${t.tabla}`, `Tabla ${t.tabla} (Softland · ${k} ${m.nombre})`, `Softland, módulo ${k} (${m.nombre}). ${t.nombre ? `Nombre en Softland: ${t.nombre}.` : ""} Columnas: ${t.columnas}. ${t.conDatos ? "Tiene datos" : "Vacía"} en Cofersa.${procPorTabla[t.tabla] ? ` Procesos del BPA que la usan: ${[...procPorTabla[t.tabla]].join(" · ")}` : ""}`, { base: "Softland" });

// pantallas
for (const m of Object.values(WMS.modules)) for (const s of m.screens) {
  const campos = (s.fields || []).map(f => f.label).filter(Boolean), botones = (s.buttons || []).map(b => b.name).filter(Boolean);
  const cols = (s.tables || []).flatMap(t => (t.columns || []).filter(c => !c.hidden).map(c => c.name));
  const tabs = (PANTALLA_TABLAS[s.id] || []).map(x => x.tabla), procs = (PANTALLA_PROCESOS[s.id] || []).map(x => `${x.codigo} (pasos ${x.pasos.join(", ")})`);
  add("pantalla_wms", s.id, `eFlow WMS › ${m.name} › ${s.option}`, [
    `Pantalla de eFlow WMS (escritorio). Módulo ${m.name}, opción «${s.option}»${s.title ? `, ventana «${s.title}»` : ""}.`,
    s.tabs?.length && `Pestañas: ${s.tabs.join(" · ")}`, campos.length && `Campos: ${campos.join(" · ")}`, botones.length && `Botones: ${botones.join(" · ")}`,
    cols.length && `Columnas de la grilla: ${cols.join(" · ")}`, tabs.length && `Tablas de la base que muestra: ${tabs.join(", ")}`, procs.length && `Procesos que la usan: ${procs.join(" · ")}`,
    s.missing && `Nota: ${s.reason || "sin captura"}`,
  ].filter(Boolean).join("\n"), { modulo: m.name });
}
for (const s of WMH_PANTALLAS) add("pantalla_wmh", s.id, `Torre de Control (WMH) › ${s.modulo} › ${s.nombre}`, [s.descripcion, s.campos && `Campos: ${[].concat(s.campos).join(" · ")}`, s.acciones && `Acciones: ${[].concat(s.acciones).join(" · ")}`, s.detalle && JSON.stringify(s.detalle)].filter(Boolean).join("\n"));
// Handheld (app RF del piso): pantallas con los procesos que las citan
const usosHh = {};
for (const p of Object.values(PROCESOS)) p.pasos.forEach((s, i) => { const id = pantallaHhDePaso(s, p.codigo); if (id) ((usosHh[id] ||= {})[p.codigo] ||= []).push(i + 1); });
for (const s of HH_PANTALLAS) add("pantalla_hh", s.id, `eFlow WMS Handheld › ${s.url}`, [
  `Pantalla de la app handheld de eFlow WMS (v${HH_META.version}, Android). ${s.descripcion}`,
  s.campos.length && `Campos de escaneo / entrada: ${s.campos.join(" · ")}`, s.columnas.length && `Muestra / opciones: ${s.columnas.join(" · ")}`,
  s.acciones.length && `Menú y acciones: ${s.acciones.map(([a, d]) => `${a} (${d})`).join(" · ")}`,
  usosHh[s.id] && `Procesos que la usan: ${Object.entries(usosHh[s.id]).map(([c, n]) => `${c} (pasos ${n.join(", ")})`).join(" · ")}`,
].filter(Boolean).join("\n"), { modulo: s.modulo });
add("contexto", "hh_hallazgos", "Handheld eFlow WMS · hallazgos del mapeo (25/09/2026)", HH_HALLAZGOS.join("\n"));
for (const s of SORTER_PANTALLAS) add("pantalla_sorter", s.id, `SORTER CLIRO (Mecalux) › ${s.modulo} › ${s.nombre}`, [s.descripcion, s.detalle && JSON.stringify(s.detalle)].filter(Boolean).join("\n"));
// Manual del Softland propio de OLO (compañía OVERSEAS): texto de cada pantalla (las capturas son privadas)
const SFLM = JSON.parse(fs.readFileSync(path.join(DATA, "softland_manual.json"), "utf8"));
const { SFL_PASO_OPCION } = await imp("softland_manual_links.js");
const usosSfl = {};
for (const [c, pasos] of Object.entries(SFL_PASO_OPCION)) for (const [i, id] of Object.entries(pasos)) ((usosSfl[id] ||= {})[c] ||= []).push(Number(i) + 1);
const plano = (s) => String(s || "").replace(/\*\*?/g, "");
// Qué hace cada opción: la versión de la base (incluye las corregidas por el admin)
const QUEHACE = Object.fromEntries((await api("GET", "softland_opciones?select=id,descripcion,origen", null, "count=none") || []).map(r => [r.id, r]));
const queHace = (id) => QUEHACE[id] && `Qué hace${QUEHACE[id].origen === "editado" ? " (validado por el admin)" : " (inferido)"}: ${QUEHACE[id].descripcion}`;
for (const c of SFLM.capitulos) {
  if (c.intro) add("pantalla_softland", `manual:${c.codigo}`, `Softland OLO (OVERSEAS) › ${c.codigo} ${c.nombre} · resumen`,
    [plano(c.intro), ...c.secciones.filter(s => s.desc).map(s => `${s.titulo}: ${plano(s.desc)}`)].join("\n"), { modulo: c.codigo });
  for (const s of c.secciones) for (const it of s.items) add("pantalla_softland", `manual:${it.id}`, `Softland OLO (OVERSEAS) › ${it.ruta || `${c.codigo} › ${s.titulo} › ${it.titulo}`}`, [
    `Pantalla del Softland propio de OLO (compañía OVERSEAS, manual del 25/09/2026). Módulo ${c.codigo} ${c.nombre}, sección ${s.titulo}.`,
    queHace(it.id), it.desc && plano(it.desc), it.puntos && it.puntos.map(plano).join(" · "), it.campos && `Campos: ${it.campos.map(([k, d]) => `${plano(k)}: ${plano(d)}`).join(" · ")}`,
    it.aviso && `Precaución: ${plano(it.aviso)}`,
    usosSfl[it.id] && `Procesos que la usan: ${Object.entries(usosSfl[it.id]).map(([k, n]) => `${k} (pasos ${n.join(", ")})`).join(" · ")}`,
  ].filter(Boolean).join("\n"), { modulo: c.codigo });
  // Opciones del mapa de menús sin pantalla: un documento por opción con qué hace
  for (const g of c.menu || []) for (const o of g.opciones) if (o.id.includes(".m.") && queHace(o.id)) add("pantalla_softland", `opcion:${o.id}`,
    `Softland OLO (OVERSEAS) › ${c.codigo} › ${g.carpeta} › ${o.titulo}`,
    [`Opción del menú del Softland de OLO (módulo ${c.codigo} ${c.nombre}), sin captura en el manual.${o.estado ? ` Estado: ${o.estado}.` : ""}`, queHace(o.id),
      usosSfl[o.id] && `Procesos que la usan: ${Object.entries(usosSfl[o.id]).map(([k, n]) => `${k} (pasos ${n.join(", ")})`).join(" · ")}`].filter(Boolean).join("\n"), { modulo: c.codigo });
}
for (const [k, m] of Object.entries(DD.modulos)) if (m.instaladoEnCofersa) add("pantalla_softland", k, `Softland › ${k} ${m.nombre} (menú)`,
  `Menú real de Softland, módulo ${k} (${m.nombre}), compañía Cofersa. Opciones:\n` + m.pantallas.map(p => `${p.nombre}${p.tabla ? ` [${p.tabla}]` : ""}${p.acciones.length ? `: ${p.acciones.join(", ")}` : ""}`).join("\n")
  + (m.entidades.length ? `\nEntidades: ${m.entidades.map(e => `${e.nombre} (${e.descripcion})`).join(" · ")}` : ""));

// procesos
for (const p of fichas) add("proceso", p.codigo, `Proceso ${p.codigo} · ${p.nombre}`, [
  `Silo: ${p.siloLabel || p.silo}. ${p.borrador ? "BORRADOR (inferido, a validar)" : "Procedimiento documentado"}. ${p.compania ? `Compañía: ${p.compania}.` : ""}`,
  p.objetivo && `Objetivo: ${p.objetivo}`, p.alcance && `Alcance: ${p.alcance}`, p.responsables?.length && `Responsables: ${p.responsables.join(", ")}`,
  `Pasos:\n${p.pasos.map((s, i) => `${i + 1}. [${s.sistema}] ${s.texto}${s.pantalla ? ` (pantalla: ${s.pantalla})` : ""}`).join("\n")}`,
  p.decisiones?.length && `Decisiones:\n${p.decisiones.join("\n")}`, p.noConformidades?.length && `No conformidades: ${p.noConformidades.join(" · ")}`,
  p.tablas?.length && `Tablas: ${p.tablas.map(t => t.tabla).join(", ")}`, p.entradaDe?.length && `Viene de: ${p.entradaDe.join(", ")}`, p.salidaA?.length && `Sigue en: ${p.salidaA.join(", ")}`,
].filter(Boolean).join("\n"), { silo: p.silo, borrador: !!p.borrador });

// reglas y contexto
CTX.REGLAS_OPERATIVAS.forEach((r, i) => add("regla", `op-${i}`, `Regla operativa · ${r.cliente || "general"}`, `${r.regla}${r.codigo ? ` (proceso ${r.codigo})` : ""}`));
(CTX.REGLAS_WMH || []).forEach((r, i) => add("regla", `wmh-${i}`, "Regla de Torre de Control (WMH)", typeof r === "string" ? r : JSON.stringify(r)));
add("contexto", "aplicaciones", "Aplicaciones del ecosistema OLO", CTX.APLICACIONES.map(a => `${a.nombre} (${a.version || ""}): ${a.tipo || ""}. ${a.uso || ""}`).join("\n"));
add("contexto", "clientes", "Clientes y compañías", CTX.CLIENTES.map(c => JSON.stringify(c)).join("\n"));
add("contexto", "brechas", "Brechas conocidas del BPA", GAPS.join("\n"));
(CTX.EXTENSION_EFLOW || []).forEach((x, i) => add("contexto", `ext-eflow-${i}`, "Punto de extensión / configuración de eFlow", JSON.stringify(x)));

// se reemplaza la base de conocimiento generada (las solicitudes se re-generan arriba)
const unicos = [...new Map(docs.map(d => [d.id, d])).values()];
// el conocimiento abstracto lo alimenta el BPA (asesor-abstracto): no se borra aquí
await api("DELETE", "asesor_docs?tipo=neq.abstracto");
await upsert("asesor_docs", unicos);
const porTipo = docs.reduce((o, d) => (o[d.tipo] = (o[d.tipo] || 0) + 1, o), {});
console.log(`Base de conocimiento: ${unicos.length} documentos`, porTipo);
