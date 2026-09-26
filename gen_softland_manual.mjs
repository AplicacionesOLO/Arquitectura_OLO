// Genera los datos del Manual Softland ERP de OLO (compañía OVERSEAS) para el BPA
// a partir del levantamiento en C:/Users/arojast/Downloads/bpa/Softland:
//   contenido/*.json  → olo-architecture/src/data/softland_manual.json (capítulos, carga bajo demanda)
//                     → olo-architecture/src/data/softland_manual_links.js (índice liviano de pantallas
//                       y enlace Paso → Pantalla para los procesos con pasos en Softland)
// Las capturas (recortes_jpg/) se suben aparte al bucket PRIVADO softland-manual con la
// misma clave sin tildes que usa clave(): muestran datos reales de clientes.
// Uso: node gen_softland_manual.mjs
import fs from "fs";
import { pathToFileURL } from "url";

const SRC = "C:/Users/arojast/Downloads/bpa/Softland";
const APP = "C:/GitHub/Arquitectura_OLO/olo-architecture/src";
const clave = (r) => r.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const norm = (s) => clave(String(s || "")).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const slug = (s) => norm(s).replace(/ /g, "_");
const hay = new Set(fs.readdirSync(`${SRC}/recortes_jpg`).map(f => f.replace(/\.jpg$/, "")));
const img = (r) => hay.has(r) ? `${clave(r)}.jpg` : null;

// El repo es PÚBLICO: el texto no lleva saldos ni nombres de personas o empresas de
// ejemplo (eso queda solo en las capturas y el PDF, en el bucket privado).
const LIMPIAR = [
  [/\s*\(saldo [\d.,]+\)/gi, ""],
  [/ – MARIA ELENA JIMENEZ RAMIREZ/g, ""],
  [/ – FERRETERIA EPA(, S\.A\.)?/g, ""],
  [/ – Abastecedor Los Sauces/g, ""],
  [/ – Link Tech Corporation USA/g, ""],
  [/ Ferretería EPA\)/g, ")"],
];
const limpio = (s) => typeof s === "string" ? LIMPIAR.reduce((x, [re, r]) => x.replace(re, r), s) : s;
const limpiar = (o) => Array.isArray(o) ? o.map(limpiar) : o && typeof o === "object" ? Object.fromEntries(Object.entries(o).map(([k, v]) => [k, limpiar(v)])) : limpio(o);
const PROHIBIDO = /saldo \d|JIMENEZ|FERRETERIA EPA|Los Sauces|Link Tech/i;

const capitulos = fs.readdirSync(`${SRC}/contenido`).filter(f => f.endsWith(".json")).sort().map(f => {
  const x = JSON.parse(fs.readFileSync(`${SRC}/contenido/${f}`, "utf8"));
  const usados = new Set();
  const unico = (id) => { while (usados.has(id)) id += "_"; usados.add(id); return id; };
  return {
    codigo: x.codigo, nombre: x.nombre, intro: x.intro || null, arbol: x.arbol ? img(x.arbol) : null,
    secciones: x.secciones.map(s => ({
      titulo: s.titulo.replace(/:$/, ""), desc: s.desc || null, tabla: s.tabla || null,
      items: (s.items || []).map(it => {
        const id = unico(`${x.codigo}.${slug(s.titulo)}.${slug(it.titulo)}`);
        return { id, titulo: it.titulo, ruta: it.ruta || null, imgs: [it.img, ...(it.imgs || [])].filter(Boolean).map(img).filter(Boolean),
          desc: it.desc || null, aviso: it.aviso || null, puntos: it.puntos || null, campos: it.campos || null, tabla: it.tabla || null };
      }),
    })),
  };
});

