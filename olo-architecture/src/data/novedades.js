// ═══════════════════════════════════════════════════════════════════════════
// NOVEDADES — fallback estático (arranca sin backend). En producción el
// contenido real vive en la tabla Supabase `novedades` (singleton, ver
// supabase_novedades_module.sql) y se cura desde Administración → Novedades.
// Este objeto solo se usa si la fila de Supabase no existe o falla la carga.
// Modelo: { version, titulo, fecha, items:[{id, estado, titulo, detalle, seccion?}] }
// estado: candidata | publicada | archivada · seccion: tab_id opcional (null = todos)
// ═══════════════════════════════════════════════════════════════════════════

export const NOVEDADES_FALLBACK = {
  version: "2026-08",
  titulo: "Novedades",
  fecha: "Agosto 2026",
  items: [
    {
      id: "silos-negocio-2026-08",
      estado: "publicada",
      titulo: "14 nuevos silos de Negocio en Procesos",
      detalle: "Se amplió la sección Procesos con 14 silos nuevos y se renombraron los niveles del árbol a Macroproceso → Proceso → Subproceso → Detalle, para reflejar mejor la jerarquía real de la operación.",
      seccion: "olo-arch",
    },
    {
      id: "infra-a-ecosistema-2026-08",
      estado: "publicada",
      titulo: "Infraestructura se mudó a Ecosistema",
      detalle: "El diagrama de Infraestructura ahora vive dentro de Ecosistema, junto a Módulos ERP e Integraciones — mismo contenido, ubicación más consistente.",
      seccion: "ecosystem",
    },
    {
      id: "modo-edicion-lapiz-2026-08",
      estado: "publicada",
      titulo: "Modo edición explícito en Procesos",
      detalle: "Los nombres de Macroproceso, Proceso y Subproceso ahora se editan con el ícono de lápiz, evitando ediciones accidentales al hacer clic.",
      seccion: "olo-arch",
    },
    {
      id: "visor-pantalla-completa-2026-08",
      estado: "publicada",
      titulo: "Visor de documentos con pantalla completa",
      detalle: "Los archivos adjuntos en Detalle (PDF, imágenes, Office) se pueden ver sin salir de la app y ahora también a pantalla completa.",
      seccion: "olo-arch",
    },
    {
      id: "colapsar-fila-completa-2026-08",
      estado: "publicada",
      titulo: "Colapsar con un clic en toda la fila",
      detalle: "En Subproceso y Sub-subproceso ya no hace falta apuntar al ícono exacto — toda la fila colapsa o expande el nivel.",
      seccion: "olo-arch",
    },
  ],
};
