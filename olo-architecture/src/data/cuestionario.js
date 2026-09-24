// ═══════════════════════════════════════════════════════════════════════════
// Cuestionario para cerrar las brechas del BPA, agrupado por destinatario.
// Cada pregunta dice qué brecha responde (GAP·nn de Contexto › Brechas, o el
// pendiente del mapeo de Torre) y dónde se registra la respuesta en el BPA.
// Se muestra en Contexto › Cuestionario con un botón para copiarlo y enviarlo.
// ═══════════════════════════════════════════════════════════════════════════

import { PROCESOS } from "./procesos_fichas.js";
import { rolInferido, decisionesDe, tipoFicha } from "./workflows.js";

// cifras vivas del levantamiento (cambian cuando cambian las fichas)
const FICHAS = Object.values(PROCESOS);
const PASOS = FICHAS.flatMap(p => p.pasos.map((_, i) => [p.codigo, i]));
const conRol = PASOS.filter(([c, i]) => rolInferido(c, i)).length;
const sinUbicar = FICHAS.reduce((a, p) => a + decisionesDe(p.codigo).filter(d => d.despuesDe == null).length, 0);
const borradores = FICHAS.filter(p => tipoFicha(p) === "borrador").length;

export const CUESTIONARIO = [
  {
    id: "ti", destinatario: "TI de OLO y equipo del proyecto de integración WMS–OLO–3PL–Softland",
    nota: "El plan del proyecto (feb–jul 2026) prevé un documento funcional, un modelo de datos y un diseño técnico (fases 3 y 4): si ya existen, responden buena parte de este bloque.",
    preguntas: [
      { gap: "Accesos", p: "El monitoreo de bases (24-sep-2026) detectó que el usuario de integración perdió acceso: ¿pueden devolverle permiso de lectura de metadatos (VIEW DEFINITION) en EFLOW_OLO (PROD CR) y acceso a SOFTLANDQA (QA VE)? Sin eso no se puede verificar lo que el BPA documenta del WMS de Costa Rica ni de Softland Venezuela.", va: "Contexto › Cambios en bases" },
      { gap: "Accesos", p: "Las bases QA_EFLOW_OLO, QA_EINTEGRA_CONFIG, OLO_CLIRO_EFLOW y HSAPRUEBA (QA CR) están fuera de línea: ¿es definitivo? ¿Dónde quedó el ambiente de QA de eFlow y del sorter?", va: "Contexto › Cambios en bases" },
      { gap: "GAP·01", p: "¿Cómo se comunican Softland y eFlow: servicio web, archivos, base de datos intermedia o cola de mensajes? ¿Qué datos viajan en cada sentido y cada cuánto?", va: "Relaciones de sistemas y Contexto › Aplicaciones" },
      { gap: "GAP·01", p: "¿Nos pueden compartir el documento funcional, el modelo de datos y el diseño técnico del proyecto de integración, aunque sean borradores?", va: "Contexto › Fuentes" },
      { gap: "GAP·05", p: "¿Qué proceso llena las tablas ext_tms_* que lee la Torre de Control? ¿Cómo vuelven a eFlow el número de viaje, la prioridad y la banda?", va: "Operación › Cómo se relacionan (WMS ↔ WMH)" },
      { gap: "GAP·04", p: "¿Existe un TMS para transporte internacional, un sistema aduanero (TICA) o un portal / EDI para clientes? Marca, dueño y cómo se conectan.", va: "Silos P1.9 Aduaneros y P1.17 Transporte internacional" },
      { gap: "GAP·02", p: "¿Hay diccionario de datos del esquema EFLOW_OLO (qué significa cada tabla y sus claves)?", va: "Integraciones › EFW" },
    ],
  },
  {
    id: "eprac", destinatario: "ePRAC (proveedor de eflow WMS, handheld y Torre de Control)",
    preguntas: [
      { gap: "Torre 4.6", p: "¿Con qué botón o acción de eFlow se envían los pedidos a la Torre de Control?", va: "Procesos › P1 Torre de Control Cofersa, paso correspondiente" },
      { gap: "Torre 4.9", p: "¿En qué columnas de eFlow se ven la prioridad, la banda asignada y el número de viaje?", va: "Procesos › P1, y manual de eFlow WMS" },
      { gap: "Torre 4.11", p: "¿Con qué botón se «generan» los pedidos desde Acciones de Trabajo y qué valor equivale a «prioridad alta»?", va: "Procesos › P1" },
      { gap: "Torre", p: "¿Qué significan los tipos de trabajo EXES, PICK, REPI, UBCO y UBRE?", va: "Contexto › Glosario" },
      { gap: "GAP·08", p: "¿Hay manual o listado de las opciones del handheld RF? Solo conocemos las que salen en las capturas de los procedimientos.", va: "Operación › eFlow WMS · handheld" },
      { gap: "GAP·06", p: "¿Cuáles son las pantallas del cobro de almacenaje eInv (corte, estadía por palet, pre-proforma, factura)?", va: "Silo P1.6 Servicio logístico · procesos SLC" },
    ],
  },
  {
    id: "mecalux", destinatario: "Mecalux (SORTER CLIRO)",
    preguntas: [
      { gap: "GAP·07", p: "¿Cómo llegan al sorter las órdenes de recepción de EPA y cómo vuelve la clasificación a eFlow / EPA?", va: "Silo Cross Docking · XDK-01 y XDK-02" },
      { gap: "GAP·07", p: "¿Las 7 bajadas de la Torre de Control son las 7 salidas de la Planta Baja del sorter?", va: "Operación › Cómo se relacionan (SORTER ↔ WMH)" },
    ],
  },
  {
    id: "operaciones", destinatario: "Operaciones del CEDI (jefaturas de almacén, inventario, transporte y servicio al cliente)",
    nota: "Este bloque se responde directamente en el BPA: Workflows › cada paso › «Es correcto» o «Pedir corrección».",
    preguntas: [
      { gap: "Borradores", p: `Revisar los ${borradores} procesos en borrador (inventario, almacenamiento ZF, valor agregado, servicio logístico, desempeño, seguimiento, transporte local): ¿la secuencia de pasos es la real?`, va: "Workflows › validación de pasos" },
      { gap: "Roles", p: `Confirmar quién ejecuta cada paso: ${PASOS.length - conRol} pasos quedaron sin rol asignado y ${conRol} tienen un rol inferido.`, va: "Workflows › panel del paso › Rol que lo ejecuta" },
      { gap: "Decisiones", p: `Ubicar en el flujo las ${sinUbicar} decisiones que quedaron «sin ubicar» (¿en qué paso se toma cada una?).`, va: "Workflows › modo edición" },
      { gap: "GAP·06", p: "¿Hay procedimiento aprobado para Servicios Especiales y los demás servicios de valor agregado?", va: "Silo P1.21 Valor agregado" },
    ],
  },
  {
    id: "finanzas", destinatario: "Finanzas y administración de Softland",
    preguntas: [
      { gap: "GAP·03", p: "¿Nos pueden compartir los manuales de Softland (CC, CB, FA, CG y los pendientes AS, POS, FR, AC, Capital Humano, Caja Chica, Control de Proyectos, Flujo de Caja)? Con ellos se arman los procesos de Cobro, Facturación y Financiero a clientes.", va: "Silos P1.10, P1.11, P1.12 y P1.14" },
      { gap: "Silos vacíos", p: "¿Cómo se hace hoy el cobro a clientes (del documento en Softland al recibo aplicado) y quién lo ejecuta?", va: "Silo P1.11 Cobro" },
      { gap: "GAP·09", p: "Para Venezuela: requisitos del SENIAT, formato de los libros fiscales y configuración de IVA en el Monitor Fiscal.", va: "Contexto › Localizaciones" },
    ],
  },
];

// Texto plano de un bloque, listo para pegar en un correo o chat
export function textoParaEnviar(b) {
  const lineas = [`Preguntas para: ${b.destinatario}`, "", "Estamos documentando la operación de OLO en el BPA y nos faltan estos datos:", ""];
  b.preguntas.forEach((q, i) => lineas.push(`${i + 1}. ${q.p}`));
  if (b.nota) lineas.push("", b.nota);
  lineas.push("", "¡Gracias!");
  return lineas.join("\n");
}