const META = {
  producto: "Softland ERP 7.00", compania: "OVERSEAS", razonSocial: "Overseas Logistics Operations S A", servidor: "10.17.224.40", base: "SOFTLAND",
  usuario: "AROJAS", fecha: "25/09/2026", pais: "Costa Rica",
  nota: "Levantado en modo consulta: se abrieron pantallas y registros de ejemplo sin crear, modificar, aprobar ni procesar datos. Las capturas muestran datos reales de la compañía.",
  pdf: "Manual_Softland_ERP.pdf",
};
const salida = JSON.stringify({ meta: META, capitulos: limpiar(capitulos) }, null, 1);
if (PROHIBIDO.test(salida)) throw new Error("El texto del manual todavía tiene datos reales: " + salida.match(new RegExp(".{40}" + PROHIBIDO.source + ".{20}", "i"))?.[0]);
fs.writeFileSync(`${APP}/data/softland_manual.json`, salida);

// Índice liviano: pantalla → capítulo, título, ruta, primera captura
const INDEX = {};
for (const c of capitulos) for (const s of c.secciones) for (const it of s.items)
  INDEX[it.id] = { cap: c.codigo, seccion: s.titulo, titulo: it.titulo, ruta: it.ruta || `${c.codigo} › ${s.titulo} › ${it.titulo}`, img: it.imgs[0] || null };

// Paso → pantalla: «Softland › CC › Consulta › Aplicaciones» → capítulo CC, última parte = título del ítem
const { PROCESOS } = await import(pathToFileURL(`${APP}/data/procesos_fichas.js`).href);
let porCap = {};
for (const [id, v] of Object.entries(INDEX)) if (v.img) (porCap[v.cap] ||= []).push([id, v]);
// Variantes de un título compuesto: «Clientes – lista», «A / B», «Pedidos y Líneas de Pedido»,
// «Autorizaciones de Pedidos por Ventas / Crédito» (→ «… por Crédito»)
const variantes = (titulo) => {
  const out = new Set([norm(titulo)]);
  const base = titulo.replace(/\(.*?\)/g, "").split(/\s[–-]\s/)[0];
  const alts = base.split(/\s\/\s|,\s*/).map(x => x.trim()).filter(Boolean);
  alts.forEach((a, k) => {
    out.add(norm(a));
    a.split(/\sy\s/).forEach(b => out.add(norm(b)));
    if (k > 0 && !a.includes(" ") && alts[0].includes(" ")) out.add(norm(alts[0].replace(/\S+$/, a)));
  });
  return [...out].filter(Boolean);
};
const ESTRICTAS = new Set(["administracion", "procesos"]);
const buscar = (cap, partes) => {
  const ult = norm(partes.at(-1)), sec = partes.length > 1 ? norm(partes.at(-2)) : null;
  // En Administración / Procesos (acciones) no se liga a un reporte: solo a otra opción de acción
  const cand = (porCap[cap] || []).filter(([, v]) => !(sec && ESTRICTAS.has(sec)) || ESTRICTAS.has(norm(v.seccion).split(" ")[0]));
  const exacto = cand.filter(([, v]) => variantes(v.titulo).includes(ult));
  const empieza = cand.filter(([, v]) => variantes(v.titulo).some(x => x.startsWith(ult + " ")));
  const orden = (l) => l.find(([, v]) => sec && norm(v.seccion).startsWith(sec.replace(/s$/, ""))) || l[0];
  return (orden(exacto) || orden(empieza) || [])[0] || null;
};
// Árbol de menús completo (arbol_menus.md): «## CC – …», «- Carpeta: a · b», «  - Sub: a · b».
// Las listas se parten por « · » respetando paréntesis; (gris) / (bloq) / [carpeta vacía] quedan como estado.
const partir = (s) => { const out = []; let buf = "", prof = 0;
  for (const ch of s) { if (ch === "(") prof++; if (ch === ")") prof--; if (ch === "·" && prof === 0) { out.push(buf.trim()); buf = ""; } else buf += ch; }
  out.push(buf.trim()); return out.filter(Boolean); };
