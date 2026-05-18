import { useState } from "react";

// ═══════════════════════════════════════════════════════════════════════════
// DATOS · MÓDULOS SOFTLAND
// ═══════════════════════════════════════════════════════════════════════════
const SOFTLAND_MODULES = [
  { code:"AS", name:"Administración del Sistema", role:"Maestros transversales", status:"partial", purpose:"Provee tablas base usadas por todos los demás módulos. Confirmado por integración en CB, CC, CP, FA, CO, CI, AF, GN, MF. Sin manual propio en el corpus accesible.", entities:["Moneda","Denominacion","TipoCambio","Pais","EntidadFinanciera","CategoriaCliente","CategoriaProveedor","CondicionPago","TarjetaCredito","Vendedor","Cobrador","Zona","Ruta","NivelPrecio","NIT","CodigoImpuesto","ConsecutivoGlobal","CentroCosto","Departamento","Bodega","PeriodoContable","ExcepcionD104"] },
  { code:"CG", name:"Contabilidad General", role:"Corazón financiero", status:"confirmed", purpose:"Manual lo describe textualmente como 'corazón del área financiera del ERP'. Recibe asientos automáticos de CB, CC, CP, FA, CO, CI, AF, GN, MF. Define paquetes contables, tipos de transacción contable, cuadro de cuentas, contabilidad fiscal vs corporativa, FASB-52, transacciones recurrentes, distribuidas, diferidos, anulación, reversión.", entities:["PaqueteContable","TipoTransaccionContable","CuentaContable","AsignacionCentroCuenta","TransaccionContable","TransaccionRecurrente","TransaccionDistribuida","Diferido","AmortizacionDiferido","EventoContable","ReporteContable","PeriodoContable"] },
  { code:"CB", name:"Control Bancario", role:"Tesorería", status:"confirmed", purpose:"Cuentas bancarias, conciliación bancaria (libros vs bancos), documentos de crédito/depósito/débito, cheques, cheques recurrentes, solicitudes de cheque, transferencias electrónicas (TEF), conciliación inicial. Carga movimientos de CC, CP, GN, RH, Caja Chica, Proyectos.", entities:["CuentaBancaria","Documento","MovimientoLibros","MovimientoBancos","Cheque","ChequeRecurrente","SolicitudCheque","Deposito","TransferenciaElectronica","Conciliacion","SubtipoDocumento","TipoCuenta"] },
  { code:"CC", name:"Cuentas por Cobrar", role:"Auxiliar de clientes", status:"confirmed", purpose:"Maestro de clientes, documentos por cobrar (factura, NC, ND, recibos), aplicación de pagos, contrarrecibos, convenios, carga masiva, retenciones, intereses de mora, análisis de antigüedad y vencimiento, libros de ventas por país.", entities:["Cliente","DireccionEmbarque","ContactoCliente","VendedorCliente","Documento","Aplicacion","Contrarecibo","Convenio","Retencion","InteresMora","PlanPagos","SaldoCliente"] },
  { code:"CP", name:"Cuentas por Pagar", role:"Auxiliar de proveedores", status:"confirmed", purpose:"Maestro de proveedores, documentos por pagar (factura, NC, ND, intereses), cheques, TEF, contrarrecibos, retenciones, aprobación de pagos, generación de facturas de compras, manejo de días de revisión, libros de compras y reportes fiscales por país.", entities:["Proveedor","CuentaBancariaProveedor","Documento","Aplicacion","Contrarecibo","Cheque","TransferenciaElectronica","Retencion","CodigoIngreso","SaldoProveedor"] },
  { code:"FA", name:"Facturación", role:"Origen de ventas", status:"confirmed", purpose:"Pedidos, facturación, remisiones, devoluciones, cotizaciones, despachos, anticipos, ensambles, descuentos y bonificaciones por reglas, paquetes de descuentos, retenciones, anulaciones. Reserva existencias en CI, transfiere facturas a crédito a CC y genera asientos de Ventas y Costo de Ventas en CG.", entities:["Cliente","Pedido","DetallePedido","Factura","Remision","Cotizacion","Devolucion","Despacho","Anulacion","VersionPrecio","NivelPrecios","ReglaDescuento","EscalaBonificacion","PaqueteDescuentoBonificacion","EnsambleArticulo","ExcepcionDescuentoCliente","Caja","Anticipo"] },
  { code:"CO", name:"Compras", role:"Procurement / abastecimiento", status:"confirmed", purpose:"Solicitudes, órdenes, embarques, liquidaciones de compra, pedidos sugeridos, planificadores de compras, evaluación de proveedores, aranceles, gastos de importación, pronósticos de venta. Genera factura de compra con embarque a CP. Actualiza existencias en CI.", entities:["Proveedor","Comprador","Gasto","Impuesto","Arancel","DireccionEmbarque","RangoAutorizacion","MontoAutorizacion","Solicitud","OrdenCompra","Embarque","LiquidacionCompra","PedidoSugerido","DocumentoCompra","EvaluacionProveedor","PlanificadorCompras","PronosticoVentas","DatoCompraArticulo","ArticuloProveedor"] },
  { code:"CI", name:"Control de Inventario", role:"Inventario contable", status:"confirmed", purpose:"Maestro de artículos (con bodegas, lotes, números de serie, alternos, capas de costo), unidades de medida, clasificaciones, cuentas contables por artículo, transacciones por paquete y en línea, despachos, lotes y aprobación/vencimiento, transacciones configurables.", entities:["Articulo","ArticuloAlterno","ArticuloBodega","Lote","NumeroSerie","PlantillaNumeroSerie","UnidadMedida","Clasificacion","ClasificacionAdicional","ImpuestoAdicional","CuentaContableArticulo","TransaccionConfigurable","Paquete","DocumentoInventario","TransaccionLinea","Despacho","AutorizacionCompraExenta","AutorizacionVentaExenta","CapaCosto","ConsecutivoCI"] },
  { code:"AF", name:"Activos Fijos", role:"Patrimonio", status:"confirmed", purpose:"Maestro de activos, mejoras, depreciación, revaluación, retiro, desmantelamiento, deterioro, índices de precios, asignación de centros de costo, depreciación mensual automática con asiento contable. Integra directamente con CG y CO.", entities:["ActivoFijo","TipoActivo","Mejora","AccionActivo","EstadoActivo","TipoAccion","IndicePrecio","AsignacionCentroCosto","HistoricoRevaluacion","HistoricoDepreciacion","TipoObservacion"] },
  { code:"GN", name:"Gestión de Nómina", role:"Planilla / payroll", status:"confirmed", purpose:"Versión actual de Control de Nómina. Clases de nómina, conceptos, departamentos, puestos, horarios, empleados, procesamiento de nóminas, liquidación de aportes, descuentos a empleados, marcas de reloj, horas laboradas, ajustes y anulaciones de pago, nóminas electrónicas.", entities:["Empleado","ClaseNomina","Concepto","GrupoConcepto","Departamento","EstadoEmpleado","Horario","Puesto","PuestoExterno","ClaseSeguroSocial","LiquidacionAporte","CuentaContableConcepto","LiquidacionPagoDescuento","InformacionCotizante","Administradora","HistoricoProyecto","CentroTrabajo","AdicionalEmpleado","AdicionalNomina","ConstanteCalculo","CodigoIngreso","FormaPagoNominaElectronica","MedioPagoNominaElectronica","PeriodoNominaElectronica","TipoTrabajadorNE","SubtipoTrabajadorNE","TipoHorasExtraNE","MarcaReloj","RegistroHoras","NotaNomina"] },
  { code:"MF", name:"Monitor Fiscal", role:"Cumplimiento IVA / prorrata", status:"confirmed", purpose:"Cálculo del índice de proporcionalidad (prorrata) por tarifa, liquidación mensual del IVA, IVA acreditable / no acreditable / por ajustar, libros de ventas y compras, declaración D104 (Costa Rica · Ministerio de Hacienda), cierre mensual con asiento contable a CG.", entities:["ProporcionalidadEstimada","IndiceProporcionalidadReal","CierreMensual","DetalleCierre","AsientoCierre","ActividadEconomica","ExcepcionD104"] },
  { code:"RH", name:"Recursos Humanos / Capital Humano", role:"Gestión de personal", status:"partial", purpose:"Confirmado por integración en CO, AF y GN. Capital Humano se posiciona como reemplazo / extensión de funciones de GN. Sin manual propio en corpus.", entities:["Empleado","Plaza"] },
  { code:"CCH", name:"Caja Chica", role:"Caja menor", status:"partial", purpose:"Confirmado por integración en CB y MF. Vinculado a cuenta bancaria de CB; vales con afectación IVA hacia MF.", entities:["Vale"] },
  { code:"PY", name:"Control de Proyectos", role:"Gestión de proyectos", status:"partial", purpose:"Confirmado por integración en CB (cheques/TEF de subcontratos), CO (presupuesto por fase) y GN (horas laboradas por fase).", entities:["Proyecto","Fase"] },
  { code:"FC", name:"Flujo de Caja", role:"Cash forecast", status:"partial", purpose:"Confirmado por integración en CB y CC. Toma saldos bancarios y transacciones de clientes/proveedores.", entities:[] },
  { code:"POS", name:"Punto de Venta", role:"Retail / mostrador", status:"partial", purpose:"Confirmado por integración en MF. Genera apartados, facturación y devoluciones que alimentan a MF para cálculo de IVA.", entities:["Apartado","Factura","Devolucion"] },
  { code:"FR", name:"Facturación de Rutero", role:"Facturación móvil en ruta", status:"partial", purpose:"Confirmado por integración en MF. Genera facturas y devoluciones desde rutas comerciales.", entities:[] },
  { code:"AC", name:"Administración de Contratos", role:"Servicios recurrentes", status:"partial", purpose:"Confirmado por integración en MF. Facturación de contratos.", entities:[] },
];

const OPS_MODULES = [
  { code:"WMS-D", name:"eflow WMS · Desktop", vendor:"eco-efficiency", purpose:"Núcleo del CEDI. Catálogos (artículos, proveedores, clientes, unidades de transporte), Documentos (Órdenes de Recepción/Expedición, Asignación Camión, Carga Camión, Servicios Especiales), Inventario (inicial, ajuste, tomas físicas), Configuración (zonas, almacenamientos, ubicaciones, rutas y secuencias de picking), Reportes, Seguridad." },
  { code:"WMS-RF", name:"eflow WMS · RF (PDT)", vendor:"eco-efficiency", purpose:"Terminales handheld Android. Cuatro flujos: Recibo (validación general, recepción, IRB), Almacenaje (almacenamiento de recepciones, traslados), Picking/Despacho/Reposiciones (carga camión, trabajo automático), Inventario (toma física, ajustes)." },
  { code:"WMH", name:"WMH Torre de Control", vendor:"eflow Cloud Suite v4.17.0.2", purpose:"Web app de monitoreo en tiempo real. Catálogos de transporte (almacenes, bajadas, choferes, compañías, rutas, unidades, zonas de distribución), Documentos (órdenes, visor de viajes), Reportes de Viaje, Seguridad (reglas FLOW del sistema, usuarios)." },
];

const SATELLITE_MODULES = [
  { name:"Sistema Aduanero (TICA o equivalente)", purpose:"Soporta proceso 'Administración de procesos aduaneros' en BPA OLO. Sistema NO documentado.", status:"inferred" },
  { name:"Sistema de Zona Franca (régimen SEL)", purpose:"Soporta proceso 'Gestión de Internamiento Zona Franca SEL'. Sistema NO documentado.", status:"inferred" },
  { name:"TMS Internacional", purpose:"WMH cubre transporte de distribución local. Para 'Gestión de transporte internacional' debe existir un sistema separado o servicio externo. NO documentado.", status:"inferred" },
  { name:"Mecalux (sistema de almacenaje automatizado)", purpose:"Regla MECALUX (FLOW) confirmada en WMH; módulo Bajadas dedica viajes a Mecalux. Integración técnica NO documentada.", status:"partial" },
  { name:"Portal de clientes / EDI", purpose:"Típico en operación 3PL para órdenes y forecasts. NO documentado.", status:"inferred" },
  { name:"BI / Data Warehouse", purpose:"Proceso 'Inteligencia de negocio' aparece en BPA con madurez 1. Sistema NO implementado / NO documentado.", status:"inferred" },
  { name:"Portal de Personas / Capital Humano", purpose:"Mencionado en manual de GN como punto de integración para autoservicio de empleados (consulta de pagos). NO confirmado si está implementado.", status:"partial" },
];

