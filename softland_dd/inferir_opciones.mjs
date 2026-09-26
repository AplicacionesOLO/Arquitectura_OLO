// Infiere «qué hace» cada opción del Softland de OLO (590 opciones del menú y del
// manual) con Claude, módulo por módulo, y las guarda en la tabla softland_opciones
// (origen «inferido»). NUNCA pisa una descripción que el admin ya editó.
// Contexto que recibe el modelo: resumen del módulo y de sus pantallas (manual de
// OVERSEAS) y el mapeo funcional de Softland (texto del documento, opcional).
// Uso:
//   node softland_dd/inferir_opciones.mjs [--funcional <mapeo.txt>] [--solo CC,FA] [--modelo claude-opus-5-5] [--seco]
//   --seco: solo genera softland_opciones_desc.json, sin escribir en la base.
import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import { fileURLToPath } from "url";

const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const DATA = path.join(RAIZ, "olo-architecture/src/data");
const argv = process.argv.slice(2);
const arg = (k) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : null; };
const MODELO = arg("--modelo") || "claude-opus-5-5";
if (!/^[a-z0-9.-]+$/.test(MODELO)) throw new Error(`modelo no válido: ${MODELO}`);
const SOLO = arg("--solo") ? new Set(arg("--solo").split(",")) : null;
const FUNC = arg("--funcional") ? fs.readFileSync(arg("--funcional"), "utf8") : "";
const SECO = argv.includes("--seco");

const OPC = JSON.parse(fs.readFileSync(path.join(DATA, "softland_opciones_lista.json"), "utf8"));
const MAN = JSON.parse(fs.readFileSync(path.join(DATA, "softland_manual.json"), "utf8"));
const SALIDA = path.join(DATA, "softland_opciones_desc.json");
const previo = fs.existsSync(SALIDA) ? JSON.parse(fs.readFileSync(SALIDA, "utf8")) : {};
const plano = (s) => String(s || "").replace(/\*\*?/g, "");

// Sección del mapeo funcional que habla de un módulo («## CC – Cuentas por Cobrar» … hasta el siguiente «## »)
const funcionalDe = (cod) => { const m = new RegExp(`## ${cod} – [\\s\\S]*?(?=\\n## |$)`).exec(FUNC); return m ? m[0].trim() : ""; };

function promptDe(cap) {
  const ops = Object.entries(OPC).filter(([, v]) => v.cap === cap.codigo);
  const pantallas = cap.secciones.flatMap(s => s.items.filter(it => it.desc).map(it => `- ${s.titulo} › ${it.titulo}: ${plano(it.desc).slice(0, 260)}`)).join("\n");
  return { ops, texto: `Eres un consultor experto en el ERP Softland 7.00 (Exactus) y en operadores logísticos (3PL).
OLO Logistics es un 3PL de Costa Rica (CEDI, almacén fiscal y zona franca). En su Softland (compañía OVERSEAS) factura servicios logísticos (almacenaje, manejo en zona franca, flete) en colones y dólares, cobra, paga, lleva inventario de insumos y artículos de sus clientes en régimen, y contabilidad. La factura electrónica va a Hacienda.

Módulo ${cap.codigo} · ${cap.nombre}
${plano(cap.intro)}

${funcionalDe(cap.codigo) ? "Mapeo funcional del módulo:\n" + funcionalDe(cap.codigo) + "\n" : ""}${pantallas ? "Lo que se vio en las pantallas del manual:\n" + pantallas + "\n" : ""}
Para CADA opción de la lista, escribe en español, para alguien NO técnico, qué hace la opción y para qué la usaría OLO:
- 1 o 2 frases, máximo 45 palabras. Empieza con un verbo («Registra…», «Consulta…», «Genera…»).
- Si es una consulta o reporte, di qué muestra y para qué sirve; si es un proceso (cierre, recálculo, carga, purga), di qué cambia y adviértelo («cambia datos de forma masiva»).
- Si su estado es «deshabilitada», «bloqueada» o «vacia», dilo al final («OLO no la tiene habilitada»).
- Opciones de otros países (Guatemala, México, Perú, El Salvador, Honduras, Colombia, Panamá, Ecuador, Rep. Dominicana, Nicaragua): di qué cubre y que no aplica a OLO en Costa Rica.
- No inventes datos, cifras, nombres de clientes ni configuraciones de OLO. Si no estás seguro, di lo que normalmente hace en un ERP y termina con «(a confirmar)».

Responde SOLO con un objeto JSON {"<id>": "<descripción>", ...} con TODOS los id, sin texto adicional.

Opciones (id | carpeta › opción | estado | con captura):
${ops.map(([id, v]) => `${id} | ${v.seccion} › ${v.titulo} | ${v.estado || "normal"} | ${v.img ? "sí" : "no"}`).join("\n")}` };
}

