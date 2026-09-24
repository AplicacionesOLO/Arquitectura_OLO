// Validación de procesos y pasos (tabla procesos_validaciones, solo se agregan
// filas). El estado vigente de un paso es su fila más reciente; si el texto del
// paso cambió desde que se validó, queda "desactualizado". Un almacén en memoria
// compartido hace que Workflows, BPA y la ficha vean lo mismo sin recargar.
import { useState, useEffect, useMemo } from "react";
import { supabase } from "./supabaseClient.js";
import { PROCESOS } from "../data/procesos_fichas.js";

let cache = null, cargando = null;
const subs = new Set();
async function cargar() {
  const { data } = await supabase.from("procesos_validaciones").select("*").order("created_at");
  cache = data || [];
  subs.forEach(f => f(cache));
}

export const ESTADO_VAL = {
  validado:       { label:"Validado",           color:"#15803d", icono:"✓" },
  corregir:       { label:"Requiere corrección", color:"#b45309", icono:"!" },
  desactualizado: { label:"Cambió desde que se validó", color:"#64748b", icono:"⟳" },
  pendiente:      { label:"Sin validar",         color:"#94a3b8", icono:"" },
};

const k = (codigo, paso) => `${codigo}#${paso ?? "P"}`;

function indexar(rows) {
  const vigente = {}, historial = {};
  for (const r of rows || []) { const key = k(r.codigo, r.paso); vigente[key] = r; (historial[key] ||= []).unshift(r); }
  const estadoPaso = (codigo, i) => {
    const r = vigente[k(codigo, i)]; if (!r) return "pendiente";
    const texto = PROCESOS[codigo]?.pasos[i]?.texto;
    return r.estado === "validado" && r.texto_paso && texto && r.texto_paso !== texto ? "desactualizado" : r.estado;
  };
  const resumen = codigo => {
    const p = PROCESOS[codigo]; if (!p) return null;
    const est = p.pasos.map((_, i) => estadoPaso(codigo, i));
    const proc = vigente[k(codigo, null)];
    return { total: est.length, validados: est.filter(e => e === "validado").length, corregir: est.filter(e => e === "corregir").length,
      desactualizados: est.filter(e => e === "desactualizado").length, proceso: proc?.estado || "pendiente", filaProceso: proc || null };
  };
  return { vigente, historial, estadoPaso, resumen, filaDe: (codigo, paso) => vigente[k(codigo, paso)] || null, historialDe: (codigo, paso) => historial[k(codigo, paso)] || [] };
}

export function useValidaciones() {
  const [rows, setRows] = useState(cache);
  useEffect(() => {
    subs.add(setRows);
    if (!cache && !cargando) cargando = cargar().finally(() => { cargando = null; });
    return () => { subs.delete(setRows); };
  }, []);
  const idx = useMemo(() => indexar(rows), [rows]);
  return { cargado: rows !== null, ...idx };
}

// Registra una o varias validaciones: [{ codigo, paso (null = proceso), estado, comentario?, correccion? }]
export async function registrarValidaciones(lista) {
  const filas = lista.map(v => ({ codigo:v.codigo, paso:v.paso ?? null, estado:v.estado, comentario:v.comentario || null, correccion:v.correccion || null,
    texto_paso: v.paso != null ? PROCESOS[v.codigo]?.pasos[v.paso]?.texto ?? null : null }));
  const { error } = await supabase.from("procesos_validaciones").insert(filas);
  if (!error) await cargar();
  return error ? error.message : null;
}
