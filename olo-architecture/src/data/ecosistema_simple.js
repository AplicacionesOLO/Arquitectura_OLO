// ═══════════════════════════════════════════════════════════════════════════
// DATOS · Ecosistema en palabras simples — para el panel del diagrama de
// conexiones (EcosystemView): qué es cada sistema y qué información pasa por
// cada conexión, pensado para alguien no técnico.
// Las conexiones se describen en el sentido del diagrama (a → b).
// ═══════════════════════════════════════════════════════════════════════════

// Qué es cada sistema, en una o dos frases
export const NODO_SIMPLE = {
  AS: { nombre:"Administración del Sistema", simple:"Es la libreta de datos básicos que usan todos los módulos: monedas, tipos de cambio, países, centros de costo, usuarios y permisos." },
  CG: { nombre:"Contabilidad General", simple:"Es la contabilidad de OLO. Todo movimiento con dinero termina aquí como un asiento, y de aquí salen el balance y el estado de resultados." },
  CB: { nombre:"Control Bancario", simple:"Son las cuentas de banco de OLO: depósitos, pagos, transferencias, cheques y la conciliación contra el estado de cuenta del banco." },
  CC: { nombre:"Cuentas por Cobrar", simple:"Lo que los clientes le deben a OLO. Cada factura queda aquí como pendiente hasta que el cliente paga." },
  CP: { nombre:"Cuentas por Pagar", simple:"Lo que OLO le debe a sus proveedores: facturas por pagar, cheques y transferencias." },
  FA: { nombre:"Facturación", simple:"Donde OLO emite sus facturas a los clientes por los servicios logísticos: almacenaje, manejo en zona franca, flete." },
  CO: { nombre:"Compras", simple:"Las compras de OLO: solicitudes, órdenes de compra y la recepción de lo comprado." },
  CI: { nombre:"Inventarios", simple:"El catálogo de artículos y servicios de OLO, con sus existencias por bodega y su costo." },
  DE: { nombre:"Documentos Electrónicos", simple:"Es el «cartero» de la factura electrónica: toma cada factura, la firma, la envía a Hacienda y le manda el PDF al cliente." },
  CR: { nombre:"Control Presupuestal", simple:"El presupuesto: cuánto se planea gastar por partida y cuánto se lleva gastado." },
  RP: { nombre:"Reporteador", simple:"Herramienta para armar reportes propios con datos de todos los módulos." },
  AF: { nombre:"Activos Fijos", simple:"Los bienes de OLO (equipo, vehículos, montacargas…) y cuánto se deprecian cada mes." },
  GN: { nombre:"Gestión de Nómina", simple:"La planilla: empleados, salarios, vacaciones y cargas sociales (CCSS, INS)." },
  MF: { nombre:"Monitor Fiscal", simple:"Calcula el IVA del mes y prepara la declaración D104 para Hacienda." },
  CCH:{ nombre:"Caja Chica", simple:"La caja chica: vales de gastos menores y sus reintegros." },
  RH: { nombre:"Recursos Humanos", simple:"Módulo del producto Softland para gestión de personal. OLO no lo tiene en su menú." },
  PY: { nombre:"Control de Proyectos", simple:"Módulo del producto Softland para costear proyectos. OLO no lo tiene en su menú." },
  FC: { nombre:"Flujo de Caja", simple:"Módulo del producto Softland para proyectar el efectivo. OLO no lo tiene en su menú." },
  POS:{ nombre:"Punto de Venta", simple:"Módulo del producto Softland para ventas en mostrador. OLO no lo tiene en su menú." },
  FR: { nombre:"Facturación de Rutero", simple:"Módulo del producto Softland para facturar en ruta. OLO no lo tiene en su menú." },
  AC: { nombre:"Administración de Contratos", simple:"Módulo del producto Softland para contratos recurrentes. OLO no lo tiene en su menú." },
  eIntegra:{ nombre:"eIntegra", simple:"Es el «traductor» entre el ERP de cada cliente y el almacén: le pasa al WMS los pedidos del cliente y le devuelve al cliente lo que ya se cerró." },
  "WMS-D": { nombre:"eFlow WMS · escritorio", simple:"El sistema del almacén en la computadora: aquí entran las órdenes, se controla el inventario y se crean las tareas para el piso." },
  "WMS-RF":{ nombre:"eFlow WMS · handheld", simple:"La app del teléfono o pistola que usan los operarios en el piso: reciben, ubican, alistan y cargan escaneando." },
  WMH: { nombre:"Torre de Control (WMH)", simple:"Arma los viajes de reparto: decide camión, chofer, ruta y prioridad, y sigue la salida de la mercancía." },
  SORTER:{ nombre:"SORTER CLIRO (Mecalux)", simple:"La máquina clasificadora: reparte automáticamente las cajas de EPA según la tienda a la que van." },
  Apolo:{ nombre:"Apolo", simple:"App móvil con la que se registra, con fotos, cada tarima que sale hacia las tiendas de EPA." },
  Hacienda:{ nombre:"Ministerio de Hacienda", simple:"Recibe y aprueba cada factura electrónica de OLO y la declaración mensual del IVA." },
  "SFL-CLI":{ nombre:"Softland del cliente", simple:"Es el Softland propio de cada cliente (por ejemplo Cofersa), donde el cliente hace sus pedidos y compras. Es distinto del de OLO." },
  EDI: { nombre:"Portal de clientes / EDI", simple:"Un portal o intercambio electrónico por el que los clientes mandarían pedidos. Se supone que existe; no está documentado." },
  Aduanas:{ nombre:"Sistema aduanero", simple:"El sistema de trámites de aduana (TICA). Se supone que existe; no está documentado." },
  TMSI:{ nombre:"TMS internacional", simple:"Un sistema para el transporte internacional. Se supone que existe; no está documentado." },
  BI: { nombre:"BI / Data Warehouse", simple:"Un repositorio para análisis e indicadores. Hoy no existe o no está documentado." },
  ZF: { nombre:"Zona Franca (SEL)", simple:"El sistema de control del régimen de zona franca. Se supone que existe; no está documentado." },
};

