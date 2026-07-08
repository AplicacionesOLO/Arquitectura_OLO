// ═══════════════════════════════════════════════════════════════════════════
// DATOS · INTEGRACIONES + CLASIFICADORES
// ═══════════════════════════════════════════════════════════════════════════
import { EFW_MOD, EFW_INTEGRATIONS } from "./efw.js";
import { SRO_MOD } from "./sro.js";
import { SCO_MOD } from "./sco.js";
import { EFWBEVAL_MOD,   EFWBEVAL_INTEGRATIONS   } from "./beval_ve.js";
import { EFWFEBECA_MOD,  EFWFEBECA_INTEGRATIONS  } from "./febeca_ve.js";
import { EFWSILLACA_MOD, EFWSILLACA_INTEGRATIONS } from "./sillaca_ve.js";
import { EFWWMH_MOD,    EFWWMH_INTEGRATIONS    } from "./wmh_ve.js";
import { WMH_CR_MOD,    WMH_CR_INTEGRATIONS    } from "./wmh_cr.js";
import { EINTEGRA_VE_MOD, EINTEGRA_VE_INTEGRATIONS } from "./eintegra_ve.js";
import { SFLBEVAL_MOD, SFLBEVAL_INTEGRATIONS } from "./softland_beval_ve.js";
import { SFLFEBECA_MOD, SFLFEBECA_INTEGRATIONS } from "./softland_febeca_ve.js";
import { SFLSILLACA_MOD, SFLSILLACA_INTEGRATIONS } from "./softland_sillaca_ve.js";
import { SFLTREXA_MOD, SFLTREXA_INTEGRATIONS } from "./softland_trexa_ve.js";
import { SFLPRISMA_MOD, SFLPRISMA_INTEGRATIONS } from "./softland_prisma_ve.js";

export { EFW_MOD };
export { SRO_MOD };
export { SCO_MOD };
export { EFWBEVAL_MOD, EFWFEBECA_MOD, EFWSILLACA_MOD, EFWWMH_MOD };
export { WMH_CR_MOD };
export { EINTEGRA_VE_MOD };
export { SFLBEVAL_MOD, SFLFEBECA_MOD, SFLSILLACA_MOD, SFLTREXA_MOD, SFLPRISMA_MOD };
// Arrays de integraciones exportados directamente (no van al array global)
export { EFWBEVAL_INTEGRATIONS, EFWFEBECA_INTEGRATIONS, EFWSILLACA_INTEGRATIONS, EFWWMH_INTEGRATIONS };
export { WMH_CR_INTEGRATIONS, EINTEGRA_VE_INTEGRATIONS };
export { SFLBEVAL_INTEGRATIONS, SFLFEBECA_INTEGRATIONS, SFLSILLACA_INTEGRATIONS, SFLTREXA_INTEGRATIONS, SFLPRISMA_INTEGRATIONS };

export const ERP_MOD   = new Set(["AS","CG","CB","CC","CP","FA","CO","CI","AF","GN","MF","RH","CCH","PY","FC","POS","FR","AC"]);
export const EFLOW_MOD = new Set(["WMS-D","WMS-RF","WMH","ERP"]);
export const SAT_MOD   = new Set(["Mecalux","EDI","Aduanas","BI","ZF","TMSI"]);
export const SUITE_MOD = new Set(["SRO","GoRamp","Trade","RFID","Pricing","OLO-API","Intermedia","LagoDatos",
  "OLO API","ePRAC","Middleware","Suite OLO","Liq. Viajes","Raga Orders","CCA","Fac. Svc","MPF",
  "Mayoreo","EPA","Compiere","OLO System","TICA","Delzof","Power BI","Tec. Tiempo","eflow"]);