const INTEGRATIONS = [
  { from:"AS", to:"CG", what:"Centros de costo, períodos contables, monedas, NIT", status:"confirmed" },
  { from:"AS", to:"CB", what:"Monedas, países, entidades financieras, tipos de cambio", status:"confirmed" },
  { from:"AS", to:"CC", what:"Categorías cliente, países, NIT, condiciones pago, vendedores, cobradores", status:"confirmed" },
  { from:"AS", to:"CP", what:"Categorías proveedor, NIT, códigos de impuesto, consecutivos", status:"confirmed" },
  { from:"AS", to:"FA", what:"Tablas de datos, periodos contables", status:"confirmed" },
  { from:"AS", to:"CO", what:"Países, tipos de cambio, códigos/% de impuestos, monedas", status:"confirmed" },
  { from:"AS", to:"CI", what:"Bodegas, localizaciones, códigos de impuesto, centros de costo", status:"confirmed" },
  { from:"AS", to:"AF", what:"Monedas, denominaciones, tipos de cambio, centros de costo", status:"confirmed" },
  { from:"AS", to:"GN", what:"Monedas, tipos de cambio, países, ubicaciones, centros de costo, períodos", status:"confirmed" },
  { from:"CG", to:"*", what:"Recibe asientos automáticos de todos los módulos transaccionales", status:"confirmed" },
  { from:"CB", to:"CG", what:"Asientos automáticos por documento", status:"confirmed" },
  { from:"CC", to:"CG", what:"Asientos por país o categoría de cliente", status:"confirmed" },
  { from:"CP", to:"CG", what:"Asientos por país o categoría de proveedor", status:"confirmed" },
  { from:"FA", to:"CG", what:"Asientos de Ventas y Costo de Ventas", status:"confirmed" },
  { from:"CO", to:"CG", what:"Asientos de transacciones de compra", status:"confirmed" },
  { from:"CI", to:"CG", what:"Asientos de movimientos de inventario", status:"confirmed" },
  { from:"AF", to:"CG", what:"Asientos automáticos de depreciación, revaluación, retiro", status:"confirmed" },
  { from:"GN", to:"CG", what:"Asientos de cálculo y pago de nómina", status:"confirmed" },
  { from:"MF", to:"CG", what:"Asiento de cierre mensual de IVA (paquete MF)", status:"confirmed" },
  { from:"FA", to:"CC", what:"Carga de Facturas y Devoluciones a cuentas por cobrar", status:"confirmed" },
  { from:"FA", to:"CI", what:"Reserva de artículos · actualización de existencias por venta/devolución", status:"confirmed" },
  { from:"CO", to:"CP", what:"Generación de factura de compra con embarque", status:"confirmed" },
  { from:"CO", to:"CI", what:"Actualización de existencias por recepción de proveedor", status:"confirmed" },
  { from:"CO", to:"RH", what:"Compradores tomados de empleados", status:"confirmed" },
  { from:"CO", to:"PY", what:"Solicitudes/órdenes/embarques con proyecto+fase", status:"confirmed" },
  { from:"CC", to:"CB", what:"Depósitos y TEF de clientes que aumentan saldo bancario", status:"confirmed" },
  { from:"CP", to:"CB", what:"Cheques y TEF a proveedores que disminuyen saldo bancario", status:"confirmed" },
  { from:"CCH", to:"CB", what:"Movimientos de caja chica vinculados a cuenta bancaria", status:"confirmed" },
  { from:"PY", to:"CB", what:"Cheques y TEF de pagos de subcontratos", status:"confirmed" },
  { from:"GN", to:"CB", what:"Cheques y TEF de planilla y aportes", status:"confirmed" },
  { from:"RH", to:"CB", what:"Cheques y TEF de liquidaciones de empleados", status:"confirmed" },
  { from:"GN", to:"CP", what:"Liquidaciones de pago a proveedores por compras de empleados", status:"confirmed" },
  { from:"AF", to:"CP", what:"Proveedores asociados a activos", status:"confirmed" },
  { from:"AF", to:"CO", what:"Activos generados por compras", status:"confirmed" },
  { from:"FC", to:"CB", what:"Toma saldo de cuentas bancarias", status:"confirmed" },
  { from:"FC", to:"CC", what:"Toma transacciones de clientes participantes", status:"confirmed" },
  { from:"POS", to:"MF", what:"Apartados, facturas y devoluciones para cálculo IVA", status:"confirmed" },
  { from:"FR", to:"MF", what:"Facturas y devoluciones desde ruteo", status:"confirmed" },
  { from:"AC", to:"MF", what:"Facturación de contratos", status:"confirmed" },
  { from:"FA", to:"MF", what:"Pedidos facturados, facturación, devoluciones", status:"confirmed" },
  { from:"CC", to:"MF", what:"Documentos con afectación IVA", status:"confirmed" },
  { from:"CP", to:"MF", what:"Documentos con afectación IVA", status:"confirmed" },
  { from:"CO", to:"MF", what:"Órdenes y embarques con afectación IVA en factura", status:"confirmed" },
  { from:"CCH", to:"MF", what:"Vales con impuestos y afectación IVA", status:"confirmed" },
  { from:"ERP", to:"WMS-D", what:"Órdenes de Recepción tipos RECERP/RECTRA/RECDEV (cabecera+detalle)", status:"confirmed" },
  { from:"ERP", to:"WMS-D", what:"Órdenes de Expedición / Salida (cabecera+detalle)", status:"confirmed" },
  { from:"WMS-D", to:"ERP", what:"Cierre de Orden de Recepción (situación CERR)", status:"confirmed" },
  { from:"WMS-D", to:"ERP", what:"Cierre de Orden de Expedición post-despacho", status:"inferred" },
  { from:"WMS-D", to:"WMS-RF", what:"Sincronización en tiempo real de tareas y stock", status:"confirmed" },
  { from:"WMS-D", to:"WMH", what:"Datos de viajes, unidades de transporte y órdenes", status:"inferred" },
  { from:"ERP", to:"Mecalux", what:"Regla FLOW MECALUX habilita comportamiento por cliente", status:"partial" },
  { from:"EDI", to:"ERP", what:"Recepción de órdenes/forecasts de clientes 3PL", status:"inferred" },
  { from:"ERP", to:"Aduanas", what:"Integración con sistema aduanero (TICA)", status:"inferred" },
  { from:"ERP", to:"BI", what:"Extracción para reportería avanzada", status:"inferred" },
];

const BPA_PROCESSES = {
  estrategicos: [
    { name:"Planificación Estratégica", maturity:1, priority:1, owner:"Ignacio Vieto", coverage:[], note:"Sin sistema documentado." },
    { name:"Inteligencia de Negocios", maturity:1, priority:3, owner:"—", coverage:[], note:"Sistema BI no implementado." },
    { name:"Innovación", maturity:1, priority:3, owner:"—", coverage:[] },
    { name:"Gestión del Conocimiento", maturity:1, priority:3, owner:"—", coverage:[] },
  ],
  negocio: [
    { name:"Gestión de Comercialización", maturity:1, priority:1, owner:"—", coverage:["FA"] },
    { name:"Toma de Requerimientos de Clientes", maturity:1, priority:1, owner:"—", coverage:[], note:"Perfiles de cliente en drive." },
    { name:"Gestión de Transporte Local", maturity:1, priority:1, owner:"—", coverage:["WMH"] },
    { name:"Gestión de Transporte Internacional", maturity:1, priority:1, owner:"—", coverage:[], note:"Sin TMS internacional documentado." },
    { name:"Gestión de Internamiento Zona Franca SEL", maturity:1, priority:1, owner:"—", coverage:[], note:"Sin sistema dedicado documentado." },
    { name:"Administración de Procesos Aduaneros", maturity:1, priority:1, owner:"—", coverage:[], note:"Sin integración aduanera documentada." },
    { name:"Gestión de Almacenamiento (ZF + nacional)", maturity:1, priority:1, owner:"Gerente CEDI · vacante", coverage:["WMS-D","WMS-RF"] },
    { name:"Servicios de Valor Agregado", maturity:1, priority:1, owner:"Gerente CEDI · vacante", coverage:[], note:"Drive de valor agregado · sin sistema." },
    { name:"Administración Financiera Contable a Clientes", maturity:1, priority:1, owner:"Jorge Castro", coverage:["CG","CC"] },
    { name:"Servicio de Gestión de Talento al Cliente", maturity:1, priority:1, owner:"Mary Montanes", coverage:[] },
    { name:"Facturación", maturity:1, priority:1, owner:"Isabella López", coverage:["FA","MF"], note:"Manual interno: 'creación de pedido en Softland'." },
    { name:"Cobro", maturity:1, priority:1, owner:"Jorge Castro", coverage:["CC","CB"] },
    { name:"Seguimiento y Control de la Operación", maturity:1, priority:1, owner:"Ignacio Vieto", coverage:["WMH"] },
    { name:"Gestión de Relación con Clientes", maturity:1, priority:1, owner:"—", coverage:[] },
  ],
  apoyo: [
    { name:"Gestión Financiero Contable Interna", maturity:1, priority:2, owner:"Jorge Castro", coverage:["CG","CB","CC","CP","AF","MF"] },
    { name:"Gestión del Talento Humano Interna", maturity:3, priority:2, owner:"Mary Montanes", coverage:["GN","RH"], note:"Mejor madurez del BPA · normas tropicalizables desde mayoreo." },
    { name:"Gestión de TI", maturity:1, priority:2, owner:"José Palencia", coverage:[], note:"Documentación pendiente de revisar." },
    { name:"Gestión de Servicios Generales (Compras / Mant.)", maturity:1, priority:3, owner:"Mary Montanes", coverage:["CO","CI"] },
    { name:"Salud y Seguridad Ocupacional", maturity:2, priority:3, owner:"Mary Montanes", coverage:[] },
    { name:"Gestión Legal Regulatoria", maturity:1, priority:3, owner:"Jorge Castro", coverage:["MF"] },
    { name:"Seguridad Física", maturity:1, priority:3, owner:"Mary Montanes", coverage:[] },
  ],
  control: [
    { name:"Gestión de Calidad", maturity:0, priority:3, owner:"—", coverage:[] },
    { name:"Atención de Quejas y Satisfacción de Clientes", maturity:1, priority:3, owner:"—", coverage:[] },
    { name:"Gestión de Revisoría", maturity:1, priority:3, owner:"—", coverage:["CG"] },
    { name:"Gestión del Riesgo", maturity:1, priority:3, owner:"—", coverage:[] },
    { name:"Mejora Continua", maturity:0, priority:3, owner:"—", coverage:[] },
  ],
};

const EXTENSION_POINTS = [
  { type:"Hooks", detail:"CB: Generación de Asientos Contables, Carga Automática de Datos. CC: Plan de Pagos, Asientos Contables. CP: análogos. AF: Reporte de Impuesto sobre la Renta, Reporte de Impuesto a los Activos." },
  { type:"Archivos *.ini", detail:"exactus.ini y CB/CC/CP/AF_*.ini definen comportamiento (ej. CC_FechaDeAplicacion, CP_DescProntoPagoFinal, AF_TCambioFechaAdquisicion, ImprimirMontoConMoneda)." },
  { type:"Plantillas XSLT", detail:"CB documenta herramienta de pruebas de archivos XSLT — usada para conversión / generación de documentos." },
  { type:"Carga masiva", detail:"CC documenta carga masiva de documentos (manual y automática). CO carga pronósticos desde Excel via cargador dinámico. Punto natural de integración batch." },
  { type:"Reportes ASCII", detail:"CP genera archivos ASCII para transferencias bancarias — formato típico para subir a banca electrónica." },
  { type:"Transacciones configurables (CI)", detail:"Cualquier tipo de movimiento de inventario puede configurarse con plantilla, números de serie, lotes y reglas contables." },
  { type:"Excepciones D104 (MF)", detail:"Mantenimiento dedicado en AS para sobreescribir actividad económica por (Cliente, Artículo, Tarifa)." },
];

const LOCALIZATIONS = [
  { country:"Costa Rica", status:"active", detail:"BNCR · Ministerio de Hacienda · D104 · Ley 9635 · Monitor Fiscal calibrado" },
  { country:"Venezuela", status:"next", detail:"Próxima expansión · pendiente identificar SENIAT · IVA · libros fiscales" },
];

const GAPS = [
  "Mecanismo concreto de la interfaz Softland↔eflow (batch / WS / archivos / BD intermedia / cola).",
  "Modelo físico de stock real en eflow WMS — confirmado funcionalmente, no estructuralmente.",
  "Manuales pendientes en el corpus accesible: Administración del Sistema (AS), Punto de Venta (POS), Facturación de Rutero (FR), Administración de Contratos (AC), Capital Humano, Caja Chica, Control de Proyectos, Flujo de Caja.",
  "Existencia, marca y endpoints de TMS internacional, sistema aduanero (TICA) y portal de clientes / EDI.",
  "Modo de sincronización eflow WMS ↔ WMH Torre de Control — los conceptos compartidos sugieren BD común o sync API.",
  "Funcionamiento del módulo 'Servicios Especiales' del WMS — listado pero no documentado en el corpus accesible.",
  "Para expansión a Venezuela: requerimientos SENIAT, formatos de libros fiscales VE, configuración de Monitor Fiscal para tarifas IVA venezolanas.",
];

