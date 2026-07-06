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

export const EINTEGRA_VE_COLORS = {
  "INTERFACE": "#6366f1",
  "INTERFACE_CONTROL": "#6366f1",
  "INTERFACE_STEP": "#6366f1",
  "INTERFACE_TRACE": "#6366f1",
  "XML_MAPPING": "#6366f1",
  "WMS_TRANSACCION": "#7c3aed",
  "WMS_TRANSACCION_FEBECA": "#7c3aed",
  "WMS_TRANSACCION_SILLACA": "#7c3aed",
  "WMS_RESPUESTA": "#7c3aed",
  "INTERFACE_LOG": "#64748b",
  "TABLE_CONTROL": "#64748b",
  "TEMP_TRACE": "#64748b"
};

export const EINTEGRA_VE_TABLE_DEFS = {
  "INTERFACE": {
    "pk": "INTERFACE_NAME",
    "cols": [
      "INTERFACE_NAME",
      "SOURCE_CONNECTION_ID",
      "SOURCE_SELECT_COMMAND",
      "SOURCE_TABLE_NAME",
      "ERROR_SELECT_COMMAND",
      "INTERFACE_TYPE",
      "XML_COLUMN_NAME"
    ]
  },
  "INTERFACE_CONTROL": {
    "pk": "INTERFACE_NAME",
    "cols": [
      "INTERFACE_NAME",
      "ACTION_TYPE",
      "COLUMN_NAME",
      "COLUMN_TYPE",
      "VALUE"
    ]
  },
  "INTERFACE_STEP": {
    "pk": "CID",
    "cols": [
      "CID",
      "TARGET_CONNECTION_ID",
      "STEP",
      "INTERFACE_NAME",
      "TARGET_TABLE_NAME",
      "SOURCE_TABLE_NAME"
    ]
  },
  "INTERFACE_TRACE": {
    "pk": "ID",
    "cols": [
      "ID",
      "EXECUTION_IDENTIFIER",
      "INTERFACE_NAME",
      "EXECUTION_TIME",
      "AUTOMATIC_EXECUTION",
      "MESSAGE_TYPE",
      "CONTROL_POINT",
      "MESSAGE"
    ]
  },
  "XML_MAPPING": {
    "pk": "INTERFACE_NAME",
    "cols": [
      "INTERFACE_NAME",
      "SOURCE_COLUMN",
      "TARGET_COLUMN",
      "DEFAULT_VALUE",
      "DATA_TYPE",
      "COMMENTS"
    ]
  },
  "WMS_TRANSACCION": {
    "pk": "ID",
    "cols": [
      "ID",
      "INTERFACE_NAME",
      "FECHA",
      "OBJECT_TYPE",
      "TRANSACTION_TYPE",
      "TABLE_NAME",
      "REF1",
      "REF2"
    ]
  },
  "WMS_TRANSACCION_FEBECA": {
    "pk": "ID",
    "cols": [
      "ID",
      "INTERFACE_NAME",
      "FECHA",
      "OBJECT_TYPE",
      "TRANSACTION_TYPE",
      "TABLE_NAME",
      "REF1",
      "REF2"
    ]
  },
  "WMS_TRANSACCION_SILLACA": {
    "pk": "ID",
    "cols": [
      "ID",
      "INTERFACE_NAME",
      "FECHA",
      "OBJECT_TYPE",
      "TRANSACTION_TYPE",
      "TABLE_NAME",
      "REF1",
      "REF2"
    ]
  },
  "WMS_RESPUESTA": {
    "pk": "ID",
    "cols": [
      "ID",
      "FECHA",
      "INTERFACE_NAME",
      "REF1",
      "REF2",
      "XML_DATA1",
      "XML_DATA2",
      "XML_DATA3"
    ]
  },
  "INTERFACE_LOG": {
    "pk": "IDLOG",
    "cols": [
      "IDLOG",
      "CLAVE",
      "STEP",
      "INTERFACE_NAME",
      "ERROR",
      "FECHA"
    ]
  },
  "TABLE_CONTROL": {
    "pk": "IDEXPEDICION",
    "cols": [
      "IDEXPEDICION",
      "FECHAEXACTA"
    ]
  },
  "TEMP_TRACE": {
    "pk": "FECHA",
    "cols": [
      "FECHA",
      "TEXTO"
    ]
  }
};