export const INTEGRATIONS = [
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
  // ── EFW — eFlow WMS (generado desde schema real) ─────────────────────────
  ...EFW_INTEGRATIONS,
  // Venezuela schemas se manejan en arrays separados (mismos nombres de tabla que EFW CR)
  // ── SCO ──────────────────────────────────────────────────────────────────
  { from:"categorias",            to:"tiendas",                  what:"categorias.tienda_id → tiendas", status:"confirmed" },
  { from:"categorias_inventario", to:"tiendas",                  what:"categorias_inventario.tienda_id → tiendas", status:"confirmed" },
  { from:"unidades_medida",       to:"tiendas",                  what:"unidades_medida.tienda_id → tiendas", status:"confirmed" },
  { from:"inventario",            to:"tiendas",                  what:"inventario.tienda_id → tiendas", status:"confirmed" },
  { from:"inventario",            to:"unidades_medida",          what:"inventario.unidad_base_id → unidades_medida", status:"confirmed" },
  { from:"inventario",            to:"tipos_cod_barras",         what:"inventario.tipo_cod_barras → tipos_cod_barras", status:"confirmed" },
  { from:"inventario",            to:"categorias_inventario",    what:"inventario.categoria_id → categorias_inventario", status:"confirmed" },
  { from:"productos",             to:"tiendas",                  what:"productos.tienda_id → tiendas", status:"confirmed" },
  { from:"productos",             to:"categorias",               what:"productos.categoria_id → categorias", status:"confirmed" },
  { from:"bom_items",             to:"productos",                what:"bom_items.product_id → productos", status:"confirmed" },
  { from:"bom_items",             to:"inventario",               what:"bom_items.id_componente → inventario · componente del BOM", status:"confirmed" },
  { from:"bom_items",             to:"unidades_medida",          what:"bom_items.unidad_id → unidades_medida", status:"confirmed" },
  { from:"inventario_niveles",    to:"inventario",               what:"inventario_niveles.articulo_id → inventario", status:"confirmed" },
  { from:"inventario_thresholds", to:"inventario",               what:"inventario_thresholds.articulo_id → inventario · puntos de reorden", status:"confirmed" },
  { from:"inventario_alertas",    to:"inventario",               what:"inventario_alertas.articulo_id → inventario · alertas de stock", status:"confirmed" },
  { from:"inventario_movimientos",to:"inventario",               what:"inventario_movimientos.articulo_id → inventario", status:"confirmed" },
  { from:"inventario_movimientos",to:"usuarios",                 what:"inventario_movimientos.usuario_id → usuarios", status:"confirmed" },
  { from:"replenishment_orders",  to:"inventario",               what:"replenishment_orders.articulo_id → inventario", status:"confirmed" },
  { from:"replenishment_orders",  to:"usuarios",                 what:"replenishment_orders.generado_por → usuarios", status:"confirmed" },
  { from:"cantones",              to:"provincias",               what:"cantones.provincia_id → provincias", status:"confirmed" },
  { from:"distritos",             to:"cantones",                 what:"distritos.canton_id → cantones", status:"confirmed" },
  { from:"clientes",              to:"tiendas",                  what:"clientes.tienda_id → tiendas", status:"confirmed" },
  { from:"clientes",              to:"provincias",               what:"clientes.provincia_id → provincias", status:"confirmed" },
  { from:"clientes",              to:"cantones",                 what:"clientes.canton_id → cantones", status:"confirmed" },
  { from:"clientes",              to:"distritos",                what:"clientes.distrito_id → distritos", status:"confirmed" },
  { from:"clientes",              to:"paises",                   what:"clientes.pais_iso → paises.codigo_iso", status:"confirmed" },
  { from:"clientes",              to:"actividades_economicas",   what:"clientes.codigo_actividad_economica → actividades_economicas", status:"confirmed" },
  { from:"cotizaciones",          to:"tiendas",                  what:"cotizaciones.tienda_id → tiendas", status:"confirmed" },
  { from:"cotizaciones",          to:"clientes",                 what:"cotizaciones.cliente_id → clientes", status:"confirmed" },
  { from:"cotizacion_items",      to:"cotizaciones",             what:"cotizacion_items.cotizacion_id → cotizaciones", status:"confirmed" },
  { from:"pedidos",               to:"tiendas",                  what:"pedidos.tienda_id → tiendas", status:"confirmed" },
  { from:"pedidos",               to:"clientes",                 what:"pedidos.cliente_id → clientes", status:"confirmed" },
  { from:"pedidos",               to:"cotizaciones",             what:"pedidos.referencia_cotizacion_id → cotizaciones", status:"confirmed" },
  { from:"pedidos",               to:"usuarios",                 what:"pedidos.created_by → usuarios", status:"confirmed" },
  { from:"pedido_items",          to:"pedidos",                  what:"pedido_items.pedido_id → pedidos", status:"confirmed" },
  { from:"inventario_reservas",   to:"inventario",               what:"inventario_reservas.id_articulo → inventario", status:"confirmed" },
  { from:"inventario_reservas",   to:"pedidos",                  what:"inventario_reservas.pedido_id → pedidos", status:"confirmed" },
  { from:"inventario_reservas",   to:"cotizaciones",             what:"inventario_reservas.cotizacion_id → cotizaciones", status:"confirmed" },
  { from:"facturas_electronicas", to:"clientes",                 what:"facturas_electronicas.cliente_id → clientes", status:"confirmed" },
  { from:"facturas_electronicas", to:"pedidos",                  what:"facturas_electronicas.pedido_id → pedidos", status:"confirmed" },
  { from:"facturas_electronicas", to:"cotizaciones",             what:"facturas_electronicas.cotizacion_id → cotizaciones", status:"confirmed" },
  { from:"facturas_electronicas", to:"usuarios",                 what:"facturas_electronicas.created_by → usuarios", status:"confirmed" },
  { from:"factura_items",         to:"facturas_electronicas",    what:"factura_items.factura_id → facturas_electronicas", status:"confirmed" },
  { from:"comprobantes_recibidos",to:"tiendas",                  what:"comprobantes_recibidos.tienda_id → tiendas", status:"confirmed" },
  { from:"rol_permisos",          to:"roles",                    what:"rol_permisos.rol_id → roles", status:"confirmed" },
  { from:"rol_permisos",          to:"permisos",                 what:"rol_permisos.permiso_id → permisos", status:"confirmed" },
  { from:"usuario_roles",         to:"usuarios",                 what:"usuario_roles.usuario_id → usuarios", status:"confirmed" },
  { from:"usuario_roles",         to:"roles",                    what:"usuario_roles.rol_id → roles", status:"confirmed" },
  { from:"usuario_tiendas",       to:"usuarios",                 what:"usuario_tiendas.usuario_id → usuarios", status:"confirmed" },
  { from:"usuario_tiendas",       to:"tiendas",                  what:"usuario_tiendas.tienda_id → tiendas", status:"confirmed" },
  { from:"usuario_tienda_actual", to:"usuarios",                 what:"usuario_tienda_actual.usuario_id → usuarios", status:"confirmed" },
  { from:"usuario_tienda_actual", to:"tiendas",                  what:"usuario_tienda_actual.tienda_id → tiendas", status:"confirmed" },
  { from:"auditoria_acciones",    to:"usuarios",                 what:"auditoria_acciones.usuario_id → usuarios", status:"confirmed" },
  { from:"tareas",                to:"tiendas",                  what:"tareas.tienda_id → tiendas", status:"confirmed" },
  { from:"tareas",                to:"cotizaciones",             what:"tareas.cotizacion_id → cotizaciones", status:"confirmed" },
  { from:"tareas_config_campos",  to:"tiendas",                  what:"tareas_config_campos.tienda_id → tiendas", status:"confirmed" },
  { from:"tareas_encargados",     to:"tiendas",                  what:"tareas_encargados.tienda_id → tiendas", status:"confirmed" },
  { from:"tareas_colaboradores",  to:"tiendas",                  what:"tareas_colaboradores.tienda_id → tiendas", status:"confirmed" },
  { from:"tareas_personal_asignado",to:"tareas",                 what:"tareas_personal_asignado.tarea_id → tareas", status:"confirmed" },
  { from:"tareas_personal_asignado",to:"tareas_colaboradores",   what:"tareas_personal_asignado.colaborador_id → tareas_colaboradores", status:"confirmed" },
  { from:"tareas_consecutivos",   to:"tiendas",                  what:"tareas_consecutivos.tienda_id → tiendas", status:"confirmed" },
  { from:"tareas_items",          to:"tareas",                   what:"tareas_items.tarea_id → tareas", status:"confirmed" },
  { from:"tareas_reportes_colaboradores",to:"tareas",            what:"tareas_reportes_colaboradores.tarea_id → tareas", status:"confirmed" },
  { from:"tareas_reportes_colaboradores",to:"tareas_colaboradores",what:"tareas_reportes_colaboradores.colaborador_id → tareas_colaboradores", status:"confirmed" },
  { from:"tareas_reportes_colaboradores",to:"tiendas",           what:"tareas_reportes_colaboradores.tienda_id → tiendas", status:"confirmed" },
  { from:"optimizador_proyectos_temp",to:"tiendas",              what:"optimizador_proyectos_temp.id_tienda → tiendas", status:"confirmed" },
  { from:"optimizador_proyectos_temp",to:"cotizaciones",         what:"optimizador_proyectos_temp.id_cotizacion → cotizaciones", status:"confirmed" },
  { from:"correspondencia_plantillas",to:"tiendas",              what:"correspondencia_plantillas.tienda_id → tiendas", status:"confirmed" },
  { from:"correspondencia_plantillas",to:"usuarios",             what:"correspondencia_plantillas.created_by → usuarios", status:"confirmed" },
  { from:"correspondencia_reglas",to:"tiendas",                  what:"correspondencia_reglas.tienda_id → tiendas", status:"confirmed" },
  { from:"correspondencia_reglas",to:"usuarios",                 what:"correspondencia_reglas.created_by → usuarios", status:"confirmed" },
  { from:"correspondencia_reglas",to:"correspondencia_plantillas",what:"correspondencia_reglas.plantilla_id → correspondencia_plantillas", status:"confirmed" },
  { from:"correspondencia_historial",to:"tiendas",               what:"correspondencia_historial.tienda_id → tiendas", status:"confirmed" },
  { from:"correspondencia_historial",to:"correspondencia_reglas",what:"correspondencia_historial.regla_id → correspondencia_reglas", status:"confirmed" },
  { from:"correspondencia_historial",to:"correspondencia_plantillas",what:"correspondencia_historial.plantilla_id → correspondencia_plantillas", status:"confirmed" },
  // ── SRO — Sistema de Rastreo de Órdenes ──────────────────────────────────
  // Core
  { from:"warehouses",         to:"organizations",       what:"warehouses.org_id → organizations", status:"confirmed" },
  { from:"warehouses",         to:"countries",           what:"warehouses.country_id → countries", status:"confirmed" },
  { from:"countries",          to:"organizations",       what:"countries.org_id → organizations", status:"confirmed" },
  // Auth / RBAC
  { from:"role_permissions",   to:"roles",               what:"role_permissions.role_id → roles", status:"confirmed" },
  { from:"role_permissions",   to:"permissions",         what:"role_permissions.permission_id → permissions", status:"confirmed" },
  { from:"user_org_roles",     to:"organizations",       what:"user_org_roles.org_id → organizations", status:"confirmed" },
  { from:"user_org_roles",     to:"roles",               what:"user_org_roles.role_id → roles · asignación por organización", status:"confirmed" },
  // Docks
  { from:"dock_categories",    to:"organizations",       what:"dock_categories.org_id → organizations", status:"confirmed" },
  { from:"dock_statuses",      to:"organizations",       what:"dock_statuses.org_id → organizations", status:"confirmed" },
  { from:"docks",              to:"organizations",       what:"docks.org_id → organizations", status:"confirmed" },
  { from:"docks",              to:"warehouses",          what:"docks.warehouse_id → warehouses", status:"confirmed" },
  { from:"docks",              to:"dock_categories",     what:"docks.category_id → dock_categories", status:"confirmed" },
  { from:"docks",              to:"dock_statuses",       what:"docks.status_id → dock_statuses", status:"confirmed" },
  { from:"dock_time_blocks",   to:"docks",               what:"dock_time_blocks.dock_id → docks · bloqueo de horario", status:"confirmed" },
  { from:"dock_time_blocks",   to:"organizations",       what:"dock_time_blocks.org_id → organizations", status:"confirmed" },
  // Reservaciones
  { from:"reservation_statuses",to:"organizations",      what:"reservation_statuses.org_id → organizations", status:"confirmed" },
  { from:"reservations",       to:"organizations",       what:"reservations.org_id → organizations", status:"confirmed" },
  { from:"reservations",       to:"docks",               what:"reservations.dock_id → docks", status:"confirmed" },
  { from:"reservations",       to:"reservation_statuses",what:"reservations.status_id → reservation_statuses", status:"confirmed" },
  { from:"reservations",       to:"clients",             what:"reservations.client_id → clients", status:"confirmed" },
  { from:"reservation_files",  to:"reservations",        what:"reservation_files.reservation_id → reservations · archivos adjuntos", status:"confirmed" },
  { from:"reservation_files",  to:"organizations",       what:"reservation_files.org_id → organizations", status:"confirmed" },
  { from:"reservation_activity_log", to:"reservations",  what:"reservation_activity_log.reservation_id → reservations · auditoría de cambios", status:"confirmed" },
  { from:"reservation_activity_log", to:"organizations", what:"reservation_activity_log.org_id → organizations", status:"confirmed" },
  { from:"reservation_consolidated_providers", to:"reservations", what:"reservation_consolidated_providers.reservation_id → reservations", status:"confirmed" },
  { from:"reservation_consolidated_providers", to:"providers",    what:"reservation_consolidated_providers.provider_id → providers", status:"confirmed" },
  // Clientes
  { from:"clients",            to:"organizations",       what:"clients.org_id → organizations", status:"confirmed" },
  { from:"client_rules",       to:"clients",             what:"client_rules.client_id → clients · reglas de negocio", status:"confirmed" },
  { from:"client_rules",       to:"organizations",       what:"client_rules.org_id → organizations", status:"confirmed" },
  { from:"client_docks",       to:"clients",             what:"client_docks.client_id → clients · muelles asignados", status:"confirmed" },
  { from:"client_docks",       to:"docks",               what:"client_docks.dock_id → docks", status:"confirmed" },
  { from:"client_docks",       to:"organizations",       what:"client_docks.org_id → organizations", status:"confirmed" },
  { from:"warehouse_clients",  to:"warehouses",          what:"warehouse_clients.warehouse_id → warehouses", status:"confirmed" },
  { from:"warehouse_clients",  to:"clients",             what:"warehouse_clients.client_id → clients", status:"confirmed" },
  { from:"warehouse_clients",  to:"organizations",       what:"warehouse_clients.org_id → organizations", status:"confirmed" },
  { from:"user_clients",       to:"clients",             what:"user_clients.client_id → clients · acceso por usuario", status:"confirmed" },
  { from:"user_clients",       to:"organizations",       what:"user_clients.org_id → organizations", status:"confirmed" },
  { from:"client_pickup_rules",to:"clients",             what:"client_pickup_rules.client_id → clients", status:"confirmed" },
  { from:"client_pickup_rules",to:"docks",               what:"client_pickup_rules.dock_id → docks · reglas pickup", status:"confirmed" },
  { from:"client_pickup_rules",to:"organizations",       what:"client_pickup_rules.org_id → organizations", status:"confirmed" },
  // Proveedores
  { from:"providers",          to:"organizations",       what:"providers.org_id → organizations", status:"confirmed" },
  { from:"cargo_types",        to:"organizations",       what:"cargo_types.org_id → organizations", status:"confirmed" },
  { from:"provider_cargo_time_profiles", to:"providers",    what:"provider_cargo_time_profiles.provider_id → providers · perfil de tiempo", status:"confirmed" },
  { from:"provider_cargo_time_profiles", to:"cargo_types",  what:"provider_cargo_time_profiles.cargo_type_id → cargo_types", status:"confirmed" },
  { from:"provider_cargo_time_profiles", to:"warehouses",   what:"provider_cargo_time_profiles.warehouse_id → warehouses", status:"confirmed" },
  { from:"client_providers",   to:"clients",             what:"client_providers.client_id → clients", status:"confirmed" },
  { from:"client_providers",   to:"providers",           what:"client_providers.provider_id → providers · proveedores de cliente", status:"confirmed" },
  { from:"provider_warehouses",to:"providers",           what:"provider_warehouses.provider_id → providers", status:"confirmed" },
  { from:"provider_warehouses",to:"warehouses",          what:"provider_warehouses.warehouse_id → warehouses", status:"confirmed" },
  { from:"cargo_type_warehouses",to:"cargo_types",       what:"cargo_type_warehouses.cargo_type_id → cargo_types", status:"confirmed" },
  { from:"cargo_type_warehouses",to:"warehouses",        what:"cargo_type_warehouses.warehouse_id → warehouses", status:"confirmed" },
  { from:"user_providers",     to:"providers",           what:"user_providers.provider_id → providers · acceso por usuario", status:"confirmed" },
  { from:"provider_clusters",  to:"organizations",       what:"provider_clusters.org_id → organizations", status:"confirmed" },
  { from:"provider_cluster_items",to:"provider_clusters",what:"provider_cluster_items.cluster_id → provider_clusters", status:"confirmed" },
  { from:"provider_cluster_items",to:"providers",        what:"provider_cluster_items.provider_id → providers", status:"confirmed" },
  { from:"user_provider_clusters",to:"provider_clusters",what:"user_provider_clusters.cluster_id → provider_clusters", status:"confirmed" },
  { from:"origen_proveedores", to:"providers",           what:"origen_proveedores.provider_id → providers · origen/fuente", status:"confirmed" },
  // Acceso de usuarios
  { from:"user_warehouse_access",to:"warehouses",        what:"user_warehouse_access.warehouse_id → warehouses", status:"confirmed" },
  { from:"user_countries",     to:"countries",           what:"user_countries.country_id → countries", status:"confirmed" },
  { from:"user_warehouses",    to:"warehouses",          what:"user_warehouses.warehouse_id → warehouses", status:"confirmed" },
  { from:"user_country_access",to:"countries",           what:"user_country_access.country_id → countries", status:"confirmed" },
  // Colaboradores
  { from:"work_types",         to:"organizations",       what:"work_types.org_id → organizations", status:"confirmed" },
  { from:"collaborators",      to:"organizations",       what:"collaborators.org_id → organizations", status:"confirmed" },
  { from:"collaborators",      to:"work_types",          what:"collaborators.work_type_id → work_types", status:"confirmed" },
  { from:"collaborator_warehouses",to:"collaborators",   what:"collaborator_warehouses.collaborator_id → collaborators", status:"confirmed" },
  { from:"collaborator_warehouses",to:"warehouses",      what:"collaborator_warehouses.warehouse_id → warehouses", status:"confirmed" },
  // Casetilla
  { from:"casetilla_ingresos", to:"organizations",       what:"casetilla_ingresos.org_id → organizations", status:"confirmed" },
  { from:"casetilla_ingresos", to:"reservations",        what:"casetilla_ingresos.reservation_id → reservations · ingreso vehicular", status:"confirmed" },
  { from:"casetilla_salidas",  to:"organizations",       what:"casetilla_salidas.org_id → organizations", status:"confirmed" },
  { from:"casetilla_salidas",  to:"reservations",        what:"casetilla_salidas.reservation_id → reservations · salida vehicular", status:"confirmed" },
  // Correspondencia
  { from:"correspondence_rules",to:"organizations",      what:"correspondence_rules.org_id → organizations", status:"confirmed" },
  { from:"correspondence_rules",to:"reservation_statuses",what:"correspondence_rules.status_from/to_id → reservation_statuses · trigger", status:"confirmed" },
  { from:"correspondence_rules",to:"warehouses",         what:"correspondence_rules.warehouse_id → warehouses", status:"confirmed" },
  { from:"correspondence_logs", to:"organizations",      what:"correspondence_logs.org_id → organizations", status:"confirmed" },
  { from:"correspondence_logs", to:"correspondence_rules",what:"correspondence_logs.rule_id → correspondence_rules", status:"confirmed" },
  { from:"correspondence_logs", to:"reservations",       what:"correspondence_logs.reservation_id → reservations · log de envíos", status:"confirmed" },
  { from:"correspondence_outbox",to:"organizations",     what:"correspondence_outbox.org_id → organizations", status:"confirmed" },
  { from:"correspondence_outbox",to:"warehouses",        what:"correspondence_outbox.warehouse_id → warehouses", status:"confirmed" },
  { from:"gmail_accounts",     to:"organizations",       what:"gmail_accounts.org_id → organizations · cuenta Gmail por org", status:"confirmed" },
  // Auditoría
  { from:"admin_audit_log",    to:"organizations",       what:"admin_audit_log.org_id → organizations", status:"confirmed" },
  { from:"activity_log",       to:"organizations",       what:"activity_log.org_id → organizations", status:"confirmed" },
  // Conocimiento / IA
  { from:"knowledge_document_roles",       to:"knowledge_documents", what:"knowledge_document_roles.document_id → knowledge_documents · acceso por rol", status:"confirmed" },
  { from:"knowledge_document_permissions", to:"knowledge_documents", what:"knowledge_document_permissions.document_id → knowledge_documents · permisos", status:"confirmed" },
  { from:"knowledge_document_tags",        to:"knowledge_documents", what:"knowledge_document_tags.document_id → knowledge_documents · etiquetas", status:"confirmed" },
  { from:"knowledge_document_versions",    to:"knowledge_documents", what:"knowledge_document_versions.document_id → knowledge_documents · versiones", status:"confirmed" },
  // Chat
  { from:"chat_messages",      to:"chat_sessions",       what:"chat_messages.session_id → chat_sessions", status:"confirmed" },
  // Configuración
  { from:"org_settings",       to:"organizations",       what:"org_settings.org_id → organizations · config por organización", status:"confirmed" },
];

