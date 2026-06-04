import { useState, useRef, useEffect, useCallback } from "react";

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
  // ── Clusters del ecosistema (Inicio) ──────────────────────────────────────
  // Intermedia Lago de Datos
  { from:"Intermedia", to:"Power BI",    what:"Lago de Datos → Power BI · datos del ERP consolidados para reportería analítica", status:"partial" },
  { from:"Intermedia", to:"Suite OLO",   what:"Lago de Datos → Suite OLO · distribución de datos del ERP hacia módulos OLO", status:"partial" },
  // Suite OLO · Integración de Data (vía OLO API)
  { from:"OLO API",    to:"GoRamp",      what:"Suite OLO → GoRamp · gestión de rampas y puertas de carga vía OLO API", status:"partial" },
  { from:"OLO API",    to:"Trade",       what:"Suite OLO → Trade/eTrade · gestión de comercio exterior vía OLO API", status:"partial" },
  { from:"OLO API",    to:"Liq. Viajes", what:"Suite OLO → Liquidador de Viajes · cálculo y cierre de viajes vía OLO API", status:"partial" },
  { from:"OLO API",    to:"RFID",        what:"Suite OLO → RFID · trazabilidad de inventario por radiofrecuencia vía OLO API", status:"inferred" },
  { from:"OLO API",    to:"Raga Orders", what:"Suite OLO → Next Raga Orders / RAGA.x · gestión de órdenes vía plataforma Raga", status:"partial" },
  { from:"OLO API",    to:"Pricing",     what:"Suite OLO → Pricing · motor de tarifas y precios logísticos vía OLO API", status:"partial" },
  // Interfaces de Sistema (vía ePRAC)
  { from:"ePRAC",      to:"CCA",         what:"ePRAC → CCA · interface directa con core de negocio OLO", status:"partial" },
  { from:"ePRAC",      to:"Fac. Svc",    what:"ePRAC → Facturación de Servicios · facturación de servicios logísticos vía ePRAC", status:"partial" },
  { from:"ePRAC",      to:"MPF",         what:"ePRAC → MPF · interface MPF gestionada vía sistema ePRAC", status:"partial" },
  // Integraciones Internas
  { from:"eflow",      to:"Mecalux",     what:"eflow → Mecalux · integración con almacenaje automatizado (regla FLOW MECALUX confirmada en WMH)", status:"partial" },
  { from:"eflow",      to:"Tec. Tiempo", what:"eflow → Sistemas de Tiempo · control de tiempo y asistencia del personal logístico", status:"inferred" },
  // Middleware
  { from:"Middleware", to:"Suite OLO",   what:"Middleware → Suite OLO · orquestación de flujos hacia clientes vía capa RagaNext", status:"partial" },
  { from:"Middleware", to:"Compiere",    what:"Middleware → Comerc. Compiere · integración con Comercializadoras vía Middleware", status:"partial" },
  { from:"Middleware", to:"TICA",        what:"Middleware → TICA · integración con sistema aduanero del Estado costarricense", status:"inferred" },
  { from:"Middleware", to:"Delzof",      what:"Middleware → Delzof · integración con sistema regulatorio del Estado", status:"inferred" },
  // Intermedia Multi cliente
  { from:"Intermedia", to:"Mayoreo",     what:"Intermedia → Mayoreo (Cofersa, Febeca, Siliaca) · distribución de datos hacia clientes mayoreo", status:"partial" },
  { from:"Intermedia", to:"EPA",         what:"Intermedia → EPA (CR y VE) · distribución de datos hacia segmento EPA", status:"partial" },
  { from:"Intermedia", to:"Compiere",    what:"Intermedia → Comerc. Compiere · distribución de datos hacia Comercializadoras Compiere", status:"partial" },
  { from:"Intermedia", to:"OLO System",  what:"Intermedia → Comerc. OLO System · distribución de datos hacia OLO System", status:"partial" },
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
const CLUSTER_COLORS = {
  "Intermedia":"#6B7280","OLO API":"#059669","ePRAC":"#D97706","Middleware":"#7B1FA2",
  "Suite OLO":"#185FA5","GoRamp":"#059669","Trade":"#d35400","Liq. Viajes":"#185FA5",
  "RFID":"#555555","Raga Orders":"#7B1FA2","Pricing":"#185FA5","CCA":"#5B21B6",
  "Fac. Svc":"#5B21B6","MPF":"#5B21B6","Mayoreo":"#78350F","EPA":"#065F46",
  "Compiere":"#6B7280","OLO System":"#6B7280","TICA":"#475569","Delzof":"#475569",
  "Power BI":"#D97706","Tec. Tiempo":"#94A3B8","eflow":"#185FA5",
};

