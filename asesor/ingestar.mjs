// asesor/ingestar.mjs — alimenta la base de conocimiento del «Asesor de cambios».
//   1. Solicitudes de cambio (.docx / .pdf de la carpeta indicada): extrae el
//      texto, lo estructura según la plantilla de ePRAC y detecta las tablas,
//      reglas, pantallas y procesos que menciona → solicitudes_cambio.
//      El estado y las notas que se editan en el BPA NO se pisan al re-ingerir.
//   2. Todo lo que el BPA ya sabe, como documentos consultables (asesor_docs):
//      tablas (estructura real de la instantánea de schema_watch + lo mapeado),
//      pantallas de eFlow WMS / Torre de Control / SORTER / Softland, los 67
//      procesos, reglas operativas y contexto.
// Uso: node asesor/ingestar.mjs ["C:\ruta\a\las\solicitudes"]
// Credenciales: ../.env (clave de servicio de Supabase). Solo escribe en Supabase.
import fs from "fs";
import path from "path";
import zlib from "zlib";
import crypto from "crypto";
import { execFileSync } from "child_process";
import { pathToFileURL, fileURLToPath } from "url";

const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const DATA = path.join(RAIZ, "olo-architecture", "src", "data");
const CARPETA = process.argv[2] || "C:/Users/arojast/Desktop/ar/Eprac";
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

// ── Datos del BPA ───────────────────────────────────────────────────────────
const { PROCESOS } = await imp("procesos_fichas.js");
const WMS = JSON.parse(fs.readFileSync(path.join(DATA, "wms_manual.json"), "utf8"));
const { WMS_INDEX, PANTALLA_TABLAS, TABLA_PANTALLAS, PANTALLA_PROCESOS } = await imp("wms_links.js");
const { WMH_PANTALLAS } = await imp("wmh_manual.js");
const { SORTER_PANTALLAS } = await imp("sorter_manual.js");
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
const textoPdf = p => execFileSync("pdftotext", ["-layout", "-enc", "UTF-8", p, "-"], { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });

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
(function recorrer(d) { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) recorrer(p); else if (/\.(docx|pdf)$/i.test(f)) archivos.push(p); } })(CARPETA);
const vistos = new Set(), solicitudes = [], otrosDocs = [];
for (const p of archivos.sort()) {
  let texto;
  try { texto = /\.pdf$/i.test(p) ? textoPdf(p) : textoDocx(p); } catch (e) { console.log(`  ✗ ${path.basename(p)}: ${e.message}`); continue; }
  const hash = crypto.createHash("sha1").update(texto.replace(/\s+/g, " ")).digest("hex");
  if (vistos.has(hash)) { console.log(`  = ${path.relative(CARPETA, p)} (duplicado, se omite)`); continue; }
  vistos.add(hash);
  const base = path.basename(p).replace(/\.(docx|pdf)$/i, "").replace(/\.docx$/i, "");
  const rel = path.relative(CARPETA, p);
  // «FORMATO» es la plantilla en blanco: va como estándar, no como solicitud
  const esSolicitud = (/SOLICITUD DE CAMBIO/i.test(texto.slice(0, 400)) || /^ePRAC\s*-\s*\d+/i.test(base)) && !/FORMATO/i.test(base);
  if (!esSolicitud) {
    otrosDocs.push({ id: `estandar:${base}`, tipo: /documentaci|formato/i.test(rel) ? "estandar" : "contexto", ref: base, titulo: base.replace(/_/g, " "), texto: texto.slice(0, 150000), meta: { archivo: rel, fuente: "Carpeta ePRAC" } });
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
}
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
console.log(`Solicitudes: ${solicitudes.length} · otros documentos: ${otrosDocs.length} · con relación: ${solicitudes.filter(s => s.relacion).map(s => `${s.titulo} → ${s.relacion.tipo} de «${s.relacion.titulo}»`).join(" · ")}`);
// estado y notas no se envían: al re-ingerir se conservan los que se editaron en el BPA
await upsert("solicitudes_cambio", solicitudes);

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
  const bases = [["eflow-prod-ve", "EFLOW_BEVAL", "eflow", "eFlow WMS (estructura del producto, tomada de la base Beval VE — misma estructura que EFLOW_OLO CR, que hoy no se puede leer)"],
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
for (const s of SORTER_PANTALLAS) add("pantalla_sorter", s.id, `SORTER CLIRO (Mecalux) › ${s.modulo} › ${s.nombre}`, [s.descripcion, s.detalle && JSON.stringify(s.detalle)].filter(Boolean).join("\n"));
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
