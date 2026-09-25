// ═══════════════════════════════════════════════════════════════════════════
// DATOS · Manual eFlow WMS Handheld (eWMS – CEDI OLO) — la app RF del piso
// Fuente: mapa de la app en un teléfono Samsung (25/09/2026): 23 pantallas con
// captura y jerarquía de UI (uiautomator), sesión usuario 886 · recurso CS03 ·
// almacén 0001. Capturas recortadas (sin barras del teléfono) y subidas a
// Detalles_Porcesos/hh-manual/. Las pantallas se vieron VACÍAS: lo que aparece
// después de escanear (segundo nivel) no está capturado.
// Los pasos «handheld» de los procesos se ligan con pantallaHhDePaso().
// ═══════════════════════════════════════════════════════════════════════════

export const HH_META = {
  nombre: "eFlow WMS Handheld (eWMS – CEDI OLO)", vendor: "ePRAC · eflow Cloud Suite", version: "3.1.73.1",
  paquete: "eFlow_WMS_HH.eFlow_WMS_HH", tecnologia: "Android · Xamarin / .NET (Mono), una sola actividad; escáner/impresora por Bluetooth",
  sesion: "Usuario 886 · Recurso CS03 · Almacén 0001", fecha: "25/09/2026",
};

export const HH_INTRO = "La app handheld de eFlow WMS es donde se ejecuta el trabajo físico del CEDI: recibir, ubicar, trasladar, alistar, despachar y cargar el camión. Cada operación empieza con un campo de escaneo (ubicación, palet, muelle o confirmación) y el resto de la pantalla se llena al leerlo. El escritorio (eFlow WMS · Desktop) genera y controla las tareas; el handheld las ejecuta, en especial por «Trabajo automático», que entrega al operario la siguiente acción de trabajo (picking, reposición, almacenaje).";

export const HH_MODULOS = [
  { name: "Menú principal", info: "Pantalla de entrada tras el login: muestra usuario, recurso (equipo) y almacén, y los 5 módulos. La flecha de arriba a la izquierda cierra la sesión." },
  { name: "Recibo", info: "Recibo de compras y producción, traslados y devoluciones de clientes. Se entra con el número de confirmación que genera el escritorio." },
  { name: "Almacenaje", info: "Almacenamiento de recepciones y traslados entre ubicaciones y zonas. Todas las opciones empiezan leyendo un palet o una ubicación de origen." },
  { name: "Picking y despacho", info: "Picking automático y manual, carga de camión, auditoría de picking y reposiciones a picking. «Trabajo automático» entrega las acciones de trabajo que genera el escritorio." },
  { name: "Inventario", info: "Consulta de inventarios y toma física. El menú principal anuncia también «ajustes» e «inventario inicial», que no aparecen para el usuario 886." },
  { name: "Control", info: "Creación de artículos en zona de picking. El menú principal anuncia también «Control palet», que no aparece para el usuario 886." },
];

const sc = (id, modulo, nombre, ruta, descripcion, extra = {}) =>
  ({ id, modulo, nombre, url: ruta, figura: `${ruta} (captura del handheld, 25/09/2026)`, descripcion, img: `hh__${extra.archivo || id}.jpg`, columnas: [], campos: [], acciones: [], ...extra });
const REGRESAR = ["Regresar", "Vuelve al menú del módulo"];

