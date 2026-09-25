// ═══════════════════════════════════════════════════════════════════════════
// DATOS · MÓDULOS SOFTLAND / OPS / SATÉLITE / BPA / EXTENSIONES
// ═══════════════════════════════════════════════════════════════════════════

export const SOFTLAND_MODULES = [
  { code:"DE", enOlo:"pantallas", name:"Documentos Electrónicos", role:"Factura electrónica · Hacienda CR", status:"confirmed", purpose:"Aplicación aparte (v4.4) que genera, firma y envía a Hacienda el XML v4.4 de facturas y notas, recibe la respuesta, genera el PDF y lo envía al cliente; también recibe los comprobantes de proveedores para aceptarlos o rechazarlos. Visto en el Softland de OLO (OVERSEAS).", entities:["Comprobante electrónico","XML de respuesta","Bitácora"] },
  { code:"CR", enOlo:"menu", name:"Control Presupuestal", role:"Presupuesto", status:"confirmed", purpose:"Partidas y presupuestos, movimientos presupuestales, consultas por partida y concepto y cierres de presupuesto. En el Softland de OLO solo se levantó el menú.", entities:["Partida","Presupuesto"] },
  { code:"RP", enOlo:"menu", name:"Reporteador", role:"Reportes propios", status:"confirmed", purpose:"Mantenimiento de reportes propios, privilegios, pivotes por área y cubos de información sobre los datos de todos los módulos. En el Softland de OLO solo se levantó el menú.", entities:["Reporte","Cubo"] },
  { code:"AS", enOlo:"sin_acceso", name:"Administración del Sistema", role:"Maestros transversales", status:"partial", purpose:"Provee tablas base usadas por todos los demás módulos. Confirmado por integración en CB, CC, CP, FA, CO, CI, AF, GN, MF. Sin manual propio en el corpus accesible.", entities:["Moneda","Denominacion","TipoCambio","Pais","EntidadFinanciera","CategoriaCliente","CategoriaProveedor","CondicionPago","TarjetaCredito","Vendedor","Cobrador","Zona","Ruta","NivelPrecio","NIT","CodigoImpuesto","ConsecutivoGlobal","CentroCosto","Departamento","Bodega","PeriodoContable","ExcepcionD104"] },
  { code:"CG", enOlo:"menu", name:"Contabilidad General", role:"Corazón financiero", status:"confirmed", purpose:"Manual lo describe textualmente como 'corazón del área financiera del ERP'. Recibe asientos automáticos de CB, CC, CP, FA, CO, CI, AF, GN, MF. Define paquetes contables, tipos de transacción contable, cuadro de cuentas, contabilidad fiscal vs corporativa, FASB-52, transacciones recurrentes, distribuidas, diferidos, anulación, reversión.", entities:["PaqueteContable","TipoTransaccionContable","CuentaContable","AsignacionCentroCuenta","TransaccionContable","TransaccionRecurrente","TransaccionDistribuida","Diferido","AmortizacionDiferido","EventoContable","ReporteContable","PeriodoContable"] },
  { code:"CB", enOlo:"menu", name:"Control Bancario", role:"Tesorería", status:"confirmed", purpose:"Cuentas bancarias, conciliación bancaria (libros vs bancos), documentos de crédito/depósito/débito, cheques, cheques recurrentes, solicitudes de cheque, transferencias electrónicas (TEF), conciliación inicial. Carga movimientos de CC, CP, GN, RH, Caja Chica, Proyectos.", entities:["CuentaBancaria","Documento","MovimientoLibros","MovimientoBancos","Cheque","ChequeRecurrente","SolicitudCheque","Deposito","TransferenciaElectronica","Conciliacion","SubtipoDocumento","TipoCuenta"] },
  { code:"CC", enOlo:"pantallas", name:"Cuentas por Cobrar", role:"Auxiliar de clientes", status:"confirmed", purpose:"Maestro de clientes, documentos por cobrar (factura, NC, ND, recibos), aplicación de pagos, contrarrecibos, convenios, carga masiva, retenciones, intereses de mora, análisis de antigüedad y vencimiento, libros de ventas por país.", entities:["Cliente","DireccionEmbarque","ContactoCliente","VendedorCliente","Documento","Aplicacion","Contrarecibo","Convenio","Retencion","InteresMora","PlanPagos","SaldoCliente"] },
  { code:"CP", enOlo:"pantallas", name:"Cuentas por Pagar", role:"Auxiliar de proveedores", status:"confirmed", purpose:"Maestro de proveedores, documentos por pagar (factura, NC, ND, intereses), cheques, TEF, contrarrecibos, retenciones, aprobación de pagos, generación de facturas de compras, manejo de días de revisión, libros de compras y reportes fiscales por país.", entities:["Proveedor","CuentaBancariaProveedor","Documento","Aplicacion","Contrarecibo","Cheque","TransferenciaElectronica","Retencion","CodigoIngreso","SaldoProveedor"] },
  { code:"FA", enOlo:"pantallas", name:"Facturación", role:"Origen de ventas", status:"confirmed", purpose:"Pedidos, facturación, remisiones, devoluciones, cotizaciones, despachos, anticipos, ensambles, descuentos y bonificaciones por reglas, paquetes de descuentos, retenciones, anulaciones. Reserva existencias en CI, transfiere facturas a crédito a CC y genera asientos de Ventas y Costo de Ventas en CG.", entities:["Cliente","Pedido","DetallePedido","Factura","Remision","Cotizacion","Devolucion","Despacho","Anulacion","VersionPrecio","NivelPrecios","ReglaDescuento","EscalaBonificacion","PaqueteDescuentoBonificacion","EnsambleArticulo","ExcepcionDescuentoCliente","Caja","Anticipo"] },
  { code:"CO", enOlo:"pantallas", name:"Compras", role:"Procurement / abastecimiento", status:"confirmed", purpose:"Solicitudes, órdenes, embarques, liquidaciones de compra, pedidos sugeridos, planificadores de compras, evaluación de proveedores, aranceles, gastos de importación, pronósticos de venta. Genera factura de compra con embarque a CP. Actualiza existencias en CI.", entities:["Proveedor","Comprador","Gasto","Impuesto","Arancel","DireccionEmbarque","RangoAutorizacion","MontoAutorizacion","Solicitud","OrdenCompra","Embarque","LiquidacionCompra","PedidoSugerido","DocumentoCompra","EvaluacionProveedor","PlanificadorCompras","PronosticoVentas","DatoCompraArticulo","ArticuloProveedor"] },
  { code:"CI", enOlo:"pantallas", name:"Control de Inventario", role:"Inventario contable", status:"confirmed", purpose:"Maestro de artículos (con bodegas, lotes, números de serie, alternos, capas de costo), unidades de medida, clasificaciones, cuentas contables por artículo, transacciones por paquete y en línea, despachos, lotes y aprobación/vencimiento, transacciones configurables.", entities:["Articulo","ArticuloAlterno","ArticuloBodega","Lote","NumeroSerie","PlantillaNumeroSerie","UnidadMedida","Clasificacion","ClasificacionAdicional","ImpuestoAdicional","CuentaContableArticulo","TransaccionConfigurable","Paquete","DocumentoInventario","TransaccionLinea","Despacho","AutorizacionCompraExenta","AutorizacionVentaExenta","CapaCosto","ConsecutivoCI"] },
  { code:"AF", enOlo:"menu", name:"Activos Fijos", role:"Patrimonio", status:"confirmed", purpose:"Maestro de activos, mejoras, depreciación, revaluación, retiro, desmantelamiento, deterioro, índices de precios, asignación de centros de costo, depreciación mensual automática con asiento contable. Integra directamente con CG y CO.", entities:["ActivoFijo","TipoActivo","Mejora","AccionActivo","EstadoActivo","TipoAccion","IndicePrecio","AsignacionCentroCosto","HistoricoRevaluacion","HistoricoDepreciacion","TipoObservacion"] },
  { code:"GN", enOlo:"menu", name:"Gestión de Nómina", role:"Planilla / payroll", status:"confirmed", purpose:"Versión actual de Control de Nómina. Clases de nómina, conceptos, departamentos, puestos, horarios, empleados, procesamiento de nóminas, liquidación de aportes, descuentos a empleados, marcas de reloj, horas laboradas, ajustes y anulaciones de pago, nóminas electrónicas.", entities:["Empleado","ClaseNomina","Concepto","GrupoConcepto","Departamento","EstadoEmpleado","Horario","Puesto","PuestoExterno","ClaseSeguroSocial","LiquidacionAporte","CuentaContableConcepto","LiquidacionPagoDescuento","InformacionCotizante","Administradora","HistoricoProyecto","CentroTrabajo","AdicionalEmpleado","AdicionalNomina","ConstanteCalculo","CodigoIngreso","FormaPagoNominaElectronica","MedioPagoNominaElectronica","PeriodoNominaElectronica","TipoTrabajadorNE","SubtipoTrabajadorNE","TipoHorasExtraNE","MarcaReloj","RegistroHoras","NotaNomina"] },
  { code:"MF", enOlo:"menu", name:"Monitor Fiscal", role:"Cumplimiento IVA / prorrata", status:"confirmed", purpose:"Cálculo del índice de proporcionalidad (prorrata) por tarifa, liquidación mensual del IVA, IVA acreditable / no acreditable / por ajustar, libros de ventas y compras, declaración D104 (Costa Rica · Ministerio de Hacienda), cierre mensual con asiento contable a CG.", entities:["ProporcionalidadEstimada","IndiceProporcionalidadReal","CierreMensual","DetalleCierre","AsientoCierre","ActividadEconomica","ExcepcionD104"] },
  { code:"RH", enOlo:"no", name:"Recursos Humanos / Capital Humano", role:"Gestión de personal", status:"partial", purpose:"Confirmado por integración en CO, AF y GN. Capital Humano se posiciona como reemplazo / extensión de funciones de GN. Sin manual propio en corpus.", entities:["Empleado","Plaza"] },
  { code:"CCH", enOlo:"menu", name:"Caja Chica", role:"Caja menor", status:"partial", purpose:"Confirmado por integración en CB y MF. Vinculado a cuenta bancaria de CB; vales con afectación IVA hacia MF.", entities:["Vale"] },
  { code:"PY", enOlo:"no", name:"Control de Proyectos", role:"Gestión de proyectos", status:"partial", purpose:"Confirmado por integración en CB (cheques/TEF de subcontratos), CO (presupuesto por fase) y GN (horas laboradas por fase).", entities:["Proyecto","Fase"] },
  { code:"FC", enOlo:"no", name:"Flujo de Caja", role:"Cash forecast", status:"partial", purpose:"Confirmado por integración en CB y CC. Toma saldos bancarios y transacciones de clientes/proveedores.", entities:[] },
  { code:"POS", enOlo:"no", name:"Punto de Venta", role:"Retail / mostrador", status:"partial", purpose:"Confirmado por integración en MF. Genera apartados, facturación y devoluciones que alimentan a MF para cálculo de IVA.", entities:["Apartado","Factura","Devolucion"] },
  { code:"FR", enOlo:"no", name:"Facturación de Rutero", role:"Facturación móvil en ruta", status:"partial", purpose:"Confirmado por integración en MF. Genera facturas y devoluciones desde rutas comerciales.", entities:[] },
  { code:"AC", enOlo:"no", name:"Administración de Contratos", role:"Servicios recurrentes", status:"partial", purpose:"Confirmado por integración en MF. Facturación de contratos.", entities:[] },
];

