// ═══════════════════════════════════════════════════════════════════════════
// DATOS · Workflows — plano maestro de la operación
// Todo se deriva del registro de fichas (procesos_fichas.js): cada proceso es
// un flujo de pasos, cada paso usa un sistema y (a veces) una pantalla, cada
// proceso tiene roles, tablas y conexiones con otros procesos. Aquí se arman
// los lienzos (posición base de cada tarjeta) y los índices inversos:
// sistema → pasos/procesos/silos (qué se afecta si ese sistema cambia) y
// rol → procesos. Lo que el usuario acomoda a mano vive en workflow_layouts.
// ═══════════════════════════════════════════════════════════════════════════
import { PROCESOS, SILO_LABELS } from "./procesos_fichas.js";

export const SISTEMAS_WF = {
  eflow:       { label:"eFlow WMS",        icono:"W",  color:"#0891b2", schema:"efw",    ir:{ tab:"ops", view:"wms" } },
  handheld:    { label:"Handheld RF",      icono:"RF", color:"#0d9488", schema:"efw",    ir:{ tab:"ops" } },
  torre:       { label:"Torre de Control", icono:"T",  color:"#16a34a", schema:"wmh_cr", ir:{ tab:"ops", view:"wmh" } },
  sorter:      { label:"SORTER CLIRO",     icono:"S",  color:"#ea580c", schema:null,     ir:{ tab:"ops", view:"sorter" } },
  softland:    { label:"Softland ERP",     icono:"SL", color:"#c0392b", schema:"softland", ir:{ tab:"softland" } },
  apolo:       { label:"Apolo",            icono:"A",  color:"#7c3aed", schema:null,     ir:null },
  correo:      { label:"Correo",           icono:"@",  color:"#b45309", schema:null,     ir:null },
  excel_drive: { label:"Excel / Drive",    icono:"X",  color:"#2563eb", schema:null,     ir:null },
  fisico:      { label:"Acción física",    icono:"✋", color:"#64748b", schema:null,     ir:null },
};

export const ORIGEN_WF = {
  eflow_wms:      { label:"Pantalla eFlow WMS", color:"#0891b2" },
  mecalux_sorter: { label:"Manual SORTER",      color:"#ea580c" },
  control_tower:  { label:"Torre de Control",   color:"#16a34a" },
  softland_menu:  { label:"Menú Softland",      color:"#c0392b" },
  inferido:       { label:"Inferido · validar", color:"#b45309" },
};

// Tipo de ficha: procedimiento aprobado del CEDI (P1…P14), mapeo del manual de un sistema, o borrador
export const tipoFicha = p => /^P\d+$/.test(p.codigo) ? "cedi" : p.borrador ? "borrador" : "manual";
export const TIPO_FICHA = {
  cedi:     { label:"Procedimiento OLO", color:"#15803d" },
  manual:   { label:"Manual del sistema", color:"#0891b2" },
  borrador: { label:"Borrador",           color:"#b45309" },
};

const FICHAS = Object.values(PROCESOS);
const orden = Object.keys(SILO_LABELS);
export const SILOS_WF = orden.filter(id => FICHAS.some(p => p.silo === id))
  .map(id => ({ id, label: SILO_LABELS[id], procesos: FICHAS.filter(p => p.silo === id).map(p => p.codigo) }));
export const siloDe = codigo => PROCESOS[codigo]?.silo;

// Entradas de un proceso: las declaradas + las inferidas desde las salidas de otros
export function entradasDe(codigo) {
  const p = PROCESOS[codigo];
  const s = new Set((p.entradaDe || []).filter(c => PROCESOS[c]));
  FICHAS.forEach(o => { if ((o.salidaA || []).includes(codigo)) s.add(o.codigo); });
  s.delete(codigo);
  return [...s];
}
export const salidasDe = codigo => (PROCESOS[codigo].salidaA || []).filter(c => PROCESOS[c] && c !== codigo);