export const HH_PANTALLAS = [
  sc("00_menu_principal", "Menú principal", "Menú principal · CEDI OLO", "eWMS › CEDI OLO",
    "Entrada de la app tras el login. Encabezado con Usuario, Recurso y Almacén de la sesión y los 5 módulos: Recibo, Almacenaje, Picking despacho y reposiciones, Inventario y Control.",
    { campos: ["Usuario", "Recurso (equipo)", "Almacén"], columnas: ["Recibo", "Almacenaje", "Picking, despacho y reposiciones", "Inventario", "Control"], acciones: [["← (arriba izq.)", "Cierra la sesión"]] }),

  sc("01_recibo", "Recibo", "Recibo de mercadería (menú)", "Recibo", "Menú del módulo Recibo con sus 4 opciones.",
    { columnas: ["CROSS BANDA", "RECEPCION", "VALIDACION CROSSDOCKING GENERAL", "VALIDACION GENERAL"] }),
  sc("01a_recibo_cross_banda", "Recibo", "CROSS BANDA", "Recibo › CROSS BANDA",
    "Cross-docking en banda: se lee la ubicación de origen y se van armando contenedores; «Finalizar Contenedor» cierra el que está en curso.",
    { campos: ["Leer Origen: Ubicación Origen"], columnas: ["Lista de lecturas"], acciones: [["Finalizar Contenedor", "Cierra el contenedor en curso (acción con efecto real)"], ["Salir", "Sale de la opción"]] }),
  sc("01b_recibo_recepcion", "Recibo", "RECEPCION", "Recibo › RECEPCION",
    "Recepción contra la confirmación creada en el escritorio: se ingresa el N. de confirmación y luego se lee el palet. Si falta un dato la app avisa «Debe llenar todo lo que se le solicita».",
    { campos: ["N.Confirmación (número)", "Palet"], acciones: [REGRESAR] }),
  sc("01c_recibo_valid_crossdock_general", "Recibo", "VALIDACION CROSSDOCKING GENERAL", "Recibo › VALIDACION CROSSDOCKING GENERAL",
    "Validación de recepciones de cross-docking: se elige la recepción de una lista («Seleccione») y se validan sus artículos. «Regresar» vuelve directo al menú principal.",
    { campos: ["Recepción: Seleccione (lista de recepciones)"], acciones: [["Cambiar recepción", "Elige otra recepción"], ["Cerrar pallet pendiente", "Cierra el palet en curso (acción con efecto real)"], ["Regresar", "Vuelve al menú principal"]] }),
  sc("01d_recibo_validacion_general", "Recibo", "VALIDACION GENERAL", "Recibo › VALIDACION GENERAL",
    "Validación artículo por artículo de una recepción: se ingresa la confirmación, se lee el palet y el código de barras y se valida la cantidad en cajas (CJ) con su lote y vencimiento.",
    { campos: ["Confirmación", "Palet", "C. Barras", "Cantidad (CJ)"], columnas: ["Muelle", "Contenedor", "Documento", "Proveedor", "ID Artículo", "Referencia", "Factor", "T. Palet", "Vence", "Lote", "Peso", "Clasif1", "Ref1"],
      acciones: [["Finalizar palet pendiente", "Cierra el palet en curso (acción con efecto real)"], REGRESAR] }),

  sc("02_almacenaje_menu", "Almacenaje", "Almacenamiento mercadería (menú)", "Almacenaje", "Menú del módulo Almacenaje con sus 7 opciones.",
    { columnas: ["MULTIPALET LIBRE", "SEMIDIRIGIDO", "PICKING INVERSO", "TRANSFERENCIA STOCK", "TRASLADO LIBRE", "TRASLADO SUCURSAL", "UBICACIÓN LIBRE"] }),
  sc("02a_alm_multipalet_libre", "Almacenaje", "MULTIPALET LIBRE", "Almacenaje › MULTIPALET LIBRE",
    "Ubicación de varios palets en una sola operación: se leen los palets y se acumulan en una lista antes de ubicarlos.", { campos: ["Leer palet"], columnas: ["Lista de palets leídos"], acciones: [REGRESAR] }),
  sc("02b_alm_semidirigido", "Almacenaje", "SEMIDIRIGIDO", "Almacenaje › SEMIDIRIGIDO",
    "Almacenaje semidirigido: se lee el palet de origen y el sistema sugiere la ubicación, que el operario confirma.", { campos: ["Leer palet origen"], acciones: [REGRESAR] }),
  sc("02c_alm_picking_inverso", "Almacenaje", "PICKING INVERSO", "Almacenaje › PICKING INVERSO",
    "Devolución de mercancía de la zona de picking a almacenaje: se lee el origen.", { campos: ["Leer origen"], acciones: [REGRESAR] }),
  sc("02d_alm_transferencia_stock", "Almacenaje", "TRANSFERENCIA STOCK", "Almacenaje › TRANSFERENCIA STOCK",
    "Transferencia de stock hacia un palet de preparación: se lee el palet de preparación.", { campos: ["Leer Palet Preparación"], acciones: [REGRESAR] }),
  sc("02e_alm_traslado_libre", "Almacenaje", "TRASLADO LIBRE", "Almacenaje › TRASLADO LIBRE",
    "Traslado libre entre ubicaciones o zonas (por ejemplo, al mesanín o a picking): se lee el origen y se muestra el palet de preparación.", { campos: ["Leer origen"], columnas: ["Palet preparación"], acciones: [REGRESAR] }),
  sc("02f_alm_traslado_sucursal", "Almacenaje", "TRASLADO SUCURSAL", "Almacenaje › TRASLADO SUCURSAL",
    "Traslado de inventario entre sucursales (por ejemplo, cambio de régimen zona franca → nacional): se lee el palet destino y se ven origen, sucursales, artículo, lote, caducidad y series.",
    { campos: ["Leer palet destino"], columnas: ["U. Origen", "P. Origen", "Sucursal O", "Sucursal D", "Artículo", "Lote", "Caduca", "Descripción", "Series", "P. Destino"], acciones: [REGRESAR] }),
  sc("02g_alm_ubicacion_libre", "Almacenaje", "UBICACIÓN LIBRE", "Almacenaje › UBICACIÓN LIBRE",
    "Ubicación libre de un palet: se lee el palet de origen y el operario elige la ubicación destino.", { campos: ["Leer palet origen"], acciones: [REGRESAR] }),

  sc("03_picking_menu", "Picking y despacho", "Picking, despacho y reposiciones (menú)", "Picking, despacho y reposiciones",
    "Menú del módulo con sus 4 opciones. «TRABAJO AUTOMÁTICO» no se abrió en el mapeo porque puede asignar una tarea real al usuario: sus pantallas (Picking, Ubicación de Palet) solo se conocen por las capturas de los manuales CEDI.",
    { columnas: ["CARGA CAMION", "CONTENEDOR MASTER", "DESPACHO", "TRABAJO AUTOMÁTICO (no explorado)"] }),
  sc("03a_picking_carga_camion", "Picking y despacho", "CARGA CAMION", "Picking, despacho y reposiciones › CARGA CAMION",
    "Carga del camión: se ingresan muelle, placa y cédula del chofer y se confirma con «ACEPTAR CARGA»; luego se validan y cargan los palets.",
    { campos: ["Muelle", "Placa", "Cédula"], acciones: [["ACEPTAR CARGA", "Inicia la carga (acción con efecto real)"], ["← (barra)", "Sale de la opción"]] }),
  sc("03b_picking_contenedor_master", "Picking y despacho", "CONTENEDOR MASTER", "Picking, despacho y reposiciones › CONTENEDOR MASTER",
    "Armado del palet máster: se leen los palets que lo componen y se acumulan en la lista. Antes de leer, el menú solo ofrece «Regresar» (los manuales CEDI citan «Finalizar Máster», que aparecería al tener palets leídos).",
    { campos: ["Palet Master: Leer palet"], columnas: ["Lista de palets"], acciones: [REGRESAR] }),
  sc("03c_picking_despacho", "Picking y despacho", "DESPACHO", "Picking, despacho y reposiciones › DESPACHO",
    "Despacho por muelle: se lee el muelle y se trabajan los viajes que salen por él. «Finalizar carga» cierra la carga del muelle (los manuales CEDI citan también «Despachar máster completo»).",
    { campos: ["Leer Muelle: Muelle Despacho"], acciones: [["Finalizar carga", "Cierra la carga del muelle (acción con efecto real)"], ["Salir", "Sale de la opción"]] }),

  sc("04_inventario_menu", "Inventario", "Consulta inventarios, auditoría (menú)", "Inventario", "Menú del módulo Inventario con 2 opciones.",
    { columnas: ["INVENTARIO", "TOMA FISICA"] }),
  sc("04a_inv_inventario", "Inventario", "INVENTARIO (consulta)", "Inventario › INVENTARIO",
    "Consulta de inventario desde el piso: se escanea o escribe un dato (ubicación, palet o artículo) y se ven los resultados en las pestañas GENERAL e INFORMACIÓN, con orden configurable.",
    { campos: ["Dato de Consulta", "Ordenar por", "Orden"], columnas: ["Valor de Consulta", "Pestaña GENERAL", "Pestaña INFORMACIÓN"], acciones: [["← (barra)", "Sale de la opción"]] }),
  sc("04b_inv_toma_fisica", "Inventario", "TOMA FISICA", "Inventario › TOMA FISICA",
    "Conteo de la toma física creada en el escritorio (Inventario › Generación de Tomas Físicas). En el mapeo no abrió: mostró un aviso breve, probablemente porque no había una toma activa o el usuario 886 no tiene permiso.",
    { archivo: "04_inventario_menu", campos: ["(no capturado: requiere una toma activa)"] }),

  sc("05_control_menu", "Control", "Control (menú)", "Control", "Menú del módulo Control con 1 opción.", { columnas: ["Creación Art. Zona Picking"] }),
  sc("05a_ctrl_creacion_art_zona_picking", "Control", "Creación Art. Zona Picking", "Control › Creación Art. Zona Picking",
    "Asigna un artículo a una ubicación de picking con su cantidad mínima y máxima (base de las reposiciones REPI): se lee la ubicación.",
    { campos: ["Leer ubicación"], columnas: ["Ubicación", "Artículo", "Presentación", "Cantidad mínima", "Cantidad máxima"], acciones: [REGRESAR] }),
];

