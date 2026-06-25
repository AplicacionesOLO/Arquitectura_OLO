// eIntegra VE — Middleware Config ERP↔WMS Venezuela
// Fuente: EINTEGRA_CONFIG @ 10.57.129.254:1446 (QA-VE) — SQL Server 2019
// 12 tablas — puente de orquestación entre Softland ERP y eFlow WMS Venezuela

export const EINTEGRA_VE_MOD = new Set([
  'INTERFACE', 'INTERFACE_CONTROL', 'INTERFACE_LOG',
  'INTERFACE_STEP', 'INTERFACE_TRACE',
  'TABLE_CONTROL', 'TEMP_TRACE',
  'WMS_RESPUESTA', 'WMS_TRANSACCION',
  'WMS_TRANSACCION_FEBECA', 'WMS_TRANSACCION_SILLACA',
  'XML_MAPPING',
]);

export const EINTEGRA_VE_GROUPS = {
  interfaces: {
    label: 'Interfaces & Pasos',
    color: '#6366f1',
    tables: ['INTERFACE','INTERFACE_CONTROL','INTERFACE_STEP','INTERFACE_TRACE','XML_MAPPING'],
  },
  transacciones: {
    label: 'Transacciones WMS',
    color: '#7c3aed',
    tables: ['WMS_TRANSACCION','WMS_TRANSACCION_FEBECA','WMS_TRANSACCION_SILLACA','WMS_RESPUESTA'],
  },
  control: {
    label: 'Control & Trazabilidad',
    color: '#64748b',
    tables: ['INTERFACE_LOG','TABLE_CONTROL','TEMP_TRACE'],
  },
};

export const EINTEGRA_VE_INTEGRATIONS = [
  { from:'INTERFACE_STEP',           to:'INTERFACE',           what:'INTERFACE_STEP → INTERFACE · pasos de ejecución por interfaz',               status:'confirmed' },
  { from:'INTERFACE_LOG',            to:'INTERFACE',           what:'INTERFACE_LOG → INTERFACE · historial de ejecuciones',                       status:'confirmed' },
  { from:'INTERFACE_TRACE',          to:'INTERFACE',           what:'INTERFACE_TRACE → INTERFACE · trazabilidad granular por interfaz',            status:'confirmed' },
  { from:'XML_MAPPING',              to:'INTERFACE',           what:'XML_MAPPING → INTERFACE · mapeo de campos XML por definición de interfaz',    status:'confirmed' },
  { from:'TABLE_CONTROL',            to:'INTERFACE',           what:'TABLE_CONTROL → INTERFACE · control de tablas procesadas por interfaz',       status:'confirmed' },
  { from:'WMS_TRANSACCION',          to:'WMS_RESPUESTA',       what:'WMS_TRANSACCION → WMS_RESPUESTA · respuesta del WMS por transacción enviada', status:'confirmed' },
  { from:'WMS_TRANSACCION_FEBECA',   to:'WMS_TRANSACCION',     what:'WMS_TRANSACCION_FEBECA → WMS_TRANSACCION · cola Febeca hacia eFlow',          status:'confirmed' },
  { from:'WMS_TRANSACCION_SILLACA',  to:'WMS_TRANSACCION',     what:'WMS_TRANSACCION_SILLACA → WMS_TRANSACCION · cola Sillaca hacia eFlow',        status:'confirmed' },
];
