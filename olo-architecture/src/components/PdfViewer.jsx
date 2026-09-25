// ═══════════════════════════════════════════════════════════════════════════
// PdfViewer — visor de PDF nativo (pdf.js), con paginación y zoom, en vez de
// incrustarlo vía el iframe de Google Docs. Homologado con el visor de
// Procesos de BPA Mayoreo: barra flotante "Página N de M" + zoom −/+.
// ═══════════════════════════════════════════════════════════════════════════
import { useState, useEffect, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { DESIGN } from "../data/constants.js";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();

export function PdfViewer({ url }) {
  const [doc, setDoc] = useState(null);
  const [numPages, setNumPages] = useState(0);
  const [page, setPage] = useState(1);
  const [pageInput, setPageInput] = useState("1");
  const [scale, setScale] = useState(1.1);
  const [err, setErr] = useState(null);
  const canvasRef = useRef(null);
  const renderTaskRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    setErr(null); setDoc(null);
    // pdf.js 6 ya no acepta la URL como texto suelto: va dentro de { url }
    pdfjsLib.getDocument({ url }).promise
      .then(d => { if (cancelled) return; setDoc(d); setNumPages(d.numPages); setPage(1); setPageInput("1"); })
      .catch(e => { if (!cancelled) setErr(e.message); });
    return () => { cancelled = true; };
  }, [url]);

  useEffect(() => {
    if (!doc) return;
    let cancelled = false;
    doc.getPage(page).then(p => {
      if (cancelled) return;
      const viewport = p.getViewport({ scale });
      const canvas = canvasRef.current; if (!canvas) return;
      canvas.width = viewport.width; canvas.height = viewport.height;
      const ctx = canvas.getContext("2d");
      if (renderTaskRef.current) renderTaskRef.current.cancel();
      const task = p.render({ canvasContext: ctx, viewport });
      renderTaskRef.current = task;
      task.promise.catch(e => { if (e?.name !== "RenderingCancelledException") console.error(e); });
    });
    return () => { cancelled = true; };
  }, [doc, page, scale]);

  const goTo = (n) => { const clamped = Math.max(1, Math.min(numPages, n)); setPage(clamped); setPageInput(String(clamped)); };

  if (err) return <div style={{ color:"#b91c1c", fontSize:12, padding:20 }}>No se pudo cargar el PDF: {err}</div>;
  if (!doc) return <div style={{ color:"#888", fontSize:12, padding:20 }}>Cargando documento…</div>;

  return <div style={{ width:"100%", height:"100%", display:"flex", flexDirection:"column", alignItems:"center" }}>
    <div style={{ flex:1, width:"100%", overflow:"auto", display:"flex", justifyContent:"center", padding:"16px 0" }}>
      <canvas ref={canvasRef} style={{ boxShadow:"0 1px 6px rgba(0,0,0,.15)", background:"#fff" }}/>
    </div>
    <div style={{ display:"flex", alignItems:"center", gap:10, padding:"7px 16px", background:"rgba(255,255,255,.96)", border:`1px solid ${DESIGN.border}`, borderRadius:10, boxShadow:"0 2px 10px rgba(0,0,0,.1)", marginBottom:14, flexShrink:0 }}>
      <button onClick={()=>goTo(page-1)} disabled={page<=1} style={{ background:"none", border:"none", color:page<=1?DESIGN.mutedSoft:DESIGN.inkSoft, cursor:page<=1?"default":"pointer", fontSize:14, padding:"0 4px" }}>‹</button>
      <span style={{ fontSize:12, color:DESIGN.inkSoft, display:"flex", alignItems:"center", gap:5 }}>
        Página
        <input value={pageInput} onChange={e=>setPageInput(e.target.value)}
          onBlur={()=>goTo(parseInt(pageInput,10)||page)}
          onKeyDown={e=>{ if(e.key==="Enter") e.currentTarget.blur(); }}
          style={{ width:32, textAlign:"center", border:`1px solid ${DESIGN.border}`, borderRadius:4, fontSize:12, padding:"2px 0", fontFamily:DESIGN.font }}/>
        de {numPages}
      </span>
      <button onClick={()=>goTo(page+1)} disabled={page>=numPages} style={{ background:"none", border:"none", color:page>=numPages?DESIGN.mutedSoft:DESIGN.inkSoft, cursor:page>=numPages?"default":"pointer", fontSize:14, padding:"0 4px" }}>›</button>
      <span style={{ width:1, alignSelf:"stretch", background:DESIGN.border }}/>
      <button onClick={()=>setScale(s=>Math.max(0.4,s-0.15))} style={{ background:"none", border:"none", color:DESIGN.inkSoft, cursor:"pointer", fontSize:14, padding:"0 4px" }}>−</button>
      <span style={{ fontSize:11, color:DESIGN.muted, minWidth:32, textAlign:"center" }}>{Math.round(scale*100)}%</span>
      <button onClick={()=>setScale(s=>Math.min(3,s+0.15))} style={{ background:"none", border:"none", color:DESIGN.inkSoft, cursor:"pointer", fontSize:14, padding:"0 4px" }}>+</button>
    </div>
  </div>;
}
