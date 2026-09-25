// ═══════════════════════════════════════════════════════════════════════════
// DATOS · Softland: lo que falta por mapear, por qué no se ha hecho y qué implica.
// Fuente: cobertura del manual del Softland de OLO (compañía OVERSEAS, 25/09/2026),
// validación de accesos del usuario de integración (25/09/2026) y los pasos de
// los procesos que citan Softland. Los pasos afectados se calculan de los datos.
//   tipo: acceso | levantamiento | seguridad | integracion | alcance
//   prioridad: alta | media | baja  (según cuántos procesos dependen de eso)
//   modulos: códigos de módulo cuyos pasos sin pantalla cuentan como afectados
// ═══════════════════════════════════════════════════════════════════════════
import { PROCESOS } from "./procesos_fichas.js";
import { SFL_PASO_PANTALLA } from "./softland_manual_links.js";

export const SFL_PENDIENTES = [
  { id:"as", tipo:"acceso", prioridad:"alta", que:"AS · Administración del Sistema (usuarios, privilegios, compañías)",
    estado:"Sin acceso: al abrir Administración da «Login failed for user 'AROJAS'».",
    porque:"El usuario con el que se hizo el levantamiento no tiene permiso sobre la base de administración de Softland.",
    implica:"No se sabe quién puede aprobar, aplicar o procesar en cada módulo: los responsables de los procesos borrador de Cobro, Facturación y Financiero siguen inferidos y no se puede revisar la segregación de funciones (quién factura no debería aplicar pagos).",
    necesita:"Acceso de consulta a AS para AROJAS, o que TI entregue la matriz de usuarios y privilegios.", quien:"TI de OLO" },
  { id:"cg", tipo:"levantamiento", prioridad:"alta", modulos:["CG"], que:"CG · Contabilidad General: pantallas",
    estado:"Solo mapa de menús (estructura completa, sin abrir pantallas).",
    porque:"El levantamiento se priorizó en los módulos operativos (inventario, compras, facturación, cobro y pago); abrir contabilidad en modo consulta requiere acompañamiento de Finanzas para no tocar asientos.",
    implica:"Los procesos de cierre y estados financieros (FIN-01 a FIN-04) no muestran pantalla real, y no se conoce el catálogo de cuentas ni los paquetes contables con que CC, FA y CO generan sus asientos.",
    necesita:"Sesión de 1–2 horas con Finanzas abriendo en consulta Cuentas, Diario, Consulta del Mayor y los reportes de balance.", quien:"Finanzas" },
  { id:"cb", tipo:"levantamiento", prioridad:"alta", modulos:["CB"], que:"CB · Control Bancario: pantallas",
    estado:"Solo mapa de menús.",
    porque:"Igual que CG: no se abrió en el primer levantamiento; sus pantallas muestran cuentas bancarias y movimientos reales.",
    implica:"La conciliación bancaria y el registro de depósitos de clientes (COB-01, COB-04) quedan sin pantalla; no se sabe con qué bancos y formatos se concilia.",
    necesita:"Abrir en consulta Cuentas Bancarias, Movimientos en Bancos y Conciliar Cuentas con Tesorería.", quien:"Finanzas · Tesorería" },
  { id:"cc_fa", tipo:"levantamiento", prioridad:"media", modulos:["CC", "FA"], que:"Opciones de CC y FA que citan los procesos y el manual no recorrió (Parcialidades, Garantías, Intereses de Mora, Configuración Clientes, Precios de Artículos, Reglas de Descuento, Carga a Contabilidad…)",
    estado:"Los módulos tienen pantallas, pero no estas opciones.",
    porque:"Varias están en Administración o Procesos (se evitaron por riesgo) y otras toman su nombre del diccionario de Cofersa, que no coincide exacto con el menú de OLO.",
    implica:"Los procesos de Cobro, Comercialización (precios y descuentos) y el cierre quedan con pasos sin captura, y no se confirma que la opción exista con ese nombre en OLO.",
    necesita:"Abrirlas en consulta en el próximo levantamiento y corregir el nombre de la opción en el paso si difiere.", quien:"Proyecto BPA · Finanzas" },
  { id:"cedi07", tipo:"alcance", prioridad:"media", procesos:["CEDI-07"], que:"CEDI-07 · Facturación Cofersa: pantallas del Softland del cliente",
    estado:"El procedimiento cita Pedidos, Generar Factura y Comprobantes Enviados, pero sin captura.",
    porque:"Esa facturación se hace en la compañía del cliente (Cofersa), no en OVERSEAS: las capturas del manual de OLO son de otra compañía y no se reutilizan para no mezclar datos.",
    implica:"El único procedimiento aprobado que usa Softland no se puede presentar pantalla por pantalla.",
    necesita:"Capturas de esas 3 pantallas en la compañía de Cofersa (sin datos sensibles) o confirmar que son idénticas a las de OVERSEAS.", quien:"Facturación CEDI" },
  { id:"procesos", tipo:"seguridad", prioridad:"media", modulos:[], que:"Carpeta «Procesos» de cada módulo (cierres, cargas contables, recálculos, purgas)",
    estado:"No se abrió ninguna.",
    porque:"Son las opciones de mayor riesgo del ERP: ejecutan cambios masivos. El levantamiento fue estrictamente de consulta.",
    implica:"Pasos como Carga a Contabilidad, Procesos Contables de CC o Recálculo de Saldos se describen por el menú pero sin su ventana de parámetros; el cierre mensual (FIN-01) no se puede validar en pantalla.",
    necesita:"Demostración guiada en un ambiente de pruebas (QA) o capturas que entregue Finanzas al ejecutar el cierre real.", quien:"Finanzas" },
  { id:"de_conf", tipo:"seguridad", prioridad:"baja", que:"DE · Configuración de Documentos Electrónicos (conexión con Hacienda)",
    estado:"No se abrió a propósito.",
    porque:"La pantalla contiene el usuario y la clave del API de Hacienda, el certificado de firma y el correo de salida.",
    implica:"No está documentado cómo se conecta OLO con Hacienda (ambiente, certificado, vencimiento), un punto crítico: si el certificado vence, no se puede facturar.",
    necesita:"Que TI documente la configuración SIN las credenciales: ambiente, vigencia del certificado y responsable de renovarlo.", quien:"TI de OLO" },
  { id:"menus", tipo:"levantamiento", prioridad:"baja", modulos:["AF", "CR", "CH", "RP", "GN", "MF"], que:"AF, CR, CH, RP, GN y MF: pantallas",
    estado:"Solo mapa de menús.",
    porque:"Ningún proceso del BPA depende hoy de ellos (salvo MF para la declaración D104); GN tiene datos personales y salariales.",
    implica:"Bajo impacto en los procesos actuales. MF (proporcionalidad de IVA y D104) sí importa para el cumplimiento fiscal; GN solo se documentaría a nivel de menú por privacidad.",
    necesita:"MF con Finanzas cuando se levante el proceso fiscal; el resto, solo si aparece un proceso que los use.", quien:"Finanzas" },
  { id:"sueltos", tipo:"levantamiento", prioridad:"baja", que:"Pantallas sueltas sin captura: Contactos de FA, Facturación de anticipos, Carga Masiva Docs (CC), otros catálogos de FA",
    estado:"Descritas en el manual, sin captura.",
    porque:"Requieren datos o una acción para abrirse (la carga masiva es un proceso) o quedaron fuera del recorrido.",
    implica:"Menor: no hay pasos de procesos que dependan de ellas.",
    necesita:"Completar en el próximo levantamiento.", quien:"Proyecto BPA" },
  { id:"bd_olo", tipo:"acceso", prioridad:"alta", que:"Base SOFTLAND propia de OLO (servidor 10.17.224.40)",
    estado:"El BPA no tiene usuario de lectura.",
    porque:"La solicitud de usuario de integración (OL25003) cubrió las bases de eFlow y el Softland de los clientes, no el Softland de OLO.",
    implica:"No hay diccionario de tablas del ERP propio: el diccionario del BPA es el de Cofersa (QA CR). El job de cambios en bases no vigila el Softland de OLO y el Asesor no ve sus tablas.",
    necesita:"Agregar la base SOFTLAND (y la de Documentos Electrónicos) al usuario usr_crw_integration_olo, solo lectura.", quien:"Intelix / TI de OLO" },
  { id:"ve", tipo:"acceso", prioridad:"media", que:"Softland Venezuela (SOFTLANDQA: Beval, Febeca, Sillaca, Trexa, Prisma)",
    estado:"Sin permiso de lectura tras el refresco del 25/09/2026.",
    porque:"El refresco de permisos no incluyó esa base.",
    implica:"Venezuela solo tiene los esquemas de tablas extraídos antes; no hay menú ni diccionario, y no se puede preparar la expansión (SENIAT, IVA venezolano).",
    necesita:"Reclamar a Intelix el permiso sobre SOFTLANDQA.", quien:"Intelix" },
  { id:"prd", tipo:"acceso", prioridad:"media", que:"Softland de producción CR/VE y SCH CR",
    estado:"No entregados.",
    porque:"Estaban en el alcance de la solicitud original pero no se otorgaron.",
    implica:"Lo que el BPA sabe del Softland de los clientes viene de QA: puede diferir de producción en configuración y módulos instalados.",
    necesita:"Confirmar con Intelix si se entregarán o si QA es la fuente oficial.", quien:"Intelix" },
  { id:"interfaz", tipo:"integracion", prioridad:"alta", que:"Interfaz Softland ↔ eFlow (eIntegra)",
    estado:"Se sabe que existe (bases EINTEGRA_COFERSA, EINTEGRA_MAYOREO, EINTEGRA_EPA) pero no cómo funciona.",
    porque:"No hay documentación del mecanismo (servicio, archivos, base intermedia o cola) ni de su frecuencia.",
    implica:"No se puede explicar ni diagnosticar por qué un pedido del ERP no llega al WMS o por qué un cierre no vuelve; tampoco el costo real de integrar un cliente nuevo.",
    necesita:"Que TI / ePRAC documenten qué datos viajan en cada sentido, por qué medio y cada cuánto.", quien:"TI de OLO · ePRAC" },
  { id:"alcance", tipo:"alcance", prioridad:"baja", que:"Módulos descritos en los manuales del proveedor que no están en OLO: POS, FR, AC, Capital Humano, Control de Proyectos, Flujo de Caja",
    estado:"No aparecen en el menú del Softland de OLO.",
    porque:"Vienen de los manuales genéricos de Softland, no del ERP de OLO.",
    implica:"No hace falta mapearlos para OLO; siguen en el ecosistema solo como referencia del producto.",
    necesita:"Confirmar con Finanzas que no se usan (ni en otra compañía).", quien:"Finanzas" },
];

