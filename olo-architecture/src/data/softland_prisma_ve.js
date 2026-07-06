// AUTO-GENERADO por gen_softland_ve.js — NO editar a mano.
// Fuente: Softland ERP QA Venezuela · schema "PRISMA" (Prisma) · SOFTLANDQA
// 150 tablas mostradas de 643 totales en el schema (filtradas por conectividad FK, top 150).

export const SFLPRISMA_COLORS = {
  "PAIS": "#475569",
  "ARTICULO": "#f39c12",
  "CLIENTE": "#27ae60",
  "FACTURA": "#16a085",
  "PROVEEDOR": "#8e44ad",
  "IMPUESTO": "#0284c7",
  "BODEGA": "#f39c12",
  "PEDIDO": "#16a085",
  "ACTIVO_FIJO": "#7f8c8d",
  "VENDEDOR": "#16a085",
  "ASIENTO_DE_DIARIO": "#c0392b",
  "CENTRO_CUENTA": "#94a3b8",
  "DOCUMENTOS_CP": "#8e44ad",
  "DOCUMENTOS_CC": "#27ae60",
  "ARTICULO_CUENTA": "#f39c12",
  "CUENTA_CONTABLE": "#c0392b",
  "NIT": "#94a3b8",
  "CATEGORIA_CLIENTE": "#27ae60",
  "TIPO_ACTIVO": "#94a3b8",
  "LOTE": "#f39c12",
  "LOCALIZACION": "#94a3b8",
  "DIVISION_GEOGRAFICA2": "#94a3b8",
  "MONEDA": "#475569",
  "CUENTA_BANCARIA": "#94a3b8",
  "CENTRO_COSTO": "#c0392b",
  "TIPO_ASIENTO": "#94a3b8",
  "DOCUMENTO_EMBARQUE": "#94a3b8",
  "CATEGORIA_PROVEED": "#8e44ad",
  "PAQUETE": "#94a3b8",
  "RETENCIONES": "#0284c7",
  "ACTIVO_MEJORA": "#7f8c8d",
  "CLASIFICACION": "#94a3b8",
  "TIPO_PAGO": "#94a3b8",
  "TIPOS_DETRACCIONES": "#94a3b8",
  "ORDEN_COMPRA_LINEA": "#d35400",
  "CONDICION_PAGO": "#94a3b8",
  "MOV_BANCOS": "#2980b9",
  "SERIE_CADENA": "#94a3b8",
  "DOCS_SOPORTE": "#94a3b8",
  "FACTURA_LINEA": "#16a085",
  "EMBARQUE_LINEA": "#16a085",
  "SUBTIPO_DOC_CC": "#27ae60",
  "SUBTIPO_DOC_CP": "#8e44ad",
  "UNIDAD_DE_MEDIDA": "#94a3b8",
  "GLOBALES_FA": "#16a085",
  "NIVEL_PRECIO": "#94a3b8",
  "TIPO_IMPUESTO": "#94a3b8",
  "TIPO_DESCUENTO": "#94a3b8",
  "VERSION_NIVEL": "#94a3b8",
  "CAJA_CHICA": "#2980b9",
  "GLOBALES_AF": "#7f8c8d",
  "ORDEN_COMPRA": "#d35400",
  "METODO_PAGO": "#94a3b8",
  "SUBTIPO_DOC_CB": "#2980b9",
  "TIPO_INDICE_PRECIO": "#94a3b8",
  "GLOBALES_CG": "#c0392b",
  "EMBARQUE": "#16a085",
  "EXISTENCIA_BODEGA": "#f39c12",
  "TRANSACCION_INV": "#94a3b8",
  "DEVOLUCION": "#16a085",
  "LINEA_DOC_INV": "#94a3b8",
  "CARTA_PORTE_MERCANCIA": "#94a3b8",
  "CONCILIACION": "#2980b9",
  "TIPO_CAMBIO": "#94a3b8",
  "ALARMA": "#94a3b8",
  "DIFERIDO": "#94a3b8",
  "AJUSTE_CONFIG": "#94a3b8",
  "ARTICULO_PRECIO": "#f39c12",
  "RESPONSABLE": "#94a3b8",
  "LIQUIDAC_COMPRA": "#8e44ad",
  "DET_DOCUMENTO_EMBARQUE": "#94a3b8",
  "DETALLE_RETENCION": "#94a3b8",
  "DIVISION_GEOGRAFICA3": "#94a3b8",
  "GLOBALES_CH": "#94a3b8",
  "ITEMS_HACIENDA": "#94a3b8",
  "MOV_REPORTADOS": "#94a3b8",
  "COMPLEMENTO_SUNAT": "#94a3b8",
  "CONSECUTIVO_CI": "#f39c12",
  "DETALLE_DIRECCION": "#94a3b8",
  "ENTIDAD_FINANCIERA": "#94a3b8",
  "FORMATO_TRANSFER": "#94a3b8",
  "GLOBALES_CO": "#d35400",
  "PEDIDO_LINEA": "#16a085",
  "PEDIDO_SUGERIDO": "#16a085",
  "SUBSECCION_REPORTES": "#94a3b8",
  "AUXILIAR_CC": "#27ae60",
  "AUXILIAR_CP": "#8e44ad",
  "CARTA_PORTE_DOMICILIO": "#94a3b8",
  "CHEQUE": "#2980b9",
  "COBRADOR": "#94a3b8",
  "CONCEPTO_VALE": "#94a3b8",
  "CONSECUTIVO_FA": "#16a085",
  "CUENTA_DEPRECIACIO": "#94a3b8",
  "DEPARTAMENTO": "#94a3b8",
  "GLOBALES_CC": "#27ae60",
  "IMPUESTO_COMPRA": "#0284c7",
  "MODELO_RETENCION": "#94a3b8",
  "SOLICITUD_OC": "#94a3b8",
  "SOLICITUD_OC_LINEA": "#94a3b8",
  "TRANSFERENCIA_CB": "#2980b9",
  "VALE": "#94a3b8",
  "ALARMA_BASE_COLUMNA": "#94a3b8",
  "ALARMA_PLANTILLA": "#94a3b8",
  "ASIENTO_DISTRIBUID": "#c0392b",
  "AUDIT_TRANS_INV": "#94a3b8",
  "BOLETA_INV_FISICO": "#94a3b8",
  "CARTA_PORTE_UBICACION": "#94a3b8",
  "HIST_DEPRECIACION": "#7f8c8d",
  "RECEPCION_DETRAC": "#94a3b8",
  "TIPO_TARIFA_IVA": "#94a3b8",
  "CLASIF_BIENES_SERV_ADQ": "#94a3b8",
  "CODIGOS_MODIFICACION": "#94a3b8",
  "CONSECUTIVO": "#94a3b8",
  "DES_BON_REGLA": "#94a3b8",
  "DEVOL_LIN_EMBARQUE": "#94a3b8",
  "DOCUMENTO_INV": "#94a3b8",
  "EXISTENCIA_RESERVA": "#f39c12",
  "SECCION_REPORTES": "#94a3b8",
  "SOLICITUD_AF_NOTIF": "#94a3b8",
  "TIPO_TRIBUTO": "#94a3b8",
  "CAJA": "#2980b9",
  "CARTA_PORTE_OPERADOR": "#94a3b8",
  "CP_DET_RETENCION_PAR": "#94a3b8",
  "DESPACHO_DETALLE": "#94a3b8",
  "EXCEP_CIUDAD": "#94a3b8",
  "EXCEPCION_ARANCEL_PAIS": "#94a3b8",
  "PISTA_EXISTEN_DET": "#94a3b8",
  "ACTIVO_ACCION": "#7f8c8d",
  "ALARMA_BASE": "#94a3b8",
  "ARTICULO_COMPRA": "#f39c12",
  "ASIENTO_MAYORIZADO": "#c0392b",
  "ASIENTO_RECURRENTE": "#c0392b",
  "ATRIBUTO": "#94a3b8",
  "CARTA_PORTE_CVE_TRANSPORTE": "#94a3b8",
  "CARTA_PORTE_ESTACIONES": "#94a3b8",
  "CARTA_PORTE_TIPO_PERMISO": "#94a3b8",
  "CATALOGO_EXISTENCIA": "#94a3b8",
  "CODIGO_ARANCEL": "#94a3b8",
  "CONTRARECIBOS": "#94a3b8",
  "DES_BON_PAQUETE": "#94a3b8",
  "DESPACHO": "#94a3b8",
  "DET_TRANS_CB": "#2980b9",
  "ESTADO_ACTIVO": "#94a3b8",
  "EXISTENCIA_LOTE": "#f39c12",
  "EXISTENCIA_SERIE": "#f39c12",
  "FACTURA_CANCELA": "#16a085",
  "FORMA_PAGO_COMPRA": "#94a3b8",
  "LIQUIDAC_GASTO": "#94a3b8",
  "MODALIDAD_SERVICIO": "#94a3b8",
  "NATURALEZA_OPERACION": "#94a3b8"
};

