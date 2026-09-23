// ═══════════════════════════════════════════════════════════════════════════
// DATOS · Cómo se relacionan los sistemas de Operación (WMS-D, WMS-RF, WMH, SORTER)
// estado: "confirmed" = documentado (procedimientos, mapeos, manuales)
//         "partial"   = hay evidencia pero el mecanismo no está descrito
//         "inferred"  = coincidencia observada, sin confirmar
// ═══════════════════════════════════════════════════════════════════════════
export const OPS_RELACIONES = [
  { a: "WMS-D", b: "WMS-RF", status: "confirmed", que: "El escritorio genera las acciones de trabajo (Control › Acciones de Trabajo) que el handheld ejecuta en «Trabajo automático»: picking, reposición, almacenaje, despacho.", fuente: "Procedimientos CEDI (P5, P11, P12)" },
  { a: "WMS-D", b: "WMH", status: "confirmed", que: "eFlow envía las expediciones disponibles a Torre de Control; al crear el viaje, WMH devuelve el número de viaje (Viaje WM / NUMEROVIAJEWMH), la prioridad y la banda asignada.", fuente: "Mapeo funcional COFERSA · P1" },
  { a: "WMS-D", b: "WMH", status: "partial", que: "Torre de Control lee de EFLOW_OLO mediante tablas de staging ext_tms_* (expediciones, clientes, compañías, choferes…); el proceso de carga no está descrito.", fuente: "Esquema WMH (Integraciones)" },
  { a: "WMH", b: "SORTER", status: "partial", que: "WMH tiene la regla FLOW «MECALUX» (indica si el cliente usa interfaces de Mecalux) y el catálogo de Bajadas; el mecanismo de intercambio con el sorter no está documentado.", fuente: "Reglas del sistema de WMH" },
  { a: "WMH", b: "SORTER", status: "inferred", que: "WMH tiene 7 bajadas (incline-belt) y la Planta Baja del sorter tiene 7 bajadas: podrían ser las mismas salidas físicas. Sin confirmar.", fuente: "Catálogo Bajadas (WMH) · Home del sorter" },
  { a: "WMS-D", b: "SORTER", status: "partial", que: "Las órdenes de recepción / expedientes de EPA (ej. CONSOL) que clasifica el sorter vienen de la operación de eFlow; cómo llegan al sorter y cómo vuelve el resultado es un GAP.", fuente: "Manual SORTER CLIRO" },
  { a: "SORTER", b: "WMS-D", status: "confirmed", que: "Después de clasificar, el despacho a tienda de EPA sigue en P4 · Despacho EPA (Apolo + Carga Camión de eFlow).", fuente: "Procedimiento P4 · Manual SORTER" },
];
