// ═══════════════════════════════════════════════════════════════════════════
// PALETA DE COLORES Y CONSTANTES GLOBALES
// ═══════════════════════════════════════════════════════════════════════════

// Fundación visual compartida del Grupo (estándar de diseño de interfaz):
// Arial, neutros slate + acento navy, sin teal. Todas las herramientas del
// Grupo comparten esta base — solo cambian el isotipo y el contenido.
export const DESIGN = {
  font: "Arial, Helvetica, 'Segoe UI', sans-serif",
  ink: "#0f172a",        // texto principal, títulos, botón primario, acento/activo
  inkSoft: "#475569",    // texto de apoyo, descripciones
  muted: "#64748b",      // metadatos, breadcrumbs, placeholders
  mutedSoft: "#94a3b8",  // separadores textuales (›), notas
  border: "#e2e8f0",     // bordes y divisores por defecto
  borderStrong: "#cbd5e1", // bordes de inputs / hover
  sunken: "#f8fafc",     // fondo de encabezados, filas alternas
  sunken2: "#f1f5f9",    // chips neutros, zonas de agrupación
  surface: "#ffffff",    // fondo de tarjetas y contenido
  navy: "#16233a",       // barras/acentos oscuros opcionales
  radius: 8,
  radiusPill: 999,
  shadowCard: "0 1px 3px rgba(0,0,0,.08)",
  shadowDialog: "0 8px 24px rgba(0,0,0,.12)",
  overlay: "rgba(15,23,42,.45)",
};

export const DESIGN_STATUS = {
  success: { bg:"#ecfdf5", color:"#065f46", border:"#a7f3d0" },
  error:   { bg:"#fef2f2", color:"#991b1b", border:"#fecaca" },
  warning: { bg:"#fffbeb", color:"#7a4f00", border:"#fde68a" },
  critical:{ bg:"#fef2f2", color:"#b91c1c", border:"#fecaca" },
};

export const MODULE_COLORS = {
  AS:"#475569", CG:"#c0392b", CB:"#2980b9", CC:"#27ae60", CP:"#8e44ad",
  FA:"#16a085", CO:"#d35400", CI:"#f39c12", AF:"#7f8c8d", GN:"#e74c3c", MF:"#0284c7",
};

export const OPS_COLORS = { "WMS-D":"#2980b9", "WMS-RF":"#5dade2", "WMH":"#1abc9c", "SORTER":"#ea580c" };

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

// El menú se ordena en 4 capas que siguen el hilo del BPA:
//   Procesos (qué hacemos) → Operación (cómo se hace, en qué pantalla) →
//   Sistemas (con qué) → Datos (dónde queda el dato).
// `layer` solo agrupa visualmente; los ids no cambian, así que los permisos
// por rol (keyed por tab_id) y el enrutado de App.jsx siguen igual.
export const NAV_LAYERS = [
  { id:"procesos",  label:"Procesos",  sub:"qué hacemos" },
  { id:"operacion", label:"Operación", sub:"cómo se hace" },
  { id:"sistemas",  label:"Sistemas",  sub:"con qué" },
  { id:"datos",     label:"Datos",     sub:"dónde queda el dato" },
];
export const TABS = [
  { id:"bpa",          layer:"procesos",  label:"◈ BPA · OLO",           sub:"Modelo de procesos · 30 procesos del diagnóstico + operación logística · madurez, cobertura y avance del levantamiento" },
  { id:"olo-arch",     layer:"procesos",  label:"◇ Procesos",             sub:"Silos · Macroprocesos · Procesos · Subprocesos · fichas de los procedimientos CEDI" },
  { id:"workflows",    layer:"procesos",  label:"⧉ Workflows",            sub:"Plano maestro · cada proceso como flujo de pasos con su sistema, pantalla y rol · qué depende de cada sistema" },
  { id:"ops",          layer:"operacion", label:"◒ Operación",           sub:"eflow WMS (manual de 122 pantallas) · RF · WMH Torre de Control · SORTER CLIRO (Mecalux) · qué dato pasa entre ellos en la operación" },
  { id:"asesor",       layer:"operacion", label:"✦ Asesor de cambios",     sub:"¿Se puede hacer este cambio en el WMS? · veredicto, implicaciones y precedentes con todo lo que sabe el BPA · solicitudes de cambio a ePRAC" },
  { id:"ecosystem",    layer:"sistemas",  label:"◉ Ecosistema",          sub:"Hoy (AS-IS): qué aplicaciones existen y en qué capa · externos · ERP · operación · satélites" },
  { id:"infra",        layer:"sistemas",  label:"▭ Infraestructura TO-BE", sub:"Arquitectura OBJETIVO (a futuro, no la vigente) · eventos en AWS · middleware · Azure · Lago de Datos — la actual está en Ecosistema" },
  { id:"softland",     layer:"sistemas",  label:"⬡ Módulos ERP",         sub:"Módulos de Softland (resumen de sus manuales) + diccionario real de Softland QA de Cofersa: menú, tablas y entidades" },
  { id:"context",      layer:"sistemas",  label:"◐ Contexto",            sub:"Estado del conocimiento · localizaciones · aplicaciones · clientes y reglas · bases de datos · fuentes · glosario · brechas" },
  { id:"integrations", layer:"datos",     label:"⟳ Integraciones",      sub:"Qué dato fluye entre módulos, flujo por flujo · esquemas reales de cada base · backbone SQL" },
  { id:"relaciones",   layer:"datos",     label:"▨ Relaciones de sistemas", sub:"Cómo se relacionan las entidades entre bases distintas · ER por silo · linaje del dato" },
  { id:"monitor",      layer:"datos",     label:"⏱ Monitor",              sub:"Jobs automáticos · frecuencia, modelo de IA, gasto y tiempos de cada uno · cambios detectados en las bases de datos" },
];