// Qué información pasa por cada conexión (a → b). Las que no están aquí usan una regla general.
const QUE = {
  "FA|CC": "Cada factura que emite OLO queda como cuenta por cobrar al cliente.",
  "FA|CI": "Al facturar se rebaja del inventario el artículo o servicio facturado.",
  "CO|CP": "La factura del proveedor de cada compra queda como cuenta por pagar.",
  "CO|CI": "Lo comprado entra al inventario con su costo.",
  "FA|DE": "Cada factura pasa a Documentos Electrónicos para firmarla y enviarla a Hacienda.",
  "DE|CP": "Las facturas electrónicas que mandan los proveedores se reciben aquí y se aceptan o rechazan antes de pagarlas.",
  "DE|Hacienda": "Envía cada factura firmada y recibe la respuesta de Hacienda: aceptada o rechazada.",
  "MF|Hacienda": "Prepara la declaración mensual del IVA (D104) que se presenta a Hacienda.",
  "CR|CG": "Compara lo que la contabilidad registra como gasto contra el presupuesto.",
  "CR|CO": "Revisaría si una compra tiene presupuesto disponible antes de aprobarla.",
  "RP|CG": "Toma datos (por ejemplo, los contables) para armar reportes propios.",
  "SFL-CLI|eIntegra": "Los pedidos y compras del cliente salen de su Softland hacia eIntegra. Cómo exactamente, no está documentado.",
  "eIntegra|WMS-D": "Crea en el almacén las órdenes de recepción y de despacho del cliente, y le devuelve los cierres.",
  "FA|WMS-D": "Del lado del cliente: sus pedidos se vuelven órdenes de despacho en el almacén.",
  "CO|WMS-D": "Del lado del cliente: sus compras se vuelven órdenes de recepción en el almacén.",
  "WMS-D|WMS-RF": "El escritorio crea las tareas (alistar, reponer, ubicar) y el handheld las ejecuta en el piso; el inventario se actualiza al momento.",
  "WMS-D|WMH": "El WMS le pasa a la Torre los pedidos listos para salir; la Torre arma el viaje y devuelve su número.",
  "SORTER|WMH": "Podrían compartir las mismas 7 salidas («bajadas») de despacho. Falta confirmarlo.",
  "WMS-D|SORTER": "Las recepciones de EPA que están en el WMS se clasifican en el sorter por tienda.",
  "SORTER|Apolo": "Lo que el sorter clasificó por tienda se despacha registrando cada tarima con fotos en Apolo.",
  "Apolo|WMS-D": "La salida a tienda se cierra con «Carga Camión» en el WMS.",
  "CC|CB": "Cuando el cliente paga, el dinero entra a una cuenta de banco y se concilia.",
  "CP|CB": "Los pagos a proveedores salen de una cuenta de banco (cheque o transferencia).",
  "GN|CB": "El pago de la planilla sale de una cuenta de banco.",
  "CCH|CB": "Los reintegros de caja chica salen de una cuenta de banco.",
};

// Descripción de la conexión a → b
export function queConexion(a, b) {
  if (QUE[`${a}|${b}`]) return QUE[`${a}|${b}`];
  const nb = NODO_SIMPLE[b]?.nombre || b, na = NODO_SIMPLE[a]?.nombre || a;
  if (a === "AS") return `Le da a ${nb} los datos básicos que usa: monedas, tipos de cambio, centros de costo, países.`;
  if (b === "CG") return `Cada movimiento de ${na} se registra como un asiento en la contabilidad.`;
  if (b === "MF") return `Le pasa al Monitor Fiscal el IVA de sus documentos para la declaración del mes.`;
  if (b === "CB") return `Los pagos o cobros de ${na} se reflejan en las cuentas de banco.`;
  if (["EDI", "Aduanas", "TMSI", "BI", "ZF"].includes(a)) return `Se supone que ${na} se conecta con ${nb} por cómo opera un operador logístico, pero no hay documento que lo confirme.`;
  return `${na} le pasa información a ${nb}.`;
}
