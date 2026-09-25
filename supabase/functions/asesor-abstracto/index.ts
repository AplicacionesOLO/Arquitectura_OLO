// ASESOR · CONOCIMIENTO ABSTRACTO — procesa una pieza suelta (correo, chat,
// imagen, PDF, nota) cargada en el BPA: la clasifica, la resume, extrae hechos,
// decisiones y pendientes, la interpreta para el WMS/BPA y la enlaza con lo que
// ya existe (consultando la base de conocimiento para no inventar nombres).
// El resultado se guarda en asesor_abstracto y se publica en asesor_docs
// (tipo «abstracto») para que el Asesor de cambios lo use. Solo ADMIN.
// Secretos: OPENAI_API_KEY y ASESOR_MODEL (los mismos del asesor).
import { createClient } from "npm:@supabase/supabase-js@2";
import { encodeBase64 } from "jsr:@std/encoding/base64";
import { corsHeaders } from "../_shared/cors.ts";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY")!;
const MODELO = Deno.env.get("ASESOR_MODEL") ?? "gpt-4.1";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const MAX_VUELTAS = 6;

const INSTRUCCIONES = `Procesas conocimiento "abstracto" para el BPA de OLO Logistics (WMS eFlow de ePRAC, Torre de Control WMH, SORTER CLIRO de Mecalux, eIntegra, Softland; clientes Cofersa, EPA, Mayoreo, Febeca, Beval, Sillaca): correos, chats de WhatsApp, capturas de pantalla, fotos, PDFs o notas sueltas.

Tu trabajo es convertir la pieza en conocimiento útil y verificable:
1. Si es imagen o PDF, transcribe el texto relevante que contenga (texto_extraido).
2. Clasifícala (categoria) y dale un título corto y descriptivo.
3. Resume de qué trata y extrae hechos concretos, decisiones tomadas, acuerdos y pendientes (con responsable si aparece un rol).
4. Interpreta qué significa para la operación, el WMS o el BPA (¿confirma, contradice o completa algo?).
5. Enlaza con lo que ya existe: usa buscar_conocimiento / listar_solicitudes / ver_tabla para encontrar las tablas, pantallas, procesos y solicitudes de cambio REALES a las que se refiere; en "entidades" pon solo lo que encontraste (con su nombre tal como aparece en la base) y marca como "no_encontrado" lo que se menciona pero no existe.

Reglas:
- No inventes: si algo es incierto, dilo y baja la confianza.
- Privacidad: NO copies direcciones de correo, teléfonos, cédulas, contraseñas ni datos bancarios; reemplázalos por [correo], [teléfono], etc. Las personas se nombran por su rol o empresa cuando sea posible.
- Escribe en español claro.`;

const HERRAMIENTAS = [
  { type: "function", name: "buscar_conocimiento", description: "Búsqueda de texto completo en la base de conocimiento del BPA (tablas, pantallas, procesos, solicitudes, reglas).",
    parameters: { type: "object", additionalProperties: false, required: ["consulta", "tipos"], properties: {
      consulta: { type: "string" }, tipos: { type: ["array", "null"], items: { type: "string", enum: ["solicitud", "tabla", "pantalla_wms", "pantalla_hh", "pantalla_wmh", "pantalla_sorter", "pantalla_softland", "proceso", "regla", "contexto", "estandar", "abstracto"] } } } }, strict: true },
  { type: "function", name: "listar_solicitudes", description: "Catálogo de solicitudes de cambio a ePRAC (id, título, módulo, fecha, estado).",
    parameters: { type: "object", additionalProperties: false, required: ["filtro"], properties: { filtro: { type: ["string", "null"] } } }, strict: true },
  { type: "function", name: "ver_tabla", description: "Estructura de una tabla por nombre.",
    parameters: { type: "object", additionalProperties: false, required: ["nombre"], properties: { nombre: { type: "string" } } }, strict: true },
];

