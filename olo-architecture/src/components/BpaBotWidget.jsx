// ═══════════════════════════════════════════════════════════════════════════
// BPA-BOT — burbuja flotante disponible en todo el sistema (no es un módulo
// de navegación). El módulo de Administración solo gestiona los manuales
// cargados y la matriz de capacidades por rol — ver AdminView.jsx.
// ═══════════════════════════════════════════════════════════════════════════
import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "../lib/supabaseClient.js";

const MODE_META = {
  semantico:  { label:"Modo semántico",  color:"#27ae60", desc:"Puede sintetizar e interpretar varios manuales." },
  documental: { label:"Modo documental", color:"#f39c12", desc:"Solo cita extractos literales de los manuales." },
};

export function BpaBotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [mode, setMode] = useState(null);
  const [err, setErr] = useState(null);
  const bottomRef = useRef(null);

  const load = useCallback(async () => {
    const { data, error } = await supabase.from("bpabot_mensajes").select("*").order("created_at").limit(200);
    if (error) { setErr(error.message); return; }
    setMessages(data || []);
  }, []);

  useEffect(() => { if (open && messages === null) load(); }, [open, messages, load]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages, sending]);

  const send = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    setErr(null);
    setSending(true);
    const optimistic = { id:`local-${Date.now()}`, role:"user", content:text, created_at:new Date().toISOString() };
    const history = (messages || []).map(m => ({ role:m.role, content:m.content }));
    setMessages(prev => [...(prev||[]), optimistic]);

    const { data, error } = await supabase.functions.invoke("bpabot-chat", { body: { message:text, history } });
    setSending(false);
    if (error || data?.error) {
      setErr(data?.error || error?.message || "No se pudo contactar al asistente.");
      return;
    }
    setMode(data.mode);
    setMessages(prev => [...prev, { id:`local-reply-${Date.now()}`, role:"assistant", content:data.reply, created_at:new Date().toISOString() }]);
  };

  const onKeyDown = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } };

  return <>
    {/* Botón flotante */}
    <button onClick={()=>setOpen(o=>!o)} title="BPA-BOT"
      style={{
        position:"fixed", right:24, bottom:24, zIndex:60,
        width:52, height:52, borderRadius:"50%", border:"none", cursor:"pointer",
        background: open ? "#1D1D1B" : "#00838f", color:"#fff",
        fontSize:20, boxShadow:"0 6px 20px rgba(0,0,0,0.25)",
        display:"flex", alignItems:"center", justifyContent:"center",
        transition:"background 0.15s",
      }}>
      {open ? "✕" : "◎"}
    </button>

    {/* Panel de chat */}
    {open && <div style={{
      position:"fixed", right:24, bottom:86, zIndex:59,
      width:360, maxWidth:"calc(100vw - 48px)", height:480, maxHeight:"calc(100vh - 140px)",
      background:"#fff", borderRadius:14, border:"1px solid #e0e0e0", boxShadow:"0 12px 40px rgba(15,23,42,0.22)",
      display:"flex", flexDirection:"column", overflow:"hidden",
    }}>
      <div style={{ padding:"10px 14px", borderBottom:"1px solid #f0f0f0", display:"flex", alignItems:"center", gap:8, background:"#fafafa", flexWrap:"wrap" }}>
        <span style={{ fontSize:13, fontWeight:700, color:"#1D1D1B" }}>◎ BPA-BOT</span>
        {mode && <span style={{ fontSize:9.5, fontWeight:700, padding:"2px 8px", borderRadius:8, background:MODE_META[mode].color+"18", color:MODE_META[mode].color }}>{MODE_META[mode].label}</span>}
      </div>

      <div style={{ flex:1, overflow:"auto", padding:14, display:"flex", flexDirection:"column", gap:9 }}>
        {messages === null && <div style={{ margin:"auto", color:"#aaa", fontSize:12 }}>Cargando…</div>}
        {messages?.length === 0 && <div style={{ margin:"auto", textAlign:"center", color:"#aaa", fontSize:12, maxWidth:260 }}>
          Pregúntame sobre procesos, módulos, integraciones o cualquier tema cubierto en los manuales cargados en el sistema.
        </div>}
        {messages?.map(m => (
          <div key={m.id} style={{ display:"flex", justifyContent:m.role==="user"?"flex-end":"flex-start" }}>
            <div style={{
              maxWidth:"80%", padding:"8px 11px", borderRadius:10, fontSize:12.5, lineHeight:1.5, whiteSpace:"pre-wrap",
              background:m.role==="user"?"#00838f":"#f1f5f9",
              color:m.role==="user"?"#fff":"#1D1D1B",
            }}>{m.content}</div>
          </div>
        ))}
        {sending && <div style={{ display:"flex", justifyContent:"flex-start" }}>
          <div style={{ padding:"8px 11px", borderRadius:10, background:"#f1f5f9", color:"#999", fontSize:12.5 }}>escribiendo…</div>
        </div>}
        <div ref={bottomRef}/>
      </div>

      {err && <div style={{ padding:"7px 14px", background:"#fef2f2", color:"#b91c1c", fontSize:11, borderTop:"1px solid #fca5a5" }}>{err}</div>}

      <div style={{ padding:10, borderTop:"1px solid #f0f0f0", display:"flex", gap:7 }}>
        <textarea value={input} onChange={e=>setInput(e.target.value)} onKeyDown={onKeyDown} rows={1} disabled={sending}
          placeholder="Escribe tu pregunta…"
          style={{ flex:1, resize:"none", fontSize:12.5, border:"1px solid #ddd", borderRadius:8, padding:"8px 10px", fontFamily:"inherit", outline:"none" }}/>
        <button onClick={send} disabled={sending || !input.trim()}
          style={{ padding:"0 14px", background: sending||!input.trim() ? "#e0e0e0" : "#00838f", color:"#fff", border:"none", borderRadius:8, fontSize:12, fontWeight:700, cursor: sending||!input.trim() ? "default" : "pointer" }}>
          ➤
        </button>
      </div>
    </div>}
  </>;
}