export const TIPO_PEND = {
  acceso:       { label:"Acceso",        color:"#b91c1c" },
  levantamiento:{ label:"Levantamiento", color:"#b45309" },
  seguridad:    { label:"Seguridad",     color:"#7c3aed" },
  integracion:  { label:"Integración",   color:"#0369a1" },
  alcance:      { label:"Alcance",       color:"#475569" },
};
export const PRIORIDAD_PEND = { alta:{ label:"Alta", color:"#b91c1c" }, media:{ label:"Media", color:"#b45309" }, baja:{ label:"Baja", color:"#64748b" } };

// Pasos de procesos en Softland que todavía no tienen pantalla, por módulo
export const PASOS_SFL_SIN_PANTALLA = (() => {
  const out = {};
  for (const p of Object.values(PROCESOS)) p.pasos.forEach((s, i) => {
    if (s.sistema !== "softland" || SFL_PASO_PANTALLA[p.codigo]?.[i] != null) return;
    const m = /Softland\s*›\s*([A-Z]{2,3})\b/.exec(s.pantalla || "")?.[1] || "otro";
    (out[m] ||= []).push({ codigo: p.codigo, paso: i + 1, texto: s.texto });
  });
  return out;
})();

// Pasos afectados por un pendiente: los de sus módulos o sus procesos que siguen sin pantalla
export function pasosAfectados(pend) {
  const todos = Object.values(PASOS_SFL_SIN_PANTALLA).flat();
  if (pend.procesos) return todos.filter(x => pend.procesos.includes(x.codigo));
  return (pend.modulos || []).flatMap(m => PASOS_SFL_SIN_PANTALLA[m] || []);
}