const lista = { type: "array", items: { type: "string" } };
const ESQUEMA = {
  type: "object", additionalProperties: false,
  required: ["titulo", "fuente", "categoria", "resumen", "interpretacion", "hechos", "decisiones", "pendientes", "entidades", "no_encontrado", "fecha_evento", "confianza", "texto_extraido"],
  properties: {
    titulo: { type: "string" },
    fuente: { type: "string", enum: ["correo", "chat", "imagen", "documento", "nota"] },
    categoria: { type: "string", enum: ["incidencia", "decision", "acuerdo", "requerimiento", "solicitud_de_cambio", "evidencia", "procedimiento", "contexto"] },
    resumen: { type: "string" },
    interpretacion: { type: "string", description: "Qué significa para el WMS/BPA: confirma, contradice o completa qué" },
    hechos: lista, decisiones: lista,
    pendientes: { type: "array", items: { type: "object", additionalProperties: false, required: ["que", "responsable"], properties: { que: { type: "string" }, responsable: { type: ["string", "null"] } } } },
    entidades: { type: "object", additionalProperties: false, required: ["sistemas", "tablas", "pantallas", "procesos", "solicitudes", "clientes"],
      properties: { sistemas: lista, tablas: lista, pantallas: lista, procesos: lista, solicitudes: lista, clientes: lista } },
    no_encontrado: lista,
    fecha_evento: { type: ["string", "null"], description: "Fecha del hecho si aparece (AAAA-MM-DD)" },
    confianza: { type: "string", enum: ["alta", "media", "baja"] },
    texto_extraido: { type: ["string", "null"], description: "Transcripción del texto relevante de la imagen o PDF (sin datos personales)" },
  },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const supa = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } } });
  let id: string | null = null;
  try {
    const { data: u } = await supa.auth.getUser();
    if (!u?.user) return json({ error: "No autenticado." }, 401);
    const { data: rol } = await supa.rpc("current_user_role");
    if (rol !== "admin") return json({ error: "Solo administradores." }, 403);
    ({ id } = await req.json());
    const { data: pieza } = await supa.from("asesor_abstracto").select("*").eq("id", id).maybeSingle();
    if (!pieza) return json({ error: "No existe esa pieza." }, 404);
    await supa.from("asesor_abstracto").update({ estado: "procesando", error: null }).eq("id", id);

    // contenido para el modelo: texto + imagen o PDF (en base64)
    const partes: unknown[] = [{ type: "input_text", text: `Tipo declarado: ${pieza.fuente}. Título dado por el usuario: ${pieza.titulo || "(sin título)"}.\n\n${pieza.contenido ? `Contenido:\n${String(pieza.contenido).slice(0, 60000)}` : "(sin texto: ver archivo adjunto)"}` }];
    if (pieza.archivo_path) {
      const { data: blob, error: e } = await supa.storage.from("asesor-abstracto").download(pieza.archivo_path);
      if (e || !blob) throw new Error(`No se pudo leer el archivo: ${e?.message ?? "vacío"}`);
      const b64 = encodeBase64(new Uint8Array(await blob.arrayBuffer()));
      const mime = pieza.mime || blob.type || "application/octet-stream";
      if (mime.startsWith("image/")) partes.push({ type: "input_image", image_url: `data:${mime};base64,${b64}` });
      else if (mime === "application/pdf") partes.push({ type: "input_file", filename: pieza.archivo_nombre || "documento.pdf", file_data: `data:application/pdf;base64,${b64}` });
    }

    const ejecutar = async (nombre: string, a: Record<string, unknown>) => {
      if (nombre === "buscar_conocimiento") {
        const { data } = await supa.rpc("asesor_buscar", { q: a.consulta, tipos: a.tipos ?? null, lim: 8 });
        return (data ?? []).map((d: Record<string, unknown>) => ({ id: d.id, tipo: d.tipo, titulo: d.titulo, fragmento: d.fragmento }));
      }
      if (nombre === "listar_solicitudes") {
        let q = supa.from("solicitudes_cambio").select("id,titulo,modulo,fecha,estado").order("fecha", { ascending: false }).limit(60);
        if (a.filtro) { const f = String(a.filtro).replace(/[%,()]/g, ""); q = q.or(`titulo.ilike.%${f}%,modulo.ilike.%${f}%,descripcion.ilike.%${f}%`); }
        const { data } = await q; return data ?? [];
      }
      if (nombre === "ver_tabla") {
        const n = String(a.nombre).toUpperCase().replace(/[^A-Z0-9_.]/g, "");
        const { data } = await supa.from("asesor_docs").select("id,titulo,texto").eq("tipo", "tabla").ilike("ref", `%:${n}`).limit(2);
        return data?.length ? data.map(d => ({ ...d, texto: String(d.texto).slice(0, 5000) })) : { error: `No existe la tabla ${n}.` };
      }
      return { error: "herramienta desconocida" };
    };

    let entrada: unknown[] = [{ role: "user", content: partes }];
    let anterior: string | null = null, tokIn = 0, tokOut = 0, r: Record<string, unknown> | null = null;
    for (let v = 0; v < MAX_VUELTAS; v++) {
      const cuerpo: Record<string, unknown> = { model: MODELO, instructions: INSTRUCCIONES, input: entrada, tools: HERRAMIENTAS,
        text: { format: { type: "json_schema", name: "conocimiento_abstracto", schema: ESQUEMA, strict: true } } };
      if (anterior) cuerpo.previous_response_id = anterior;
      if (v === MAX_VUELTAS - 1) { cuerpo.tool_choice = "none"; cuerpo.input = [...entrada, { role: "user", content: "Concluye ahora con lo reunido." }]; }
      const res = await fetch("https://api.openai.com/v1/responses", { method: "POST", headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" }, body: JSON.stringify(cuerpo) });
      const b = await res.json();
      if (!res.ok) throw new Error(`OpenAI: ${b?.error?.message ?? res.status}`);
      anterior = b.id; tokIn += b.usage?.input_tokens ?? 0; tokOut += b.usage?.output_tokens ?? 0;
      const llamadas = (b.output ?? []).filter((o: { type: string }) => o.type === "function_call");
      if (!llamadas.length) {
        const texto = (b.output ?? []).flatMap((o: { type: string; content?: { type: string; text?: string }[] }) => o.type === "message" ? (o.content ?? []).filter(c => c.type === "output_text").map(c => c.text) : []).join("");
        r = JSON.parse(texto); break;
      }
      entrada = [];
      for (const c of llamadas) {
        let args: Record<string, unknown> = {}; try { args = JSON.parse(c.arguments ?? "{}"); } catch { /* sin argumentos */ }
        entrada.push({ type: "function_call_output", call_id: c.call_id, output: JSON.stringify(await ejecutar(c.name, args)).slice(0, 20000) });
      }
    }
    if (!r) throw new Error("El modelo no devolvió una clasificación.");

    // guardar y publicar en la base de conocimiento del asesor
    const e = r.entidades as Record<string, string[]>;
    const doc = [
      `Conocimiento abstracto (${r.fuente}, ${r.categoria}, confianza ${r.confianza})${r.fecha_evento ? ` · fecha ${r.fecha_evento}` : ""}. Es evidencia informal: contrastar con fuentes formales.`,
      `Resumen: ${r.resumen}`, `Interpretación: ${r.interpretacion}`,
      (r.hechos as string[]).length && `Hechos:\n- ${(r.hechos as string[]).join("\n- ")}`,
      (r.decisiones as string[]).length && `Decisiones:\n- ${(r.decisiones as string[]).join("\n- ")}`,
      (r.pendientes as { que: string; responsable: string | null }[]).length && `Pendientes:\n- ${(r.pendientes as { que: string; responsable: string | null }[]).map(p => `${p.que}${p.responsable ? ` (${p.responsable})` : ""}`).join("\n- ")}`,
      `Relacionado con: ${Object.entries(e).filter(([, v]) => v.length).map(([k, v]) => `${k}: ${v.join(", ")}`).join(" · ") || "—"}`,
      r.texto_extraido && `Texto extraído:\n${String(r.texto_extraido).slice(0, 8000)}`,
    ].filter(Boolean).join("\n");
    await supa.from("asesor_docs").upsert({ id: `abstracto:${id}`, tipo: "abstracto", ref: id, titulo: `Conocimiento abstracto · ${r.titulo}`, texto: doc,
      meta: { categoria: r.categoria, fuente: r.fuente, fecha: r.fecha_evento, confianza: r.confianza, entidades: e } });
    await supa.from("asesor_abstracto").update({ estado: "listo", categoria: r.categoria, resultado: r, titulo: pieza.titulo || r.titulo, modelo: MODELO,
      tokens_entrada: tokIn, tokens_salida: tokOut, procesado_at: new Date().toISOString(), error: null }).eq("id", id);
    return json({ ok: true, resultado: r });
  } catch (err) {
    const msg = String((err as Error)?.message ?? err);
    if (id) await supa.from("asesor_abstracto").update({ estado: "error", error: msg.slice(0, 500) }).eq("id", id);
    return json({ error: msg }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