export function codeCluster(code) {
  if (ERP_MOD.has(code))          return "erp";
  if (EFLOW_MOD.has(code))        return "ops";
  if (SAT_MOD.has(code))          return "sat";
  if (SRO_MOD.has(code))          return "sro";
  if (SCO_MOD.has(code))          return "sco";
  if (EFW_MOD.has(code))          return "efw";
  if (WMH_CR_MOD.has(code))       return "wmh_cr";
  if (EFWBEVAL_MOD.has(code))     return "efwbeval";
  if (EFWFEBECA_MOD.has(code))    return "efwfebeca";
  if (EFWSILLACA_MOD.has(code))   return "efwsillaca";
  if (EFWWMH_MOD.has(code))       return "efwwmh";
  if (EINTEGRA_VE_MOD.has(code))  return "eintegra_ve";
  if (SUITE_MOD.has(code))        return "suite";
  return "other";
}

export function rowCategory(row) {
  const f = codeCluster(row.from), t = codeCluster(row.to);
  if (f==="ops"||t==="ops")                   return "ops";
  if (f==="sat"||t==="sat")                   return "sat";
  if (f==="sro"||t==="sro")                   return "sro";
  if (f==="sco"||t==="sco")                   return "sco";
  if (f==="efw"||t==="efw")                   return "efw";
  if (f==="wmh_cr"||t==="wmh_cr")             return "wmh_cr";
  if (f==="efwbeval"||t==="efwbeval")         return "efwbeval";
  if (f==="efwfebeca"||t==="efwfebeca")       return "efwfebeca";
  if (f==="efwsillaca"||t==="efwsillaca")     return "efwsillaca";
  if (f==="efwwmh"||t==="efwwmh")             return "efwwmh";
  if (f==="eintegra_ve"||t==="eintegra_ve")   return "eintegra_ve";
  if (f==="suite"||t==="suite")               return "suite";
  if (f==="erp"&&t==="erp")                   return "erp";
  return "erp";
}