function claude(input) {
  return new Promise((ok) => {
    const p = spawn(`claude -p --model ${MODELO} --output-format json`, { cwd: RAIZ, shell: true });
    let out = "", err = "";
    p.stdout.on("data", d => out += d); p.stderr.on("data", d => err += d);
    const t = setTimeout(() => p.kill(), 15 * 60 * 1000);
    p.on("close", code => { clearTimeout(t); ok({ code, out, err }); });
    p.stdin.end(input);
  });
}

const caps = MAN.capitulos.filter(c => c.codigo !== "00" && (!SOLO || SOLO.has(c.codigo)));
const res = { ...previo }, gasto = { usd: 0, entrada: 0, salida: 0 };
async function uno(cap) {
  const { ops, texto } = promptDe(cap);
  if (!ops.length) return;
  for (let intento = 1; intento <= 2; intento++) {
    const r = await claude(texto);
    let j = null; try { j = JSON.parse(r.out); } catch { /* no JSON */ }
    const bruto = j?.result || "";
    const m = /\{[\s\S]*\}/.exec(bruto);
    let mapa = null; try { mapa = m && JSON.parse(m[0]); } catch { /* JSON mal formado */ }
    if (r.code === 0 && mapa) {
      gasto.usd += Number(j.total_cost_usd) || 0; gasto.salida += j.usage?.output_tokens || 0;
      gasto.entrada += (j.usage?.input_tokens || 0) + (j.usage?.cache_read_input_tokens || 0) + (j.usage?.cache_creation_input_tokens || 0);
      let n = 0; for (const [id] of ops) if (typeof mapa[id] === "string" && mapa[id].trim()) { res[id] = mapa[id].trim(); n++; }
      console.log(`${cap.codigo}: ${n}/${ops.length}`);
      if (n >= ops.length * 0.9) return;
    } else console.log(`${cap.codigo}: intento ${intento} falló (código ${r.code}) ${(r.err || "").slice(0, 160)}`);
  }
}
// 4 módulos a la vez
const cola = [...caps];
await Promise.all(Array.from({ length: 4 }, async () => { while (cola.length) await uno(cola.shift()); }));

fs.writeFileSync(SALIDA, JSON.stringify(Object.fromEntries(Object.keys(OPC).filter(k => res[k]).map(k => [k, res[k]])), null, 1));
const total = Object.keys(OPC).length, hechas = Object.keys(OPC).filter(k => res[k]).length;
console.log(`descripciones ${hechas}/${total} · US$${gasto.usd.toFixed(2)} · tokens ${gasto.entrada} entrada / ${gasto.salida} salida`);

if (!SECO) {
  const env = Object.fromEntries(fs.readFileSync(path.join(RAIZ, ".env"), "utf8").split(/\r?\n/).filter(l => /^\s*[A-Za-z_]+\s*=/.test(l))
    .map(l => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, "")]; }));
  const H = { apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`, "Content-Type": "application/json" };
  // las editadas por el admin no se tocan
  const editadas = new Set((await (await fetch(`${env.SUPABASE_URL}/rest/v1/softland_opciones?select=id&origen=eq.editado`, { headers: H })).json()).map(r => r.id));
  const filas = Object.entries(res).filter(([id]) => OPC[id] && !editadas.has(id)).map(([id, d]) => ({ id, descripcion: d, origen: "inferido", modelo: MODELO, updated_at: new Date().toISOString() }));
  let n = 0;
  for (let i = 0; i < filas.length; i += 200) {
    const r = await fetch(`${env.SUPABASE_URL}/rest/v1/softland_opciones?on_conflict=id`, { method: "POST", headers: { ...H, Prefer: "resolution=merge-duplicates,return=minimal" }, body: JSON.stringify(filas.slice(i, i + 200)) });
    if (!r.ok) throw new Error(`base: ${r.status} ${(await r.text()).slice(0, 200)}`);
    n += filas.slice(i, i + 200).length;
  }
  console.log(`base: ${n} descripciones inferidas escritas · ${editadas.size} editadas por el admin respetadas`);
}