export const HH_BY_ID = Object.fromEntries(HH_PANTALLAS.map(p => [p.id, p]));

// Flujo típico en el piso (orden del menú; no es un procedimiento de OLO)
export const HH_FLUJO = [
  { texto: "El operario entra con usuario, recurso (equipo) y almacén.", pantalla: "00_menu_principal" },
  { texto: "Recibe contra la confirmación del escritorio: N. Confirmación y palet.", pantalla: "01b_recibo_recepcion" },
  { texto: "Valida cada artículo del palet: código de barras, cantidad en cajas, lote y vencimiento.", pantalla: "01d_recibo_validacion_general" },
  { texto: "Ubica el palet: lo lee y elige la ubicación destino.", pantalla: "02g_alm_ubicacion_libre" },
  { texto: "Recibe del escritorio las acciones de trabajo (picking y reposición) en «Trabajo automático».", pantalla: "03_picking_menu" },
  { texto: "Arma el palet máster con los palets alistados.", pantalla: "03b_picking_contenedor_master" },
  { texto: "Despacha por muelle y finaliza la carga.", pantalla: "03c_picking_despacho" },
  { texto: "Carga el camión con muelle, placa y cédula del chofer.", pantalla: "03a_picking_carga_camion" },
];

export const HH_CONCEPTOS = [
  { termino: "Recurso", definicion: "El equipo (handheld) con el que se inicia la sesión, por ejemplo CS03. Las acciones de trabajo se asignan por usuario y recurso." },
  { termino: "N. Confirmación", definicion: "Número de la confirmación de recepción creada en el escritorio (Documentos › Ordenes de Recepción › Crear Confirmación); es la llave con la que el handheld recibe." },
  { termino: "Palet máster", definicion: "Palet que agrupa varios palets alistados de un mismo viaje o cliente para despacharlos juntos." },
  { termino: "Trabajo automático", definicion: "Opción que entrega al operario la siguiente acción de trabajo generada por el escritorio (tipos PICK, REPI, UBCO, UBRE, EXES)." },
];

