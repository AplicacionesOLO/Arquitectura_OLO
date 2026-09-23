// ═══════════════════════════════════════════════════════════════════════════
// NOVEDADES — fallback estático (arranca sin backend). En producción el
// contenido real vive en la tabla Supabase `novedades` (singleton, ver
// supabase_novedades_module.sql) y se cura desde Administración → Novedades.
// Este objeto solo se usa si la fila de Supabase no existe o falla la carga.
// Modelo: { version, titulo, fecha, items:[{id, estado, titulo, detalle, seccion?}] }
// estado: candidata | publicada | archivada · seccion: tab_id opcional (null = todos)
// ═══════════════════════════════════════════════════════════════════════════

export const NOVEDADES_FALLBACK = {
  "version": "2026-09",
  "titulo": "Novedades",
  "fecha": "Septiembre 2026",
  "items": [
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
      "titulo": "7 silos con procesos borrador",
      "detalle": "Inventario físico, Almacenamiento ZF-nacional, Valor agregado, Servicio logístico, Desempeño, Seguimiento y Transporte local tienen procesos armados sobre pantallas reales de eflow. Llevan la marca «borrador»: cada paso indica si viene del WMS o es inferido y debe validarse.",
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
      "detalle": "Estado del conocimiento, aplicaciones y versiones, clientes y sus reglas operativas, bases de datos, fuentes del levantamiento, glosario de 97 términos y brechas abiertas.",
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