// ═══════════════════════════════════════════════════════════════════════════
// PALETA
// ═══════════════════════════════════════════════════════════════════════════
const MODULE_COLORS = {
  AS:"#475569", CG:"#c0392b", CB:"#2980b9", CC:"#27ae60", CP:"#8e44ad",
  FA:"#16a085", CO:"#d35400", CI:"#f39c12", AF:"#7f8c8d", GN:"#e74c3c", MF:"#0284c7",
};
const OPS_COLORS = { "WMS-D":"#2980b9", "WMS-RF":"#5dade2", "WMH":"#1abc9c" };
const BPA_AREA_COLORS = {
  estrategicos:{ color:"#27ae60", bg:"#f0faf4", border:"#a8d5bb", label:"Estratégicos", desc:"Dirección, BI, innovación, conocimiento" },
  negocio:{ color:"#f39c12", bg:"#fdfaf0", border:"#e8d58a", label:"Negocio · Misionales", desc:"Cadena de valor: comercialización, transporte, almacenaje, facturación, cobro" },
  apoyo:{ color:"#9b59b6", bg:"#f7f2fa", border:"#d6b8e3", label:"Apoyo", desc:"Finanzas, talento humano, TI, legal, seguridad" },
  control:{ color:"#e67e22", bg:"#fdf6f0", border:"#e8c69f", label:"Control · Mejora", desc:"Calidad, riesgo, satisfacción, mejora continua" },
};
const STATUS_VIS = {
  confirmed:{ label:"Confirmado", color:"#27ae60", bg:"#e8f5e9", border:"#a5d6a7" },
  partial:{ label:"Parcial", color:"#f39c12", bg:"#fff8e1", border:"#ffd54f" },
  inferred:{ label:"Inferido", color:"#7f8c8d", bg:"#eceff1", border:"#b0bec5" },
  gap:{ label:"Vacío", color:"#c0392b", bg:"#fbe9e7", border:"#ef9a9a" },
  active:{ label:"Activa", color:"#27ae60", bg:"#e8f5e9", border:"#a5d6a7" },
  next:{ label:"Próxima", color:"#f39c12", bg:"#fff8e1", border:"#ffd54f" },
};
const MATURITY_TINTS = { 0:"#c0392b", 1:"#e67e22", 2:"#f39c12", 3:"#27ae60", 4:"#16a085", 5:"#2980b9" };
const PRIORITY_LABEL = { 1:"Alta", 2:"Media", 3:"Baja" };

// ═══════════════════════════════════════════════════════════════════════════
// PRIMITIVAS
// ═══════════════════════════════════════════════════════════════════════════
function StatusBadge({ status, size="sm" }) {
  const t = STATUS_VIS[status] ?? STATUS_VIS.inferred;
  return <span style={{ display:"inline-block", fontSize:size==="lg"?11:10, fontWeight:700, color:t.color, background:t.bg, border:`1px solid ${t.border}`, padding:size==="lg"?"4px 10px":"2px 8px", borderRadius:4, letterSpacing:"0.04em", textTransform:"uppercase", whiteSpace:"nowrap" }}>{t.label}</span>;
}
function ModuleChip({ code, color, size="sm" }) {
  const c = color ?? MODULE_COLORS[code] ?? OPS_COLORS[code] ?? "#7f8c8d";
  return <span style={{ display:"inline-block", fontSize:size==="lg"?12:10, fontWeight:700, color:c, background:c+"18", border:`1px solid ${c}44`, padding:size==="lg"?"4px 10px":"2px 7px", borderRadius:4, letterSpacing:"0.05em", fontFamily:"'JetBrains Mono','Consolas',monospace" }}>{code}</span>;
}
function KPICard({ label, value, color, sub }) {
  return <div style={{ background:"#ffffff", border:"1px solid #e0e0e0", borderRadius:10, padding:"12px 16px", flex:"1 1 130px", minWidth:120 }}>
    <div style={{ fontSize:26, fontWeight:800, color, lineHeight:1.1 }}>{value}</div>
    <div style={{ fontSize:11, color:"#666", marginTop:4, fontWeight:500 }}>{label}</div>
    {sub && <div style={{ fontSize:10, color:"#999", marginTop:2 }}>{sub}</div>}
  </div>;
}
function CategoryHeader({ icon, label, count, sub, color }) {
  return <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
    <span style={{ fontSize:22, lineHeight:1 }}>{icon}</span>
    <div style={{ flex:1 }}>
      <div style={{ fontSize:15, fontWeight:700, color }}>{label}{count!=null && <span style={{ fontSize:12, color:"#888", fontWeight:400, marginLeft:8 }}>· {count}</span>}</div>
      {sub && <div style={{ fontSize:11, color:"#777", marginTop:2, lineHeight:1.45 }}>{sub}</div>}
    </div>
  </div>;
}
function CloseButton({ onClick }) {
  return <button onClick={onClick} style={{ background:"none", border:"none", cursor:"pointer", color:"#888", fontSize:18, lineHeight:1, padding:4 }}>✕</button>;
}
function SectionTitle({ children }) {
  return <h3 style={{ fontSize:16, fontWeight:700, color:"#1D1D1B", margin:"0 0 4px 0", letterSpacing:"-0.01em" }}>{children}</h3>;
}

function DetailPanel({ item, onClose }) {
  if (!item) return null;
  const color = item.color ?? "#888";
  return <div style={{ background:"#ffffff", border:`1px solid ${color}55`, borderLeft:`4px solid ${color}`, borderRadius:10, padding:"16px 20px", marginBottom:22 }}>
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:16 }}>
      <div style={{ flex:1 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
          {item.code && <span style={{ fontSize:11, fontWeight:700, color, background:color+"18", border:`1px solid ${color}44`, padding:"3px 9px", borderRadius:4, letterSpacing:"0.08em", fontFamily:"'JetBrains Mono','Consolas',monospace" }}>{item.code}</span>}
          <h3 style={{ margin:0, fontSize:17, fontWeight:700, color:"#1D1D1B" }}>{item.name}</h3>
          {item.status && <StatusBadge status={item.status} />}
        </div>
        {item.role && <div style={{ fontSize:12, color:"#777", marginTop:4, fontStyle:"italic" }}>{item.role}</div>}
      </div>
      <CloseButton onClick={onClose} />
    </div>
    {item.purpose && <p style={{ fontSize:13, color:"#444", lineHeight:1.65, margin:"12px 0 14px 0" }}>{item.purpose}</p>}
    {(item.owner || item.maturity!=null) && <div style={{ display:"flex", flexWrap:"wrap", gap:14, marginBottom:14, fontSize:11, color:"#666" }}>
      {item.owner && <span><b style={{ color:"#888", fontWeight:500 }}>Owner:</b> {item.owner}</span>}
      {item.maturity!=null && <span style={{ display:"inline-flex", alignItems:"center", gap:5 }}><b style={{ color:"#888", fontWeight:500 }}>Madurez:</b><span style={{ background:MATURITY_TINTS[item.maturity]+"20", color:MATURITY_TINTS[item.maturity], padding:"1px 7px", borderRadius:4, fontWeight:700 }}>M{item.maturity}/5</span></span>}
      {item.priority!=null && <span><b style={{ color:"#888", fontWeight:500 }}>Prioridad:</b> {PRIORITY_LABEL[item.priority]}</span>}
      {item.vendor && <span><b style={{ color:"#888", fontWeight:500 }}>Vendor:</b> {item.vendor}</span>}
    </div>}
    {item.note && <div style={{ fontSize:12, color:"#666", lineHeight:1.6, padding:"10px 14px", background:"#fafafa", borderRadius:6, marginBottom:14, fontStyle:"italic" }}>{item.note}</div>}
    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:10 }}>
      {item.coverage && item.coverage.length>0 && <DetailBox label="⬡ Módulos que lo soportan" accent="#f39c12"><div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>{item.coverage.map(c=><ModuleChip key={c} code={c} size="lg"/>)}</div></DetailBox>}
      {item.entities && item.entities.length>0 && <DetailBox label={`◫ Entidades inferidas · ${item.entities.length}`} accent="#7B1FA2"><div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>{item.entities.map(e=><span key={e} style={{ fontSize:10, color:"#555", background:"#f5f5f5", border:"1px solid #e0e0e0", padding:"2px 7px", borderRadius:3, fontFamily:"'JetBrains Mono','Consolas',monospace" }}>{e}</span>)}</div></DetailBox>}
    </div>
  </div>;
}
function DetailBox({ label, accent, children }) {
  return <div style={{ background:"#fafafa", borderRadius:8, padding:"10px 14px" }}>
    <div style={{ fontSize:10, fontWeight:700, color:accent, marginBottom:8, textTransform:"uppercase", letterSpacing:"0.08em" }}>{label}</div>
    {children}
  </div>;
}

// ── Cluster helpers ─────────────────────────────────────────────────────────
function ClusterCard({ color, bg, title, desc, children }) {
  return <div style={{ background:bg, border:`1px solid ${color}44`, borderLeft:`3px solid ${color}`, borderRadius:10, padding:"12px 14px" }}>
    <div style={{ fontSize:12, fontWeight:700, color, marginBottom:4 }}>{title}</div>
    <div style={{ fontSize:11, color:"#555", lineHeight:1.55, marginBottom:10 }}>{desc}</div>
    <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>{children}</div>
  </div>;
}
function ClusterTag({ label, color, outline }) {
  return <span style={{ display:"inline-block", fontSize:10, fontWeight:600, color, background:outline?"transparent":color+"15", border:`1px solid ${outline?color+"55":color+"33"}`, padding:"2px 8px", borderRadius:4 }}>{label}</span>;
}

