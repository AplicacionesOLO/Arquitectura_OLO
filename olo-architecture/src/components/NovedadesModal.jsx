// ═══════════════════════════════════════════════════════════════════════════
// NOVEDADES — ventana emergente de "¿qué hay de nuevo?". Aparece SOLA al
// ingresar (no es un botón/campana que haya que abrir), una única vez por
// versión y solo si hay algo publicado visible para el rol del usuario.
// Contenido real en Supabase (tabla `novedades`, singleton); fallback estático
// en código para arrancar sin backend. Curación completa en Administración.
// ═══════════════════════════════════════════════════════════════════════════
import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "../lib/supabaseClient.js";
import { NOVEDADES_FALLBACK } from "../data/novedades.js";
import { BellIcon } from "./icons.jsx";
import { DESIGN } from "../data/constants.js";

const SEEN_KEY = "bpa_novedades_vista";

// Un item es visible para el usuario si: está Publicada, y (no tiene sección,
// o el usuario es admin, o puede ver esa sección/tab).
function visibleFor(items, { isAdmin, canSeeTab }) {
  return (items || []).filter(it =>
    it.estado === "publicada" &&
    (!it.seccion || isAdmin || canSeeTab(it.seccion))
  );
}

export function useNovedadesDoc() {
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from("novedades").select("*").eq("id", 1).maybeSingle();
    if (error || !data) { setDoc(NOVEDADES_FALLBACK); setLoading(false); return; }
    setDoc({
      version: data.version || NOVEDADES_FALLBACK.version,
      titulo: data.titulo || NOVEDADES_FALLBACK.titulo,
      fecha: data.fecha || NOVEDADES_FALLBACK.fecha,
      // Compatibilidad: un item sin `estado` (payload antiguo) se trata como publicada.
      items: (Array.isArray(data.items) && data.items.length ? data.items : NOVEDADES_FALLBACK.items)
        .map(it => ({ ...it, estado: it.estado || "publicada" })),
    });
    setLoading(false);
  }, []);

  useEffect(() => { reload(); }, [reload]);

  return { doc, loading, reload };
}

export function useNovedades({ isAdmin, canSeeTab }) {
  const { doc, loading } = useNovedadesDoc();
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const items = useMemo(() => doc ? visibleFor(doc.items, { isAdmin, canSeeTab }) : [], [doc, isAdmin, canSeeTab]);

  useEffect(() => {
    if (loading || !doc || dismissed) return;
    let seen = null;
    try { seen = localStorage.getItem(SEEN_KEY); } catch { /* sin localStorage: se muestra igual */ }
    if (seen !== doc.version && items.length > 0) setOpen(true);
  }, [loading, doc, items, dismissed]);

  const close = useCallback(() => {
    setOpen(false);
    setDismissed(true);
    if (doc) { try { localStorage.setItem(SEEN_KEY, doc.version); } catch { /* sin localStorage: no se recuerda */ } }
  }, [doc]);

  return { open, doc, items, close };
}

// Anatomía compartida entre la ventana real y la vista previa de Administración.
export function NovedadesCard({ titulo, fecha, items, onClose, footer=true }) {
  useEffect(() => {
    if (!onClose) return;
    const onKey = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return <div style={{ background:DESIGN.surface, borderRadius:14, width:"min(560px,96vw)", maxHeight:"88vh", display:"flex", flexDirection:"column", overflow:"hidden", border:`1px solid ${DESIGN.border}`, boxShadow:"0 24px 60px rgba(15,23,42,.22)" }}>
    <div style={{ padding:"14px 20px", background:DESIGN.sunken, borderBottom:`1px solid ${DESIGN.border}`, display:"flex", alignItems:"center", gap:12 }}>
      <span style={{ width:34, height:34, borderRadius:9, background:"#eef2f6", color:"#475569", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontSize:16 }}><BellIcon/></span>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:17, fontWeight:700, color:DESIGN.ink }}>{titulo}</div>
        {fecha && <div style={{ fontSize:12, color:DESIGN.muted, marginTop:1 }}>{fecha}</div>}
      </div>
      {onClose && <button onClick={onClose} title="Cerrar" style={{ width:32, height:32, borderRadius:8, background:"#eef2f6", border:`1px solid ${DESIGN.border}`, color:"#475569", cursor:"pointer", fontSize:15, lineHeight:1, flexShrink:0 }}>✕</button>}
    </div>
    <div style={{ flex:1, overflow:"auto", padding:"18px 20px", display:"flex", flexDirection:"column", gap:16 }}>
      {items.length === 0
        ? <div style={{ textAlign:"center", color:DESIGN.muted, fontSize:13, padding:"12px 0" }}>Sin novedades publicadas todavía.</div>
        : items.map((it, i) => (
          <div key={it.id || i} style={{ display:"flex", gap:12 }}>
            <span style={{ flexShrink:0, width:26, height:26, borderRadius:"50%", background:DESIGN.sunken2, color:"#334155", border:`1px solid ${DESIGN.border}`, fontSize:12, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center" }}>{i+1}</span>
            <div>
              <div style={{ fontSize:15, fontWeight:700, color:DESIGN.ink, marginBottom:3 }}>{it.titulo}</div>
              {it.detalle && <div style={{ fontSize:14, color:DESIGN.inkSoft, lineHeight:1.55 }}>{it.detalle}</div>}
            </div>
          </div>
        ))}
    </div>
    {footer && onClose && <div style={{ padding:"14px 20px", borderTop:`1px solid ${DESIGN.border}`, display:"flex", justifyContent:"flex-end" }}>
      <button onClick={onClose} style={{ background:DESIGN.ink, border:"none", color:"#fff", fontWeight:700, fontSize:13, borderRadius:9, padding:"8px 18px", cursor:"pointer", fontFamily:DESIGN.font }}>Entendido</button>
    </div>}
  </div>;
}

export function NovedadesModal({ titulo, fecha, items, onClose }) {
  return <div onClick={onClose} style={{ position:"fixed", inset:0, background:DESIGN.overlay, zIndex:300, display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
    <div onClick={e=>e.stopPropagation()}>
      <NovedadesCard titulo={titulo} fecha={fecha} items={items} onClose={onClose}/>
    </div>
  </div>;
}