// ═══════════════════════════════════════════════════════════════════════════
// PRIMITIVAS
// ═══════════════════════════════════════════════════════════════════════════
function StatusBadge({ status, size="sm" }) {
  const t = STATUS_VIS[status] ?? STATUS_VIS.inferred;
  return <span style={{ display:"inline-block", fontSize:size==="lg"?11:10, fontWeight:700, color:t.color, background:t.bg, border:`1px solid ${t.border}`, padding:size==="lg"?"4px 10px":"2px 8px", borderRadius:4, letterSpacing:"0.04em", textTransform:"uppercase", whiteSpace:"nowrap" }}>{t.label}</span>;
}
function ModuleChip({ code, color, size="sm" }) {
  const c = color ?? MODULE_COLORS[code] ?? OPS_COLORS[code] ?? CLUSTER_COLORS[code] ?? "#7f8c8d";
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
// ═══════════════════════════════════════════════════════════════════════════
// VISTA · ARQUITECTURA OLO — TO-BE (Solución Propuesta)
// ═══════════════════════════════════════════════════════════════════════════

function OLOArchView() {
  const [selectedNode, setSelectedNode] = useState(null);
  const [hoveredNode,  setHoveredNode]  = useState(null);

  // ── Edit mode state ────────────────────────────────────────────────────────
  const [editMode,       setEditMode]       = useState(false);
  const [nodeOverrides,  setNodeOverrides]  = useState(() => {
    try { return JSON.parse(localStorage.getItem('olo-node-ov')) ?? {}; } catch { return {}; }
  });
  const [editConns,      setEditConns]      = useState(() => {
    try { const s=localStorage.getItem('olo-conns'); return s?JSON.parse(s):null; } catch { return null; }
  });
  const [connectFrom,    setConnectFrom]    = useState(null);
  const [mousePos,       setMousePos]       = useState({x:580,y:310});
  const [hovConn,        setHovConn]        = useState(null);
  const [routeMode,      setRouteMode]      = useState('bezier'); // 'bezier' | 'ortho'
  const dragRef = useRef(null);   // {type, id, ox, oy, [ow, oh, handle], mx0, my0, moved}
  const svgRef  = useRef(null);

  const svgPt = useCallback((e) => {
    const r = svgRef.current?.getBoundingClientRect();
    if (!r) return {x:0,y:0};
    return { x:(e.clientX-r.left)*(1160/r.width), y:(e.clientY-r.top)*(620/r.height) };
  }, []);

  useEffect(() => {
    const onMove = (e) => {
      const d = dragRef.current; if (!d) return;
      const pt = svgPt(e);
      const dx=pt.x-d.mx0, dy=pt.y-d.my0;
      if (Math.abs(dx)>2||Math.abs(dy)>2) d.moved = true;
      if (!d.moved) return;

      if (d.type==='zone-resize') {
        let up={};
        const MIN_W=60, MIN_H=40;
        if      (d.handle==='nw') up={x:d.ox+dx,y:d.oy+dy,w:Math.max(MIN_W,d.ow-dx),h:Math.max(MIN_H,d.oh-dy)};
        else if (d.handle==='ne') up={y:d.oy+dy,w:Math.max(MIN_W,d.ow+dx),h:Math.max(MIN_H,d.oh-dy)};
        else if (d.handle==='se') up={w:Math.max(MIN_W,d.ow+dx),h:Math.max(MIN_H,d.oh+dy)};
        else if (d.handle==='sw') up={x:d.ox+dx,w:Math.max(MIN_W,d.ow-dx),h:Math.max(MIN_H,d.oh+dy)};
        setNodeOverrides(prev=>({...prev,[d.id]:{...(prev[d.id]||{}),...up}}));
      } else {
        // zone-move y node-move: solo x,y
        setNodeOverrides(prev=>({...prev,[d.id]:{...(prev[d.id]||{}),x:d.ox+dx,y:d.oy+dy}}));
      }
    };
    const onUp = () => {
      if (!dragRef.current) return;
      dragRef.current = null;
      setNodeOverrides(prev => { localStorage.setItem('olo-node-ov',JSON.stringify(prev)); return prev; });
    };
    const onKey = (e) => { if(e.key==='Escape') setConnectFrom(null); };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup',   onUp);
    window.addEventListener('keydown',   onKey);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup',   onUp);
      window.removeEventListener('keydown',   onKey);
    };
  }, [svgPt]);

  const nodes = {
    // ── On-Premise OLO ───────────────────────────────────────────────────────
    eflow_api:    { id:"eflow_api",    label:"eflow_api",              x:40,  y:68,  w:74,  h:24, color:"#1D4ED8", bg:"#DBEAFE", desc:"API de eFlow.\nEscribe en la DB Intermedia eFlow.\n• dev/qa: 10.17.224.224  • prod: 10.17.224.20" },
    db_intermedia:{ id:"db_intermedia",label:"db Intermedia eFlow",    x:40,  y:104, w:110, h:18, color:"#6B7280", bg:"#F3F4F6", desc:"DB staging intermedia de eFlow.\nReplica y migra datos hacia db eFlow." },
    db_eflow:     { id:"db_eflow",     label:"db eFlow",               x:186, y:104, w:68,  h:18, color:"#6B7280", bg:"#F3F4F6", desc:"Base de datos final de eFlow.\nConsolida datos de la DB intermedia.\nRelación BIDIRECCIONAL con ePrac/SQL Server:\nalimenta y recibe retroalimentación (1.3/1.4, v3)." },
    eprac:        { id:"eprac",        label:"ePrac (SQL Server)",     x:192, y:56,  w:100, h:28, color:"#7C3AED", bg:"#EDE9FE", desc:"ePrac · SQL Server.\nRelación bidireccional con db eFlow: lectura/escritura (1.4, v3).\nFlujo bidireccional con Softland: Facturación de Servicios (2.1).\n• qa: 10.17.224.226  • prod: 10.48.17.91" },
    // ── Softland ─────────────────────────────────────────────────────────────
    softland:     { id:"softland",     label:"Softland",               x:40,  y:183, w:130, h:44, color:"#1D4ED8", bg:"#EBF3FB", desc:"ERP Softland v7.00 · motor Exactus.\nFlujo bidireccional con ePrac: Facturación de Servicios (2.1).\nSOLO conecta con ePrac — sin conexión directa a entidades fuente (v4)." },
    // ── Fuentes / clientes ───────────────────────────────────────────────────
    terceros:     { id:"terceros",     label:"Terceros",               x:183, y:278, w:87,  h:26, color:"#374151", bg:"#F9FAFB", desc:"Terceros — Navieras, Proveedores de Servicio, Puertos.\n→ RagaNext: OC, Navieras, Proveedor Servicio, Puertos, Tipo Contenedor, Tarifa, Transporte (BLOQUE 3).\n← Softland: Orden de Pedido, Expedición (BLOQUE 4).\n← RagaNext (retorno): datos consolidados OLO (BLOQUE 10)." },
    comercializadoras:{ id:"comercializadoras",label:"Comercializadoras",x:128,y:334,w:112,h:26, color:"#374151", bg:"#F9FAFB", desc:"Comercializadoras.\n→ RagaNext: Artículos (3.2 / 5.7).\n← RagaNext (retorno): Artículos (5.9).\nSOLO interactúa con RagaNext (v4)." },
    mayoreo:      { id:"mayoreo",      label:"Mayoreo",                x:128, y:393, w:87,  h:26, color:"#374151", bg:"#F9FAFB", desc:"Mayoreo (Cofersa, Febeca, Siliaca).\n→ RagaNext: OC, Proveedor, Artículo, Ajuste, Expedición, Cliente, Recibo/Traspasos, Recepción, Distribución, Ubicaciones (BLOQUE 3).\n← RagaNext: mismos datos (BLOQUE 10)." },
    epa:          { id:"epa",          label:"EPA",                    x:128, y:451, w:77,  h:26, color:"#374151", bg:"#F9FAFB", desc:"EPA (CR y VE).\n→ RagaNext: OC, Proveedor, Artículo, Ajuste, Expedición, Cliente, Recibo/Traspasos, Recepción, Distribución, Ubicaciones (BLOQUE 3).\n← RagaNext: mismos datos (BLOQUE 10)." },
    // ── Zone anchors — coinciden con los recuadros del SVG ──────────────────
    // En modo edición se renderizan como borde punteado clickeable
    onpremise_zone:  { id:"onpremise_zone",  label:"OLO · ON-PREMISE",          x:20,  y:26,  w:282, h:112, color:"#60a5fa", bg:"transparent", type:"zone", desc:"Zona OLO · ON-PREMISE\nEntidades: ePrac (SQL Server) · db eFlow · db Intermedia · eflow_api" },
    vias_zone:       { id:"vias_zone",       label:"Vías de Entradas",           x:388, y:56,  w:78,  h:114, color:"#C026D3", bg:"transparent", type:"zone", desc:"Zona Vías de Entradas (AWS OLO)\nEntidades: APIs · S3" },
    aws_zone:        { id:"aws_zone",        label:"AWS OLO · Servicios OLO",    x:378, y:26,  w:646, h:202, color:"#f59e0b", bg:"transparent", type:"zone", desc:"Zona AWS OLO · Servicios OLO\nEntidades: Colas · Persistencia · Repositorio · Monitor · Normalización · RDS · Lago de Datos · Notificación" },
    clientes_zone:   { id:"clientes_zone",   label:"Clientes / ERP",             x:16,  y:156, w:334, h:362, color:"#94a3b8", bg:"transparent", type:"zone", desc:"Zona Clientes / ERP\nEntidades: Softland · Terceros · Comercializadoras · Mayoreo · EPA" },
    middleware_zone: { id:"middleware_zone", label:"Middleware",                  x:348, y:474, w:596, h:68,  color:"#f87171", bg:"transparent", type:"zone", desc:"Zona Capa de Integración · Middleware\nEntidades: RagaNext · API Dimensionador · OLO API · Mecalux · Trade" },
    azure_zone:      { id:"azure_zone",      label:"Azure",                      x:1030,y:36,  w:122, h:216, color:"#60a5fa", bg:"transparent", type:"zone", desc:"Zona Azure · servicios cloud externos\nEntidades: SRO · APOLLO · Última Milla · Liquidador de Viajes" },
    // ── AWS — Vías de Entradas ───────────────────────────────────────────────
    apis:         { id:"apis",         label:"APIs",                   x:408, y:80,  w:50,  h:28, color:"#C026D3", bg:"#FAE8FF", desc:"Vía de Entrada AWS OLO · REST/HTTP síncronos.\nEl recuadro Vías de Entradas conecta con OLO ON-PREMISE y Softland.\nÚnica salida hacia AWS: Colas de Eventos." },
    s3:           { id:"s3",           label:"S3",                     x:408, y:126, w:50,  h:28, color:"#569A31", bg:"#ECFCCB", desc:"Vía de Entrada AWS OLO · Amazon S3.\nEl recuadro Vías de Entradas conecta con OLO ON-PREMISE y Softland.\nÚnica salida hacia AWS: Colas de Eventos." },
    // ── AWS pipeline (fila superior) ─────────────────────────────────────────
    cola_eventos: { id:"cola_eventos", label:"Colas de Eventos",      x:512, y:68,  w:88,  h:32, color:"#C026D3", bg:"#FAE8FF", desc:"Lambda: encola eventos para procesamiento asíncrono (BLOQUE 6, conexión 12).\nRecibe de APIs y de S3." },
    persistencia_eventos:{ id:"persistencia_eventos",label:"Persistencia de Eventos",x:630,y:68,w:104,h:32,color:"#FF9900",bg:"#FFF7ED",desc:"Lambda: guarda el evento crudo antes de cualquier transformación (BLOQUE 6, conexión 13)." },
    repositorio_eventos: { id:"repositorio_eventos", label:"Repositorio de Eventos",x:764,y:68,w:104,h:32,color:"#FF9900",bg:"#FFF7ED",desc:"BD de eventos crudos · auditoría y replay (BLOQUE 6, conexión 14)." },
    monitor_eventos:     { id:"monitor_eventos",     label:"Monitor de Eventos",    x:898,y:68,w:100,h:32,color:"#FF9900",bg:"#FFF7ED",desc:"Lambda: detecta anomalías, retrasos o eventos sin procesar (4.5).\nMonitorea el Repositorio de Eventos.\nTambién conecta hacia Azure: envía alertas y eventos (6.5, v3)." },
    // ── AWS data row ─────────────────────────────────────────────────────────
    normalizacion:{ id:"normalizacion",label:"Normalización, Traducción y Persistencia",x:512,y:124,w:108,h:40,color:"#FF9900",bg:"#FFF7ED",desc:"Lambda central (BLOQUE 6, conexión 16):\nnormaliza formato, traduce modelo de datos,\npersiste en Repositorio OLO y notifica por tópico SNS/SQS." },
    amazon_rds_1: { id:"amazon_rds_1", label:"Repositorio OLO (RDS)", x:650, y:128, w:104, h:34, color:"#C026D3", bg:"#FAE8FF", desc:"Amazon RDS — Repositorio OLO (BLOQUE 6, conexión 17).\nAlmacena datos normalizados listos para OLO API y otros servicios." },
    amazon_rds_2: { id:"amazon_rds_2", label:"λ Traducción Analítica",x:780, y:128, w:100, h:34, color:"#FF9900", bg:"#FFF7ED", desc:"Lambda de traducción analítica (BLOQUE 6, conexión 19).\nConvierte el modelo del Repositorio OLO al modelo del Data Lake." },
    lago_datos:   { id:"lago_datos",   label:"Lago de Datos",         x:906, y:133, w:88,  h:26, color:"#374151", bg:"#F3F4F6", desc:"Lago de Datos (Amazon RDS).\nDatos analíticos para reporting y BI." },
    // ── Notificación ─────────────────────────────────────────────────────────
    notificacion: { id:"notificacion", label:"Notificación por Tópico",x:512,y:188, w:130, h:24, color:"#FF9900",bg:"#FFF7ED",desc:"SNS/SQS Pub/Sub (BLOQUE 6, conexión 18).\nPublica evento normalizado a suscriptores (BLOQUE 7):\nRagaNext · API Dimensionador · OLO API · Mecalux · Trade." },
    // ── Middleware / suscriptores ─────────────────────────────────────────────
    raganext:     { id:"raganext",     label:"RagaNext (Middleware)",  x:350, y:498, w:120, h:32, color:"#DC2626", bg:"#FEE2E2", desc:"RagaNext — Middleware central de integración.\nRecibe de: Terceros, Comercializadoras, Mayoreo, EPA (D1–D4).\nSuscriptor del tópico de notificación (5.1).\nRetorna datos a: Terceros, Comercializadoras, Mayoreo, EPA (5.8–5.11)." },
    api_dim:      { id:"api_dim",      label:"API Dimensionador",      x:502, y:498, w:100, h:32, color:"#7C3AED", bg:"#EDE9FE", desc:"API Dimensionador (BLOQUE 7, conexión 21).\nCalcula dimensiones y capacidades logísticas a partir de eventos." },
    olo_api:      { id:"olo_api",      label:"OLO API",                x:632, y:498, w:72,  h:32, color:"#059669", bg:"#D1FAE5", desc:"OLO API — Gateway centralizado.\nSuscriptor del tópico de notificación (E3).\nConexión directa a Mecalux: datos de almacén, ubicaciones, distribución (E6).\nConexión bidireccional con Azure (F1–F4):\nSRO · APOLLO · Última Milla · Liquidador de Viajes." },
    mecalux:      { id:"mecalux",      label:"Mecalux",                x:732, y:498, w:72,  h:32, color:"#D97706", bg:"#FEF3C7", desc:"Mecalux — WMS · Warehouse Management System (BLOQUE 7, conexión 23).\nRecibe eventos de distribución y ubicaciones." },
    trade:        { id:"trade",        label:"Trade",                  x:834, y:498, w:62,  h:32, color:"#DC2626", bg:"#FEE2E2", desc:"Trade — Sistema de comercio (BLOQUE 7, conexión 24).\nRecibe eventos OLO: órdenes, expediciones.\nIntermediario hacia Proveedores (BLOQUE 9)." },
    proveedores:  { id:"proveedores",  label:"Proveedores",            x:802, y:570, w:90,  h:26, color:"#374151", bg:"#F9FAFB", desc:"Proveedores externos (BLOQUE 9, conexión 29).\nTrade actúa como intermediario." },
    // ── Azure (BLOQUE 8 / Capa 6) ────────────────────────────────────────────
    azure:        { id:"azure",        label:"Azure",                  x:1046,y:50,  w:88,  h:22, color:"#0078D4", bg:"#E1F0FF", desc:"Microsoft Azure — servicios cloud externos.\nRecibe alertas y eventos del Monitor de Eventos (6.5).\nAloja: SRO · APOLLO · Última Milla · Liquidador de Viajes." },
    sro:          { id:"sro",          label:"SRO",                    x:1050,y:108, w:80,  h:24, color:"#0078D4", bg:"#E1F0FF", desc:"Azure · SRO — Sistema de Rastreo de Órdenes.\nFlujo bidireccional de estados con OLO API (6.1)." },
    appolo:       { id:"appolo",       label:"APOLLO",                 x:1050,y:144, w:80,  h:24, color:"#0078D4", bg:"#E1F0FF", desc:"Azure · APOLLO — Planificación/routing logístico.\nIntercambia datos de expedición y transporte con OLO API (BLOQUE 8, conexión 26)." },
    ultima_milla: { id:"ultima_milla", label:"Última Milla",           x:1046,y:180, w:90,  h:24, color:"#0078D4", bg:"#E1F0FF", desc:"Azure · Última Milla — Logística de última milla.\nRecibe y confirma órdenes de entrega vía OLO API (BLOQUE 8, conexión 27)." },
    liquidador:   { id:"liquidador",   label:"Liquidador de Viajes",   x:1036,y:216, w:100, h:24, color:"#0078D4", bg:"#E1F0FF", desc:"Azure · Liquidador de Viajes — Liquidación de costos de transporte.\nOLO API envía datos para cálculo y liquidación (BLOQUE 8, conexión 28)." },
  };

  // Conexiones — 32 documentadas según arquitectura OLO
  const connections = [
    // BLOQUE 1 — ePrac/eFlow interno
    { from:"eflow_api",          to:"db_intermedia" },           // 1
    { from:"db_intermedia",      to:"db_eflow" },                // 2
    { from:"db_eflow",           to:"eprac" },                   // 3a — alimenta SQL Server
    { from:"eprac",              to:"db_eflow" },                // 3b — retroalimentación bidireccional (v3)
    // BLOQUE 2 — ePrac ↔ Softland (Facturación de Servicios, bidireccional)
    { from:"eprac",              to:"softland" },                // 4a
    { from:"softland",           to:"eprac" },                   // 4b
    // BLOQUE 3 — Fuentes → RagaNext
    { from:"terceros",           to:"raganext" },                // 5
    { from:"comercializadoras",  to:"raganext" },                // 6
    { from:"mayoreo",            to:"raganext" },                // 7
    { from:"epa",                to:"raganext" },                // 8
    // BLOQUE 4 — Softland SOLO ↔ ePrac (v4: X roja sobre Softland→Terceros)
    // Recuadro OLO ON-PREMISE ↔ recuadro Vías de Entradas (zona a zona)
    { from:"onpremise_zone",     to:"vias_zone" },
    { from:"vias_zone",          to:"onpremise_zone" },
    // Softland ↔ recuadro Vías de Entradas
    { from:"softland",           to:"vias_zone" },
    { from:"vias_zone",          to:"softland" },
    // BLOQUE 6 — Flujo interno AWS OLO
    { from:"apis",               to:"cola_eventos" },            // 12a — REST/HTTP síncronos
    { from:"s3",                 to:"cola_eventos" },            // 12b — S3 a Colas (v4: X roja sobre S3→Normalización)
    { from:"cola_eventos",       to:"persistencia_eventos" },    // 13
    { from:"persistencia_eventos",to:"repositorio_eventos" },    // 14
    { from:"repositorio_eventos",to:"monitor_eventos" },         // 15
    { from:"cola_eventos",       to:"normalizacion" },           // 16
    { from:"normalizacion",      to:"amazon_rds_1" },            // 17
    { from:"normalizacion",      to:"notificacion" },            // 18
    { from:"amazon_rds_1",       to:"amazon_rds_2" },            // 19a
    { from:"amazon_rds_2",       to:"lago_datos" },              // 19b
    // BLOQUE 7 — Notificación → Suscriptores (líneas punteadas con color por suscriptor, v3)
    { from:"notificacion",       to:"raganext",    dashed:true, color:"#3b82f6" },// 5.1 azul
    { from:"notificacion",       to:"api_dim",     dashed:true, color:"#22c55e" },// 5.2 verde
    { from:"notificacion",       to:"olo_api",     dashed:true, color:"#a855f7" },// 5.3 violeta
    { from:"notificacion",       to:"mecalux",     dashed:true, color:"#ec4899" },// 5.4 rosa
    { from:"notificacion",       to:"trade",       dashed:true, color:"#94a3b8" },// 5.5 gris
    // BLOQUE 8 — OLO API ↔ Azure (bidireccional)
    { from:"olo_api",            to:"sro" },                     // 25a
    { from:"sro",                to:"olo_api" },                 // 25b
    { from:"olo_api",            to:"appolo" },                  // 26a
    { from:"appolo",             to:"olo_api" },                 // 26b
    { from:"olo_api",            to:"ultima_milla" },            // 27a
    { from:"ultima_milla",       to:"olo_api" },                 // 27b
    { from:"olo_api",            to:"liquidador" },              // 28a
    { from:"liquidador",         to:"olo_api" },                 // 28b
    // E6 — OLO API → Mecalux (conexión directa dentro del middleware)
    { from:"olo_api",            to:"mecalux" },
    // 6.5 — Monitor de Eventos → Azure (alertas/observabilidad)
    { from:"monitor_eventos",    to:"azure",           dashed:true },
    // 3.3 — Mayoreo → Comercializadoras: ELIMINADO (v4: fuentes solo hablan con RagaNext)
    // BLOQUE 9 — Trade → Proveedores
    { from:"trade",              to:"proveedores" },             // 29
    // BLOQUE 10 — RagaNext retorna a sistemas origen (5.8–5.11)
    { from:"raganext",           to:"terceros",        dashed:true },// 5.8
    { from:"raganext",           to:"comercializadoras",dashed:true },// 5.9
    { from:"raganext",           to:"mayoreo",         dashed:true },// 5.10
    { from:"raganext",           to:"epa",             dashed:true },// 5.11
  ];

  // ── Versiones efectivas (base + overrides de edición) ─────────────────────
  const effNodes = Object.fromEntries(
    Object.entries(nodes).map(([k,v]) =>
      [k, nodeOverrides[k] ? {...v, ...nodeOverrides[k]} : v]
    )
  );
  const effConns = editConns ?? connections;

  // ── Edit mode handlers ─────────────────────────────────────────────────────
  const handleNodeDown = (e, id) => {
    if (!editMode) return;
    if (effNodes[id]?.type==='zone') return; // zonas: solo conectar, no arrastrar
    if (connectFrom !== null) return;
    e.stopPropagation(); e.preventDefault();
    const n = effNodes[id];
    dragRef.current = {id, ox:n.x, oy:n.y, mx0:svgPt(e).x, my0:svgPt(e).y, moved:false};
  };
  const handleNodeClick = (e, id) => {
    if (!editMode) { setSelectedNode(prev => prev===id ? null : id); return; }
    if (dragRef.current?.moved) return;
    e.stopPropagation();
    if (connectFrom===null)       { setConnectFrom(id); }
    else if (connectFrom===id)    { setConnectFrom(null); }
    else {
      const nc = [...effConns, {from:connectFrom, to:id}];
      setEditConns(nc); localStorage.setItem('olo-conns',JSON.stringify(nc)); setConnectFrom(null);
    }
  };
  const handleConnDelete = (i) => {
    const nc = effConns.filter((_,j)=>j!==i);
    setEditConns(nc); localStorage.setItem('olo-conns',JSON.stringify(nc));
  };
  const handleReset = () => {
    setNodeOverrides({}); setEditConns(null);
    localStorage.removeItem('olo-node-ov'); localStorage.removeItem('olo-conns');
  };
  const isHl = (id) => {
    if (!hoveredNode && !selectedNode) return false;
    const a = hoveredNode || selectedNode;
    if (a === id) return true;
    return effConns.some(c => (c.from === a && c.to === id) || (c.to === a && c.from === id));
  };
  const isConnHl = (c) => {
    const a = hoveredNode || selectedNode;
    return a && (c.from === a || c.to === a);
  };
  const sel = selectedNode ? effNodes[selectedNode] : null;

  // Bezier S-curve path entre nodos (usa effNodes para posiciones editadas)
  const bezierPath = (c) => {
    const f=effNodes[c.from], t=effNodes[c.to];
    if(!f||!t) return "";
    const fx=f.x+f.w/2, fy=f.y+f.h/2, tx=t.x+t.w/2, ty=t.y+t.h/2;
    const dx=tx-fx, dy=ty-fy;
    let x1,y1,x2,y2;
    if(Math.abs(dx)>Math.abs(dy)){x1=dx>0?f.x+f.w:f.x;y1=fy;x2=dx>0?t.x:t.x+t.w;y2=ty;}
    else{x1=fx;y1=dy>0?f.y+f.h:f.y;x2=tx;y2=dy>0?t.y:t.y+t.h;}
    if(Math.abs(y1-y2)<3) return `M${x1},${y1}L${x2},${y2}`;
    if(Math.abs(x1-x2)<3) return `M${x1},${y1}L${x2},${y2}`;
    if(Math.abs(dx)>Math.abs(dy)){const mx=(x1+x2)/2;return `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`;}
    const my=(y1+y2)/2;return `M${x1},${y1} C${x1},${my} ${x2},${my} ${x2},${y2}`;
  };

  // Ruta ortogonal: segmentos rectos con curvas de 90° redondeadas
  const orthoPath = (c) => {
    const f=effNodes[c.from], t=effNodes[c.to];
    if(!f||!t) return "";
    const r=10;
    const fx=f.x+f.w/2, fy=f.y+f.h/2, tx=t.x+t.w/2, ty=t.y+t.h/2;
    const dx=tx-fx, dy=ty-fy;
    let x1,y1,x2,y2;
    const horiz=Math.abs(dx)>=Math.abs(dy);
    if(horiz){ x1=dx>0?f.x+f.w:f.x; y1=fy; x2=dx>0?t.x:t.x+t.w; y2=ty; }
    else     { x1=fx; y1=dy>0?f.y+f.h:f.y; x2=tx; y2=dy>0?t.y:t.y+t.h; }
    if(Math.abs(y1-y2)<2) return `M${x1},${y1}L${x2},${y2}`;
    if(Math.abs(x1-x2)<2) return `M${x1},${y1}L${x2},${y2}`;
    if(horiz){
      const mx=(x1+x2)/2;
      const rr=Math.min(r,Math.abs(mx-x1)*0.45,Math.abs(y2-y1)*0.45,Math.abs(x2-mx)*0.45);
      if(rr<2) return `M${x1},${y1}H${mx}V${y2}H${x2}`;
      const sx=mx>x1?1:-1, sy=y2>y1?1:-1, sx2=x2>mx?1:-1;
      return `M${x1},${y1}H${mx-sx*rr}Q${mx},${y1} ${mx},${y1+sy*rr}V${y2-sy*rr}Q${mx},${y2} ${mx+sx2*rr},${y2}H${x2}`;
    } else {
      const my=(y1+y2)/2;
      const rr=Math.min(r,Math.abs(my-y1)*0.45,Math.abs(x2-x1)*0.45,Math.abs(y2-my)*0.45);
      if(rr<2) return `M${x1},${y1}V${my}H${x2}V${y2}`;
      const sy=my>y1?1:-1, sx=x2>x1?1:-1, sy2=y2>my?1:-1;
      return `M${x1},${y1}V${my-sy*rr}Q${x1},${my} ${x1+sx*rr},${my}H${x2-sx*rr}Q${x2},${my} ${x2},${my+sy2*rr}V${y2}`;
    }
  };

  const getPath = (c) => routeMode==='ortho' ? orthoPath(c) : bezierPath(c);

  return <div>
    {/* Panel de detalle */}
    {sel && <div style={{ background:"#fff", border:`1px solid ${(sel.color==="transparent"?"#888":sel.color)}33`, borderLeft:`4px solid ${sel.color==="transparent"?"#888":sel.color}`, borderRadius:10, padding:"14px 18px", marginBottom:14 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div style={{ flex:1 }}>
          <span style={{ fontSize:11, fontWeight:700, color:sel.color==="transparent"?"#888":sel.color, background:(sel.color==="transparent"?"#888":sel.color)+"15", border:`1px solid ${(sel.color==="transparent"?"#888":sel.color)}33`, padding:"3px 12px", borderRadius:6, fontFamily:"'JetBrains Mono',monospace", letterSpacing:"0.05em" }}>
            {sel.type==="zone"?"ZONA · ":""}{sel.label||sel.id}
          </span>
          <p style={{ fontSize:13, color:"#444", lineHeight:1.65, margin:"10px 0 0", whiteSpace:"pre-line", maxWidth:740 }}>{sel.desc}</p>
        </div>
        <button onClick={()=>setSelectedNode(null)} style={{ background:"none", border:"none", cursor:"pointer", color:"#888", fontSize:18, padding:4, marginLeft:12 }}>✕</button>
      </div>
    </div>}

    {/* Diagrama principal — dark professional */}
    <div style={{ background:"#0f172a", borderRadius:14, overflow:"hidden", border:"1px solid #1e293b", boxShadow:"0 8px 40px rgba(0,0,0,0.3)" }}>
      {/* Header interno */}
      <div style={{ padding:"10px 18px", borderBottom:"1px solid rgba(255,255,255,0.06)", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:10 }}>
        <span style={{ fontSize:9.5, color:"rgba(255,255,255,0.3)", fontWeight:700, letterSpacing:"0.14em" }}>ARQUITECTURA TO-BE · OLO ECOSYSTEM MAP</span>
        <div style={{ display:"flex", gap:16, alignItems:"center" }}>
          {[["#60a5fa","On-Premise"],["#fbbf24","AWS"],["#93c5fd","Azure"],["#f87171","Middleware"],["#94a3b8","Clientes"]].map(([c,l])=>(
            <div key={l} style={{ display:"flex", alignItems:"center", gap:5 }}>
              <span style={{ width:7, height:7, borderRadius:"50%", background:c, display:"inline-block", boxShadow:`0 0 6px ${c}88` }}/>
              <span style={{ fontSize:9.5, color:"rgba(255,255,255,0.38)", fontWeight:500 }}>{l}</span>
            </div>
          ))}
          <button
            onClick={()=>setRouteMode(m=>m==='bezier'?'ortho':'bezier')}
            style={{ fontSize:10, fontWeight:600, padding:"4px 10px", borderRadius:6, border:"1px solid rgba(255,255,255,0.15)", cursor:"pointer",
              background:routeMode==='ortho'?"rgba(251,191,36,0.2)":"rgba(255,255,255,0.05)",
              color:routeMode==='ortho'?"#fbbf24":"rgba(255,255,255,0.45)", letterSpacing:"0.05em" }}>
            {routeMode==='ortho'?"⌐ 90°":"∿ Curvas"}
          </button>
          <button
            onClick={() => { setEditMode(m=>!m); setConnectFrom(null); setSelectedNode(null); }}
            style={{ fontSize:10, fontWeight:700, padding:"4px 12px", borderRadius:6, border:"none", cursor:"pointer",
              background:editMode?"#ef4444":"rgba(255,255,255,0.1)", color:editMode?"#fff":"rgba(255,255,255,0.6)",
              letterSpacing:"0.06em" }}>
            {editMode ? "✓ LISTO" : "✏ EDITAR"}
          </button>
        </div>
      </div>
      {/* Barra de edición */}
      {editMode && (
        <div style={{ padding:"8px 18px", background:"rgba(239,68,68,0.12)", borderBottom:"1px solid rgba(239,68,68,0.3)", display:"flex", alignItems:"center", gap:16, flexWrap:"wrap" }}>
          <span style={{ fontSize:10, color:"#fca5a5", fontWeight:700, letterSpacing:"0.06em" }}>MODO EDICIÓN</span>
          {connectFrom
            ? <span style={{ fontSize:10, color:"#fbbf24" }}>Conectando desde <b>{effNodes[connectFrom]?.label||connectFrom}</b> — haz click en el nodo destino · <span style={{cursor:"pointer",textDecoration:"underline"}} onClick={()=>setConnectFrom(null)}>Cancelar (Esc)</span></span>
            : <span style={{ fontSize:10, color:"rgba(255,255,255,0.5)" }}>Arrastra nodos · Click en dos nodos para conectar · Click en una línea para eliminarla</span>
          }
          <div style={{ marginLeft:"auto", display:"flex", gap:8 }}>
            {(Object.keys(nodeOverrides).length>0 || editConns!==null) &&
              <button onClick={handleReset} style={{ fontSize:10, padding:"3px 10px", borderRadius:5, border:"1px solid rgba(239,68,68,0.5)", background:"transparent", color:"#fca5a5", cursor:"pointer" }}>↺ Restaurar original</button>
            }
          </div>
        </div>
      )}

      <svg ref={svgRef} viewBox="0 0 1160 620" style={{ width:"100%", height:"auto", display:"block", fontFamily:"'Segoe UI',sans-serif", cursor:editMode?(connectFrom?"crosshair":"default"):"default" }}
        onMouseMove={e=>{ if(editMode&&connectFrom) setMousePos(svgPt(e)); }}
        onClick={()=>{ if(editMode&&connectFrom) setConnectFrom(null); }}>
        <defs>
          <filter id="ndrop" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="2" stdDeviation="5" floodColor="#000" floodOpacity="0.55"/>
          </filter>
          <filter id="selglow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="6" result="b"/>
            <feFlood floodColor="#60a5fa" floodOpacity="0.55" result="col"/>
            <feComposite in="col" in2="b" operator="in" result="glow"/>
            <feMerge><feMergeNode in="glow"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <marker id="arrD"  viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M1 2L8 5L1 8" fill="none" stroke="rgba(148,163,184,0.5)" strokeWidth="1.5" strokeLinecap="round"/></marker>
          <marker id="arrHL" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M1 2L8 5L1 8" fill="none" stroke="#60a5fa" strokeWidth="2"   strokeLinecap="round"/></marker>
          <marker id="arrDsh" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M1 2L8 5L1 8" fill="none" stroke="rgba(148,163,184,0.3)" strokeWidth="1.5" strokeLinecap="round"/></marker>
        </defs>

        {/* Fondo oscuro con grid de puntos */}
        <rect width="1160" height="620" fill="#0f172a"/>
        <pattern id="dotgrid" x="0" y="0" width="22" height="22" patternUnits="userSpaceOnUse">
          <circle cx="11" cy="11" r="0.7" fill="rgba(255,255,255,0.035)"/>
        </pattern>
        <rect width="1160" height="620" fill="url(#dotgrid)"/>

        {/* ── ZONAS — posición y tamaño dinámicos desde effNodes ── */}
        {(()=>{
          const opz=effNodes.onpremise_zone;
          const awz=effNodes.aws_zone;
          const viz=effNodes.vias_zone;
          const azz=effNodes.azure_zone;
          const clz=effNodes.clientes_zone;
          const mwz=effNodes.middleware_zone;
          return <>
            {/* On-Premise */}
            <rect x={opz.x} y={opz.y} width={opz.w} height={opz.h} rx="10" fill="rgba(59,130,246,0.08)" stroke="#3b82f6" strokeWidth="0.8" strokeOpacity="0.4"/>
            <rect x={opz.x} y={opz.y} width={opz.w} height={24} rx="10" fill="rgba(59,130,246,0.18)"/>
            <rect x={opz.x} y={opz.y+14} width={opz.w} height={10} fill="rgba(59,130,246,0.18)"/>
            <text x={opz.x+10} y={opz.y+16} fill="#93c5fd" fontSize="8.5" fontWeight="700" letterSpacing="0.12em">OLO · ON-PREMISE</text>
            <text x={opz.x+10} y={opz.y+30} fill="rgba(148,163,184,0.4)" fontSize="7" fontFamily="'JetBrains Mono',monospace">qa: 10.17.224.226  ·  prod: 10.48.17.91</text>
            {/* AWS OLO */}
            <rect x={awz.x} y={awz.y} width={awz.w} height={awz.h} rx="10" fill="rgba(245,158,11,0.06)" stroke="#f59e0b" strokeWidth="0.8" strokeOpacity="0.4"/>
            <rect x={awz.x} y={awz.y} width={awz.w} height={24} rx="10" fill="rgba(245,158,11,0.14)"/>
            <rect x={awz.x} y={awz.y+14} width={awz.w} height={10} fill="rgba(245,158,11,0.14)"/>
            <text x={awz.x+12} y={awz.y+16} fill="#fbbf24" fontSize="8.5" fontWeight="700" letterSpacing="0.12em">AWS OLO · SERVICIOS OLO</text>
            {/* Vías de Entradas sub-box */}
            <rect x={viz.x} y={viz.y} width={viz.w} height={viz.h} rx="7" fill="rgba(255,255,255,0.025)" stroke="rgba(148,163,184,0.2)" strokeWidth="0.7"/>
            <text x={viz.x+viz.w/2} y={viz.y+14} textAnchor="middle" fill="rgba(148,163,184,0.55)" fontSize="7" fontWeight="700" letterSpacing="0.08em">VÍAS DE</text>
            <text x={viz.x+viz.w/2} y={viz.y+24} textAnchor="middle" fill="rgba(148,163,184,0.55)" fontSize="7" fontWeight="700" letterSpacing="0.08em">ENTRADAS</text>
            {/* Azure */}
            <rect x={azz.x} y={azz.y} width={azz.w} height={azz.h} rx="10" fill="rgba(96,165,250,0.08)" stroke="#60a5fa" strokeWidth="0.8" strokeOpacity="0.4"/>
            <rect x={azz.x} y={azz.y} width={azz.w} height={20} rx="10" fill="rgba(96,165,250,0.16)"/>
            <rect x={azz.x} y={azz.y+10} width={azz.w} height={10} fill="rgba(96,165,250,0.16)"/>
            <text x={azz.x+azz.w/2} y={azz.y+14} textAnchor="middle" fill="#93c5fd" fontSize="7.5" fontWeight="700" letterSpacing="0.12em">AZURE</text>
            {/* Clientes / ERP */}
            <rect x={clz.x} y={clz.y} width={clz.w} height={clz.h} rx="10" fill="rgba(148,163,184,0.03)" stroke="rgba(148,163,184,0.14)" strokeWidth="0.7" strokeDasharray="5 4"/>
            <text x={clz.x+10} y={clz.y+18} fill="rgba(148,163,184,0.32)" fontSize="8" fontWeight="600" letterSpacing="0.1em">CLIENTES / ERP</text>
            {/* Middleware */}
            <rect x={mwz.x} y={mwz.y} width={mwz.w} height={mwz.h} rx="10" fill="rgba(248,113,113,0.05)" stroke="#f87171" strokeWidth="0.7" strokeOpacity="0.4" strokeDasharray="5 4"/>
            <text x={mwz.x+14} y={mwz.y+16} fill="#fca5a5" fontSize="8" fontWeight="700" letterSpacing="0.12em">CAPA DE INTEGRACIÓN · MIDDLEWARE</text>
          </>;
        })()}

        {/* ── CONEXIONES (bezier S-curves) ── */}
        {effConns.map((c,i)=>{
          const f=effNodes[c.from],t=effNodes[c.to];
          if(!f||!t) return null;
          const hl=isConnHl(c), dim=(hoveredNode||selectedNode)&&!hl;
          const isHovConn = editMode && hovConn===i;
          const d=getPath(c);
          const lineColor = isHovConn?"#ef4444":hl?"#60a5fa":(c.dashed?(c.color??"rgba(148,163,184,0.28)"):"rgba(148,163,184,0.42)");
          return <g key={i}>
            <path d={d} fill="none"
              stroke={lineColor}
              strokeWidth={isHovConn?2.5:hl?2.2:c.color&&c.dashed?1.1:0.85}
              strokeDasharray={c.dashed?"5 3":"0"}
              strokeOpacity={dim?0.05:1}
              markerEnd={isHovConn?"url(#arrHL)":hl?"url(#arrHL)":c.dashed?"url(#arrDsh)":"url(#arrD)"}
              style={{ transition:"stroke-opacity 0.18s" }}
            />
            {/* hit-area invisible para borrar en modo edición */}
            {editMode && <path d={d} fill="none" stroke="transparent" strokeWidth={14}
              style={{ cursor:"pointer" }}
              onMouseEnter={()=>setHovConn(i)}
              onMouseLeave={()=>setHovConn(null)}
              onClick={e=>{e.stopPropagation();handleConnDelete(i);}}
            />}
          </g>;
        })}
        {/* Línea de preview al conectar */}
        {editMode && connectFrom && effNodes[connectFrom] && (
          <line
            x1={effNodes[connectFrom].x+effNodes[connectFrom].w/2}
            y1={effNodes[connectFrom].y+effNodes[connectFrom].h/2}
            x2={mousePos.x} y2={mousePos.y}
            stroke="#60a5fa" strokeWidth="1.5" strokeDasharray="5 3"
            pointerEvents="none"
          />
        )}

        {/* ── ZONAS: entidades conectables + movibles + redimensionables ── */}
        {editMode && Object.values(effNodes).filter(n=>n.type==="zone").map(n=>{
          const isConnSrc = connectFrom===n.id;
          const hl = isHl(n.id);
          const dim = (hoveredNode||selectedNode) && !hl && !isConnSrc;
          const col = isConnSrc?"#fbbf24":hl?"#60a5fa":(n.color||"rgba(255,255,255,0.3)");
          const labelW = Math.min((n.label?.length||0)*6+16, n.w-16);
          const HS = 8; // handle size
          const corners=[
            {h:'nw',x:n.x-HS/2,      y:n.y-HS/2,       cur:'nw-resize'},
            {h:'ne',x:n.x+n.w-HS/2,  y:n.y-HS/2,       cur:'ne-resize'},
            {h:'se',x:n.x+n.w-HS/2,  y:n.y+n.h-HS/2,   cur:'se-resize'},
            {h:'sw',x:n.x-HS/2,      y:n.y+n.h-HS/2,   cur:'sw-resize'},
          ];
          return <g key={`zone-${n.id}`} style={{opacity:dim?0.2:1}}>
            {/* Hit-area de borde para crear conexiones */}
            <rect x={n.x} y={n.y} width={n.w} height={n.h} rx="10"
              fill="none" stroke="transparent" strokeWidth={14}
              style={{cursor:"crosshair", pointerEvents:"stroke"}}
              onClick={e=>{e.stopPropagation();handleNodeClick(e,n.id);}}
              onMouseEnter={()=>setHoveredNode(n.id)}
              onMouseLeave={()=>setHoveredNode(null)}/>
            {/* Borde visual punteado */}
            <rect x={n.x} y={n.y} width={n.w} height={n.h} rx="10"
              fill="none" stroke={col}
              strokeWidth={isConnSrc||hl?2.5:1.2} strokeDasharray="8 4"
              style={{pointerEvents:"none"}}/>
            {/* Etiqueta — arrastrar aquí MUEVE la zona */}
            <rect x={n.x+8} y={n.y+4} width={labelW} height={14} rx="3"
              fill={isConnSrc?"#fbbf24":hl?"#1D4ED8":"rgba(15,23,42,0.85)"}
              stroke={col} strokeWidth="0.8"
              style={{cursor:"move", pointerEvents:"all"}}
              onMouseDown={e=>{
                e.stopPropagation(); e.preventDefault();
                const pt=svgPt(e);
                dragRef.current={type:'zone-move',id:n.id,ox:n.x,oy:n.y,mx0:pt.x,my0:pt.y,moved:false};
              }}
              onClick={e=>e.stopPropagation()}/>
            <text x={n.x+14} y={n.y+13.8} fill={isConnSrc?"#1e293b":hl?"#fff":col}
              fontSize="6.5" fontWeight="700" letterSpacing="0.07em"
              style={{pointerEvents:"none", userSelect:"none"}}>{n.label}</text>
            {/* Handles de redimensionar en las 4 esquinas */}
            {corners.map(({h,x,y,cur})=>(
              <rect key={h} x={x} y={y} width={HS} height={HS} rx="2"
                fill={col} stroke="rgba(15,23,42,0.6)" strokeWidth="0.8"
                style={{cursor:cur, pointerEvents:"all"}}
                onMouseDown={e=>{
                  e.stopPropagation(); e.preventDefault();
                  const pt=svgPt(e);
                  dragRef.current={type:'zone-resize',id:n.id,handle:h,
                    ox:n.x,oy:n.y,ow:n.w,oh:n.h,mx0:pt.x,my0:pt.y,moved:false};
                }}
                onClick={e=>e.stopPropagation()}/>
            ))}
          </g>;
        })}

        {/* ── NODOS (cards oscuras con acento de color) — se omiten zone anchors ── */}
        {Object.values(effNodes).filter(n=>n.type!=="zone").map(n=>{
          const hl=isHl(n.id), dim=(hoveredNode||selectedNode)&&!hl;
          const isSel=selectedNode===n.id, isHov=hoveredNode===n.id;
          const isConnSrc = connectFrom===n.id;
          return <g key={n.id}
            onClick={e=>handleNodeClick(e,n.id)}
            onMouseDown={e=>handleNodeDown(e,n.id)}
            onMouseEnter={()=>setHoveredNode(n.id)}
            onMouseLeave={()=>setHoveredNode(null)}
            style={{ cursor:editMode?(connectFrom?"crosshair":"grab"):"pointer", opacity:dim?0.18:1, transition:"opacity 0.16s" }}
            filter={isSel||isConnSrc?"url(#selglow)":undefined}>
            {/* Sombra base */}
            <rect x={n.x} y={n.y+2} width={n.w} height={n.h} rx="7" fill="rgba(0,0,0,0.35)" filter="url(#ndrop)"/>
            {/* Card body */}
            <rect x={n.x} y={n.y} width={n.w} height={n.h} rx="7"
              fill={isSel?n.color+"30":"rgba(15,23,42,0.85)"}
              stroke={isSel?n.color:isHov||hl?n.color+"cc":"rgba(255,255,255,0.1)"}
              strokeWidth={isSel?2:isHov||hl?1.5:0.7}/>
            {/* Acento superior de color */}
            <rect x={n.x+2} y={n.y+1} width={n.w-4} height={3} rx="5"
              fill={isSel||hl?n.color:n.color+"66"}/>
            {/* Texto label */}
            <text x={n.x+n.w/2} y={n.y+n.h/2+3.5} textAnchor="middle"
              fill={isSel?n.color:hl?n.color:"rgba(226,232,240,0.85)"}
              fontSize={n.w>90?"8.5":"8"} fontWeight={isSel||hl?"700":"600"}
              fontFamily="'Segoe UI',sans-serif">{n.label}</text>
          </g>;
        })}
      </svg>
    </div>

    {/* Cards de leyenda */}
    <div style={{ marginTop:14, display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:10 }}>
      {[
        { c:"#3b82f6", t:"BLOQUE 1-2 · On-Premise", b:"eflow_api → db Intermedia → db eFlow → ePrac. ePrac ↔ Softland bidireccional (Facturación de Servicios)." },
        { c:"#f59e0b", t:"BLOQUE 5-6 · AWS OLO",    b:"RagaNext → APIs/S3 → Colas → Persistencia → Repositorio → Monitor. Normalización → RDS OLO → Lago de Datos." },
        { c:"#ef4444", t:"BLOQUE 3-7 · Middleware",  b:"Terceros, Comercializadoras, Mayoreo, EPA → RagaNext → AWS. Notificación → RagaNext, API Dim, OLO API, Mecalux, Trade." },
        { c:"#60a5fa", t:"BLOQUE 8-10 · Azure/Retorno", b:"OLO API ↔ SRO, APOLLO, Última Milla, Liquidador (Azure). RagaNext retorna datos a EPA, Mayoreo, Terceros." },
      ].map(({c,t,b})=>(
        <div key={t} style={{ background:c+"0a", border:`1px solid ${c}33`, borderLeft:`3px solid ${c}`, borderRadius:8, padding:"10px 14px" }}>
          <div style={{ fontSize:10, fontWeight:700, color:c, textTransform:"uppercase", marginBottom:5, letterSpacing:"0.05em" }}>{t}</div>
          <div style={{ fontSize:11, color:"#555", lineHeight:1.55 }}>{b}</div>
        </div>
      ))}
    </div>

    {/* Clusters detallados */}
    <div style={{ marginTop:20 }}>
      <div style={{ fontSize:12, fontWeight:700, color:"#444", letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:12 }}>Clusters del ecosistema</div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:10, marginBottom:10 }}>
        <ClusterCard color="#185FA5" bg="#EBF3FB" title="eFlow · CR y VE" desc="Plataforma de operación logística activa en Costa Rica y Venezuela. Solo estos dos países están en scope.">
          <ClusterTag label="CR" color="#185FA5"/>
          <ClusterTag label="VE" color="#185FA5"/>
        </ClusterCard>
        <ClusterCard color="#6B7280" bg="#F8F9FA" title="Intermedia Lago de Datos" desc="Capa de integración central. Consolida datos del ERP y los distribuye hacia Power BI y la Suite OLO.">
          <ClusterTag label="Power BI" color="#D97706"/>
          <ClusterTag label="Suite OLO" color="#185FA5"/>
          <ClusterTag label="Multi cliente" color="#6B7280"/>
        </ClusterCard>
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
        <ClusterCard color="#5B21B6" bg="#F3E8FD" title="Interfaces de Sistema" desc="Interfaces directas con el core de negocio de OLO, gestionadas vía ePRAC.">
          <ClusterTag label="CCA" color="#5B21B6"/>
          <ClusterTag label="Facturación de Servicios" color="#5B21B6"/>
          <ClusterTag label="MPF" color="#5B21B6"/>
          <ClusterTag label="ePRAC (×2)" color="#D97706"/>
        </ClusterCard>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:10 }}>
        <ClusterCard color="#D97706" bg="#FEF3C7" title="Integraciones Internas" desc="Integraciones propias del ecosistema OLO con sistemas físicos y de tiempo.">
          <ClusterTag label="Mecalux" color="#D97706"/>
          <ClusterTag label="Sistemas de Tiempo" color="#D97706"/>
        </ClusterCard>
        <ClusterCard color="#7B1FA2" bg="#EDE9FE" title="Middleware" desc="Capa de orquestación central. Conecta Suite OLO con clientes, integraciones internas y sistemas del Estado.">
          <ClusterTag label="Suite OLO → clientes" color="#7B1FA2"/>
          <ClusterTag label="Comerc. Compiere" color="#7B1FA2"/>
          <ClusterTag label="Integ. Internas" color="#D97706"/>
          <ClusterTag label="Sistemas del Estado" color="#94A3B8"/>
        </ClusterCard>
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
  const [hoveredNode, setHoveredNode] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const W=1200, H=720;
  const erpNodes=[{code:"AS",x:90,y:380,label:"Maestros"},{code:"CG",x:250,y:280},{code:"CB",x:380,y:230},{code:"CC",x:510,y:230},{code:"CP",x:640,y:230},{code:"FA",x:510,y:320},{code:"CO",x:640,y:320},{code:"CI",x:770,y:320},{code:"AF",x:380,y:410},{code:"GN",x:510,y:410},{code:"MF",x:640,y:410},{code:"RH",x:770,y:410},{code:"POS",x:380,y:480},{code:"FR",x:510,y:480},{code:"AC",x:640,y:480},{code:"CCH",x:770,y:480},{code:"PY",x:900,y:410},{code:"FC",x:900,y:320}];
  const opsNodes=[{code:"WMS-D",label:"eflow WMS\nDesktop",x:280,y:620},{code:"WMS-RF",label:"eflow WMS\nRF · PDT",x:540,y:620},{code:"WMH",label:"WMH\nTorre Control",x:800,y:620}];
  const extNodes=[{code:"EDI",label:"Portal · EDI",x:90,y:100},{code:"Aduanas",label:"Aduanero",x:280,y:100},{code:"Mecalux",label:"Mecalux",x:470,y:100},{code:"TMSI",label:"TMS Internacional",x:660,y:100},{code:"BI",label:"BI · DW",x:850,y:100},{code:"ZF",label:"Zona Franca SEL",x:1040,y:100}];
  const links=[{a:"AS",b:"CG",c:true},{a:"AS",b:"CB",c:true},{a:"AS",b:"CC",c:true},{a:"AS",b:"CP",c:true},{a:"AS",b:"FA",c:true},{a:"AS",b:"CO",c:true},{a:"AS",b:"CI",c:true},{a:"AS",b:"AF",c:true},{a:"AS",b:"GN",c:true},{a:"CB",b:"CG",c:true},{a:"CC",b:"CG",c:true},{a:"CP",b:"CG",c:true},{a:"FA",b:"CG",c:true},{a:"CO",b:"CG",c:true},{a:"CI",b:"CG",c:true},{a:"AF",b:"CG",c:true},{a:"GN",b:"CG",c:true},{a:"MF",b:"CG",c:true},{a:"FA",b:"CC",c:true},{a:"FA",b:"CI",c:true},{a:"CO",b:"CP",c:true},{a:"CO",b:"CI",c:true},{a:"CC",b:"CB",c:true},{a:"CP",b:"CB",c:true},{a:"CCH",b:"CB",c:true},{a:"PY",b:"CB",c:true},{a:"GN",b:"CB",c:true},{a:"RH",b:"CB",c:true},{a:"FC",b:"CB",c:true},{a:"FA",b:"MF",c:true},{a:"POS",b:"MF",c:true},{a:"FR",b:"MF",c:true},{a:"AC",b:"MF",c:true},{a:"CC",b:"MF",c:true},{a:"CP",b:"MF",c:true},{a:"CO",b:"MF",c:true},{a:"CCH",b:"MF",c:true},{a:"FA",b:"WMS-D",c:true},{a:"CO",b:"WMS-D",c:true},{a:"WMS-D",b:"WMS-RF",c:true},{a:"WMS-D",b:"WMH",c:false},{a:"EDI",b:"FA",c:false},{a:"Aduanas",b:"CG",c:false},{a:"Mecalux",b:"WMH",c:false},{a:"BI",b:"CG",c:false},{a:"ZF",b:"WMS-D",c:false},{a:"TMSI",b:"WMH",c:false}];
  const all=[...erpNodes.map(n=>({...n,kind:"erp"})),...opsNodes.map(n=>({...n,kind:"ops"})),...extNodes.map(n=>({...n,kind:"ext"}))];
  const lookup=Object.fromEntries(all.map(n=>[n.code,n]));

  // Find module detail from data arrays
  const getDetail = (code) => SOFTLAND_MODULES.find(m=>m.code===code) || OPS_MODULES.find(m=>m.code===code) || SATELLITE_MODULES.find(m=>m.name===code) || null;
  const active = hoveredNode || selectedNode;
  const isNodeHl = (code) => { if(!active) return false; if(active===code) return true; return links.some(l=>(l.a===active&&l.b===code)||(l.b===active&&l.a===code)); };
  const isLinkHl = (link) => active && (link.a===active||link.b===active);
  const selMod = selectedNode ? (getDetail(selectedNode) || { code:selectedNode, name:selectedNode, purpose:"" }) : null;
  return <div>
    {/* Detail panel for selected node */}
    {selMod && <div style={{ background:"#fff", border:`1px solid ${MODULE_COLORS[selMod.code]||"#888"}44`, borderLeft:`4px solid ${MODULE_COLORS[selMod.code]||"#888"}`, borderRadius:10, padding:"14px 18px", marginBottom:16 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
            <ModuleChip code={selMod.code||""} size="lg"/>
            <span style={{ fontSize:14, fontWeight:700, color:"#1D1D1B" }}>{selMod.name||selMod.code}</span>
            {selMod.status && <StatusBadge status={selMod.status}/>}
          </div>
          {selMod.role && <div style={{ fontSize:11, color:"#777", fontStyle:"italic", marginBottom:4 }}>{selMod.role}</div>}
          {selMod.purpose && <p style={{ fontSize:12, color:"#444", lineHeight:1.6, margin:"6px 0 0" }}>{selMod.purpose}</p>}
        </div>
        <button onClick={()=>setSelectedNode(null)} style={{ background:"none", border:"none", cursor:"pointer", color:"#888", fontSize:16 }}>✕</button>
      </div>
    </div>}

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
        {links.map((link,i)=>{ const a=lookup[link.a],b=lookup[link.b]; if(!a||!b)return null; const hl=isLinkHl(link); const dim=active&&!hl; return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={hl?(link.c?"#c0392b":"#7f8c8d"):(link.c?"#c0392b":"#7f8c8d")} strokeWidth={hl?2:1} strokeOpacity={dim?0.08:hl?0.9:(link.c?0.4:0.3)} strokeDasharray={link.c?"0":"3 3"} style={{ transition:"stroke-opacity 0.15s" }}/>; })}
        {all.map(n=>{ const r=n.kind==="erp"?24:36; const stroke=n.kind==="erp"?(MODULE_COLORS[n.code]??"#c0392b"):n.kind==="ops"?"#1abc9c":"#7f8c8d"; const fill=n.kind==="erp"?"#ffffff":n.kind==="ops"?"#f0fdfa":"#fafafa"; const hl=isNodeHl(n.code); const dim=active&&!hl; const isSel=selectedNode===n.code; return <g key={n.code} onClick={()=>setSelectedNode(selectedNode===n.code?null:n.code)} onMouseEnter={()=>setHoveredNode(n.code)} onMouseLeave={()=>setHoveredNode(null)} style={{ cursor:"pointer", opacity:dim?0.2:1, transition:"opacity 0.15s" }}><circle cx={n.x} cy={n.y} r={r} fill={fill} stroke={isSel?stroke:hl?stroke:stroke} strokeWidth={isSel?3.5:hl?2.5:(n.kind==="erp"?2:1.5)} strokeDasharray={n.kind==="ext"?"3 3":"0"}/><text x={n.x} y={n.y+(n.label?-2:4)} textAnchor="middle" fill={stroke} style={{ fontSize:n.kind==="erp"?11:10, fontWeight:700, letterSpacing:"0.04em" }}>{n.code}</text>{n.label&&n.label.split("\n").map((line,j)=><text key={j} x={n.x} y={n.y+14+j*11} textAnchor="middle" fill="#666" style={{ fontSize:9 }}>{line}</text>)}</g>; })}
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

const ERP_MOD   = new Set(["AS","CG","CB","CC","CP","FA","CO","CI","AF","GN","MF","RH","CCH","PY","FC","POS","FR","AC"]);
const EFLOW_MOD = new Set(["WMS-D","WMS-RF","WMH","ERP"]);
const SAT_MOD   = new Set(["Mecalux","EDI","Aduanas","BI","ZF","TMSI"]);
const SUITE_MOD = new Set(["SRO","GoRamp","Trade","RFID","Pricing","OLO-API","Intermedia","LagoDatos",
  "OLO API","ePRAC","Middleware","Suite OLO","Liq. Viajes","Raga Orders","CCA","Fac. Svc","MPF",
  "Mayoreo","EPA","Compiere","OLO System","TICA","Delzof","Power BI","Tec. Tiempo","eflow"]);

function codeCluster(code){
  if(ERP_MOD.has(code))   return "erp";
  if(EFLOW_MOD.has(code)) return "ops";
  if(SAT_MOD.has(code))   return "sat";
  if(SUITE_MOD.has(code)) return "suite";
  return "other";
}

function rowCategory(row){
  const f=codeCluster(row.from), t=codeCluster(row.to);
  if(f==="ops"||t==="ops") return "ops";
  if(f==="sat"||t==="sat") return "sat";
  if(f==="suite"||t==="suite") return "suite";
  if(f==="erp"&&t==="erp") return "erp";
  return "erp";
}

const CAT_META = {
  global:{ label:"Global · todos",                             icon:"◎",  color:"#1D1D1B", bg:"#f8f9fa",               border:"#e0e0e0" },
  erp:   { label:"ERP — Softland v7.00 · motor Exactus",       icon:"⬡",  color:"#c0392b", bg:"rgba(192,57,43,0.05)",  border:"rgba(192,57,43,0.2)" },
  ops:   { label:"Operación logística · eflow Cloud Suite",    icon:"🏗", color:"#1abc9c", bg:"rgba(26,188,156,0.08)", border:"rgba(26,188,156,0.25)" },
  sat:   { label:"Sistemas satélite · externos / inferidos",   icon:"🛰", color:"#9b59b6", bg:"rgba(155,89,182,0.08)", border:"rgba(155,89,182,0.22)" },
  suite: { label:"Suite OLO · Clusters del ecosistema",        icon:"⬡",  color:"#185FA5", bg:"rgba(24,95,165,0.07)",  border:"rgba(24,95,165,0.22)" },
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

// ── Diagrama entidad-relación interactivo ──────────────────────────────────
function ERDiagram({ rows }) {
  const [selected, setSelected] = useState(null);
  const [hovered,  setHovered]  = useState(null);

  const W=1100, H=620, NW=100, NH=44;

  function getModInfo(code) {
    return SOFTLAND_MODULES.find(m=>m.code===code) || OPS_MODULES.find(m=>m.code===code) || null;
  }
  function modColor(code) {
    return MODULE_COLORS[code] || OPS_COLORS[code] || CLUSTER_COLORS[code] || "#7f8c8d";
  }

  // Nodos únicos
  const codes = [...new Set([...rows.map(r=>r.from),...rows.map(r=>r.to)])].filter(c=>c!=="*");

  // Layout radial automático: el más conectado al centro
  const deg = c => rows.filter(r=>r.from===c||r.to===c).length;
  const sorted = [...codes].sort((a,b)=>deg(b)-deg(a));
  const cx=W/2, cy=H/2;
  const pos = {};
  sorted.forEach((code,i)=>{
    if (i===0) { pos[code]={x:cx,y:cy}; return; }
    const innerN = Math.min(7, sorted.length-1);
    if (i<=innerN) {
      const angle=(2*Math.PI*(i-1)/innerN)-Math.PI/2;
      const r = sorted.length>8 ? 178 : 155;
      pos[code]={x:cx+r*Math.cos(angle), y:cy+r*Math.sin(angle)};
    } else {
      const outerN = sorted.length-1-Math.min(7,sorted.length-1);
      const angle=(2*Math.PI*(i-1-Math.min(7,sorted.length-1))/outerN)-Math.PI/6;
      const r=335;
      pos[code]={
        x:Math.max(NW/2+8,Math.min(W-NW/2-8, cx+r*Math.cos(angle))),
        y:Math.max(NH/2+8,Math.min(H-NH/2-8, cy+r*Math.sin(angle)))
      };
    }
  });

  // Agrupar pares (puede haber varios from→to): conserva el estado más fuerte
  const pairMap={};
  rows.forEach(row=>{
    const k=`${row.from}||${row.to}`;
    if(!pairMap[k]) pairMap[k]={from:row.from,to:row.to,count:0,status:"inferred",whats:[]};
    pairMap[k].count++;
    pairMap[k].whats.push(row.what);
    if(row.status==="confirmed") pairMap[k].status="confirmed";
    else if(row.status==="partial"&&pairMap[k].status!=="confirmed") pairMap[k].status="partial";
  });
  const pairs = Object.values(pairMap);

  // Path de flecha curva entre dos nodos
  function makePath(from, to) {
    const f=pos[from], t=pos[to];
    if(!f||!t) return "";
    const dx=t.x-f.x, dy=t.y-f.y, len=Math.sqrt(dx*dx+dy*dy);
    if(len<1) return "";
    const nx=dx/len, ny=dy/len;
    const sx=f.x+nx*(NW/2+2),  sy=f.y+ny*(NH/2+2);
    const ex=t.x-nx*(NW/2+11), ey=t.y-ny*(NH/2+11);
    const qx=(sx+ex)/2-ny*22,  qy=(sy+ey)/2+nx*22;
    return `M${sx.toFixed(1)},${sy.toFixed(1)} Q${qx.toFixed(1)},${qy.toFixed(1)} ${ex.toFixed(1)},${ey.toFixed(1)}`;
  }

  const active = selected || hovered;
  const isConn  = (a,b) => rows.some(r=>(r.from===a&&r.to===b)||(r.to===a&&r.from===b));
  const nodeDim = code => !!active && active!==code && !isConn(active,code);
  const pairHl  = p => !!active && (p.from===active||p.to===active);
  const pairDim = p => !!active && !pairHl(p);

  function edgeColor(p) {
    if(!pairHl(p)) return "#d1d5db";
    return p.status==="confirmed"?"#27ae60":p.status==="partial"?"#f39c12":"#9b59b6";
  }
  function markerId(p) {
    if(!pairHl(p)) return "url(#mDim)";
    return p.status==="confirmed"?"url(#mConf)":p.status==="partial"?"url(#mPart)":"url(#mInf)";
  }

  // Panel de detalle del nodo seleccionado
  const selOut = selected ? rows.filter(r=>r.from===selected) : [];
  const selInc = selected ? rows.filter(r=>r.to===selected)   : [];
  const selCol = selected ? modColor(selected) : "#888";
  const selMod = selected ? getModInfo(selected) : null;

  return (
    <div>
      {/* Panel detalle */}
      {selected && (
        <div style={{ background:"#fff", border:`1px solid ${selCol}44`, borderLeft:`4px solid ${selCol}`, borderRadius:10, padding:"14px 18px", marginBottom:14 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:10 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
              <ModuleChip code={selected} size="lg"/>
              <div>
                <div style={{ fontSize:15, fontWeight:700, color:"#1D1D1B" }}>{selMod?.name||selected}</div>
                {selMod?.role && <div style={{ fontSize:11, color:"#777", fontStyle:"italic" }}>{selMod.role}</div>}
              </div>
              {selOut.length>0 && <span style={{ fontSize:11, color:selCol, background:selCol+"15", padding:"3px 10px", borderRadius:6, fontWeight:600 }}>↗ {selOut.length} envía</span>}
              {selInc.length>0 && <span style={{ fontSize:11, color:"#7f8c8d", background:"#ecf0f1", padding:"3px 10px", borderRadius:6, fontWeight:600 }}>↙ {selInc.length} recibe</span>}
            </div>
            <button onClick={()=>setSelected(null)} style={{ background:"none", border:"none", cursor:"pointer", color:"#888", fontSize:16, padding:4 }}>✕</button>
          </div>
          <div style={{ marginTop:12, display:"grid", gridTemplateColumns:selOut.length&&selInc.length?"1fr 1fr":"1fr", gap:12 }}>
            {selOut.length>0 && (
              <div>
                <div style={{ fontSize:10, fontWeight:700, color:selCol, letterSpacing:"0.07em", textTransform:"uppercase", marginBottom:6 }}>↗ Envía hacia</div>
                <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                  {selOut.map((r,i)=>{
                    const tm=getModInfo(r.to); const tc=modColor(r.to);
                    return <div key={i} onClick={()=>setSelected(r.to)} style={{ display:"flex", alignItems:"center", gap:7, padding:"6px 10px", borderRadius:6, cursor:"pointer", background:"#fafafa", border:`1px solid ${tc}22` }}>
                      <ModuleChip code={r.to}/>
                      <span style={{ fontSize:11, color:"#333", flex:1, fontWeight:500 }}>{tm?.name||r.to}</span>
                      <StatusBadge status={r.status}/>
                    </div>;
                  })}
                </div>
              </div>
            )}
            {selInc.length>0 && (
              <div>
                <div style={{ fontSize:10, fontWeight:700, color:"#7f8c8d", letterSpacing:"0.07em", textTransform:"uppercase", marginBottom:6 }}>↙ Recibe de</div>
                <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                  {selInc.map((r,i)=>{
                    const fm=getModInfo(r.from); const fc=modColor(r.from);
                    return <div key={i} onClick={()=>setSelected(r.from)} style={{ display:"flex", alignItems:"center", gap:7, padding:"6px 10px", borderRadius:6, cursor:"pointer", background:"#fafafa", border:`1px solid ${fc}22` }}>
                      <ModuleChip code={r.from}/>
                      <span style={{ fontSize:11, color:"#333", flex:1, fontWeight:500 }}>{fm?.name||r.from}</span>
                      <StatusBadge status={r.status}/>
                    </div>;
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SVG diagrama */}
      <div style={{ background:"#f8fafc", border:"1px solid #e0e0e0", borderRadius:12, overflow:"hidden" }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width:"100%", height:"auto", display:"block", fontFamily:"'Segoe UI',sans-serif" }}>
          <defs>
            {[["mConf","#27ae60"],["mPart","#f39c12"],["mInf","#9b59b6"],["mDim","#d1d5db"]].map(([id,c])=>(
              <marker key={id} id={id} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
                <path d="M1 2L8 5L1 8" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
              </marker>
            ))}
          </defs>

          {/* Aristas */}
          {pairs.map((p,i)=>{
            const d=makePath(p.from,p.to);
            if(!d) return null;
            const hl=pairHl(p), dim=pairDim(p);
            return (
              <path key={i} d={d} fill="none"
                stroke={edgeColor(p)}
                strokeWidth={hl?2.5:1}
                strokeOpacity={dim?0.05:hl?0.88:0.28}
                strokeDasharray={p.status==="inferred"?"5 3":"0"}
                markerEnd={markerId(p)}
                style={{ transition:"stroke-opacity 0.18s, stroke-width 0.18s" }}
              />
            );
          })}

          {/* Nodos */}
          {codes.map(code=>{
            const p=pos[code]; if(!p) return null;
            const mod=getModInfo(code);
            const color=modColor(code);
            const isSel=selected===code, isHov=hovered===code;
            const faded=nodeDim(code);
            const label=(mod?.name||code);
            const short=label.length>15?label.slice(0,14)+"…":label;

            return (
              <g key={code}
                onClick={()=>setSelected(selected===code?null:code)}
                onMouseEnter={()=>setHovered(code)}
                onMouseLeave={()=>setHovered(null)}
                style={{ cursor:"pointer", opacity:faded?0.15:1, transition:"opacity 0.18s" }}>
                {isSel && <rect x={p.x-NW/2-5} y={p.y-NH/2-5} width={NW+10} height={NH+10} rx="13" fill={color+"1a"} stroke={color+"44"} strokeWidth="1.2"/>}
                <rect x={p.x-NW/2} y={p.y-NH/2} width={NW} height={NH} rx="8"
                  fill={isSel?color+"18":"#ffffff"}
                  stroke={isSel||isHov?color:"#d1d5db"}
                  strokeWidth={isSel?2.2:isHov?1.6:0.8}/>
                <text x={p.x} y={p.y-5} textAnchor="middle"
                  fill={color} fontSize="12" fontWeight="700"
                  fontFamily="'JetBrains Mono','Consolas',monospace">{code}</text>
                <text x={p.x} y={p.y+10} textAnchor="middle" fill={isSel?"#444":"#999"} fontSize="8.2">{short}</text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Leyenda */}
      <div style={{ marginTop:10, display:"flex", gap:18, alignItems:"center", flexWrap:"wrap", padding:"8px 14px", background:"#fafafa", border:"1px solid #e8e8e8", borderRadius:8, fontSize:11, color:"#666" }}>
        {[["#27ae60","Confirmado","0"],["#f39c12","Parcial","0"],["#9b59b6","Inferido","5 3"]].map(([c,l,d])=>(
          <div key={l} style={{ display:"flex", alignItems:"center", gap:6 }}>
            <svg width="34" height="10">
              <path d="M2,5 Q17,2 30,5" fill="none" stroke={c} strokeWidth="2" strokeDasharray={d}/>
              <path d="M26,3.5 L30,5 L26,6.5" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span>{l}</span>
          </div>
        ))}
        <span style={{ marginLeft:"auto", fontSize:10, color:"#bbb" }}>Click en un módulo · sus flechas se iluminan</span>
      </div>
    </div>
  );
}

function IntegrationsView() {
  const [cat, setCat] = useState("global");
  const [fFrom, setFFrom] = useState("*");
  const [fTo, setFTo] = useState("*");
  const [fStatus, setFStatus] = useState("*");
  const [fWhat, setFWhat] = useState("");
  const [viewMode, setViewMode] = useState("table");

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

  return <div style={{ display:"flex", gap:20, alignItems:"flex-start" }}>
    {/* Submenú lateral de categorías */}
    <nav style={{ width:215, minWidth:215, background:"#fff", border:"1px solid #e0e0e0", borderRadius:10, overflow:"hidden", flexShrink:0, position:"sticky", top:20 }}>
      <div style={{ padding:"10px 14px", borderBottom:"1px solid #f0f0f0", background:"#fafafa", fontSize:10, fontWeight:700, color:"#888", letterSpacing:"0.08em", textTransform:"uppercase" }}>Categoría</div>
      {Object.entries(CAT_META).map(([key,m])=>{
        const isA = cat===key;
        const count = key==="global" ? INTEGRATIONS.length : INTEGRATIONS.filter(r=>rowCategory(r)===key).length;
        return <button key={key} onClick={()=>handleCat(key)} style={{ display:"flex", alignItems:"center", gap:8, width:"100%", padding:"10px 14px", border:"none", borderLeft:isA?`3px solid ${m.color}`:"3px solid transparent", borderBottom:"1px solid #f5f5f5", background:isA?m.bg:"transparent", cursor:"pointer", fontFamily:"inherit", transition:"all 0.15s", textAlign:"left" }}>
          <span style={{ fontSize:14, lineHeight:1 }}>{m.icon}</span>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:11, fontWeight:isA?700:500, color:isA?m.color:"#555", lineHeight:1.35 }}>{key==="global"?"Global · todos":m.label.split("·")[0].trim()}</div>
            {isA && key!=="global" && <div style={{ fontSize:9, color:m.color+"99", marginTop:1, lineHeight:1.3 }}>{m.label.split("·").slice(1).join("·").trim()}</div>}
          </div>
          <span style={{ fontSize:10, fontWeight:700, color:isA?m.color:"#999", background:isA?m.color+"15":"#f0f0f0", padding:"1px 6px", borderRadius:8, flexShrink:0, minWidth:24, textAlign:"center" }}>{count}</span>
        </button>;
      })}
    </nav>

    {/* Contenido principal */}
    <div style={{ flex:1, minWidth:0 }}>

    {/* Banner de categoría activa */}
    {cat!=="global" && <div style={{ background:CAT_META[cat].bg, border:`1px solid ${CAT_META[cat].border}`, borderLeft:`3px solid ${CAT_META[cat].color}`, borderRadius:8, padding:"10px 14px", marginBottom:14, fontSize:12, color:"#555", lineHeight:1.5 }}>
      <b style={{ color:CAT_META[cat].color }}>{CAT_META[cat].icon} {CAT_META[cat].label}</b>
      {cat==="erp"   && " — integraciones intra-suite declaradas explícitamente en los manuales oficiales."}
      {cat==="ops"   && " — integraciones entre ERP Softland y la plataforma eflow Cloud Suite. Mecanismo concreto (batch/WS/BD intermedia) no documentado."}
      {cat==="sat"   && " — integraciones con sistemas externos inferidos por contexto. Sin documentación formal en el corpus accesible."}
      {cat==="suite" && " — integraciones de los clusters del ecosistema OLO: Suite OLO, Middleware, Intermedia y clientes. Derivadas del diagrama de Inicio."}
    </div>}
    {cat==="global" && <div style={{ background:"rgba(41,128,185,0.06)", border:"1px solid rgba(41,128,185,0.22)", borderLeft:"3px solid #2980b9", borderRadius:8, padding:"10px 14px", marginBottom:14, fontSize:12, color:"#666", lineHeight:1.6 }}>
      Las integraciones intra-Softland están <b style={{ color:"#27ae60" }}>declaradas explícitamente</b> en la sección "Integración" de cada manual. Las del lado operativo y externo están parcialmente confirmadas o inferidas.
    </div>}

    {/* Toggle de vista */}
    <div style={{ display:"flex", gap:6, marginBottom:14, alignItems:"center" }}>
      <span style={{ fontSize:10, fontWeight:700, color:"#aaa", letterSpacing:"0.06em", textTransform:"uppercase", marginRight:4 }}>Vista:</span>
      {[["table","📋 Tabla"],["relations","⬡ Diagrama ER"]].map(([mode,label])=>{
        const isA = viewMode===mode;
        return <button key={mode} onClick={()=>setViewMode(mode)} style={{ fontSize:11, fontWeight:isA?700:400, color:isA?"#1D4ED8":"#666", background:isA?"#EFF6FF":"transparent", border:`1px solid ${isA?"#BFDBFE":"#ddd"}`, borderRadius:6, padding:"5px 12px", cursor:"pointer", fontFamily:"inherit", transition:"all 0.15s" }}>{label}</button>;
      })}
    </div>

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

    {/* Contenido según vista */}
    {viewMode==="table"
      ? <div style={{ background:"#ffffff", border:"1px solid #e0e0e0", borderRadius:10, overflow:"hidden", overflowX:"auto" }}><IntegTable rows={filtered}/></div>
      : <ERDiagram rows={filtered}/>
    }

    </div>{/* fin contenido principal */}
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleTab = id => { setTab(id); setBpaSel(null); setSlSel(null); setOpsSel(null); };
  const activeTab = TABS.find(t => t.id === tab);
  const totalProcs = BPA_PROCESSES.estrategicos.length + BPA_PROCESSES.negocio.length + BPA_PROCESSES.apoyo.length + BPA_PROCESSES.control.length;

  return <div style={{ fontFamily:"'Segoe UI','Helvetica Neue',system-ui,sans-serif", background:"#f8f9fa", color:"#1D1D1B", minHeight:"100vh", display:"flex" }}>
    <style>{`@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500;700&display=swap');body{margin:0;}::selection{background:#1D1D1B;color:#fff;}`}</style>

    {/* Sidebar */}
    <aside style={{ width:sidebarCollapsed?60:240, minWidth:sidebarCollapsed?60:240, background:"#1D1D1B", color:"#ffffff", display:"flex", flexDirection:"column", transition:"width 0.2s ease, min-width 0.2s ease", overflow:"hidden", position:"sticky", top:0, height:"100vh" }}>
      {/* Sidebar Header */}
      <div style={{ padding:sidebarCollapsed?"16px 10px":"20px 18px", borderBottom:"1px solid #333", display:"flex", alignItems:"center", justifyContent:sidebarCollapsed?"center":"space-between" }}>
        {!sidebarCollapsed && <div>
          <div style={{ fontSize:14, fontWeight:700, letterSpacing:"-0.02em", whiteSpace:"nowrap" }}>OLO Architecture</div>
          <div style={{ fontSize:10, color:"#888", fontFamily:"'JetBrains Mono','Consolas',monospace", marginTop:2 }}>v0.5 · CR · VE</div>
        </div>}
        <button onClick={()=>setSidebarCollapsed(!sidebarCollapsed)} style={{ background:"none", border:"none", color:"#888", cursor:"pointer", fontSize:16, padding:4, lineHeight:1 }} title={sidebarCollapsed?"Expandir":"Colapsar"}>{sidebarCollapsed?"▶":"◀"}</button>
      </div>

      {/* Nav Items */}
      <nav style={{ flex:1, padding:"12px 0", overflowY:"auto" }}>
        {TABS.map(t => { const isA = tab === t.id; return <button key={t.id} onClick={()=>handleTab(t.id)} title={sidebarCollapsed?t.label:undefined} style={{ display:"flex", alignItems:"center", gap:10, width:"100%", background:isA?"rgba(255,255,255,0.1)":"transparent", border:"none", borderLeft:isA?"3px solid #fff":"3px solid transparent", color:isA?"#ffffff":"#aaa", padding:sidebarCollapsed?"12px 0":"10px 18px", cursor:"pointer", fontSize:13, fontWeight:isA?700:400, fontFamily:"inherit", transition:"all 0.15s", textAlign:"left", justifyContent:sidebarCollapsed?"center":"flex-start" }}>
          <span style={{ fontSize:16, lineHeight:1, flexShrink:0 }}>{t.label.split(" ")[0]}</span>
          {!sidebarCollapsed && <span style={{ whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{t.label.split(" ").slice(1).join(" ")}</span>}
        </button>; })}
      </nav>

      {/* Sidebar Footer */}
      {!sidebarCollapsed && <div style={{ padding:"14px 18px", borderTop:"1px solid #333", fontSize:10, color:"#666", lineHeight:1.5 }}>
        17 manuales · 7 guías eflow · 1 BPA
      </div>}
    </aside>

    {/* Main Content */}
    <main style={{ flex:1, padding:"20px 40px 64px 40px", overflow:"auto", minWidth:0 }}>
      <div style={{ maxWidth:1200, margin:"0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom:16 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", flexWrap:"wrap", gap:12, marginBottom:4 }}>
            <h1 style={{ fontSize:22, fontWeight:700, color:"#1D1D1B", margin:0, letterSpacing:"-0.02em" }}>{activeTab?.label.split(" ").slice(1).join(" ") || "Inicio"}</h1>
            <span style={{ fontSize:11, color:"#888", letterSpacing:"0.1em", fontFamily:"'JetBrains Mono','Consolas',monospace" }}>Softland v7.00 · eflow Cloud Suite</span>
          </div>
          <p style={{ fontSize:13, color:"#666", margin:0, lineHeight:1.5 }}>{activeTab?.sub}</p>
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
    </main>
  </div>;
}