// Hallazgos del mapeo que hay que validar con ePRAC / el CEDI
export const HH_HALLAZGOS = [
  "El menú principal anuncia «ajustes, inventario inicial» (Inventario) y «Control palet» (Control), pero el usuario 886 solo ve INVENTARIO, TOMA FISICA y Creación Art. Zona Picking: las opciones dependen del perfil.",
  "CEDI-06 (Chequeo) dice que el palet se escanea con el handheld en la «Estación de Chequeo», pero esa opción no existe en el menú del handheld: la estación es del escritorio (Control › Chequeo).",
  "Los manuales citan «Contenedor Máster › Finalizar Máster» y «Despacho › Despachar máster completo»; con la pantalla vacía el menú solo muestra Regresar / Finalizar carga · Salir. Se asume que aparecen después de leer.",
  "7 opciones reales no aparecen en ningún procedimiento de OLO: CROSS BANDA, MULTIPALET LIBRE, SEMIDIRIGIDO, PICKING INVERSO, TRANSFERENCIA STOCK, TRASLADO SUCURSAL y Creación Art. Zona Picking.",
  "Faltan TRABAJO AUTOMÁTICO y TOMA FISICA y las pantallas de segundo nivel (después de escanear): hay que capturarlas con una tarea o toma real.",
  "Versiones distintas: handheld 3.1.73.1 frente a escritorio 3.2.8.5.",
];

const norm = (s) => (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

// Pantalla del handheld de un paso «handheld»: por su screen (borradores) o por la
// ruta citada en el procedimiento (CEDI). Las pantallas de segundo nivel (Ubicación
// de Palet, Picking, Artículos recepción) caen en la opción desde la que se abren.
const REGLAS = [
  [/trabajo automatico|ubicacion de palet|^picking$|^picking \(/, "03_picking_menu"],
  [/validacion crossdocking/, "01c_recibo_valid_crossdock_general"],
  [/validacion general/, "01d_recibo_validacion_general"],
  [/cross banda/, "01a_recibo_cross_banda"],
  [/articulos recepcion|^recepcion|> recepcion/, "01b_recibo_recepcion"],
  [/recibo/, "01_recibo"],
  [/carga camion/, "03a_picking_carga_camion"],
  [/contenedor master|palet master/, "03b_picking_contenedor_master"],
  [/^despacho|> despacho/, "03c_picking_despacho"],
  [/ubicacion libre/, "02g_alm_ubicacion_libre"],
  [/traslado libre|escaneo de palet y ubicacion/, "02e_alm_traslado_libre"],
  [/traslado sucursal/, "02f_alm_traslado_sucursal"],
  [/toma fisica/, "04b_inv_toma_fisica"],
  [/picking, despacho y reposiciones$/, "03_picking_menu"],
  [/menu principal/, "00_menu_principal"],
];
export function pantallaHhDePaso(s, codigo) {
  if (s.sistema !== "handheld") return null;
  if (s.screen && HH_BY_ID[s.screen]) return s.screen;
  const t = norm(s.pantalla);
  if (t) { for (const [re, id] of REGLAS) if (re.test(t)) return id; return null; }
  if (codigo === "CEDI-13" && /escanear/.test(norm(s.texto))) return "02e_alm_traslado_libre";
  return null;
}
