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

export const WMH_CR_COLORS = {
  "journeys": "#16a34a",
  "journey_orders": "#16a34a",
  "journey_members": "#16a34a",
  "journey_order_transportation": "#16a34a",
  "drivers": "#16a34a",
  "transportation_companies": "#16a34a",
  "trasportation_units": "#16a34a",
  "distribution_routes": "#16a34a",
  "distribution_zones": "#16a34a",
  "warehouses": "#0d9488",
  "activities": "#0d9488",
  "system_rules": "#0d9488",
  "system_types": "#0d9488",
  "incline_belts": "#0d9488",
  "users": "#0d9488",
  "warehouse_logo": "#0d9488",
  "customer_logo": "#0d9488",
  "app_counter": "#0d9488",
  "warehouse_queries": "#0d9488",
  "ext_tms_almacenmovimientos_carcam_mt": "#64748b",
  "ext_tms_almacenmovimientos_mt": "#64748b",
  "ext_tms_articulosgestion_mt": "#64748b",
  "ext_tms_clientes_mt": "#64748b",
  "ext_tms_compania_mt": "#64748b",
  "ext_tms_drivers_mt": "#64748b",
  "ext_tms_expedicionescabecera_mt": "#64748b",
  "ext_tms_expedicionesdetalle_mt": "#64748b",
  "ext_tms_journey_order_transportation_mt": "#64748b",
  "ext_tms_sucursal_mt": "#64748b",
  "ext_tms_transportation_companies_mt": "#64748b",
  "ext_tms_trasportation_units_mt": "#64748b",
  "ext_tms_wms_pedido_factura_mt": "#64748b",
  "stat_ts_sp_ejecucion_mt": "#64748b",
  "tms_errors": "#64748b"
};