export const SFLPRISMA_MOD = new Set(["PAIS","ARTICULO","CLIENTE","FACTURA","PROVEEDOR","IMPUESTO","BODEGA","PEDIDO","ACTIVO_FIJO","VENDEDOR","ASIENTO_DE_DIARIO","CENTRO_CUENTA","DOCUMENTOS_CP","DOCUMENTOS_CC","ARTICULO_CUENTA","CUENTA_CONTABLE","NIT","CATEGORIA_CLIENTE","TIPO_ACTIVO","LOTE","LOCALIZACION","DIVISION_GEOGRAFICA2","MONEDA","CUENTA_BANCARIA","CENTRO_COSTO","TIPO_ASIENTO","DOCUMENTO_EMBARQUE","CATEGORIA_PROVEED","PAQUETE","RETENCIONES","ACTIVO_MEJORA","CLASIFICACION","TIPO_PAGO","TIPOS_DETRACCIONES","ORDEN_COMPRA_LINEA","CONDICION_PAGO","MOV_BANCOS","SERIE_CADENA","DOCS_SOPORTE","FACTURA_LINEA","EMBARQUE_LINEA","SUBTIPO_DOC_CC","SUBTIPO_DOC_CP","UNIDAD_DE_MEDIDA","GLOBALES_FA","NIVEL_PRECIO","TIPO_IMPUESTO","TIPO_DESCUENTO","VERSION_NIVEL","CAJA_CHICA","GLOBALES_AF","ORDEN_COMPRA","METODO_PAGO","SUBTIPO_DOC_CB","TIPO_INDICE_PRECIO","GLOBALES_CG","EMBARQUE","EXISTENCIA_BODEGA","TRANSACCION_INV","DEVOLUCION","LINEA_DOC_INV","CARTA_PORTE_MERCANCIA","CONCILIACION","TIPO_CAMBIO","ALARMA","DIFERIDO","AJUSTE_CONFIG","ARTICULO_PRECIO","RESPONSABLE","LIQUIDAC_COMPRA","DET_DOCUMENTO_EMBARQUE","DETALLE_RETENCION","DIVISION_GEOGRAFICA3","GLOBALES_CH","ITEMS_HACIENDA","MOV_REPORTADOS","COMPLEMENTO_SUNAT","CONSECUTIVO_CI","DETALLE_DIRECCION","ENTIDAD_FINANCIERA","FORMATO_TRANSFER","GLOBALES_CO","PEDIDO_LINEA","PEDIDO_SUGERIDO","SUBSECCION_REPORTES","AUXILIAR_CC","AUXILIAR_CP","CARTA_PORTE_DOMICILIO","CHEQUE","COBRADOR","CONCEPTO_VALE","CONSECUTIVO_FA","CUENTA_DEPRECIACIO","DEPARTAMENTO","GLOBALES_CC","IMPUESTO_COMPRA","MODELO_RETENCION","SOLICITUD_OC","SOLICITUD_OC_LINEA","TRANSFERENCIA_CB","VALE","ALARMA_BASE_COLUMNA","ALARMA_PLANTILLA","ASIENTO_DISTRIBUID","AUDIT_TRANS_INV","BOLETA_INV_FISICO","CARTA_PORTE_UBICACION","HIST_DEPRECIACION","RECEPCION_DETRAC","TIPO_TARIFA_IVA","CLASIF_BIENES_SERV_ADQ","CODIGOS_MODIFICACION","CONSECUTIVO","DES_BON_REGLA","DEVOL_LIN_EMBARQUE","DOCUMENTO_INV","EXISTENCIA_RESERVA","SECCION_REPORTES","SOLICITUD_AF_NOTIF","TIPO_TRIBUTO","CAJA","CARTA_PORTE_OPERADOR","CP_DET_RETENCION_PAR","DESPACHO_DETALLE","EXCEP_CIUDAD","EXCEPCION_ARANCEL_PAIS","PISTA_EXISTEN_DET","ACTIVO_ACCION","ALARMA_BASE","ARTICULO_COMPRA","ASIENTO_MAYORIZADO","ASIENTO_RECURRENTE","ATRIBUTO","CARTA_PORTE_CVE_TRANSPORTE","CARTA_PORTE_ESTACIONES","CARTA_PORTE_TIPO_PERMISO","CATALOGO_EXISTENCIA","CODIGO_ARANCEL","CONTRARECIBOS","DES_BON_PAQUETE","DESPACHO","DET_TRANS_CB","ESTADO_ACTIVO","EXISTENCIA_LOTE","EXISTENCIA_SERIE","FACTURA_CANCELA","FORMA_PAGO_COMPRA","LIQUIDAC_GASTO","MODALIDAD_SERVICIO","NATURALEZA_OPERACION"]);

export const SFLPRISMA_GROUPS = {
  "as": {
    "label": "AS · Administración del Sistema",
    "color": "#475569",
    "tables": [
      "MONEDA",
      "PAIS"
    ]
  },
  "ci": {
    "label": "CI · Control de Inventario",
    "color": "#f39c12",
    "tables": [
      "ARTICULO",
      "ARTICULO_COMPRA",
      "ARTICULO_CUENTA",
      "ARTICULO_PRECIO",
      "BODEGA",
      "CONSECUTIVO_CI",
      "EXISTENCIA_BODEGA",
      "EXISTENCIA_LOTE",
      "EXISTENCIA_RESERVA",
      "EXISTENCIA_SERIE",
      "LOTE"
    ]
  },
  "cc": {
    "label": "CC · Cuentas por Cobrar",
    "color": "#27ae60",
    "tables": [
      "AUXILIAR_CC",
      "CATEGORIA_CLIENTE",
      "CLIENTE",
      "DOCUMENTOS_CC",
      "GLOBALES_CC",
      "SUBTIPO_DOC_CC"
    ]
  },
  "fa": {
    "label": "FA · Facturación",
    "color": "#16a085",
    "tables": [
      "CONSECUTIVO_FA",
      "DEVOLUCION",
      "EMBARQUE",
      "EMBARQUE_LINEA",
      "FACTURA",
      "FACTURA_CANCELA",
      "FACTURA_LINEA",
      "GLOBALES_FA",
      "PEDIDO",
      "PEDIDO_LINEA",
      "PEDIDO_SUGERIDO",
      "VENDEDOR"
    ]
  },
  "cp": {
    "label": "CP · Cuentas por Pagar",
    "color": "#8e44ad",
    "tables": [
      "AUXILIAR_CP",
      "CATEGORIA_PROVEED",
      "DOCUMENTOS_CP",
      "LIQUIDAC_COMPRA",
      "PROVEEDOR",
      "SUBTIPO_DOC_CP"
    ]
  },
  "mf": {
    "label": "MF · Monitor Fiscal",
    "color": "#0284c7",
    "tables": [
      "IMPUESTO",
      "IMPUESTO_COMPRA",
      "RETENCIONES"
    ]
  },
  "af": {
    "label": "AF · Activos Fijos",
    "color": "#7f8c8d",
    "tables": [
      "ACTIVO_ACCION",
      "ACTIVO_FIJO",
      "ACTIVO_MEJORA",
      "GLOBALES_AF",
      "HIST_DEPRECIACION"
    ]
  },
  "cg": {
    "label": "CG · Contabilidad General",
    "color": "#c0392b",
    "tables": [
      "ASIENTO_DE_DIARIO",
      "ASIENTO_DISTRIBUID",
      "ASIENTO_MAYORIZADO",
      "ASIENTO_RECURRENTE",
      "CENTRO_COSTO",
      "CUENTA_CONTABLE",
      "GLOBALES_CG"
    ]
  },
  "otros": {
    "label": "Otros / sin clasificar",
    "color": "#94a3b8",
    "tables": [
      "AJUSTE_CONFIG",
      "ALARMA",
      "ALARMA_BASE",
      "ALARMA_BASE_COLUMNA",
      "ALARMA_PLANTILLA",
      "ATRIBUTO",
      "AUDIT_TRANS_INV",
      "BOLETA_INV_FISICO",
      "CARTA_PORTE_CVE_TRANSPORTE",
      "CARTA_PORTE_DOMICILIO",
      "CARTA_PORTE_ESTACIONES",
      "CARTA_PORTE_MERCANCIA",
      "CARTA_PORTE_OPERADOR",
      "CARTA_PORTE_TIPO_PERMISO",
      "CARTA_PORTE_UBICACION",
      "CATALOGO_EXISTENCIA",
      "CENTRO_CUENTA",
      "CLASIFICACION",
      "CLASIF_BIENES_SERV_ADQ",
      "COBRADOR",
      "CODIGOS_MODIFICACION",
      "CODIGO_ARANCEL",
      "COMPLEMENTO_SUNAT",
      "CONCEPTO_VALE",
      "CONDICION_PAGO",
      "CONSECUTIVO",
      "CONTRARECIBOS",
      "CP_DET_RETENCION_PAR",
      "CUENTA_BANCARIA",
      "CUENTA_DEPRECIACIO",
      "DEPARTAMENTO",
      "DESPACHO",
      "DESPACHO_DETALLE",
      "DES_BON_PAQUETE",
      "DES_BON_REGLA",
      "DETALLE_DIRECCION",
      "DETALLE_RETENCION",
      "DET_DOCUMENTO_EMBARQUE",
      "DEVOL_LIN_EMBARQUE",
      "DIFERIDO",
      "DIVISION_GEOGRAFICA2",
      "DIVISION_GEOGRAFICA3",
      "DOCS_SOPORTE",
      "DOCUMENTO_EMBARQUE",
      "DOCUMENTO_INV",
      "ENTIDAD_FINANCIERA",
      "ESTADO_ACTIVO",
      "EXCEPCION_ARANCEL_PAIS",
      "EXCEP_CIUDAD",
      "FORMATO_TRANSFER",
      "FORMA_PAGO_COMPRA",
      "GLOBALES_CH",
      "ITEMS_HACIENDA",
      "LINEA_DOC_INV",
      "LIQUIDAC_GASTO",
      "LOCALIZACION",
      "METODO_PAGO",
      "MODALIDAD_SERVICIO",
      "MODELO_RETENCION",
      "MOV_REPORTADOS",
      "NATURALEZA_OPERACION",
      "NIT",
      "NIVEL_PRECIO",
      "PAQUETE",
      "PISTA_EXISTEN_DET",
      "RECEPCION_DETRAC",
      "RESPONSABLE",
      "SECCION_REPORTES",
      "SERIE_CADENA",
      "SOLICITUD_AF_NOTIF",
      "SOLICITUD_OC",
      "SOLICITUD_OC_LINEA",
      "SUBSECCION_REPORTES",
      "TIPOS_DETRACCIONES",
      "TIPO_ACTIVO",
      "TIPO_ASIENTO",
      "TIPO_CAMBIO",
      "TIPO_DESCUENTO",
      "TIPO_IMPUESTO",
      "TIPO_INDICE_PRECIO",
      "TIPO_PAGO",
      "TIPO_TARIFA_IVA",
      "TIPO_TRIBUTO",
      "TRANSACCION_INV",
      "UNIDAD_DE_MEDIDA",
      "VALE",
      "VERSION_NIVEL"
    ]
  },
  "co": {
    "label": "CO · Compras",
    "color": "#d35400",
    "tables": [
      "GLOBALES_CO",
      "ORDEN_COMPRA",
      "ORDEN_COMPRA_LINEA"
    ]
  },
  "cb": {
    "label": "CB · Control Bancario",
    "color": "#2980b9",
    "tables": [
      "CAJA",
      "CAJA_CHICA",
      "CHEQUE",
      "CONCILIACION",
      "DET_TRANS_CB",
      "MOV_BANCOS",
      "SUBTIPO_DOC_CB",
      "TRANSFERENCIA_CB"
    ]
  }
};

