// Genera los datos del Manual de Usuario eFlow WMS para el BPA a partir del
// crawl de la aplicación (C:\Users\arojast\WMS_eflow_map):
//   olo-architecture/src/data/wms_manual.json  — detalle completo (carga diferida)
//   olo-architecture/src/data/wms_links.js     — índice liviano de enlaces:
//       paso de proceso → pantalla · pantalla → procesos · pantalla ↔ tablas eFlow
// Las tablas se infieren por coincidencia de columnas del grid de la pantalla
// con las columnas reales de EFW_TABLE_DEFS (no por nombre), con su puntaje.
// Uso: node gen_wms_manual.mjs
import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";

const SRC = "C:/Users/arojast/WMS_eflow_map";
const APP = "C:/GitHub/Arquitectura_OLO/olo-architecture/src";
const imp = (p) => import(pathToFileURL(p).href);

const manual = JSON.parse(fs.readFileSync(`${SRC}/manual/manual_data.json`, "utf8"));
const appMap = JSON.parse(fs.readFileSync(`${SRC}/app_map.json`, "utf8"));
const { EFW_TABLE_DEFS } = await imp(`${APP}/efw_constants.js`);
const { PROCESOS_CEDI } = await imp(`${APP}/data/procesos_cedi.js`);

// Descripción de cada módulo: se toma del generador del .docx para no divergir.
const buildJs = fs.readFileSync(`${SRC}/manual/build.js`, "utf8");
const MODULE_INFO = Function(`return ${buildJs.match(/const MODULE_INFO = (\{[\s\S]*?\n\});/)[1]}`)();

