// Frecuencia de un job (config.frecuencia de bpa_jobs). La usan el BPA (para
// mostrar y editar) y el despachador (jobs/despachador.js, para decidir si toca
// correr), así las dos partes calculan igual la próxima ejecución.
// Formas: { tipo:"semanal", dias:[1..7 (1=lunes)], hora:"HH:MM" }
//         { tipo:"diaria", hora:"HH:MM" } · { tipo:"cada_horas", horas:N } · { tipo:"cada_minutos", minutos:N }

export const DIAS = ["", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export function describir(f) {
  if (!f) return "—";
  if (f.tipo === "cada_minutos") return `Cada ${f.minutos} min`;
  if (f.tipo === "cada_horas") return f.horas === 1 ? "Cada hora" : `Cada ${f.horas} horas`;
  if (f.tipo === "diaria") return `Todos los días · ${f.hora}`;
  if (f.tipo === "semanal") {
    const d = [...(f.dias || [])].sort();
    const txt = d.join() === "1,2,3,4,5" ? "Lun a Vie" : d.join() === "1,2,3,4,5,6,7" ? "Todos los días" : d.map(x => DIAS[x]).join(", ");
    return `${txt} · ${f.hora}`;
  }
  return "—";
}

// Próxima ejecución estrictamente posterior a `desde` (hora local del equipo)
export function siguiente(f, desde = new Date()) {
  if (!f) return null;
  const t = new Date(desde);
  if (f.tipo === "cada_minutos") return new Date(t.getTime() + f.minutos * 60000);
  if (f.tipo === "cada_horas") return new Date(t.getTime() + f.horas * 3600000);
  const [h, m] = String(f.hora || "00:00").split(":").map(Number);
  const dias = f.tipo === "diaria" ? [1, 2, 3, 4, 5, 6, 7] : (f.dias || []);
  if (!dias.length) return null;
  for (let k = 0; k <= 7; k++) {
    const c = new Date(t); c.setDate(t.getDate() + k); c.setHours(h, m, 0, 0);
    const dia = c.getDay() === 0 ? 7 : c.getDay();
    if (c > t && dias.includes(dia)) return c;
  }
  return null;
}

// ¿Le toca correr ahora? Si nunca corrió, se toma como referencia `creado` (no corre de inmediato)
export function toca(f, ultima, ahora = new Date(), creado = null) {
  const ref = ultima || creado || ahora;
  const prox = siguiente(f, ref);
  return !!prox && prox <= ahora;
}
