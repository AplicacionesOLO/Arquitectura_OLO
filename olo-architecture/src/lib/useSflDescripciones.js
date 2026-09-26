// «Qué hace» cada opción de Softland (tabla softland_opciones): se carga una
// sola vez y se comparte entre el manual, la ficha de procesos y Workflows.
// Si la base no responde, usa la copia generada (softland_opciones_desc.json,
// solo inferidas). guardar() es solo para el admin (lo impone también la RLS).
import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient.js";

let datos = null;          // { id: { descripcion, origen, editado_nombre, updated_at } }
let cargando = null;
const oyentes = new Set();
const avisar = () => oyentes.forEach(f => f(datos));

async function cargar() {
  const { data, error } = await supabase.from("softland_opciones").select("id,descripcion,origen,editado_nombre,updated_at");
  if (!error && data?.length) datos = Object.fromEntries(data.map(r => [r.id, r]));
  else {
    const copia = (await import("../data/softland_opciones_desc.json")).default;
    datos = Object.fromEntries(Object.entries(copia).map(([id, descripcion]) => [id, { descripcion, origen: "inferido" }]));
  }
  avisar();
}

export function useSflDescripciones() {
  const [d, setD] = useState(datos);
  useEffect(() => {
    oyentes.add(setD);
    if (!datos && !cargando) cargando = cargar();
    return () => { oyentes.delete(setD); };
  }, []);
  return d;
}

// Guarda la versión del admin (origen «editado»); texto vacío vuelve a dejarla como estaba
export async function guardarDescripcion(id, descripcion, perfil) {
  const fila = { id, descripcion: descripcion.trim(), origen: "editado", editado_por: perfil?.id || null, editado_nombre: perfil?.nombre || perfil?.email || null, updated_at: new Date().toISOString() };
  const { error } = await supabase.from("softland_opciones").upsert(fila);
  if (error) throw new Error(error.message);
  datos = { ...(datos || {}), [id]: fila };
  avisar();
}
