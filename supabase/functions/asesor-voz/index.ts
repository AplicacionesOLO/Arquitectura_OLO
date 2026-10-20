// ASESOR POR VOZ — abre una conversación de voz en tiempo real (OpenAI Realtime,
// WebRTC) para el Asesor de cambios. El navegador habla directo con OpenAI usando
// una clave efímera que da esta función; el agente de voz conversa y, para los
// análisis, delega en el asesor de siempre (función asesor-cambios).
// Gasto: cada conversación es una corrida del job «asesor_voz» en bpa_job_runs
// (Monitor), con tokens y costo; hay tope mensual (bpa_jobs.config). Solo ADMIN.
// Secretos: OPENAI_API_KEY. Usa la clave de servicio solo para registrar el gasto.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Valores por defecto; se sobreescriben con bpa_jobs.config del job asesor_voz (editable en Monitor)
const CFG = {
  activo: true, modelo: "gpt-realtime-mini", voz: "cedar", transcripcion: "gpt-4o-mini-transcribe",
  limite_mensual_usd: 20, max_minutos: 20,
  // costo: largo máximo de cada respuesta hablada y cuánto historial se vuelve a enviar (y cobrar) en cada turno
  max_tokens_respuesta: 300, retencion_historial: 0.5,
  // US$ por millón de tokens (precios de lista de OpenAI; verificar y ajustar en Monitor si cambian)
  precios_usd_millon: { audio_entrada: 10, audio_entrada_cache: 0.3, texto_entrada: 0.6, texto_entrada_cache: 0.06, audio_salida: 20, texto_salida: 2.4, transcripcion_entrada: 3, transcripcion_salida: 5 },
};

const INSTRUCCIONES = `Eres la voz del ASESOR DE CAMBIOS del BPA de OLO Logistics (operador logístico 3PL de Costa Rica). Conversas por voz con el administrador del BPA, en español de Costa Rica, con tono profesional, cercano y tranquilo. Hablas como en una llamada: respuestas de una a tres frases cortas, sin listas, sin leer códigos completos ni URLs. Si quieren más detalle, lo piden.
El WMS es eFlow (escritorio y handheld), fabricado por ePRAC, con la Torre de Control (WMH), el SORTER CLIRO de Mecalux, el middleware eIntegra y el ERP Softland.
Cómo trabajas:
- Si te preguntan si un cambio al WMS es viable, qué implica, qué riesgos tiene o si ya se hizo algo parecido: usa SIEMPRE la herramienta consultar_asesor con la pregunta completa y clara (incluye cliente, módulo y proceso si los mencionaron). Antes de llamarla di algo breve como «Déjame revisarlo con el asesor, tarda un momento». Cuando vuelva, resume en tres a cinco frases: el veredicto, el porqué, el riesgo principal y la recomendación. Di que el análisis completo quedó en pantalla.
- Para datos puntuales (qué es una tabla, qué hace una pantalla u opción de Softland, qué dice un proceso, en qué estado está una solicitud de cambio o si un desarrollo ya está verificado en el WMS): usa buscar_en_bpa.
- No inventes tablas, pantallas, solicitudes ni cifras: si no lo encuentras, dilo y propone qué averiguar.
- Si algo no se entendió, pide que lo repitan. Si te piden terminar, despídete en una frase.`;