// ── Inferencia (fase 2): rol de cada paso y ubicación de las decisiones ─────
// Todo lo inferido se marca como tal para validarlo; nada se inventa: si no hay
// coincidencia clara, el paso queda sin rol y la decisión "sin ubicar".
const STOP = new Set("para como cada este esta esto desde donde entre sobre segun pedido pedidos proceso sistema personal encargado ingresar realizar verificar revisar registrar".split(" "));
const tokens = t => new Set(String(t || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").split(/[^a-z0-9]+/).filter(w => w.length >= 4 && !STOP.has(w)));
const comunes = (a, b) => { let n = 0; a.forEach(w => { if (b.has(w)) n++; }); return n; };

export function rolInferido(codigo, i) {
  const p = PROCESOS[codigo], roles = p?.responsables || [];
  if (!roles.length) return null;
  if (roles.length === 1) return { rol: roles[0], motivo: "es el único rol del proceso" };
  const t = tokens(`${p.pasos[i].texto} ${p.pasos[i].sistema}`);
  const pts = roles.map(r => comunes(tokens(r), t)), max = Math.max(...pts);
  if (max === 0 || pts.filter(x => x === max).length > 1) return null;
  return { rol: roles[pts.indexOf(max)], motivo: "el texto del paso lo menciona" };
}

// Decisiones: se ubican después del paso con el que comparten ≥2 palabras clave
export function decisionesDe(codigo) {
  const p = PROCESOS[codigo], pt = p.pasos.map(s => tokens(s.texto));
  return (p.decisiones || []).map((texto, j) => {
    const q = tokens(texto.split("→")[0]);
    let best = null, bs = 1;
    pt.forEach((t, i) => { const sc = comunes(q, t); if (sc > bs) { bs = sc; best = i; } });
    return { j, texto, despuesDe: best };
  });
}
export const partirDecision = texto => {
  const k = texto.indexOf("?");
  const pregunta = k > 0 ? texto.slice(0, k + 1) : texto.split("→")[0].trim();
  const opciones = (k > 0 ? texto.slice(k + 1) : "").split(/;\s*/).map(o => o.trim()).filter(Boolean);
  return { pregunta, opciones };
};

// ── Geometría ───────────────────────────────────────────────────────────────
export const CARD = { w:210, h:108 };
const GX = 46, GY = 44, COLS = 4, PAD = 22, HEAD = 64;

// Lienzo de un silo: un recuadro por proceso; dentro, los pasos en serpentina
// (izq→der, luego der→izq) para que las flechas queden cortas. Antes del
// primer paso, un círculo con los procesos de los que viene; al final, un
// círculo por cada proceso al que sigue.
export function lienzoSilo(siloId) {
  const silo = SILOS_WF.find(s => s.id === siloId);
  const nodos = [], aristas = [], grupos = [];
  const colY = [0, 0];
  for (const cod of silo.procesos) {
    const p = PROCESOS[cod];
    const ent = entradasDe(cod), sal = salidasDe(cod);
    const dec = decisionesDe(cod);
    const seq = [];
    if (ent.length) seq.push({ id:`${cod}:in`, tipo:"entrada", codigo:cod, refs:ent });
    p.pasos.forEach((s, i) => {
      seq.push({ id:`${cod}:s${i}`, tipo:"paso", codigo:cod, i, paso:s });
      dec.filter(d => d.despuesDe === i).forEach(d => seq.push({ id:`${cod}:d${d.j}`, tipo:"decision", codigo:cod, j:d.j, texto:d.texto, ubicada:true }));
    });
    sal.forEach(d => seq.push({ id:`${cod}:out:${d}`, tipo:"salida", codigo:cod, refs:[d] }));
    // las que no se pudieron ubicar van al final, sueltas, para acomodarlas a mano
    dec.filter(d => d.despuesDe == null).forEach(d => seq.push({ id:`${cod}:d${d.j}`, tipo:"decision", codigo:cod, j:d.j, texto:d.texto, ubicada:false }));
    const filas = Math.ceil(seq.length / COLS);
    const gw = COLS * CARD.w + (COLS - 1) * GX + PAD * 2, gh = HEAD + filas * CARD.h + (filas - 1) * GY + PAD;
    const col = colY[0] <= colY[1] ? 0 : 1;
    const gx = col * (gw + 90), gy = colY[col];
    colY[col] += gh + 80;
    grupos.push({ id:`g:${cod}`, codigo:cod });
    seq.forEach((n, k) => {
      const fila = Math.floor(k / COLS), enFila = k % COLS;
      const c = fila % 2 === 0 ? enFila : COLS - 1 - enFila;
      nodos.push({ ...n, grupo:`g:${cod}`, x: gx + PAD + c * (CARD.w + GX), y: gy + HEAD + fila * (CARD.h + GY) });
    });
    // cadena del flujo: pasos y decisiones ubicadas, en orden
    const pasos = seq.filter(n => n.tipo === "paso" || (n.tipo === "decision" && n.ubicada));
    if (ent.length && pasos[0]) aristas.push({ from:`${cod}:in`, to:pasos[0].id });
    for (let k = 1; k < pasos.length; k++) aristas.push({ from:pasos[k-1].id, to:pasos[k].id });
    const ult = pasos[pasos.length - 1];
    if (ult) sal.forEach(d => aristas.push({ from:ult.id, to:`${cod}:out:${d}` }));
  }
  return { nodos, aristas, grupos };
}

// Mapa maestro: un recuadro por silo con sus procesos; las flechas son las
// salidas de cada proceso hacia otros (también entre silos).
export const CARD_M = { w:230, h:74 };
export function lienzoMaestro() {
  const nodos = [], aristas = [], grupos = [];
  const COLM = 6, GW = CARD_M.w + PAD * 2, GAPX = 120, GAPY = 90;
  const alto = s => HEAD + s.procesos.length * (CARD_M.h + 16) - 16 + PAD;
  const colY = Array(COLM).fill(0);
  SILOS_WF.forEach(s => {
    const col = colY.indexOf(Math.min(...colY));
    const gx = col * (GW + GAPX), gy = colY[col];
    colY[col] += alto(s) + GAPY;
    grupos.push({ id:`g:${s.id}`, silo:s.id });
    s.procesos.forEach((cod, k) => nodos.push({ id:`m:${cod}`, tipo:"proceso", codigo:cod, grupo:`g:${s.id}`, x: gx + PAD, y: gy + HEAD + k * (CARD_M.h + 16) }));
  });
  const vistas = new Set();
  FICHAS.forEach(p => salidasDe(p.codigo).forEach(d => {
    const k = `m:${p.codigo}>m:${d}`;
    if (!vistas.has(k)) { vistas.add(k); aristas.push({ from:`m:${p.codigo}`, to:`m:${d}` }); }
  }));
  return { nodos, aristas, grupos };
}

// ── Índices inversos ────────────────────────────────────────────────────────
// Sistema → qué depende de él (pasos, procesos, silos, pantallas, tablas)
export const IMPACTO_SISTEMA = (() => {
  const r = {};
  for (const [sys] of Object.entries(SISTEMAS_WF)) r[sys] = { pasos:0, procesos:{}, silos:new Set(), pantallas:new Set(), tablas:new Map() };
  for (const p of FICHAS) p.pasos.forEach(s => {
    const x = r[s.sistema]; if (!x) return;
    x.pasos++; x.procesos[p.codigo] = (x.procesos[p.codigo] || 0) + 1; x.silos.add(p.silo);
    if (s.pantalla) x.pantallas.add(s.pantalla);
  });
  for (const [sys, x] of Object.entries(r)) {
    const schema = SISTEMAS_WF[sys].schema; if (!schema) continue;
    for (const cod of Object.keys(x.procesos)) (PROCESOS[cod].tablas || []).filter(t => t.schema === schema)
      .forEach(t => { const set = x.tablas.get(t.tabla) || new Set(); set.add(cod); x.tablas.set(t.tabla, set); });
  }
  return r;
})();

// Rol → procesos (los nombres se unifican sin distinguir mayúsculas)
export const ROLES_WF = (() => {
  const m = new Map();
  for (const p of FICHAS) for (const raw of p.responsables || []) {
    const nombre = String(typeof raw === "string" ? raw : raw.rol || raw.nombre || "").trim();
    if (!nombre) continue;
    const k = nombre.toLowerCase();
    const e = m.get(k) || { nombre: nombre[0].toUpperCase() + nombre.slice(1), procesos:new Set() };
    e.procesos.add(p.codigo); m.set(k, e);
  }
  return [...m.values()].map(e => ({ ...e, procesos:[...e.procesos] })).sort((a,b) => b.procesos.length - a.procesos.length || a.nombre.localeCompare(b.nombre));
})();
