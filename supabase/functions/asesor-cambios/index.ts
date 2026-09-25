// ASESOR DE CAMBIOS — agente que evalúa si un cambio al WMS eFlow (fabricado
// por ePRAC) es viable, qué implica y si es recomendable, razonando con todo lo
// que el BPA sabe. Llama a OpenAI (Responses API) con herramientas y decide él
// mismo qué consultar: base de conocimiento (tablas reales, pantallas de eFlow /
// Torre de Control / SORTER / Softland, procesos, reglas), el catálogo de
// solicitudes de cambio y la estructura de cada tabla. Solo ADMIN.
// Secretos: OPENAI_API_KEY (el mismo del BPA-BOT) y, opcional, ASESOR_MODEL.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY")!;
const MODELO = Deno.env.get("ASESOR_MODEL") ?? "gpt-4.1";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const MAX_VUELTAS = 14;

const INSTRUCCIONES = `Eres el ASESOR DE CAMBIOS del WMS de OLO Logistics. El WMS es eFlow (escritorio y handheld RF), fabricado por ePRAC, junto con la Torre de Control (WMH), el SORTER CLIRO de Mecalux, el middleware eIntegra y el ERP Softland. Clientes y compañías: Cofersa, EPA, Mayoreo (Costa Rica) y Febeca, Beval, Sillaca (Venezuela).

Tu trabajo: ante un cambio que alguien quiere hacer (o una duda sobre un problema), decir si es posible, qué implica, y si es recomendable o no y por qué — con base en evidencia, no en suposiciones.

Método (usa las herramientas antes de concluir):
1. Entiende el cambio y reformúlalo en una frase.
2. Busca precedentes en las solicitudes de cambio a ePRAC (listar_solicitudes / buscar_conocimiento con tipo "solicitud"): ¿ya se pidió algo igual o parecido? ¿qué se definió? Ten en cuenta su estado (aplicada, en desarrollo, pendiente, rechazada, por definir).
3. Revisa qué partes del sistema toca: tablas y columnas (ver_tabla), pantallas de eFlow y del handheld, reglas o parámetros, procesos del BPA y sus pasos (buscar_conocimiento con tipos "proceso", "pantalla_wms", "regla", "tabla").
4. Evalúa: ¿se resuelve con configuración o necesita desarrollo de ePRAC? ¿existen ya los campos/tablas/reglas necesarios? ¿qué procesos, clientes y compañías se afectan? ¿hay riesgos de integridad de inventario, trazabilidad, interfaces (eIntegra, Softland, Torre de Control, SORTER) o de operación en piso?
5. Antes de concluir, verifica el punto que decide entre «configuración» y «desarrollo»: busca DÓNDE vive el dato, regla o parámetro (tablas de configuración, reglas de almacén, parámetros) con buscar_conocimiento y ver_tabla, y revisa si sus columnas ya permiten lo que se pide (p. ej. si ya existe una columna de zona, almacén o compañía).
6. Concluye con un veredicto y una recomendación accionable.

Profundidad: haz normalmente entre 5 y 10 consultas; usa ver_tabla en las 2–4 tablas más importantes. Usa "falta_informacion" solo si de verdad no hay evidencia para decidir; si hay un precedente claro y la estructura lo permite, da un veredicto (viable / viable_con_riesgos / no_recomendable) y deja lo incierto en preguntas_abiertas.

Reglas:
- No inventes tablas, columnas, pantallas ni solicitudes: si no las encontraste con las herramientas, dilo. Si falta información para decidir, usa el veredicto "falta_informacion" y di qué preguntar.
- La estructura de las tablas de eFlow es la real de EFLOW_OLO (producción Costa Rica). Venezuela (Beval, Febeca, Sillaca) usa el mismo producto con diferencias puntuales. Softland de Venezuela (SOFTLANDQA) todavía no se puede leer. OLO tiene su propio Softland (compañía OVERSEAS): sus pantallas están documentadas en los documentos «Softland OLO (OVERSEAS)»; el diccionario de tablas de Softland viene del cliente Cofersa (QA CR).
- Los procesos marcados BORRADOR son inferidos: úsalos con cautela.
- El tipo «abstracto» es conocimiento informal cargado por el equipo (correos, chats, capturas, notas): úsalo como evidencia de lo que pasó o se acordó, citándolo; contrástalo con las fuentes formales y, si las contradice, dilo explícitamente.
- Una solicitud con relacion.tipo "duplicado" o "version_anterior" es el MISMO cambio que la que indica relacion.de: no la cuentes como precedente independiente; usa la vigente (la que indica relacion.de).
- Los procedimientos del CEDI se llaman CEDI-01…CEDI-14; los silos de operación logística OL.1…OL.9 y los de negocio P1.9…P1.22.
- Cita en "fuentes" TODOS los documentos que usaste para concluir (solicitudes, tablas, pantallas, procesos), con su id tal como lo devuelven las herramientas.
- Escribe en español claro, para personas de operación y TI.
- Es una conversación: si la pregunta nueva se apoya en las anteriores («¿y si…?», «¿y para EPA?»), responde sobre el mismo cambio con esa variante, reutilizando lo ya encontrado y verificando solo lo nuevo.`;

