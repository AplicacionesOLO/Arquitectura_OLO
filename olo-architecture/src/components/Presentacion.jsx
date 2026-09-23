// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTE · Presentación de pantallas — visor a pantalla completa que
// recorre capturas en un orden con sentido:
//   · recorrido de un PROCESO: sus pasos en orden; los pasos en eFlow muestran
//     la pantalla del manual, los demás (handheld, Torre, físico) una tarjeta.
//   · recorrido de una PANTALLA: la ventana, sus pestañas y lo que abre
//     (menú «…», diálogos), según el grafo de navegación del crawl.
// Teclado: ← → para moverse, Esc para cerrar, clic en la imagen = zoom.
// ═══════════════════════════════════════════════════════════════════════════
import { useState, useEffect, useCallback } from "react";

export function Presentacion({ slides, start = 0, onClose, onOpenScreen }) {
  const [i, setI] = useState(Math.min(start, slides.length - 1));
  const [zoom, setZoom] = useState(false);
  const go = useCallback((d) => { setZoom(false); setI(x => Math.max(0, Math.min(slides.length - 1, x + d))); }, [slides.length]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, onClose]);

  const s = slides[i];
  const next = slides[i + 1];
  if (!s) return null;
  const btn = (disabled) => ({ background:disabled?"rgba(255,255,255,0.08)":"rgba(255,255,255,0.16)", color:disabled?"#64748b":"#fff", border:"1px solid rgba(255,255,255,0.2)", borderRadius:8, padding:"8px 14px", cursor:disabled?"default":"pointer", fontSize:13, fontWeight:600, fontFamily:"inherit" });

  return <div style={{ position:"fixed", inset:0, zIndex:400, background:"rgba(10,14,23,0.96)", display:"flex", flexDirection:"column", color:"#e2e8f0" }}>
    {/* Encabezado: dónde estoy */}
    <div style={{ display:"flex", alignItems:"center", gap:14, padding:"12px 20px", borderBottom:"1px solid rgba(255,255,255,0.1)", flexShrink:0 }}>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:11, color:"#94a3b8" }}>{s.contexto}</div>
        <div style={{ fontSize:16, fontWeight:700, color:"#fff" }}>{s.titulo}</div>
      </div>
      <span style={{ fontSize:12, color:"#94a3b8" }}>{i + 1} / {slides.length}</span>
      <button onClick={onClose} title="Cerrar (Esc)" style={{ ...btn(false), padding:"6px 12px" }}>✕</button>
    </div>

    {/* Imagen o tarjeta del paso */}
    <div style={{ flex:1, minHeight:0, overflow:zoom?"auto":"hidden", display:"flex", alignItems:zoom?"flex-start":"center", justifyContent:zoom?"flex-start":"center", padding:zoom?0:"16px 20px" }}>
      {s.img
        ? <img src={s.img} alt={s.titulo} onClick={()=>setZoom(z=>!z)} title={zoom?"Ajustar a la pantalla":"Ver al 100 %"}
            style={zoom ? { maxWidth:"none", cursor:"zoom-out" } : { maxWidth:"100%", maxHeight:"100%", objectFit:"contain", cursor:"zoom-in", borderRadius:6, boxShadow:"0 10px 40px rgba(0,0,0,0.5)" }}/>
        : <div style={{ maxWidth:560, textAlign:"center", padding:"32px 28px", border:"1px solid rgba(255,255,255,0.15)", borderRadius:12, background:"rgba(255,255,255,0.04)" }}>
            <div style={{ fontSize:12, fontWeight:700, color:"#5eead4", textTransform:"uppercase", letterSpacing:"0.06em" }}>{s.sistema || "Paso"}</div>
            <div style={{ fontSize:18, color:"#fff", lineHeight:1.5, marginTop:10 }}>{s.texto}</div>
            {s.donde && <div style={{ fontSize:12, color:"#94a3b8", marginTop:10 }}>{s.donde}</div>}
            <div style={{ fontSize:11, color:"#64748b", marginTop:14 }}>Este paso no ocurre en una pantalla de eFlow WMS de escritorio.</div>
          </div>}
    </div>

    {/* Pie: qué se hace aquí y hacia dónde sigue */}
    <div style={{ display:"flex", alignItems:"center", gap:16, padding:"12px 20px", borderTop:"1px solid rgba(255,255,255,0.1)", flexShrink:0 }}>
      <button onClick={()=>go(-1)} disabled={i === 0} style={btn(i === 0)}>← Anterior</button>
      <div style={{ flex:1, minWidth:0 }}>
        {s.img && <div style={{ fontSize:13.5, color:"#fff", lineHeight:1.45 }}>{s.texto}</div>}
        <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginTop:3, fontSize:11.5, color:"#94a3b8" }}>
          {s.img && s.donde && <span>{s.sistema ? `${s.sistema} · ` : ""}{s.donde}</span>}
          {s.screenId && onOpenScreen && <button onClick={()=>onOpenScreen(s.screenId)} style={{ background:"none", border:"none", padding:0, color:"#67e8f9", cursor:"pointer", fontSize:11.5, fontFamily:"inherit" }}>Ver ficha de la pantalla ↗</button>}
        </div>
      </div>
      <div style={{ textAlign:"right", maxWidth:340 }}>
        {next
          ? <button onClick={()=>go(1)} style={{ ...btn(false), textAlign:"right" }}>
              <div style={{ fontSize:10, color:"#94a3b8", fontWeight:500 }}>Siguiente →</div>
              <div style={{ fontSize:12.5, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:300 }}>{next.titulo}{next.donde ? ` · ${next.donde}` : ""}</div>
            </button>
          : <button onClick={onClose} style={btn(false)}>Fin del recorrido ✓</button>}
      </div>
    </div>
  </div>;
}