const HERRAMIENTAS = [
  { type: "function", name: "consultar_asesor",
    description: "Análisis completo del asesor de cambios (tarda 20 a 60 segundos): veredicto de viabilidad, implicaciones, tablas, pantallas y procesos afectados, precedentes y recomendación, con todo lo que sabe el BPA.",
    parameters: { type: "object", properties: { pregunta: { type: "string", description: "La pregunta completa, clara y autocontenida." } }, required: ["pregunta"] } },
  { type: "function", name: "buscar_en_bpa",
    description: "Búsqueda rápida en la base de conocimiento del BPA: solicitudes de cambio (con su estado y si están verificadas en el WMS), tablas, pantallas de eFlow, handheld, Torre de Control, SORTER y Softland, procesos y reglas.",
    parameters: { type: "object", properties: { consulta: { type: "string", description: "Palabras clave en español." } }, required: ["consulta"] } },
];

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
const inicioMes = () => { const d = new Date(); return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)).toISOString(); };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const supa = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } } });
    const { data: { user } } = await supa.auth.getUser();
    if (!user) return json({ error: "Inicia sesión." }, 401);
    const { data: rol } = await supa.rpc("current_user_role");
    if (rol !== "admin") return json({ error: "Solo los administradores pueden usar el asesor por voz." }, 403);
    const adm = createClient(SUPABASE_URL, SERVICE_KEY);

    const { data: job } = await adm.from("bpa_jobs").select("config").eq("id", "asesor_voz").maybeSingle();
    const cfg = { ...CFG, ...(job?.config || {}), precios_usd_millon: { ...CFG.precios_usd_millon, ...(job?.config?.precios_usd_millon || {}) } };
    const { data: runs } = await adm.from("bpa_job_runs").select("costo_usd").eq("job_id", "asesor_voz").gte("inicio", inicioMes());
    const gastado = (runs || []).reduce((a, r) => a + Number(r.costo_usd || 0), 0);
    const body = await req.json().catch(() => ({}));

    if (body.accion === "sesion") {
      if (!cfg.activo) return json({ error: "El asesor por voz está desactivado en Monitor." }, 403);
      if (gastado >= cfg.limite_mensual_usd) return json({ error: `Se alcanzó el tope mensual del asesor por voz (US$ ${gastado.toFixed(2)} de US$ ${cfg.limite_mensual_usd}). Se puede ajustar en Monitor.`, gastado, tope: cfg.limite_mensual_usd }, 402);
      // conversaciones que quedaron abiertas (navegador cerrado) se cierran con lo último registrado
      await adm.from("bpa_job_runs").update({ estado: "ok", mensaje: "Conversación de voz (se cerró sin despedida)" }).eq("job_id", "asesor_voz").eq("estado", "en_curso").lt("inicio", new Date(Date.now() - cfg.max_minutos * 60000 - 120000).toISOString());

      const r = await fetch("https://api.openai.com/v1/realtime/client_secrets", { method: "POST", headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ expires_after: { anchor: "created_at", seconds: 120 }, session: {
          type: "realtime", model: cfg.modelo, instructions: INSTRUCCIONES, tools: HERRAMIENTAS, tool_choice: "auto",
          max_output_tokens: cfg.max_tokens_respuesta,
          truncation: { type: "retention_ratio", retention_ratio: cfg.retencion_historial },
          audio: { input: { transcription: { model: cfg.transcripcion, language: "es" }, turn_detection: { type: "semantic_vad" } }, output: { voice: cfg.voz } } } }) });
      const s = await r.json().catch(() => ({}));
      if (!r.ok || !s.value) return json({ detalle: s?.error?.message || null, error: r.status === 401 ? "La clave de OpenAI del BPA no es válida (se venció, se revocó o se cambió). Un administrador debe actualizar el secreto OPENAI_API_KEY en Supabase (Edge Functions › Secrets)." : `OpenAI no abrió la sesión de voz: ${s?.error?.message || r.status}` }, 502);

      const { data: perfil } = await supa.from("profiles").select("nombre,email").eq("id", user.id).maybeSingle();
      const ahora = new Date().toISOString();
      const { data: run } = await adm.from("bpa_job_runs").insert({ job_id: "asesor_voz", inicio: ahora, fin: ahora, duracion_ms: 0, estado: "en_curso", disparo: "manual", modelo: cfg.modelo, costo_usd: 0,
        mensaje: "Conversación de voz en curso", detalle: { usuario: perfil?.nombre || perfil?.email || user.id, voz: cfg.voz } }).select("id").single();
      // sin registro no hay control de gasto: no se abre la conversación
      if (!run?.id) return json({ error: "No se pudo registrar la conversación para controlar el gasto; no se abrió." }, 500);
      await adm.from("bpa_jobs").update({ ultima_ejecucion: ahora }).eq("id", "asesor_voz");
      return json({ client_secret: s.value, sesion_id: run?.id, modelo: cfg.modelo, voz: cfg.voz, tope: cfg.limite_mensual_usd, gastado, max_minutos: cfg.max_minutos, precios: cfg.precios_usd_millon });
    }

    if (body.accion === "registrar") {
      const id = Number(body.sesion_id);
      const { data: run } = await adm.from("bpa_job_runs").select("id,job_id,detalle").eq("id", id).maybeSingle();
      if (!run || run.job_id !== "asesor_voz") return json({ error: "Sesión no encontrada." }, 404);
      const u = body.uso || {}, p = cfg.precios_usd_millon;
      const costo = Object.entries(p).reduce((a, [k, precio]) => a + (Number(u[k]) || 0) * Number(precio) / 1e6, 0);
      const entrada = ["audio_entrada", "audio_entrada_cache", "texto_entrada", "texto_entrada_cache", "transcripcion_entrada"].reduce((a, k) => a + (Number(u[k]) || 0), 0);
      const salida = ["audio_salida", "texto_salida", "transcripcion_salida"].reduce((a, k) => a + (Number(u[k]) || 0), 0);
      const seg = Math.max(0, Math.round(Number(body.duracion_s) || 0)), consultas = Number(body.consultas) || 0;
      await adm.from("bpa_job_runs").update({ fin: new Date().toISOString(), duracion_ms: seg * 1000, costo_usd: Number(costo.toFixed(4)), tokens_entrada: entrada, tokens_salida: salida,
        estado: body.final ? "ok" : "en_curso",
        mensaje: `Conversación de voz · ${Math.max(1, Math.round(seg / 60))} min · ${consultas} consulta${consultas === 1 ? "" : "s"} al asesor`,
        detalle: { ...(run.detalle || {}), uso: u, turnos: Number(body.turnos) || 0, consultas } }).eq("id", id);
      return json({ costo_usd: costo, gastado_mes: gastado, tope: cfg.limite_mensual_usd });
    }
    return json({ error: "Acción no válida." }, 400);
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : String(e) }, 500);
  }
});
