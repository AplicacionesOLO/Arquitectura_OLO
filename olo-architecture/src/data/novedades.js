// ═══════════════════════════════════════════════════════════════════════════
// NOVEDADES — fallback estático (arranca sin backend). En producción el
// contenido real vive en la tabla Supabase `novedades` (singleton, ver
// supabase_novedades_module.sql) y se cura desde Administración → Novedades.
// Este objeto solo se usa si la fila de Supabase no existe o falla la carga.
// Modelo: { version, titulo, fecha, items:[{id, estado, titulo, detalle, seccion?}] }
// estado: candidata | publicada | archivada · seccion: tab_id opcional (null = todos)
// ═══════════════════════════════════════════════════════════════════════════

export const NOVEDADES_FALLBACK = {
  "version": "2026-09-5",
  "titulo": "Novedades",
  "fecha": "Septiembre 2026 · quinta entrega",
  "items": [
    {
      "id": "softland-olo-2026-09",
      "estado": "publicada",
      "titulo": "Manual del Softland propio de OLO (compañía OVERSEAS)",
      "detalle": "Módulos ERP › Manual Softland · OLO: generalidades y los 14 módulos, con 149 pantallas con captura en Inventarios, Compras, Facturación, Cuentas por Cobrar, Cuentas por Pagar y Documentos Electrónicos, y el menú completo del resto. 29 pasos de Cobro, Facturación, Financiero y Comercialización muestran ahora la pantalla real. Las capturas tienen datos reales: se ven solo con sesión y acceso a Módulos ERP.",
      "seccion": "softland"
    },
    {
      "id": "handheld-2026-09",
      "estado": "publicada",
      "titulo": "Nuevo manual del handheld (eFlow WMS HH)",
      "detalle": "Operación › eFlow WMS · Handheld: las 23 pantallas reales de la app RF del piso (v3.1.73.1), con su captura, campos de escaneo, datos que muestra y opciones de menú. 58 pasos de los procesos que se hacen en el handheld ahora muestran su pantalla en la ficha, en Workflows y en el recorrido, y quedaron adjuntos en Procesos. Incluye los hallazgos a validar con ePRAC.",
      "seccion": "ops"
    },
    {
      "id": "numeracion-2026-09",
      "estado": "publicada",
      "titulo": "Numeración única de procesos y silos",
      "detalle": "Los procedimientos del CEDI ahora se llaman CEDI-01 a CEDI-14 y los silos de operación logística OL.1 a OL.9; los P1.x quedan solo para los procesos de negocio del diagnóstico. Torre de Control Cofersa pasó a Preparación de pedidos (con la de EPA) y el procedimiento de Cross Docking a su silo.",
      "seccion": "olo-arch"
    },
    {
      "id": "asesor-2026-09",
      "estado": "publicada",
      "titulo": "Asesor de cambios del WMS",
      "detalle": "Describe un cambio que quieras hacer en el WMS y el asesor revisa las solicitudes a ePRAC, la estructura de las bases, las pantallas y los procesos para decir si es viable, qué implica y qué recomienda, con sus fuentes.",
      "seccion": "asesor"
    },
    {
      "id": "workflows-2026-09",
      "estado": "publicada",
      "titulo": "Nuevo módulo Workflows: el plano maestro de la operación",
      "detalle": "Cada proceso como un flujo de tarjetas: paso, sistema, pantalla y rol. Un mapa maestro con todos los silos y sus procesos conectados, y un lienzo por silo. Toca un paso para ver su captura o presentarlo; los círculos morados llevan al proceso anterior o siguiente. Admin y editores pueden reacomodar y conectar tarjetas.",
      "seccion": "workflows"
    },
    {
      "id": "workflows-sistemas-2026-09",
      "estado": "publicada",
      "titulo": "Qué depende de cada sistema",
      "detalle": "Workflows › Sistemas muestra, para eFlow WMS, handheld, Torre de Control, SORTER, Softland y los demás, cuántos pasos, procesos, silos y tablas dependen de él — y los resalta en el mapa. Workflows › Roles muestra los procesos de cada rol.",
      "seccion": "workflows"
    },
    {
      "id": "bpa-levantamiento-2026-09",
      "estado": "publicada",
      "titulo": "BPA · OLO conectado al levantamiento",
      "detalle": "Cada proceso del diagnóstico muestra su silo, si ya tiene procedimiento OLO, borrador o está sin levantar, y los sistemas que usan sus pasos. El bloque Operación logística del CEDI indica a qué proceso del diagnóstico sostiene cada silo, y hay un botón para ir directo al silo en Procesos.",
      "seccion": "bpa"
    },
    {
      "id": "diagramas-2026-09",
      "estado": "publicada",
      "titulo": "Diagramas más cómodos",
      "detalle": "El mapa TO-BE de Infraestructura ahora es compacto y encuadrado; en Integraciones, las tablas del diagrama relacional FK ya no se salen de su módulo y el lienzo no se corta al desplazarlo.",
      "seccion": null
    },
    {
      "id": "fichas-cedi-2026-09",
      "estado": "publicada",
      "titulo": "Fichas de los 14 procedimientos del CEDI",
      "detalle": "Cada proceso del CEDI tiene el botón «Ficha ›»: se abre al lado con objetivo, pasos (con su sistema y pantalla), tablas de base de datos, diagrama de flujo y documentos (procedimiento y manual). Arriba del árbol están agrupados por etapa de la operación.",
      "seccion": "olo-arch"
    },
    {
      "id": "silos-borrador-2026-09",
      "estado": "publicada",
      "titulo": "Procesos borrador en los silos sin procedimiento",
      "detalle": "Los silos que no tenían procedimiento aprobado de OLO tienen procesos armados sobre pantallas reales de eflow y del menú de Softland. Llevan la marca «borrador»: cada paso indica de dónde viene o si es inferido, y se validan en Workflows.",
      "seccion": "olo-arch"
    },
    {
      "id": "cross-docking-2026-09",
      "estado": "publicada",
      "titulo": "Nuevo silo Cross Docking (SORTER CLIRO)",
      "detalle": "El cross-docking de EPA en el sorter de Mecalux: recepción y clasificación en Nivel 1 y despacho por viajes en Planta Baja, cada paso con la captura de su pantalla.",
      "seccion": "olo-arch"
    },
    {
      "id": "manual-wms-2026-09",
      "estado": "publicada",
      "titulo": "Manual de eflow WMS con 122 pantallas",
      "detalle": "Operación › eFlow WMS · Manual: cada pantalla con captura, campos, acciones, columnas, los procesos que la usan y sus tablas. Desde un paso de proceso se llega a su pantalla y desde una tabla a las pantallas que la usan.",
      "seccion": "ops"
    },
    {
      "id": "torre-control-2026-09",
      "estado": "publicada",
      "titulo": "Torre de Control · WMH",
      "detalle": "Levantamiento completo de la Torre de Control (mapeo funcional, datos reales por columna, modelo de datos) y su manual con 17 pantallas y el flujo operativo típico.",
      "seccion": "ops"
    },
    {
      "id": "sorter-ops-2026-09",
      "estado": "publicada",
      "titulo": "SORTER CLIRO y cómo se relacionan los sistemas",
      "detalle": "El sorter de Mecalux es un módulo más de Operación, con su manual de 12 pantallas. «Cómo se relacionan» muestra qué dato pasa entre WMS, handheld, Torre de Control y sorter, y qué tan documentado está.",
      "seccion": "ops"
    },
    {
      "id": "presentacion-2026-09",
      "estado": "publicada",
      "titulo": "Recorridos guiados con zoom por zonas",
      "detalle": "Procesos y manuales se presentan pantalla por pantalla, en el orden en que se usan. Arrastra sobre la captura para ampliar un detalle; la información del paso queda siempre visible al lado.",
      "seccion": null
    },
    {
      "id": "menu-capas-2026-09",
      "estado": "publicada",
      "titulo": "Menú en capas: Procesos · Operación · Sistemas · Datos",
      "detalle": "El menú lateral sigue el hilo del BPA: qué hacemos (procesos), cómo se hace (operación y pantallas), con qué (sistemas) y dónde queda el dato (integraciones y relaciones).",
      "seccion": null
    },
    {
      "id": "contexto-2026-09",
      "estado": "publicada",
      "titulo": "Contexto completo",
      "detalle": "Estado del conocimiento, aplicaciones y versiones, clientes y sus reglas operativas, bases de datos, fuentes del levantamiento, glosario y brechas abiertas.",
      "seccion": "context"
    },
    {
      "id": "integraciones-2026-09",
      "estado": "publicada",
      "titulo": "Integraciones más ágil",
      "detalle": "La tabla general ahora es paginada, se suma el esquema EFW · Configuración y el panel de cada tabla indica en qué procesos y pantallas se usa.",
      "seccion": "integrations"
    },
    {
      "id": "silos-negocio-2026-08",
      "estado": "archivada",
      "titulo": "14 nuevos silos de Negocio en Procesos",
      "detalle": "Se amplió la sección Procesos con 14 silos nuevos y se renombraron los niveles del árbol a Macroproceso → Proceso → Subproceso → Detalle, para reflejar mejor la jerarquía real de la operación.",
      "seccion": "olo-arch"
    },
    {
      "id": "infra-a-ecosistema-2026-08",
      "estado": "archivada",
      "titulo": "Infraestructura se mudó a Ecosistema",
      "detalle": "El diagrama de Infraestructura ahora vive dentro de Ecosistema, junto a Módulos ERP e Integraciones — mismo contenido, ubicación más consistente.",
      "seccion": "ecosystem"
    },
    {
      "id": "modo-edicion-lapiz-2026-08",
      "estado": "archivada",
      "titulo": "Modo edición explícito en Procesos",
      "detalle": "Los nombres de Macroproceso, Proceso y Subproceso ahora se editan con el ícono de lápiz, evitando ediciones accidentales al hacer clic.",
      "seccion": "olo-arch"
    },
    {
      "id": "visor-pantalla-completa-2026-08",
      "estado": "archivada",
      "titulo": "Visor de documentos con pantalla completa",
      "detalle": "Los archivos adjuntos en Detalle (PDF, imágenes, Office) se pueden ver sin salir de la app y ahora también a pantalla completa.",
      "seccion": "olo-arch"
    },
    {
      "id": "colapsar-fila-completa-2026-08",
      "estado": "archivada",
      "titulo": "Colapsar con un clic en toda la fila",
      "detalle": "En Subproceso y Sub-subproceso ya no hace falta apuntar al ícono exacto — toda la fila colapsa o expande el nivel.",
      "seccion": "olo-arch"
    }
  ]
};
