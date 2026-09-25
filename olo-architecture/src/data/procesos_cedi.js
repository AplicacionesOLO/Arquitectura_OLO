// ═══════════════════════════════════════════════════════════════════════════
// DATOS · PROCESOS CEDI (CEDI-01–CEDI-14) — fichas de los procedimientos operativos
// Generado desde los documentos fuente (procedimientos, manuales y drawio) junto
// con supabase_procesos_cedi_seed.sql — ambos deben mantenerse en sincronía.
// Fuentes: 14 procedimientos (Procesos/*.docx), 10 manuales de usuario
// (Manuales/*.docx), Diagramas de Flujo.drawio (1 página por proceso) y el
// catálogo real de tablas eFlow (efw_constants.js) / Torre de Control (wmh_cr.js).
// Cada ficha se liga a su nodo de Procesos por procesos_nodes.codigo.
// ═══════════════════════════════════════════════════════════════════════════

export const PROCESOS_CEDI_ORDEN = ["CEDI-11", "CEDI-12", "CEDI-13", "CEDI-01", "CEDI-02", "CEDI-05", "CEDI-06", "CEDI-07", "CEDI-08", "CEDI-10", "CEDI-04", "CEDI-09", "CEDI-03", "CEDI-14"];

export const PROCESOS_CEDI = {
 "CEDI-11": {
  "codigo": "CEDI-11",
  "num": 11,
  "nombre": "Almacenaje REPI",
  "nodo": "CEDI-11 · Almacenaje REPI",
  "compania": "COFERSA",
  "silo": "log_almacenaje",
  "siloLabel": "OL.2 · Almacenaje",
  "macro": "S1 · Acomodo (putaway)",
  "nodoExistente": "Almacenaje REPI",
  "objetivo": "Establecer el procedimiento de recepción, ubicación y reposición de la mercancía en las zonas de almacenaje y picking.",
  "alcance": "Aplica desde la recepción del producto hasta su reposición en la zona de picking por parte del apilador.",
  "responsables": [
   "Personal de recepción",
   "apiladores",
   "Torre de Control"
  ],
  "pasos": [
   {
    "texto": "Ingresar al sistema WMS con usuario, contraseña e información extra del encargado",
    "sistema": "handheld",
    "pantalla": "eWMS - CEDI OLO (menú principal)"
   },
   {
    "texto": "El proveedor entrega el producto; recepción verifica referencias y cantidad y valida a qué cliente pertenece",
    "sistema": "fisico",
    "pantalla": null
   },
   {
    "texto": "Recepción valida el producto y lo ubica a nivel de sistema en una zona de almacenaje",
    "sistema": "eflow",
    "pantalla": null
   },
   {
    "texto": "Con picking en nivel mínimo el sistema genera la reposición; si es pedido extraordinario, traslado directo a picking",
    "sistema": "eflow",
    "pantalla": "Control > Acciones de Trabajo"
   },
   {
    "texto": "El apilador espera la solicitud de reposición; para Cofersa, Torre de Control genera la acción correspondiente",
    "sistema": "handheld",
    "pantalla": "Picking, despacho y reposiciones > Trabajo automático"
   },
   {
    "texto": "Una vez asignada la reposición, el apilador ubica el artículo en la posición indicada",
    "sistema": "fisico",
    "pantalla": null
   },
   {
    "texto": "Validar que la cantidad y el artículo correspondan exactamente a lo solicitado por el sistema",
    "sistema": "handheld",
    "pantalla": "Ubicación de Palet"
   },
   {
    "texto": "En el handheld leer la ubicación de almacenaje, la cantidad y el código del artículo",
    "sistema": "handheld",
    "pantalla": "Ubicación de Palet (Leer ubicación origen)"
   },
   {
    "texto": "Colocar el producto en la ubicación temporal (ej. ASCEN01-C001-N01-1)",
    "sistema": "fisico",
    "pantalla": null
   },
   {
    "texto": "En paralelo, consultar en WMS el detalle de cada reposición pendiente para planificar la carga de trabajo",
    "sistema": "eflow",
    "pantalla": "Control > Acciones de Trabajo (filtro Tipo/Trabajo = REPI)"
   }
  ],
  "registros": [
   "Acciones de trabajo generadas en WMS."
  ],
  "noConformidades": [
   "Envío de una cantidad incorrecta por parte del apilador.",
   "Mezcla de cajas similares.",
   "Fallo en la ubicación de destino (puede no corresponder a la ubicación principal)."
  ],
  "pantallas": [
   {
    "sistema": "handheld",
    "ruta": "eWMS - CEDI OLO (menú principal)",
    "uso": "Acceso con usuario, recurso y almacén; selección del módulo Picking, despacho y reposiciones"
   },
   {
    "sistema": "handheld",
    "ruta": "Picking, despacho y reposiciones > Trabajo automático",
    "uso": "El apilador espera y recibe la reposición asignada por el sistema"
   },
   {
    "sistema": "handheld",
    "ruta": "Ubicación de Palet",
    "uso": "Muestra Origen, Palet, Destino, Cód. Artículo, Artículo Ref, Clasif 1, Cant, Acción, Documento y Cliente; se lee la ubicación origen"
   },
   {
    "sistema": "eflow",
    "ruta": "Control > Acciones de Trabajo",
    "uso": "Listado de acciones con contadores (Acciones, Atendiendo, Disponibles, Bloqueadas, Problema); columnas Compañía, Pallet, Prioridad, Artículo, Tipo/Trabajo, Ubicación Origen, Trabajo Situación, Ubicación Destino; filtro por Tipo/Trabajo REPI"
   }
  ],
  "tablas": [
   {
    "schema": "efw",
    "tabla": "RECEPCIONESCABECERA",
    "motivo": "Recepción del producto entregado por el proveedor (IDPROVEEDOR, IDRECEPCION)",
    "confianza": "alta"
   },
   {
    "schema": "efw",
    "tabla": "RECEPCIONESDETALLE",
    "motivo": "Líneas recibidas por artículo (IDARTICULO, IDRECEPCIONLINEA) verificadas por recepción",
    "confianza": "alta"
   },
   {
    "schema": "efw",
    "tabla": "ARTICULOSZONAALMACENAJE",
    "motivo": "Zona de almacenaje asignada al artículo (IDZONAALMACENAJE, UNIDADESMINIMASZONA)",
    "confianza": "alta"
   },
   {
    "schema": "efw",
    "tabla": "ARTICULOSZONAPICKING",
    "motivo": "Nivel mínimo en picking que dispara la reposición (UNIDADESMINIMASPICKING, IDUBICACION)",
    "confianza": "alta"
   },
   {
    "schema": "efw",
    "tabla": "ALMACENAMIENTOSUBICACIONES",
    "motivo": "Ubicaciones de almacenaje y picking (IDZONAALMACENAJE, IDZONAPICKING)",
    "confianza": "alta"
   },
   {
    "schema": "efw",
    "tabla": "NECESITA_REPI",
    "motivo": "Cálculo de artículos que requieren reposición a picking",
    "confianza": "media"
   },
   {
    "schema": "efw",
    "tabla": "REPI_SELECCION",
    "motivo": "Selección de reposiciones a generar",
    "confianza": "media"
   },
   {
    "schema": "efw",
    "tabla": "REPOSICIONZONAS",
    "motivo": "Configuración de reposición entre zonas de almacenaje y picking",
    "confianza": "media"
   },
   {
    "schema": "efw",
    "tabla": "MONITORACCIONES",
    "motivo": "Acciones de trabajo (Tipo/Trabajo REPI) consultadas en Control > Acciones de Trabajo y asignadas al handheld",
    "confianza": "media"
   },
   {
    "schema": "efw",
    "tabla": "EXPEDICION_GENERADO_REPI",
    "motivo": "Reposiciones generadas por el sistema",
    "confianza": "media"
   },
   {
    "schema": "efw",
    "tabla": "INVENTARIO_RESERVADO_REPI",
    "motivo": "Inventario reservado para una reposición en curso",
    "confianza": "media"
   },
   {
    "schema": "efw",
    "tabla": "ZONAINTERCAMBIO_REPI",
    "motivo": "Zona intermedia de la reposición (ubicación temporal de ascensor)",
    "confianza": "media"
   },
   {
    "schema": "efw",
    "tabla": "CONTENEDOR",
    "motivo": "Palet leído en la pantalla Ubicación de Palet (IDCONTENEDOR, IDUBICACION)",
    "confianza": "alta"
   },
   {
    "schema": "efw",
    "tabla": "ALMACENMOVIMIENTOS",
    "motivo": "Registro del movimiento de la reposición en el WMS",
    "confianza": "media"
   }
  ],
  "datosClave": [
   "Proveedor y producto recibido",
   "Referencia y cantidad verificadas",
   "Cliente propietario (Cofersa)",
   "Zona de almacenaje asignada",
   "Nivel mínimo de picking",
   "Número de acción de trabajo",
   "Tipo de trabajo (REPI)",
   "Ubicación origen",
   "Palet",
   "Ubicación destino / temporal (ASCEN1)",
   "Código de artículo y referencia",
   "Cantidad",
   "Prioridad",
   "Situación del trabajo (DISP / TERM)"
  ],
  "conceptos": [
   {
    "termino": "REPI",
    "definicion": "Tipo de trabajo de reposición: mueve mercancía de almacenaje hacia picking pasando por la ubicación temporal (ascensor)"
   },
   {
    "termino": "UBCO",
    "definicion": "Tipo de trabajo de ubicación: el apilador lleva el palet desde la ubicación temporal (ASCEN1) a su ubicación de almacenaje definitiva"
   },
   {
    "termino": "PICK",
    "definicion": "Tipo de trabajo de picking (alisto) de pedidos"
   },
   {
    "termino": "EXES",
    "definicion": "Tipo de trabajo de expedición tipo picking en altura, atendido por apiladores"
   },
   {
    "termino": "EXCO",
    "definicion": "Tipo de trabajo de expedición de tarima completa, atendido por un apilador"
   },
   {
    "termino": "UBRE",
    "definicion": "Tipo de trabajo que aparece en el filtro Tipo/Trabajo de Acciones de Trabajo (sin definición en los manuales)"
   },
   {
    "termino": "Reposición",
    "definicion": "Movimiento automático de mercancía de almacenaje a picking cuando el disponible en picking llega al mínimo"
   },
   {
    "termino": "Pedido extraordinario",
    "definicion": "Pedido especial que se atiende con un traslado directo a la zona de picking"
   },
   {
    "termino": "Ubicación temporal de ascensor",
    "definicion": "Ubicación intermedia (ej. ASCEN01-C001-N01-1) donde el apilador deja el producto repuesto"
   },
   {
    "termino": "Acciones de Trabajo",
    "definicion": "Pantalla de Control en eFlow que lista las acciones pendientes y atendidas por tipo de trabajo"
   }
  ],
  "entradaDe": [],
  "salidaA": [
   "CEDI-12",
   "CEDI-13",
   "CEDI-05"
  ],
  "notas": [
   "SIPOC: proveedor Personal de Recepción; entrada producto recibido y necesidad de reposición; salida artículo repuesto en la zona de picking; cliente Cofersa; indicador por definir.",
   "La solicitud de reposición proviene del Sistema WMS o del Sistema Torre de Control (automática o extraordinaria).",
   "Para Cofersa, el cliente proporciona los datos de reposición a Torre de Control, que genera la acción de trabajo y la asigna al apiladorista.",
   "El apilador accede en el handheld al módulo 'Picking, despacho y reposiciones' > 'Trabajo automático' y espera a que el sistema cargue la reposición.",
   "Acciones de Trabajo muestra contadores Acciones, Atendiendo, Disponibles, Bloqueadas y Problema, y botones Modificar acciones y Anular acciones.",
   "El filtro Tipo/Trabajo ofrece los valores EXES, PICK, REPI, UBCO y UBRE; la situación del trabajo aparece como DISP o TERM.",
   "En las capturas, las acciones REPI van de racks (RCL…) hacia la ubicación temporal ASCEN1-C001.",
   "La consulta de reposiciones pendientes es informativa: indica cuánto trabajo pendiente hay y sirve para organizar el alisto."
  ],
  "decisiones": [
   "¿Producto correcto? No → reportar inconsistencia; Sí → recepcionar a nivel de sistema y asignar zona de almacenaje",
   "¿Se necesita reposición? (cantidad mínima en picking) Sí → generar solicitud y traslado a picking; No → continuar almacenamiento",
   "¿Artículo y cantidad son correctos? No → corregir o reportar inconsistencia; Sí → escanear ubicación y artículo y confirmar en handheld"
  ],
  "relacionados": [
   {
    "silo": "log_almacenaje",
    "nombre": "S3 · Reabastecimiento a picking"
   }
  ],
  "documentos": [
   {
    "tipo": "procedimiento",
    "titulo": "Procedimiento",
    "archivo": "P11 - Almacenaje REPI.docx",
    "path": "procedimientos/P11 - Almacenaje REPI.docx"
   },
   {
    "tipo": "manual",
    "titulo": "Manual de usuario",
    "archivo": "Manual - Almacenaje REPI.docx",
    "path": "manuales/P11 - Manual Almacenaje REPI.docx"
   }
  ]
 },
 "CEDI-12": {
  "codigo": "CEDI-12",
  "num": 12,
  "nombre": "Almacenaje UBCO",
  "nodo": "CEDI-12 · Almacenaje UBCO",
  "compania": "COFERSA",
  "silo": "log_almacenaje",
  "siloLabel": "OL.2 · Almacenaje",
  "macro": "S3 · Reabastecimiento a picking",
  "nodoExistente": "Almacenaje UBCO",
  "objetivo": "Establecer el procedimiento para la atención de las reposiciones generadas hacia las zonas de almacenaje definitivo.",
  "alcance": "Aplica desde la selección de la reposición pendiente hasta la ubicación final del artículo en la zona de almacenaje.",
  "responsables": [
   "Apiladores"
  ],
  "pasos": [
   {
    "texto": "Ingresar al sistema WMS con usuario, contraseña e información extra del encargado",
    "sistema": "eflow",
    "pantalla": "Ingreso eFlow (usuario, contraseña y almacén)"
   },
   {
    "texto": "En WMS ir a Control > Acciones de Trabajo y filtrar por tipo de trabajo las reposiciones pendientes de almacenaje",
    "sistema": "eflow",
    "pantalla": "Control > Acciones de Trabajo (filtro Tipo/Trabajo)"
   },
   {
    "texto": "Seleccionar la reposición a atender y asignarle prioridad; recepción notifica antes los pedidos extraordinarios",
    "sistema": "eflow",
    "pantalla": "Control > Acciones de Trabajo"
   },
   {
    "texto": "Esperar a que el sistema asigne la reposición en el handheld",
    "sistema": "handheld",
    "pantalla": "Picking, despacho y reposiciones > Trabajo automático"
   },
   {
    "texto": "Validar que el palet, el artículo y la cantidad indicados sean correctos",
    "sistema": "handheld",
    "pantalla": "Ubicación de Palet"
   },
   {
    "texto": "Tomar el artículo y escanear el palet: si es correcto se marca en verde, si no, no permite continuar",
    "sistema": "handheld",
    "pantalla": "Ubicación de Palet"
   },
   {
    "texto": "Ubicar la zona de almacenaje correspondiente al artículo",
    "sistema": "fisico",
    "pantalla": null
   },
   {
    "texto": "Escanear el código de la ubicación requerida para finalizar el proceso",
    "sistema": "handheld",
    "pantalla": "Ubicación de Palet"
   },
   {
    "texto": "Colocar el artículo junto a otros de la misma referencia, manteniendo el orden de la zona",
    "sistema": "fisico",
    "pantalla": null
   },
   {
    "texto": "Al finalizar, el sistema asigna automáticamente el siguiente producto por atender",
    "sistema": "handheld",
    "pantalla": "Picking, despacho y reposiciones > Trabajo automático"
   }
  ],
  "registros": [
   "Validaciones registradas en el handheld."
  ],
  "noConformidades": [
   "No verificar correctamente la cantidad o la referencia del artículo.",
   "Ubicación física incorrecta del producto."
  ],
  "pantallas": [
   {
    "sistema": "eflow",
    "ruta": "Control > Acciones de Trabajo",
    "uso": "Filtrar por Tipo/Trabajo (UBCO, REPI…) y Compañía; seleccionar la acción y asignar prioridad (Modificar acciones)"
   },
   {
    "sistema": "handheld",
    "ruta": "eWMS - CEDI OLO (menú principal)",
    "uso": "Ingreso con usuario y contraseña; módulo Picking, despacho y reposiciones"
   },
   {
    "sistema": "handheld",
    "ruta": "Picking, despacho y reposiciones > Trabajo automático",
    "uso": "Espera y recepción de la reposición asignada"
   },
   {
    "sistema": "handheld",
    "ruta": "Ubicación de Palet",
    "uso": "Muestra Origen (ej. ASCEN1-C001-N01-1), Palet, Destino, Cód. Artículo, Artículo Ref, Clasif 1, Cant y Acción; lectura de palet y ubicación"
   }
  ],
  "tablas": [
   {
    "schema": "efw",
    "tabla": "MONITORACCIONES",
    "motivo": "Acciones de trabajo pendientes filtradas por tipo y priorizadas en Control > Acciones de Trabajo",
    "confianza": "media"
   },
   {
    "schema": "efw",
    "tabla": "MONITORACCION_PROBLEMA_MOTIVO",
    "motivo": "Motivos de acciones en situación Problema mostradas en el contador de la pantalla",
    "confianza": "media"
   },
   {
    "schema": "efw",
    "tabla": "CONTENEDOR",
    "motivo": "Palet escaneado y su ubicación actualizada (IDCONTENEDOR, IDUBICACION)",
    "confianza": "alta"
   },
   {
    "schema": "efw",
    "tabla": "CONTENEDORARTICULOS",
    "motivo": "Artículo y cantidad contenidos en el palet validado (IDARTICULO, IDCONTENEDOR)",
    "confianza": "alta"
   },
   {
    "schema": "efw",
    "tabla": "ARTICULOSZONAALMACENAJE",
    "motivo": "Zona de almacenaje correspondiente al artículo (IDZONAALMACENAJE, IDUBICACIONREFERENCIA1)",
    "confianza": "alta"
   },
   {
    "schema": "efw",
    "tabla": "ZONAALMACENAJE",
    "motivo": "Zonas de almacenaje definitivo (IDZONAALMACENAJE, DESCRIPCION)",
    "confianza": "alta"
   },
   {
    "schema": "efw",
    "tabla": "ALMACENAMIENTOSUBICACIONES",
    "motivo": "Ubicación destino escaneada para finalizar (IDZONAALMACENAJE)",
    "confianza": "alta"
   },
   {
    "schema": "efw",
    "tabla": "INVENTARIO_UBICADO_PALET",
    "motivo": "Inventario por palet y ubicación tras el almacenaje",
    "confianza": "media"
   },
   {
    "schema": "efw",
    "tabla": "ALMACENMOVIMIENTOS",
    "motivo": "Movimiento de ubicación registrado al finalizar el almacenaje",
    "confianza": "media"
   }
  ],
  "datosClave": [
   "Tipo de trabajo (UBCO)",
   "Número de acción",
   "Prioridad",
   "Compañía",
   "Palet",
   "Ubicación origen (ASCEN1)",
   "Ubicación destino",
   "Código de artículo y referencia",
   "Cantidad",
   "Clasificación 1",
   "Situación del trabajo (DISP / TERM)",
   "Cantidad solicitada en pedidos extraordinarios"
  ],
  "conceptos": [
   {
    "termino": "REPI",
    "definicion": "Tipo de trabajo de reposición: mueve mercancía de almacenaje hacia picking pasando por la ubicación temporal (ascensor)"
   },
   {
    "termino": "UBCO",
    "definicion": "Tipo de trabajo de ubicación: el apilador lleva el palet desde la ubicación temporal (ASCEN1) a su ubicación de almacenaje definitiva"
   },
   {
    "termino": "PICK",
    "definicion": "Tipo de trabajo de picking (alisto) de pedidos"
   },
   {
    "termino": "EXES",
    "definicion": "Tipo de trabajo de expedición tipo picking en altura, atendido por apiladores"
   },
   {
    "termino": "EXCO",
    "definicion": "Tipo de trabajo de expedición de tarima completa, atendido por un apilador"
   },
   {
    "termino": "UBRE",
    "definicion": "Tipo de trabajo que aparece en el filtro Tipo/Trabajo de Acciones de Trabajo (sin definición en los manuales)"
   },
   {
    "termino": "Almacenaje definitivo",
    "definicion": "Ubicación final del artículo en la zona de almacenaje, junto a artículos de la misma referencia"
   },
   {
    "termino": "Validación en verde",
    "definicion": "Indicación del handheld de que el palet escaneado es el correcto; si no, el sistema no permite continuar"
   },
   {
    "termino": "Prioridad",
    "definicion": "Valor asignado a la acción en Acciones de Trabajo para ordenar su atención"
   }
  ],
  "entradaDe": [
   "CEDI-11"
  ],
  "salidaA": [],
  "notas": [
   "SIPOC: proveedor Apilador; entrada reposición pendiente de almacenaje (Sistema WMS) y notificación de pedido extraordinario (Área de Recepción); salida artículo en ubicación definitiva; cliente Cofersa.",
   "Las acciones UBCO se originan en la ubicación temporal ASCEN1-C001-N01-… y tienen destino en racks (RCL…) o mesanín (MZ…).",
   "Acciones de Trabajo permite filtrar por Compañía (ej. 0029, 0109, 0110) y por Tipo/Trabajo (EXES, PICK, REPI, UBCO, UBRE).",
   "La captura del manual para el filtro está rotulada 'Tipo/Trabajo (REPI)' aunque en la pantalla se resalta UBCO.",
   "En el procedimiento el responsable es el Apilador; en el diagrama los carriles son Sistema, Recepción y Alistador.",
   "El registro generado son las validaciones en el handheld."
  ],
  "decisiones": [
   "¿Es un pedido extraordinario? Sí → recepción informa que es pedido especial y la cantidad requerida; No → continuar proceso",
   "¿La información es correcta? (palet, artículo, cantidad) No → el sistema no permite validar; Sí → escanear palet (verde) y tomar el artículo",
   "¿Hay otra reposición? Sí → el sistema asigna automáticamente otro producto; No → fin"
  ],
  "relacionados": [
   {
    "silo": "log_almacenaje",
    "nombre": "S1 · Acomodo (putaway)"
   },
   {
    "silo": "log_almacenaje",
    "nombre": "S2 · Gestión de ubicaciones"
   }
  ],
  "documentos": [
   {
    "tipo": "procedimiento",
    "titulo": "Procedimiento",
    "archivo": "P12 - Almacenaje UBCO.docx",
    "path": "procedimientos/P12 - Almacenaje UBCO.docx"
   },
   {
    "tipo": "manual",
    "titulo": "Manual de usuario",
    "archivo": "Manual - Almacenaje UBCO.docx",
    "path": "manuales/P12 - Manual Almacenaje UBCO.docx"
   }
  ]
 },
 "CEDI-13": {
  "codigo": "CEDI-13",
  "num": 13,
  "nombre": "Traslado libre",
  "nodo": "CEDI-13 · Traslado libre",
  "compania": "CEDI",
  "silo": "log_almacenaje",
  "siloLabel": "OL.2 · Almacenaje",
  "macro": "S2 · Gestión de ubicaciones",
  "nodoExistente": "Traslado libre",
  "objetivo": "Establecer el procedimiento para el traslado de mercancía extraordinaria o sobrante desde el área de almacenaje hacia el mesanín.",
  "alcance": "Aplica a los pedidos extraordinarios o a los sobrantes de tarima que deban liberar una zona de almacenaje, así como a los artículos de gran tamaño o peso gestionados directamente en el mesanín.",
  "responsables": [
   "Apiladores",
   "personal de inventario"
  ],
  "pasos": [
   {
    "texto": "Ingresar al sistema WMS con usuario, contraseña e información extra del encargado",
    "sistema": "handheld",
    "pantalla": "eWMS - CEDI OLO (menú principal)"
   },
   {
    "texto": "El apilador ingresa el producto en la ubicación del ascensor",
    "sistema": "fisico",
    "pantalla": null
   },
   {
    "texto": "Colocar la mercancía para su traslado al mesanín",
    "sistema": "fisico",
    "pantalla": null
   },
   {
    "texto": "Si es un palet, escanearlo y realizar la ubicación directamente en la zona de picking",
    "sistema": "handheld",
    "pantalla": null
   },
   {
    "texto": "Si es consulta: en Consulta de Inventario filtrar y copiar la ubicación; se muestran los artículos de la zona temporal",
    "sistema": "eflow",
    "pantalla": "Inventario > Consulta de Inventario"
   }
  ],
  "registros": [
   "Consultas de inventario por ubicación."
  ],
  "noConformidades": [
   "Diferencias en las cajas del palet (faltantes, sobrantes o artículos incorrectos) por error de envío."
  ],
  "pantallas": [
   {
    "sistema": "eflow",
    "ruta": "Inventario > Consulta de Inventario",
    "uso": "Filtrar por ubicación y ver los artículos presentes en la zona temporal (ascensor)"
   },
   {
    "sistema": "handheld",
    "ruta": "Escaneo de palet y ubicación",
    "uso": "Escanear el palet y registrar su ubicación directa en la zona de picking"
   }
  ],
  "tablas": [
   {
    "schema": "efw",
    "tabla": "INVENTARIO_UBICADO",
    "motivo": "Inventario por ubicación consultado en Consulta de Inventario",
    "confianza": "media"
   },
   {
    "schema": "efw",
    "tabla": "INVENTARIO_UBICADO_PALET",
    "motivo": "Palets y artículos presentes en la ubicación temporal consultada",
    "confianza": "media"
   },
   {
    "schema": "efw",
    "tabla": "CONTENEDOR",
    "motivo": "Palet escaneado y reubicado (IDCONTENEDOR, IDUBICACION)",
    "confianza": "alta"
   },
   {
    "schema": "efw",
    "tabla": "ALMACENAMIENTOSUBICACIONES",
    "motivo": "Ubicación destino en zona de picking (IDZONAPICKING)",
    "confianza": "alta"
   },
   {
    "schema": "efw",
    "tabla": "ZONAPICKING",
    "motivo": "Zona de picking a la que se traslada el palet (IDZONAPICKING, DESCRIPCION)",
    "confianza": "alta"
   },
   {
    "schema": "efw",
    "tabla": "TRASLADO_INTERNO_CONF",
    "motivo": "Configuración de traslados internos entre ubicaciones",
    "confianza": "media"
   },
   {
    "schema": "efw",
    "tabla": "TIPO_TRASLADOS",
    "motivo": "Tipos de traslado disponibles en el WMS",
    "confianza": "media"
   },
   {
    "schema": "efw",
    "tabla": "ALMACENMOVIMIENTOS",
    "motivo": "Registro del movimiento de traslado",
    "confianza": "media"
   }
  ],
  "datosClave": [
   "Motivo del traslado (pedido extraordinario, sobrante de tarima, liberar zona)",
   "Palet",
   "Ubicación de ascensor (temporal)",
   "Ubicación destino en picking / mesanín",
   "Artículos y cantidades en la zona temporal",
   "Cantidad de cajas del palet"
  ],
  "conceptos": [
   {
    "termino": "Traslado libre",
    "definicion": "Movimiento de mercancía extraordinaria o sobrante desde almacenaje hacia el mesanín o picking"
   },
   {
    "termino": "Mesanín",
    "definicion": "Nivel superior del almacén al que se traslada la mercancía"
   },
   {
    "termino": "Ubicación de ascensor",
    "definicion": "Ubicación temporal donde se deja la mercancía para subirla al mesanín"
   },
   {
    "termino": "Sobrante de tarima",
    "definicion": "Remanente de una tarima que se traslada para liberar una zona de almacenaje"
   },
   {
    "termino": "Consulta de Inventario",
    "definicion": "Opción de eFlow para ver los artículos presentes en una ubicación"
   }
  ],
  "entradaDe": [
   "CEDI-11"
  ],
  "salidaA": [
   "CEDI-05"
  ],
  "notas": [
   "No existe manual de usuario para este proceso; la información proviene del procedimiento, el diagrama y las notas de campo.",
   "Motivos del traslado según el diagrama: pedido extraordinario, sobrante en una tarima o eliminar una zona de almacenaje.",
   "Diagrama: el traslado hacia mesanín pasa por la ubicación temporal de ascensor; el almacenaje en bodega normal (gran tamaño o peso) no pasa por ella y se traslada directo a su ubicación.",
   "Las notas de campo refieren la consulta como 'Inventario dentro de WHS'.",
   "Carriles del diagrama: Sistema y Apilador.",
   "Errores: diferencias en las cajas del palet por error de envío (faltantes, sobrantes o artículos incorrectos)."
  ],
  "decisiones": [
   "¿Por qué se realiza el traslado libre? Pedido extraordinario / sobrante en una tarima / eliminar una zona de almacenaje",
   "Validar el palet: caso palet → escanear y ubicar en zona de picking; caso consulta → Consulta de Inventario por ubicación"
  ],
  "relacionados": [],
  "documentos": [
   {
    "tipo": "procedimiento",
    "titulo": "Procedimiento",
    "archivo": "P13 - Traslado libre.docx",
    "path": "procedimientos/P13 - Traslado libre.docx"
   }
  ]
 },
 "CEDI-01": {
  "codigo": "CEDI-01",
  "num": 1,
  "nombre": "Torre de Control Cofersa",
  "nodo": "CEDI-01 · Torre de Control Cofersa",
  "compania": "COFERSA",
  "silo": "log_preparacion",
  "siloLabel": "OL.3 · Preparación de pedidos",
  "macro": "S2 · Picking por pedido, lote o zona",
  "nodoExistente": "Torre de control Cofersa",
  "objetivo": "Establecer la metodología para gestionar y priorizar el alistamiento de los pedidos de la compañía Cofersa, mediante el uso conjunto del sistema eFLOW y la aplicación Torre de Control, con el fin de garantizar el despacho oportuno de las rutas del Gran Área Metropolitana (GAM) y de las rutas rurales.",
  "alcance": "Este procedimiento aplica a las operaciones de alistamiento de pedidos de Cofersa que se procesan mediante banda transportadora y mesanín. No aplica a Ferretería EPA, dado que esta compañía no cuenta con banda transportadora ni con sección de mesanín.",
  "responsables": [
   "Encargado de Torre de Control (Alistó)",
   "Personal de despacho"
  ],
  "pasos": [
   {
    "texto": "Trabajar diariamente respetando el horario de corte: 3:30 p. m. rutas GAM y 5:30 p. m. rutas rurales",
    "sistema": "fisico",
    "pantalla": null
   },
   {
    "texto": "Ingresar a eFLOW WMS con las credenciales del encargado (conexión y almacén 0001 - CEDI OLO)",
    "sistema": "eflow",
    "pantalla": "Ingreso eFlow 3.2.8.5"
   },
   {
    "texto": "Dirigirse al módulo Documentos > Órdenes de Expedición",
    "sistema": "eflow",
    "pantalla": "Documentos > Ordenes de Expedición (pestaña Salidas)"
   },
   {
    "texto": "Filtrar por Situación = Disponible y Compañía = Cofersa",
    "sistema": "eflow",
    "pantalla": "Expediciones (Salidas) > Filtro > Selección de criterios"
   },
   {
    "texto": "Identificar las rutas del día: GAM todos los días; rurales según programación",
    "sistema": "eflow",
    "pantalla": "Expediciones (Salidas) > fila de filtro columna Ruta"
   },
   {
    "texto": "En la pestaña Salida enviar los pedidos vía Torre de Control (mesanín debe pasar por la banda de su ruta y muelle)",
    "sistema": "eflow",
    "pantalla": "Documentos > Ordenes de Expedición (pestaña Salidas)"
   },
   {
    "texto": "Ingresar a Torre de Control con las credenciales del encargado",
    "sistema": "torre",
    "pantalla": "/login"
   },
   {
    "texto": "Crear el viaje: Nuevo Viaje con almacén OLO, compañía Cofersa y ruta; primero rurales y luego GAM",
    "sistema": "torre",
    "pantalla": "Dashboard > Nuevo Viaje (/documents/trips)"
   },
   {
    "texto": "Regresar a eFLOW y verificar prioridad, banda asignada y número de viaje generados automáticamente",
    "sistema": "eflow",
    "pantalla": "Expediciones (Salidas) > Refrescar"
   },
   {
    "texto": "Ingresar a Control > Acciones de Trabajo, filtrar Situación de Trabajo = Disponible y Compañía = Cofersa; Consultar",
    "sistema": "eflow",
    "pantalla": "Control > Acciones de Trabajo (pestaña Acciones)"
   },
   {
    "texto": "Generar desde la pestaña Acciones los pedidos resultantes para iniciar su alistamiento",
    "sistema": "eflow",
    "pantalla": "Control > Acciones de Trabajo (pestaña Acciones)"
   },
   {
    "texto": "Repetir por cada ruta sin mezclarlas, salvo que la observación del pedido lo permita",
    "sistema": "torre",
    "pantalla": null
   },
   {
    "texto": "Gestionar material pesado de Zona 1 / Zona 2; todo viaje de pesado se asigna a la puerta 29",
    "sistema": "torre",
    "pantalla": "Dashboard > Detalles > ⋮ > Cambiar muelle"
   },
   {
    "texto": "Registrar los viajes del día en el Excel de control, imprimirlo y entregarlo a Empaque y Despacho",
    "sistema": "excel_drive",
    "pantalla": null
   },
   {
    "texto": "Continuar con el siguiente viaje: revisar rutas pendientes en el detalle del viaje en Torre de Control",
    "sistema": "torre",
    "pantalla": "Dashboard > Detalles"
   },
   {
    "texto": "Agregar rutas pendientes con Detalles > Agregar Órdenes, filtrando por almacén y ruta",
    "sistema": "torre",
    "pantalla": "Dashboard > Detalles > ⋮ > Agregar órdenes"
   },
   {
    "texto": "Verificar que las expediciones no tengan cambio de ruta/dirección ni sean órdenes del pasado (van en viaje aparte)",
    "sistema": "torre",
    "pantalla": "Viaje# > Agregar Órdenes (columnas Observaciones, Fecha de Creación/Entrega)"
   },
   {
    "texto": "Seleccionar las expediciones, presionar Añadir y asignar prioridad alta para ordenarlas en Acciones de eFLOW",
    "sistema": "torre",
    "pantalla": "Viaje# > Agregar Órdenes > Añadir"
   },
   {
    "texto": "Distribuir al personal disponible entre las zonas de trabajo según la necesidad operativa",
    "sistema": "fisico",
    "pantalla": null
   },
   {
    "texto": "Verificar en Comparación Alistó vs Packing (compañía y fecha) que pedidas, preparadas y chequeadas coincidan 100 %",
    "sistema": "eflow",
    "pantalla": "Documentos > Comparat. Alisto vs Packing (pestaña EpackingAlisto)"
   },
   {
    "texto": "Revisar el Reporte de Palets Pendientes por Chequear (mesas superiores e inferiores) para asignar chequeadores",
    "sistema": "eflow",
    "pantalla": "Reportes > Rpt. Palets Pend x Chequear"
   },
   {
    "texto": "Reenviar el mismo día pedidos incompletos por stock: filtrar por compañía y viaje, generar acciones, prioridad alta",
    "sistema": "eflow",
    "pantalla": "Documentos > Ordenes de Expedición (pestaña Salidas)"
   },
   {
    "texto": "Revisar las rutas ocultas por el filtro de la pestaña Salida para confirmar que no tengan cambios de ruta pendientes",
    "sistema": "eflow",
    "pantalla": "Expediciones (Salidas) > filtro columna Ruta"
   }
  ],
  "registros": [
   "Excel de control diario de viajes.",
   "Reporte de comparación Alistó vs Packing.",
   "Reporte de palets pendientes por chequear."
  ],
  "noConformidades": [
   "Expediciones sin la observación de cambio de ruta, lo que ocasiona el envío a un destino incorrecto.",
   "Envío de una ruta a un destino erróneo por error humano.",
   "Envío de mercadería por la línea de producción sin pasar por Torre de Control, siendo este paso obligatorio para Cofersa.",
   "Intento de procesar un pedido de Cofersa con el procedimiento de EPA, lo cual genera error del sistema.",
   "Envío de pedidos fuera del horario de corte establecido, por falta de verificación oportuna."
  ],
  "pantallas": [
   {
    "sistema": "eflow",
    "ruta": "Ingreso eFlow 3.2.8.5",
    "uso": "Inicio de sesión (conexión, usuario, almacén 0001 - CEDI OLO)"
   },
   {
    "sistema": "eflow",
    "ruta": "Documentos > Ordenes de Expedición (pestaña Salidas)",
    "uso": "Consultar expediciones disponibles de Cofersa, filtrar rutas del día, verificar viaje/prioridad/banda, reenviar incompletos y revisar rutas ocultas"
   },
   {
    "sistema": "eflow",
    "ruta": "Control > Acciones de Trabajo (pestaña Acciones)",
    "uso": "Filtrar acciones disponibles de Cofersa y generar los pedidos para iniciar el alistamiento"
   },
   {
    "sistema": "eflow",
    "ruta": "Documentos > Comparat. Alisto vs Packing (pestaña EpackingAlisto)",
    "uso": "Validar que unidades pedidas, preparadas y chequeadas coincidan al 100 %"
   },
   {
    "sistema": "eflow",
    "ruta": "Reportes > Rpt. Palets Pend x Chequear",
    "uso": "Ver palets en mesas de chequeo (CHEQxx) por expedición y viaje WMH para asignar apoyo de chequeadores"
   },
   {
    "sistema": "torre",
    "ruta": "/login",
    "uso": "Inicio de sesión en Torre de Control"
   },
   {
    "sistema": "torre",
    "ruta": "Dashboard (/dashboard) - Operación en tiempo real (Viajes)",
    "uso": "Listado de viajes activos (#Viaje, #Muelle, ID Bajada, avance) y acceso a Detalles"
   },
   {
    "sistema": "torre",
    "ruta": "Dashboard > Nuevo Viaje (/documents/trips)",
    "uso": "Crear viaje filtrando almacén OLO, compañía COFERSA y ruta; Añadir y Crear"
   },
   {
    "sistema": "torre",
    "ruta": "Dashboard > Detalles > ⋮ > Agregar órdenes",
    "uso": "Agregar órdenes/rutas pendientes a un viaje existente y asignar prioridad alta"
   },
   {
    "sistema": "torre",
    "ruta": "Dashboard > Detalles > ⋮ > Cambiar muelle",
    "uso": "Asignar la puerta 29 a los viajes de material pesado"
   },
   {
    "sistema": "excel_drive",
    "ruta": "Excel de control diario de viajes",
    "uso": "Registrar, imprimir y entregar la información de los viajes del día a Empaque y Despacho"
   }
  ],
  "tablas": [
   {
    "schema": "efw",
    "tabla": "EXPEDICIONESCABECERA",
    "motivo": "Expediciones consultadas en Órdenes de Expedición; columnas PRIORIDAD y MUELLEEXPEDICION",
    "confianza": "alta"
   },
   {
    "schema": "efw",
    "tabla": "EXPEDICIONESDETALLE",
    "motivo": "Líneas de la expedición (artículo, pedidas, preparadas) vistas en el detalle expandido",
    "confianza": "alta"
   },
   {
    "schema": "efw",
    "tabla": "VIAJE_WMH",
    "motivo": "Número de viaje WMH que Torre de Control devuelve a eFLOW (campo NúmeroViaje WMH)",
    "confianza": "media"
   },
   {
    "schema": "efw",
    "tabla": "MUELLE_X_RUTA",
    "motivo": "Cada ruta tiene asignada una banda y un muelle de despacho",
    "confianza": "media"
   },
   {
    "schema": "efw",
    "tabla": "PRIORIDAD_EXPEDICION",
    "motivo": "Prioridad asignada a expediciones al crear viajes / reenviar incompletos",
    "confianza": "media"
   },
   {
    "schema": "efw",
    "tabla": "MONITORACCIONES",
    "motivo": "Acciones de trabajo (Control > Acciones de Trabajo) generadas para el alistamiento",
    "confianza": "media"
   },
   {
    "schema": "efw",
    "tabla": "EXPEDICION_GENERADO",
    "motivo": "Registro de expediciones cuyas acciones se generaron desde Salidas/Acciones",
    "confianza": "media"
   },
   {
    "schema": "efw",
    "tabla": "EPACKINGHISTORY",
    "motivo": "Fuente de unidades chequeadas en la Comparación ePacking vs Alistó",
    "confianza": "media"
   },
   {
    "schema": "efw",
    "tabla": "CHEQUEO_PALET",
    "motivo": "Palets pendientes de chequeo en mesas CHEQxx (Rpt. Palets Pend x Chequear)",
    "confianza": "media"
   },
   {
    "schema": "efw",
    "tabla": "CONTENEDOR",
    "motivo": "IDCONTENEDOR y ubicación del palet en el reporte de palets pendientes por chequear",
    "confianza": "alta"
   },
   {
    "schema": "wmh_cr",
    "tabla": "journeys",
    "motivo": "Viaje creado en Torre de Control (journey_id, situation, belt_id = banda)",
    "confianza": "alta"
   },
   {
    "schema": "wmh_cr",
    "tabla": "journey_orders",
    "motivo": "Órdenes agregadas al viaje (journey_id, route_id, order_id, warehouse_id, belt_id)",
    "confianza": "alta"
   },
   {
    "schema": "wmh_cr",
    "tabla": "incline_belts",
    "motivo": "Bandas transportadoras asignadas a cada viaje/ruta",
    "confianza": "alta"
   },
   {
    "schema": "wmh_cr",
    "tabla": "distribution_routes",
    "motivo": "Rutas seleccionadas al crear viaje (route_code, route_name, zone_id)",
    "confianza": "alta"
   },
   {
    "schema": "wmh_cr",
    "tabla": "distribution_zones",
    "motivo": "Zona de la ruta mostrada en el dashboard de viajes",
    "confianza": "media"
   },
   {
    "schema": "wmh_cr",
    "tabla": "warehouses",
    "motivo": "Filtro Almacenes (OLO por defecto) en Nuevo Viaje / Agregar órdenes",
    "confianza": "alta"
   },
   {
    "schema": "wmh_cr",
    "tabla": "ext_tms_expedicionescabecera_mt",
    "motivo": "Espejo de expediciones eFLOW con num_viaje_wmh, ruta y sector",
    "confianza": "alta"
   }
  ],
  "datosClave": [
   "Número de viaje WMH (#Viaje / Viaje WM / NUMEROVIAJEWMH)",
   "Prioridad",
   "Banda asignada",
   "Muelle / puerta (puerta 29 para pesado)",
   "Ruta (GAM / rural) y sector",
   "Expedición / número de orden",
   "Situación (Disponible)",
   "Compañía (COFERSA = 0109)",
   "Almacén (0001 - CEDI OLO)",
   "Observaciones de la expedición (cambio de ruta o dirección, Retira/Pasa)",
   "Unidades pedidas / preparadas / chequeadas",
   "Palets pendientes por chequear y su ubicación de mesa",
   "Clasificación 2 / tipo de orden (MEZZANINE, ORIGINALES, PESADO)"
  ],
  "conceptos": [
   {
    "termino": "Torre de Control",
    "definicion": "Aplicación web WMH donde se crean y gestionan los viajes de Cofersa; asigna banda, muelle y prioridad"
   },
   {
    "termino": "Viaje",
    "definicion": "Agrupación de expediciones de una ruta que se envía a una banda y un muelle; se identifica con el número de viaje WMH"
   },
   {
    "termino": "Banda",
    "definicion": "Banda transportadora asignada a cada ruta por la que debe pasar la mercadería del mesanín"
   },
   {
    "termino": "Mesanín",
    "definicion": "Sección superior del CEDI donde se prepara mercadería de Cofersa que baja por las bandas"
   },
   {
    "termino": "Horario de corte",
    "definicion": "Hora límite de envío de pedidos: 3:30 p. m. GAM y 5:30 p. m. rurales"
   },
   {
    "termino": "Rutas GAM / rurales",
    "definicion": "GAM se atienden todos los días; las rurales varían según programación"
   },
   {
    "termino": "Retira o Pasa",
    "definicion": "Observación que indica que el cliente viene a retirar el pedido; se atiende de inmediato con prioridad alta"
   },
   {
    "termino": "Acciones de Trabajo",
    "definicion": "Tareas de eFLOW (EXES, UBCO, etc.) que se generan para iniciar el alistamiento"
   },
   {
    "termino": "Comparación Alistó vs Packing",
    "definicion": "Pantalla que confronta unidades pedidas, preparadas y chequeadas por expedición"
   }
  ],
  "entradaDe": [],
  "salidaA": [
   "CEDI-05",
   "CEDI-06",
   "CEDI-08",
   "CEDI-10",
   "CEDI-09"
  ],
  "notas": [
   "Siempre se da prioridad a las expediciones que indican 'Retira' o 'Pasa' (el cliente viene a retirar), atendiéndolas de inmediato.",
   "El filtro de columna Ruta usa operadores de exclusión (Not In / Not Like) para ocultar las rutas que no se trabajan ese día; en Expedición se filtra 'des' para ocultar expediciones de Destrucción.",
   "El número de viaje une ambos sistemas: #Viaje en Torre, 'Viaje WM' en Acciones de Trabajo, 'NúmeroViaje WMH' en criterios de eFLOW y NUMEROVIAJEWMH en reportes.",
   "Zona 1 y Zona 2 de pesado tienen rutas asignadas; ambas se trabajan a diario pero se cargan en días alternos según demanda. Al crear viaje de pesado se pone cualquier banda.",
   "El personal de despacho es quien sabe a qué puerta va cada ruta; cada ruta tiene asignada una banda y un muelle.",
   "Las rutas se cargan en el día y se envían al día siguiente.",
   "Torre de Control versión 4.18.4.4 (WMH / Cloud Suite), accedida por HTTP en red interna; eFLOW WMS 3.2.8.5 de escritorio.",
   "Tras el proceso se deben revisar los informes para detectar rutas enviadas a un destino incorrecto."
  ],
  "decisiones": [
   "¿Compañía? Cofersa → proceso con eFLOW + Torre de Control (EPA no usa Torre)",
   "¿Tipo de ruta? GAM → corte 3:30 p. m.; Rural → corte 5:30 p. m.",
   "¿Indica Retira o Pasa? Sí → prioridad alta, atender inmediatamente; No → proceso normal",
   "¿Ruta? Rural → crear viajes rurales primero; GAM → crear viajes GAM después",
   "¿Es de materiales pesados? Sí → cualquier banda y salida por la puerta 29; No → banda y muelle correspondientes",
   "¿Cambio de ruta, otra dirección o pedido pasado? Sí → revisar el cambio y enviar al viaje correspondiente; No → seleccionar expedientes y Añadir",
   "¿Quedan rutas? Sí → repetir creación/agregado de viajes; No → distribuir personal por zonas",
   "¿Está el proceso terminado al 100 %? No → investigar la diferencia y corregir; Sí → continuar",
   "¿Existe algún error? Sí → corregir y revisar nuevamente; No → fin"
  ],
  "relacionados": [
   {
    "silo": "log_preparacion",
    "nombre": "S1 · Liberación de olas de picking"
   },
   {
    "silo": "log_preparacion",
    "nombre": "S5 · Consolidación por ruta"
   }
  ],
  "documentos": [
   {
    "tipo": "procedimiento",
    "titulo": "Procedimiento",
    "archivo": "P1 - Torre de Control Cofersa.docx",
    "path": "procedimientos/P1 - Torre de Control Cofersa.docx"
   },
   {
    "tipo": "manual",
    "titulo": "Manual de usuario",
    "archivo": "Manual - Torre de Control Cofersa.docx",
    "path": "manuales/P1 - Manual Torre de Control Cofersa.docx"
   }
  ]
 },
 "CEDI-02": {
  "codigo": "CEDI-02",
  "num": 2,
  "nombre": "Torre de Control EPA",
  "nodo": "CEDI-02 · Torre de Control EPA",
  "compania": "EPA",
  "silo": "log_preparacion",
  "siloLabel": "OL.3 · Preparación de pedidos",
  "macro": "S2 · Picking por pedido, lote o zona",
  "nodoExistente": "Torre de control EPA",
  "objetivo": "Establecer la metodología semanal para el alistamiento y la priorización de los pedidos de Ferretería EPA S.A., diferenciando los tipos de mercancía (picking, exco, exes y upco) y las prioridades comerciales definidas por la compañía.",
  "alcance": "Este procedimiento aplica a las operaciones de alistamiento realizadas en las zonas de suministros, originales y sobredimensionados del área de EPA. No incluye el proceso de Torre de Control, dado que EPA no dispone de banda transportadora ni de mesanín.",
  "responsables": [
   "Encargado de Alisto EPA",
   "alistadores",
   "apiladores"
  ],
  "pasos": [
   {
    "texto": "Organizar el trabajo en programación semanal; cada lunes ingresan los pedidos de tienda, priorizando suministros",
    "sistema": "fisico",
    "pantalla": null
   },
   {
    "texto": "Distribuir los cinco alistadores: uno en suministros, dos en originales y dos en sobredimensionado",
    "sistema": "fisico",
    "pantalla": null
   },
   {
    "texto": "Ingresar a eFLOW WMS con las credenciales del encargado",
    "sistema": "eflow",
    "pantalla": "Ingreso eFlow"
   },
   {
    "texto": "Ir a Documentos > Órdenes de Expedición, filtrar Tipo = Expedición ERP y Compañía = Ferretería EPA S.A.; Consultar",
    "sistema": "eflow",
    "pantalla": "Documentos > Ordenes de Expedición (pestaña Salidas)"
   },
   {
    "texto": "Excluir de la vista las expediciones terminadas (cierre automático al 100 % o manual) y las anuladas",
    "sistema": "eflow",
    "pantalla": "Documentos > Ordenes de Expedición (pestaña Salidas)"
   },
   {
    "texto": "Mantener una sola prioridad para picking; solo cambia ante una venta puntual (pagada por adelantado)",
    "sistema": "eflow",
    "pantalla": "Documentos > Ordenes de Expedición (pestaña Salidas)"
   },
   {
    "texto": "Ir a Control > Acciones de Trabajo, filtrar Situación = Disponible y Compañía = Ferretería EPA; Consultar",
    "sistema": "eflow",
    "pantalla": "Control > Acciones de Trabajo (pestaña Acciones)"
   },
   {
    "texto": "La mercancía de gran peso se despacha en carretas por la puerta norte",
    "sistema": "fisico",
    "pantalla": null
   },
   {
    "texto": "Filtrar los resultados para descartar lo que no corresponde trabajar (p. ej. mercancía en recepción)",
    "sistema": "eflow",
    "pantalla": "Control > Acciones de Trabajo (pestaña Acciones)"
   },
   {
    "texto": "Asignar a cada colaborador las líneas de trabajo según la zona en la que se desempeña",
    "sistema": "eflow",
    "pantalla": "Control > Acciones de Trabajo (pestaña Acciones)"
   },
   {
    "texto": "Para asignar un recurso: Seguridad > Almacén Recursos, verificar situación disponible y habilitar su zona de trabajo",
    "sistema": "eflow",
    "pantalla": "Seguridad > Almacén Recursos"
   },
   {
    "texto": "Revisar constantemente el correo para ventas puntuales, pedidos urgentes o cambios de prioridad de artículos",
    "sistema": "correo",
    "pantalla": null
   },
   {
    "texto": "Reasignar a los colaboradores de zona al terminar su asignación para que no queden sin líneas",
    "sistema": "eflow",
    "pantalla": "Seguridad > Almacén Recursos"
   },
   {
    "texto": "Coordinar con despacho la priorización de las tiendas que requieran cargarse con urgencia",
    "sistema": "fisico",
    "pantalla": null
   }
  ],
  "registros": [
   "Consultas de acciones de trabajo generadas en eFLOW."
  ],
  "noConformidades": [
   "Ubicación bloqueada: se solicita al personal de inventario que verifique si el fallo corresponde a la ubicación, al artículo o al palet."
  ],
  "pantallas": [
   {
    "sistema": "eflow",
    "ruta": "Documentos > Ordenes de Expedición (pestaña Salidas)",
    "uso": "Consultar expediciones ERP de Ferretería EPA, excluir terminadas/anuladas y ajustar prioridad"
   },
   {
    "sistema": "eflow",
    "ruta": "Control > Acciones de Trabajo (pestaña Acciones)",
    "uso": "Ver acciones disponibles de EPA (CEDI y almacén de Coco), filtrar y asignar líneas a alistadores"
   },
   {
    "sistema": "eflow",
    "ruta": "Seguridad > Almacén Recursos",
    "uso": "Seleccionar el recurso, verificar que esté disponible y habilitar su zona de trabajo (originales, sobredimensionado o menudencias)"
   },
   {
    "sistema": "correo",
    "ruta": "Correo electrónico",
    "uso": "Recibir ventas puntuales, pedidos urgentes y cambios de prioridad"
   }
  ],
  "tablas": [
   {
    "schema": "efw",
    "tabla": "EXPEDICIONESCABECERA",
    "motivo": "Expediciones de EPA filtradas por tipo y compañía; columnas PRIORIDAD y TPEXPE",
    "confianza": "alta"
   },
   {
    "schema": "efw",
    "tabla": "EXPEDICIONESDETALLE",
    "motivo": "Líneas de las expediciones a alistar",
    "confianza": "alta"
   },
   {
    "schema": "efw",
    "tabla": "PRIORIDAD_EXPEDICION",
    "motivo": "Prioridad única de picking y prioridad alta de ventas puntuales",
    "confianza": "media"
   },
   {
    "schema": "efw",
    "tabla": "MONITORACCIONES",
    "motivo": "Acciones de trabajo disponibles consultadas en Control > Acciones de Trabajo",
    "confianza": "media"
   },
   {
    "schema": "efw",
    "tabla": "EXPEDICION_GENERADO_EXCO",
    "motivo": "Trabajos EXCO (tarima completa) generados para apiladores",
    "confianza": "media"
   },
   {
    "schema": "efw",
    "tabla": "EXPEDICION_GENERADO_EXES_LOTE",
    "motivo": "Trabajos EXES (picking en altura) generados para apiladores",
    "confianza": "media"
   },
   {
    "schema": "efw",
    "tabla": "EXPEDICION_GENERADO_PICK_LOTE",
    "motivo": "Trabajos de picking generados para alistadores",
    "confianza": "media"
   },
   {
    "schema": "efw",
    "tabla": "ALMACENRECURSOS",
    "motivo": "Seguridad > Almacén Recursos: IDRECURSO, IDZONATRABAJORECURSOS, IDZONATRABAJOPREPARACION",
    "confianza": "alta"
   },
   {
    "schema": "efw",
    "tabla": "RECURSOS",
    "motivo": "Recurso (alistador) seleccionado por ID",
    "confianza": "alta"
   },
   {
    "schema": "efw",
    "tabla": "ZONATRABAJORECURSOS",
    "motivo": "Zona de trabajo habilitada al recurso",
    "confianza": "alta"
   },
   {
    "schema": "efw",
    "tabla": "ZONATRABAJOPREPARACION",
    "motivo": "Zona de preparación asignada al recurso",
    "confianza": "media"
   }
  ],
  "datosClave": [
   "Tipo de expedición (Expedición ERP)",
   "Compañía (Ferretería EPA S.A.)",
   "Tienda / punto de venta",
   "Prioridad (única para picking; alta para venta puntual)",
   "Tipo de trabajo (Picking, EXCO, EXES, UPCO)",
   "Situación de trabajo (Disponible)",
   "Origen del pedido (CEDI o almacén de Coco)",
   "Recurso (ID) y zona de trabajo",
   "Estado de la expedición (terminada / anulada)"
  ],
  "conceptos": [
   {
    "termino": "Venta puntual",
    "definicion": "Pedido especial con mercadería pagada por adelantado por el cliente en tienda; prioridad sobre cualquier otro"
   },
   {
    "termino": "Picking",
    "definicion": "Alistamiento de líneas en piso; se mantiene en una sola prioridad"
   },
   {
    "termino": "EXCO",
    "definicion": "Tarima que sale completa; la atiende un apilador"
   },
   {
    "termino": "EXES",
    "definicion": "Similar a picking pero en altura; lo atienden los apiladores"
   },
   {
    "termino": "UPCO",
    "definicion": "El apilador baja la tarima para que en piso un alistador trabaje la mercadería en otra zona"
   },
   {
    "termino": "Suministros / menudencias",
    "definicion": "Mercancía de alisto rápido; normalmente una sola persona asignada"
   },
   {
    "termino": "Sobredimensionado",
    "definicion": "Zona de mercancía de gran tamaño; dos alistadores asignados"
   },
   {
    "termino": "Almacén de Coco",
    "definicion": "Almacén adicional donde también se generan pedidos de EPA"
   }
  ],
  "entradaDe": [],
  "salidaA": [
   "CEDI-04"
  ],
  "notas": [
   "EPA no tiene banda transportadora ni mesanín, por lo que no usa la aplicación Torre de Control.",
   "En suministros normalmente trabaja una sola persona porque es mercancía muy rápida de alistar.",
   "Cuando la tienda solicita cambiar todo a una misma prioridad es porque estará jalando todo lo que necesita.",
   "Las expediciones terminadas se cierran automáticamente al llegar al 100 % o se puede forzar el cierre si se solicita.",
   "Registro generado: consultas de acciones de trabajo en eFLOW.",
   "No conformidad: ante ubicación bloqueada se pide a Inventario verificar si el fallo es la ubicación, el artículo o el palet."
  ],
  "decisiones": [
   "¿Compañía? EPA → proceso sin Torre de Control",
   "¿Venta puntual? Sí → prioridad alta; No → continuar prioridad normal",
   "¿Es Picking? Sí → mantener una sola prioridad; No → aplicar prioridad solicitada",
   "¿Mercadería muy pesada? Sí → despachar en carretas por la puerta norte; No → continuar proceso",
   "¿Área del alistador? Originales / Sobredimensionado / Suministros-menudencias → habilitar la zona de trabajo correspondiente",
   "¿Zona terminada? Sí → cambiar alistador de zona para que no quede sin líneas; No → continuar seguimiento",
   "¿Despacho solicita prioridad? Sí → dar prioridad a la tienda para permitir la carga; No → continuar",
   "¿Ubicación bloqueada? Sí → solicitar revisión a Inventario (ubicación / artículo / palet) y corregir; No → continuar alistamiento"
  ],
  "relacionados": [
   {
    "silo": "log_preparacion",
    "nombre": "S1 · Liberación de olas de picking"
   }
  ],
  "documentos": [
   {
    "tipo": "procedimiento",
    "titulo": "Procedimiento",
    "archivo": "P2 - Torre de Control EPA.docx",
    "path": "procedimientos/P2 - Torre de Control EPA.docx"
   }
  ]
 },
 "CEDI-05": {
  "codigo": "CEDI-05",
  "num": 5,
  "nombre": "Alisto Cofersa",
  "nodo": "CEDI-05 · Alisto Cofersa",
  "compania": "COFERSA",
  "silo": "log_preparacion",
  "siloLabel": "OL.3 · Preparación de pedidos",
  "macro": "S2 · Picking por pedido, lote o zona",
  "nodoExistente": "Alisto de Cofersa",
  "objetivo": "Establecer el procedimiento para el alistamiento de los pedidos de Cofersa mediante el uso del handheld, garantizando la correcta separación de la mercancía por ruta.",
  "alcance": "Aplica desde la recepción del pedido hasta su entrega en el área de chequeo.",
  "responsables": [
   "Alistadores de Cofersa"
  ],
  "pasos": [
   {
    "texto": "Ingresar al WMS en el handheld con las credenciales del alistador (usuario, recurso, almacén)",
    "sistema": "handheld",
    "pantalla": "eWMS - CEDI OLO (menú principal)"
   },
   {
    "texto": "Recibir y aceptar el pedido; el sistema indica la cantidad de palets requeridos y el tamaño del pedido",
    "sistema": "handheld",
    "pantalla": "Picking, despacho y reposiciones > Trabajo automático (Aceptar / Rechazar)"
   },
   {
    "texto": "Visualizar el picking del pedido y su número de líneas (cada línea: ubicación, artículo o palet)",
    "sistema": "handheld",
    "pantalla": "Picking (detalle de línea 1/N)"
   },
   {
    "texto": "En la primera línea leer, en orden, ubicación, artículo y palet; el palet debe ser de la ruta asignada",
    "sistema": "handheld",
    "pantalla": "Picking (U.Origen, Artículo, Palet)"
   },
   {
    "texto": "Repetir el procedimiento con cada línea restante hasta completar el pedido",
    "sistema": "handheld",
    "pantalla": "Picking"
   },
   {
    "texto": "Al finalizar, dejar los palets en el área de chequeo",
    "sistema": "fisico",
    "pantalla": null
   },
   {
    "texto": "Continuar con el alistamiento del siguiente pedido repitiendo los pasos anteriores",
    "sistema": "handheld",
    "pantalla": "Picking, despacho y reposiciones > Trabajo automático"
   }
  ],
  "registros": [
   "Registro de líneas alistadas en el handheld."
  ],
  "noConformidades": [],
  "pantallas": [
   {
    "sistema": "handheld",
    "ruta": "eWMS - CEDI OLO (menú principal)",
    "uso": "Acceso con usuario, recurso y almacén 0001; selección del módulo de trabajo"
   },
   {
    "sistema": "handheld",
    "ruta": "Picking, despacho y reposiciones > Trabajo automático",
    "uso": "Recibir el siguiente pedido asignado y confirmarlo (Aceptar / Rechazar)"
   },
   {
    "sistema": "handheld",
    "ruta": "Picking",
    "uso": "Detalle de cada línea: U.Origen, P.Origen, Artículo, Ref, Lote/Pal, Cantidad, Documento, Cliente, Palet, Prioridad, Ruta, Notas; lectura de ubicación, artículo y palet"
   }
  ],
  "tablas": [
   {
    "schema": "efw",
    "tabla": "EXPEDICIONESCABECERA",
    "motivo": "Pedido/expedición (Documento, Cliente, Prioridad) que se alista",
    "confianza": "alta"
   },
   {
    "schema": "efw",
    "tabla": "EXPEDICIONESDETALLE",
    "motivo": "Líneas del picking (artículo, cantidad) de la expedición",
    "confianza": "alta"
   },
   {
    "schema": "efw",
    "tabla": "MONITORACCIONES",
    "motivo": "Acción de trabajo que el handheld entrega en Trabajo automático",
    "confianza": "media"
   },
   {
    "schema": "efw",
    "tabla": "EXPEDICION_GENERADO_PICK_LOTE",
    "motivo": "Trabajo de picking generado para la expedición",
    "confianza": "media"
   },
   {
    "schema": "efw",
    "tabla": "EXPEDICION_GENERADO_PALET",
    "motivo": "Palets requeridos que el sistema indica al aceptar el pedido",
    "confianza": "media"
   },
   {
    "schema": "efw",
    "tabla": "CONTENEDOR",
    "motivo": "Palet destino leído en cada línea (IDCONTENEDOR, ubicación)",
    "confianza": "alta"
   },
   {
    "schema": "efw",
    "tabla": "CONTENEDORARTICULOS",
    "motivo": "Artículos cargados al palet con IDEXPEDICIONLINEA",
    "confianza": "alta"
   },
   {
    "schema": "efw",
    "tabla": "DESTINO_CONTENEDOR_ALISTO",
    "motivo": "Destino/ruta del palet de alisto (no se permite combinar rutas)",
    "confianza": "media"
   },
   {
    "schema": "efw",
    "tabla": "RENDIMIENTO_USUARIO_ALISTO",
    "motivo": "Registro de líneas alistadas por usuario/recurso",
    "confianza": "media"
   },
   {
    "schema": "efw",
    "tabla": "RECURSOS",
    "motivo": "Recurso del alistador mostrado en el handheld (p. ej. CS07)",
    "confianza": "alta"
   }
  ],
  "datosClave": [
   "Número de expedición / documento",
   "Cantidad de palets requeridos y tamaño del pedido",
   "Número de líneas del picking",
   "Ubicación origen (U.Origen)",
   "Artículo y referencia",
   "Cantidad y presentación",
   "Palet (asociado a la ruta)",
   "Ruta",
   "Prioridad",
   "Cliente",
   "Recurso y usuario del alistador"
  ],
  "conceptos": [
   {
    "termino": "Línea de picking",
    "definicion": "Cada lectura de una ubicación, un artículo o un palet que compone el pedido"
   },
   {
    "termino": "Trabajo automático",
    "definicion": "Opción del handheld que entrega al alistador el siguiente pedido asignado"
   },
   {
    "termino": "Palet de ruta",
    "definicion": "Palet asignado a la ruta del pedido; no se permite combinar rutas en un mismo pedido"
   },
   {
    "termino": "Área de chequeo",
    "definicion": "Zona donde se dejan los palets alistados para su verificación"
   }
  ],
  "entradaDe": [
   "CEDI-11",
   "CEDI-13",
   "CEDI-01"
  ],
  "salidaA": [
   "CEDI-06",
   "CEDI-07"
  ],
  "notas": [
   "El menú principal del handheld (eWMS CEDI OLO) muestra Usuario, Recurso y Almacén 0001; la opción usada es 'Picking, despacho y reposiciones' (picking automático y manual).",
   "La pantalla Picking muestra el avance de líneas (ej. 1/30) con U.Origen, P.Origen, Artículo, Ref, Lote/Pal, Clasif 1, Cantidad, Factor, Documento, Cliente, Palet, Prioridad, Ruta y Notas.",
   "Al aceptar el pedido se generan las expediciones.",
   "SIPOC: la entrada es el pedido (orden de compra del cliente, origen Softland) y la salida es la mercancía alistada entregada al encargado de chequeo.",
   "Todas las actividades las ejecuta el Alistador de Picking (entidad única).",
   "No se reportan no conformidades específicas para este proceso."
  ],
  "decisiones": [
   "¿El palet corresponde a la ruta del pedido? No → seleccionar el palet correspondiente a la ruta; Sí → confirmar línea",
   "¿Quedan líneas pendientes? Sí → pasar a la siguiente línea; No → finalizar picking y dejar palets en chequeo",
   "¿Hay otro pedido? Sí → recibir siguiente pedido; No → fin"
  ],
  "relacionados": [],
  "documentos": [
   {
    "tipo": "procedimiento",
    "titulo": "Procedimiento",
    "archivo": "P5 - Alisto Cofersa.docx",
    "path": "procedimientos/P5 - Alisto Cofersa.docx"
   },
   {
    "tipo": "manual",
    "titulo": "Manual de usuario",
    "archivo": "Manual - Alisto Cofersa.docx",
    "path": "manuales/P5 - Manual Alisto Cofersa.docx"
   }
  ]
 },
 "CEDI-06": {
  "codigo": "CEDI-06",
  "num": 6,
  "nombre": "Chequeo Cofersa",
  "nodo": "CEDI-06 · Chequeo Cofersa",
  "compania": "COFERSA",
  "silo": "log_preparacion",
  "siloLabel": "OL.3 · Preparación de pedidos",
  "macro": "S3 · Control de exactitud",
  "nodoExistente": "Chequeo de Cofersa",
  "objetivo": "Verificar la exactitud de los pedidos alistados de Cofersa antes de su envío a despacho.",
  "alcance": "Aplica a todos los palets alistados provenientes de las rutas de GAM y de las rutas rurales.",
  "responsables": [
   "Personal de chequeo"
  ],
  "pasos": [
   {
    "texto": "Ingresar al WMS con usuario, contraseña e información extra del encargado",
    "sistema": "handheld",
    "pantalla": "eWMS - CEDI OLO (menú principal)"
   },
   {
    "texto": "Escanear con el handheld el palet junto con la ruta asignada",
    "sistema": "handheld",
    "pantalla": "Estación de Chequeo"
   },
   {
    "texto": "Verificar en la estación de chequeo que artículos y cantidades correspondan a la tarima (rurales al centro, GAM a los lados)",
    "sistema": "eflow",
    "pantalla": "Estación de Chequeo"
   },
   {
    "texto": "Revisar una tarima a la vez; al finalizar, continuar con la siguiente",
    "sistema": "fisico",
    "pantalla": null
   },
   {
    "texto": "Escaneada toda la tarima, imprimir el palet máster, pegarlo en una sola caja y enviar la tarima a despacho",
    "sistema": "eflow",
    "pantalla": "Control > Creación de Etiquetas > Creación de Palets"
   }
  ],
  "registros": [
   "Palet máster impreso."
  ],
  "noConformidades": [
   "Envío incorrecto de artículos por parte del área de alistó.",
   "Cantidad que no corresponde a la requerida.",
   "Artículos dañados."
  ],
  "pantallas": [
   {
    "sistema": "eflow",
    "ruta": "Estación de Chequeo",
    "uso": "Registro del palet, viaje, cliente y ruta; verificación de artículos y cantidades de la tarima"
   },
   {
    "sistema": "eflow",
    "ruta": "Catálogos > Artículos EAN",
    "uso": "Consulta del código EAN de un artículo en caso de duda"
   },
   {
    "sistema": "eflow",
    "ruta": "Inventario > Consulta de Inventario",
    "uso": "Verificar existencias disponibles del artículo"
   },
   {
    "sistema": "eflow",
    "ruta": "Control > Creación de Etiquetas > Creación de Palets",
    "uso": "Impresión de la etiqueta tipo Master (palet máster)"
   },
   {
    "sistema": "eflow",
    "ruta": "Reportes > Rpt. Palets Pend x Chequear",
    "uso": "Listado de palets pendientes de chequeo para planificar la carga de trabajo"
   }
  ],
  "tablas": [
   {
    "schema": "efw",
    "tabla": "CHEQUEO_PALET",
    "motivo": "Registro del chequeo de cada palet en la estación de chequeo",
    "confianza": "media"
   },
   {
    "schema": "efw",
    "tabla": "CHEQUEO_PALET_INCIDENCIAS",
    "motivo": "Incidencias del chequeo (artículo incorrecto, cantidad distinta, dañado)",
    "confianza": "media"
   },
   {
    "schema": "efw",
    "tabla": "CONTENEDOR",
    "motivo": "Palet escaneado en chequeo (IDCONTENEDOR, ubicación)",
    "confianza": "alta"
   },
   {
    "schema": "efw",
    "tabla": "CONTENEDORARTICULOS",
    "motivo": "Artículos y cantidades del palet verificados contra IDEXPEDICIONLINEA",
    "confianza": "alta"
   },
   {
    "schema": "efw",
    "tabla": "EXPEDICIONESCABECERA",
    "motivo": "Pedido/expedición y cliente (IDCLIENTE) asociados al palet chequeado",
    "confianza": "alta"
   },
   {
    "schema": "efw",
    "tabla": "EXPEDICIONESDETALLE",
    "motivo": "Líneas esperadas del pedido contra las que se compara la tarima",
    "confianza": "media"
   },
   {
    "schema": "efw",
    "tabla": "EXPEDICIONESDETALLE_MASTER",
    "motivo": "Asociación de líneas de expedición al palet máster impreso",
    "confianza": "media"
   },
   {
    "schema": "efw",
    "tabla": "ARTICULOSEAN",
    "motivo": "Consulta del código EAN (IDEAN) en Catálogos > Artículos EAN",
    "confianza": "alta"
   }
  ],
  "datosClave": [
   "Palet (contenedor) alistado",
   "Ruta asignada (GAM o rural)",
   "Viaje",
   "Cliente",
   "Artículos y cantidades por tarima",
   "Código EAN del artículo",
   "Inventario disponible del artículo",
   "Palet máster (etiqueta Master)",
   "Faltantes y sobrantes por alistador"
  ],
  "conceptos": [
   {
    "termino": "Estación de Chequeo",
    "definicion": "Zona y pantalla donde se verifica la tarima; rutas rurales al centro, GAM a los lados"
   },
   {
    "termino": "Palet máster",
    "definicion": "Etiqueta Master impresa al terminar el chequeo y pegada en una sola caja de la tarima"
   },
   {
    "termino": "Hoja de control Error Picking",
    "definicion": "Registro de faltantes y sobrantes detectados en chequeo, por alistador"
   },
   {
    "termino": "Rutas GAM / rurales",
    "definicion": "Clasificación de rutas que determina la posición de la tarima en la estación"
   }
  ],
  "entradaDe": [
   "CEDI-01",
   "CEDI-05"
  ],
  "salidaA": [
   "CEDI-07",
   "CEDI-08",
   "CEDI-10"
  ],
  "notas": [
   "SIPOC: proveedor Área de Alistamiento; entrada palet alistado pendiente de chequeo; salida palet máster verificado y etiquetado hacia el Área de Despacho.",
   "La ruta asignada del palet proviene del sistema WMS.",
   "En caso de duda sobre un artículo se consulta su código EAN (Catálogos > Artículos EAN) y su inventario (Inventario > Consulta de Inventario).",
   "La etiqueta del palet máster se imprime en Control > Creación de Etiquetas > Creación de Palets, tipo Master.",
   "En paralelo, Reportes > Rpt. Palets Pend x Chequear lista los palets pendientes con fines informativos y de planificación.",
   "Faltantes y sobrantes se documentan en la hoja de control 'Error Picking' por alistador.",
   "Todas las actividades las ejecuta el Chequeador de Tarimas (entidad única)."
  ],
  "decisiones": [
   "¿Los artículos son correctos? No → detectar error en el pedido; Sí → continuar revisando",
   "¿Cuál es el error? Artículo enviado incorrectamente desde Alisto / cantidad diferente a la requerida / artículo dañado → enviar tarima a corrección y corregir",
   "¿Se terminó de revisar toda la tarima? No → continuar revisando artículos; Sí → finalizar chequeo, imprimir y pegar Palet Master, enviar a Despacho",
   "¿Hay otra tarima pendiente? Sí → recibir siguiente tarima; No → fin"
  ],
  "relacionados": [
   {
    "silo": "log_preparacion",
    "nombre": "S4 · Empaque"
   }
  ],
  "documentos": [
   {
    "tipo": "procedimiento",
    "titulo": "Procedimiento",
    "archivo": "P6 - Chequeo Cofersa.docx",
    "path": "procedimientos/P6 - Chequeo Cofersa.docx"
   },
   {
    "tipo": "manual",
    "titulo": "Manual de usuario",
    "archivo": "Manual - Chequeo Cofersa.docx",
    "path": "manuales/P6 - Manual Chequeo Cofersa.docx"
   }
  ]
 },
 "CEDI-07": {
  "codigo": "CEDI-07",
  "num": 7,
  "nombre": "Facturación Cofersa",
  "nodo": "CEDI-07 · Facturación Cofersa",
  "compania": "COFERSA",
  "silo": "neg_facturacion",
  "siloLabel": "CEDI-01.12 · Facturación",
  "macro": "S1 · Generación de la factura electrónica",
  "nodoExistente": "Facturación Cofersa",
  "objetivo": "Establecer el procedimiento de facturación de los pedidos de Cofersa una vez que han sido alistados y entregados a empaque, garantizando la generación correcta del comprobante fiscal.",
  "alcance": "Aplica desde el cierre del pedido en empaque hasta la entrega del documento físico al área de Transportes.",
  "responsables": [
   "Personal de facturación"
  ],
  "pasos": [
   {
    "texto": "Ingresar a Softland con usuario, contraseña e información extra del encargado",
    "sistema": "softland",
    "pantalla": null
   },
   {
    "texto": "Cerrado el pedido en empaque, este ingresa automáticamente a Softland en la ventana de Pedidos",
    "sistema": "softland",
    "pantalla": "Pedidos"
   },
   {
    "texto": "Verificar que el pedido esté lo más completo posible",
    "sistema": "softland",
    "pantalla": "Pedidos"
   },
   {
    "texto": "En Refrescar Existencia revisar la disponibilidad real en bodega y confirmar lo que puede facturarse",
    "sistema": "softland",
    "pantalla": "Pedidos > Refrescar Existencia"
   },
   {
    "texto": "Generar la factura con la opción Generar Factura",
    "sistema": "softland",
    "pantalla": "Pedidos > Generar Factura"
   },
   {
    "texto": "Retirar la opción \"Usa Despacho\" (mercancía no liquidada o no encontrada; se reincorpora si aparece)",
    "sistema": "softland",
    "pantalla": "Generar Factura (opción Usa Despacho)"
   },
   {
    "texto": "Presionar Generar y esperar a que el proceso cargue",
    "sistema": "softland",
    "pantalla": "Generar Factura"
   },
   {
    "texto": "Verificar la factura en Comprobantes Enviados (Hacienda); con check de enviado se imprimen dos copias",
    "sistema": "softland",
    "pantalla": "Comprobantes Enviados"
   },
   {
    "texto": "Con la copia impresa, el área de despacho queda habilitada para despachar la mercancía",
    "sistema": "fisico",
    "pantalla": null
   },
   {
    "texto": "Colocar el documento físico en la bandeja correspondiente según la ruta",
    "sistema": "fisico",
    "pantalla": null
   },
   {
    "texto": "Trasladar el documento al área de Transportes",
    "sistema": "fisico",
    "pantalla": null
   }
  ],
  "registros": [
   "Factura electrónica.",
   "Comprobante enviado a Hacienda.",
   "Copias físicas de la factura."
  ],
  "noConformidades": [
   "El sistema indica una existencia que no corresponde con el inventario físico.",
   "Falta de disponibilidad del producto al momento de facturar."
  ],
  "pantallas": [
   {
    "sistema": "softland",
    "ruta": "Pedidos",
    "uso": "Recepción automática del pedido cerrado en empaque y revisión de su completitud"
   },
   {
    "sistema": "softland",
    "ruta": "Pedidos > Refrescar Existencia",
    "uso": "Disponibilidad actual en bodega para confirmar lo facturable"
   },
   {
    "sistema": "softland",
    "ruta": "Pedidos > Generar Factura",
    "uso": "Generación de la factura, retirando la opción Usa Despacho"
   },
   {
    "sistema": "softland",
    "ruta": "Comprobantes Enviados",
    "uso": "Verificar el comprobante enviado a Hacienda (check de enviado), que dispara la impresión de dos copias"
   }
  ],
  "tablas": [
   {
    "schema": "efw",
    "tabla": "EXPEDICIONESCABECERA",
    "motivo": "Pedido/expedición cerrado en empaque que pasa a facturarse",
    "confianza": "media"
   },
   {
    "schema": "efw",
    "tabla": "WMS_PEDIDO_FACTURA",
    "motivo": "Relación pedido WMS - factura emitida en Softland",
    "confianza": "media"
   },
   {
    "schema": "efw",
    "tabla": "EINV_FACTURA",
    "motivo": "Factura electrónica asociada al pedido",
    "confianza": "media"
   },
   {
    "schema": "efw",
    "tabla": "DOCUMENTO_CONFIRMACION_ERP",
    "motivo": "Confirmación del pedido cerrado hacia el ERP",
    "confianza": "media"
   },
   {
    "schema": "wmh_cr",
    "tabla": "ext_tms_wms_pedido_factura_mt",
    "motivo": "Espejo pedido-factura (num_pedido, num_factura, fech_facturado)",
    "confianza": "alta"
   }
  ],
  "datosClave": [
   "Número de pedido",
   "Líneas del pedido y artículos",
   "Existencia disponible en bodega",
   "Número de factura",
   "Estado del comprobante enviado a Hacienda",
   "Copias físicas de la factura (dos)",
   "Ruta (bandeja de destino del documento)"
  ],
  "conceptos": [
   {
    "termino": "Refrescar Existencia",
    "definicion": "Opción de Softland que muestra la disponibilidad actual en bodega"
   },
   {
    "termino": "Usa Despacho",
    "definicion": "Opción que se retira al facturar; aplica a mercancía no liquidada o no encontrada"
   },
   {
    "termino": "Comprobantes Enviados",
    "definicion": "Apartado del comprobante/factura enviado a Hacienda"
   },
   {
    "termino": "Bandeja por ruta",
    "definicion": "Bandeja física donde se coloca la factura según su ruta antes de pasar a Transportes"
   }
  ],
  "entradaDe": [
   "CEDI-05",
   "CEDI-06"
  ],
  "salidaA": [
   "CEDI-08",
   "CEDI-10",
   "CEDI-09"
  ],
  "notas": [
   "No existe manual de usuario para este proceso; información tomada del procedimiento, el diagrama y las notas de campo.",
   "Si un producto se elimina del pedido por no encontrarse y luego aparece, se puede volver a ingresar al pedido.",
   "Las notas de campo llaman 'ascienda' (Hacienda) al apartado de comprobantes enviados (la factura física).",
   "La impresora emite las dos copias en el mismo momento en que el comprobante muestra el check de enviado.",
   "Roles del diagrama: Encargado de Facturación y Despacho (recibe las copias y queda autorizado para despachar)."
  ],
  "decisiones": [
   "¿El producto aparece disponible? No → falta de disponibilidad, no se puede facturar; Sí → verificar que lo disponible sea lo que se factura",
   "¿El producto está físicamente en bodega? No → diferencia sistema vs físico, buscar físicamente el producto",
   "¿Se encuentra físicamente? Sí → volver a ingresar el producto al pedido; No → eliminar el producto del pedido y continuar con los disponibles",
   "¿El comprobante tiene check de Enviado? No → esperar o revisar estado; Sí → imprimir dos copias y entregar a Despacho"
  ],
  "relacionados": [
   {
    "silo": "log_preparacion",
    "nombre": "S6 · Documentación de despacho"
   }
  ],
  "documentos": [
   {
    "tipo": "procedimiento",
    "titulo": "Procedimiento",
    "archivo": "P7 - Facturación Cofersa.docx",
    "path": "procedimientos/P7 - Facturacion Cofersa.docx"
   }
  ]
 },
 "CEDI-08": {
  "codigo": "CEDI-08",
  "num": 8,
  "nombre": "Despacho de bandas Cofersa",
  "nodo": "CEDI-08 · Despacho de bandas Cofersa",
  "compania": "COFERSA",
  "silo": "log_transporte",
  "siloLabel": "OL.4 · Transporte",
  "macro": "S3 · Despacho",
  "nodoExistente": "Despacho de bandas Cofersa",
  "objetivo": "Establecer el procedimiento para el despacho de la mercancía consolidada en máster mediante el sistema de bandas.",
  "alcance": "Aplica a la mercancía de Cofersa procesada por banda transportadora hasta su despacho final por puerta.",
  "responsables": [
   "Personal de despacho de bandas"
  ],
  "pasos": [
   {
    "texto": "Ingresar al WMS con usuario, contraseña e información extra del encargado",
    "sistema": "handheld",
    "pantalla": "eWMS - CEDI OLO (menú principal)"
   },
   {
    "texto": "En Contenedor Máster escanear un máster vacío",
    "sistema": "handheld",
    "pantalla": "Picking, despacho y reposiciones > Contenedor Máster"
   },
   {
    "texto": "Leer la información del código del producto proveniente de la banda",
    "sistema": "handheld",
    "pantalla": "Contenedor Máster"
   },
   {
    "texto": "Confirmar incluir en el mismo máster productos de la misma tienda aunque sean de pedidos distintos",
    "sistema": "handheld",
    "pantalla": "Contenedor Máster"
   },
   {
    "texto": "Una vez escaneados, retirar los productos de la banda",
    "sistema": "fisico",
    "pantalla": null
   },
   {
    "texto": "Finalizar el máster desde el menú de tres puntos con la opción Finalizar Máster",
    "sistema": "handheld",
    "pantalla": "Contenedor Máster > ⋮ > Finalizar Máster"
   },
   {
    "texto": "Ubicar el máster en la posición libre correspondiente y trasladarlo a la puerta asignada",
    "sistema": "fisico",
    "pantalla": null
   },
   {
    "texto": "Ingresar a Despacho, escanear la puerta y seleccionar el viaje correspondiente",
    "sistema": "handheld",
    "pantalla": "Picking, despacho y reposiciones > Despacho"
   },
   {
    "texto": "Despachar el máster completo y escanearlo nuevamente para confirmar",
    "sistema": "handheld",
    "pantalla": "Despacho > ⋮ > Despachar máster completo"
   },
   {
    "texto": "Al final del día (nocturno) verificar que todos los pedidos estén finalizados y cerrar los viajes",
    "sistema": "eflow",
    "pantalla": null
   }
  ],
  "registros": [
   "Confirmaciones de despacho de máster en el handheld."
  ],
  "noConformidades": [],
  "pantallas": [
   {
    "sistema": "handheld",
    "ruta": "eWMS - CEDI OLO (menú principal) > Picking, despacho y reposiciones",
    "uso": "Acceso a las opciones Contenedor Máster y Despacho"
   },
   {
    "sistema": "handheld",
    "ruta": "Picking, despacho y reposiciones > Contenedor Máster",
    "uso": "Lectura del Palet Máster vacío y asociación de productos (palets) provenientes de la banda"
   },
   {
    "sistema": "handheld",
    "ruta": "Contenedor Máster > ⋮ > Finalizar Máster",
    "uso": "Cierre del máster consolidado"
   },
   {
    "sistema": "handheld",
    "ruta": "Picking, despacho y reposiciones > Despacho",
    "uso": "Lectura del muelle (puerta), selección del número de viaje y listado de másteres del viaje"
   },
   {
    "sistema": "handheld",
    "ruta": "Despacho > ⋮ > Despachar máster completo",
    "uso": "Confirmación del Palet Máster (Aceptar / Omitir); mensaje de contenedores hijos despachados con éxito"
   }
  ],
  "tablas": [
   {
    "schema": "efw",
    "tabla": "CONTENEDOR",
    "motivo": "Palet máster y palets hijos asociados en Contenedor Máster (IDCONTENEDOR)",
    "confianza": "alta"
   },
   {
    "schema": "efw",
    "tabla": "CONTENEDORARTICULOS",
    "motivo": "Artículos de los productos consolidados en el máster (IDEXPEDICIONLINEA)",
    "confianza": "media"
   },
   {
    "schema": "efw",
    "tabla": "EXPEDICIONESDETALLE_MASTER",
    "motivo": "Líneas de expedición de distintos pedidos de la misma tienda agrupadas en el máster",
    "confianza": "media"
   },
   {
    "schema": "efw",
    "tabla": "XML_MASTER",
    "motivo": "Documento del máster generado al finalizarlo/despacharlo",
    "confianza": "media"
   },
   {
    "schema": "efw",
    "tabla": "EXPEDICIONESCABECERA",
    "motivo": "Pedidos/expediciones que se despachan y finalizan (MUELLEEXPEDICION)",
    "confianza": "alta"
   },
   {
    "schema": "efw",
    "tabla": "MUELLE_X_RUTA",
    "motivo": "Puerta (muelle) asignada a la ruta, escaneada en Despacho",
    "confianza": "media"
   },
   {
    "schema": "efw",
    "tabla": "VIAJE_WMH",
    "motivo": "Viaje seleccionado en Despacho, creado en Torre de Control",
    "confianza": "media"
   },
   {
    "schema": "efw",
    "tabla": "CONTENEDORVIAJE",
    "motivo": "Máster/contenedores despachados asociados al viaje",
    "confianza": "media"
   },
   {
    "schema": "efw",
    "tabla": "EPALETMOVIMIENTOSALIDA",
    "motivo": "Movimiento de salida del palet al confirmar el despacho",
    "confianza": "media"
   },
   {
    "schema": "wmh_cr",
    "tabla": "journeys",
    "motivo": "Viaje (journey_id, situation, belt_id = banda, closed_by) cerrado al final del día",
    "confianza": "alta"
   },
   {
    "schema": "wmh_cr",
    "tabla": "journey_orders",
    "motivo": "Órdenes del viaje por ruta y banda (route_id, order_id, belt_id, situation)",
    "confianza": "alta"
   }
  ],
  "datosClave": [
   "Palet máster (contenedor máster)",
   "Código del producto/palet proveniente de la banda",
   "Tienda (cliente destino)",
   "Pedidos consolidados en el máster",
   "Puerta / muelle",
   "Número de viaje",
   "Contenedores hijos despachados",
   "Estado de pedidos y viajes (finalizados / cerrados)"
  ],
  "conceptos": [
   {
    "termino": "Contenedor Máster",
    "definicion": "Opción del handheld donde se consolida en un máster vacío la mercancía que llega por banda"
   },
   {
    "termino": "Máster",
    "definicion": "Contenedor que agrupa productos de la misma tienda aunque sean de pedidos diferentes"
   },
   {
    "termino": "Banda transportadora",
    "definicion": "Banda por la que llega la mercancía preparada (mesanín) hacia consolidación"
   },
   {
    "termino": "Despachar máster completo",
    "definicion": "Opción del menú de tres puntos que despacha todos los contenedores hijos del máster"
   },
   {
    "termino": "Cierre nocturno",
    "definicion": "Verificación al final del día de pedidos finalizados y cierre de los viajes"
   }
  ],
  "entradaDe": [
   "CEDI-01",
   "CEDI-06",
   "CEDI-07"
  ],
  "salidaA": [
   "CEDI-09"
  ],
  "notas": [
   "SIPOC: proveedor banda transportadora; entradas máster vacío (almacén de máster) y producto de banda; salida máster despachado por puerta.",
   "La opción Contenedor Máster está dentro del menú Picking, despacho y reposiciones del handheld.",
   "Al despachar, el sistema pide confirmar el Palet Máster (Aceptar / Omitir) y confirma 'contenedores hijos despachados con éxito'.",
   "La pantalla Despacho muestra el muelle, el número de viaje y el listado de másteres asociados al viaje.",
   "Al finalizar el máster queda disponible (ubicación libre) para ser utilizado nuevamente.",
   "Roles del diagrama: Operario de Consolidación (arma el máster) y Despachador (despacha y cierra viajes).",
   "Cada ruta está asignada a una banda y a un muelle desde la Torre de Control (notas de campo); en EPA no existe banda."
  ],
  "decisiones": [
   "¿Se debe agregar el producto al mismo Master? Sí → agregar producto al Master; No → utilizar otro Master",
   "¿Hay más productos para agregar? Sí → escanear siguiente producto; No → retirar de la banda y finalizar Master",
   "¿Hay otro Master pendiente? Sí → repetir; No → finalizar operaciones del día",
   "¿Todos los pedidos están finalizados? No → revisar y finalizar/corregir pedidos pendientes; Sí → finalizar los viajes (cierre nocturno)"
  ],
  "relacionados": [
   {
    "silo": "log_preparacion",
    "nombre": "S5 · Consolidación por ruta"
   }
  ],
  "documentos": [
   {
    "tipo": "procedimiento",
    "titulo": "Procedimiento",
    "archivo": "P8 - Despacho de bandas Cofersa.docx",
    "path": "procedimientos/P8 - Despacho de bandas Cofersa.docx"
   },
   {
    "tipo": "manual",
    "titulo": "Manual de usuario",
    "archivo": "Manual - Despacho de bandas Cofersa.docx",
    "path": "manuales/P8 - Manual Despacho de bandas Cofersa.docx"
   }
  ]
 },
 "CEDI-10": {
  "codigo": "CEDI-10",
  "num": 10,
  "nombre": "Despacho de original Cofersa",
  "nodo": "CEDI-10 · Despacho de original Cofersa",
  "compania": "COFERSA",
  "silo": "log_transporte",
  "siloLabel": "OL.4 · Transporte",
  "macro": "S3 · Despacho",
  "nodoExistente": "Despacho de original Cofersa",
  "objetivo": "Establecer el procedimiento de despacho de las tarimas de mercancía original de Cofersa, garantizando su envío a la ruta y puerta correctas.",
  "alcance": "Aplica desde la verificación de la tarima hasta su despacho final por la puerta correspondiente.",
  "responsables": [
   "Personal de despacho de original"
  ],
  "pasos": [
   {
    "texto": "Verificar que los artículos de la tarima correspondan al mismo cliente",
    "sistema": "fisico",
    "pantalla": null
   },
   {
    "texto": "Ingresar al WMS con usuario, contraseña e información extra del encargado",
    "sistema": "handheld",
    "pantalla": "eWMS - CEDI OLO (menú principal)"
   },
   {
    "texto": "En el handheld usar la opción Ubicación Libre y escanear el palet máster",
    "sistema": "handheld",
    "pantalla": "Almacenaje > Ubicación Libre"
   },
   {
    "texto": "Revisar la ruta asignada a esa tarima",
    "sistema": "handheld",
    "pantalla": "Ubicación Libre (detalle del palet)"
   },
   {
    "texto": "Trasladar la tarima a la posición de su número de ruta (rutas-puertas se actualizan a diario)",
    "sistema": "fisico",
    "pantalla": null
   },
   {
    "texto": "Escanear el código de la puerta de destino",
    "sistema": "handheld",
    "pantalla": "Ubicación Libre"
   },
   {
    "texto": "Ingresar a Despacho e indicar el muelle correspondiente (código de puerta)",
    "sistema": "handheld",
    "pantalla": "Picking, despacho y reposiciones > Despacho"
   },
   {
    "texto": "Seleccionar el número de viaje correspondiente",
    "sistema": "handheld",
    "pantalla": "Despacho (listado de viajes del muelle)"
   },
   {
    "texto": "En el menú de tres puntos seleccionar Despachar Máster Completo",
    "sistema": "handheld",
    "pantalla": "Despacho > ⋮ > Despachar máster completo"
   },
   {
    "texto": "Escanear el máster para confirmar el despacho",
    "sistema": "handheld",
    "pantalla": "Confirmación del Palet Máster (Aceptar / Omitir)"
   },
   {
    "texto": "Acomodar la tarima junto a la puerta correspondiente",
    "sistema": "fisico",
    "pantalla": null
   }
  ],
  "registros": [
   "Confirmaciones de despacho de máster en el handheld."
  ],
  "noConformidades": [
   "Envío de un producto que no correspondía al pedido o al cliente."
  ],
  "pantallas": [
   {
    "sistema": "handheld",
    "ruta": "Almacenaje > Almacenamiento de mercadería > Ubicación Libre",
    "uso": "Lectura del palet origen (máster), detalle, ubicación sugerida y referencia; lectura de la puerta y confirmación de movimiento exitoso"
   },
   {
    "sistema": "handheld",
    "ruta": "Picking, despacho y reposiciones > Despacho",
    "uso": "Lectura del muelle, listado de números de viaje del muelle y selección del viaje"
   },
   {
    "sistema": "handheld",
    "ruta": "Despacho > ⋮ > Despachar máster completo",
    "uso": "Despacho del máster con confirmación del Palet Máster (Aceptar / Omitir)"
   }
  ],
  "tablas": [
   {
    "schema": "efw",
    "tabla": "CONTENEDOR",
    "motivo": "Palet máster escaneado en Ubicación Libre y movido a la puerta (IDCONTENEDOR, IDUBICACION)",
    "confianza": "alta"
   },
   {
    "schema": "efw",
    "tabla": "ALMACENMOVIMIENTOS",
    "motivo": "Movimiento de la tarima a la ubicación de la puerta confirmado",
    "confianza": "media"
   },
   {
    "schema": "efw",
    "tabla": "UBICACIONES_BAJADA",
    "motivo": "Ubicación de bajada/puerta destino (IDUBICACION → ALMACENAMIENTOSUBICACIONES)",
    "confianza": "media"
   },
   {
    "schema": "efw",
    "tabla": "MUELLE_X_RUTA",
    "motivo": "Asignación diaria de ruta a muelle/puerta",
    "confianza": "media"
   },
   {
    "schema": "efw",
    "tabla": "EXPEDICIONESCABECERA",
    "motivo": "Expedición y cliente de la tarima (IDCLIENTE, MUELLEEXPEDICION)",
    "confianza": "alta"
   },
   {
    "schema": "efw",
    "tabla": "VIAJE_WMH",
    "motivo": "Número de viaje seleccionado en Despacho",
    "confianza": "media"
   },
   {
    "schema": "efw",
    "tabla": "CONTENEDORVIAJE",
    "motivo": "Máster despachado asociado al viaje",
    "confianza": "media"
   },
   {
    "schema": "efw",
    "tabla": "EXPEDICIONESDETALLE_MASTER",
    "motivo": "Líneas contenidas en el máster que se despacha completo",
    "confianza": "media"
   },
   {
    "schema": "efw",
    "tabla": "EPALETMOVIMIENTOSALIDA",
    "motivo": "Movimiento de salida del palet al confirmar el despacho",
    "confianza": "media"
   },
   {
    "schema": "wmh_cr",
    "tabla": "journeys",
    "motivo": "Viaje de Torre de Control al que se despacha el máster",
    "confianza": "media"
   }
  ],
  "datosClave": [
   "Palet máster",
   "Cliente de la tarima",
   "Ruta asignada",
   "Código de puerta / muelle",
   "Número de viaje",
   "Ubicación sugerida y movimiento confirmado",
   "Confirmación de despacho del máster"
  ],
  "conceptos": [
   {
    "termino": "Mercancía original",
    "definicion": "Tarimas de producto original de Cofersa que se despachan sin pasar por banda"
   },
   {
    "termino": "Ubicación Libre",
    "definicion": "Opción de Almacenaje del handheld para mover el palet máster a la ubicación de la puerta"
   },
   {
    "termino": "Muelle",
    "definicion": "Código de la puerta por la que se despacha el viaje"
   },
   {
    "termino": "Despachar máster completo",
    "definicion": "Opción del menú de tres puntos que despacha el máster y sus contenedores"
   }
  ],
  "entradaDe": [
   "CEDI-01",
   "CEDI-06",
   "CEDI-07"
  ],
  "salidaA": [
   "CEDI-09"
  ],
  "notas": [
   "SIPOC: proveedor Área de Alistamiento; entradas tarima original, palet máster, código de puerta y número de viaje; salida tarima despachada por la puerta.",
   "Ubicación Libre está en Almacenaje > Almacenamiento de mercadería del handheld; muestra detalle del palet, ubicación sugerida y referencia de la tarima.",
   "Al escanear la puerta, Ubicación Libre confirma el movimiento exitoso.",
   "Despacho lista los números de viaje disponibles en el muelle y pide confirmar la selección del viaje.",
   "Las mismas rutas pueden tener diferentes puertas cada día.",
   "Ante un producto que no corresponde se debe verificar nuevamente la ruta y el Master.",
   "Todas las actividades las ejecuta el Operario de Despacho (entidad única)."
  ],
  "decisiones": [
   "El diagrama es lineal (sin rombos de decisión); error anotado: se lleva un producto que no corresponde → verificar nuevamente la ruta y el Master"
  ],
  "relacionados": [],
  "documentos": [
   {
    "tipo": "procedimiento",
    "titulo": "Procedimiento",
    "archivo": "P10 - Despacho de original Cofersa.docx",
    "path": "procedimientos/P10 - Despacho de original Cofersa.docx"
   },
   {
    "tipo": "manual",
    "titulo": "Manual de usuario",
    "archivo": "Manual - Despacho de original Cofersa.docx",
    "path": "manuales/P10 - Manual Despacho de original Cofersa.docx"
   }
  ]
 },
 "CEDI-04": {
  "codigo": "CEDI-04",
  "num": 4,
  "nombre": "Despacho EPA",
  "nodo": "CEDI-04 · Despacho EPA",
  "compania": "EPA",
  "silo": "log_transporte",
  "siloLabel": "OL.4 · Transporte",
  "macro": "S3 · Despacho",
  "nodoExistente": "Despacho EPA",
  "objetivo": "Definir el procedimiento de carga de camiones y verificación de expediciones para la distribución de la mercancía de Ferretería EPA hacia las tiendas, mediante la aplicación Apolo y el módulo de Carga Camión.",
  "alcance": "Aplica a las operaciones de despacho de tarimas hacía tienda, desde la asignación del contenedor hasta la generación del reporte final de carga.",
  "responsables": [
   "Personal de despacho EPA"
  ],
  "pasos": [
   {
    "texto": "Iniciar el proceso diariamente a las 5:00 a. m.",
    "sistema": "fisico",
    "pantalla": null
   },
   {
    "texto": "Ingresar a la app Apolo con las credenciales del encargado",
    "sistema": "apolo",
    "pantalla": "Áreas de trabajo > Despacho"
   },
   {
    "texto": "En Despacho EPA controlar la mercancía que sale y la que no; cada tarima tiene dos fotos (esquina y general)",
    "sistema": "apolo",
    "pantalla": "Despacho > Despachos EPA"
   },
   {
    "texto": "Ingresar a eFLOW WMS con las credenciales del encargado",
    "sistema": "eflow",
    "pantalla": "Ingreso eFlow"
   },
   {
    "texto": "En Documentos usar Carga Camión y Asignación de Expediciones de Camión",
    "sistema": "eflow",
    "pantalla": "Documentos > Carga Camión / Asignación Exp. Camión"
   },
   {
    "texto": "En el handheld, dentro de Carga Camión, filtrar las expediciones por compañía y tienda",
    "sistema": "handheld",
    "pantalla": "Picking, despacho y reposiciones > Carga Camión"
   },
   {
    "texto": "Seleccionar la tienda, ver sus expediciones y presionar \"+\" para incluirlas (filtro asignadas / no asignadas)",
    "sistema": "eflow",
    "pantalla": "Documentos > Asignación Exp. Camión > Asignar Expediciones"
   },
   {
    "texto": "Asignar al contenedor el marchamo correspondiente, anotando el número de tienda",
    "sistema": "fisico",
    "pantalla": null
   },
   {
    "texto": "Crear el despacho del viaje: Nuevo > Agregar, ingresar la información del contenedor y guardar",
    "sistema": "apolo",
    "pantalla": "EPA Dev > + Nuevo (Nuevo despacho)"
   },
   {
    "texto": "En Detalles Despacho ver tarimas cargadas por color: azul (sencilla), naranja (doble), gris (vacío)",
    "sistema": "apolo",
    "pantalla": "Detalle Despacho (Carga del Despacho)"
   },
   {
    "texto": "Por tarima: Tomar Foto (dos fotos) y escanear el QR; tipo S verde, D azul, T gris, C rojo",
    "sistema": "apolo",
    "pantalla": "Detalle Despacho > Tomar Foto > Escaneá los QR de esta tarima"
   },
   {
    "texto": "Completar en el handheld Muelle (puerta), Placa (tienda), Cédula (placa del contenedor) y Marchamo",
    "sistema": "handheld",
    "pantalla": "Carga Camión (Muelle, Placa, Cédula)"
   },
   {
    "texto": "Escanear el palet dos veces con el handheld para confirmar la carga y el despacho",
    "sistema": "handheld",
    "pantalla": "Carga Camión > Validar Palet / Cargar Palet"
   },
   {
    "texto": "Trasladar las tarimas (de dos en dos si es posible) desde las líneas por tienda hasta la puerta",
    "sistema": "fisico",
    "pantalla": null
   },
   {
    "texto": "Repetir el procedimiento hasta completar la carga del contenedor",
    "sistema": "handheld",
    "pantalla": "Carga Camión"
   },
   {
    "texto": "Imprimir el Reporte de Carga Camión (para cobro) y entregarlo al chofer; retorna sellado por la tienda",
    "sistema": "eflow",
    "pantalla": "Carga Camión > Reportes > Carga"
   },
   {
    "texto": "En Carga Camión, menú de tres puntos > Insumos Carga Camión, descontar las tarimas aplicadas a EPA",
    "sistema": "eflow",
    "pantalla": "Documentos > Carga Camión > Insumos Carcam"
   },
   {
    "texto": "Generar en Reportes > Carga el Reporte de Carga Camión con cédula, marchamo y número de viaje (CC)",
    "sistema": "eflow",
    "pantalla": "Carga Camión > Reportes > Carga"
   },
   {
    "texto": "Al finalizar la carga el sistema envía un correo automático con el reporte a la tienda y jefes de OLO",
    "sistema": "correo",
    "pantalla": null
   },
   {
    "texto": "Generar el Excel de control con lo cargado (unidad, artículo, palet y referencia)",
    "sistema": "excel_drive",
    "pantalla": "Carga Camión > Despacho EPA (Reporte Despacho Epa)"
   }
  ],
  "registros": [
   "Reporte de Carga Camión.",
   "Correo automático de reporte enviado a la tienda y a los jefes de OLO.",
   "Archivo Excel de control de carga."
  ],
  "noConformidades": [
   "Ausencia física del producto respecto a lo registrado en el sistema, lo cual requiere el reporte de faltantes.",
   "Falta de disponibilidad del artículo.",
   "Tarimas despachadas sin realizar el proceso de carga camión.",
   "Tarimas cargadas en un contenedor distinto al correspondiente.",
   "Tarimas no asignadas correctamente a su destino, lo que genera retrasos en la carga.",
   "Artículos ingresados físicamente en cross docking sin el pegado correspondiente del palet.",
   "Tarimas rotas o mal acomodadas."
  ],
  "pantallas": [
   {
    "sistema": "apolo",
    "ruta": "Áreas de trabajo > Despacho > Despachos EPA",
    "uso": "Control de la mercancía que sale y no sale, con dos fotos por tarima como respaldo ante reclamos"
   },
   {
    "sistema": "apolo",
    "ruta": "EPA Dev > + Nuevo (Nuevo despacho)",
    "uso": "Crear despacho con Referencia (EPA-fecha-hora-Tienda), Tienda, Placa del contenedor, Marchamo, Puerta de carga y Chofer"
   },
   {
    "sistema": "apolo",
    "ruta": "Detalle Despacho (Carga del Despacho)",
    "uso": "Mapa de posiciones del contenedor (ej. 24) con ocupación y conteo de sencillas/dobles; botón Tomar Foto; menú de tres puntos > Finalizar"
   },
   {
    "sistema": "apolo",
    "ruta": "Tomar Foto > Escaneá los QR de esta tarima",
    "uso": "Detectar los códigos QR de palet, marcar Tarima Proveedor y guardar como tarima S/D/T/C"
   },
   {
    "sistema": "eflow",
    "ruta": "Documentos > Asignación Exp. Camión (Expedición Camión)",
    "uso": "Pestañas Asignaciones y Asignar Expediciones; listado de expediciones sin asignar por cliente con Viaje WMH, ruta, bultos, peso y volumen"
   },
   {
    "sistema": "eflow",
    "ruta": "Documentos > Carga Camión (Salidas)",
    "uso": "Ver cargas en proceso y terminadas; menú de tres puntos > Insumos Carcam; Reportes > Carga; opción Despacho EPA para exportar Excel"
   },
   {
    "sistema": "handheld",
    "ruta": "Picking, despacho y reposiciones > Carga Camión",
    "uso": "Filtrar expediciones, capturar Muelle/Placa/Cédula/Marchamo, Validar Palet y Cargar Palet; Finalizar carga y pantalla de Pendientes (forzar)"
   }
  ],
  "tablas": [
   {
    "schema": "efw",
    "tabla": "EXPEDICIONESCABECERA",
    "motivo": "Expediciones de tienda EPA a asignar y cargar (IDEXPEDICION, IDCLIENTE, MUELLEEXPEDICION)",
    "confianza": "alta"
   },
   {
    "schema": "efw",
    "tabla": "EXPEDICIONCAMION",
    "motivo": "Asignación de expediciones al camión (IDCAMION, FECHAASIGNACION, USUARIOASIGNACION)",
    "confianza": "alta"
   },
   {
    "schema": "efw",
    "tabla": "AUDIT_EXPEDICIONCAMION",
    "motivo": "Auditoría de cambios en la asignación expedición-camión",
    "confianza": "media"
   },
   {
    "schema": "efw",
    "tabla": "CARGACAMION_TRAMITE",
    "motivo": "Carga camión en proceso / finalizada del módulo Carga Camión",
    "confianza": "media"
   },
   {
    "schema": "efw",
    "tabla": "CONTENEDORVIAJE",
    "motivo": "Palets cargados asociados al viaje/contenedor (número CC)",
    "confianza": "media"
   },
   {
    "schema": "efw",
    "tabla": "VIAJE_WMH",
    "motivo": "Viaje WMH mostrado en la asignación de expediciones",
    "confianza": "media"
   },
   {
    "schema": "efw",
    "tabla": "CONTENEDOR",
    "motivo": "Palet escaneado dos veces para validar y cargar (IDCONTENEDOR)",
    "confianza": "alta"
   },
   {
    "schema": "efw",
    "tabla": "CONTENEDORARTICULOS",
    "motivo": "Detalle de artículos del palet cargado (IDEXPEDICIONLINEA) para reporte y Excel",
    "confianza": "alta"
   },
   {
    "schema": "efw",
    "tabla": "ALMACENMOVIMIENTOS_CARCAM",
    "motivo": "Movimientos de insumos de carga camión (Insumos Carcam)",
    "confianza": "media"
   },
   {
    "schema": "efw",
    "tabla": "EPALETMOVIMIENTOSALIDA",
    "motivo": "Salida de tarimas (insumo) descontadas y aplicadas a EPA",
    "confianza": "media"
   },
   {
    "schema": "efw",
    "tabla": "EPALETTIPOPALETS",
    "motivo": "Tipos de tarima/palet usados en el despacho",
    "confianza": "media"
   },
   {
    "schema": "efw",
    "tabla": "MARCHAMO_INCIDENCIAS",
    "motivo": "Incidencias del marchamo (sello de seguridad) del contenedor",
    "confianza": "media"
   },
   {
    "schema": "efw",
    "tabla": "MONITORACCIONES",
    "motivo": "Acciones de carga que el handheld ejecuta en Carga Camión",
    "confianza": "media"
   }
  ],
  "datosClave": [
   "Compañía (Ferretería EPA) y tienda destino (T2 Curridabat a T8 Cartago)",
   "Expediciones asignadas / no asignadas al camión",
   "Referencia del despacho en Apolo (EPA-fecha-hora-tienda)",
   "Placa / cédula del contenedor",
   "Marchamo (sello de seguridad)",
   "Muelle / puerta de carga",
   "Chofer",
   "Código QR / ID de palet",
   "Tipo de tarima (S, D, T, C) y ocupación del contenedor",
   "Dos fotografías por tarima",
   "Número de viaje (CC)",
   "Tarimas de insumo descontadas",
   "Detalle cargado: unidad, artículo, palet y referencia"
  ],
  "conceptos": [
   {
    "termino": "Carga Camión",
    "definicion": "Módulo de eFLOW y handheld para asignar expediciones, validar y cargar palets en el contenedor"
   },
   {
    "termino": "Marchamo",
    "definicion": "Sello de seguridad del contenedor que la tienda verifica al recibir; si llega abierto, se abrió en tránsito"
   },
   {
    "termino": "Cédula",
    "definicion": "Placa del contenedor capturada en el handheld"
   },
   {
    "termino": "Muelle",
    "definicion": "Puerta de carga asignada a la tienda"
   },
   {
    "termino": "Número de viaje (CC)",
    "definicion": "Consecutivo generado al finalizar la carga con año, día y hora/segundos del cierre"
   },
   {
    "termino": "Tipos de tarima",
    "definicion": "S verde sencilla, D azul doble, T gris triple, C rojo cuádruple"
   },
   {
    "termino": "Insumos Carga Camión",
    "definicion": "Opción para descontar del sistema las tarimas aplicadas a EPA"
   },
   {
    "termino": "Apolo",
    "definicion": "App de OLO donde Despacho EPA registra despachos, fotos y QR de cada tarima"
   }
  ],
  "entradaDe": [
   "CEDI-02",
   "CEDI-03"
  ],
  "salidaA": [],
  "notas": [
   "Tras registrar todas las tarimas, en Apolo el menú de tres puntos > Finalizar cierra el despacho; si no tiene chofer queda como \"Chofer pendiente\" y la boleta se genera al asignarlo.",
   "En el handheld, Finalizar carga pide confirmación; si hay palets no cargados aparece la pantalla Pendientes, desde donde se puede forzar el cierre.",
   "La pantalla de QR en Apolo detecta los códigos de palet eflow WMS de la tarima e incluye la casilla Tarima Proveedor.",
   "El Nuevo despacho en Apolo marca como obligatorios la Placa del contenedor y el Marchamo; la Puerta de carga se elige de una lista (ej. Puerta 11).",
   "La asignación de expediciones muestra Id Sucursal, Id Expedición, Viaje WMH, Cliente, Ruta, Fecha Expedición, Unidad Transporte, Prioridad, Bultos, Peso y Volumen.",
   "El sistema agrega los pedidos, Torre de Control los asigna y Despacho EPA inicia la carga; los alistadores dejan las tarimas dentro de las líneas de cada tienda marcadas en el piso.",
   "El reporte sellado sirve como control de los viajes que hace el transportista con EPA.",
   "Las tiendas retienen las tarimas de envío y devuelven las vacías al almacén cuando se acumulan."
  ],
  "decisiones": [
   "¿Qué tienda se va a cargar? → Tienda 2 Curridabat, 3 Escazú, 4 Belén, 5 Tibás, 6 Desamparados, 7 Liberia u 8 Cartago",
   "¿La expedición está asignada? No → asignar expedición; Sí → revisar expedición",
   "¿Hay tarimas disponibles? No → esperar a que terminen de empacar la tarima; Sí → tomar tarimas",
   "¿Se pueden cargar dos? Sí → tomar dos tarimas; No → tomar una tarima",
   "¿El contenedor está lleno? No → cargar siguiente tarima; Sí → finalizar carga y generar número de viaje (CC)",
   "¿La carga contiene un solo producto? Sí → llevar directamente al almacén de la tienda; No → desarmar la tarima y guardar cada producto",
   "Reclamo de tienda: ¿el reclamo es correcto? Sí → reportar error; No → usar evidencia fotográfica",
   "¿La mercancía está físicamente? No → enviar reporte de faltantes o errores (revisar en Apolo); Sí → continuar proceso"
  ],
  "relacionados": [
   {
    "silo": "log_preparacion",
    "nombre": "S6 · Documentación de despacho"
   }
  ],
  "documentos": [
   {
    "tipo": "procedimiento",
    "titulo": "Procedimiento",
    "archivo": "P4 - Despacho EPA.docx",
    "path": "procedimientos/P4 - Despacho EPA.docx"
   },
   {
    "tipo": "manual",
    "titulo": "Manual de usuario",
    "archivo": "Manual - Despacho EPA.docx",
    "path": "manuales/P4 - Manual Despacho EPA.docx"
   }
  ]
 },
 "CEDI-09": {
  "codigo": "CEDI-09",
  "num": 9,
  "nombre": "Transporte Cofersa",
  "nodo": "CEDI-09 · Transporte Cofersa",
  "compania": "COFERSA",
  "silo": "log_transporte",
  "siloLabel": "OL.4 · Transporte",
  "macro": "S4 · Ejecución de la entrega",
  "nodoExistente": "Transporte Cofersa",
  "objetivo": "Establecer el procedimiento de asignación de choferes, generación de guías y control documental de los envíos de Cofersa.",
  "alcance": "Aplica desde la asignación del chofer a la ruta hasta la devolución de la factura firmada.",
  "responsables": [
   "Encargado de transporte",
   "choferes"
  ],
  "pasos": [
   {
    "texto": "Ingresar al sistema con usuario, contraseña e información extra del encargado",
    "sistema": "torre",
    "pantalla": null
   },
   {
    "texto": "En WMH (Torre de Control) asignar un chofer a la ruta correspondiente",
    "sistema": "torre",
    "pantalla": "Torre de Control (WMH) > Viajes"
   },
   {
    "texto": "En eFLOW ingresar a Carga Camión Directa y seleccionar todo para realizar la carga del camión",
    "sistema": "eflow",
    "pantalla": "Carga Camión Directa"
   },
   {
    "texto": "En Solo Carga Camión filtrar por viaje",
    "sistema": "eflow",
    "pantalla": "Carga Camión"
   },
   {
    "texto": "Generar la guía del viaje filtrado (clientes, factura, nombre del pedido); una guía por ruta",
    "sistema": "eflow",
    "pantalla": "Carga Camión > Guía"
   },
   {
    "texto": "Reunir las facturas emitidas por Softland (Hacienda) y asignarlas al chofer correspondiente",
    "sistema": "fisico",
    "pantalla": null
   },
   {
    "texto": "Entregar al chofer la hoja de despacho junto con la carga",
    "sistema": "fisico",
    "pantalla": null
   },
   {
    "texto": "Recibir del chofer la factura firmada, verificarla y entregarla a Cofersa",
    "sistema": "fisico",
    "pantalla": null
   }
  ],
  "registros": [
   "Guías de despacho por ruta.",
   "Facturas firmadas."
  ],
  "noConformidades": [
   "Solicitud de cambio de ruta que no se ejecuta.",
   "Carga incorrecta de mercancía."
  ],
  "pantallas": [
   {
    "sistema": "torre",
    "ruta": "Torre de Control (WMH) > Viajes",
    "uso": "Seleccionar la ruta y asignarle el chofer; la información pasa a eFlow"
   },
   {
    "sistema": "eflow",
    "ruta": "Carga Camión Directa",
    "uso": "Seleccionar todos los pedidos o expediciones y realizar la carga del camión"
   },
   {
    "sistema": "eflow",
    "ruta": "Carga Camión",
    "uso": "Filtrar por número de viaje y generar/imprimir la guía del viaje"
   }
  ],
  "tablas": [
   {
    "schema": "wmh_cr",
    "tabla": "journeys",
    "motivo": "Viaje/ruta al que se asigna el chofer (journey_id, situation)",
    "confianza": "alta"
   },
   {
    "schema": "wmh_cr",
    "tabla": "journey_order_transportation",
    "motivo": "Asignación de chofer y unidad al viaje (driver_id, unit_id)",
    "confianza": "alta"
   },
   {
    "schema": "wmh_cr",
    "tabla": "drivers",
    "motivo": "Chofer asignado (driver_code, driver_name, driver_phone)",
    "confianza": "alta"
   },
   {
    "schema": "wmh_cr",
    "tabla": "trasportation_units",
    "motivo": "Unidad de transporte del viaje (unit_code, license_plate)",
    "confianza": "media"
   },
   {
    "schema": "wmh_cr",
    "tabla": "distribution_routes",
    "motivo": "Ruta seleccionada para asignar chofer (route_code, route_name)",
    "confianza": "alta"
   },
   {
    "schema": "wmh_cr",
    "tabla": "ext_tms_wms_pedido_factura_mt",
    "motivo": "Facturas por pedido que se reúnen para la guía (num_pedido, num_factura)",
    "confianza": "alta"
   },
   {
    "schema": "efw",
    "tabla": "VIAJE_WMH",
    "motivo": "Viaje WMH replicado en eFlow para filtrar la carga camión",
    "confianza": "media"
   },
   {
    "schema": "efw",
    "tabla": "EXPEDICIONCAMION",
    "motivo": "Carga camión de expediciones (IDEXPEDICION, IDCAMION, FECHAASIGNACION, USUARIOASIGNACION)",
    "confianza": "alta"
   },
   {
    "schema": "efw",
    "tabla": "CARGACAMION_TRAMITE",
    "motivo": "Trámite de carga camión y generación de la guía del viaje",
    "confianza": "media"
   },
   {
    "schema": "efw",
    "tabla": "CHOFERES",
    "motivo": "Chofer disponible en eFlow tras la asignación en WMH",
    "confianza": "media"
   },
   {
    "schema": "efw",
    "tabla": "EXPEDICIONESCABECERA",
    "motivo": "Expediciones (clientes/pedidos) incluidas en la guía",
    "confianza": "alta"
   }
  ],
  "datosClave": [
   "Ruta",
   "Chofer asignado",
   "Número de viaje",
   "Pedidos / expediciones cargadas",
   "Guía de despacho por ruta (clientes, factura, nombre del pedido)",
   "Facturas emitidas por Softland",
   "Hoja de despacho",
   "Factura firmada por el cliente"
  ],
  "conceptos": [
   {
    "termino": "Carga Camión Directa",
    "definicion": "Apartado de eFlow donde se seleccionan todos los pedidos del viaje para cargar el camión"
   },
   {
    "termino": "Guía de viaje",
    "definicion": "Documento por ruta con clientes, factura y nombre del pedido; lo puede imprimir cualquier usuario autorizado"
   },
   {
    "termino": "Hoja de despacho",
    "definicion": "Documento que acompaña al chofer durante el viaje"
   },
   {
    "termino": "Factura firmada",
    "definicion": "Factura firmada por el cliente, comprobante de entrega que se devuelve a Cofersa"
   }
  ],
  "entradaDe": [
   "CEDI-01",
   "CEDI-07",
   "CEDI-08",
   "CEDI-10"
  ],
  "salidaA": [
   "CEDI-14"
  ],
  "notas": [
   "No existe manual de usuario para este proceso; información tomada del procedimiento, el diagrama y las notas de campo.",
   "Tras asignar el chofer en WMH, la información aparece automáticamente en eFlow (Carga Camión Directa).",
   "Cada ruta tiene una guía diferente; al terminar una guía se continúa con el siguiente viaje.",
   "Roles del diagrama: Coordinador de Carga (asigna, carga y genera guía) y Chofer (carga, entrega y regresa facturas firmadas).",
   "La factura firmada por el cliente sirve como comprobante de entrega."
  ],
  "decisiones": [
   "¿Hay otra ruta o viaje? Sí → seleccionar siguiente viaje y generar su guía; No → tomar las facturas correspondientes y asociarlas con la guía"
  ],
  "relacionados": [
   {
    "silo": "log_transporte",
    "nombre": "S2 · Asignación de flota"
   },
   {
    "silo": "log_transporte",
    "nombre": "S5 · Prueba de entrega (POD)"
   }
  ],
  "documentos": [
   {
    "tipo": "procedimiento",
    "titulo": "Procedimiento",
    "archivo": "P9 - Transporte Cofersa.docx",
    "path": "procedimientos/P9 - Transporte Cofersa.docx"
   }
  ]
 },
 "CEDI-03": {
  "codigo": "CEDI-03",
  "num": 3,
  "nombre": "Cross Docking",
  "nodo": "CEDI-03 · Cross Docking",
  "compania": "CEDI",
  "silo": "cross_docking",
  "siloLabel": "OL.9 · Cross Docking",
  "macro": "S2 · Cross-docking en piso (procedimiento CEDI)",
  "nodoExistente": "Cross Docking",
  "objetivo": "Establecer el procedimiento para la distribución directa de la mercancía recibida hacia los pedidos de tienda, sin pasar por almacenamiento, mediante el uso del handheld.",
  "alcance": "Aplica a toda la mercancía gestionada bajo la modalidad de cross docking, desde la verificación del expediente hasta la entrega en despacho.",
  "responsables": [
   "Personal operativo de cross docking"
  ],
  "pasos": [
   {
    "texto": "Ingresar al WMS en el handheld con las credenciales del encargado (usuario, recurso, almacén)",
    "sistema": "handheld",
    "pantalla": "eWMS - CEDI OLO (menú principal)"
   },
   {
    "texto": "Verificar el expediente del pedido en el handheld",
    "sistema": "handheld",
    "pantalla": "Recibo > Validación Crossdocking General"
   },
   {
    "texto": "Transportar la tarima al buffer",
    "sistema": "fisico",
    "pantalla": null
   },
   {
    "texto": "Ingresar en el handheld los datos del personal que ejecutará la actividad",
    "sistema": "handheld",
    "pantalla": "eWMS - CEDI OLO (menú principal)"
   },
   {
    "texto": "Ingresar a la opción Recibo (en cross docking siempre se accede por esta vía)",
    "sistema": "handheld",
    "pantalla": "Recibo (Recibo de mercadería)"
   },
   {
    "texto": "Ingresar a Validación Cross Docking (todas las tiendas) y luego a Validación General (expedientes abiertos)",
    "sistema": "handheld",
    "pantalla": "Recibo de mercadería > Validación Crossdocking General / Validación General"
   },
   {
    "texto": "Ingresar a Artículo para iniciar la distribución y escanear el código del producto",
    "sistema": "handheld",
    "pantalla": "Validación Crossdocking > Artículo"
   },
   {
    "texto": "Escanear paleta/licencia y revisar el Packing List impreso (orden, cantidad, bultos, peso, volumen)",
    "sistema": "handheld",
    "pantalla": "Recepción (N.Confirmación, Palet)"
   },
   {
    "texto": "Escanear el código de cada artículo a medida que se retira de la tarima",
    "sistema": "handheld",
    "pantalla": "Validación Crossdocking > Artículo"
   },
   {
    "texto": "Revisar cliente, tienda, referencia y cantidad solicitada para calcular el número de cajas necesarias",
    "sistema": "handheld",
    "pantalla": "Validación Crossdocking (detalle del artículo)"
   },
   {
    "texto": "Distribuir los artículos y escanear el palet de destino para registrar lo acomodado físicamente",
    "sistema": "handheld",
    "pantalla": "Validación Crossdocking > Menú > Cerrar pallet pendiente"
   },
   {
    "texto": "Verificar en eFLOW el progreso del expediente, con avance mínimo aceptable del 99 %",
    "sistema": "eflow",
    "pantalla": "Recepciones (Entradas) - columna Avance %"
   },
   {
    "texto": "Cerrar y emplasticar el palet",
    "sistema": "fisico",
    "pantalla": null
   },
   {
    "texto": "Reportar al cliente sobrantes o mermas; el cliente decide si cierra o no el expediente",
    "sistema": "correo",
    "pantalla": null
   },
   {
    "texto": "Trasladar la tarima al despacho de la tienda correspondiente",
    "sistema": "fisico",
    "pantalla": null
   },
   {
    "texto": "Continuar con el siguiente pedido sin esperar la confirmación del cliente",
    "sistema": "handheld",
    "pantalla": "Recibo > Validación Crossdocking General"
   }
  ],
  "registros": [
   "Expedientes validados en eFLOW.",
   "Packing list."
  ],
  "noConformidades": [
   "Cantidad insuficiente de artículos para completar el pedido.",
   "Confusión de tarima durante el alistamiento, al acomodar un artículo en la tarima incorrecta.",
   "Envío de una tarima al despacho incorrecto.",
   "Envío de una cantidad incorrecta de artículos."
  ],
  "pantallas": [
   {
    "sistema": "handheld",
    "ruta": "eWMS - CEDI OLO (menú principal) > Recibo",
    "uso": "Acceso con Usuario, Recurso y Almacén 0001; Recibo agrupa recibo de compras/producción y de traslados/devoluciones"
   },
   {
    "sistema": "handheld",
    "ruta": "Recibo de mercadería (Cross Banda / Recepción / Validación Crossdocking General / Validación General)",
    "uso": "Submenú de recibo desde el que se entra a la validación cross docking"
   },
   {
    "sistema": "handheld",
    "ruta": "Recepción",
    "uso": "Captura del N.Confirmación y lectura del Palet a verificar"
   },
   {
    "sistema": "handheld",
    "ruta": "Validación Crossdocking (detalle del artículo)",
    "uso": "Muestra C.Barras, Artículo, Referencia, descripción, Pedido, Cliente (tienda), Cantidad, Pres. Pedido, Factor, Motivo y Palet destino"
   },
   {
    "sistema": "handheld",
    "ruta": "Validación Crossdocking > Menú",
    "uso": "Opciones Cambiar recepción, Regresar y Cerrar pallet pendiente (listado y filtro por ID de contenedor)"
   },
   {
    "sistema": "eflow",
    "ruta": "Recepciones (Entradas)",
    "uso": "Filtrar la recepción por criterios y revisar el Avance % del expediente (mínimo 99 %)"
   },
   {
    "sistema": "eflow",
    "ruta": "Control / Documentos > Operación en Tiempo Real",
    "uso": "Panel informativo: total tareas, recepciones, expediciones, Fill Rate alisto/recibo, ocupación y carga de trabajo por tipo"
   }
  ],
  "tablas": [
   {
    "schema": "efw",
    "tabla": "RECEPCIONESCABECERA",
    "motivo": "Expediente de recepción abierto que se valida y cuyo avance se revisa (IDRECEPCION)",
    "confianza": "alta"
   },
   {
    "schema": "efw",
    "tabla": "RECEPCIONESDETALLE",
    "motivo": "Líneas de artículos del expediente recibido (IDARTICULO, IDRECEPCIONLINEA)",
    "confianza": "alta"
   },
   {
    "schema": "efw",
    "tabla": "RECEPCIONESCONFIRMACIONES",
    "motivo": "N.Confirmación de recepción capturado en el handheld",
    "confianza": "media"
   },
   {
    "schema": "efw",
    "tabla": "RECEPCIONCONFIRMACIONPALETARTICULO",
    "motivo": "Palet/licencia recibido verificado contra el Packing List",
    "confianza": "media"
   },
   {
    "schema": "efw",
    "tabla": "CROSSDOCKING_PLANTILLA",
    "motivo": "Plantilla de distribución cross docking hacia tiendas",
    "confianza": "media"
   },
   {
    "schema": "efw",
    "tabla": "CROSSDOCKING_PLANTILLA_PED",
    "motivo": "Pedidos de tienda asociados a la plantilla de distribución",
    "confianza": "media"
   },
   {
    "schema": "efw",
    "tabla": "CROSSDOCKING_UBICACION_CLIENTE",
    "motivo": "Ubicación/palet destino por cliente (tienda) en cross docking",
    "confianza": "media"
   },
   {
    "schema": "efw",
    "tabla": "UBICACIONES_BAJADA_CROSS",
    "motivo": "Ubicaciones de bajada cross docking por cliente (IDCLIENTE, IDUBICACION)",
    "confianza": "media"
   },
   {
    "schema": "efw",
    "tabla": "EXPEDICIONESCABECERA",
    "motivo": "Pedido de tienda destino (ej. 0010002345-002, cliente T002)",
    "confianza": "alta"
   },
   {
    "schema": "efw",
    "tabla": "CONTENEDOR",
    "motivo": "Palet de destino escaneado y pallet pendiente por cerrar (IDCONTENEDOR)",
    "confianza": "alta"
   },
   {
    "schema": "efw",
    "tabla": "CONTENEDORARTICULOS",
    "motivo": "Artículos acomodados en el palet ligando IDRECEPCIONLINEA con IDEXPEDICIONLINEA",
    "confianza": "alta"
   },
   {
    "schema": "efw",
    "tabla": "RECURSOS",
    "motivo": "Recurso del operario mostrado en el handheld (ej. VA13)",
    "confianza": "alta"
   }
  ],
  "datosClave": [
   "Número de expediente / recepción",
   "Número de confirmación",
   "Paleta o licencia recibida",
   "Packing List (orden, cantidad, bultos, peso, volumen)",
   "Código de barras y artículo",
   "Referencia",
   "Pedido de tienda",
   "Cliente / tienda destino",
   "Cantidad solicitada y factor",
   "Número de cajas necesarias",
   "Palet de destino (ID de contenedor)",
   "Avance % del expediente",
   "Sobrantes o mermas"
  ],
  "conceptos": [
   {
    "termino": "Cross docking",
    "definicion": "Distribución directa de mercancía recibida a pedidos de tienda sin pasar por almacenamiento"
   },
   {
    "termino": "Expediente",
    "definicion": "Recepción abierta en eFLOW que se valida y distribuye hacia las tiendas"
   },
   {
    "termino": "Buffer",
    "definicion": "Zona intermedia donde se coloca la tarima recibida antes de distribuirla"
   },
   {
    "termino": "Packing List",
    "definicion": "Lista impresa del palet/licencia con orden, cantidad, bultos, peso y volumen"
   },
   {
    "termino": "Pallet pendiente",
    "definicion": "Palet destino abierto que se cierra desde el menú del handheld al terminar de acomodar"
   },
   {
    "termino": "Avance %",
    "definicion": "Progreso del expediente en eFLOW; el mínimo aceptable es 99 %"
   }
  ],
  "entradaDe": [],
  "salidaA": [
   "CEDI-04"
  ],
  "notas": [
   "SIPOC: proveedor Área de Recepción; entrada expediente de recepción abierto (Sistema WMS) y Packing List impreso; salida tarima distribuida y despachada a la tienda destino y reporte de sobrantes o merma al cliente.",
   "El submenú Recibo de mercadería del handheld incluye Cross Banda, Recepción, Validación Crossdocking General y Validación General.",
   "La pantalla Validación Crossdocking muestra C.Barras, Artículo, Referencia, Pedido, Cliente (ej. 002-T002 CURRI), Cantidad, Pres. Pedido, Factor, Motivo y Palet.",
   "El menú de Validación Crossdocking ofrece Cambiar recepción, Regresar y Cerrar pallet pendiente; los pallets pendientes se pueden filtrar por ID de contenedor.",
   "En paralelo se puede consultar el panel Operación en Tiempo Real (desde Control o Documentos) con Fill Rate, avance de tareas, recepciones y expediciones.",
   "El diagrama indica escribir en el palet el número de la tienda destino y pegar el palet a la tarima.",
   "Responsable único: Personal de Cross Docking (Supervisión en la consulta del panel)."
  ],
  "decisiones": [
   "¿Faltan más artículos de acomodar en la tarima? Sí → escanear el siguiente artículo y distribuir; No → terminar de acomodar, emplasticar y revisar progreso del expediente",
   "¿Faltan más expedientes? Sí → verificar el siguiente expediente en el handheld; No → fin",
   "Preguntar al cliente si quiere cerrar el pedido o aún no (decisión del cliente, sin detener la operación)"
  ],
  "relacionados": [
   {
    "silo": "log_preparacion",
    "nombre": "S5 · Consolidación por ruta"
   },
   {
    "silo": "log_transporte",
    "nombre": "S3 · Despacho"
   }
  ],
  "documentos": [
   {
    "tipo": "procedimiento",
    "titulo": "Procedimiento",
    "archivo": "P3 - Cross Docking.docx",
    "path": "procedimientos/P3 - Cross Docking.docx"
   },
   {
    "tipo": "manual",
    "titulo": "Manual de usuario",
    "archivo": "Manual - Cross Docking.docx",
    "path": "manuales/P3 - Manual Cross Docking.docx"
   }
  ]
 },
 "CEDI-14": {
  "codigo": "CEDI-14",
  "num": 14,
  "nombre": "Devoluciones Cofersa",
  "nodo": "CEDI-14 · Devoluciones Cofersa",
  "compania": "COFERSA",
  "silo": "log_transporte",
  "siloLabel": "OL.4 · Transporte",
  "macro": "S7 · Logística inversa (recolección de devoluciones)",
  "nodoExistente": null,
  "objetivo": "Establecer la metodología para la recepción, verificación, clasificación y registro de las devoluciones de mercancía de los clientes de Cofersa, garantizando su correcto acomodo en el almacén según la clasificación correspondiente (bueno, taller, merma y garantías).",
  "alcance": "Aplica a todas las devoluciones recibidas de cualquier cliente de Cofersa, incluyendo Ferretería EPA cuando actúa como cliente de Cofersa. El proceso de devoluciones clasificadas como bueno, merma y garantías se trabaja de forma diaria; las de taller también se reciben y verifican todos los días. La revisión de merma y garantías, con fines de conteo y registro, se realiza cada semana o cada 15 días. Aplica también al manejo y traslado de la mercancía pesada recibida como devolución.",
  "responsables": [
   "Personal de recepción de devoluciones (puerta 10)",
   "personal de pesado",
   "transporte",
   "taller",
   "almacén"
  ],
  "pasos": [
   {
    "texto": "Los choferes con devoluciones siempre llegan a la puerta 10",
    "sistema": "fisico",
    "pantalla": null
   },
   {
    "texto": "Revisar con el chofer que la boleta coincida con lo físico, producto por producto; si coincide, firmar boletas",
    "sistema": "fisico",
    "pantalla": null
   },
   {
    "texto": "Si no coincide no se recibe; si la boleta está mal elaborada, Cofersa la anula y la rehace",
    "sistema": "fisico",
    "pantalla": null
   },
   {
    "texto": "Identificar el respaldo: RPM (parcial), boleta Cofersa o factura completa (total); toda devolución trae boleta",
    "sistema": "fisico",
    "pantalla": null
   },
   {
    "texto": "Registrar el número de boleta en el cuaderno del chofer, o el chofer envía formulario con fotos a transporte",
    "sistema": "correo",
    "pantalla": null
   },
   {
    "texto": "Clasificar la devolución: bueno, taller, dañado/merma o garantías; cada una con acomodo específico",
    "sistema": "fisico",
    "pantalla": null
   },
   {
    "texto": "Mercancía pesada: se revisa en puerta 10, se entrega por puerta de pesado y se traslada a su zona",
    "sistema": "fisico",
    "pantalla": null
   },
   {
    "texto": "Garantías: identificar la marca autorizada, guardar en su lugar y registrar código y cantidad en el Drive",
    "sistema": "excel_drive",
    "pantalla": "Drive de control de garantías"
   },
   {
    "texto": "Ingresar los datos de la devolución en el Drive general de devoluciones",
    "sistema": "excel_drive",
    "pantalla": "Drive general de devoluciones"
   },
   {
    "texto": "Registrar lo de taller en un Drive aparte y enviarlo directamente a taller",
    "sistema": "excel_drive",
    "pantalla": "Drive de taller"
   },
   {
    "texto": "Las devoluciones clasificadas como merma se envían a destrucción directa",
    "sistema": "fisico",
    "pantalla": null
   },
   {
    "texto": "Recepcionar la devolución en el handheld: Recibo > Recepción, verificando contra lo declarado",
    "sistema": "handheld",
    "pantalla": "Recibo > Recepción"
   },
   {
    "texto": "Usar el código de confirmación según el estado del producto (bueno o merma)",
    "sistema": "handheld",
    "pantalla": "RECEPCION (N.Confirmación)"
   },
   {
    "texto": "Ingresar al sistema WMS con usuario, contraseña e información extra del encargado",
    "sistema": "handheld",
    "pantalla": "eWMS - CEDI OLO (menú principal)"
   },
   {
    "texto": "Escanear el palet o tarima; mercancía de mesanín no va en el mismo palet que la de zona baja",
    "sistema": "handheld",
    "pantalla": "RECEPCION (Palet)"
   },
   {
    "texto": "Escanear cada artículo, registrar la cantidad, confirmar y seleccionar Finalizar Palet",
    "sistema": "handheld",
    "pantalla": "Artículos recepción > Menú > Finalizar Palet"
   },
   {
    "texto": "Al finalizar un palet, continuar con el siguiente",
    "sistema": "handheld",
    "pantalla": "Artículos recepción (validar otro palet)"
   },
   {
    "texto": "El personal de almacén retira la devolución recepcionada para su almacenamiento definitivo",
    "sistema": "fisico",
    "pantalla": null
   }
  ],
  "registros": [
   "Cuaderno de boletas de los choferes.",
   "Formulario de devolución con fotos, enviado a transporte.",
   "Drive de registro general de devoluciones.",
   "Drive separado para el registro de taller.",
   "Drive de control de garantías (código y cantidad por marca).",
   "Registro de recepción en el sistema handheld (Recibo/Recepción)."
  ],
  "noConformidades": [
   "Registro incorrecto de una devolución, por ejemplo, ingresar un producto de merma como si estuviera en buen estado.",
   "Mezcla de códigos que no corresponden al producto.",
   "Falta de traslado de la mercancía pesada, por parte de los encargados de pesado, a la zona que le corresponde."
  ],
  "pantallas": [
   {
    "sistema": "handheld",
    "ruta": "eWMS - CEDI OLO (menú principal) > Recibo",
    "uso": "Opción que incluye el recibo de traslados y devoluciones de clientes"
   },
   {
    "sistema": "handheld",
    "ruta": "Recibo de mercadería",
    "uso": "Muestra Usuario, Recurso y Almacén; opciones RECEPCION y VALIDACION GENERAL"
   },
   {
    "sistema": "handheld",
    "ruta": "RECEPCION",
    "uso": "Ingreso del N.Confirmación (según estado bueno o merma) y lectura del Palet"
   },
   {
    "sistema": "handheld",
    "ruta": "Artículos recepción",
    "uso": "Leer EAN; muestra Confirmación, Recepción (ej. BUENO SEPTIEMBRE), C. Barra, Código Art, Referencia, Clasif1, Palet y Cantidad en CJ/UD"
   },
   {
    "sistema": "handheld",
    "ruta": "Artículos recepción > Menú",
    "uso": "Opciones Tomar foto, Ver Artículos y Finalizar Palet; confirmación '¿Seguro de finalizar el palet?'"
   },
   {
    "sistema": "excel_drive",
    "ruta": "Drive general de devoluciones",
    "uso": "Registro de Documento, Tipo Doc (RPM, FC, B.MANUAL), Fecha, Estado Doc (BUENO, MALO, SOBRANTE), Descripción, Cantidad, Pesado/Garantía y Notas"
   },
   {
    "sistema": "excel_drive",
    "ruta": "Drive de control de garantías",
    "uso": "Registro de código, artículo y fecha de entrega de productos de garantía"
   },
   {
    "sistema": "excel_drive",
    "ruta": "Drive de taller",
    "uso": "Registro de devoluciones enviadas a taller"
   }
  ],
  "tablas": [
   {
    "schema": "efw",
    "tabla": "RECEPCIONESCABECERA",
    "motivo": "Recepción de devolución a la que se asocia el palet (ej. 'BUENO SEPTIEMBRE'; IDRECEPCION)",
    "confianza": "alta"
   },
   {
    "schema": "efw",
    "tabla": "RECEPCIONESDETALLE",
    "motivo": "Líneas por artículo de la recepción de devolución (IDARTICULO, IDRECEPCIONLINEA)",
    "confianza": "alta"
   },
   {
    "schema": "efw",
    "tabla": "RECEPCIONESCONFIRMACIONES",
    "motivo": "Número de confirmación ingresado en la pantalla RECEPCION",
    "confianza": "media"
   },
   {
    "schema": "efw",
    "tabla": "RECEPCIONESCONFIRMACIONES_DATOS",
    "motivo": "Documento de respaldo de la confirmación (TIPODOCUMENTO, NUMERODOCUMENTO: boleta/RPM/factura)",
    "confianza": "media"
   },
   {
    "schema": "efw",
    "tabla": "CONFIRMACION_PARCIAL_CABECERA",
    "motivo": "Confirmación por palet de la recepción (IDCONFIRMACION, CONTENEDOR)",
    "confianza": "alta"
   },
   {
    "schema": "efw",
    "tabla": "CONFIRMACION_PARCIAL_DETALLE",
    "motivo": "Cantidad confirmada por línea y palet (IDCONTENEDOR, CANTIDAD)",
    "confianza": "alta"
   },
   {
    "schema": "efw",
    "tabla": "CONFIRMACION_PARCIAL_USUARIO",
    "motivo": "Usuario que confirma el palet en el handheld (IDUSUARIO)",
    "confianza": "alta"
   },
   {
    "schema": "efw",
    "tabla": "RECEPCIONCONFIRMACIONPALETARTICULO",
    "motivo": "Artículos escaneados por palet en la confirmación",
    "confianza": "media"
   },
   {
    "schema": "efw",
    "tabla": "CONTENEDOR",
    "motivo": "Palet/tarima de devolución escaneado (IDCONTENEDOR)",
    "confianza": "alta"
   },
   {
    "schema": "efw",
    "tabla": "CONTENEDORARTICULOS",
    "motivo": "Artículos cargados al palet con su línea de recepción (IDRECEPCIONLINEA)",
    "confianza": "alta"
   },
   {
    "schema": "efw",
    "tabla": "RECEPCIONIMAGEN",
    "motivo": "Fotos tomadas desde la opción 'Tomar foto' del menú de recepción",
    "confianza": "media"
   },
   {
    "schema": "efw",
    "tabla": "RECURSOS",
    "motivo": "Recurso del usuario mostrado en el handheld (ej. IV04)",
    "confianza": "alta"
   }
  ],
  "datosClave": [
   "Número de boleta / ticket",
   "Tipo de respaldo (RPM, boleta Cofersa, factura completa)",
   "Cliente de Cofersa (incluye Ferretería EPA)",
   "Clasificación (bueno, taller, dañado/merma, garantía)",
   "Marca del producto (garantías)",
   "Código de artículo / EAN",
   "Cantidad (CJ / UD)",
   "Número de confirmación según estado",
   "Palet o tarima",
   "Indicador pesado / garantía",
   "Fecha de la devolución",
   "Fotos del formulario del chofer"
  ],
  "conceptos": [
   {
    "termino": "RPM",
    "definicion": "Documento de devolución parcial de una factura"
   },
   {
    "termino": "Factura completa",
    "definicion": "Devolución de la totalidad de la factura; siempre incluye un RPM"
   },
   {
    "termino": "Boleta de devolución",
    "definicion": "Documento que acompaña toda devolución, incluidas las de garantía; se firma al coincidir"
   },
   {
    "termino": "Bueno",
    "definicion": "Producto en buen estado que se recepciona con su código de confirmación y se almacena"
   },
   {
    "termino": "Taller",
    "definicion": "Devolución que requiere revisión o reparación; se registra en Drive aparte y se envía a taller"
   },
   {
    "termino": "Dañado / merma",
    "definicion": "Producto dañado que se recepciona con su código y se destruye directamente"
   },
   {
    "termino": "Garantía",
    "definicion": "Devolución de marcas autorizadas por acuerdo Cofersa-OLO: Eagle, Bticino, Schneider, Lorenzetti, Coflex, Fanal, 3M y Henkel"
   },
   {
    "termino": "Puerta 10",
    "definicion": "Único punto de ingreso de las devoluciones"
   },
   {
    "termino": "Puerta de pesado",
    "definicion": "Puerta por donde se entrega la mercancía pesada devuelta"
   },
   {
    "termino": "Código de confirmación",
    "definicion": "Número que identifica la recepción según el estado del producto (bueno o merma)"
   }
  ],
  "entradaDe": [
   "CEDI-09"
  ],
  "salidaA": [],
  "notas": [
   "Frecuencia: bueno, merma y garantías se trabajan a diario; taller se recibe y verifica a diario; la revisión de merma y garantías para conteo y registro es semanal o cada 15 días.",
   "El Drive general usa Tipo Doc RPM, FC y B.MANUAL y Estado Doc BUENO, MALO y SOBRANTE, con columna Pesado/Garantía.",
   "El menú Recibo del handheld incluye el recibo de traslados y devoluciones de clientes; Recibo de mercadería ofrece RECEPCION y VALIDACION GENERAL.",
   "Tras escanear el palet, el sistema lo muestra identificado en la recepción correspondiente (ej. Recepción: BUENO SEPTIEMBRE).",
   "Al finalizar el palet el sistema confirma el éxito y pregunta si se desea validar otro palet.",
   "Si el chofer no completa el formulario, transporte lo contacta usando la información del cuaderno.",
   "Carriles del diagrama: Recepción (Puerta 10), Cofersa, Conductor, Encargado de Devoluciones, Taller, Auxiliar de Bodega (Handheld) y Personal de Bodega (Almacenamiento)."
  ],
  "decisiones": [
   "¿Es producto pesado? Sí → revisar y movilizar según la zona correspondiente; No → continuar recepción",
   "¿La documentación coincide con los productos? No → rechazar, informar a Cofersa, que corrige o anula el ticket; Sí → aceptar y firmar",
   "¿La devolución corresponde a taller? Sí → registrar en Drive de taller y enviar a taller; No → continuar",
   "¿El producto corresponde a garantía? Sí → verificar marca autorizada, código y cantidad y separar; No → clasificación normal",
   "¿Cuál es la condición del producto? Garantía / Dañado-merma (código merma, destrucción) / Taller / Producto bueno (código de bueno)",
   "¿Los productos pueden permanecer en el mismo pallet? No → separar en pallets diferentes",
   "¿Hay productos de mesanín mezclados con zona baja? Sí → separar los productos",
   "¿Artículo y cantidad son correctos? No → detener, revisar, corregir y volver a escanear",
   "¿Quedan más artículos en el pallet? Sí → siguiente artículo; No → Terminar Palet",
   "¿Quedan más pallets por recibir? Sí → siguiente pallet; No → finalizar recepción",
   "¿El producto está en la ubicación correcta? No → corregir ubicación y mover a su zona"
  ],
  "relacionados": [
   {
    "silo": "log_almacenaje",
    "nombre": "S7 · Gestión de mermas"
   }
  ],
  "documentos": [
   {
    "tipo": "procedimiento",
    "titulo": "Procedimiento",
    "archivo": "P14 - Devoluciones Cofersa.docx",
    "path": "procedimientos/P14 - Devoluciones Cofersa.docx"
   },
   {
    "tipo": "manual",
    "titulo": "Manual de usuario",
    "archivo": "Manual - Devoluciones Cofersa.docx",
    "path": "manuales/P14 - Manual Devoluciones Cofersa.docx"
   }
  ]
 }
};