// Módulos de la suite eflow (ePRAC) en OLO — datos verificados:
//  · WMS-D: crawl de la app en vivo (23/09/2026, wms_manual.json)
//  · WMS-RF: mapa de la app handheld en el teléfono (25/09/2026, hh_manual.js)
//  · WMH: levantamiento de Torre de Control + Manual de Usuario Control Tower (09/2026)
// Cómo aparece cada módulo en el Softland propio de OLO (compañía OVERSEAS, manual 25/09/2026)
export const EN_OLO = {
  pantallas: { label:"En OLO · con pantallas", color:"#15803d" },
  menu:      { label:"En OLO · solo menú",     color:"#b45309" },
  sin_acceso:{ label:"En OLO · sin acceso",    color:"#b91c1c" },
  no:        { label:"No está en OLO",         color:"#64748b" },
};

export const OPS_MODULES = [
  { code:"WMS-D", name:"eflow WMS · Desktop", status:"confirmed", vendor:"ePRAC · eflow Cloud Suite",
    role:"Aplicación de escritorio Windows (eFlow-WMS.exe) · v3.2.8.5 · almacén 0001 - CEDI OLO · BD EFLOW_OLO",
    purpose:"Núcleo del CEDI. 9 módulos y 122 opciones mapeadas del sistema en vivo: Control (12: acciones de trabajo, alerta picking, chequeo, citas de proveedores, monitores de actividades y errores, movimientos), Catálogos (14: artículos, EAN, kits, transformación, clientes, proveedores, servicios, unidades de transporte), Documentos (15: órdenes de recepción y expedición, confirmaciones, consolidación, carga camión, comparación alisto vs packing, transformación, verificación de kits, servicios especiales), Inventario (11: consulta, ajustes individuales y masivos, tomas físicas, palets, slotting, traslado de sucursal), Configuración (20: almacenes, compañías, sucursales, zonas, almacenamientos y ubicaciones, rutas y secuencias de picking), Reportes (29: productividad, kardex, control de órdenes, palets pendientes), Seguridad (16) y Paneles (4).",
    note:"Manual completo con capturas: Operación › eFlow WMS · Manual." },
  { code:"WMS-RF", name:"eflow WMS · RF (handheld)", status:"confirmed", vendor:"ePRAC · eflow Cloud Suite",
    role:"App Android eFlow WMS HH v3.1.73.1 (Xamarin) · menú «eWMS - CEDI OLO» con usuario, recurso y almacén · escáner/impresora por Bluetooth",
    purpose:"Ejecución física en piso. 5 módulos y 18 opciones mapeadas en el teléfono: Recibo (Cross Banda, Recepción, Validación Crossdocking General, Validación General), Almacenaje (Multipalet Libre, Semidirigido, Picking Inverso, Transferencia Stock, Traslado Libre, Traslado Sucursal, Ubicación Libre), Picking, despacho y reposiciones (Carga Camión, Contenedor Máster, Despacho, Trabajo automático), Inventario (Inventario, Toma física) y Control (Creación Art. Zona Picking). Cada operación empieza con un escaneo.",
    note:"Manual con capturas: Operación › eFlow WMS · Handheld. Faltan Trabajo automático, Toma física y las pantallas que aparecen después de escanear (requieren una tarea real)." },
  { code:"WMH", name:"WMH · Torre de Control (Control Tower)", status:"confirmed", vendor:"ePRAC (eprac.com) · eflow Cloud Suite",
    role:"Aplicación web (Angular + Material + AG Grid) · v4.18.4.4 · http://10.17.225.22:8080",
    purpose:"Planifica y controla los viajes de distribución. Dashboard «Operación en tiempo real (Viajes)» con KPIs (viajes, rutas, órdenes, líneas, montos, peso, volumen, unidades, clientes) y acciones Nuevo Viaje, Anular Viaje y Fusionar; Catálogos (Almacenes, Bajadas, Choferes, Compañías de Transporte, Rutas y Zonas de Distribución, Unidades de Transporte); Documentos (Órdenes, Órdenes Inactivas, Visor de viajes con Despachar y Guía de Carga PDF/Excel, Nuevo Viaje); Reportes (Reporte de viaje); Seguridad (8 reglas FLOW, usuarios). Devuelve a eFlow el número de viaje, la prioridad y la banda asignada.",
    note:"Detalle, datos reales y capturas: Operación › Torre de Control · WMH." },
  { code:"SORTER", name:"Mecalux · SORTER CLIRO (CliroSorter)", status:"confirmed", vendor:"Mecalux",
    role:"Sistema de clasificación automática (sorter) / cross-docking EPA · web · http://10.17.225.85:2030/",
    purpose:"Cross-docking de EPA: cada expediente u orden de recepción (ej. CONSOL) se descompone por producto y tienda de destino y cada bulto se clasifica hacia una bajada (= tienda / viaje), automática o manualmente. Nivel 1 recibe y clasifica (Control de órdenes con Estatus de bajadas, Orden de recepción y Líneas; Escaner; Catálogo de productos; Reportes). Planta Baja agrupa en viajes de despacho (Control de viajes con Estatus de bajadas, Viajes y Cajas; Escaner; Reportes). Home muestra el avance de las 7 bajadas de Planta Baja y las 6 de Nivel 1.",
    note:"GAP: el mapeo es funcional (12 pantallas). La integración técnica con eFlow WMS / EPA —cómo llegan las órdenes al sorter y cómo vuelve la clasificación— no está documentada. Manual con capturas: Operación › SORTER CLIRO · Manual." },
];