export const SFLPRISMA_TABLE_DEFS = {
  "PAIS": {
    "pk": "PAIS",
    "cols": [
      "PAIS",
      "DIRECCION",
      "CTR_VENTAS→CENTRO_CUENTA",
      "CTA_VENTAS→CENTRO_CUENTA",
      "CTR_DESC_GRAL→CENTRO_CUENTA",
      "CTA_DESC_GRAL→CENTRO_CUENTA",
      "CTR_COST_VENT→CENTRO_CUENTA",
      "CTA_COST_VENT→CENTRO_CUENTA"
    ]
  },
  "ARTICULO": {
    "pk": "ARTICULO",
    "cols": [
      "ARTICULO",
      "ARTICULO_CUENTA→ARTICULO_CUENTA",
      "IMPUESTO→IMPUESTO",
      "UNIDAD_ALMACEN→UNIDAD_DE_MEDIDA",
      "UNIDAD_EMPAQUE→UNIDAD_DE_MEDIDA",
      "UNIDAD_VENTA→UNIDAD_DE_MEDIDA",
      "CODIGO_RETENCION→RETENCIONES",
      "CODIGO_DETRACCION_VENTA→TIPOS_DETRACCIONES"
    ]
  },
  "CLIENTE": {
    "pk": "CLIENTE",
    "cols": [
      "CLIENTE",
      "CONTRIBUYENTE→NIT",
      "MONEDA→MONEDA",
      "CONDICION_PAGO→CONDICION_PAGO",
      "NIVEL_PRECIO→NIVEL_PRECIO",
      "MONEDA_NIVEL→NIVEL_PRECIO",
      "PAIS→PAIS",
      "ZONA"
    ]
  },
  "FACTURA": {
    "pk": "TIPO_DOCUMENTO",
    "cols": [
      "TIPO_DOCUMENTO",
      "MONEDA→NIVEL_PRECIO",
      "NIVEL_PRECIO→NIVEL_PRECIO",
      "COBRADOR→COBRADOR",
      "RUTA",
      "USUARIO",
      "CONDICION_PAGO→CONDICION_PAGO",
      "ZONA"
    ]
  },
  "PROVEEDOR": {
    "pk": "PROVEEDOR",
    "cols": [
      "PROVEEDOR",
      "CONTRIBUYENTE→NIT",
      "CONDICION_PAGO→CONDICION_PAGO",
      "MONEDA→MONEDA",
      "PAIS→PAIS",
      "CATEGORIA_PROVEED→CATEGORIA_PROVEED",
      "CODIGO_IMPUESTO→IMPUESTO",
      "DETALLE_DIRECCION→DETALLE_DIRECCION"
    ]
  },
  "IMPUESTO": {
    "pk": "IMPUESTO",
    "cols": [
      "IMPUESTO",
      "CTR_IMP1_GEN→CENTRO_CUENTA",
      "CTA_IMP1_GEN→CENTRO_CUENTA",
      "CTR_IMP2_GEN→CENTRO_CUENTA",
      "CTA_IMP2_GEN→CENTRO_CUENTA",
      "CTR_IMP1_GEN_VTS→CENTRO_CUENTA",
      "CTA_IMP1_GEN_VTS→CENTRO_CUENTA",
      "CTR_IMP2_GEN_VTS→CENTRO_CUENTA"
    ]
  },
  "BODEGA": {
    "pk": "BODEGA",
    "cols": [
      "BODEGA",
      "CONSEC_TRASLADOS→CONSECUTIVO_CI",
      "TIPO_ESTABLECIMIENTO",
      "PAIS→PAIS",
      "ACTIVIDAD_ECONOMICA",
      "NOMBRE",
      "TIPO",
      "TELEFONO"
    ]
  },
  "PEDIDO": {
    "pk": "PEDIDO",
    "cols": [
      "PEDIDO",
      "MONEDA→NIVEL_PRECIO",
      "NIVEL_PRECIO→NIVEL_PRECIO",
      "COBRADOR→COBRADOR",
      "RUTA",
      "USUARIO",
      "CONDICION_PAGO→CONDICION_PAGO",
      "BODEGA→BODEGA"
    ]
  },
  "ACTIVO_FIJO": {
    "pk": "ACTIVO_FIJO",
    "cols": [
      "ACTIVO_FIJO",
      "TIPO_ACTIVO→TIPO_ACTIVO",
      "ESTADO_ACTIVO→ESTADO_ACTIVO",
      "UBICACION",
      "DESCRIPCION",
      "USA_COMPONENTE",
      "ARRE_FINANCIERO",
      "NoteExistsFlag"
    ]
  },
  "VENDEDOR": {
    "pk": "VENDEDOR",
    "cols": [
      "VENDEDOR",
      "CTR_COMISION→CENTRO_CUENTA",
      "CTA_COMISION→CENTRO_CUENTA",
      "NOMBRE",
      "EMPLEADO",
      "COMISION",
      "ACTIVO",
      "NoteExistsFlag"
    ]
  },
  "ASIENTO_DE_DIARIO": {
    "pk": "ASIENTO",
    "cols": [
      "ASIENTO",
      "PAQUETE→PAQUETE",
      "TIPO_ASIENTO→TIPO_ASIENTO",
      "ULTIMO_USUARIO",
      "USUARIO_CREACION",
      "FECHA",
      "CONTABILIDAD",
      "ORIGEN"
    ]
  },
  "CENTRO_CUENTA": {
    "pk": "CENTRO_COSTO",
    "cols": [
      "CENTRO_COSTO→CENTRO_COSTO",
      "CUENTA_CONTABLE→CUENTA_CONTABLE",
      "CENTRO_POZO→CENTRO_CUENTA",
      "CUENTA_POZO→CENTRO_CUENTA",
      "CENTRO_GASTO→CENTRO_CUENTA",
      "CUENTA_GASTO→CENTRO_CUENTA",
      "ESTADO",
      "NoteExistsFlag"
    ]
  },
  "DOCUMENTOS_CP": {
    "pk": "PROVEEDOR",
    "cols": [
      "PROVEEDOR→PROVEEDOR",
      "TIPO→SUBTIPO_DOC_CP",
      "USUARIO_ULT_MOD",
      "CONDICION_PAGO→CONDICION_PAGO",
      "MONEDA→MONEDA",
      "CODIGO_IMPUESTO→IMPUESTO",
      "FACTURA_VALE_CH→DOCS_SOPORTE",
      "FACTURA_LINEA_CH→DOCS_SOPORTE"
    ]
  },
  "DOCUMENTOS_CC": {
    "pk": "DOCUMENTO",
    "cols": [
      "DOCUMENTO",
      "TIPO→SUBTIPO_DOC_CC",
      "USUARIO_ULT_MOD",
      "CONDICION_PAGO→CONDICION_PAGO",
      "MONEDA→MONEDA",
      "CLIENTE_REPORTE→CLIENTE",
      "CLIENTE_ORIGEN→CLIENTE",
      "CLIENTE→CLIENTE"
    ]
  },
  "ARTICULO_CUENTA": {
    "pk": "ARTICULO_CUENTA",
    "cols": [
      "ARTICULO_CUENTA",
      "CTR_INVENTARIO→CENTRO_CUENTA",
      "CTA_INVENTARIO→CENTRO_CUENTA",
      "CTR_VENTAS_LOC→CENTRO_CUENTA",
      "CTA_VENTAS_LOC→CENTRO_CUENTA",
      "CTR_VENTAS_EXP→CENTRO_CUENTA",
      "CTA_VENTAS_EXP→CENTRO_CUENTA",
      "CTR_COMPRA_LOC→CENTRO_CUENTA"
    ]
  },
  "CUENTA_CONTABLE": {
    "pk": "CUENTA_CONTABLE",
    "cols": [
      "CUENTA_CONTABLE",
      "TIPO_CAMBIO→TIPO_CAMBIO",
      "USUARIO",
      "USUARIO_ULT_MOD",
      "SECCION_CUENTA",
      "UNIDAD",
      "DESCRIPCION",
      "TIPO"
    ]
  },
  "NIT": {
    "pk": "NIT",
    "cols": [
      "NIT",
      "TIPO",
      "PAIS→PAIS",
      "ACTIVIDAD_COMERCIAL",
      "TIPO_PERSONA",
      "RAZON_SOCIAL",
      "ORIGEN",
      "ACTIVO"
    ]
  },
  "CATEGORIA_CLIENTE": {
    "pk": "CATEGORIA_CLIENTE",
    "cols": [
      "CATEGORIA_CLIENTE",
      "CTR_VENTAS→CENTRO_CUENTA",
      "CTA_VENTAS→CENTRO_CUENTA",
      "CTR_DESC_GRAL→CENTRO_CUENTA",
      "CTA_DESC_GRAL→CENTRO_CUENTA",
      "CTR_COST_VENT→CENTRO_CUENTA",
      "CTA_COST_VENT→CENTRO_CUENTA",
      "CTR_DESC_LIN→CENTRO_CUENTA"
    ]
  },
  "TIPO_ACTIVO": {
    "pk": "TIPO_ACTIVO",
    "cols": [
      "TIPO_ACTIVO",
      "CTA_REVAL_DA→CENTRO_CUENTA",
      "CTR_ACTIVO→CENTRO_CUENTA",
      "CTA_ACTIVO→CENTRO_CUENTA",
      "CTR_DEPR_ACUM_NORM→CENTRO_CUENTA",
      "CTA_DEPR_ACUM_NORM→CENTRO_CUENTA",
      "CTR_REVALUACION→CENTRO_CUENTA",
      "CTA_REVALUACION→CENTRO_CUENTA"
    ]
  },
  "LOTE": {
    "pk": "ARTICULO",
    "cols": [
      "ARTICULO→ARTICULO",
      "PROVEEDOR→PROVEEDOR",
      "ULTIMO_INGRESO",
      "LOTE",
      "FECHA_ENTRADA",
      "FECHA_VENCIMIENTO",
      "FECHA_CUARENTENA",
      "CANTIDAD_INGRESADA"
    ]
  },
  "LOCALIZACION": {
    "pk": "BODEGA",
    "cols": [
      "BODEGA→BODEGA",
      "LOCALIZACION",
      "DESCRIPCION",
      "VOLUMEN",
      "PESO_MAXIMO",
      "NoteExistsFlag",
      "RecordDate",
      "RowPointer"
    ]
  },
  "DIVISION_GEOGRAFICA2": {
    "pk": "PAIS",
    "cols": [
      "PAIS",
      "DIVISION_GEOGRAFICA1",
      "DIVISION_GEOGRAFICA2",
      "NOMBRE",
      "NoteExistsFlag",
      "RecordDate",
      "RowPointer",
      "CreatedBy"
    ]
  },
  "MONEDA": {
    "pk": "MONEDA",
    "cols": [
      "MONEDA",
      "NOMBRE",
      "NoteExistsFlag",
      "RecordDate",
      "RowPointer",
      "CreatedBy",
      "UpdatedBy",
      "CreateDate"
    ]
  },
  "CUENTA_BANCARIA": {
    "pk": "CUENTA_BANCO",
    "cols": [
      "CUENTA_BANCO",
      "ENTIDAD_FINANCIERA→ENTIDAD_FINANCIERA",
      "MONEDA→MONEDA",
      "USUARIO_CREACION",
      "CTR_CONTABLE→CENTRO_CUENTA",
      "CTA_CONTABLE→CENTRO_CUENTA",
      "CTR_CIERRE_DEB→CENTRO_CUENTA",
      "CTA_CIERRE_DEB→CENTRO_CUENTA"
    ]
  },
  "CENTRO_COSTO": {
    "pk": "CENTRO_COSTO",
    "cols": [
      "CENTRO_COSTO",
      "DESCRIPCION",
      "ACEPTA_DATOS",
      "TIPO",
      "NoteExistsFlag",
      "RecordDate",
      "RowPointer",
      "CreatedBy"
    ]
  },
  "TIPO_ASIENTO": {
    "pk": "TIPO_ASIENTO",
    "cols": [
      "TIPO_ASIENTO",
      "DESCRIPCION",
      "NoteExistsFlag",
      "RecordDate",
      "RowPointer",
      "CreatedBy",
      "UpdatedBy",
      "CreateDate"
    ]
  },
  "DOCUMENTO_EMBARQUE": {
    "pk": "PROVEEDOR",
    "cols": [
      "PROVEEDOR→PROVEEDOR",
      "CONDICION_PAGO→CONDICION_PAGO",
      "MONEDA→MONEDA",
      "PAIS→DIVISION_GEOGRAFICA2",
      "DIVISION_GEOGRAFICA1→DIVISION_GEOGRAFICA2",
      "DIVISION_GEOGRAFICA2→DIVISION_GEOGRAFICA2",
      "TIPO_PAGO→TIPO_PAGO",
      "TIPO_DETRAC→TIPOS_DETRACCIONES"
    ]
  },
  "CATEGORIA_PROVEED": {
    "pk": "CATEGORIA_PROVEED",
    "cols": [
      "CATEGORIA_PROVEED",
      "CTR_CXP→CENTRO_CUENTA",
      "CTA_CXP→CENTRO_CUENTA",
      "CTR_LXP→CENTRO_CUENTA",
      "CTA_LXP→CENTRO_CUENTA",
      "CTR_CREDITO_CXP→CENTRO_CUENTA",
      "CTA_CREDITO_CXP→CENTRO_CUENTA",
      "CTR_DEBITO_CXP→CENTRO_CUENTA"
    ]
  },
  "PAQUETE": {
    "pk": "PAQUETE",
    "cols": [
      "PAQUETE",
      "DESCRIPCION",
      "USUARIO_CREADOR",
      "ULTIMO_USUARIO",
      "FECHA_ULT_ACCESO",
      "ULTIMO_ASIENTO",
      "DOBLE_ASIENTO",
      "MARCADO"
    ]
  },
  "RETENCIONES": {
    "pk": "CODIGO_RETENCION",
    "cols": [
      "CODIGO_RETENCION",
      "CODIGO_INGRESO",
      "CTR_RETENCION→CENTRO_CUENTA",
      "CTA_RETENCION→CENTRO_CUENTA",
      "CLASIFICACION_ART→CLASIFICACION",
      "CTR_AUTORETENCION→CENTRO_CUENTA",
      "CTA_AUTORETENCION→CENTRO_CUENTA",
      "RETENCION_BASE→RETENCIONES"
    ]
  },
  "ACTIVO_MEJORA": {
    "pk": "ACTIVO_FIJO",
    "cols": [
      "ACTIVO_FIJO→ACTIVO_FIJO",
      "USUARIO_ULT_MOD",
      "COD_CAT_UTILIZADO_1→CATALOGO_EXISTENCIA",
      "COD_CAT_UTILIZADO_2→CATALOGO_EXISTENCIA",
      "COD_TIPO_ACTIVO",
      "RESPONSABLE→RESPONSABLE",
      "TIPO_INDICE_PRECIO→TIPO_INDICE_PRECIO",
      "USUARIO_RETIRO"
    ]
  },
  "CLASIFICACION": {
    "pk": "CLASIFICACION",
    "cols": [
      "CLASIFICACION",
      "UNIDAD_MEDIDA→UNIDAD_DE_MEDIDA",
      "PLANTILLA_SERIE",
      "DESCRIPCION",
      "AGRUPACION",
      "USA_NUMEROS_SERIE",
      "NoteExistsFlag",
      "RecordDate"
    ]
  },
  "TIPO_PAGO": {
    "pk": "TIPO_PAGO",
    "cols": [
      "TIPO_PAGO",
      "NoteExistsFlag",
      "RecordDate",
      "RowPointer",
      "CreatedBy",
      "UpdatedBy",
      "CreateDate",
      "DESCRIPCION"
    ]
  },
  "TIPOS_DETRACCIONES": {
    "pk": "TIPO_DETRACCION",
    "cols": [
      "TIPO_DETRACCION",
      "COD_DETRACCION",
      "DESC_TIPO_DETRACCION",
      "DESC_ACTIVIDAD",
      "PORC_DETRACCION",
      "MIN_DETRACCION",
      "NoteExistsFlag",
      "RecordDate"
    ]
  },
  "ORDEN_COMPRA_LINEA": {
    "pk": "ORDEN_COMPRA",
    "cols": [
      "ORDEN_COMPRA→ORDEN_COMPRA_LINEA",
      "ORDEN_COMPRA_LINEA→ORDEN_COMPRA_LINEA",
      "ARTICULO→LOTE",
      "BODEGA→LOCALIZACION",
      "UNIDAD_DISTRIBUCIO→UNIDAD_DE_MEDIDA",
      "USUARIO_CANCELA",
      "USUARIO_CIERRE",
      "CENTRO_COSTO→CENTRO_CUENTA"
    ]
  },
  "CONDICION_PAGO": {
    "pk": "CONDICION_PAGO",
    "cols": [
      "CONDICION_PAGO",
      "PLAZO_ES",
      "CONDICION_OPERAC_ES",
      "DIAS_NETO",
      "DESCRIPCION",
      "PAGOS_PARCIALES",
      "DESCUENTO_CONTADO",
      "TIPO_CONDPAGO"
    ]
  },
  "MOV_BANCOS": {
    "pk": "CUENTA_BANCO",
    "cols": [
      "CUENTA_BANCO→CUENTA_BANCARIA",
      "TIPO_DOCUMENTO→SUBTIPO_DOC_CB",
      "USUARIO_CREACION",
      "COD_IMPUESTO1→IMPUESTO",
      "CONCIL_ACLARACION→CONCILIACION",
      "CONCILIACION→CONCILIACION",
      "DOC_REPORTADO→MOV_REPORTADOS",
      "DOC_AJUSTE→MOV_REPORTADOS"
    ]
  },
  "SERIE_CADENA": {
    "pk": "SERIE_CADENA",
    "cols": [
      "SERIE_CADENA",
      "USUARIO",
      "MODULO_ORIGEN",
      "FECHA_HORA",
      "NoteExistsFlag",
      "RecordDate",
      "RowPointer",
      "CreatedBy"
    ]
  },
  "DOCS_SOPORTE": {
    "pk": "VALE",
    "cols": [
      "VALE→VALE",
      "CONCEPTO→CONCEPTO_VALE",
      "CODIGO_IMPUESTO→IMPUESTO",
      "CENTRO_COSTO→CENTRO_CUENTA",
      "CUENTA_CONTABLE→CENTRO_CUENTA",
      "NIT→NIT",
      "PAIS→DIVISION_GEOGRAFICA2",
      "DIVISION_GEOGRAFICA1→DIVISION_GEOGRAFICA2"
    ]
  },
  "FACTURA_LINEA": {
    "pk": "FACTURA",
    "cols": [
      "FACTURA→FACTURA",
      "TIPO_DOCUMENTO→FACTURA",
      "BODEGA→LOCALIZACION",
      "ARTICULO→LOTE",
      "CODIGO_IMPUESTO→IMPUESTO",
      "SERIE_CADENA→SERIE_CADENA",
      "SERIE_CAD_NO_ACEPT→SERIE_CADENA",
      "SERIE_CAD_ACEPTADA→SERIE_CADENA"
    ]
  },
  "EMBARQUE_LINEA": {
    "pk": "EMBARQUE",
    "cols": [
      "EMBARQUE→DET_DOCUMENTO_EMBARQUE",
      "ARTICULO→ARTICULO",
      "BODEGA→BODEGA",
      "MONEDA_OC→MONEDA",
      "SERIE_CADENA→SERIE_CADENA",
      "ORDEN_COMPRA→ORDEN_COMPRA_LINEA",
      "ORDEN_COMPRA_LINEA→ORDEN_COMPRA_LINEA",
      "UNIDAD_DISTRIBUCIO→UNIDAD_DE_MEDIDA"
    ]
  },
  "SUBTIPO_DOC_CC": {
    "pk": "TIPO",
    "cols": [
      "TIPO",
      "TIPO_CB→SUBTIPO_DOC_CB",
      "SUBTIPO_CB→SUBTIPO_DOC_CB",
      "CUENTA_CONTABLE→CENTRO_CUENTA",
      "CENTRO_COSTO→CENTRO_CUENTA",
      "TIPO_ASIENTO→TIPO_ASIENTO",
      "PAQUETE→PAQUETE",
      "TIPO_PAGO→TIPO_PAGO"
    ]
  },
  "SUBTIPO_DOC_CP": {
    "pk": "SUBTIPO",
    "cols": [
      "SUBTIPO",
      "TIPO_CB→SUBTIPO_DOC_CB",
      "SUBTIPO_CB→SUBTIPO_DOC_CB",
      "CUENTA_CONTABLE→CENTRO_CUENTA",
      "CENTRO_COSTO→CENTRO_CUENTA",
      "TIPO_ASIENTO→TIPO_ASIENTO",
      "PAQUETE→PAQUETE",
      "TIPO_PAGO→TIPO_PAGO"
    ]
  },
  "UNIDAD_DE_MEDIDA": {
    "pk": "UNIDAD_MEDIDA",
    "cols": [
      "UNIDAD_MEDIDA",
      "DESCRIPCION",
      "NoteExistsFlag",
      "RecordDate",
      "RowPointer",
      "CreatedBy",
      "UpdatedBy",
      "CreateDate"
    ]
  },
  "GLOBALES_FA": {
    "pk": "LLAVE",
    "cols": [
      "LLAVE",
      "CATEGORIA_CLIENTE→CATEGORIA_CLIENTE",
      "NIVEL_PRECIO→NIVEL_PRECIO",
      "MONEDA_NIVEL→NIVEL_PRECIO",
      "BODEGA_DEFAULT→BODEGA",
      "COND_PAGO_CONTAD→CONDICION_PAGO",
      "TIPO_ASIENTO→TIPO_ASIENTO",
      "PAQUETE→PAQUETE"
    ]
  },
  "NIVEL_PRECIO": {
    "pk": "NIVEL_PRECIO",
    "cols": [
      "NIVEL_PRECIO",
      "CONDICION_PAGO→CONDICION_PAGO",
      "MONEDA",
      "ESQUEMA_TRABAJO",
      "DESCUENTOS",
      "SUGERIR_DESCUENTO",
      "SINC_MOVIL",
      "NoteExistsFlag"
    ]
  },
  "TIPO_IMPUESTO": {
    "pk": "TIPO_IMPUESTO",
    "cols": [
      "TIPO_IMPUESTO",
      "NoteExistsFlag",
      "RecordDate",
      "RowPointer",
      "CreatedBy",
      "UpdatedBy",
      "CreateDate",
      "ACTIVO"
    ]
  },
  "TIPO_DESCUENTO": {
    "pk": "CODIGO",
    "cols": [
      "CODIGO",
      "DESCRIPCION",
      "NIVEL",
      "NoteExistsFlag",
      "RecordDate",
      "RowPointer",
      "CreatedBy",
      "UpdatedBy"
    ]
  },
  "VERSION_NIVEL": {
    "pk": "NIVEL_PRECIO",
    "cols": [
      "NIVEL_PRECIO→NIVEL_PRECIO",
      "MONEDA→NIVEL_PRECIO",
      "TIPO_DESC_BONIFICADO→TIPO_DESCUENTO",
      "TIPO_DESCUENTO→TIPO_DESCUENTO",
      "VERSION",
      "FECHA_INICIO",
      "FECHA_CORTE",
      "ESTADO"
    ]
  },
  "CAJA_CHICA": {
    "pk": "CAJA_CHICA",
    "cols": [
      "CAJA_CHICA",
      "MONEDA→MONEDA",
      "RESPONSABLE→RESPONSABLE",
      "AREA_FUNCIONAL→DEPARTAMENTO",
      "CENTRO_COSTO→CENTRO_CUENTA",
      "CUENTA_CONTABLE→CENTRO_CUENTA",
      "CUENTA_REEMBOLSOS→CENTRO_CUENTA",
      "CENTRO_REEMBOLSOS→CENTRO_CUENTA"
    ]
  },
  "GLOBALES_AF": {
    "pk": "CTA_CORRECC_DA",
    "cols": [
      "CTA_CORRECC_DA→CENTRO_CUENTA",
      "CTA_ORDEN_VENTA→CENTRO_CUENTA",
      "CTR_SUPERAVIT→CENTRO_CUENTA",
      "CTA_SUPERAVIT→CENTRO_CUENTA",
      "CTR_REI→CENTRO_CUENTA",
      "CTA_REI→CENTRO_CUENTA",
      "PAQUETE→PAQUETE",
      "TIPO_ASIENTO→TIPO_ASIENTO"
    ]
  },
  "ORDEN_COMPRA": {
    "pk": "ORDEN_COMPRA",
    "cols": [
      "ORDEN_COMPRA",
      "PROVEEDOR→PROVEEDOR",
      "BODEGA→BODEGA",
      "CONDICION_PAGO→CONDICION_PAGO",
      "MONEDA→MONEDA",
      "PAIS→PAIS",
      "COD_DIREC_EMB",
      "RESPON_SEGUIMIENTO"
    ]
  },
  "METODO_PAGO": {
    "pk": "METODO_PAGO",
    "cols": [
      "METODO_PAGO",
      "NoteExistsFlag",
      "RecordDate",
      "RowPointer",
      "CreatedBy",
      "UpdatedBy",
      "CreateDate",
      "DESCRIPCION"
    ]
  },
  "SUBTIPO_DOC_CB": {
    "pk": "TIPO",
    "cols": [
      "TIPO",
      "CUENTA_CONTABLE→CENTRO_CUENTA",
      "CENTRO_COSTO→CENTRO_CUENTA",
      "TIPO_ASIENTO→TIPO_ASIENTO",
      "PAQUETE→PAQUETE",
      "SUBTIPO",
      "DESCRIPCION",
      "NoteExistsFlag"
    ]
  },
  "TIPO_INDICE_PRECIO": {
    "pk": "TIPO_INDICE_PRECIO",
    "cols": [
      "TIPO_INDICE_PRECIO",
      "DESCRIPCION",
      "NoteExistsFlag",
      "RecordDate",
      "RowPointer",
      "CreatedBy",
      "UpdatedBy",
      "CreateDate"
    ]
  },
  "GLOBALES_CG": {
    "pk": "CTA_PERD_DIFCAMDOL",
    "cols": [
      "CTA_PERD_DIFCAMDOL→CENTRO_CUENTA",
      "CTA_PERD_DIFCAMLOC→CENTRO_CUENTA",
      "TIP_ASNT_CIERRE_AN→TIPO_ASIENTO",
      "CTR_DIFCAMBIOLOCAL→CENTRO_CUENTA",
      "CTA_DIFCAMBIOLOCAL→CENTRO_CUENTA",
      "CTR_DIFCAMBIODOLAR→CENTRO_CUENTA",
      "CTA_DIFCAMBIODOLAR→CENTRO_CUENTA",
      "CTR_CIERRE→CENTRO_COSTO"
    ]
  },
  "EMBARQUE": {
    "pk": "EMBARQUE",
    "cols": [
      "EMBARQUE",
      "USUARIO_CREADO",
      "LIQUIDAC_COMPRA→LIQUIDAC_COMPRA",
      "PROVEEDOR→PROVEEDOR",
      "USUARIO_APLICADO",
      "USUARIO_LIQUIDACIO",
      "PEDIMENTO",
      "ASIENTO_RECIBO"
    ]
  },
  "EXISTENCIA_BODEGA": {
    "pk": "ARTICULO",
    "cols": [
      "ARTICULO→ARTICULO",
      "BODEGA→BODEGA",
      "EXISTENCIA_MINIMA",
      "EXISTENCIA_MAXIMA",
      "PUNTO_DE_REORDEN",
      "CANT_DISPONIBLE",
      "CANT_RESERVADA",
      "CANT_NO_APROBADA"
    ]
  },
  "TRANSACCION_INV": {
    "pk": "AUDIT_TRANS_INV",
    "cols": [
      "AUDIT_TRANS_INV→AUDIT_TRANS_INV",
      "ARTICULO→LOTE",
      "SERIE_CADENA→SERIE_CADENA",
      "NIT→NIT",
      "AJUSTE_CONFIG→AJUSTE_CONFIG",
      "BODEGA→LOCALIZACION",
      "LOCALIZACION→LOCALIZACION",
      "LOTE→LOTE"
    ]
  },
  "DEVOLUCION": {
    "pk": "DEVOLUCION",
    "cols": [
      "DEVOLUCION",
      "USUARIO_CREADO",
      "AJUSTE_CONFIG→AJUSTE_CONFIG",
      "EMBARQUE→EMBARQUE",
      "USUARIO_APLICADO",
      "USUARIO_CANCELA",
      "MONEDA_DDEB→MONEDA",
      "PROVEEDOR_DDEB→PROVEEDOR"
    ]
  },
  "LINEA_DOC_INV": {
    "pk": "PAQUETE_INVENTARIO",
    "cols": [
      "PAQUETE_INVENTARIO→DOCUMENTO_INV",
      "DOCUMENTO_INV→DOCUMENTO_INV",
      "AJUSTE_CONFIG→AJUSTE_CONFIG",
      "ARTICULO→ARTICULO",
      "SERIE_CADENA→SERIE_CADENA",
      "NIT→NIT",
      "BODEGA→LOCALIZACION",
      "LOCALIZACION→LOCALIZACION"
    ]
  },
  "CARTA_PORTE_MERCANCIA": {
    "pk": "MERCANCIA",
    "cols": [
      "MERCANCIA",
      "BIENES_TRANSP",
      "CLAVE_STCC",
      "CVE_MATERIAL_PELIGROSO",
      "EMBALAJE",
      "MONEDA→MONEDA",
      "DET_MERCANCIA",
      "SECTOR_COFEPRIS"
    ]
  },
  "CONCILIACION": {
    "pk": "CUENTA_BANCO",
    "cols": [
      "CUENTA_BANCO→CUENTA_BANCARIA",
      "USUARIO_CREACION",
      "USUARIO_MODIFIC",
      "USUARIO_APROBAC",
      "CONCILIACION",
      "FECHA_INICIAL",
      "FECHA_FINAL",
      "ESTADO"
    ]
  },
  "TIPO_CAMBIO": {
    "pk": "TIPO_CAMBIO",
    "cols": [
      "TIPO_CAMBIO",
      "DESCRIPCION",
      "NoteExistsFlag",
      "RecordDate",
      "RowPointer",
      "CreatedBy",
      "UpdatedBy",
      "CreateDate"
    ]
  },
  "ALARMA": {
    "pk": "ALARMA",
    "cols": [
      "ALARMA",
      "ALARMA_BASE→ALARMA_BASE",
      "ALARMA_PLANTILLA→ALARMA_PLANTILLA",
      "INTERVALO_FRECUENCIA",
      "ACTIVA",
      "TITULO",
      "ENVIAR_CORREOS",
      "NOTIFICAR_SIN_DATOS"
    ]
  },
  "DIFERIDO": {
    "pk": "DIFERIDO",
    "cols": [
      "DIFERIDO",
      "CTR_DIFERIDO→CENTRO_CUENTA",
      "CTA_DIFERIDO→CENTRO_CUENTA",
      "CTR_CONTRAASIENTO→CENTRO_CUENTA",
      "CTA_CONTRAASIENTO→CENTRO_CUENTA",
      "CTR_AMORTIZACION→CENTRO_CUENTA",
      "CTA_AMORTIZACION→CENTRO_CUENTA",
      "CTR_GASTOINGRESO→CENTRO_CUENTA"
    ]
  },
  "AJUSTE_CONFIG": {
    "pk": "AJUSTE_CONFIG",
    "cols": [
      "AJUSTE_CONFIG",
      "DESCRIPCION",
      "AJUSTE_BASE",
      "ACTIVA",
      "INGRESO",
      "NoteExistsFlag",
      "RecordDate",
      "RowPointer"
    ]
  },
  "ARTICULO_PRECIO": {
    "pk": "NIVEL_PRECIO",
    "cols": [
      "NIVEL_PRECIO→VERSION_NIVEL",
      "VERSION→VERSION_NIVEL",
      "MONEDA→VERSION_NIVEL",
      "ARTICULO→ARTICULO",
      "VERSION_ARTICULO",
      "PRECIO",
      "ESQUEMA_TRABAJO",
      "MARGEN_UTILIDAD"
    ]
  },
  "RESPONSABLE": {
    "pk": "RESPONSABLE",
    "cols": [
      "RESPONSABLE",
      "CONTRIBUYENTE→NIT",
      "NIT→NIT",
      "NOMBRE",
      "NoteExistsFlag",
      "RecordDate",
      "RowPointer",
      "CreatedBy"
    ]
  },
  "LIQUIDAC_COMPRA": {
    "pk": "LIQUIDAC_COMPRA",
    "cols": [
      "LIQUIDAC_COMPRA",
      "PROVEEDOR_LIQUIDAC→PROVEEDOR",
      "ESTADO_LIQUIDAC",
      "FECHA_LIQUIDAC",
      "PRORRATEO_LIQUIDAC",
      "USUARIO_CREACION",
      "FECHA_HORA_CREAC",
      "CALCULA_ARANCEL"
    ]
  },
  "DET_DOCUMENTO_EMBARQUE": {
    "pk": "PROVEEDOR",
    "cols": [
      "PROVEEDOR→DOCUMENTO_EMBARQUE",
      "DOCUMENTO→DOCUMENTO_EMBARQUE",
      "TIPO_DOCUMENTO→DOCUMENTO_EMBARQUE",
      "EMBARQUE→EMBARQUE",
      "MONTO_APLICAR",
      "NoteExistsFlag",
      "RecordDate",
      "RowPointer"
    ]
  },
  "DETALLE_RETENCION": {
    "pk": "TIPO",
    "cols": [
      "TIPO→DOCUMENTOS_CP",
      "CODIGO_RETENCION→RETENCIONES",
      "PROVEEDOR→DOCUMENTOS_CP",
      "DOCUMENTO→DOCUMENTOS_CP",
      "MONTO",
      "ESTADO",
      "PAGADA",
      "NoteExistsFlag"
    ]
  },
  "DIVISION_GEOGRAFICA3": {
    "pk": "PAIS",
    "cols": [
      "PAIS→PAIS",
      "DIVISION_GEOGRAFICA1→DIVISION_GEOGRAFICA2",
      "DIVISION_GEOGRAFICA2→DIVISION_GEOGRAFICA2",
      "DIVISION_GEOGRAFICA3",
      "NOMBRE",
      "NoteExistsFlag",
      "RecordDate",
      "RowPointer"
    ]
  },
  "GLOBALES_CH": {
    "pk": "IMPUESTO_OMISION",
    "cols": [
      "IMPUESTO_OMISION",
      "TIPO_ASIENTO→TIPO_ASIENTO",
      "PAQUETE→PAQUETE",
      "CENTRO_COSTO_AD→CENTRO_CUENTA",
      "CUENTA_CONTABLE_AD→CENTRO_CUENTA",
      "CTR_RUBRO1_CH→CENTRO_CUENTA",
      "CTA_RUBRO1_CH→CENTRO_CUENTA",
      "CTR_RUBRO2_CH→CENTRO_CUENTA"
    ]
  },
  "ITEMS_HACIENDA": {
    "pk": "ITEM_HACIENDA",
    "cols": [
      "ITEM_HACIENDA",
      "DESCRIPCION",
      "REPORTE",
      "FENOMENO_ECONOMICO",
      "NoteExistsFlag",
      "RecordDate",
      "RowPointer",
      "CreatedBy"
    ]
  },
  "MOV_REPORTADOS": {
    "pk": "DOC_REPORTADO",
    "cols": [
      "DOC_REPORTADO",
      "USUARIO_CREACION",
      "CONCILIACION→CONCILIACION",
      "DOC_COMPENSAC→MOV_REPORTADOS",
      "CUENTA_BANCO→CONCILIACION",
      "USUARIO_MODIFIC",
      "TIPO_DOCUMENTO",
      "NUMERO"
    ]
  },
  "COMPLEMENTO_SUNAT": {
    "pk": "NUMERO_DOCUMENTO",
    "cols": [
      "NUMERO_DOCUMENTO",
      "CONSECUTIVO→CONSECUTIVO",
      "MOTIVO_TRASLADO",
      "TRANSPORTISTA",
      "VEHICULO",
      "CONDUCTOR",
      "PUERTO",
      "AEROPUERTO"
    ]
  },
  "CONSECUTIVO_CI": {
    "pk": "CONSECUTIVO",
    "cols": [
      "CONSECUTIVO",
      "ULTIMO_USUARIO",
      "DESCRIPCION",
      "MASCARA",
      "SIGUIENTE_CONSEC",
      "EDITABLE",
      "MULTIPLES_TRANS",
      "ULT_FECHA_HORA"
    ]
  },
  "DETALLE_DIRECCION": {
    "pk": "DETALLE_DIRECCION",
    "cols": [
      "DETALLE_DIRECCION",
      "DIRECCION",
      "NoteExistsFlag",
      "RecordDate",
      "RowPointer",
      "CreatedBy",
      "UpdatedBy",
      "CreateDate"
    ]
  },
  "ENTIDAD_FINANCIERA": {
    "pk": "ENTIDAD_FINANCIERA",
    "cols": [
      "ENTIDAD_FINANCIERA",
      "NIT→NIT",
      "DESCRIPCION",
      "NoteExistsFlag",
      "RecordDate",
      "RowPointer",
      "CreatedBy",
      "UpdatedBy"
    ]
  },
  "FORMATO_TRANSFER": {
    "pk": "FORMATO",
    "cols": [
      "FORMATO",
      "ENTIDAD_FINANCIERA→ENTIDAD_FINANCIERA",
      "DESCRIPCION",
      "TIPO_ARCHIVO",
      "ARCHIVO_TRANSFORMACION",
      "FUENTE_DATOS",
      "NoteExistsFlag",
      "RecordDate"
    ]
  },
  "GLOBALES_CO": {
    "pk": "DETALLE_DIR_EMB",
    "cols": [
      "DETALLE_DIR_EMB→DETALLE_DIRECCION",
      "TIPO_CAMBIO→TIPO_CAMBIO",
      "DETALLE_DIR_COB→DETALLE_DIRECCION",
      "BODEGA_DEFAULT→BODEGA",
      "TIPO_ASIENTO→TIPO_ASIENTO",
      "PAQUETE→PAQUETE",
      "CTR_TRANSITO_LOCAL→CENTRO_CUENTA",
      "CTA_TRANSITO_LOCAL→CENTRO_CUENTA"
    ]
  },
  "PEDIDO_LINEA": {
    "pk": "PEDIDO",
    "cols": [
      "PEDIDO→PEDIDO",
      "BODEGA→LOCALIZACION",
      "ARTICULO→LOTE",
      "LOTE→LOTE",
      "LOCALIZACION→LOCALIZACION",
      "UNIDAD_DISTRIBUCIO→UNIDAD_DE_MEDIDA",
      "CENTRO_COSTO→CENTRO_COSTO",
      "CUENTA_CONTABLE→CUENTA_CONTABLE"
    ]
  },
  "PEDIDO_SUGERIDO": {
    "pk": "PROVEEDOR",
    "cols": [
      "PROVEEDOR→PROVEEDOR",
      "ARTICULO→ARTICULO",
      "USUARIO_GENERACION",
      "CLASIFICACION1→CLASIFICACION",
      "CLASIFICACION2→CLASIFICACION",
      "CLASIFICACION3→CLASIFICACION",
      "CLASIFICACION4→CLASIFICACION",
      "CLASIFICACION5→CLASIFICACION"
    ]
  },
  "SUBSECCION_REPORTES": {
    "pk": "TIPO_R",
    "cols": [
      "TIPO_R→SECCION_REPORTES",
      "CODIGO_R→SECCION_REPORTES",
      "SECCION_R→SECCION_REPORTES",
      "SUBSECCION",
      "DESCRIPCION",
      "TIPO",
      "SECUENCIA",
      "NoteExistsFlag"
    ]
  },
  "AUXILIAR_CC": {
    "pk": "TIPO_CREDITO",
    "cols": [
      "TIPO_CREDITO→DOCUMENTOS_CC",
      "TIPO_DEBITO→DOCUMENTOS_CC",
      "CREDITO→DOCUMENTOS_CC",
      "DEBITO→DOCUMENTOS_CC",
      "MONEDA_CREDITO→MONEDA",
      "MONEDA_DEBITO→MONEDA",
      "CLI_REPORTE_CREDIT→CLIENTE",
      "CLI_REPORTE_DEBITO→CLIENTE"
    ]
  },
  "AUXILIAR_CP": {
    "pk": "PROVEEDOR",
    "cols": [
      "PROVEEDOR→DOCUMENTOS_CP",
      "TIPO_DEBITO→DOCUMENTOS_CP",
      "DEBITO→DOCUMENTOS_CP",
      "TIPO_CREDITO→DOCUMENTOS_CP",
      "CREDITO→DOCUMENTOS_CP",
      "MONEDA_DEBITO→MONEDA",
      "MONEDA_CREDITO→MONEDA",
      "CODIGO_RET_PAGO→RETENCIONES"
    ]
  },
  "CARTA_PORTE_DOMICILIO": {
    "pk": "DOMICILIO",
    "cols": [
      "DOMICILIO",
      "NoteExistsFlag",
      "RecordDate",
      "RowPointer",
      "CreatedBy",
      "UpdatedBy",
      "CreateDate",
      "CODIGOPOSTAL"
    ]
  },
  "CHEQUE": {
    "pk": "CHEQUE_INTERNO",
    "cols": [
      "CHEQUE_INTERNO",
      "CUENTA_BANCO→CUENTA_BANCARIA",
      "USUARIO_CREACION",
      "TIPO→SUBTIPO_DOC_CB",
      "SUBTIPO→SUBTIPO_DOC_CB",
      "USUARIO_MODIFIC",
      "CONTRIBUYENTE→NIT",
      "USUARIO_ULT_APLIC"
    ]
  },
  "COBRADOR": {
    "pk": "COBRADOR",
    "cols": [
      "COBRADOR",
      "CTR_COMISION→CENTRO_CUENTA",
      "CTA_COMISION→CENTRO_CUENTA",
      "NOMBRE",
      "COMISION",
      "ACTIVO",
      "NoteExistsFlag",
      "RecordDate"
    ]
  },
  "CONCEPTO_VALE": {
    "pk": "CONCEPTO_VALE",
    "cols": [
      "CONCEPTO_VALE",
      "CENTRO_COSTO→CENTRO_CUENTA",
      "CUENTA_CONTABLE→CENTRO_CUENTA",
      "CTR_CTO_RET_ASUM→CENTRO_CUENTA",
      "CTA_CTB_RET_ASUM→CENTRO_CUENTA",
      "MODELO_RETENCION→MODELO_RETENCION",
      "TIPO_COSTO_GASTO",
      "DESCRIPCION"
    ]
  },
  "CONSECUTIVO_FA": {
    "pk": "CODIGO_CONSECUTIVO",
    "cols": [
      "CODIGO_CONSECUTIVO",
      "USUARIO_ULT",
      "RESOLUCION",
      "NUMERO_COPIAS",
      "DESCRIPCION",
      "TIPO",
      "LONGITUD",
      "VALOR_CONSECUTIVO"
    ]
  },
  "CUENTA_DEPRECIACIO": {
    "pk": "TIPO_ACTIVO",
    "cols": [
      "TIPO_ACTIVO→TIPO_ACTIVO",
      "CENTRO_COSTO→CENTRO_COSTO",
      "CTA_DEPR_NORMAL→CUENTA_CONTABLE",
      "CTA_DEPR_REVAL→CUENTA_CONTABLE",
      "CTA_DEPR_NORMAL_C→CUENTA_CONTABLE",
      "CTA_DEPR_REVAL_C→CUENTA_CONTABLE",
      "CTA_DEPR_AI_F→CUENTA_CONTABLE",
      "CTA_DEPR_AI_C→CUENTA_CONTABLE"
    ]
  },
  "DEPARTAMENTO": {
    "pk": "DEPARTAMENTO",
    "cols": [
      "DEPARTAMENTO",
      "DESCRIPCION",
      "ACTIVO",
      "NoteExistsFlag",
      "RecordDate",
      "RowPointer",
      "CreatedBy",
      "UpdatedBy"
    ]
  },
  "GLOBALES_CC": {
    "pk": "ULT_NOTA_CREDITO",
    "cols": [
      "ULT_NOTA_CREDITO",
      "TIPO_ASIENTO_DEB→TIPO_ASIENTO",
      "PAQUETE_DEB→PAQUETE",
      "TIPO_ASIENTO_CRE→TIPO_ASIENTO",
      "PAQUETE_CRE→PAQUETE",
      "IMPUESTO_X_OMISION→IMPUESTO",
      "TIPO_DOC_MORA→SUBTIPO_DOC_CC",
      "SUBTIPO_DOC_MORA→SUBTIPO_DOC_CC"
    ]
  },
  "IMPUESTO_COMPRA": {
    "pk": "IMPUESTO_COMPRA",
    "cols": [
      "IMPUESTO_COMPRA",
      "FORMULA_OK",
      "NoteExistsFlag",
      "RecordDate",
      "RowPointer",
      "CreatedBy",
      "UpdatedBy",
      "CreateDate"
    ]
  },
  "MODELO_RETENCION": {
    "pk": "MODELO_RETENCION",
    "cols": [
      "MODELO_RETENCION",
      "DESCRIPCION",
      "NoteExistsFlag",
      "RecordDate",
      "RowPointer",
      "CreatedBy",
      "UpdatedBy",
      "CreateDate"
    ]
  },
  "SOLICITUD_OC": {
    "pk": "SOLICITUD_OC",
    "cols": [
      "SOLICITUD_OC",
      "DEPARTAMENTO→DEPARTAMENTO",
      "AUTORIZADA_POR",
      "USUARIO",
      "USUARIO_CANCELA",
      "FECHA_SOLICITUD",
      "FECHA_REQUERIDA",
      "PRIORIDAD"
    ]
  },
  "SOLICITUD_OC_LINEA": {
    "pk": "SOLICITUD_OC",
    "cols": [
      "SOLICITUD_OC→SOLICITUD_OC",
      "ARTICULO→ARTICULO",
      "USUARIO_CANCELA",
      "UNIDAD_DISTRIBUCIO→UNIDAD_DE_MEDIDA",
      "CENTRO_COSTO→CENTRO_CUENTA",
      "CUENTA_CONTABLE→CENTRO_CUENTA",
      "SOLICITUD_OC_LINEA",
      "CANTIDAD"
    ]
  },
  "TRANSFERENCIA_CB": {
    "pk": "CUENTA_ORIGEN",
    "cols": [
      "CUENTA_ORIGEN→MOV_BANCOS",
      "TIPO_ORIGEN→MOV_BANCOS",
      "NUMERO_ORIGEN→MOV_BANCOS",
      "METODO_PAGO→METODO_PAGO",
      "DESCRIPCION",
      "MONTO_ORIGEN",
      "FCH_HORA_CREACION",
      "USUARIO_CREACION"
    ]
  },
  "VALE": {
    "pk": "CONSECUTIVO",
    "cols": [
      "CONSECUTIVO",
      "CAJA_CHICA→CAJA_CHICA",
      "CONCEPTO_VALE→CONCEPTO_VALE",
      "DEPARTAMENTO→DEPARTAMENTO",
      "CUENTA_BANCO→CUENTA_BANCARIA",
      "FORMA_PAGO_COMPRA→FORMA_PAGO_COMPRA",
      "CONTRIBUYENTE→NIT",
      "VALE"
    ]
  },
  "ALARMA_BASE_COLUMNA": {
    "pk": "ALARMA_BASE",
    "cols": [
      "ALARMA_BASE→ALARMA_BASE",
      "CONSECUTIVO",
      "COLUMNA_SQL",
      "COLUMNA",
      "ORDEN_SUGERIDO",
      "TIPO",
      "PERMITE_FILTRAR",
      "ES_FILTRO"
    ]
  },
  "ALARMA_PLANTILLA": {
    "pk": "ALARMA_BASE",
    "cols": [
      "ALARMA_BASE→ALARMA_BASE",
      "ALARMA_PLANTILLA",
      "NOMBRE",
      "VERSION",
      "FILTRO",
      "NoteExistsFlag",
      "RecordDate",
      "RowPointer"
    ]
  },
  "ASIENTO_DISTRIBUID": {
    "pk": "ASIENTO_DISTRIBUID",
    "cols": [
      "ASIENTO_DISTRIBUID",
      "TIPO_ASIENTO→TIPO_ASIENTO",
      "PAQUETE→PAQUETE",
      "USUARIO_CREACION",
      "USUARIO_ULT_MODIF",
      "USUARIO_ULT_APLIC",
      "DESCRIPCION",
      "TIPO_DISTRIBUCION"
    ]
  },
  "AUDIT_TRANS_INV": {
    "pk": "AUDIT_TRANS_INV",
    "cols": [
      "AUDIT_TRANS_INV",
      "USUARIO",
      "CONSECUTIVO→CONSECUTIVO_CI",
      "USUARIO_APRO",
      "FECHA_HORA",
      "MODULO_ORIGEN",
      "APLICACION",
      "REFERENCIA"
    ]
  },
  "BOLETA_INV_FISICO": {
    "pk": "BOLETA",
    "cols": [
      "BOLETA",
      "ARTICULO→LOTE",
      "BODEGA→LOCALIZACION",
      "USUARIO",
      "SERIE_CADENA_DISP→SERIE_CADENA",
      "SERIE_CADENA_NOAPR→SERIE_CADENA",
      "SERIE_CADENA_VENC→SERIE_CADENA",
      "LOCALIZACION→LOCALIZACION"
    ]
  },
  "CARTA_PORTE_UBICACION": {
    "pk": "UBICACION",
    "cols": [
      "UBICACION",
      "TIPO_ESTACION",
      "DOMICILIO→CARTA_PORTE_DOMICILIO",
      "RFC_REMITENTE→NIT",
      "RESIDENCIA_FISCAL→PAIS",
      "NUM_ESTACION→CARTA_PORTE_ESTACIONES",
      "NoteExistsFlag",
      "RecordDate"
    ]
  },
  "HIST_DEPRECIACION": {
    "pk": "HIST_DEPRECIACION",
    "cols": [
      "HIST_DEPRECIACION",
      "ACTIVO_FIJO→ACTIVO_MEJORA",
      "MEJORA→ACTIVO_MEJORA",
      "USUARIO",
      "FECHA",
      "CONTABILIDAD",
      "REFERENCIA",
      "AJUSTE"
    ]
  },
  "RECEPCION_DETRAC": {
    "pk": "CONSTANCIA",
    "cols": [
      "CONSTANCIA",
      "COD_DETRACCION→TIPOS_DETRACCIONES",
      "PROVEEDOR→DOCUMENTOS_CP",
      "TIPO_DEBITO→DOCUMENTOS_CP",
      "DEBITO→DOCUMENTOS_CP",
      "TIPO_CREDITO→DOCUMENTOS_CP",
      "CREDITO→DOCUMENTOS_CP",
      "TIPO_DETRACCION→TIPOS_DETRACCIONES"
    ]
  },
  "TIPO_TARIFA_IVA": {
    "pk": "TIPO_TARIFA",
    "cols": [
      "TIPO_TARIFA",
      "TIPO_IMPUESTO→TIPO_IMPUESTO",
      "DESCRIPCION",
      "NoteExistsFlag",
      "RecordDate",
      "RowPointer",
      "CreatedBy",
      "UpdatedBy"
    ]
  },
  "CLASIF_BIENES_SERV_ADQ": {
    "pk": "CLASIFICACION",
    "cols": [
      "CLASIFICACION",
      "NoteExistsFlag",
      "RecordDate",
      "RowPointer",
      "CreatedBy",
      "UpdatedBy",
      "CreateDate",
      "DESCRIPCION"
    ]
  },
  "CODIGOS_MODIFICACION": {
    "pk": "CODIGO",
    "cols": [
      "CODIGO",
      "NoteExistsFlag",
      "RecordDate",
      "RowPointer",
      "CreatedBy",
      "UpdatedBy",
      "CreateDate",
      "DESCRIPCION"
    ]
  },
  "CONSECUTIVO": {
    "pk": "CONSECUTIVO",
    "cols": [
      "CONSECUTIVO",
      "CONSECUTIVO_NC→CONSECUTIVO_FA",
      "BODEGA→BODEGA",
      "DESCRIPCION",
      "ACTIVO",
      "LONGITUD",
      "ENTIDAD",
      "DOCUMENTO"
    ]
  },
  "DES_BON_REGLA": {
    "pk": "REGLA",
    "cols": [
      "REGLA",
      "DESCRIPCION",
      "TIPO",
      "ACTIVA",
      "VALIDAR_CANTIDAD",
      "TIPO_DESCUENTO",
      "TIPO_VALOR",
      "TIPO_BONIFICACION"
    ]
  },
  "DEVOL_LIN_EMBARQUE": {
    "pk": "DEVOLUCION",
    "cols": [
      "DEVOLUCION→DEVOLUCION",
      "BODEGA→LOCALIZACION",
      "EMBARQUE→EMBARQUE_LINEA",
      "EMBARQUE_LINEA→EMBARQUE_LINEA",
      "SERIE_CADENA→SERIE_CADENA",
      "ORDEN_COMPRA→ORDEN_COMPRA_LINEA",
      "LOCALIZACION→LOCALIZACION",
      "ORDEN_COMPRA_LINEA→ORDEN_COMPRA_LINEA"
    ]
  },
  "DOCUMENTO_INV": {
    "pk": "PAQUETE_INVENTARIO",
    "cols": [
      "PAQUETE_INVENTARIO",
      "USUARIO",
      "CONSECUTIVO→CONSECUTIVO_CI",
      "USUARIO_APRO",
      "DOCUMENTO_INV",
      "REFERENCIA",
      "FECHA_HOR_CREACION",
      "FECHA_DOCUMENTO"
    ]
  },
  "EXISTENCIA_RESERVA": {
    "pk": "ARTICULO",
    "cols": [
      "ARTICULO→EXISTENCIA_BODEGA",
      "BODEGA→LOCALIZACION",
      "LOTE→LOTE",
      "LOCALIZACION→LOCALIZACION",
      "USUARIO",
      "SERIE_CADENA→SERIE_CADENA",
      "APLICACION",
      "MODULO_ORIGEN"
    ]
  },
  "SECCION_REPORTES": {
    "pk": "TIPO_R",
    "cols": [
      "TIPO_R",
      "CODIGO_R",
      "SECCION_R",
      "DESCRIPCION",
      "TIPO",
      "SECUENCIA",
      "NoteExistsFlag",
      "RecordDate"
    ]
  },
  "SOLICITUD_AF_NOTIF": {
    "pk": "SOLICITUD",
    "cols": [
      "SOLICITUD",
      "RESPONSABLE_CREADOR→RESPONSABLE",
      "RESPONSABLE_TRASLADO→RESPONSABLE",
      "RESPONSABLE_CREADOPOR→RESPONSABLE",
      "TIPO_ACCION",
      "ESTADO_SOLICITUD",
      "FECHA_RIGE",
      "NoteExistsFlag"
    ]
  },
  "TIPO_TRIBUTO": {
    "pk": "CODIGO",
    "cols": [
      "CODIGO",
      "COD_INTERNACIONAL",
      "DESCRIPCION",
      "NOMBRE",
      "NoteExistsFlag",
      "RecordDate",
      "RowPointer",
      "CreatedBy"
    ]
  },
  "CAJA": {
    "pk": "CAJA",
    "cols": [
      "CAJA",
      "ACTIVO_FIJO→ACTIVO_FIJO",
      "DESCRIPCION",
      "ESTADO",
      "NoteExistsFlag",
      "RecordDate",
      "RowPointer",
      "CreatedBy"
    ]
  },
  "CARTA_PORTE_OPERADOR": {
    "pk": "OPERADOR",
    "cols": [
      "OPERADOR",
      "RESIDENCIA_FISCAL_OPERADOR→PAIS",
      "DOMICILIO→CARTA_PORTE_DOMICILIO",
      "TIPO_FIGURA",
      "NoteExistsFlag",
      "RecordDate",
      "RowPointer",
      "CreatedBy"
    ]
  },
  "CP_DET_RETENCION_PAR": {
    "pk": "TIPO",
    "cols": [
      "TIPO→DETALLE_RETENCION",
      "PROVEEDOR→DETALLE_RETENCION",
      "DOCUMENTO→DETALLE_RETENCION",
      "RETENCION→DETALLE_RETENCION",
      "TIPO_CAN→DOCUMENTOS_CP",
      "PROVEE_CAN→DOCUMENTOS_CP",
      "DOC_CAN→DOCUMENTOS_CP",
      "NUM_RETEN"
    ]
  },
  "DESPACHO_DETALLE": {
    "pk": "DESPACHO",
    "cols": [
      "DESPACHO→DESPACHO",
      "ARTICULO→ARTICULO",
      "BODEGA→BODEGA",
      "DOCUM_ORIG→FACTURA_LINEA",
      "TIPO_DOCUM_ORIG→FACTURA_LINEA",
      "LINEA_DOCUM_ORIG→FACTURA_LINEA",
      "SERIE_CADENA→SERIE_CADENA",
      "LINEA"
    ]
  },
  "EXCEP_CIUDAD": {
    "pk": "PAIS",
    "cols": [
      "PAIS→DIVISION_GEOGRAFICA2",
      "CODIGO_RETENCION→RETENCIONES",
      "DIVISION_GEOGRAFICA1→DIVISION_GEOGRAFICA2",
      "DIVISION_GEOGRAFICA2→DIVISION_GEOGRAFICA2",
      "CENTRO_COSTO→CENTRO_CUENTA",
      "CUENTA_CONTABLE→CENTRO_CUENTA",
      "PORCENTAJE",
      "NoteExistsFlag"
    ]
  },
  "EXCEPCION_ARANCEL_PAIS": {
    "pk": "CODIGO_ARANCEL",
    "cols": [
      "CODIGO_ARANCEL→CODIGO_ARANCEL",
      "PAIS",
      "TIPO",
      "NoteExistsFlag",
      "RecordDate",
      "RowPointer",
      "CreatedBy",
      "UpdatedBy"
    ]
  },
  "PISTA_EXISTEN_DET": {
    "pk": "FECHA",
    "cols": [
      "FECHA",
      "BODEGA→EXISTENCIA_BODEGA",
      "ARTICULO→EXISTENCIA_BODEGA",
      "LOCALIZACION→LOCALIZACION",
      "LOTE→LOTE",
      "CANT_DISPONIBLE",
      "CANT_RESERVADA",
      "CANT_NO_APROBADA"
    ]
  },
  "ACTIVO_ACCION": {
    "pk": "ACTIVO_ACCION",
    "cols": [
      "ACTIVO_ACCION",
      "TIPO_ACCION_AF",
      "ACTIVO_FIJO→ACTIVO_FIJO",
      "UBICACION",
      "RESPONSABLE→RESPONSABLE",
      "ESTADO_ACTIVO→ESTADO_ACTIVO",
      "ESTADO_ACTIVO_ANT→ESTADO_ACTIVO",
      "ESTADO_ACCION"
    ]
  },
  "ALARMA_BASE": {
    "pk": "ALARMA_BASE",
    "cols": [
      "ALARMA_BASE",
      "NOMBRE",
      "MODULO",
      "VERSION",
      "REFRESCA_AUTOMATICO",
      "CONSULTA",
      "NoteExistsFlag",
      "RecordDate"
    ]
  },
  "ARTICULO_COMPRA": {
    "pk": "ARTICULO",
    "cols": [
      "ARTICULO→ARTICULO",
      "IMPUESTO→IMPUESTO",
      "CODIGO_ARANCEL→CODIGO_ARANCEL",
      "ULT_PROVEEDOR→PROVEEDOR",
      "ULT_MONEDA→MONEDA",
      "BODEGA→BODEGA",
      "DESCRIPCION",
      "IMP1_AFECTA_COSTO"
    ]
  },
  "ASIENTO_MAYORIZADO": {
    "pk": "ASIENTO",
    "cols": [
      "ASIENTO",
      "MAYOR_AUDITORIA",
      "TIPO_ASIENTO→TIPO_ASIENTO",
      "ULTIMO_USUARIO",
      "USUARIO_CREACION",
      "FECHA",
      "CONTABILIDAD",
      "ORIGEN"
    ]
  },
  "ASIENTO_RECURRENTE": {
    "pk": "ASIENTO_RECURRENTE",
    "cols": [
      "ASIENTO_RECURRENTE",
      "TIPO_ASIENTO→TIPO_ASIENTO",
      "USUARIO",
      "PAQUETE→PAQUETE",
      "USUARIO_ULT_APLIC",
      "DESCRIPCION",
      "TIPO",
      "MODALIDAD_APLIC"
    ]
  },
  "ATRIBUTO": {
    "pk": "ATRIBUTO",
    "cols": [
      "ATRIBUTO",
      "CLASE",
      "NoteExistsFlag",
      "RecordDate",
      "RowPointer",
      "CreatedBy",
      "UpdatedBy",
      "CreateDate"
    ]
  },
  "CARTA_PORTE_CVE_TRANSPORTE": {
    "pk": "CODIGO",
    "cols": [
      "CODIGO",
      "NoteExistsFlag",
      "RecordDate",
      "RowPointer",
      "CreatedBy",
      "UpdatedBy",
      "CreateDate",
      "DESCRIPCION"
    ]
  },
  "CARTA_PORTE_ESTACIONES": {
    "pk": "CODIGO",
    "cols": [
      "CODIGO",
      "NoteExistsFlag",
      "RecordDate",
      "RowPointer",
      "CreatedBy",
      "UpdatedBy",
      "CreateDate",
      "DESCRIPCION"
    ]
  },
  "CARTA_PORTE_TIPO_PERMISO": {
    "pk": "CODIGO",
    "cols": [
      "CODIGO",
      "NoteExistsFlag",
      "RecordDate",
      "RowPointer",
      "CreatedBy",
      "UpdatedBy",
      "CreateDate",
      "DESCRIPCION"
    ]
  },
  "CATALOGO_EXISTENCIA": {
    "pk": "CATALOGO_EXISTENCIA",
    "cols": [
      "CATALOGO_EXISTENCIA",
      "NoteExistsFlag",
      "RecordDate",
      "RowPointer",
      "CreatedBy",
      "UpdatedBy",
      "CreateDate",
      "DESCRIPCION"
    ]
  },
  "CODIGO_ARANCEL": {
    "pk": "CODIGO_ARANCEL",
    "cols": [
      "CODIGO_ARANCEL",
      "DESCRIPCION",
      "NoteExistsFlag",
      "RecordDate",
      "RowPointer",
      "CreatedBy",
      "UpdatedBy",
      "CreateDate"
    ]
  },
  "CONTRARECIBOS": {
    "pk": "CONTRARECIBO",
    "cols": [
      "CONTRARECIBO",
      "PROVEEDOR→PROVEEDOR",
      "CONDICION_PAGO→CONDICION_PAGO",
      "USUARIO_ULT_MOD",
      "FECHA_VENCE",
      "NoteExistsFlag",
      "RecordDate",
      "RowPointer"
    ]
  },
  "DES_BON_PAQUETE": {
    "pk": "PAQUETE",
    "cols": [
      "PAQUETE",
      "DESCRIPCION",
      "ACTIVO",
      "FECHA_DESDE",
      "FECHA_HASTA",
      "APLICA_TODA_TIENDA",
      "APLICA_TODA_RUTA",
      "APLICA_A_FA"
    ]
  },
  "DESPACHO": {
    "pk": "DESPACHO",
    "cols": [
      "DESPACHO",
      "CONSECUTIVO→CONSECUTIVO_FA",
      "CLIENTE→CLIENTE",
      "AUDIT_TRANS_INV→AUDIT_TRANS_INV",
      "TIPO_PAGO→TIPO_PAGO",
      "FECHA",
      "ESTADO",
      "FCH_HORA_CREACION"
    ]
  },
  "DET_TRANS_CB": {
    "pk": "CONSECUTIVO",
    "cols": [
      "CONSECUTIVO",
      "CUENTA_ORIGEN→TRANSFERENCIA_CB",
      "TIPO_ORIGEN→TRANSFERENCIA_CB",
      "NUMERO_ORIGEN→TRANSFERENCIA_CB",
      "ENTIDAD_FINANCIERA→ENTIDAD_FINANCIERA",
      "MONEDA→MONEDA",
      "METODO_PAGO→METODO_PAGO",
      "CUENTA_DESTINO"
    ]
  },
  "ESTADO_ACTIVO": {
    "pk": "ESTADO_ACTIVO",
    "cols": [
      "ESTADO_ACTIVO",
      "DESCRIPCION",
      "NoteExistsFlag",
      "RecordDate",
      "RowPointer",
      "CreatedBy",
      "UpdatedBy",
      "CreateDate"
    ]
  },
  "EXISTENCIA_LOTE": {
    "pk": "BODEGA",
    "cols": [
      "BODEGA→LOCALIZACION",
      "ARTICULO→LOTE",
      "LOCALIZACION→LOCALIZACION",
      "LOTE→LOTE",
      "CANT_DISPONIBLE",
      "CANT_RESERVADA",
      "CANT_NO_APROBADA",
      "CANT_VENCIDA"
    ]
  },
  "EXISTENCIA_SERIE": {
    "pk": "BODEGA",
    "cols": [
      "BODEGA→LOCALIZACION",
      "LOTE→LOTE",
      "LOCALIZACION→LOCALIZACION",
      "ARTICULO→LOTE",
      "TIPO",
      "SERIE_INICIAL",
      "SERIE_FINAL",
      "CANTIDAD"
    ]
  },
  "FACTURA_CANCELA": {
    "pk": "TIPO_DOCUMENTO",
    "cols": [
      "TIPO_DOCUMENTO→FACTURA",
      "FACTURA→FACTURA",
      "USUARIO",
      "CAJA→CAJA",
      "ENTIDAD_FINANCIERA→ENTIDAD_FINANCIERA",
      "TIPO_TARJETA",
      "NUMERO_PAGO",
      "TIPO"
    ]
  },
  "FORMA_PAGO_COMPRA": {
    "pk": "CODIGO",
    "cols": [
      "CODIGO",
      "NoteExistsFlag",
      "RecordDate",
      "RowPointer",
      "CreatedBy",
      "UpdatedBy",
      "CreateDate",
      "DESCRIPCION"
    ]
  },
  "LIQUIDAC_GASTO": {
    "pk": "LIQUIDAC_COMPRA",
    "cols": [
      "LIQUIDAC_COMPRA→LIQUIDAC_COMPRA",
      "MONEDA→MONEDA",
      "NIT→NIT",
      "ARTICULO→ARTICULO",
      "EMBARQUE→EMBARQUE",
      "GASTO_COMPRA",
      "LINEA_GASTO",
      "DESCRIPCION"
    ]
  },
  "MODALIDAD_SERVICIO": {
    "pk": "MODALIDAD_SERVICIO",
    "cols": [
      "MODALIDAD_SERVICIO",
      "NoteExistsFlag",
      "RecordDate",
      "RowPointer",
      "CreatedBy",
      "UpdatedBy",
      "CreateDate",
      "DESCRIPCION"
    ]
  },
  "NATURALEZA_OPERACION": {
    "pk": "CODIGO",
    "cols": [
      "CODIGO",
      "NoteExistsFlag",
      "RecordDate",
      "RowPointer",
      "CreatedBy",
      "UpdatedBy",
      "CreateDate",
      "DESCRIPCION"
    ]
  }
};

export const SFLPRISMA_INTEGRATIONS = [];
