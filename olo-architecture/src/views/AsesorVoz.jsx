// ═══════════════════════════════════════════════════════════════════════════
// VISTA · Asesor por voz — conversación en tiempo real (OpenAI Realtime, WebRTC).
// La función asesor-voz da una clave efímera (y aplica el tope mensual); el
// navegador habla directo con OpenAI. El agente de voz responde lo puntual con
// buscar_en_bpa (base de conocimiento) y delega los análisis en consultar_asesor,
// que usa el chat de siempre (onConsultar): el análisis completo queda en el hilo.
// El uso (tokens) se va registrando en la corrida del job «asesor_voz» (Monitor).
// ═══════════════════════════════════════════════════════════════════════════
import { useState, useRef, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient.js";
import { DESIGN } from "../data/constants.js";

const FASE = { conectando:["Conectando…", "#64748b"], escuchando:["Te escucho", "#15803d"], hablando:["Hablando", "#7c3aed"],
  consultando:["Consultando al asesor… (20 a 60 s)", "#b45309"], buscando:["Buscando en el BPA…", "#0369a1"], error:["Error", "#b91c1c"] };
const VACIO = { audio_entrada:0, audio_entrada_cache:0, texto_entrada:0, texto_entrada_cache:0, audio_salida:0, texto_salida:0, transcripcion_entrada:0, transcripcion_salida:0 };
const usd = n => `US$ ${n < 1 ? n.toFixed(3) : n.toFixed(2)}`;

// Lo esencial del análisis, para que el agente lo diga en voz (el completo queda en pantalla)
function resumenParaVoz(x = {}) {
  const txt = v => typeof v === "string" ? v : v?.descripcion || v?.texto || v?.titulo || "";
  return { veredicto: x.veredicto, resumen: x.resumen, recomendacion: txt(x.recomendacion),
    implicaciones: (x.implicaciones || []).slice(0, 3).map(txt), precedentes: (x.solicitudes_relacionadas || []).slice(0, 3).map(s => s.titulo),
    preguntas_abiertas: (x.preguntas_abiertas || []).slice(0, 2) };
}

async function mensajeError(error, data) {
  if (data?.error) return data.error;
  try { const j = await error?.context?.json(); if (j?.error) return j.error; } catch { /* sin cuerpo */ }
  return error?.message || "No se pudo abrir la conversación de voz.";
}

export function AsesorVoz({ onConsultar, onCerrar }) {
  const [fase, setFase] = useState("conectando");
  const [lineas, setLineas] = useState([]);         // { rol: "tu" | "asesor", texto }
  const [mudo, setMudo] = useState(false);
  const [error, setError] = useState(null);
  const [cuenta, setCuenta] = useState({ costo:0, gastado:0, tope:20, seg:0 });
  const r = useRef({});                             // pc, dc, stream, audio, sesion, uso, consultas, turnos, t0, precios

  const costoDe = (u, p) => Object.entries(p || {}).reduce((a, [k, precio]) => a + (u[k] || 0) * precio / 1e6, 0);
  const registrar = useCallback(async (final = false) => {
    const x = r.current; if (!x.sesion) return;
    await supabase.functions.invoke("asesor-voz", { body:{ accion:"registrar", sesion_id:x.sesion.sesion_id, uso:x.uso,
      duracion_s:(Date.now() - x.t0) / 1000, consultas:x.consultas, turnos:x.turnos, final } }).catch(() => {});
  }, []);

  // Libera micrófono y conexión y deja registrado el uso final (sin tocar la pantalla)
  const liberar = useCallback(async () => {
    const x = r.current; if (x.cerrado) return false; x.cerrado = true;
    clearInterval(x.intervalo);
    try { x.dc?.close(); x.pc?.close(); } catch { /* ya cerrado */ }
    x.stream?.getTracks().forEach(t => t.stop());
    if (x.audio) x.audio.srcObject = null;
    await registrar(true);
    return true;
  }, [registrar]);
  // Termina la conversación: con motivo deja el aviso en pantalla; sin motivo cierra el panel
  const terminar = useCallback(async (motivo) => {
    await liberar();
    if (motivo) { setFase("error"); setError(motivo); } else onCerrar();
  }, [liberar, onCerrar]);

  const enviar = (ev) => { const dc = r.current.dc; if (dc?.readyState === "open") dc.send(JSON.stringify(ev)); };
  const linea = (rol, texto) => texto?.trim() && setLineas(ls => [...ls, { rol, texto: texto.trim() }].slice(-40));

  const herramienta = useCallback(async (nombre, args, callId) => {
    let salida;
    try {
      if (nombre === "consultar_asesor") {
        setFase("consultando"); r.current.consultas++;
        const respuesta = await onConsultar(String(args.pregunta || ""));
        salida = respuesta ? resumenParaVoz(respuesta) : { error: "El asesor no pudo responder; ofrece intentarlo de nuevo." };
      } else if (nombre === "buscar_en_bpa") {
        setFase("buscando");
        const { data } = await supabase.rpc("asesor_buscar", { q: String(args.consulta || ""), lim: 6 });
        salida = { resultados: (data || []).map(d => ({ titulo: d.titulo, tipo: d.tipo, fragmento: String(d.fragmento || "").replace(/<[^>]+>/g, "").slice(0, 400) })) };
      } else salida = { error: `Herramienta desconocida: ${nombre}` };
    } catch (e) { salida = { error: e.message }; }
    enviar({ type:"conversation.item.create", item:{ type:"function_call_output", call_id: callId, output: JSON.stringify(salida) } });
    enviar({ type:"response.create" });
  }, [onConsultar]);

  const evento = useCallback((ev) => {
    const x = r.current;
    switch (ev.type) {
      case "input_audio_buffer.speech_started": setFase("escuchando"); break;
      case "output_audio_buffer.started": setFase("hablando"); break;
      case "output_audio_buffer.stopped": setFase(f => f === "hablando" ? "escuchando" : f); break;
      case "conversation.item.input_audio_transcription.completed": {
        linea("tu", ev.transcript); x.turnos++;
        const u = ev.usage || {};
        x.uso.transcripcion_entrada += u.input_tokens || 0; x.uso.transcripcion_salida += u.output_tokens || 0;
        break; }
      case "response.output_audio_transcript.done": case "response.audio_transcript.done": linea("asesor", ev.transcript); break;
      case "response.done": {
        const u = ev.response?.usage, it = u?.input_token_details || {}, ot = u?.output_token_details || {}, cd = it.cached_tokens_details || {};
        if (u) {
          x.uso.audio_entrada += (it.audio_tokens || 0) - (cd.audio_tokens || 0); x.uso.audio_entrada_cache += cd.audio_tokens || 0;
          x.uso.texto_entrada += (it.text_tokens || 0) - (cd.text_tokens || 0); x.uso.texto_entrada_cache += cd.text_tokens || 0;
          x.uso.audio_salida += ot.audio_tokens || 0; x.uso.texto_salida += ot.text_tokens || 0;
          const costo = costoDe(x.uso, x.sesion?.precios);
          setCuenta(c => ({ ...c, costo }));
          // tope mensual: corta si esta conversación lo alcanza
          if (x.sesion && x.sesion.gastado + costo >= x.sesion.tope) terminar(`Se alcanzó el tope mensual del asesor por voz (US$ ${x.sesion.tope}). La conversación se cerró.`);
        }
        for (const o of ev.response?.output || []) if (o.type === "function_call") {
          let args = {}; try { args = JSON.parse(o.arguments || "{}"); } catch { /* argumentos vacíos */ }
          herramienta(o.name, args, o.call_id);
        }
        break; }
      case "error": setError(ev.error?.message || "Error en la conversación de voz."); break;
      default: break;
    }
  }, [herramienta, terminar]);

  useEffect(() => {
    const x = r.current; Object.assign(x, { uso: { ...VACIO }, consultas: 0, turnos: 0, cerrado: false });
    let vivo = true;
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("asesor-voz", { body:{ accion:"sesion" } });
        if (error || !data?.client_secret) throw new Error(await mensajeError(error, data));
        // desmontado mientras se abría (doble montaje de desarrollo): se cierra esa sesión en $0
        if (!vivo) { supabase.functions.invoke("asesor-voz", { body:{ accion:"registrar", sesion_id:data.sesion_id, uso:VACIO, duracion_s:0, consultas:0, turnos:0, final:true } }); return; }
        x.sesion = data; x.t0 = Date.now();
        setCuenta(c => ({ ...c, gastado: data.gastado || 0, tope: data.tope }));
        x.stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
        x.pc = new RTCPeerConnection();
        x.audio = new Audio(); x.audio.autoplay = true;
        x.pc.ontrack = e => { x.audio.srcObject = e.streams[0]; };
        x.pc.addTrack(x.stream.getAudioTracks()[0], x.stream);
        x.dc = x.pc.createDataChannel("oai-events");
        x.dc.onmessage = e => { try { evento(JSON.parse(e.data)); } catch { /* evento no JSON */ } };
        x.dc.onopen = () => { setFase("escuchando"); enviar({ type:"response.create", response:{ instructions:"Saluda en una sola frase corta: eres el asesor de cambios del BPA de OLO y preguntas en qué puedes ayudar." } }); };
        const oferta = await x.pc.createOffer(); await x.pc.setLocalDescription(oferta);
        const resp = await fetch("https://api.openai.com/v1/realtime/calls", { method:"POST", body: oferta.sdp, headers:{ Authorization:`Bearer ${data.client_secret}`, "Content-Type":"application/sdp" } });
        if (!resp.ok) throw new Error(`OpenAI rechazó la conexión de voz (${resp.status}): ${(await resp.text()).slice(0, 160)}`);
        await x.pc.setRemoteDescription({ type:"answer", sdp: await resp.text() });
        // cada 30 s se guarda el uso (por si se cierra el navegador) y se vigila la duración máxima
        x.intervalo = setInterval(() => {
          const seg = Math.round((Date.now() - x.t0) / 1000);
          setCuenta(c => ({ ...c, seg }));
          if (seg % 30 < 2) registrar(false);
          if (seg >= (x.sesion.max_minutos || 20) * 60) terminar(`La conversación llegó al máximo de ${x.sesion.max_minutos} minutos y se cerró.`);
        }, 1000);
      } catch (e) {
        if (!vivo) return;
        terminar(e.name === "NotAllowedError" ? "El navegador no dio permiso para usar el micrófono." : e.message);
      }
    })();
    // al desmontar (o en el doble montaje de desarrollo) solo se libera: no se cierra el panel
    return () => { vivo = false; liberar(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { r.current.stream?.getAudioTracks().forEach(t => { t.enabled = !mudo; }); }, [mudo]);

  const [fl, fc] = FASE[error ? "error" : fase] || FASE.conectando;
  const btn = { fontSize:12.5, fontWeight:700, border:"none", borderRadius:7, padding:"6px 12px", cursor:"pointer", fontFamily:DESIGN.font };
  return <div style={{ borderBottom:`1px solid ${DESIGN.border}`, background:"#faf5ff", padding:"10px 14px" }}>
    <style>{`@keyframes vozPulso { 0% { box-shadow:0 0 0 0 ${fc}66 } 70% { box-shadow:0 0 0 10px ${fc}00 } 100% { box-shadow:0 0 0 0 ${fc}00 } }`}</style>
    <div style={{ display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" }}>
      <span style={{ width:12, height:12, borderRadius:"50%", background:fc, animation: error ? "none" : "vozPulso 1.6s infinite", flexShrink:0 }}/>
      <b style={{ fontSize:14, color:fc }}>{mudo && !error ? "Micrófono silenciado" : fl}</b>
      <span style={{ fontSize:12.5, color:DESIGN.muted }}>{Math.floor(cuenta.seg / 60)}:{String(cuenta.seg % 60).padStart(2, "0")} · esta conversación {usd(cuenta.costo)} · mes {usd(cuenta.gastado + cuenta.costo)} de US$ {cuenta.tope}</span>
      <span style={{ marginLeft:"auto", display:"flex", gap:6 }}>
        {!error && <button onClick={() => setMudo(m => !m)} style={{ ...btn, background:mudo ? "#fee2e2" : "#fff", color:mudo ? "#b91c1c" : DESIGN.inkSoft, border:`1px solid ${DESIGN.border}` }}>{mudo ? "🎙 Activar micrófono" : "🔇 Silenciar"}</button>}
        <button onClick={() => error ? onCerrar() : terminar()} style={{ ...btn, background:"#b91c1c", color:"#fff" }}>{error ? "Cerrar" : "■ Terminar"}</button>
      </span>
    </div>
    {error && <div style={{ fontSize:13, color:"#991b1b", marginTop:6 }}>{error}</div>}
    {lineas.length > 0 && <div style={{ display:"grid", gap:3, marginTop:8, maxHeight:140, overflowY:"auto" }}>
      {lineas.slice(-6).map((l, i) => <div key={i} style={{ fontSize:13, lineHeight:1.45, color:l.rol === "tu" ? DESIGN.ink : "#5b21b6" }}>
        <b>{l.rol === "tu" ? "Tú" : "Asesor"}:</b> {l.texto}</div>)}
    </div>}
    {!error && !lineas.length && <div style={{ fontSize:12.5, color:DESIGN.muted, marginTop:6 }}>Habla con normalidad; puedes interrumpirlo. Las consultas de análisis aparecen abajo con su análisis completo.</div>}
  </div>;
}