// ═══════════════════════════════════════════════════════════════════════════
// VISTA · ARQUITECTURA OLO (nueva tab)
// ═══════════════════════════════════════════════════════════════════════════
function OLOArchView() {
  return <div>
    <div style={{ background:"rgba(41,128,185,0.06)", border:"1px solid rgba(41,128,185,0.22)", borderLeft:"3px solid #2980b9", borderRadius:8, padding:"10px 14px", marginBottom:20, fontSize:12, color:"#555", lineHeight:1.6 }}>
      Diagrama operativo del ecosistema OLO. Muestra el flujo entre eFlow (CR · VE), Softland, la capa Intermedia, la Suite OLO con sus tres sub-áreas, clientes multi-segmento, Middleware y Sistemas del Estado.
    </div>

    <div style={{ background:"#ffffff", border:"1px solid #e0e0e0", borderRadius:12, overflow:"hidden" }}>
      {/* Toolbar */}
      <div style={{ padding:"10px 16px", borderBottom:"1px solid #f0f0f0", background:"#fafafa", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:8 }}>
        <span style={{ fontSize:11, color:"#666", fontWeight:600, letterSpacing:"0.08em" }}>ARQUITECTURA OLO · VISTA OPERATIVA</span>
        <div style={{ display:"flex", gap:16, alignItems:"center" }}>
          {[["#378ADD","Flujo confirmado",false],["#888780","Flujo inferido",true]].map(([c,l,d])=>(
            <div key={l} style={{ display:"flex", alignItems:"center", gap:6 }}>
              <svg width="22" height="2"><line x1="0" y1="1" x2="22" y2="1" stroke={c} strokeWidth="1.5" strokeDasharray={d?"3 3":"0"}/></svg>
              <span style={{ fontSize:10, color:"#666", fontWeight:500 }}>{l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* SVG — rediseño sin traslapes, sub-intermedias por sector */}
      <svg viewBox="0 0 1380 820" style={{ width:"100%", height:"auto", display:"block", fontFamily:"'Segoe UI','Helvetica Neue',sans-serif" }}>
        <defs>
          <marker id="ab" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M2 1L8 5L2 9" fill="none" stroke="#378ADD" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></marker>
          <marker id="ag" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M2 1L8 5L2 9" fill="none" stroke="#888780" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></marker>
        </defs>

        {/* ══ SUITE OLO outer ══ */}
        <rect x="400" y="16" width="960" height="330" rx="12" fill="none" stroke="#888780" strokeWidth="1.2" strokeDasharray="7 4"/>
        <text x="880" y="38" textAnchor="middle" fill="#444" fontSize="14" fontWeight="700">Suite OLO</text>

        {/* Integración de Data */}
        <rect x="412" y="48" width="500" height="282" rx="8" fill="none" stroke="#aaa" strokeWidth="0.8" strokeDasharray="4 3"/>
        <text x="662" y="66" textAnchor="middle" fill="#555" fontSize="11" fontWeight="600">Integración de Data</text>
        <text x="662" y="316" textAnchor="middle" fill="#777" fontSize="10">OLO API</text>
        {/* row 1 chips */}
        {[["SRO",420,76,52],["Trade",480,76,52],["Liq. Viajes",540,76,80],["RFID",628,76,48],["Next Raga Orders",684,76,110],["Pricing",802,76,56]].map(([l,x,y,w])=>(
          <g key={l+x}><rect x={x} y={y} width={w} height="26" rx="5" fill="#EBF3FB" stroke="#378ADD" strokeWidth="0.6"/><text x={x+w/2} y={y+17} textAnchor="middle" fill="#185FA5" fontSize="10" fontWeight="600">{l}</text></g>
        ))}
        {/* row 2 logos */}
        {[["● SRO","#059669",420,112,60],["eTrade","#d35400",488,112,56],["RFID","#555",628,112,48],["RAGA.x","#7B1FA2",684,112,64],["RAGA.x","#7B1FA2",756,112,64]].map(([l,cl,x,y,w])=>(
          <g key={l+x}><rect x={x} y={y} width={w} height="24" rx="4" fill={cl+"18"} stroke={cl+"55"} strokeWidth="0.5"/><text x={x+w/2} y={y+15} textAnchor="middle" fill={cl} fontSize="10" fontWeight="700">{l}</text></g>
        ))}

        {/* Interfaces de Sistema */}
        <rect x="924" y="48" width="210" height="172" rx="8" fill="none" stroke="#aaa" strokeWidth="0.8" strokeDasharray="4 3"/>
        <text x="1029" y="66" textAnchor="middle" fill="#555" fontSize="11" fontWeight="600">Interfaces Sistema</text>
        {[["CCA",932,78,52],["Fact. Serv.",992,78,96],["MPF",1096,78,40]].map(([l,x,y,w])=>(
          <g key={l}><rect x={x} y={y} width={w} height="26" rx="5" fill="#F3E8FD" stroke="#7B1FA2" strokeWidth="0.6"/><text x={x+w/2} y={y+17} textAnchor="middle" fill="#5B21B6" fontSize="10" fontWeight="600">{l}</text></g>
        ))}
        {[["ePRAC",932,116,70],["ePRAC",1010,116,70]].map(([l,x,y,w])=>(
          <g key={l+x}><rect x={x} y={y} width={w} height="24" rx="4" fill="#FEF3C7" stroke="#D97706" strokeWidth="0.6"/><text x={x+w/2} y={y+16} textAnchor="middle" fill="#92400E" fontSize="10" fontWeight="600">{l}</text></g>
        ))}

        {/* Integraciones Internas */}
        <rect x="1146" y="48" width="202" height="172" rx="8" fill="none" stroke="#aaa" strokeWidth="0.8" strokeDasharray="4 3"/>
        <text x="1247" y="66" textAnchor="middle" fill="#555" fontSize="11" fontWeight="600">Integraciones Internas</text>
        {[["Mecalux",1156,78,82],["Sis. Tiempo",1246,78,88]].map(([l,x,y,w])=>(
          <g key={l}><rect x={x} y={y} width={w} height="26" rx="5" fill="#FEF3C7" stroke="#D97706" strokeWidth="0.6"/><text x={x+w/2} y={y+17} textAnchor="middle" fill="#92400E" fontSize="10" fontWeight="600">{l}</text></g>
        ))}
        {[["N",1156,114,66],["SdT",1246,114,66]].map(([l,x,y,w])=>(
          <g key={l+x}><rect x={x} y={y} width={w} height="24" rx="4" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="0.6"/><text x={x+w/2} y={y+16} textAnchor="middle" fill="#475569" fontSize="10" fontWeight="700">{l}</text></g>
        ))}

        {/* ══ COLUMNA IZQUIERDA ══ */}
        {/* Power BI */}
        <rect x="248" y="10" width="90" height="36" rx="8" fill="#FEF3C7" stroke="#D97706" strokeWidth="1"/>
        <text x="293" y="32" textAnchor="middle" fill="#92400E" fontSize="11" fontWeight="700">Power BI</text>

        {/* Softland */}
        <rect x="14" y="50" width="90" height="34" rx="8" fill="#EBF3FB" stroke="#378ADD" strokeWidth="1"/>
        <text x="59" y="71" textAnchor="middle" fill="#042C53" fontSize="11" fontWeight="700">Softland</text>

        {/* eFlow */}
        <rect x="14" y="106" width="200" height="82" rx="10" fill="#C0D8F5" stroke="#185FA5" strokeWidth="1.2"/>
        <text x="114" y="128" textAnchor="middle" fill="#042C53" fontSize="13" fontWeight="700">eFlow</text>
        {[["CR",22,140],["VE",90,140]].map(([l,x,y])=>(
          <g key={l}><rect x={x} y={y} width="56" height="36" rx="6" fill="#EBF3FB" stroke="#185FA5" strokeWidth="0.8"/><text x={x+28} y={y+22} textAnchor="middle" fill="#042C53" fontSize="14" fontWeight="700">{l}</text></g>
        ))}

        {/* Intermedia Lago de Datos */}
        <rect x="222" y="90" width="130" height="88" rx="8" fill="#F8F9FA" stroke="#6B7280" strokeWidth="0.8"/>
        <text x="287" y="112" textAnchor="middle" fill="#374151" fontSize="11" fontWeight="700">Intermedia</text>
        <text x="287" y="128" textAnchor="middle" fill="#374151" fontSize="11" fontWeight="700">Lago de Datos</text>
        <ellipse cx="287" cy="155" rx="18" ry="6" fill="none" stroke="#6B7280" strokeWidth="1"/>
        <line x1="269" y1="155" x2="269" y2="167" stroke="#6B7280" strokeWidth="1"/>
        <line x1="305" y1="155" x2="305" y2="167" stroke="#6B7280" strokeWidth="1"/>
        <ellipse cx="287" cy="167" rx="18" ry="6" fill="none" stroke="#6B7280" strokeWidth="1"/>

        {/* Intermedia (pequeña) */}
        <rect x="52" y="250" width="112" height="30" rx="6" fill="#F8F9FA" stroke="#6B7280" strokeWidth="0.6"/>
        <text x="108" y="269" textAnchor="middle" fill="#374151" fontSize="10" fontWeight="600">Intermedia</text>

        {/* OLO API */}
        <rect x="52" y="306" width="112" height="30" rx="6" fill="#D1FAE5" stroke="#059669" strokeWidth="0.8"/>
        <text x="108" y="325" textAnchor="middle" fill="#065F46" fontSize="10" fontWeight="700">OLO API</text>

        {/* ══ INTERMEDIA MULTI CLIENTE — contenedor grande ══ */}
        <rect x="218" y="358" width="368" height="420" rx="10" fill="#F8F9FA" stroke="#6B7280" strokeWidth="1"/>
        <text x="402" y="377" textAnchor="middle" fill="#374151" fontSize="11" fontWeight="700">Intermedia Multi cliente</text>

        {/* Sub-intermedia Mayoreo */}
        <rect x="228" y="386" width="348" height="98" rx="7" fill="#ffffff" stroke="#9CA3AF" strokeWidth="0.8"/>
        <text x="402" y="402" textAnchor="middle" fill="#374151" fontSize="10" fontWeight="700">Intermedia Mayoreo</text>
        {[["Mayoreo - Cofersa",236,410],["Mayoreo - Febeca",332,410],["Mayoreo - Siliaca",428,410]].map(([l,x,y])=>(
          <g key={l}><rect x={x} y={y} width={88} height="26" rx="4" fill="#F8F9FA" stroke="#9CA3AF" strokeWidth="0.6"/><text x={x+44} y={y+17} textAnchor="middle" fill="#374151" fontSize="9" fontWeight="600">{l}</text></g>
        ))}
        {[["Cofersa",236,444],["Febeca",332,444],["Siliaca",428,444]].map(([l,x,y])=>(
          <g key={l}><rect x={x} y={y} width={88} height="22" rx="4" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="0.5"/><text x={x+44} y={y+14} textAnchor="middle" fill="#64748B" fontSize="9">{l}</text></g>
        ))}

        {/* Sub-intermedia EPA */}
        <rect x="228" y="496" width="348" height="72" rx="7" fill="#ffffff" stroke="#9CA3AF" strokeWidth="0.8"/>
        <text x="402" y="512" textAnchor="middle" fill="#374151" fontSize="10" fontWeight="700">Intermedia EPA</text>
        {[["EPA CR",236,520],["EPA VE",384,520]].map(([l,x,y])=>(
          <g key={l}><rect x={x} y={y} width={120} height="26" rx="4" fill="#F8F9FA" stroke="#9CA3AF" strokeWidth="0.6"/><text x={x+60} y={y+17} textAnchor="middle" fill="#374151" fontSize="9" fontWeight="600">{l}</text></g>
        ))}

        {/* Sub-intermedia Comercializadoras */}
        <rect x="228" y="580" width="348" height="72" rx="7" fill="#ffffff" stroke="#9CA3AF" strokeWidth="0.8"/>
        <text x="402" y="596" textAnchor="middle" fill="#374151" fontSize="10" fontWeight="700">Intermedia Comercializadoras</text>
        {[["Comerc. Compiere",236,604],["Comerc. OLO System",384,604]].map(([l,x,y])=>(
          <g key={l}><rect x={x} y={y} width={136} height="26" rx="4" fill="#F8F9FA" stroke="#9CA3AF" strokeWidth="0.6"/><text x={x+68} y={y+17} textAnchor="middle" fill="#374151" fontSize="9" fontWeight="600">{l}</text></g>
        ))}

        {/* Sub-intermedia Otros */}
        <rect x="228" y="664" width="348" height="58" rx="7" fill="#ffffff" stroke="#9CA3AF" strokeWidth="0.8"/>
        <text x="402" y="680" textAnchor="middle" fill="#374151" fontSize="10" fontWeight="700">Intermedia Otros</text>
        {[["Otros Clientes",290,688]].map(([l,x,y])=>(
          <g key={l}><rect x={x} y={y} width={224} height="26" rx="4" fill="#F8F9FA" stroke="#9CA3AF" strokeWidth="0.6"/><text x={x+112} y={y+17} textAnchor="middle" fill="#374151" fontSize="9" fontWeight="600">{l}</text></g>
        ))}

        {/* Middleware */}
        <rect x="660" y="490" width="120" height="100" rx="10" fill="#EDE9FE" stroke="#7B1FA2" strokeWidth="0.8"/>
        <text x="720" y="518" textAnchor="middle" fill="#5B21B6" fontSize="12" fontWeight="700">Middleware</text>
        <circle cx="720" cy="562" r="14" fill="none" stroke="#7B1FA2" strokeWidth="1.5"/>
        <circle cx="720" cy="562" r="6" fill="none" stroke="#7B1FA2" strokeWidth="1.5"/>
        <line x1="720" y1="548" x2="720" y2="546" stroke="#7B1FA2" strokeWidth="1.5"/>
        <line x1="720" y1="576" x2="720" y2="578" stroke="#7B1FA2" strokeWidth="1.5"/>
        <line x1="706" y1="562" x2="704" y2="562" stroke="#7B1FA2" strokeWidth="1.5"/>
        <line x1="734" y1="562" x2="736" y2="562" stroke="#7B1FA2" strokeWidth="1.5"/>

        {/* Sistemas del Estado */}
        <rect x="640" y="650" width="188" height="130" rx="8" fill="none" stroke="#B4B2A9" strokeWidth="1" strokeDasharray="4 3"/>
        <text x="734" y="670" textAnchor="middle" fill="#555" fontSize="10" fontWeight="600">Sistemas del Estado</text>
        {[["Delzof",652,678],["TICA",652,718]].map(([l,x,y])=>(
          <g key={l}><rect x={x} y={y} width={84} height="28" rx="5" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="0.6"/><text x={x+42} y={y+18} textAnchor="middle" fill="#374151" fontSize="10" fontWeight="600">{l}</text></g>
        ))}

        {/* ══ CONEXIONES ══ */}
        {/* Softland → Lago */}
        <line x1="104" y1="67" x2="222" y2="120" stroke="#888780" strokeWidth="1" markerEnd="url(#ag)"/>
        {/* Power BI ← Lago */}
        <line x1="287" y1="90" x2="293" y2="46" stroke="#888780" strokeWidth="1" markerEnd="url(#ag)"/>
        {/* Lago → Suite OLO */}
        <line x1="352" y1="134" x2="400" y2="175" stroke="#888780" strokeWidth="1" markerEnd="url(#ag)"/>
        {/* Lago ↔ Intermedia Multi cliente */}
        <line x1="277" y1="178" x2="277" y2="356" stroke="#888780" strokeWidth="1" markerEnd="url(#ag)"/>
        <line x1="287" y1="356" x2="287" y2="178" stroke="#888780" strokeWidth="1" markerEnd="url(#ag)"/>
        {/* Multi cliente → sub-intermedias (líneas internas ya implícitas por contención) */}
        {/* eFlow ↔ Intermedia small */}
        <line x1="126" y1="188" x2="108" y2="248" stroke="#888780" strokeWidth="1" markerEnd="url(#ag)"/>
        <line x1="114" y1="248" x2="132" y2="188" stroke="#888780" strokeWidth="1" markerEnd="url(#ag)"/>
        {/* Intermedia small ↔ OLO API */}
        <line x1="108" y1="280" x2="108" y2="304" stroke="#888780" strokeWidth="1" markerEnd="url(#ag)"/>
        <line x1="116" y1="304" x2="116" y2="280" stroke="#888780" strokeWidth="1" markerEnd="url(#ag)"/>
        {/* OLO API → loop eFlow */}
        <path d="M108 336 L108 450 L10 450 L10 148" stroke="#888780" strokeWidth="1" fill="none" markerEnd="url(#ag)"/>
        {/* OLO API → Multi cliente */}
        <line x1="164" y1="321" x2="220" y2="388" stroke="#888780" strokeWidth="1" markerEnd="url(#ag)"/>
        {/* Middleware ↔ Suite OLO (azul) */}
        <line x1="718" y1="346" x2="718" y2="488" stroke="#378ADD" strokeWidth="1.5" markerEnd="url(#ab)"/>
        <line x1="726" y1="488" x2="726" y2="346" stroke="#378ADD" strokeWidth="1.5" markerEnd="url(#ab)"/>
        {/* Middleware → Comerc. Compiere */}
        <line x1="660" y1="540" x2="582" y2="624" stroke="#378ADD" strokeWidth="1.5" markerEnd="url(#ab)"/>
        {/* Middleware → Integraciones Internas */}
        <line x1="780" y1="510" x2="1146" y2="140" stroke="#888780" strokeWidth="1" markerEnd="url(#ag)"/>
        {/* Middleware → Sistemas del Estado */}
        <line x1="720" y1="590" x2="720" y2="648" stroke="#888780" strokeWidth="1" markerEnd="url(#ag)"/>
      </svg>
    </div>

    {/* Clusters detallados */}
    <div style={{ marginTop:20 }}>
      <div style={{ fontSize:12, fontWeight:700, color:"#444", letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:12 }}>Clusters del ecosistema</div>

      {/* Fila 1 */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:10, marginBottom:10 }}>

        {/* eFlow */}
        <ClusterCard color="#185FA5" bg="#EBF3FB" title="eFlow · CR y VE" desc="Plataforma de operación logística activa en Costa Rica y Venezuela. Solo estos dos países están en scope.">
          <ClusterTag label="CR" color="#185FA5"/>
          <ClusterTag label="VE" color="#185FA5"/>
        </ClusterCard>

        {/* Lago de Datos */}
        <ClusterCard color="#6B7280" bg="#F8F9FA" title="Intermedia Lago de Datos" desc="Capa de integración central. Consolida datos del ERP y los distribuye hacia Power BI y la Suite OLO.">
          <ClusterTag label="Power BI" color="#D97706"/>
          <ClusterTag label="Suite OLO" color="#185FA5"/>
          <ClusterTag label="Multi cliente" color="#6B7280"/>
        </ClusterCard>

        {/* Suite OLO · Integración de Data */}
        <ClusterCard color="#185FA5" bg="#EBF3FB" title="Suite OLO · Integración de Data" desc="Módulos de integración de datos expuestos vía OLO API.">
          <ClusterTag label="GoRamp" color="#059669"/>
          <ClusterTag label="Trade · eTrade" color="#d35400"/>
          <ClusterTag label="Liq. de Viajes" color="#185FA5"/>
          <ClusterTag label="RFID" color="#555"/>
          <ClusterTag label="Next Raga Orders" color="#7B1FA2"/>
          <ClusterTag label="RAGA.x" color="#7B1FA2"/>
          <ClusterTag label="Pricing" color="#185FA5"/>
          <ClusterTag label="OLO API" color="#059669" outline/>
        </ClusterCard>

        {/* Interfaces de Sistema */}
        <ClusterCard color="#5B21B6" bg="#F3E8FD" title="Interfaces de Sistema" desc="Interfaces directas con el core de negocio de OLO, gestionadas vía ePRAC.">
          <ClusterTag label="CCA" color="#5B21B6"/>
          <ClusterTag label="Facturación de Servicios" color="#5B21B6"/>
          <ClusterTag label="MPF" color="#5B21B6"/>
          <ClusterTag label="ePRAC (×2)" color="#D97706"/>
        </ClusterCard>
      </div>

      {/* Fila 2 */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:10 }}>

        {/* Integraciones Internas */}
        <ClusterCard color="#D97706" bg="#FEF3C7" title="Integraciones Internas" desc="Integraciones propias del ecosistema OLO con sistemas físicos y de tiempo.">
          <ClusterTag label="Mecalux" color="#D97706"/>
          <ClusterTag label="Sistemas de Tiempo" color="#D97706"/>
        </ClusterCard>

        {/* Middleware */}
        <ClusterCard color="#7B1FA2" bg="#EDE9FE" title="Middleware" desc="Capa de orquestación central. Conecta Suite OLO con clientes, integraciones internas y sistemas del Estado.">
          <ClusterTag label="Suite OLO → clientes" color="#7B1FA2"/>
          <ClusterTag label="Comerc. Compiere" color="#7B1FA2"/>
          <ClusterTag label="Integ. Internas" color="#D97706"/>
          <ClusterTag label="Sistemas del Estado" color="#94A3B8"/>
        </ClusterCard>

        {/* Multi cliente */}
        <ClusterCard color="#6B7280" bg="#F8F9FA" title="Intermedia Multi cliente" desc="Segmentos de clientes conectados a través de la capa Intermedia.">
          <ClusterTag label="Mayoreo · Cofersa" color="#78350F"/>
          <ClusterTag label="Mayoreo · Febeca" color="#78350F"/>
          <ClusterTag label="Mayoreo · Siliaca" color="#78350F"/>
          <ClusterTag label="EPA CR" color="#065F46"/>
          <ClusterTag label="EPA VE" color="#065F46"/>
          <ClusterTag label="Comerc. Compiere" color="#6B7280"/>
          <ClusterTag label="Comerc. OLO System" color="#6B7280"/>
          <ClusterTag label="Otros Clientes" color="#6B7280"/>
        </ClusterCard>

        {/* Sistemas del Estado */}
        <ClusterCard color="#94A3B8" bg="#F1F5F9" title="Sistemas del Estado" desc="Sistemas regulatorios y aduaneros del Estado con los que interactúa el ecosistema OLO.">
          <ClusterTag label="Delzof" color="#475569"/>
          <ClusterTag label="TICA" color="#475569"/>
        </ClusterCard>
      </div>
    </div>
  </div>;
}

// ═══════════════════════════════════════════════════════════════════════════
// VISTA · ECOSISTEMA
// ═══════════════════════════════════════════════════════════════════════════
function EcosystemView() {
  const W=1200, H=720;
  const erpNodes=[{code:"AS",x:90,y:380,label:"Maestros"},{code:"CG",x:250,y:280},{code:"CB",x:380,y:230},{code:"CC",x:510,y:230},{code:"CP",x:640,y:230},{code:"FA",x:510,y:320},{code:"CO",x:640,y:320},{code:"CI",x:770,y:320},{code:"AF",x:380,y:410},{code:"GN",x:510,y:410},{code:"MF",x:640,y:410},{code:"RH",x:770,y:410},{code:"POS",x:380,y:480},{code:"FR",x:510,y:480},{code:"AC",x:640,y:480},{code:"CCH",x:770,y:480},{code:"PY",x:900,y:410},{code:"FC",x:900,y:320}];
  const opsNodes=[{code:"WMS-D",label:"eflow WMS\nDesktop",x:280,y:620},{code:"WMS-RF",label:"eflow WMS\nRF · PDT",x:540,y:620},{code:"WMH",label:"WMH\nTorre Control",x:800,y:620}];
  const extNodes=[{code:"EDI",label:"Portal · EDI",x:90,y:100},{code:"Aduanas",label:"Aduanero",x:280,y:100},{code:"Mecalux",label:"Mecalux",x:470,y:100},{code:"TMSI",label:"TMS Internacional",x:660,y:100},{code:"BI",label:"BI · DW",x:850,y:100},{code:"ZF",label:"Zona Franca SEL",x:1040,y:100}];
  const links=[{a:"AS",b:"CG",c:true},{a:"AS",b:"CB",c:true},{a:"AS",b:"CC",c:true},{a:"AS",b:"CP",c:true},{a:"AS",b:"FA",c:true},{a:"AS",b:"CO",c:true},{a:"AS",b:"CI",c:true},{a:"AS",b:"AF",c:true},{a:"AS",b:"GN",c:true},{a:"CB",b:"CG",c:true},{a:"CC",b:"CG",c:true},{a:"CP",b:"CG",c:true},{a:"FA",b:"CG",c:true},{a:"CO",b:"CG",c:true},{a:"CI",b:"CG",c:true},{a:"AF",b:"CG",c:true},{a:"GN",b:"CG",c:true},{a:"MF",b:"CG",c:true},{a:"FA",b:"CC",c:true},{a:"FA",b:"CI",c:true},{a:"CO",b:"CP",c:true},{a:"CO",b:"CI",c:true},{a:"CC",b:"CB",c:true},{a:"CP",b:"CB",c:true},{a:"CCH",b:"CB",c:true},{a:"PY",b:"CB",c:true},{a:"GN",b:"CB",c:true},{a:"RH",b:"CB",c:true},{a:"FC",b:"CB",c:true},{a:"FA",b:"MF",c:true},{a:"POS",b:"MF",c:true},{a:"FR",b:"MF",c:true},{a:"AC",b:"MF",c:true},{a:"CC",b:"MF",c:true},{a:"CP",b:"MF",c:true},{a:"CO",b:"MF",c:true},{a:"CCH",b:"MF",c:true},{a:"FA",b:"WMS-D",c:true},{a:"CO",b:"WMS-D",c:true},{a:"WMS-D",b:"WMS-RF",c:true},{a:"WMS-D",b:"WMH",c:false},{a:"EDI",b:"FA",c:false},{a:"Aduanas",b:"CG",c:false},{a:"Mecalux",b:"WMH",c:false},{a:"BI",b:"CG",c:false},{a:"ZF",b:"WMS-D",c:false},{a:"TMSI",b:"WMH",c:false}];
  const all=[...erpNodes.map(n=>({...n,kind:"erp"})),...opsNodes.map(n=>({...n,kind:"ops"})),...extNodes.map(n=>({...n,kind:"ext"}))];
  const lookup=Object.fromEntries(all.map(n=>[n.code,n]));
  return <div>
    <div style={{ display:"flex", flexDirection:"column", marginBottom:24 }}>
      <LayerBlock icon="🌐" label="Sistemas Externos · inferidos por contexto 3PL" color="#7f8c8d" bg="rgba(127,140,141,0.08)" border="rgba(127,140,141,0.25)" radiusTop sub="Inferidos a partir del informe BPA y prácticas estándar de operadores logísticos. Sin documentación formal en el corpus accesible.">
        <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
          {[{code:"EDI",label:"Portal · EDI · Clientes"},{code:"Aduanas",label:"Sistema Aduanero · TICA"},{code:"Mecalux",label:"Mecalux · racks"},{code:"TMSI",label:"TMS Internacional"},{code:"BI",label:"BI / Data Warehouse"},{code:"ZF",label:"Zona Franca SEL"}].map(e=>(
            <span key={e.code} style={{ fontSize:11, fontWeight:600, color:"#5e6b7a", background:"#ffffff", border:"1px dashed #b0bec5", padding:"5px 11px", borderRadius:6 }}>
              <b style={{ color:"#455A64", marginRight:6, fontFamily:"'JetBrains Mono','Consolas',monospace" }}>{e.code}</b>{e.label}
            </span>
          ))}
        </div>
      </LayerBlock>
      <LayerBlock icon="⬡" label="ERP — Softland v7.00 · motor Exactus" color="#c0392b" bg="rgba(192,57,43,0.05)" border="rgba(192,57,43,0.2)" sub={`${SOFTLAND_MODULES.length} módulos · AS provee maestros transversales · CG es el corazón financiero`}>
        <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
          {SOFTLAND_MODULES.map(m=>{ const c=MODULE_COLORS[m.code]??"#888"; return <div key={m.code} style={{ display:"flex", alignItems:"center", gap:7, background:"#ffffff", border:`1px solid ${c}44`, borderLeft:`3px solid ${c}`, padding:"6px 12px", borderRadius:6 }}><span style={{ fontSize:11, fontWeight:700, color:c, fontFamily:"'JetBrains Mono','Consolas',monospace" }}>{m.code}</span><span style={{ fontSize:11, color:"#555" }}>{m.name}</span></div>; })}
        </div>
      </LayerBlock>
      <LayerBlock icon="🏗" label="Operación logística · eco-efficiency / eflow" color="#1abc9c" bg="rgba(26,188,156,0.08)" border="rgba(26,188,156,0.25)" sub="eflow Cloud Suite v4.17.0.2 · Desktop coordina catálogos y configuración · RF ejecuta operaciones físicas · WMH es la torre de control">
        <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
          {OPS_MODULES.map(m=>{ const c=OPS_COLORS[m.code]??"#1abc9c"; return <div key={m.code} style={{ background:"#ffffff", border:`1px solid ${c}44`, borderLeft:`3px solid ${c}`, padding:"8px 14px", borderRadius:6, minWidth:160 }}><div style={{ fontSize:11, fontWeight:700, color:c, fontFamily:"'JetBrains Mono','Consolas',monospace", marginBottom:2 }}>{m.code}</div><div style={{ fontSize:12, color:"#444", fontWeight:600 }}>{m.name}</div></div>; })}
        </div>
      </LayerBlock>
      <LayerBlock icon="🛰" label="Sistemas satélite · inferidos" color="#9b59b6" bg="rgba(155,89,182,0.08)" border="rgba(155,89,182,0.22)" radiusBottom sub="Mencionados parcialmente en manuales pero sin documentación dedicada en el corpus accesible.">
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:8 }}>
          {SATELLITE_MODULES.map((s,i)=><div key={i} style={{ background:"#ffffff", border:"1px dashed #c39bd3", borderRadius:6, padding:"8px 12px" }}><div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:3 }}><span style={{ fontSize:12, fontWeight:700, color:"#7B1FA2" }}>{s.name}</span><StatusBadge status={s.status}/></div><div style={{ fontSize:10, color:"#777", lineHeight:1.45 }}>{s.purpose}</div></div>)}
        </div>
      </LayerBlock>
    </div>
    <h3 style={{ fontSize:14, fontWeight:700, color:"#1D1D1B", margin:"0 0 4px 0" }}>Diagrama de conexiones</h3>
    <p style={{ fontSize:12, color:"#777", margin:"0 0 14px 0" }}>Líneas continuas: integración declarada en algún manual. Líneas punteadas: inferidas por contexto.</p>
    <div style={{ background:"#ffffff", border:"1px solid #e0e0e0", borderRadius:12, overflow:"hidden" }}>
      <div style={{ padding:"10px 16px", borderBottom:"1px solid #f0f0f0", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:8, background:"#fafafa" }}>
        <span style={{ fontSize:11, color:"#666", fontWeight:600 }}>ECOSISTEMA · 3 CAPAS · {erpNodes.length+opsNodes.length+extNodes.length} SISTEMAS</span>
        <div style={{ display:"flex", gap:14, alignItems:"center" }}>
          {[["#c0392b","Confirmado",false],["#7f8c8d","Inferido",true]].map(([c,l,d])=><div key={l} style={{ display:"flex", alignItems:"center", gap:6 }}><svg width="22" height="2"><line x1="0" y1="1" x2="22" y2="1" stroke={c} strokeWidth="1.5" strokeDasharray={d?"3 3":"0"}/></svg><span style={{ fontSize:10, color:"#666", fontWeight:500 }}>{l}</span></div>)}
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width:"100%", height:"auto", display:"block" }}>
        <rect x="0" y="40" width={W} height="120" fill="rgba(127,140,141,0.05)"/>
        <rect x="0" y="200" width={W} height="340" fill="rgba(192,57,43,0.04)"/>
        <rect x="0" y="580" width={W} height="100" fill="rgba(26,188,156,0.06)"/>
        <text x="20" y="60" fill="#7f8c8d" style={{ fontSize:11, fontWeight:600, letterSpacing:"0.1em" }}>SISTEMAS EXTERNOS · INFERIDOS</text>
        <text x="20" y="220" fill="#c0392b" style={{ fontSize:11, fontWeight:600, letterSpacing:"0.1em" }}>SOFTLAND ERP v7.00 · MOTOR EXACTUS</text>
        <text x="20" y="600" fill="#1abc9c" style={{ fontSize:11, fontWeight:600, letterSpacing:"0.1em" }}>OPERACIÓN LOGÍSTICA · ECO-EFFICIENCY / EFLOW</text>
        {links.map((link,i)=>{ const a=lookup[link.a],b=lookup[link.b]; if(!a||!b)return null; return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={link.c?"#c0392b":"#7f8c8d"} strokeWidth="1" strokeOpacity={link.c?0.4:0.3} strokeDasharray={link.c?"0":"3 3"}/>; })}
        {all.map(n=>{ const r=n.kind==="erp"?24:36; const stroke=n.kind==="erp"?(MODULE_COLORS[n.code]??"#c0392b"):n.kind==="ops"?"#1abc9c":"#7f8c8d"; const fill=n.kind==="erp"?"#ffffff":n.kind==="ops"?"#f0fdfa":"#fafafa"; return <g key={n.code}><circle cx={n.x} cy={n.y} r={r} fill={fill} stroke={stroke} strokeWidth={n.kind==="erp"?2:1.5} strokeDasharray={n.kind==="ext"?"3 3":"0"}/><text x={n.x} y={n.y+(n.label?-2:4)} textAnchor="middle" fill={stroke} style={{ fontSize:n.kind==="erp"?11:10, fontWeight:700, letterSpacing:"0.04em" }}>{n.code}</text>{n.label&&n.label.split("\n").map((line,j)=><text key={j} x={n.x} y={n.y+14+j*11} textAnchor="middle" fill="#666" style={{ fontSize:9 }}>{line}</text>)}</g>; })}
      </svg>
    </div>
    <div style={{ marginTop:24, padding:"14px 18px", background:"rgba(243,156,18,0.06)", border:"1px solid rgba(243,156,18,0.25)", borderLeft:"3px solid #f39c12", borderRadius:8 }}>
      <div style={{ fontSize:11, fontWeight:700, color:"#d35400", letterSpacing:"0.1em", marginBottom:6 }}>◆ NOTA METODOLÓGICA</div>
      <p style={{ fontSize:12, color:"#444", lineHeight:1.65, margin:0 }}>El ERP es <b style={{ color:"#c0392b" }}>Softland v7.00</b> sobre motor configurable Exactus. El WMS y la Torre de Control son productos separados de <b style={{ color:"#1abc9c" }}>eco-efficiency / eflow Cloud Suite</b>. La integración Softland↔eflow se realiza por interfaz documental — su mecanismo concreto (batch, archivos, WS, BD intermedia) no está descrito en los manuales accesibles.</p>
    </div>
  </div>;
}

