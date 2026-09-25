// Imágenes de buckets PRIVADOS (p. ej. el manual Softland de OLO, con datos
// reales): se referencian como "priv:<bucket>/<clave>" y se resuelven a una URL
// firmada (1 h) con caché en memoria. firmar() firma un lote en una sola
// llamada; useSrc() resuelve una sola y sirve también para URLs públicas.
import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient.js";

const TTL = 3600, MARGEN = 300;
const cache = new Map(); // "bucket/clave" → { url, vence }
const vigente = (k) => { const c = cache.get(k); return c && c.vence > Date.now() / 1000 + MARGEN ? c.url : null; };

export const privImg = (bucket, clave) => clave ? `priv:${bucket}/${clave}` : null;
const partir = (src) => { const s = src.slice(5), i = s.indexOf("/"); return [s.slice(0, i), s.slice(i + 1)]; };

// Firma en lote las que falten; devuelve { src: url }
export async function firmar(srcs) {
  const faltan = {};
  for (const src of srcs) if (src?.startsWith("priv:") && !vigente(src.slice(5))) { const [b, k] = partir(src); (faltan[b] ||= []).push(k); }
  for (const [b, claves] of Object.entries(faltan)) {
    const { data, error } = await supabase.storage.from(b).createSignedUrls(claves, TTL);
    if (error) continue;
    for (const d of data || []) if (d.signedUrl) cache.set(`${b}/${d.path}`, { url: d.signedUrl, vence: Date.now() / 1000 + TTL });
  }
  return Object.fromEntries(srcs.filter(Boolean).map(s => [s, s.startsWith("priv:") ? vigente(s.slice(5)) : s]));
}

// Resuelve una imagen (pública o privada) para un <img>
export function useSrc(src) {
  const inicial = !src ? null : src.startsWith("priv:") ? vigente(src.slice(5)) : src;
  const [url, setUrl] = useState({ src, url: inicial });
  useEffect(() => {
    if (!src?.startsWith("priv:") || vigente(src.slice(5))) return;
    let vivo = true;
    firmar([src]).then(m => { if (vivo) setUrl({ src, url: m[src] }); });
    return () => { vivo = false; };
  }, [src]);
  return url.src === src ? (url.url || inicial) : inicial;
}