const estadoDe = (t) => /\[carpeta vac[ií]a\]/.test(t) ? "vacia" : /\(bloq\)/.test(t) ? "bloqueada" : /\(gris\)|todo gris/.test(t) ? "deshabilitada" : null;
const limpiarOp = (t) => t.replace(/\s*\[carpeta vac[ií]a\]|\s*\((gris|bloq|todo gris)\)|\*\*/g, "").trim();
const MENU = {};
{
  let cap = null, carpeta = null;
  for (const linea of fs.readFileSync(`${SRC}/arbol_menus.md`, "utf8").split(/\r?\n/)) {
    const h = /^## ([A-Z]{2}) –/.exec(linea); if (h) { cap = h[1]; MENU[cap] = []; carpeta = null; continue; }
    const m = /^(\s*)- (.+)$/.exec(linea); if (!cap || !m) continue;
    const sub = m[1].length > 0, txt = m[2];
    const soloCarpeta = /^(.+?):\s*$/.exec(txt);
    if (soloCarpeta && !soloCarpeta[1].includes("·")) { const nombre = limpiarOp(soloCarpeta[1]); if (!sub) carpeta = nombre; continue; }
    if (/→|Login failed/.test(txt)) { MENU[cap].push({ carpeta: limpiarOp(txt.split("→")[0]), opciones: [], nota: "Sin acceso para el usuario (error de login)" }); continue; }
    const dos = /^(.+?):\s*(.+)$/.exec(txt); // la primera «:» separa la carpeta de sus opciones
    const padre = sub && carpeta ? carpeta : "(raíz)";
    if (dos) {
      // «A · B · Carpeta: x · y» → A y B son opciones sueltas de la carpeta padre; Carpeta es la subcarpeta
      const pre = partir(dos[1]);
      if (pre.length > 1) MENU[cap].push({ carpeta: padre, opciones: pre.slice(0, -1).map(o => ({ titulo: limpiarOp(o), estado: estadoDe(o) })) });
      const bruto = pre.at(-1), nombre = limpiarOp(bruto), gris = /todo gris/.test(bruto);
      if (!sub) carpeta = nombre;
      MENU[cap].push({ carpeta: sub && carpeta ? `${carpeta} › ${nombre}` : nombre, estado: gris ? "deshabilitada" : null,
        opciones: partir(dos[2]).map(o => ({ titulo: limpiarOp(o), estado: gris ? "deshabilitada" : estadoDe(o) })) });
    } else {
      MENU[cap].push({ carpeta: padre, opciones: partir(txt).map(o => ({ titulo: limpiarOp(o), estado: estadoDe(o) })) });
    }
  }
}

// Todas las opciones: cada opción del menú, ligada a su pantalla del manual cuando existe
const OPCIONES = {};
const usadosOp = new Set();
for (const c of capitulos) {
  if (c.codigo === "00") continue; // Generalidades no tiene opciones de menú
  const items = c.secciones.flatMap(s => s.items.filter(it => it.titulo !== "Árbol de opciones").map(it => ({ ...it, seccion: s.titulo })));
  const ligados = new Set();
  for (const g of MENU[c.codigo] || []) for (const o of g.opciones) {
    const top = norm(g.carpeta.split("›")[0]);
    const it = items.find(x => variantes(x.titulo).includes(norm(o.titulo)) && (norm(x.seccion).startsWith(top.replace(/s$/, "")) || top.startsWith(norm(x.seccion).replace(/s$/, ""))))
      || items.find(x => variantes(x.titulo).includes(norm(o.titulo)));
    let id = it ? it.id : `${c.codigo}.m.${slug(g.carpeta)}.${slug(o.titulo)}`;
    if (!it) { while (usadosOp.has(id)) id += "_"; usadosOp.add(id); }
    o.id = id;
    if (it) ligados.add(it.id);
    OPCIONES[id] ||= { cap: c.codigo, seccion: it ? it.seccion : g.carpeta, titulo: it ? it.titulo : o.titulo, ruta: it ? INDEX[it.id].ruta : `${c.codigo} › ${g.carpeta} › ${o.titulo}`, img: it ? INDEX[it.id].img : null, estado: o.estado || null };
  }
  // Pantallas del manual que no están en el árbol (pestañas, fichas de detalle): también son opciones
  for (const it of items) if (!ligados.has(it.id)) OPCIONES[it.id] = { cap: c.codigo, seccion: it.seccion, titulo: it.titulo, ruta: INDEX[it.id].ruta, img: INDEX[it.id].img, estado: null };
  c.menu = MENU[c.codigo] || [];
}
// El JSON del manual se reescribe con el menú completo por capítulo
{
  const s2 = JSON.stringify({ meta: META, capitulos: limpiar(capitulos) }, null, 1);
  if (PROHIBIDO.test(s2)) throw new Error("El texto del manual todavía tiene datos reales");
  fs.writeFileSync(`${APP}/data/softland_manual.json`, s2);
}

