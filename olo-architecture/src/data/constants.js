// ═══════════════════════════════════════════════════════════════════════════
// PALETA DE COLORES Y CONSTANTES GLOBALES
// ═══════════════════════════════════════════════════════════════════════════

export const MODULE_COLORS = {
  AS:"#475569", CG:"#c0392b", CB:"#2980b9", CC:"#27ae60", CP:"#8e44ad",
  FA:"#16a085", CO:"#d35400", CI:"#f39c12", AF:"#7f8c8d", GN:"#e74c3c", MF:"#0284c7",
};

export const OPS_COLORS = { "WMS-D":"#2980b9", "WMS-RF":"#5dade2", "WMH":"#1abc9c" };

export const BPA_AREA_COLORS = {
  estrategicos:{ color:"#27ae60", bg:"#f0faf4", border:"#a8d5bb", label:"Estratégicos", desc:"Dirección, BI, innovación, conocimiento" },
  negocio:{ color:"#f39c12", bg:"#fdfaf0", border:"#e8d58a", label:"Negocio · Misionales", desc:"Cadena de valor: comercialización, transporte, almacenaje, facturación, cobro" },
  apoyo:{ color:"#9b59b6", bg:"#f7f2fa", border:"#d6b8e3", label:"Apoyo", desc:"Finanzas, talento humano, TI, legal, seguridad" },
  control:{ color:"#e67e22", bg:"#fdf6f0", border:"#e8c69f", label:"Control · Mejora", desc:"Calidad, riesgo, satisfacción, mejora continua" },
};

export const STATUS_VIS = {
  confirmed:{ label:"Confirmado", color:"#27ae60", bg:"#e8f5e9", border:"#a5d6a7" },
  partial:{ label:"Parcial", color:"#f39c12", bg:"#fff8e1", border:"#ffd54f" },
  inferred:{ label:"Inferido", color:"#7f8c8d", bg:"#eceff1", border:"#b0bec5" },
  gap:{ label:"Vacío", color:"#c0392b", bg:"#fbe9e7", border:"#ef9a9a" },
  active:{ label:"Activa", color:"#27ae60", bg:"#e8f5e9", border:"#a5d6a7" },
  next:{ label:"Próxima", color:"#f39c12", bg:"#fff8e1", border:"#ffd54f" },
};

export const MATURITY_TINTS = { 0:"#c0392b", 1:"#e67e22", 2:"#f39c12", 3:"#27ae60", 4:"#16a085", 5:"#2980b9" };

export const PRIORITY_LABEL = { 1:"Alta", 2:"Media", 3:"Baja" };

export const CLUSTER_COLORS = {
  "Intermedia":"#6B7280","OLO API":"#059669","ePRAC":"#D97706","Middleware":"#7B1FA2",
  "Suite OLO":"#185FA5","GoRamp":"#059669","Trade":"#d35400","Liq. Viajes":"#185FA5",
  "RFID":"#555555","Raga Orders":"#7B1FA2","Pricing":"#185FA5","CCA":"#5B21B6",
  "Fac. Svc":"#5B21B6","MPF":"#5B21B6","Mayoreo":"#78350F","EPA":"#065F46",
  "Compiere":"#6B7280","OLO System":"#6B7280","TICA":"#475569","Delzof":"#475569",
  "Power BI":"#D97706","Tec. Tiempo":"#94A3B8","eflow":"#185FA5",
};

// `parent` anida el tab bajo otro en el sidebar (ej. Módulos ERP e Integraciones
// dentro de Ecosistema) sin afectar permisos (siguen gateados por su propio
// tab_id) ni el enrutado de contenido en App.jsx (sin cambios).
export const TABS = [
  { id:"bpa",          label:"◈ BPA · OLO",           sub:"Modelo de procesos · 4 áreas · 30 procesos · cobertura por sistema" },
  { id:"olo-arch",     label:"◇ Procesos",             sub:"Inbound · Outbound · CrossDocking · No Nacionalizado · Comercio · Administrativo", parent:"bpa" },
  { id:"infra",        label:"▭ Infraestructura",      sub:"Diagrama operativo · eFlow (CR/VE) · Lago de Datos · Suite OLO · Middleware · Sistemas del Estado", parent:"bpa" },
  { id:"ecosystem",    label:"◉ Ecosistema",          sub:"Mapa de capas: externos · ERP · operación · satélites" },
  { id:"softland",     label:"⬡ Módulos ERP",         sub:"Catálogo de módulos Softland · click para detalle y entidades inferidas", parent:"ecosystem" },
  { id:"integrations", label:"⟳ Integraciones",      sub:"Matriz inter-módulo · qué fluye, en qué dirección, con qué estado", parent:"ecosystem" },
  { id:"ops",          label:"◒ Operación",           sub:"eflow Cloud Suite · WMS Desktop / RF / WMH Torre de Control" },
  { id:"context",      label:"◐ Contexto",            sub:"Localizaciones · puntos de extensión · brechas declaradas" },
];