export const WMH_CR_TABLE_DEFS = {
  "journeys": {
    "pk": "journey_id",
    "cols": [
      "journey_id",
      "created_by",
      "creation_date",
      "situation",
      "is_active",
      "belt_id",
      "closed_by",
      "description"
    ]
  },
  "journey_orders": {
    "pk": "assigment_id",
    "cols": [
      "assigment_id",
      "journey_id→journeys",
      "route_id",
      "assigment_date",
      "warehouse_id",
      "order_id",
      "situation",
      "belt_id"
    ]
  },
  "journey_members": {
    "pk": "journey_id",
    "cols": [
      "journey_id",
      "related_journey→journeys"
    ]
  },
  "journey_order_transportation": {
    "pk": "assigment_id",
    "cols": [
      "assigment_id",
      "journey_id→journeys",
      "unit_id→trasportation_units",
      "driver_id→drivers",
      "assigment_date",
      "situation",
      "company_id",
      "branch_id"
    ]
  },
  "drivers": {
    "pk": "driver_id",
    "cols": [
      "driver_id",
      "transportation_company_id",
      "driver_card_id",
      "driver_code",
      "driver_name",
      "state",
      "situation",
      "driver_phone"
    ]
  },
  "transportation_companies": {
    "pk": "transportation_company_id",
    "cols": [
      "transportation_company_id",
      "company_code",
      "company_name",
      "state"
    ]
  },
  "trasportation_units": {
    "pk": "unit_id",
    "cols": [
      "unit_id",
      "transportation_company_id",
      "vehicle_type_id",
      "unit_code",
      "unit_description",
      "license_plate",
      "state",
      "situation"
    ]
  },
  "distribution_routes": {
    "pk": "route_id",
    "cols": [
      "route_id",
      "zone_id",
      "route_code",
      "route_name",
      "state",
      "route_alias"
    ]
  },
  "distribution_zones": {
    "pk": "zone_id",
    "cols": [
      "zone_id",
      "zone_code",
      "zone_name",
      "state",
      "zone_alias"
    ]
  },
  "warehouses": {
    "pk": "warehouse_id",
    "cols": [
      "warehouse_id",
      "warehouse_code",
      "warehouse_name",
      "dns_connection",
      "state"
    ]
  },
  "activities": {
    "pk": "activity_id",
    "cols": [
      "activity_id",
      "process_id",
      "sub_process_id",
      "user_id",
      "work_type",
      "situation",
      "creation_date",
      "origin_warehouse_id"
    ]
  },
  "system_rules": {
    "pk": "rule_id",
    "cols": [
      "rule_id",
      "rule_type",
      "description",
      "instalation_date",
      "version",
      "range",
      "maintenance_date",
      "numeric_range1"
    ]
  },
  "system_types": {
    "pk": "table_name",
    "cols": [
      "table_name",
      "field",
      "value",
      "description"
    ]
  },
  "incline_belts": {
    "pk": "belt_id",
    "cols": [
      "belt_id",
      "status"
    ]
  },
  "users": {
    "pk": "user_id",
    "cols": [
      "user_id",
      "user_code",
      "name",
      "last_name",
      "password",
      "is_active",
      "email"
    ]
  },
  "warehouse_logo": {
    "pk": "warehouse_code",
    "cols": [
      "warehouse_code",
      "logo"
    ]
  },
  "customer_logo": {
    "pk": "logo",
    "cols": [
      "logo"
    ]
  },
  "app_counter": {
    "pk": "counter_id",
    "cols": [
      "counter_id",
      "current_value",
      "initial_value",
      "final_value",
      "increment",
      "description"
    ]
  },
  "warehouse_queries": {
    "pk": "query_id",
    "cols": [
      "query_id",
      "warehouse_id→warehouses",
      "query",
      "description"
    ]
  },
  "ext_tms_almacenmovimientos_carcam_mt": {
    "pk": "IDMOVIMIENTO",
    "cols": [
      "IDMOVIMIENTO",
      "num_pedido",
      "almacen",
      "sucursal",
      "compania",
      "num_guia",
      "num_viaje",
      "cod_articulo"
    ]
  },
  "ext_tms_almacenmovimientos_mt": {
    "pk": "IDMOVIMIENTO",
    "cols": [
      "IDMOVIMIENTO",
      "num_pedido",
      "almacen",
      "sucursal",
      "compania",
      "cod_articulo",
      "fech_prefacturacion",
      "batch_code"
    ]
  },
  "ext_tms_articulosgestion_mt": {
    "pk": "cod_articulo",
    "cols": [
      "cod_articulo",
      "compania",
      "articulo",
      "batch_code",
      "update_by_etl",
      "job_execution_date",
      "job_execution_status"
    ]
  },
  "ext_tms_clientes_mt": {
    "pk": "codigo_cliente",
    "cols": [
      "codigo_cliente",
      "compania",
      "nom_cliente",
      "dir_fiscal",
      "email",
      "telefono",
      "celular",
      "latitude"
    ]
  },
  "ext_tms_compania_mt": {
    "pk": "compania",
    "cols": [
      "compania",
      "nombre_compania",
      "direccion",
      "email",
      "pais",
      "batch_code",
      "update_by_etl",
      "job_execution_date"
    ]
  },
  "ext_tms_drivers_mt": {
    "pk": "choferid",
    "cols": [
      "choferid",
      "transportation_company_id",
      "driver_card_id",
      "driver_code",
      "chofer",
      "telefono_chofer",
      "batch_code",
      "update_by_etl"
    ]
  },
  "ext_tms_expedicionescabecera_mt": {
    "pk": "num_pedido",
    "cols": [
      "num_pedido",
      "almacen",
      "sucursal",
      "compania",
      "codigo_cliente",
      "num_viaje_wmh",
      "sector",
      "ruta"
    ]
  },
  "ext_tms_expedicionesdetalle_mt": {
    "pk": "num_pedido",
    "cols": [
      "num_pedido",
      "linea",
      "almacen",
      "sucursal",
      "compania",
      "cod_articulo",
      "cantidad_proc",
      "cantidad_ped"
    ]
  },
  "ext_tms_journey_order_transportation_mt": {
    "pk": "num_viaje_wmh",
    "cols": [
      "num_viaje_wmh",
      "choferId",
      "unit_id",
      "num_pedido",
      "almacen",
      "sucursal",
      "compania",
      "situation"
    ]
  },
  "ext_tms_sucursal_mt": {
    "pk": "sucursal",
    "cols": [
      "sucursal",
      "compania",
      "nombre_sucursal",
      "tipo_sucursal",
      "batch_code",
      "update_by_etl",
      "job_execution_date",
      "job_execution_status"
    ]
  },
  "ext_tms_transportation_companies_mt": {
    "pk": "transportation_company_id",
    "cols": [
      "transportation_company_id",
      "comp_transporte",
      "batch_code",
      "update_by_etl",
      "job_execution_date",
      "job_execution_status"
    ]
  },
  "ext_tms_trasportation_units_mt": {
    "pk": "unit_id",
    "cols": [
      "unit_id",
      "transportation_company_id",
      "placa",
      "unit_code",
      "unidad_transporte",
      "tipo_vehiculo",
      "marca_vehiculo",
      "peso"
    ]
  },
  "ext_tms_wms_pedido_factura_mt": {
    "pk": "num_pedido",
    "cols": [
      "num_pedido",
      "almacen",
      "sucursal",
      "compania",
      "num_factura",
      "cod_articulo",
      "fech_facturado",
      "batch_code"
    ]
  },
  "stat_ts_sp_ejecucion_mt": {
    "pk": "nombre_sp",
    "cols": [
      "nombre_sp",
      "fecha_ejecucion",
      "fecha_siguiente"
    ]
  },
  "tms_errors": {
    "pk": "error_id",
    "cols": [
      "error_id",
      "error_number",
      "error_state",
      "error_severity",
      "error_line",
      "user_name",
      "error_procedure",
      "error_message"
    ]
  }
};