function LayerBlock({ icon, label, color, bg, border, sub, children, radiusTop, radiusBottom }) {
  const radius = radiusTop&&radiusBottom?12:radiusTop?"12px 12px 0 0":radiusBottom?"0 0 12px 12px":0;
  return <div style={{ background:bg, border:`1px solid ${border}`, borderTop:radiusTop?`1px solid ${border}`:"none", borderRadius:radius, padding:"16px 18px" }}>
    <CategoryHeader icon={icon} label={label} color={color} sub={sub}/>
    {children}
  </div>;
}

// ═══════════════════════════════════════════════════════════════════════════
// VISTA · BPA
// ═══════════════════════════════════════════════════════════════════════════
function BPAView({ selected, setSelected }) {
  const allProcs=[...BPA_PROCESSES.estrategicos.map(p=>({...p,area:"estrategicos"})),...BPA_PROCESSES.negocio.map(p=>({...p,area:"negocio"})),...BPA_PROCESSES.apoyo.map(p=>({...p,area:"apoyo"})),...BPA_PROCESSES.control.map(p=>({...p,area:"control"}))];
  const selProc=allProcs.find(p=>p.name===selected);
  const total=allProcs.length, withCov=allProcs.filter(p=>p.coverage&&p.coverage.length>0).length;
  const avgMat=(allProcs.reduce((s,p)=>s+p.maturity,0)/total).toFixed(2);
  return <div>
    <div style={{ display:"flex", gap:10, marginBottom:18, flexWrap:"wrap" }}>
      <KPICard label="Procesos totales" value={total} color="#1D1D1B"/>
      <KPICard label="Con cobertura sistema" value={`${withCov}/${total}`} color="#27ae60"/>
      <KPICard label="Madurez promedio" value={`${avgMat}/5`} color="#f39c12" sub="Talento Humano (3) lidera"/>
      <KPICard label="Estratégicos" value={BPA_PROCESSES.estrategicos.length} color="#27ae60"/>
      <KPICard label="Negocio" value={BPA_PROCESSES.negocio.length} color="#f39c12"/>
      <KPICard label="Apoyo · Control" value={BPA_PROCESSES.apoyo.length+BPA_PROCESSES.control.length} color="#9b59b6"/>
    </div>
    <div style={{ background:"rgba(243,156,18,0.07)", border:"1px solid rgba(243,156,18,0.22)", borderLeft:"3px solid #f39c12", borderRadius:8, padding:"10px 14px", marginBottom:22, fontSize:12, color:"#666", lineHeight:1.6 }}>
      <b style={{ color:"#d35400" }}>Fuente:</b> Informe Final Diagnóstico Procesos OLO · CICR · diciembre 2024. Topología: estratégicos arriba, apoyo a la izquierda, procesos de negocio (misionales) al centro, control a la derecha. Click en cualquier proceso para ver qué módulos del ecosistema lo soportan.
    </div>
    {selProc && <DetailPanel item={{ name:selProc.name, color:BPA_AREA_COLORS[selProc.area].color, owner:selProc.owner!=="—"?selProc.owner:null, maturity:selProc.maturity, priority:selProc.priority, coverage:selProc.coverage, note:selProc.note, purpose:`Proceso del área ${BPA_AREA_COLORS[selProc.area].label.toLowerCase()}. ${selProc.coverage.length===0?"Sin cobertura por sistema documentado — candidato a levantamiento.":`Soportado por ${selProc.coverage.length} sistema${selProc.coverage.length>1?"s":""} del ecosistema.`}` }} onClose={()=>setSelected(null)}/>}
    <BPAArea area="estrategicos" processes={BPA_PROCESSES.estrategicos} selected={selected} onSelect={setSelected}/>
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1.6fr 1fr", gap:14, marginTop:14 }}>
      <BPAArea area="apoyo" processes={BPA_PROCESSES.apoyo} selected={selected} onSelect={setSelected}/>
      <BPAArea area="negocio" processes={BPA_PROCESSES.negocio} selected={selected} onSelect={setSelected}/>
      <BPAArea area="control" processes={BPA_PROCESSES.control} selected={selected} onSelect={setSelected}/>
    </div>
    <div style={{ marginTop:18, padding:"12px 16px", background:"#fafafa", border:"1px solid #e0e0e0", borderRadius:8 }}>
      <div style={{ fontSize:10, fontWeight:700, color:"#666", letterSpacing:"0.1em", marginBottom:8, textTransform:"uppercase" }}>Lectura</div>
      <div style={{ display:"flex", flexWrap:"wrap", gap:16, alignItems:"center" }}>
        <span style={{ fontSize:11, color:"#444" }}><b>M0–M5</b> madurez · <b>P1–P3</b> prioridad de levantamiento</span>
        {[0,1,2,3].map(m=><div key={m} style={{ display:"flex", alignItems:"center", gap:5 }}><span style={{ fontSize:10, fontWeight:700, color:MATURITY_TINTS[m], background:MATURITY_TINTS[m]+"20", padding:"1px 7px", borderRadius:4 }}>M{m}</span></div>)}
        <span style={{ fontSize:11, color:"#777", fontStyle:"italic" }}>Borde de color: el proceso tiene al menos un sistema documentado que lo soporta.</span>
      </div>
    </div>
  </div>;
}
function BPAArea({ area, processes, selected, onSelect }) {
  const meta=BPA_AREA_COLORS[area];
  return <div style={{ background:meta.bg, border:`1px solid ${meta.border}`, borderRadius:12, padding:"14px 16px" }}>
    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}><div style={{ width:4, height:24, background:meta.color, borderRadius:2 }}/><div><div style={{ fontSize:12, fontWeight:700, color:meta.color }}>{meta.label} · {processes.length}</div><div style={{ fontSize:10, color:"#777" }}>{meta.desc}</div></div></div>
    <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
      {processes.map(p=>{ const hasCov=p.coverage&&p.coverage.length>0; const isSel=selected===p.name; return <div key={p.name} onClick={()=>onSelect(isSel?null:p.name)} style={{ background:isSel?meta.color+"1a":"#ffffff", border:`1px solid ${hasCov?meta.color+"55":"#e0e0e0"}`, borderLeft:`3px solid ${MATURITY_TINTS[p.maturity]}`, borderRadius:8, padding:"8px 10px", cursor:"pointer", transition:"all 0.15s", boxShadow:isSel?`0 0 0 2px ${meta.color}33`:"none" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", gap:6, marginBottom:hasCov?5:0 }}><span style={{ fontSize:11, color:"#1D1D1B", fontWeight:isSel?700:500, lineHeight:1.3, flex:1 }}>{p.name}</span><span style={{ fontSize:9, fontWeight:700, color:MATURITY_TINTS[p.maturity], whiteSpace:"nowrap" }}>M{p.maturity}·P{p.priority}</span></div>
        {hasCov && <div style={{ display:"flex", flexWrap:"wrap", gap:3 }}>{p.coverage.map(c=><ModuleChip key={c} code={c}/>)}</div>}
      </div>; })}
    </div>
  </div>;
}

// ═══════════════════════════════════════════════════════════════════════════
// VISTAS · SOFTLAND / OPS / INTEGRACIONES / CONTEXTO
// ═══════════════════════════════════════════════════════════════════════════
function SoftlandView({ selected, setSelected }) {
  const sel=SOFTLAND_MODULES.find(m=>m.code===selected);
  return <div>
    {sel && <DetailPanel item={{...sel,color:MODULE_COLORS[sel.code]}} onClose={()=>setSelected(null)}/>}
    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:10 }}>
      {SOFTLAND_MODULES.map(mod=>{ const c=MODULE_COLORS[mod.code]??"#888"; const isSel=selected===mod.code; return <div key={mod.code} onClick={()=>setSelected(isSel?null:mod.code)} style={{ background:isSel?c+"10":"#ffffff", border:`1px solid ${isSel?c+"88":c+"33"}`, borderLeft:`4px solid ${c}`, borderRadius:8, padding:"12px 14px", cursor:"pointer", transition:"all 0.15s", boxShadow:isSel?`0 0 0 2px ${c}33`:"none" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:6 }}><span style={{ fontSize:13, fontWeight:800, color:c, fontFamily:"'JetBrains Mono','Consolas',monospace", letterSpacing:"0.04em" }}>{mod.code}</span><StatusBadge status={mod.status}/></div>
        <div style={{ fontSize:13, fontWeight:700, color:"#1D1D1B", marginBottom:2 }}>{mod.name}</div>
        <div style={{ fontSize:11, color:"#888", fontStyle:"italic" }}>{mod.role}</div>
      </div>; })}
    </div>
  </div>;
}
function OpsView({ selected, setSelected }) {
  const sel=OPS_MODULES.find(m=>m.code===selected);
  return <div>
    {sel && <DetailPanel item={{...sel,color:OPS_COLORS[sel.code]??"#1abc9c"}} onClose={()=>setSelected(null)}/>}
    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:10, marginBottom:24 }}>
      {OPS_MODULES.map(mod=>{ const c=OPS_COLORS[mod.code]??"#1abc9c"; const isSel=selected===mod.code; return <div key={mod.code} onClick={()=>setSelected(isSel?null:mod.code)} style={{ background:isSel?c+"10":"#ffffff", border:`1px solid ${isSel?c+"88":c+"33"}`, borderLeft:`4px solid ${c}`, borderRadius:8, padding:"14px 16px", cursor:"pointer", transition:"all 0.15s", boxShadow:isSel?`0 0 0 2px ${c}33`:"none" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:4 }}><span style={{ fontSize:12, fontWeight:800, color:c, fontFamily:"'JetBrains Mono','Consolas',monospace", letterSpacing:"0.04em" }}>{mod.code}</span>{mod.status&&<StatusBadge status={mod.status}/>}</div>
        <div style={{ fontSize:14, fontWeight:700, color:"#1D1D1B", marginBottom:2 }}>{mod.name}</div>
        {mod.role&&<div style={{ fontSize:11, color:"#888", fontStyle:"italic", marginBottom:6 }}>{mod.role}</div>}
        {mod.vendor&&<div style={{ fontSize:10, color:"#999" }}>Vendor: <b style={{ color:"#777" }}>{mod.vendor}</b></div>}
      </div>; })}
    </div>
    <h3 style={{ fontSize:14, fontWeight:700, color:"#1D1D1B", margin:"0 0 4px 0" }}>Sistemas satélite · inferidos</h3>
    <p style={{ fontSize:12, color:"#777", margin:"0 0 14px 0" }}>Mencionados parcialmente en manuales pero sin documentación dedicada en el corpus accesible.</p>
    <div style={{ display:"grid", gap:8 }}>
      {SATELLITE_MODULES.map((s,i)=><div key={i} style={{ background:"#ffffff", border:"1px dashed #b0bec5", borderLeft:"3px solid #7f8c8d", borderRadius:8, padding:"10px 14px" }}><div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", gap:8, marginBottom:4, flexWrap:"wrap" }}><span style={{ fontSize:13, fontWeight:700, color:"#1D1D1B" }}>{s.name}</span><StatusBadge status={s.status}/></div><p style={{ fontSize:12, color:"#666", lineHeight:1.55, margin:0 }}>{s.purpose}</p></div>)}
    </div>
  </div>;
}
// ── Clusters del ecosistema (alineados con vista Inicio) ───────────────────
//
//  CLUSTER A · ERP Softland
//    → integraciones donde AMBOS extremos son módulos Softland
//
//  CLUSTER B · Operación logística (eflow)
//    → integraciones donde AL MENOS UN extremo es WMS-D / WMS-RF / WMH / ERP
//      (ERP aquí actúa como alias del stack Softland hablando con eflow)
//
//  CLUSTER C · Intermedia & Suite OLO
//    → integraciones que involucran Intermedia, OLO API, GoRamp/SRO, Trade,
//      RFID, Pricing, etc.  (capa de integración de datos)
//
//  CLUSTER D · Sistemas satélite / externos
//    → Mecalux, EDI, Aduanas, BI, ZF, TMSI y cualquier otro externo
//
//  CLUSTER E · Middleware & clientes
//    → Middleware, Multi cliente, Comercializadoras, EPA, Mayoreo, etc.

const ERP_MOD  = new Set(["AS","CG","CB","CC","CP","FA","CO","CI","AF","GN","MF","RH","CCH","PY","FC","POS","FR","AC"]);
const EFLOW_MOD= new Set(["WMS-D","WMS-RF","WMH","ERP"]);
const SAT_MOD  = new Set(["Mecalux","EDI","Aduanas","BI","ZF","TMSI"]);
// nodos de capa intermedia / suite OLO
const SUITE_MOD= new Set(["SRO","GoRamp","Trade","RFID","Pricing","OLO-API","Intermedia","LagoDatos"]);

function codeCluster(code){
  if(ERP_MOD.has(code))  return "erp";
  if(EFLOW_MOD.has(code))return "ops";
  if(SAT_MOD.has(code))  return "sat";
  return "other";
}

function rowCategory(row){
  const f=codeCluster(row.from), t=codeCluster(row.to);
  // Operación logística: al menos un extremo es eflow
  if(f==="ops"||t==="ops") return "ops";
  // Satélite: al menos un extremo es externo
  if(f==="sat"||t==="sat") return "sat";
  // ERP puro: ambos extremos son módulos Softland
  if(f==="erp"&&t==="erp") return "erp";
  // fallback
  return "erp";
}

const CAT_META = {
  global:{ label:"Global · todos",                          icon:"◎",  color:"#1D1D1B", bg:"#f8f9fa",              border:"#e0e0e0" },
  erp:   { label:"ERP — Softland v7.00 · motor Exactus",    icon:"⬡",  color:"#c0392b", bg:"rgba(192,57,43,0.05)", border:"rgba(192,57,43,0.2)" },
  ops:   { label:"Operación logística · eflow Cloud Suite", icon:"🏗", color:"#1abc9c", bg:"rgba(26,188,156,0.08)",border:"rgba(26,188,156,0.25)" },
  sat:   { label:"Sistemas satélite · externos / inferidos",icon:"🛰", color:"#9b59b6", bg:"rgba(155,89,182,0.08)",border:"rgba(155,89,182,0.22)" },
};

// Módulos únicos por categoría para los selectores de filtro
function getModules(cat){
  const rows = cat==="global" ? INTEGRATIONS : INTEGRATIONS.filter(r=>rowCategory(r)===cat);
  const codes = new Set();
  rows.forEach(r=>{ codes.add(r.from); codes.add(r.to); });
  return ["*",...[...codes].sort()];
}

function IntegTable({ rows }) {
  const thS={padding:"10px 14px",color:"#666",fontWeight:700,letterSpacing:"0.05em",fontSize:11,textTransform:"uppercase"};
  const tdS={padding:"10px 14px",verticalAlign:"top"};
  if (!rows.length) return <div style={{ padding:"24px", textAlign:"center", color:"#888", fontSize:13 }}>Sin resultados para los filtros seleccionados.</div>;
  return <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
    <thead><tr style={{ background:"#fafafa", textAlign:"left" }}>
      <th style={thS}>Origen</th><th style={thS}>Destino</th><th style={thS}>Qué fluye</th><th style={{...thS,textAlign:"right"}}>Estado</th>
    </tr></thead>
    <tbody>{rows.map((i,idx)=><tr key={idx} style={{ borderTop:"1px solid #f0f0f0" }}>
      <td style={tdS}><ModuleChip code={i.from}/></td>
      <td style={tdS}><ModuleChip code={i.to}/></td>
      <td style={{...tdS,color:"#444",lineHeight:1.5}}>{i.what}</td>
      <td style={{...tdS,textAlign:"right"}}><StatusBadge status={i.status}/></td>
    </tr>)}</tbody>
  </table>;
}

function IntegrationsView() {
  const [cat, setCat] = useState("global");
  const [fFrom, setFFrom] = useState("*");
  const [fTo, setFTo] = useState("*");
  const [fStatus, setFStatus] = useState("*");
  const [fWhat, setFWhat] = useState("");

  // reset filtros al cambiar categoría
  const handleCat = c => { setCat(c); setFFrom("*"); setFTo("*"); setFStatus("*"); setFWhat(""); };

  const baseRows = cat==="global" ? INTEGRATIONS : INTEGRATIONS.filter(r=>rowCategory(r)===cat);
  const filtered = baseRows.filter(r=>{
    if (fFrom!=="*" && r.from!==fFrom) return false;
    if (fTo!=="*" && r.to!==fTo) return false;
    if (fStatus!=="*" && r.status!==fStatus) return false;
    if (fWhat && !r.what.toLowerCase().includes(fWhat.toLowerCase())) return false;
    return true;
  });

  const fromOpts = getModules(cat);
  const toOpts   = getModules(cat);

  const selStyle = { fontSize:11, border:"1px solid #ddd", borderRadius:6, padding:"5px 8px", background:"#fff", color:"#333", cursor:"pointer", fontFamily:"inherit" };
  const inputStyle = { fontSize:11, border:"1px solid #ddd", borderRadius:6, padding:"5px 8px", background:"#fff", color:"#333", fontFamily:"inherit", minWidth:160 };

  return <div>
    {/* Selector de categoría */}
    <div style={{ display:"flex", gap:6, marginBottom:18, flexWrap:"wrap" }}>
      {Object.entries(CAT_META).map(([key,m])=>{
        const isA = cat===key;
        const count = key==="global" ? INTEGRATIONS.length : INTEGRATIONS.filter(r=>rowCategory(r)===key).length;
        return <button key={key} onClick={()=>handleCat(key)} style={{ display:"flex", alignItems:"center", gap:7, padding:"8px 14px", borderRadius:8, border:`1px solid ${isA?m.color:m.border}`, background:isA?m.bg:"#ffffff", cursor:"pointer", fontFamily:"inherit", transition:"all 0.15s" }}>
          <span style={{ fontSize:14 }}>{m.icon}</span>
          <span style={{ fontSize:11, fontWeight:isA?700:500, color:isA?m.color:"#555" }}>{key==="global"?"Global · todos":m.label.split("·")[0].trim()}</span>
          <span style={{ fontSize:10, fontWeight:700, color:isA?m.color:"#888", background:isA?m.color+"18":"#f0f0f0", padding:"1px 7px", borderRadius:10 }}>{count}</span>
        </button>;
      })}
    </div>

    {/* Banner de categoría activa */}
    {cat!=="global" && <div style={{ background:CAT_META[cat].bg, border:`1px solid ${CAT_META[cat].border}`, borderLeft:`3px solid ${CAT_META[cat].color}`, borderRadius:8, padding:"10px 14px", marginBottom:14, fontSize:12, color:"#555", lineHeight:1.5 }}>
      <b style={{ color:CAT_META[cat].color }}>{CAT_META[cat].icon} {CAT_META[cat].label}</b>
      {cat==="erp" && " — integraciones intra-suite declaradas explícitamente en los manuales oficiales."}
      {cat==="ops" && " — integraciones entre ERP Softland y la plataforma eflow Cloud Suite. Mecanismo concreto (batch/WS/BD intermedia) no documentado."}
      {cat==="sat" && " — integraciones con sistemas externos inferidos por contexto. Sin documentación formal en el corpus accesible."}
    </div>}
    {cat==="global" && <div style={{ background:"rgba(41,128,185,0.06)", border:"1px solid rgba(41,128,185,0.22)", borderLeft:"3px solid #2980b9", borderRadius:8, padding:"10px 14px", marginBottom:14, fontSize:12, color:"#666", lineHeight:1.6 }}>
      Las integraciones intra-Softland están <b style={{ color:"#27ae60" }}>declaradas explícitamente</b> en la sección "Integración" de cada manual. Las del lado operativo y externo están parcialmente confirmadas o inferidas.
    </div>}

    {/* Filtros */}
    <div style={{ display:"flex", gap:8, marginBottom:14, flexWrap:"wrap", alignItems:"center", padding:"10px 14px", background:"#fafafa", border:"1px solid #e8e8e8", borderRadius:8 }}>
      <span style={{ fontSize:11, color:"#888", fontWeight:600, marginRight:4 }}>Filtros:</span>
      <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
        <label style={{ fontSize:9, color:"#aaa", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em" }}>Origen</label>
        <select value={fFrom} onChange={e=>setFFrom(e.target.value)} style={selStyle}>
          <option value="*">Todos</option>
          {fromOpts.filter(c=>c!=="*").map(c=><option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
        <label style={{ fontSize:9, color:"#aaa", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em" }}>Destino</label>
        <select value={fTo} onChange={e=>setFTo(e.target.value)} style={selStyle}>
          <option value="*">Todos</option>
          {toOpts.filter(c=>c!=="*").map(c=><option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
        <label style={{ fontSize:9, color:"#aaa", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em" }}>Estado</label>
        <select value={fStatus} onChange={e=>setFStatus(e.target.value)} style={selStyle}>
          <option value="*">Todos</option>
          <option value="confirmed">Confirmado</option>
          <option value="partial">Parcial</option>
          <option value="inferred">Inferido</option>
        </select>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
        <label style={{ fontSize:9, color:"#aaa", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em" }}>Qué fluye</label>
        <input value={fWhat} onChange={e=>setFWhat(e.target.value)} placeholder="buscar…" style={inputStyle}/>
      </div>
      <div style={{ marginLeft:"auto", display:"flex", alignItems:"flex-end", paddingBottom:1 }}>
        <span style={{ fontSize:11, color:"#888" }}><b style={{ color:"#444" }}>{filtered.length}</b> / {baseRows.length} registros</span>
      </div>
      {(fFrom!=="*"||fTo!=="*"||fStatus!=="*"||fWhat) && <button onClick={()=>{setFFrom("*");setFTo("*");setFStatus("*");setFWhat("");}} style={{ fontSize:10, color:"#c0392b", background:"none", border:"1px solid #ef9a9a", borderRadius:5, padding:"4px 10px", cursor:"pointer", fontFamily:"inherit" }}>✕ Limpiar</button>}
    </div>

    {/* Tabla */}
    <div style={{ background:"#ffffff", border:"1px solid #e0e0e0", borderRadius:10, overflow:"hidden", overflowX:"auto" }}>
      <IntegTable rows={filtered}/>
    </div>
  </div>;
}
function ContextView() {
  return <div>
    <SectionTitle>Localizaciones</SectionTitle>
    <p style={{ fontSize:12, color:"#777", margin:"0 0 14px 0", lineHeight:1.55 }}>Costa Rica es la operación activa con todo el stack calibrado. Venezuela es la próxima expansión y aún tiene gaps de configuración fiscal por resolver — pendiente identificar SENIAT, tarifas de IVA venezolanas y formato de libros fiscales locales.</p>
    <div style={{ display:"grid", gap:10, marginBottom:28 }}>
      {LOCALIZATIONS.map((l,i)=>{ const t=STATUS_VIS[l.status]; return <div key={i} style={{ display:"flex", alignItems:"baseline", gap:16, background:"#ffffff", border:`1px solid ${t.border}`, borderLeft:`4px solid ${t.color}`, padding:"12px 16px", borderRadius:8, flexWrap:"wrap" }}><span style={{ fontSize:16, fontWeight:700, color:"#1D1D1B", minWidth:130 }}>{l.country}</span><StatusBadge status={l.status} size="lg"/><span style={{ fontSize:12, color:"#666", flex:1, lineHeight:1.5 }}>{l.detail}</span></div>; })}
    </div>
    <SectionTitle>Puntos de extensión</SectionTitle>
    <p style={{ fontSize:12, color:"#777", margin:"0 0 14px 0" }}>Mecanismos documentados en los manuales para integrar lógica externa al ERP.</p>
    <div style={{ display:"grid", gap:8, marginBottom:28 }}>
      {EXTENSION_POINTS.map((p,i)=><div key={i} style={{ background:"#ffffff", border:"1px solid #e0e0e0", borderLeft:"3px solid #7B1FA2", borderRadius:8, padding:"10px 14px" }}><div style={{ fontSize:11, fontWeight:700, color:"#7B1FA2", letterSpacing:"0.05em", marginBottom:4, textTransform:"uppercase" }}>{p.type}</div><p style={{ fontSize:12, color:"#555", lineHeight:1.55, margin:0 }}>{p.detail}</p></div>)}
    </div>
    <SectionTitle>Brechas declaradas</SectionTitle>
    <p style={{ fontSize:12, color:"#777", margin:"0 0 14px 0" }}>Vacíos reconocidos en la documentación accesible — candidatos a levantamiento.</p>
    <div style={{ display:"grid", gap:8 }}>
      {GAPS.map((g,i)=><div key={i} style={{ display:"flex", gap:12, alignItems:"flex-start", background:"#fbe9e7", border:"1px solid #ef9a9a", borderLeft:"3px solid #c0392b", borderRadius:8, padding:"10px 14px" }}><span style={{ fontSize:10, fontWeight:700, color:"#c0392b", fontFamily:"'JetBrains Mono','Consolas',monospace", background:"#ffffff", padding:"2px 7px", borderRadius:4, whiteSpace:"nowrap", flexShrink:0 }}>GAP·{(i+1).toString().padStart(2,"0")}</span><span style={{ fontSize:12, color:"#555", lineHeight:1.55 }}>{g}</span></div>)}
    </div>
  </div>;
}

// ═══════════════════════════════════════════════════════════════════════════
// TABS — mismos 6 del v0.4 + nueva tab Arquitectura OLO al inicio
// ═══════════════════════════════════════════════════════════════════════════
const TABS = [
  { id:"olo-arch",     label:"⌂ Inicio",              sub:"Diagrama operativo · eFlow (CR/VE) · Lago de Datos · Suite OLO · Middleware · Sistemas del Estado" },
  { id:"ecosystem",    label:"◉ Ecosistema",          sub:"Mapa de capas: externos · ERP · operación · satélites" },
  { id:"bpa",          label:"◈ BPA · OLO",           sub:"Modelo de procesos · 4 áreas · 30 procesos · cobertura por sistema" },
  { id:"softland",     label:"⬡ Módulos ERP",         sub:"Catálogo de módulos Softland · click para detalle y entidades inferidas" },
  { id:"ops",          label:"🏗 Operación",          sub:"eflow Cloud Suite · WMS Desktop / RF / WMH Torre de Control" },
  { id:"integrations", label:"⟳ Integraciones",      sub:"Matriz inter-módulo · qué fluye, en qué dirección, con qué estado" },
  { id:"context",      label:"◐ Contexto",            sub:"Localizaciones · puntos de extensión · brechas declaradas" },
];

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════
export default function SoftlandArchitectureMap() {
  const [tab, setTab] = useState("olo-arch");
  const [bpaSel, setBpaSel] = useState(null);
  const [slSel, setSlSel] = useState(null);
  const [opsSel, setOpsSel] = useState(null);

  const handleTab = id => { setTab(id); setBpaSel(null); setSlSel(null); setOpsSel(null); };
  const activeTab = TABS.find(t => t.id === tab);
  const totalProcs = BPA_PROCESSES.estrategicos.length + BPA_PROCESSES.negocio.length + BPA_PROCESSES.apoyo.length + BPA_PROCESSES.control.length;

  return <div style={{ fontFamily:"'Segoe UI','Helvetica Neue',system-ui,sans-serif", background:"#f8f9fa", color:"#1D1D1B", minHeight:"100vh", padding:"20px 16px 64px 16px" }}>
    <style>{`@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500;700&display=swap');body{margin:0;}::selection{background:#1D1D1B;color:#fff;}`}</style>
    <div style={{ maxWidth:1100, margin:"0 auto" }}>

      {/* Header */}
      <div style={{ marginBottom:16 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", flexWrap:"wrap", gap:12, marginBottom:4 }}>
          <h1 style={{ fontSize:24, fontWeight:700, color:"#1D1D1B", margin:0, letterSpacing:"-0.02em" }}>Arquitectura OLO — Softland v7.00 · eflow Cloud Suite</h1>
          <span style={{ fontSize:11, color:"#888", letterSpacing:"0.1em", fontFamily:"'JetBrains Mono','Consolas',monospace" }}>v0.5 · CR activa · VE próxima</span>
        </div>
        <p style={{ fontSize:13, color:"#666", margin:0, lineHeight:1.5 }}>{activeTab?.sub}</p>
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", gap:2, marginBottom:18, borderBottom:"1px solid #e0e0e0", overflowX:"auto" }}>
        {TABS.map(t=>{ const isA=tab===t.id; return <button key={t.id} onClick={()=>handleTab(t.id)} style={{ background:isA?"#1D1D1B":"transparent", border:"none", borderBottom:isA?"2px solid #1D1D1B":"2px solid transparent", color:isA?"#fff":"#666", padding:"9px 18px", cursor:"pointer", fontSize:13, fontWeight:isA?700:500, borderRadius:"8px 8px 0 0", whiteSpace:"nowrap", fontFamily:"inherit", transition:"all 0.15s" }}>{t.label}</button>; })}
      </div>

      {/* KPI Strip */}
      <div style={{ display:"flex", gap:8, marginBottom:22, flexWrap:"wrap" }}>
        <KPICard label="Módulos Softland" value={SOFTLAND_MODULES.length} color="#c0392b" sub="con manual oficial"/>
        <KPICard label="Procesos BPA" value={totalProcs} color="#f39c12" sub="4 áreas · CICR dic-2024"/>
        <KPICard label="Operación eflow" value={OPS_MODULES.length} color="#1abc9c" sub="WMS-D · RF · WMH"/>
        <KPICard label="Integraciones" value={INTEGRATIONS.length} color="#2980b9" sub="mapeadas explícitamente"/>
        <KPICard label="Localizaciones" value={LOCALIZATIONS.length} color="#27ae60" sub="CR · VE"/>
        <KPICard label="Brechas" value={GAPS.length} color="#7f8c8d" sub="vacíos reconocidos"/>
      </div>

      {/* Contenido */}
      {tab==="olo-arch"     && <OLOArchView/>}
      {tab==="ecosystem"    && <EcosystemView/>}
      {tab==="bpa"          && <BPAView selected={bpaSel} setSelected={setBpaSel}/>}
      {tab==="softland"     && <SoftlandView selected={slSel} setSelected={setSlSel}/>}
      {tab==="ops"          && <OpsView selected={opsSel} setSelected={setOpsSel}/>}
      {tab==="integrations" && <IntegrationsView/>}
      {tab==="context"      && <ContextView/>}

      {/* Footer */}
      <footer style={{ marginTop:56, paddingTop:24, borderTop:"1px solid #e0e0e0", display:"flex", justifyContent:"space-between", alignItems:"baseline", flexWrap:"wrap", gap:12, fontSize:11, color:"#888" }}>
        <span>17 manuales Softland · 7 guías eflow · 1 informe BPA · 0 acceso a esquema · 0 acceso a configuración real</span>
        <span style={{ fontFamily:"'JetBrains Mono','Consolas',monospace" }}>v0.5 · próxima iteración: AS · POS · FR · AC · Capital Humano</span>
      </footer>
    </div>
  </div>;
}