const HERRAMIENTAS = [
  { type: "function", name: "buscar_conocimiento", description: "Búsqueda de texto completo en la base de conocimiento del BPA. Devuelve los documentos más relevantes con un fragmento.",
    parameters: { type: "object", additionalProperties: false, required: ["consulta", "tipos"], properties: {
      consulta: { type: "string", description: "Palabras clave en español (sin frases largas)" },
      tipos: { type: ["array", "null"], items: { type: "string", enum: ["solicitud", "tabla", "pantalla_wms", "pantalla_hh", "pantalla_wmh", "pantalla_sorter", "pantalla_softland", "proceso", "regla", "contexto", "estandar", "abstracto"] }, description: "Filtrar por tipo o null para todos" } } }, strict: true },
  { type: "function", name: "leer_documento", description: "Lee el texto completo de un documento por su id (el que devuelve buscar_conocimiento).",
    parameters: { type: "object", additionalProperties: false, required: ["id"], properties: { id: { type: "string" } } }, strict: true },
  { type: "function", name: "ver_tabla", description: "Estructura de una tabla por nombre (columnas con tipo, llave, relaciones, procesos y pantallas que la usan).",
    parameters: { type: "object", additionalProperties: false, required: ["nombre"], properties: { nombre: { type: "string", description: "Nombre de la tabla, p. ej. EXPEDICIONES" } } }, strict: true },
  { type: "function", name: "listar_solicitudes", description: "Catálogo de solicitudes de cambio a ePRAC (id, título, módulo, fecha, estado). Filtro opcional por texto.",
    parameters: { type: "object", additionalProperties: false, required: ["filtro"], properties: { filtro: { type: ["string", "null"] } } }, strict: true },
  { type: "function", name: "ver_solicitud", description: "Detalle completo de una solicitud de cambio: historia de usuario, situación actual, cambio pedido, estado y notas.",
    parameters: { type: "object", additionalProperties: false, required: ["id"], properties: { id: { type: "string" } } }, strict: true },
];