export const SATELLITE_MODULES = [
  { name:"Sistema Aduanero (TICA o equivalente)", purpose:"Soporta proceso 'Administración de procesos aduaneros' en BPA OLO. Sistema NO documentado.", status:"inferred" },
  { name:"Sistema de Zona Franca (régimen SEL)", purpose:"Soporta proceso 'Gestión de Internamiento Zona Franca SEL'. Sistema NO documentado.", status:"inferred" },
  { name:"TMS Internacional", purpose:"WMH cubre transporte de distribución local. Para 'Gestión de transporte internacional' debe existir un sistema separado o servicio externo. NO documentado.", status:"inferred" },
  { name:"Portal de clientes / EDI", purpose:"Típico en operación 3PL para órdenes y forecasts. NO documentado.", status:"inferred" },
  { name:"BI / Data Warehouse", purpose:"Proceso 'Inteligencia de negocio' aparece en BPA con madurez 1. Sistema NO implementado / NO documentado.", status:"inferred" },
  { name:"Portal de Personas / Capital Humano", purpose:"Mencionado en manual de GN como punto de integración para autoservicio de empleados (consulta de pagos). NO confirmado si está implementado.", status:"partial" },
];

// `silo`: silo del módulo Procesos (procesos_categorias.id) que levanta ese proceso del BPA
export const BPA_PROCESSES = {
  estrategicos: [
    { name:"Planificación Estratégica", maturity:1, priority:1, owner:"Ignacio Vieto", coverage:[], note:"Sin sistema documentado." },
    { name:"Inteligencia de Negocios", maturity:1, priority:3, owner:"—", coverage:[], note:"Sistema BI no implementado." },
    { name:"Innovación", maturity:1, priority:3, owner:"—", coverage:[] },
    { name:"Gestión del Conocimiento", maturity:1, priority:3, owner:"—", coverage:[] },
  ],
  negocio: [
    { name:"Gestión de Comercialización", silo:"neg_comercializacion", maturity:1, priority:1, owner:"—", coverage:["FA"] },
    { name:"Toma de Requerimientos de Clientes", silo:"neg_requerimientos", maturity:1, priority:1, owner:"—", coverage:[], note:"Perfiles de cliente en drive." },
    { name:"Gestión de Transporte Local", silo:"neg_transporte_local", maturity:1, priority:1, owner:"—", coverage:["WMH","WMS-D"], note:"Carga camión en eflow WMS y viajes en Torre de Control (Procesos › P1.18)." },
    { name:"Gestión de Transporte Internacional", silo:"neg_transporte_intl", maturity:1, priority:1, owner:"—", coverage:[], note:"Sin TMS internacional documentado." },
    { name:"Gestión de Internamiento Zona Franca SEL", silo:"neg_internamiento_szf", maturity:1, priority:1, owner:"—", coverage:[], note:"Sin sistema dedicado documentado." },
    { name:"Administración de Procesos Aduaneros", silo:"neg_aduaneros", maturity:1, priority:1, owner:"—", coverage:[], note:"Sin integración aduanera documentada." },
    { name:"Gestión de Almacenamiento (ZF + nacional)", silo:"neg_almacenamiento", maturity:1, priority:1, owner:"Gerente CEDI · vacante", coverage:["WMS-D","WMS-RF"] },
    { name:"Servicios de Valor Agregado", silo:"neg_valor_agregado", maturity:1, priority:1, owner:"Gerente CEDI · vacante", coverage:["WMS-D"], note:"eflow WMS tiene pantallas de VAS (servicios especiales, kits, transformación, etiquetas); procesos borrador en Procesos › P1.21. Drive de valor agregado." },
    { name:"Administración Financiera Contable a Clientes", silo:"neg_fin_contable", maturity:1, priority:1, owner:"Jorge Castro", coverage:["CG","CC"] },
    { name:"Servicio de Gestión de Talento al Cliente", silo:"neg_talento_cliente", maturity:1, priority:1, owner:"Mary Montanes", coverage:[] },
    { name:"Facturación", silo:"neg_facturacion", maturity:1, priority:1, owner:"Isabella López", coverage:["FA","MF"], note:"Manual interno: 'creación de pedido en Softland'." },
    { name:"Cobro", silo:"neg_cobro", maturity:1, priority:1, owner:"Jorge Castro", coverage:["CC","CB"] },
    { name:"Seguimiento y Control de la Operación", silo:"neg_seguimiento_operacion", maturity:1, priority:1, owner:"Ignacio Vieto", coverage:["WMH","WMS-D"], note:"Monitores, acciones de trabajo y paneles de eflow WMS (Procesos › P1.19)." },
    { name:"Gestión de Relación con Clientes", silo:"neg_relacion_clientes", maturity:1, priority:1, owner:"—", coverage:[] },
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

export const EXTENSION_POINTS = [
  { type:"Hooks", detail:"CB: Generación de Asientos Contables, Carga Automática de Datos. CC: Plan de Pagos, Asientos Contables. CP: análogos. AF: Reporte de Impuesto sobre la Renta, Reporte de Impuesto a los Activos." },
  { type:"Archivos *.ini", detail:"exactus.ini y CB/CC/CP/AF_*.ini definen comportamiento (ej. CC_FechaDeAplicacion, CP_DescProntoPagoFinal, AF_TCambioFechaAdquisicion, ImprimirMontoConMoneda)." },
  { type:"Plantillas XSLT", detail:"CB documenta herramienta de pruebas de archivos XSLT — usada para conversión / generación de documentos." },
  { type:"Carga masiva", detail:"CC documenta carga masiva de documentos (manual y automática). CO carga pronósticos desde Excel via cargador dinámico. Punto natural de integración batch." },
  { type:"Reportes ASCII", detail:"CP genera archivos ASCII para transferencias bancarias — formato típico para subir a banca electrónica." },
  { type:"Transacciones configurables (CI)", detail:"Cualquier tipo de movimiento de inventario puede configurarse con plantilla, números de serie, lotes y reglas contables." },
  { type:"Excepciones D104 (MF)", detail:"Mantenimiento dedicado en AS para sobreescribir actividad económica por (Cliente, Artículo, Tarifa)." },
];

export const LOCALIZATIONS = [
  { country:"Costa Rica", status:"active", detail:"BNCR · Ministerio de Hacienda · D104 · Ley 9635 · Monitor Fiscal calibrado" },
  { country:"Venezuela", status:"next", detail:"Próxima expansión · pendiente identificar SENIAT · IVA · libros fiscales" },
];

export const GAPS = [
  "Mecanismo concreto de la interfaz Softland↔eflow (batch / WS / archivos / BD intermedia / cola).",
  "Semántica del esquema EFLOW_OLO: las tablas y sus claves se leyeron de la base, pero no hay diccionario de datos del proveedor; las relaciones pantalla ↔ tabla del manual de eFlow son inferidas.",
  "Softland de OLO (OVERSEAS): CI, CO, FA, CC, CP y DE tienen pantallas; CG, CB, AF, CR, CH, RP, GN y MF solo menú; Admin. del Sistema (AS) sin acceso. POS, FR, AC, Capital Humano, Control de Proyectos y Flujo de Caja no aparecen en el menú de OLO (ver Módulos ERP › Pendientes por mapear).",
  "Base SOFTLAND propia de OLO (servidor 10.17.224.40): el BPA no tiene usuario de lectura; el diccionario de tablas de Softland es el del cliente Cofersa (QA CR).",
  "Existencia, marca y endpoints de TMS internacional, sistema aduanero (TICA) y portal de clientes / EDI.",
  "Carga eflow WMS → WMH Torre de Control: la Torre lee de tablas de staging ext_tms_*, pero no está documentado qué proceso las llena ni cómo vuelven a eFlow el número de viaje, la prioridad y la banda.",
  "Módulo de cobro de almacenaje eInv (corte, estadía por palet, pre-proforma, factura): sus tablas existen en EFLOW_OLO pero sus pantallas no se capturaron. Servicios Especiales y los demás VAS tienen pantallas, pero no procedimiento aprobado de OLO.",
  "Integración técnica SORTER CLIRO (Mecalux) ↔ eflow WMS / EPA: cómo llegan las órdenes de recepción al sorter y cómo vuelve la clasificación; confirmar si las 7 bajadas de WMH son las 7 de la Planta Baja del sorter.",
  "Handheld RF de eflow: el menú real (5 módulos, 18 opciones) ya está mapeado; faltan Trabajo automático, Toma física y las pantallas que aparecen después de escanear, y 7 opciones no están en ningún procedimiento de OLO.",
  "Para expansión a Venezuela: requerimientos SENIAT, formatos de libros fiscales VE, configuración de Monitor Fiscal para tarifas IVA venezolanas.",
];
