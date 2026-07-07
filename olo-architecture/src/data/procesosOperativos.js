// ═══════════════════════════════════════════════════════════════════════════
// DATOS · PROCESOS OPERATIVOS — metadata de los 6 procesos fijos.
// El árbol Subproceso → Sub-subproceso → Detalle (y sus archivos adjuntos)
// vive en Supabase (procesos_nodes / procesos_archivos) — ver
// ProcesosOperativosView.jsx y supabase_procesos_module.sql.
// ═══════════════════════════════════════════════════════════════════════════
export const PROCESOS_CATEGORIAS = [
  { id:"inbound",          num:1, label:"Inbound",          color:"#2980b9" },
  { id:"outbound",         num:2, label:"Outbound",         color:"#27ae60" },
  { id:"crossdocking",     num:3, label:"CrossDocking",     color:"#8e44ad" },
  { id:"no_nacionalizado", num:4, label:"No Nacionalizado", color:"#d35400" },
  { id:"comercio",         num:5, label:"Comercio",         color:"#00838f" },
  { id:"administrativo",   num:6, label:"Administrativo",   color:"#7f8c8d" },
];