const ESQUEMA = {
  type: "object", additionalProperties: false,
  required: ["reformulacion", "veredicto", "resumen", "analisis", "implicaciones", "afecta", "solicitudes_relacionadas", "recomendacion", "preguntas_abiertas", "fuentes"],
  properties: {
    reformulacion: { type: "string" },
    veredicto: { type: "string", enum: ["viable", "viable_con_riesgos", "no_recomendable", "falta_informacion"] },
    resumen: { type: "string", description: "2 o 3 frases con la conclusión" },
    analisis: { type: "string", description: "Razonamiento en Markdown: por qué sí o por qué no" },
    implicaciones: { type: "array", items: { type: "object", additionalProperties: false, required: ["area", "detalle", "severidad"],
      properties: { area: { type: "string" }, detalle: { type: "string" }, severidad: { type: "string", enum: ["baja", "media", "alta"] } } } },
    afecta: { type: "object", additionalProperties: false, required: ["tablas", "pantallas", "procesos", "clientes"],
      properties: { tablas: { type: "array", items: { type: "string" } }, pantallas: { type: "array", items: { type: "string" } }, procesos: { type: "array", items: { type: "string" } }, clientes: { type: "array", items: { type: "string" } } } },
    solicitudes_relacionadas: { type: "array", items: { type: "object", additionalProperties: false, required: ["id", "titulo", "relacion"],
      properties: { id: { type: "string" }, titulo: { type: "string" }, relacion: { type: "string" } } } },
    recomendacion: { type: "string" },
    preguntas_abiertas: { type: "array", items: { type: "string" } },
    fuentes: { type: "array", items: { type: "object", additionalProperties: false, required: ["id", "titulo"], properties: { id: { type: "string" }, titulo: { type: "string" } } } },
  },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const t0 = Date.now();
  try {
    const supa = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } } });
    const { data: u } = await supa.auth.getUser();
    if (!u?.user) return json({ error: "No autenticado." }, 401);
    const { data: rol } = await supa.rpc("current_user_role");
    if (rol !== "admin") return json({ error: "El Asesor de cambios es solo para administradores." }, 403);

    const { pregunta, contexto, historial, conversacion } = await req.json();
    if (!pregunta || typeof pregunta !== "string") return json({ error: "Falta la pregunta." }, 400);

    // herramientas: todas leen con el JWT del usuario (RLS admin)
    const registro: { herramienta: string; args: unknown }[] = [];
    const ejecutar = async (nombre: string, a: Record<string, unknown>) => {
      registro.push({ herramienta: nombre, args: a });
      if (nombre === "buscar_conocimiento") {
        const { data, error } = await supa.rpc("asesor_buscar", { q: a.consulta, tipos: a.tipos ?? null, lim: 8 });
        return error ? { error: error.message } : (data ?? []).map((d: Record<string, unknown>) => ({ id: d.id, tipo: d.tipo, titulo: d.titulo, fragmento: d.fragmento }));
      }
      if (nombre === "leer_documento") {
        const { data } = await supa.from("asesor_docs").select("id,tipo,titulo,texto").eq("id", a.id).maybeSingle();
        return data ? { ...data, texto: String(data.texto).slice(0, 14000) } : { error: "No existe ese documento." };
      }
      if (nombre === "ver_tabla") {
        const n = String(a.nombre).toUpperCase().replace(/[^A-Z0-9_.]/g, "");
        const { data } = await supa.from("asesor_docs").select("id,titulo,texto").eq("tipo", "tabla").ilike("ref", `%:${n}`).limit(3);
        return data?.length ? data.map(d => ({ ...d, texto: String(d.texto).slice(0, 9000) })) : { error: `No encontré la tabla ${n}. Prueba buscar_conocimiento con tipo "tabla".` };
      }
      if (nombre === "listar_solicitudes") {
        let q = supa.from("solicitudes_cambio").select("id,titulo,modulo,fecha,estado,compania,prioridad,relacion").order("fecha", { ascending: false }).limit(60);
        if (a.filtro) q = q.or(`titulo.ilike.%${String(a.filtro).replace(/[%,()]/g, "")}%,modulo.ilike.%${String(a.filtro).replace(/[%,()]/g, "")}%,descripcion.ilike.%${String(a.filtro).replace(/[%,()]/g, "")}%`);
        const { data } = await q; return data ?? [];
      }
      if (nombre === "ver_solicitud") {
        const { data } = await supa.from("solicitudes_cambio").select("id,titulo,modulo,fecha,prioridad,cliente,almacen,compania,solicitante,como,necesito,para,situacion_actual,descripcion,estado,notas,entidades,atencion,relacion").eq("id", a.id).maybeSingle();
        return data ? { ...data, descripcion: String(data.descripcion ?? "").slice(0, 12000) } : { error: "No existe esa solicitud." };
      }
      return { error: `Herramienta desconocida: ${nombre}` };
    };

    // modo conversación: los turnos anteriores (pregunta + conclusión) dan contexto a la nueva pregunta
    const previos = (Array.isArray(historial) ? historial.slice(-6) : []).flatMap((h: { pregunta?: string; respuesta?: Record<string, unknown> }) => {
      const r = h.respuesta ?? {};
      const conclusion = [r.veredicto && `Veredicto: ${r.veredicto}`, r.resumen && `Resumen: ${r.resumen}`, r.recomendacion && `Recomendación: ${r.recomendacion}`,
        Array.isArray(r.fuentes) && r.fuentes.length ? `Fuentes consultadas: ${(r.fuentes as { id: string }[]).map(f => f.id).join(", ")}` : null].filter(Boolean).join("\n");
      return [{ role: "user", content: String(h.pregunta ?? "") }, { role: "assistant", content: conclusion || "(sin conclusión)" }];
    });
    let entrada: unknown[] = [...previos, { role: "user", content: contexto ? `${pregunta}\n\nContexto adicional: ${contexto}` : pregunta }];
    let anterior: string | null = null, tokIn = 0, tokOut = 0, final: unknown = null;
    for (let vuelta = 0; vuelta < MAX_VUELTAS; vuelta++) {
      const cuerpo: Record<string, unknown> = { model: MODELO, instructions: INSTRUCCIONES, input: entrada, tools: HERRAMIENTAS,
        text: { format: { type: "json_schema", name: "evaluacion_cambio", schema: ESQUEMA, strict: true } } };
      if (anterior) cuerpo.previous_response_id = anterior;
      // última vuelta: debe concluir con lo que ya reunió (sin más consultas)
      if (vuelta === MAX_VUELTAS - 1) {
        cuerpo.tool_choice = "none";
        entrada = [...entrada, { role: "user", content: "Ya no hay más consultas disponibles: concluye ahora con la evidencia reunida. Lo que no alcanzaste a verificar va en preguntas_abiertas." }];
        cuerpo.input = entrada;
      }
      const r = await fetch("https://api.openai.com/v1/responses", { method: "POST", headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" }, body: JSON.stringify(cuerpo) });
      const b = await r.json();
      if (!r.ok) return json({ error: `OpenAI: ${b?.error?.message ?? r.status}` }, 502);
      anterior = b.id; tokIn += b.usage?.input_tokens ?? 0; tokOut += b.usage?.output_tokens ?? 0;
      const llamadas = (b.output ?? []).filter((o: { type: string }) => o.type === "function_call");
      if (!llamadas.length) {
        const texto = (b.output ?? []).flatMap((o: { type: string; content?: { type: string; text?: string }[] }) => o.type === "message" ? (o.content ?? []).filter(c => c.type === "output_text").map(c => c.text) : []).join("");
        try { final = JSON.parse(texto); } catch { final = { veredicto: "falta_informacion", resumen: texto.slice(0, 2000) }; }
        break;
      }
      entrada = [];
      for (const c of llamadas) {
        let args: Record<string, unknown> = {};
        try { args = JSON.parse(c.arguments ?? "{}"); } catch { /* argumentos inválidos */ }
        const salida = await ejecutar(c.name, args);
        entrada.push({ type: "function_call_output", call_id: c.call_id, output: JSON.stringify(salida).slice(0, 30000) });
      }
    }
    if (!final) final = { veredicto: "falta_informacion", resumen: "El análisis no terminó dentro del límite de consultas; intenta con una pregunta más concreta." };

    const duracion = Date.now() - t0;
    const { data: fila } = await supa.from("asesor_consultas").insert({ pregunta, conversacion: typeof conversacion === "string" ? conversacion.slice(0, 64) : null, respuesta: final, modelo: MODELO, tokens_entrada: tokIn, tokens_salida: tokOut, herramientas: registro, duracion_ms: duracion }).select("id").maybeSingle();
    return json({ id: fila?.id ?? null, respuesta: final, modelo: MODELO, tokens: { entrada: tokIn, salida: tokOut }, herramientas: registro, duracion_ms: duracion });
  } catch (e) {
    return json({ error: String((e as Error)?.message ?? e) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
