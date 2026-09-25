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
  return {
    codigo: x.codigo, nombre: x.nombre, intro: x.intro || null, arbol: x.arbol ? img(x.arbol) : null,
    secciones: x.secciones.map(s => ({
      titulo: s.titulo.replace(/:$/, ""), desc: s.desc || null, tabla: s.tabla || null,
      items: (s.items || []).map(it => {
        let id = `${x.codigo}.${slug(s.titulo)}.${slug(it.titulo)}`;
        while (usados.has(id)) id += "_";
        usados.add(id);
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
const porCap = {};
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
  const cand = (porCap[cap] || []).filter(([, v]) => !(sec && ESTRICTAS.has(sec)) || norm(v.seccion) === sec);
  const exacto = cand.filter(([, v]) => variantes(v.titulo).includes(ult));
  const empieza = cand.filter(([, v]) => variantes(v.titulo).some(x => x.startsWith(ult + " ")));
  const orden = (l) => l.find(([, v]) => sec && norm(v.seccion).startsWith(sec.replace(/s$/, ""))) || l[0];
  return (orden(exacto) || orden(empieza) || [])[0] || null;
};
const PASO = {};
let conPantalla = 0, pasosSfl = 0;
for (const p of Object.values(PROCESOS)) p.pasos.forEach((s, i) => {
  if (s.sistema !== "softland" || !s.pantalla) return;
  pasosSfl++;
  const partes = s.pantalla.split("›").map(x => x.trim()).filter(x => x && x !== "Softland");
  const id = buscar(partes[0], partes.slice(1));
  if (id) { (PASO[p.codigo] ||= {})[i] = id; conPantalla++; }
});

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
`;
fs.writeFileSync(`${APP}/data/softland_manual_links.js`, js);
const items = Object.keys(INDEX).length, conImg = Object.values(INDEX).filter(v => v.img).length;
console.log(`${capitulos.length} capítulos · ${items} ítems (${conImg} con captura) · pasos Softland ${pasosSfl}, ligados a una pantalla ${conPantalla}`);