const norm = (s) => (s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const key = (s) => norm(s).replace(/ /g, "");
const imgId = (img) => img ? path.basename(img.path, path.extname(img.path)) : null;
// Capturas disponibles en wms-manual/: las del manual + las de menús «…» y
// diálogos que solo estaban en web/screenshots (convertidas a JPG y subidas aparte).
const EXTRA = ["screen_control__acciones_de_trabajo__menu","screen_catalogos__articulos__menu","screen_catalogos__unidades_de_transporte__menu",
  "screen_documentos__carga_camion__menu","dlg_documentos_carga_camion_guardar_como","screen_documentos__ordenes_de_expedicion__menu",
  "screen_documentos__ordenes_de_recepcion__menu","screen_inventario__comparador_de_tomas_fisicas__menu","screen_inventario__consulta_de_inventario__menu",
  "screen_inventario__generacion_de_tomas_fisicas__menu","screen_configuracion__almacenamientos_ubicaciones__menu","screen_configuracion__articulos_zonas_de_picking__menu"];
const IMGS = new Set([...fs.readdirSync(`${SRC}/manual/img`).map(f => f.replace(/\.jpg$/, "")), ...EXTRA]);

// ── Pantallas del manual ────────────────────────────────────────────────────
const titleById = Object.fromEntries(appMap.screens.map(s => [s.id, s.title]));
const navFrom = {};
for (const n of appMap.navigation) (navFrom[n.from] ||= []).push(n);

const modules = manual.modules.map(m => ({
  name: m.name,
  info: MODULE_INFO[m.name] || "",
  screens: m.screens.map(raw => {
    // las pantallas no exploradas (pesadas o riesgosas) solo traen option/reason
    const s = { tabs: [], subtabs: [], fields: [], buttons: [], menu: [], tables: [], ...raw };
    const id = imgId(s.img) || `sin_captura__${key(m.name)}__${key(s.option)}`;
    return {
      id, option: s.option, title: s.title, formId: s.form_id, loadSeconds: s.load_seconds,
      img: s.img ? `${id}.jpg` : null, missing: s.missing || null, reason: s.reason || null,
      tabs: s.tabs,
      subtabs: s.subtabs.map(t => ({ name: t.name, img: t.img ? `${imgId(t.img)}.jpg` : null, fields: t.fields || [] })),
      fields: s.fields, buttons: s.buttons, menu: s.menu,
      tables: s.tables.map(t => ({ title: t.title, columns: t.columns })),
      nav: (navFrom[id] || []).map(n => ({ action: n.action, to: n.to, toTitle: titleById[n.to] || n.to, img: IMGS.has(n.to) ? `${n.to}.jpg` : null })),
    };
  }),
}));
const screens = modules.flatMap(m => m.screens.map(s => ({ ...s, module: m.name })));

// ── Pantalla ↔ tablas eFlow por coincidencia de columnas ────────────────────
const tableCols = Object.fromEntries(Object.entries(EFW_TABLE_DEFS).map(([t, d]) =>
  [t, new Set([d.pk, ...(d.cols || [])].filter(Boolean).map(c => key(String(c).split(/\s|→/)[0])))]));
// Columnas genéricas (IDALMACEN, IDCOMPANIA…) aparecen en muchas tablas y las
// de auditoría/descriptivas (estado, fechacreacion, direccion…) en casi todas:
// no distinguen nada. Solo cuentan columnas presentes en ≤ 6 tablas y fuera de esa lista.
const GENERICAS = new Set(["estado","situacion","prioridad","observaciones","cantidad","fecha","fecharegistro","fechacreacion",
  "fechamodificacion","idusuariocreacion","idusuariomodificacion","idusuario","usuario","nombre","descripcion","codigo",
  "direccion","ciudad","pais","provincia","telefono","contacto","email","compania","bodega","lote","monto","clasificacion"]);
const df = {};
for (const set of Object.values(tableCols)) for (const c of set) df[c] = (df[c] || 0) + 1;
for (const [t, set] of Object.entries(tableCols)) tableCols[t] = new Set([...set].filter(c => df[c] <= 6 && !GENERICAS.has(c)));
// Afinidad de nombre: raíces (≥5 letras) de la opción, el título y el form_id de la
// pantalla que aparecen en el nombre de la tabla (Recepciones… → RECEPCIONESCABECERA).
const stems = (s) => [...new Set([s.option, s.title, (s.formId || "").replace(/([a-z])([A-Z])/g, "$1 $2").replace(/Form$/, "")]
  .flatMap(x => norm(x).split(" ")).filter(w => w.length >= 5).map(w => w.replace(/(es|s)$/, "")))];
const PANTALLA_TABLAS = {};
for (const s of screens) {
  const cols = [...new Set(s.tables.flatMap(t => t.columns.map(c => key(c.name))).filter(c => c.length > 3))];
  if (cols.length < 2) continue;
  const st = stems(s);
  const scored = Object.entries(tableCols)
    .map(([t, set]) => {
      const hit = cols.filter(c => set.has(c));
      const afin = st.some(w => key(t).includes(w));
      return { tabla: t, coinciden: hit.length, columnas: hit, afin };
    })
    .filter(x => (x.afin && x.coinciden >= 1) || x.coinciden >= 3)
    .sort((a, b) => (b.afin - a.afin) || (b.coinciden - a.coinciden)).slice(0, 4);
  if (scored.length) PANTALLA_TABLAS[s.id] = scored.map(({ tabla, coinciden, columnas, afin }) => ({ tabla, coinciden, columnas, porNombre: afin }));
}
const TABLA_PANTALLAS = {};
for (const [sid, ts] of Object.entries(PANTALLA_TABLAS)) for (const t of ts) (TABLA_PANTALLAS[t.tabla] ||= []).push(sid);

// ── Paso de proceso → pantalla (por "Módulo > Opción" o por título) ─────────
// Títulos de ventana que no coinciden con su opción de menú (ej. la opción
// "Ordenes de Expedición" abre la ventana "Salidas").
const ALIAS = { "expediciones salidas": "Documentos Ordenes de Expedición", "salidas": "Documentos Ordenes de Expedición",
  "recepciones entradas": "Documentos Ordenes de Recepción", "entradas": "Documentos Ordenes de Recepción",
  "estacion de chequeo": "Control Chequeo" };
const byOption = screens.map(s => ({ s, keys: [norm(`${s.module} ${s.option}`), norm(s.option), norm(s.title)].filter(k => k.length > 4) }));
function matchScreens(text) {
  if (!text) return [];
  let t = norm(text);
  for (const [a, opt] of Object.entries(ALIAS)) if (t.includes(a)) t += " " + norm(opt);
  const hits = byOption
    .map(({ s, keys }) => ({ s, len: Math.max(0, ...keys.filter(k => t.includes(k)).map(k => k.length)) }))
    .filter(h => h.len > 0).sort((a, b) => b.len - a.len);
  if (!hits.length) return [];
  // La mejor coincidencia, más otras igual de específicas (≥15 caracteres y ≥75 %
  // de la mejor: "Carga Camión / Asignación Exp. Camión"); descarta títulos
  // cortos genéricos ("Expediciones", "Palets") y opciones contenidas en otra.
  const best = hits[0].len;
  return hits.filter((h, i) => i === 0 || (h.len >= 15 && h.len >= best * 0.75
      && !hits.slice(0, i).some(o => norm(o.s.option).includes(norm(h.s.option))))).map(h => h.s.id);
}
const PASO_PANTALLA = {};
const PANTALLA_PROCESOS = {};
for (const p of Object.values(PROCESOS_CEDI)) {
  p.pasos.forEach((st, i) => {
    if (st.sistema !== "eflow" || !st.pantalla) return;
    const ids = matchScreens(st.pantalla);
    if (!ids.length) return;
    (PASO_PANTALLA[p.codigo] ||= {})[i] = ids;
    for (const id of ids) {
      const arr = (PANTALLA_PROCESOS[id] ||= []);
      let e = arr.find(x => x.codigo === p.codigo);
      if (!e) arr.push(e = { codigo: p.codigo, pasos: [] });
      e.pasos.push(i + 1);
    }
  });
  for (const pt of p.pantallas) {
    if (pt.sistema !== "eflow") continue;
    for (const id of matchScreens(pt.ruta)) {
      const arr = (PANTALLA_PROCESOS[id] ||= []);
      if (!arr.some(x => x.codigo === p.codigo)) arr.push({ codigo: p.codigo, pasos: [] });
    }
  }
}

// Pantalla ↔ tabla por proceso: si la pantalla se usa en un paso y ese proceso
// declara (en su ficha) una tabla eFlow con afinidad de nombre con la pantalla,
// se agrega aunque sus columnas clave no aparezcan en el grid.
const screenById = Object.fromEntries(screens.map(s => [s.id, s]));
for (const [sid, procs] of Object.entries(PANTALLA_PROCESOS)) {
  const st = stems(screenById[sid]);
  const arr = (PANTALLA_TABLAS[sid] ||= []);
  for (const { codigo } of procs) {
    for (const t of PROCESOS_CEDI[codigo].tablas) {
      if (t.schema !== "efw" || arr.some(x => x.tabla === t.tabla)) continue;
      if (st.some(w => key(t.tabla).includes(w))) arr.push({ tabla: t.tabla, coinciden: 0, columnas: [], porNombre: true, porProceso: codigo });
    }
  }
  if (!arr.length) delete PANTALLA_TABLAS[sid];
  else PANTALLA_TABLAS[sid] = arr.slice(0, 6);
}
for (const k of Object.keys(TABLA_PANTALLAS)) delete TABLA_PANTALLAS[k];
for (const [sid, ts] of Object.entries(PANTALLA_TABLAS)) for (const t of ts) (TABLA_PANTALLAS[t.tabla] ||= []).push(sid);

const WMS_INDEX = Object.fromEntries(screens.map(s => [s.id, { module: s.module, option: s.option, title: s.title, img: s.img }]));

fs.writeFileSync(`${APP}/data/wms_manual.json`, JSON.stringify({
  app: "eflow WMS", version: manual.session.version, almacen: manual.session.almacen, capturado: manual.captured_at,
  stats: { pantallas: manual.stats.screens, controles: manual.stats.controls },
  notExplored: manual.not_explored, heavy: manual.heavy, modules,
}));
fs.writeFileSync(`${APP}/data/wms_links.js`, `// ═══════════════════════════════════════════════════════════════════════════
// DATOS · Enlaces del Manual eFlow WMS con Procesos y BD — GENERADO por
// gen_wms_manual.mjs (no editar a mano). El detalle de cada pantalla vive en
// wms_manual.json y se carga bajo demanda.
// ═══════════════════════════════════════════════════════════════════════════
export const WMS_INDEX = ${JSON.stringify(WMS_INDEX)};
// codigo de proceso → { índice de paso (0-based) → [ids de pantalla] }
export const PASO_PANTALLA = ${JSON.stringify(PASO_PANTALLA)};
// id de pantalla → [{ codigo, pasos (1-based) }]
export const PANTALLA_PROCESOS = ${JSON.stringify(PANTALLA_PROCESOS)};
// id de pantalla → [{ tabla, coinciden, columnas, porNombre }] — inferido: columnas del grid
// que coinciden con columnas distintivas de la tabla (+ afinidad del nombre)
export const PANTALLA_TABLAS = ${JSON.stringify(PANTALLA_TABLAS)};
// tabla eFlow → [ids de pantalla]
export const TABLA_PANTALLAS = ${JSON.stringify(TABLA_PANTALLAS)};
`);

const pasosLigados = Object.values(PASO_PANTALLA).reduce((s, o) => s + Object.keys(o).length, 0);
const pasosEflow = Object.values(PROCESOS_CEDI).reduce((s, p) => s + p.pasos.filter(x => x.sistema === "eflow" && x.pantalla).length, 0);
console.log(`pantallas: ${screens.length} · con tablas inferidas: ${Object.keys(PANTALLA_TABLAS).length} · pasos eFlow ligados: ${pasosLigados}/${pasosEflow} · pantallas usadas por procesos: ${Object.keys(PANTALLA_PROCESOS).length}`);
