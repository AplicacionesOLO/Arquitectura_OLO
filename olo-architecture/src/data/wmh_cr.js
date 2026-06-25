// WMH CR — Torre de Control Costa Rica
// Fuente: EFLOW_WMH @ 10.17.224.20 (PROD-CR) — SQL Server 2017
// 34 tablas: 19 core [dbo] + 15 staging ETL [staging]

export const WMH_CR_MOD = new Set([
  // Core TMS
  'journeys', 'journey_orders', 'journey_members', 'journey_order_transportation',
  'drivers', 'transportation_companies', 'trasportation_units',
  'distribution_routes', 'distribution_zones',
  'warehouses', 'activities', 'system_rules', 'system_types',
  'incline_belts',
  // Config & Usuarios
  'users', 'warehouse_logo', 'customer_logo', 'app_counter', 'warehouse_queries',
  // Staging ETL (datos desde eFlow WMS)
  'ext_tms_almacenmovimientos_carcam_mt', 'ext_tms_almacenmovimientos_mt',
  'ext_tms_articulosgestion_mt', 'ext_tms_clientes_mt', 'ext_tms_compania_mt',
  'ext_tms_drivers_mt', 'ext_tms_expedicionescabecera_mt', 'ext_tms_expedicionesdetalle_mt',
  'ext_tms_journey_order_transportation_mt', 'ext_tms_sucursal_mt',
  'ext_tms_transportation_companies_mt', 'ext_tms_trasportation_units_mt',
  'ext_tms_wms_pedido_factura_mt', 'stat_ts_sp_ejecucion_mt', 'tms_errors',
]);

export const WMH_CR_GROUPS = {
  tms: {
    label: 'Viajes & TMS',
    color: '#16a34a',
    tables: ['journeys','journey_orders','journey_members','journey_order_transportation',
             'drivers','transportation_companies','trasportation_units',
             'distribution_routes','distribution_zones'],
  },
  almacen: {
    label: 'Almacén & Config',
    color: '#0d9488',
    tables: ['warehouses','activities','system_rules','system_types','incline_belts',
             'users','warehouse_logo','customer_logo','app_counter','warehouse_queries'],
  },
  staging: {
    label: 'Staging ETL (desde eFlow)',
    color: '#64748b',
    tables: ['ext_tms_almacenmovimientos_carcam_mt','ext_tms_almacenmovimientos_mt',
             'ext_tms_articulosgestion_mt','ext_tms_clientes_mt','ext_tms_compania_mt',
             'ext_tms_drivers_mt','ext_tms_expedicionescabecera_mt','ext_tms_expedicionesdetalle_mt',
             'ext_tms_journey_order_transportation_mt','ext_tms_sucursal_mt',
             'ext_tms_transportation_companies_mt','ext_tms_trasportation_units_mt',
             'ext_tms_wms_pedido_factura_mt','stat_ts_sp_ejecucion_mt','tms_errors'],
  },
};

export const WMH_CR_INTEGRATIONS = [
  { from:'journeys',                       to:'warehouses',        what:'journeys → warehouses · viaje asociado a almacén',                      status:'confirmed' },
  { from:'journey_orders',                 to:'journeys',          what:'journey_orders.journey_id → journeys · órdenes del viaje',               status:'confirmed' },
  { from:'journey_members',               to:'journeys',          what:'journey_members.journey_id → journeys · integrantes del viaje',          status:'confirmed' },
  { from:'journey_order_transportation',   to:'journey_orders',    what:'journey_order_transportation → journey_orders · transporte por orden',   status:'confirmed' },
  { from:'journey_order_transportation',   to:'journeys',          what:'journey_order_transportation → journeys · asignación al viaje',          status:'confirmed' },
  // ETL desde eFlow WMS → WMH
  { from:'ext_tms_expedicionescabecera_mt', to:'journeys',         what:'Expediciones eFlow → Viajes WMH (staging ETL)',                          status:'confirmed' },
  { from:'ext_tms_expedicionesdetalle_mt',  to:'journey_orders',   what:'Detalle expediciones eFlow → Órdenes WMH (staging ETL)',                 status:'confirmed' },
  { from:'ext_tms_almacenmovimientos_mt',   to:'journeys',         what:'Movimientos almacén eFlow → WMH (staging ETL)',                          status:'confirmed' },
  { from:'ext_tms_drivers_mt',              to:'drivers',          what:'Choferes eFlow → Drivers WMH (staging ETL)',                             status:'confirmed' },
  { from:'ext_tms_transportation_companies_mt', to:'transportation_companies', what:'Transportistas eFlow → WMH (staging ETL)',                   status:'confirmed' },
];