const PASO = {};
let conPantalla = 0, pasosSfl = 0;
for (const p of Object.values(PROCESOS)) p.pasos.forEach((s, i) => {
  if (s.sistema !== "softland" || !s.pantalla) return;
  pasosSfl++;
  const partes = s.pantalla.split("›").map(x => x.trim()).filter(x => x && x !== "Softland");
  const id = buscar(partes[0], partes.slice(1));
  if (id) { (PASO[p.codigo] ||= {})[i] = id; conPantalla++; }
});

// Paso → opción (con o sin captura): da la descripción de qué hace la opción del paso
porCap = {};
for (const [id, v] of Object.entries(OPCIONES)) (porCap[v.cap] ||= []).push([id, v]);
const PASO_OP = {};
let conOpcion = 0;
for (const p of Object.values(PROCESOS)) p.pasos.forEach((s, i) => {
  if (s.sistema !== "softland" || !s.pantalla) return;
  const partes = s.pantalla.split("›").map(x => x.trim()).filter(x => x && x !== "Softland");
  const id = PASO[p.codigo]?.[i] || buscar(partes[0], partes.slice(1));
  if (id) { (PASO_OP[p.codigo] ||= {})[i] = id; conOpcion++; }
});
fs.writeFileSync(`${APP}/data/softland_opciones_lista.json`, JSON.stringify(OPCIONES, null, 1));

const js = `// ═══════════════════════════════════════════════════════════════════════════
// DATOS · Enlaces del Manual Softland ERP de OLO (compañía OVERSEAS) — GENERADO
// por gen_softland_manual.mjs (no editar a mano). El detalle de cada capítulo
// vive en softland_manual.json y se carga bajo demanda. Las capturas están en el
// bucket PRIVADO softland-manual (datos reales): se piden con URL firmada.
// ═══════════════════════════════════════════════════════════════════════════

export const SFL_MANUAL_META = ${JSON.stringify(META)};

// Capítulos: código, nombre y número de pantallas con captura
export const SFL_MANUAL_CAPITULOS = ${JSON.stringify(capitulos.map(c => ({ codigo: c.codigo, nombre: c.nombre, pantallas: c.secciones.reduce((n, s) => n + s.items.filter(it => it.imgs.length).length, 0) })))};

// Pantalla del manual → { cap, seccion, titulo, ruta, img }
export const SFL_MANUAL_INDEX = ${JSON.stringify(INDEX)};

// Proceso → { índice del paso: id de pantalla del manual }
export const SFL_PASO_PANTALLA = ${JSON.stringify(PASO)};

// Proceso → { índice del paso: id de la opción (con o sin captura) } — para mostrar qué hace
export const SFL_PASO_OPCION = ${JSON.stringify(PASO_OP)};

// Opciones que citan los pasos → { cap, titulo, ruta } (el resto está en softland_opciones_lista.json)
export const SFL_OPCIONES_PASO = ${JSON.stringify(Object.fromEntries([...new Set(Object.values(PASO_OP).flatMap(Object.values))].map(id => [id, { cap: OPCIONES[id].cap, titulo: OPCIONES[id].titulo, ruta: OPCIONES[id].ruta }])))};
`;
fs.writeFileSync(`${APP}/data/softland_manual_links.js`, js);
const items = Object.keys(INDEX).length, conImg = Object.values(INDEX).filter(v => v.img).length;
console.log(`${capitulos.length} capítulos · ${items} ítems (${conImg} con captura) · ${Object.keys(OPCIONES).length} opciones · pasos Softland ${pasosSfl}, ligados a una pantalla ${conPantalla}, a una opción ${conOpcion}`);
