// ═══════════════════════════════════════════════════════════════════════════
// DATOS · PROCESOS OPERATIVOS — 6 procesos fijos (Inbound, Outbound, ...),
// cada uno con un árbol dinámico Subproceso → Sub-subproceso → Detalle.
// Estos son solo los valores INICIALES — ProcesosOperativosView permite
// agregar/quitar filas en cualquier nivel en tiempo de ejecución (esos
// cambios viven en memoria del navegador, no se guardan aquí todavía).
// ═══════════════════════════════════════════════════════════════════════════
let seq = 0;
const node = (name) => ({ id: `seed-${seq++}`, name, children: [] });

export const PROCESOS_CATEGORIAS = [
  {
    id:"inbound", num:1, label:"Inbound", color:"#2980b9",
    subprocesos: [ node("Recepción"), node("Almacenaje"), node("Recepción") ],
  },
  {
    id:"outbound", num:2, label:"Outbound", color:"#27ae60",
    subprocesos: [ node("Alisto"), node("Empaque/Chequeo"), node("Valor agregado"), node("Transporte"), node("Despacho") ],
  },
  {
    id:"crossdocking", num:3, label:"CrossDocking", color:"#8e44ad",
    subprocesos: [ node("Distribución") ],
  },
  {
    id:"no_nacionalizado", num:4, label:"No Nacionalizado", color:"#d35400",
    subprocesos: [ node("Recibo"), node("Distribución"), node("Almacenaje"), node("Alisto"), node("Despacho") ],
  },
  {
    id:"comercio", num:5, label:"Comercio", color:"#00838f",
    subprocesos: [],
  },
  {
    id:"administrativo", num:6, label:"Administrativo", color:"#7f8c8d",
    subprocesos: [],
  },
];