export const CAT_META = {
  global:     { label:"Global · todos",                                    icon:"◎",  color:"#1D1D1B", bg:"#f8f9fa",                border:"#e0e0e0" },
  erp:        { label:"ERP — Softland v7.00 · motor Exactus",              icon:"⬡",  color:"#c0392b", bg:"rgba(192,57,43,0.05)",   border:"rgba(192,57,43,0.2)" },
  ops:        { label:"Operación logística · eflow Cloud Suite",           icon:"🏗", color:"#1abc9c", bg:"rgba(26,188,156,0.08)",  border:"rgba(26,188,156,0.25)" },
  sat:        { label:"Sistemas satélite · externos / inferidos",          icon:"🛰", color:"#9b59b6", bg:"rgba(155,89,182,0.08)",  border:"rgba(155,89,182,0.22)" },
  suite:      { label:"Suite OLO · Clusters del ecosistema",               icon:"⬡",  color:"#185FA5", bg:"rgba(24,95,165,0.07)",   border:"rgba(24,95,165,0.22)" },
  sro:        { label:"SRO — Sistema de Rastreo de Órdenes",               icon:"🏭", color:"#0891b2", bg:"rgba(8,145,178,0.07)",   border:"rgba(8,145,178,0.22)" },
  sco:        { label:"SCO — Sistema Comercial y Operativo",               icon:"🛒", color:"#dc2626", bg:"rgba(220,38,38,0.06)",   border:"rgba(220,38,38,0.2)"  },
  efw:        { label:"EFW — eFlow WMS · Operación Logística",            icon:"🏗", color:"#0d9488", bg:"rgba(13,148,136,0.06)",  border:"rgba(13,148,136,0.22)" },
  wmh_cr:     { label:"WMH CR — Torre de Control · Costa Rica",           icon:"🚚", color:"#16a34a", bg:"rgba(22,163,74,0.06)",   border:"rgba(22,163,74,0.22)"  },
  efwbeval:   { label:"EFW·BEVAL — eFlow Venezuela · Beval",              icon:"🇻🇪", color:"#0891b2", bg:"rgba(8,145,178,0.06)",   border:"rgba(8,145,178,0.2)"  },
  efwfebeca:  { label:"EFW·FEBECA — eFlow Venezuela · Febeca",            icon:"🇻🇪", color:"#0d9488", bg:"rgba(13,148,136,0.06)",  border:"rgba(13,148,136,0.2)" },
  efwsillaca: { label:"EFW·SILLACA — eFlow Venezuela · Sillaca",          icon:"🇻🇪", color:"#7c3aed", bg:"rgba(124,58,237,0.06)",  border:"rgba(124,58,237,0.2)" },
  efwwmh:     { label:"EFW·WMH — Torre de Control Venezuela",             icon:"🏗",  color:"#d97706", bg:"rgba(217,119,6,0.06)",   border:"rgba(217,119,6,0.2)"  },
  softland_beval:{ label:"SFL·BEVAL — Softland ERP · Beval (VE)",         icon:"🇻🇪", color:"#b45309", bg:"rgba(180,83,9,0.06)",    border:"rgba(180,83,9,0.22)"  },
  softland_febeca:{ label:"SFL·FEBECA — Softland ERP · Febeca (VE)",      icon:"🇻🇪", color:"#0d9488", bg:"rgba(13,148,136,0.06)",  border:"rgba(13,148,136,0.22)" },
  softland_sillaca:{ label:"SFL·SILLACA — Softland ERP · Sillaca (VE)",   icon:"🇻🇪", color:"#7c3aed", bg:"rgba(124,58,237,0.06)",  border:"rgba(124,58,237,0.22)" },
  softland_trexa:{ label:"SFL·TREXA — Softland ERP · Trexa (VE)",         icon:"🇻🇪", color:"#be185d", bg:"rgba(190,24,93,0.06)",   border:"rgba(190,24,93,0.22)" },
  softland_prisma:{ label:"SFL·PRISMA — Softland ERP · Prisma (VE)",      icon:"🇻🇪", color:"#4d7c0f", bg:"rgba(77,124,15,0.06)",   border:"rgba(77,124,15,0.22)" },
  eintegra_ve:{ label:"eIntegra·VE — Middleware ERP↔WMS · Venezuela",     icon:"🔌", color:"#6366f1", bg:"rgba(99,102,241,0.06)",  border:"rgba(99,102,241,0.22)" },
  ve_cross:   { label:"Cross-Schema · Relaciones Semánticas VE",          icon:"🔀", color:"#dc2626", bg:"rgba(220,38,38,0.06)",   border:"rgba(220,38,38,0.2)"  },
  ve_global:  { label:"Global · Todos — Venezuela",                      icon:"◎",  color:"#dc2626", bg:"rgba(220,38,38,0.05)",   border:"rgba(220,38,38,0.2)"  },
};

export function getModules(cat) {
  const rows = cat==="global" ? INTEGRATIONS : INTEGRATIONS.filter(r => rowCategory(r)===cat);
  const codes = new Set();
  rows.forEach(r => { codes.add(r.from); codes.add(r.to); });
  return ["*", ...[...codes].sort()];
}
