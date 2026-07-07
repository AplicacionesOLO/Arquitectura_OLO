// BPA-BOT · ingest — sube un manual ya guardado en Storage al Vector Store de
// OpenAI (para file_search) o lo retira cuando se elimina. Solo lo puede
// invocar quien tenga la capacidad 'gestionar_documentos' (ver
// bpabot_role_capabilities) — se revalida aquí porque este función usa la
// service_role key para leer Storage y no depende solo de RLS.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY")!;
const VECTOR_STORE_ID = Deno.env.get("OPENAI_VECTOR_STORE_ID")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const supaCaller = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await supaCaller.auth.getUser();
    if (userErr || !userData?.user) return json({ error: "No autenticado." }, 401);

    const { data: canManage } = await supaCaller.rpc("bpabot_has_capability", { cap: "gestionar_documentos" });
    if (!canManage) return json({ error: "Tu rol no puede gestionar manuales de BPA-BOT." }, 403);

    const { action, manualId } = await req.json();
    const supaAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: manual, error: manualErr } = await supaAdmin
      .from("bpabot_manuales").select("*").eq("id", manualId).single();
    if (manualErr || !manual) return json({ error: "Manual no encontrado." }, 404);

    if (action === "delete") {
      if (manual.openai_file_id) {
        await fetch(`https://api.openai.com/v1/vector_stores/${VECTOR_STORE_ID}/files/${manual.openai_file_id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
        }).catch(() => {});
        await fetch(`https://api.openai.com/v1/files/${manual.openai_file_id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
        }).catch(() => {});
      }
      await supaAdmin.storage.from(manual.bucket).remove([manual.path]);
      await supaAdmin.from("bpabot_manuales").delete().eq("id", manualId);
      return json({ status: "eliminado" });
    }

    // action === "ingest" (default)
    const { data: fileBlob, error: dlErr } = await supaAdmin.storage.from(manual.bucket).download(manual.path);
    if (dlErr || !fileBlob) {
      await supaAdmin.from("bpabot_manuales").update({ status: "error", error_msg: dlErr?.message }).eq("id", manualId);
      return json({ error: "No se pudo leer el archivo de Storage." }, 500);
    }

    const form = new FormData();
    form.append("purpose", "assistants");
    form.append("file", fileBlob, manual.file_name);

    const uploadRes = await fetch("https://api.openai.com/v1/files", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
      body: form,
    });
    const uploadBody = await uploadRes.json();
    if (!uploadRes.ok) {
      await supaAdmin.from("bpabot_manuales").update({ status: "error", error_msg: JSON.stringify(uploadBody) }).eq("id", manualId);
      return json({ error: "OpenAI rechazó el archivo." }, 502);
    }

    const attachRes = await fetch(`https://api.openai.com/v1/vector_stores/${VECTOR_STORE_ID}/files`, {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ file_id: uploadBody.id }),
    });
    const attachBody = await attachRes.json();
    const status = attachRes.ok ? "listo" : "error";

    await supaAdmin.from("bpabot_manuales").update({
      openai_file_id: uploadBody.id,
      status,
      error_msg: attachRes.ok ? null : JSON.stringify(attachBody),
    }).eq("id", manualId);

    return json({ status, openai_file_id: uploadBody.id });
  } catch (e) {
    console.error(e);
    return json({ error: "Error interno al procesar el manual." }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
