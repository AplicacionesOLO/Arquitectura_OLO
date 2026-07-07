// BPA-BOT · chat — responde SOLO sobre el sistema OLO, usando file_search de
// OpenAI sobre los manuales cargados en Administración. El nivel de detalle
// (síntesis semántica vs. solo citas literales) depende de la capacidad que
// tenga el rol del usuario en bpabot_role_capabilities.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY")!;
const VECTOR_STORE_ID = Deno.env.get("OPENAI_VECTOR_STORE_ID")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

const BASE_PROMPT = `Eres BPA-BOT, el asistente interno del sistema OLO (ERP Softland, WMS eFlow, procesos BPA e integraciones de OLO Logistics).
Solo respondes preguntas relacionadas con el sistema OLO: sus manuales, procesos operativos, módulos, integraciones y arquitectura.
Si la pregunta no está relacionada con el sistema OLO, responde amablemente que solo puedes ayudar con temas del sistema OLO y no continúes.
Responde siempre en español, de forma clara y concisa.`;

const MODE_PROMPT = {
  semantico: `Tienes acceso completo a los manuales indexados. Puedes sintetizar, interpretar, comparar y explicar información de varios manuales para dar una respuesta completa y razonada, siempre citando de qué manual proviene la información.`,
  documental: `Solo puedes responder citando extractos literales de los manuales encontrados, indicando el nombre del manual de origen. No interpretes, no infieras ni sintetices más allá del texto encontrado — si no hay un extracto literal que responda la pregunta, dilo explícitamente.`,
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const supa = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userData, error: userErr } = await supa.auth.getUser();
    if (userErr || !userData?.user) {
      return json({ error: "No autenticado." }, 401);
    }
    const user = userData.user;

    const { data: canSemantico } = await supa.rpc("bpabot_has_capability", { cap: "chat_semantico" });
    const { data: canDocumental } = await supa.rpc("bpabot_has_capability", { cap: "consulta_documental" });

    const mode = canSemantico ? "semantico" : canDocumental ? "documental" : null;
    if (!mode) {
      return json({ error: "Tu rol no tiene acceso al asistente BPA-BOT." }, 403);
    }

    const { message, history } = await req.json();
    if (!message || typeof message !== "string") {
      return json({ error: "Falta el mensaje." }, 400);
    }

    const input = [
      ...(Array.isArray(history) ? history.slice(-10) : []).map((h: { role: string; content: string }) => ({
        role: h.role === "assistant" ? "assistant" : "user",
        content: h.content,
      })),
      { role: "user", content: message },
    ];

    const openaiRes = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        instructions: `${BASE_PROMPT}\n\n${MODE_PROMPT[mode]}`,
        input,
        tools: [{ type: "file_search", vector_store_ids: [VECTOR_STORE_ID] }],
      }),
    });

    const openaiBody = await openaiRes.json();
    if (!openaiRes.ok) {
      console.error("OpenAI error", JSON.stringify(openaiBody));
      return json({ error: "El asistente no pudo responder en este momento." }, 502);
    }

    const reply = extractText(openaiBody) || "No encontré información suficiente en los manuales para responder eso.";

    await supa.from("bpabot_mensajes").insert([
      { user_id: user.id, role: "user", content: message },
      { user_id: user.id, role: "assistant", content: reply },
    ]);

    return json({ reply, mode });
  } catch (e) {
    console.error(e);
    return json({ error: "Error interno del asistente." }, 500);
  }
});

function extractText(openaiBody: any): string {
  if (typeof openaiBody.output_text === "string" && openaiBody.output_text.trim()) {
    return openaiBody.output_text;
  }
  const msg = (openaiBody.output ?? []).find((o: any) => o.type === "message");
  const part = msg?.content?.find((c: any) => c.type === "output_text");
  return part?.text ?? "";
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
