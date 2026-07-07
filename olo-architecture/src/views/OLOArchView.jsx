// ═══════════════════════════════════════════════════════════════════════════
// VISTA · ARQUITECTURA OLO — TO-BE (Solución Propuesta)
// ═══════════════════════════════════════════════════════════════════════════
import { useState, useRef, useEffect, useCallback } from "react";
import { ClusterCard, ClusterTag } from "../components/ui.jsx";

export function OLOArchView({ searchQuery="" }) {
  const [selectedNode, setSelectedNode] = useState(null);
  const [hoveredNode,  setHoveredNode]  = useState(null);

  // ── Edit mode state ────────────────────────────────────────────────────────
  const [editMode,       setEditMode]       = useState(false);
  // Posiciones y conexiones guardadas por el usuario — baked como defaults
  const DEFAULT_NODE_OVERRIDES = {
    eflow_api:         {x:90,  y:58},
    db_intermedia:     {x:72,  y:116},
    db_eflow:          {x:214, y:116},
    eprac:             {x:199, y:55},
    softland:          {x:95,  y:173},
    terceros:          {x:135, y:285},
    comercializadoras: {x:121, y:348},
    mayoreo:           {x:128, y:413},
    epa:               {x:131, y:479},
    proveedores:       {x:939, y:397},
    raganext:          {x:429, y:389},
    api_dim:           {x:555, y:422},
    olo_api:           {x:673, y:453},
    mecalux:           {x:730, y:393},
    trade:             {x:828, y:393},
    azure:             {x:1042,y:72},
    onpremise_zone:    {x:27,  y:7,   w:308, h:144},
    clientes_zone:     {x:87,  y:254, w:168, h:264},
    azure_zone:        {x:1030,y:24,  w:122, h:219},
    aws_zone:          {x:378, y:26,  w:628, h:202},
    middleware_zone:   {x:350, y:271, w:561, h:240},
  };
  const DEFAULT_CONNS = [
    {from:"eflow_api",         to:"db_intermedia"},
    {from:"db_intermedia",     to:"eflow_api"},
    {from:"db_intermedia",     to:"db_eflow"},
    {from:"db_eflow",          to:"db_intermedia"},
    {from:"db_eflow",          to:"eprac"},
    {from:"eprac",             to:"db_eflow"},
    {from:"onpremise_zone",    to:"vias_zone"},
    {from:"vias_zone",         to:"onpremise_zone"},
    {from:"softland",          to:"vias_zone"},
    {from:"vias_zone",         to:"softland"},
    {from:"softland",          to:"onpremise_zone"},
    {from:"cola_eventos",      to:"vias_zone"},
    {from:"vias_zone",         to:"cola_eventos"},
    {from:"cola_eventos",      to:"persistencia_eventos"},
    {from:"persistencia_eventos",to:"repositorio_eventos"},
    {from:"repositorio_eventos", to:"monitor_eventos"},
    {from:"cola_eventos",      to:"normalizacion"},
    {from:"normalizacion",     to:"amazon_rds_1"},
    {from:"normalizacion",     to:"notificacion"},
    {from:"amazon_rds_1",      to:"amazon_rds_2"},
    {from:"amazon_rds_2",      to:"lago_datos"},
    {from:"azure",             to:"lago_datos"},
    {from:"lago_datos",        to:"azure"},
    {from:"sro",               to:"aws_zone"},
    {from:"aws_zone",          to:"sro"},
    {from:"appolo",            to:"aws_zone"},
    {from:"aws_zone",          to:"appolo"},
    {from:"ultima_milla",      to:"aws_zone"},
    {from:"aws_zone",          to:"ultima_milla"},
    {from:"liquidador",        to:"aws_zone"},
    {from:"aws_zone",          to:"liquidador"},
    {from:"trade",             to:"aws_zone"},
    {from:"aws_zone",          to:"trade"},
    {from:"mecalux",           to:"aws_zone"},
    {from:"aws_zone",          to:"mecalux"},
    {from:"olo_api",           to:"aws_zone"},
    {from:"aws_zone",          to:"olo_api"},
    {from:"api_dim",           to:"aws_zone"},
    {from:"aws_zone",          to:"api_dim"},
    {from:"raganext",          to:"aws_zone"},
    {from:"aws_zone",          to:"raganext"},
    {from:"trade",             to:"proveedores"},
    {from:"proveedores",       to:"trade"},
    {from:"olo_api",           to:"terceros"},
    {from:"terceros",          to:"olo_api"},
    {from:"raganext",          to:"mayoreo"},
    {from:"mayoreo",           to:"raganext"},
    {from:"epa",               to:"raganext"},
    {from:"raganext",          to:"epa"},
    {from:"comercializadoras", to:"raganext"},
    {from:"raganext",          to:"comercializadoras"},
    {from:"epa",               to:"olo_api"},
    {from:"olo_api",           to:"epa"},
    {from:"epa",               to:"api_dim"},
    {from:"api_dim",           to:"epa"},
    {from:"mayoreo",           to:"api_dim"},
    {from:"api_dim",           to:"mayoreo"},
    {from:"mayoreo",           to:"olo_api"},
    {from:"olo_api",           to:"mayoreo"},
    {from:"comercializadoras", to:"olo_api"},
    {from:"olo_api",           to:"comercializadoras"},
  ];

  const [nodeOverrides,  setNodeOverrides]  = useState(() => {
    try {
      const s = JSON.parse(localStorage.getItem('olo-node-ov'));
      if (s && Object.keys(s).length > 0) return s;
    } catch {}
    return DEFAULT_NODE_OVERRIDES;
  });
  const [editConns,      setEditConns]      = useState(() => {
    try {
      const s = localStorage.getItem('olo-conns');
      if (s) return JSON.parse(s);
    } catch {}
    return DEFAULT_CONNS;
  });
  const [connectFrom,    setConnectFrom]    = useState(null);
  const [mousePos,       setMousePos]       = useState({x:580,y:310});
  const [hovConn,        setHovConn]        = useState(null);
  const [routeMode,      setRouteMode]      = useState('bezier'); // 'bezier' | 'ortho'
  const dragRef = useRef(null);   // {type, id, ox, oy, [ow, oh, handle], mx0, my0, moved}
  const svgRef  = useRef(null);

  // ── Zoom / Pan ────────────────────────────────────────────────────────────
  const [zoom,  setZoom]  = useState(1);
  const [panXY, setPanXY] = useState({x:0, y:0});
  const zoomRef    = useRef(1);
  const panRef     = useRef({x:0, y:0});
  const panDragRef = useRef(null);   // {mx0,my0,px0,py0}

  const setZoomPan = useCallback((z, p) => {
    zoomRef.current = z; panRef.current = p; setZoom(z); setPanXY(p);
  }, []);
  const resetView = useCallback(() => setZoomPan(1,{x:0,y:0}), [setZoomPan]);

  const svgPt = useCallback((e) => {
    const r = svgRef.current?.getBoundingClientRect();
    if (!r) return {x:0,y:0};
    const rx=(e.clientX-r.left)*(1160/r.width), ry=(e.clientY-r.top)*(620/r.height);
    const p=panRef.current, z=zoomRef.current;
    return { x:(rx-p.x)/z, y:(ry-p.y)/z };
  }, []);

  // ── Export ────────────────────────────────────────────────────────────────
  const exportDiagram = useCallback((fmt) => {
    const svg = svgRef.current; if (!svg) return;
    let str = new XMLSerializer().serializeToString(svg);
    if (!str.includes('xmlns=')) str = str.replace('<svg','<svg xmlns="http://www.w3.org/2000/svg"');
    if (fmt === 'svg') {
      const a = Object.assign(document.createElement('a'), {
        href: URL.createObjectURL(new Blob([str],{type:'image/svg+xml'})),
        download: 'olo-architecture.svg'
      }); a.click();
    } else {
      const vb = svg.viewBox.baseVal, sc = 2;
      const img = new Image();
      img.onload = () => {
        const c = document.createElement('canvas');
        c.width = vb.width*sc; c.height = vb.height*sc;
        c.getContext('2d').drawImage(img,0,0,c.width,c.height);
        c.toBlob(b => {
          const a = Object.assign(document.createElement('a'), {href:URL.createObjectURL(b), download:'olo-architecture.png'});
          a.click();
        });
      };
      img.src = URL.createObjectURL(new Blob([str],{type:'image/svg+xml'}));
    }
  }, []);

  useEffect(() => {
    const onMove = (e) => {
      // Pan (non-edit mode)
      const pd = panDragRef.current;
      if (pd) {
        const r = svgRef.current?.getBoundingClientRect(); if (!r) return;
        const rx=(e.clientX-r.left)*(1160/r.width), ry=(e.clientY-r.top)*(620/r.height);
        const np={x:pd.px0+(rx-pd.mx0), y:pd.py0+(ry-pd.my0)};
        panRef.current=np; setPanXY(np); return;
      }
      const d = dragRef.current; if (!d) return;
      const pt = svgPt(e);
      const dx=pt.x-d.mx0, dy=pt.y-d.my0;
      if (Math.abs(dx)>2||Math.abs(dy)>2) d.moved = true;
      if (!d.moved) return;

      if (d.type==='zone-resize') {
        let up={};
        const MIN_W=60, MIN_H=40;
        if      (d.handle==='nw') up={x:d.ox+dx,y:d.oy+dy,w:Math.max(MIN_W,d.ow-dx),h:Math.max(MIN_H,d.oh-dy)};
        else if (d.handle==='ne') up={y:d.oy+dy,w:Math.max(MIN_W,d.ow+dx),h:Math.max(MIN_H,d.oh-dy)};
        else if (d.handle==='se') up={w:Math.max(MIN_W,d.ow+dx),h:Math.max(MIN_H,d.oh+dy)};
        else if (d.handle==='sw') up={x:d.ox+dx,w:Math.max(MIN_W,d.ow-dx),h:Math.max(MIN_H,d.oh+dy)};
        setNodeOverrides(prev=>({...prev,[d.id]:{...(prev[d.id]||{}),...up}}));
      } else {
        // zone-move y node-move: solo x,y
        setNodeOverrides(prev=>({...prev,[d.id]:{...(prev[d.id]||{}),x:d.ox+dx,y:d.oy+dy}}));
      }
    };
    const onUp = () => {
      panDragRef.current = null;
      if (!dragRef.current) return;
      dragRef.current = null;
      setNodeOverrides(prev => { localStorage.setItem('olo-node-ov',JSON.stringify(prev)); return prev; });
    };
    const onKey = (e) => { if(e.key==='Escape') setConnectFrom(null); };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup',   onUp);
    window.addEventListener('keydown',   onKey);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup',   onUp);
      window.removeEventListener('keydown',   onKey);
    };
  }, [svgPt]);

  // Wheel zoom (nativo para poder prevenir default)
  useEffect(() => {
    const svg = svgRef.current; if (!svg) return;
    const onWheel = (e) => {
      e.preventDefault();
      const f = e.deltaY < 0 ? 1.15 : 1/1.15;
      const newZ = Math.max(0.15, Math.min(6, zoomRef.current*f));
      const r = svg.getBoundingClientRect();
      const rx=(e.clientX-r.left)*(1160/r.width), ry=(e.clientY-r.top)*(620/r.height);
      const dz=newZ/zoomRef.current;
      setZoomPan(newZ, {x:rx-dz*(rx-panRef.current.x), y:ry-dz*(ry-panRef.current.y)});
    };
    svg.addEventListener('wheel', onWheel, {passive:false});
    return () => svg.removeEventListener('wheel', onWheel);
  }, [setZoomPan]);

  const nodes = {
    // ── On-Premise OLO ───────────────────────────────────────────────────────
    eflow_api:    { id:"eflow_api",    label:"eflow_api",              x:40,  y:68,  w:74,  h:24, color:"#1D4ED8", bg:"#DBEAFE", desc:"API de eFlow.\nEscribe en la DB Intermedia eFlow.\n• dev/qa: 10.17.224.224  • prod: 10.17.224.20" },
    db_intermedia:{ id:"db_intermedia",label:"db Intermedia eFlow",    x:40,  y:104, w:110, h:18, color:"#6B7280", bg:"#F3F4F6", desc:"DB staging intermedia de eFlow.\nReplica y migra datos hacia db eFlow." },
    db_eflow:     { id:"db_eflow",     label:"db eFlow",               x:186, y:104, w:68,  h:18, color:"#6B7280", bg:"#F3F4F6", desc:"Base de datos final de eFlow.\nConsolida datos de la DB intermedia.\nRelación BIDIRECCIONAL con ePrac/SQL Server:\nalimenta y recibe retroalimentación (1.3/1.4, v3)." },
    eprac:        { id:"eprac",        label:"ePrac (SQL Server)",     x:192, y:56,  w:100, h:28, color:"#7C3AED", bg:"#EDE9FE", desc:"ePrac · SQL Server.\nRelación bidireccional con db eFlow: lectura/escritura (1.4, v3).\nFlujo bidireccional con Softland: Facturación de Servicios (2.1).\n• qa: 10.17.224.226  • prod: 10.48.17.91" },
    // ── Softland ─────────────────────────────────────────────────────────────
    softland:     { id:"softland",     label:"Softland",               x:40,  y:183, w:130, h:44, color:"#1D4ED8", bg:"#EBF3FB", desc:"ERP Softland v7.00 · motor Exactus.\nFlujo bidireccional con ePrac: Facturación de Servicios (2.1).\nSOLO conecta con ePrac — sin conexión directa a entidades fuente (v4)." },
    // ── Fuentes / clientes ───────────────────────────────────────────────────
    terceros:     { id:"terceros",     label:"Terceros",               x:183, y:278, w:87,  h:26, color:"#374151", bg:"#F9FAFB", desc:"Terceros — Navieras, Proveedores de Servicio, Puertos.\n→ RagaNext: OC, Navieras, Proveedor Servicio, Puertos, Tipo Contenedor, Tarifa, Transporte (BLOQUE 3).\n← Softland: Orden de Pedido, Expedición (BLOQUE 4).\n← RagaNext (retorno): datos consolidados OLO (BLOQUE 10)." },
    comercializadoras:{ id:"comercializadoras",label:"Comercializadoras",x:128,y:334,w:112,h:26, color:"#374151", bg:"#F9FAFB", desc:"Comercializadoras.\n→ RagaNext: Artículos (3.2 / 5.7).\n← RagaNext (retorno): Artículos (5.9).\nSOLO interactúa con RagaNext (v4)." },
    mayoreo:      { id:"mayoreo",      label:"Mayoreo",                x:128, y:393, w:87,  h:26, color:"#374151", bg:"#F9FAFB", desc:"Mayoreo (Cofersa, Febeca, Siliaca).\n→ RagaNext: OC, Proveedor, Artículo, Ajuste, Expedición, Cliente, Recibo/Traspasos, Recepción, Distribución, Ubicaciones (BLOQUE 3).\n← RagaNext: mismos datos (BLOQUE 10)." },
    epa:          { id:"epa",          label:"EPA",                    x:128, y:451, w:77,  h:26, color:"#374151", bg:"#F9FAFB", desc:"EPA (CR y VE).\n→ RagaNext: OC, Proveedor, Artículo, Ajuste, Expedición, Cliente, Recibo/Traspasos, Recepción, Distribución, Ubicaciones (BLOQUE 3).\n← RagaNext: mismos datos (BLOQUE 10)." },
    // ── Zone anchors — coinciden con los recuadros del SVG ──────────────────
    onpremise_zone:  { id:"onpremise_zone",  label:"OLO · ON-PREMISE",          x:20,  y:26,  w:282, h:112, color:"#60a5fa", bg:"transparent", type:"zone", desc:"Zona OLO · ON-PREMISE\nEntidades: ePrac (SQL Server) · db eFlow · db Intermedia · eflow_api" },
    vias_zone:       { id:"vias_zone",       label:"Vías de Entradas",           x:388, y:56,  w:78,  h:114, color:"#C026D3", bg:"transparent", type:"zone", desc:"Zona Vías de Entradas (AWS OLO)\nEntidades: APIs · S3" },
    aws_zone:        { id:"aws_zone",        label:"AWS OLO · Servicios OLO",    x:378, y:26,  w:646, h:202, color:"#f59e0b", bg:"transparent", type:"zone", desc:"Zona AWS OLO · Servicios OLO\nEntidades: Colas · Persistencia · Repositorio · Monitor · Normalización · RDS · Lago de Datos · Notificación" },
    clientes_zone:   { id:"clientes_zone",   label:"Clientes / ERP",             x:16,  y:156, w:334, h:362, color:"#94a3b8", bg:"transparent", type:"zone", desc:"Zona Clientes / ERP\nEntidades: Softland · Terceros · Comercializadoras · Mayoreo · EPA" },
    middleware_zone: { id:"middleware_zone", label:"Middleware",                  x:348, y:474, w:596, h:68,  color:"#f87171", bg:"transparent", type:"zone", desc:"Zona Capa de Integración · Middleware\nEntidades: RagaNext · API Dimensionador · OLO API · Mecalux · Trade" },
    azure_zone:      { id:"azure_zone",      label:"Azure",                      x:1030,y:36,  w:122, h:216, color:"#60a5fa", bg:"transparent", type:"zone", desc:"Zona Azure · servicios cloud externos\nEntidades: SRO · APOLLO · Última Milla · Liquidador de Viajes" },
    // ── AWS — Vías de Entradas ───────────────────────────────────────────────
    apis:         { id:"apis",         label:"APIs",                   x:408, y:80,  w:50,  h:28, color:"#C026D3", bg:"#FAE8FF", desc:"Vía de Entrada AWS OLO · REST/HTTP síncronos.\nEl recuadro Vías de Entradas conecta con OLO ON-PREMISE y Softland.\nÚnica salida hacia AWS: Colas de Eventos." },
    s3:           { id:"s3",           label:"S3",                     x:408, y:126, w:50,  h:28, color:"#569A31", bg:"#ECFCCB", desc:"Vía de Entrada AWS OLO · Amazon S3.\nEl recuadro Vías de Entradas conecta con OLO ON-PREMISE y Softland.\nÚnica salida hacia AWS: Colas de Eventos." },
    // ── AWS pipeline (fila superior) ─────────────────────────────────────────
    cola_eventos: { id:"cola_eventos", label:"Colas de Eventos",      x:512, y:68,  w:88,  h:32, color:"#C026D3", bg:"#FAE8FF", desc:"Lambda: encola eventos para procesamiento asíncrono (BLOQUE 6, conexión 12).\nRecibe de APIs y de S3." },
    persistencia_eventos:{ id:"persistencia_eventos",label:"Persistencia de Eventos",x:630,y:68,w:104,h:32,color:"#FF9900",bg:"#FFF7ED",desc:"Lambda: guarda el evento crudo antes de cualquier transformación (BLOQUE 6, conexión 13)." },
    repositorio_eventos: { id:"repositorio_eventos", label:"Repositorio de Eventos",x:764,y:68,w:104,h:32,color:"#FF9900",bg:"#FFF7ED",desc:"BD de eventos crudos · auditoría y replay (BLOQUE 6, conexión 14)." },
    monitor_eventos:     { id:"monitor_eventos",     label:"Monitor de Eventos",    x:898,y:68,w:100,h:32,color:"#FF9900",bg:"#FFF7ED",desc:"Lambda: detecta anomalías, retrasos o eventos sin procesar (4.5).\nMonitorea el Repositorio de Eventos.\nTambién conecta hacia Azure: envía alertas y eventos (6.5, v3)." },
    // ── AWS data row ─────────────────────────────────────────────────────────
    normalizacion:{ id:"normalizacion",label:"Normalización, Traducción y Persistencia",x:512,y:124,w:108,h:40,color:"#FF9900",bg:"#FFF7ED",desc:"Lambda central (BLOQUE 6, conexión 16):\nnormaliza formato, traduce modelo de datos,\npersiste en Repositorio OLO y notifica por tópico SNS/SQS." },
    amazon_rds_1: { id:"amazon_rds_1", label:"Repositorio OLO (RDS)", x:650, y:128, w:104, h:34, color:"#C026D3", bg:"#FAE8FF", desc:"Amazon RDS — Repositorio OLO (BLOQUE 6, conexión 17).\nAlmacena datos normalizados listos para OLO API y otros servicios." },
    amazon_rds_2: { id:"amazon_rds_2", label:"λ Traducción Analítica",x:780, y:128, w:100, h:34, color:"#FF9900", bg:"#FFF7ED", desc:"Lambda de traducción analítica (BLOQUE 6, conexión 19).\nConvierte el modelo del Repositorio OLO al modelo del Data Lake." },
    lago_datos:   { id:"lago_datos",   label:"Lago de Datos",         x:906, y:133, w:88,  h:26, color:"#374151", bg:"#F3F4F6", desc:"Lago de Datos (Amazon RDS).\nDatos analíticos para reporting y BI." },
    // ── Notificación ─────────────────────────────────────────────────────────
    notificacion: { id:"notificacion", label:"Notificación por Tópico",x:512,y:188, w:130, h:24, color:"#FF9900",bg:"#FFF7ED",desc:"SNS/SQS Pub/Sub (BLOQUE 6, conexión 18).\nPublica evento normalizado a suscriptores (BLOQUE 7):\nRagaNext · API Dimensionador · OLO API · Mecalux · Trade." },
    // ── Middleware / suscriptores ─────────────────────────────────────────────
    raganext:     { id:"raganext",     label:"RagaNext (Middleware)",  x:350, y:498, w:120, h:32, color:"#DC2626", bg:"#FEE2E2", desc:"RagaNext — Middleware central de integración.\nRecibe de: Terceros, Comercializadoras, Mayoreo, EPA (D1–D4).\nSuscriptor del tópico de notificación (5.1).\nRetorna datos a: Terceros, Comercializadoras, Mayoreo, EPA (5.8–5.11)." },
    api_dim:      { id:"api_dim",      label:"API Dimensionador",      x:502, y:498, w:100, h:32, color:"#7C3AED", bg:"#EDE9FE", desc:"API Dimensionador (BLOQUE 7, conexión 21).\nCalcula dimensiones y capacidades logísticas a partir de eventos." },
    olo_api:      { id:"olo_api",      label:"OLO API",                x:632, y:498, w:72,  h:32, color:"#059669", bg:"#D1FAE5", desc:"OLO API — Gateway centralizado.\nSuscriptor del tópico de notificación (E3).\nConexión directa a Mecalux: datos de almacén, ubicaciones, distribución (E6).\nConexión bidireccional con Azure (F1–F4):\nSRO · APOLLO · Última Milla · Liquidador de Viajes." },
    mecalux:      { id:"mecalux",      label:"Mecalux",                x:732, y:498, w:72,  h:32, color:"#D97706", bg:"#FEF3C7", desc:"Mecalux — WMS · Warehouse Management System (BLOQUE 7, conexión 23).\nRecibe eventos de distribución y ubicaciones." },
    trade:        { id:"trade",        label:"Trade",                  x:834, y:498, w:62,  h:32, color:"#DC2626", bg:"#FEE2E2", desc:"Trade — Sistema de comercio (BLOQUE 7, conexión 24).\nRecibe eventos OLO: órdenes, expediciones.\nIntermediario hacia Proveedores (BLOQUE 9)." },
    proveedores:  { id:"proveedores",  label:"Proveedores",            x:802, y:570, w:90,  h:26, color:"#374151", bg:"#F9FAFB", desc:"Proveedores externos (BLOQUE 9, conexión 29).\nTrade actúa como intermediario." },
    // ── Azure (BLOQUE 8 / Capa 6) ────────────────────────────────────────────
    azure:        { id:"azure",        label:"Azure",                  x:1046,y:50,  w:88,  h:22, color:"#0078D4", bg:"#E1F0FF", desc:"Microsoft Azure — servicios cloud externos.\nRecibe alertas y eventos del Monitor de Eventos (6.5).\nAloja: SRO · APOLLO · Última Milla · Liquidador de Viajes." },
    sro:          { id:"sro",          label:"SRO",                    x:1050,y:108, w:80,  h:24, color:"#0078D4", bg:"#E1F0FF", desc:"Azure · SRO — Sistema de Rastreo de Órdenes.\nFlujo bidireccional de estados con OLO API (6.1)." },
    appolo:       { id:"appolo",       label:"APOLLO",                 x:1050,y:144, w:80,  h:24, color:"#0078D4", bg:"#E1F0FF", desc:"Azure · APOLLO — Planificación/routing logístico.\nIntercambia datos de expedición y transporte con OLO API (BLOQUE 8, conexión 26)." },
    ultima_milla: { id:"ultima_milla", label:"Última Milla",           x:1046,y:180, w:90,  h:24, color:"#0078D4", bg:"#E1F0FF", desc:"Azure · Última Milla — Logística de última milla.\nRecibe y confirma órdenes de entrega vía OLO API (BLOQUE 8, conexión 27)." },
    liquidador:   { id:"liquidador",   label:"Liquidador de Viajes",   x:1036,y:216, w:100, h:24, color:"#0078D4", bg:"#E1F0FF", desc:"Azure · Liquidador de Viajes — Liquidación de costos de transporte.\nOLO API envía datos para cálculo y liquidación (BLOQUE 8, conexión 28)." },
  };

  // Conexiones — 32 documentadas según arquitectura OLO
  const connections = [
    // BLOQUE 1 — ePrac/eFlow interno
    { from:"eflow_api",          to:"db_intermedia" },
    { from:"db_intermedia",      to:"db_eflow" },
    { from:"db_eflow",           to:"eprac" },
    { from:"eprac",              to:"db_eflow" },
    // BLOQUE 2 — ePrac ↔ Softland (Facturación de Servicios, bidireccional)
    { from:"eprac",              to:"softland" },
    { from:"softland",           to:"eprac" },
    // BLOQUE 3 — Fuentes → RagaNext
    { from:"terceros",           to:"raganext" },
    { from:"comercializadoras",  to:"raganext" },
    { from:"mayoreo",            to:"raganext" },
    { from:"epa",                to:"raganext" },
    // BLOQUE 4 — Softland SOLO ↔ ePrac (v4: X roja sobre Softland→Terceros)
    // Recuadro OLO ON-PREMISE ↔ recuadro Vías de Entradas (zona a zona)
    { from:"onpremise_zone",     to:"vias_zone" },
    { from:"vias_zone",          to:"onpremise_zone" },
    // Softland ↔ recuadro Vías de Entradas
    { from:"softland",           to:"vias_zone" },
    { from:"vias_zone",          to:"softland" },
    // BLOQUE 6 — Flujo interno AWS OLO
    { from:"apis",               to:"cola_eventos" },
    { from:"s3",                 to:"cola_eventos" },
    { from:"cola_eventos",       to:"persistencia_eventos" },
    { from:"persistencia_eventos",to:"repositorio_eventos" },
    { from:"repositorio_eventos",to:"monitor_eventos" },
    { from:"cola_eventos",       to:"normalizacion" },
    { from:"normalizacion",      to:"amazon_rds_1" },
    { from:"normalizacion",      to:"notificacion" },
    { from:"amazon_rds_1",       to:"amazon_rds_2" },
    { from:"amazon_rds_2",       to:"lago_datos" },
    // BLOQUE 7 — Notificación → Suscriptores (líneas punteadas con color por suscriptor, v3)
    { from:"notificacion",       to:"raganext",    dashed:true, color:"#3b82f6" },
    { from:"notificacion",       to:"api_dim",     dashed:true, color:"#22c55e" },
    { from:"notificacion",       to:"olo_api",     dashed:true, color:"#a855f7" },
    { from:"notificacion",       to:"mecalux",     dashed:true, color:"#ec4899" },
    { from:"notificacion",       to:"trade",       dashed:true, color:"#94a3b8" },
    // BLOQUE 8 — OLO API ↔ Azure (bidireccional)
    { from:"olo_api",            to:"sro" },
    { from:"sro",                to:"olo_api" },
    { from:"olo_api",            to:"appolo" },
    { from:"appolo",             to:"olo_api" },
    { from:"olo_api",            to:"ultima_milla" },
    { from:"ultima_milla",       to:"olo_api" },
    { from:"olo_api",            to:"liquidador" },
    { from:"liquidador",         to:"olo_api" },
    // E6 — OLO API → Mecalux (conexión directa dentro del middleware)
    { from:"olo_api",            to:"mecalux" },
    // 6.5 — Monitor de Eventos → Azure (alertas/observabilidad)
    { from:"monitor_eventos",    to:"azure",           dashed:true },
    // BLOQUE 9 — Trade → Proveedores
    { from:"trade",              to:"proveedores" },
    // BLOQUE 10 — RagaNext retorna a sistemas origen (5.8–5.11)
    { from:"raganext",           to:"terceros",        dashed:true },
    { from:"raganext",           to:"comercializadoras",dashed:true },
    { from:"raganext",           to:"mayoreo",         dashed:true },
    { from:"raganext",           to:"epa",             dashed:true },
  ];

  // ── Versiones efectivas (base + overrides de edición) ─────────────────────
  const effNodes = Object.fromEntries(
    Object.entries(nodes).map(([k,v]) =>
      [k, nodeOverrides[k] ? {...v, ...nodeOverrides[k]} : v]
    )
  );
  const effConns = editConns ?? connections;

  // ── Edit mode handlers ─────────────────────────────────────────────────────
  const handleNodeDown = (e, id) => {
    if (!editMode) return;
    if (effNodes[id]?.type==='zone') return;
    if (connectFrom !== null) return;
    e.stopPropagation(); e.preventDefault();
    const n = effNodes[id];
    dragRef.current = {id, ox:n.x, oy:n.y, mx0:svgPt(e).x, my0:svgPt(e).y, moved:false};
  };
  const handleNodeClick = (e, id) => {
    if (!editMode) { setSelectedNode(prev => prev===id ? null : id); return; }
    if (dragRef.current?.moved) return;
    e.stopPropagation();
    if (connectFrom===null)       { setConnectFrom(id); }
    else if (connectFrom===id)    { setConnectFrom(null); }
    else {
      const nc = [...effConns, {from:connectFrom, to:id}];
      setEditConns(nc); localStorage.setItem('olo-conns',JSON.stringify(nc)); setConnectFrom(null);
    }
  };
  const handleConnDelete = (i) => {
    const nc = effConns.filter((_,j)=>j!==i);
    setEditConns(nc); localStorage.setItem('olo-conns',JSON.stringify(nc));
  };
  const handleReset = () => {
    setNodeOverrides({}); setEditConns(null);
    localStorage.removeItem('olo-node-ov'); localStorage.removeItem('olo-conns');
  };
  const isHl = (id) => {
    if (!hoveredNode && !selectedNode) return false;
    const a = hoveredNode || selectedNode;
    if (a === id) return true;
    return effConns.some(c => (c.from === a && c.to === id) || (c.to === a && c.from === id));
  };
  const isConnHl = (c) => {
    const a = hoveredNode || selectedNode;
    return a && (c.from === a || c.to === a);
  };
  const sel = selectedNode ? effNodes[selectedNode] : null;

  // Bezier S-curve path
  const bezierPath = (c) => {
    const f=effNodes[c.from], t=effNodes[c.to];
    if(!f||!t) return "";
    const fx=f.x+f.w/2, fy=f.y+f.h/2, tx=t.x+t.w/2, ty=t.y+t.h/2;
    const dx=tx-fx, dy=ty-fy;
    let x1,y1,x2,y2;
    if(Math.abs(dx)>Math.abs(dy)){x1=dx>0?f.x+f.w:f.x;y1=fy;x2=dx>0?t.x:t.x+t.w;y2=ty;}
    else{x1=fx;y1=dy>0?f.y+f.h:f.y;x2=tx;y2=dy>0?t.y:t.y+t.h;}
    if(Math.abs(y1-y2)<3) return `M${x1},${y1}L${x2},${y2}`;
    if(Math.abs(x1-x2)<3) return `M${x1},${y1}L${x2},${y2}`;
    if(Math.abs(dx)>Math.abs(dy)){const mx=(x1+x2)/2;return `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`;}
    const my=(y1+y2)/2;return `M${x1},${y1} C${x1},${my} ${x2},${my} ${x2},${y2}`;
  };

  // Ruta ortogonal
  const orthoPath = (c) => {
    const f=effNodes[c.from], t=effNodes[c.to];
    if(!f||!t) return "";
    const r=10;
    const fx=f.x+f.w/2, fy=f.y+f.h/2, tx=t.x+t.w/2, ty=t.y+t.h/2;
    const dx=tx-fx, dy=ty-fy;
    let x1,y1,x2,y2;
    const horiz=Math.abs(dx)>=Math.abs(dy);
    if(horiz){ x1=dx>0?f.x+f.w:f.x; y1=fy; x2=dx>0?t.x:t.x+t.w; y2=ty; }
    else     { x1=fx; y1=dy>0?f.y+f.h:f.y; x2=tx; y2=dy>0?t.y:t.y+t.h; }
    if(Math.abs(y1-y2)<2) return `M${x1},${y1}L${x2},${y2}`;
    if(Math.abs(x1-x2)<2) return `M${x1},${y1}L${x2},${y2}`;
    if(horiz){
      const mx=(x1+x2)/2;
      const rr=Math.min(r,Math.abs(mx-x1)*0.45,Math.abs(y2-y1)*0.45,Math.abs(x2-mx)*0.45);
      if(rr<2) return `M${x1},${y1}H${mx}V${y2}H${x2}`;
      const sx=mx>x1?1:-1, sy=y2>y1?1:-1, sx2=x2>mx?1:-1;
      return `M${x1},${y1}H${mx-sx*rr}Q${mx},${y1} ${mx},${y1+sy*rr}V${y2-sy*rr}Q${mx},${y2} ${mx+sx2*rr},${y2}H${x2}`;
    } else {
      const my=(y1+y2)/2;
      const rr=Math.min(r,Math.abs(my-y1)*0.45,Math.abs(x2-x1)*0.45,Math.abs(y2-my)*0.45);
      if(rr<2) return `M${x1},${y1}V${my}H${x2}V${y2}`;
      const sy=my>y1?1:-1, sx=x2>x1?1:-1, sy2=y2>my?1:-1;
      return `M${x1},${y1}V${my-sy*rr}Q${x1},${my} ${x1+sx*rr},${my}H${x2-sx*rr}Q${x2},${my} ${x2},${my+sy2*rr}V${y2}`;
    }
  };

  const getPath = (c) => routeMode==='ortho' ? orthoPath(c) : bezierPath(c);

  // ── Tema visual (claro por defecto, oscuro opcional) — solo afecta color ──
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('olo-arch-theme') || 'light'; } catch { return 'light'; }
  });
  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    try { localStorage.setItem('olo-arch-theme', next); } catch {}
  };
  const dark = theme === 'dark';
  const T = {
    panelBg:        dark ? "#0f172a" : "#f8fafc",
    panelBorder:    dark ? "#1e293b" : "#e2e8f0",
    headerBorder:   dark ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.08)",
    headerLabel:    dark ? "rgba(255,255,255,0.3)"  : "rgba(15,23,42,0.42)",
    legendText:     dark ? "rgba(255,255,255,0.38)" : "rgba(15,23,42,0.52)",
    ctrlBg:         dark ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.05)",
    ctrlBorder:     dark ? "rgba(255,255,255,0.15)" : "rgba(15,23,42,0.15)",
    ctrlText:       dark ? "rgba(255,255,255,0.55)" : "rgba(15,23,42,0.6)",
    ctrlTextDim:    dark ? "rgba(255,255,255,0.35)" : "rgba(15,23,42,0.42)",
    routeBtnBg:     dark ? "rgba(255,255,255,0.05)" : "rgba(15,23,42,0.04)",
    routeBtnText:   dark ? "rgba(255,255,255,0.45)" : "rgba(15,23,42,0.5)",
    editBtnBg:      dark ? "rgba(255,255,255,0.1)"  : "rgba(15,23,42,0.06)",
    editBtnText:    dark ? "rgba(255,255,255,0.6)"  : "rgba(15,23,42,0.62)",
    editBarLabel:   dark ? "#fca5a5" : "#b91c1c",
    editBarAmber:   dark ? "#fbbf24" : "#b45309",
    editBarHint:    dark ? "rgba(255,255,255,0.5)" : "rgba(15,23,42,0.55)",
    svgBg:          dark ? "#0f172a" : "#f8fafc",
    dotFill:        dark ? "rgba(255,255,255,0.035)" : "rgba(15,23,42,0.065)",
    connDefault:    dark ? "rgba(148,163,184,0.42)" : "rgba(71,85,105,0.45)",
    connDashedDefault: dark ? "rgba(148,163,184,0.28)" : "rgba(71,85,105,0.28)",
    arrDefault:     dark ? "rgba(148,163,184,0.5)"  : "rgba(71,85,105,0.55)",
    arrDashed:      dark ? "rgba(148,163,184,0.3)"  : "rgba(71,85,105,0.32)",
    onpremLabel:    dark ? "#93c5fd" : "#1d4ed8",
    awsLabel:       dark ? "#fbbf24" : "#b45309",
    azureLabel:     dark ? "#93c5fd" : "#1d4ed8",
    middlewareLabel:dark ? "#fca5a5" : "#b91c1c",
    qaText:         dark ? "rgba(148,163,184,0.4)"  : "rgba(71,85,105,0.5)",
    viasText:       dark ? "rgba(148,163,184,0.55)" : "rgba(71,85,105,0.6)",
    viasBg:         dark ? "rgba(255,255,255,0.025)": "rgba(15,23,42,0.03)",
    viasBorder:     dark ? "rgba(148,163,184,0.2)"  : "rgba(71,85,105,0.25)",
    clientesText:   dark ? "rgba(148,163,184,0.32)" : "rgba(71,85,105,0.45)",
    clientesBg:     dark ? "rgba(148,163,184,0.03)" : "rgba(71,85,105,0.04)",
    clientesBorder: dark ? "rgba(148,163,184,0.14)" : "rgba(71,85,105,0.2)",
    nodeCardBg:     dark ? "rgba(15,23,42,0.85)"    : "rgba(255,255,255,0.92)",
    nodeCardBorder: dark ? "rgba(255,255,255,0.1)"  : "rgba(15,23,42,0.12)",
    nodeText:       dark ? "rgba(226,232,240,0.85)": "rgba(15,23,42,0.8)",
    nodeShadow:     dark ? "rgba(0,0,0,0.35)"       : "rgba(15,23,42,0.12)",
    nodeShadowOp:   dark ? 0.55 : 0.16,
    zoneLabelBg:    dark ? "rgba(15,23,42,0.85)"    : "rgba(255,255,255,0.92)",
    zoneCornerStroke: dark ? "rgba(15,23,42,0.6)"   : "rgba(255,255,255,0.7)",
  };

  return <div>
    {/* Panel de detalle */}
    {sel && <div style={{ background:"#fff", border:`1px solid ${(sel.color==="transparent"?"#888":sel.color)}33`, borderLeft:`4px solid ${sel.color==="transparent"?"#888":sel.color}`, borderRadius:10, padding:"14px 18px", marginBottom:14 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div style={{ flex:1 }}>
          <span style={{ fontSize:11, fontWeight:700, color:sel.color==="transparent"?"#888":sel.color, background:(sel.color==="transparent"?"#888":sel.color)+"15", border:`1px solid ${(sel.color==="transparent"?"#888":sel.color)}33`, padding:"3px 12px", borderRadius:6, fontFamily:"'JetBrains Mono',monospace", letterSpacing:"0.05em" }}>
            {sel.type==="zone"?"ZONA · ":""}{sel.label||sel.id}
          </span>
          <p style={{ fontSize:13, color:"#444", lineHeight:1.65, margin:"10px 0 0", whiteSpace:"pre-line", maxWidth:740 }}>{sel.desc}</p>
        </div>
        <button onClick={()=>setSelectedNode(null)} style={{ background:"none", border:"none", cursor:"pointer", color:"#888", fontSize:18, padding:4, marginLeft:12 }}>✕</button>
      </div>
    </div>}

    {/* Diagrama principal */}
    <div style={{ background:T.panelBg, borderRadius:14, overflow:"hidden", border:`1px solid ${T.panelBorder}`, boxShadow:"0 8px 40px rgba(0,0,0,0.3)" }}>
      {/* Header interno */}
      <div style={{ padding:"10px 18px", borderBottom:`1px solid ${T.headerBorder}`, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:10 }}>
        <span style={{ fontSize:9.5, color:T.headerLabel, fontWeight:700, letterSpacing:"0.14em" }}>ARQUITECTURA TO-BE · OLO ECOSYSTEM MAP</span>
        <div style={{ display:"flex", gap:16, alignItems:"center" }}>
          {[["#60a5fa","On-Premise"],["#fbbf24","AWS"],["#93c5fd","Azure"],["#f87171","Middleware"],["#94a3b8","Clientes"]].map(([c,l])=>(
            <div key={l} style={{ display:"flex", alignItems:"center", gap:5 }}>
              <span style={{ width:7, height:7, borderRadius:"50%", background:c, display:"inline-block", boxShadow:`0 0 6px ${c}88` }}/>
              <span style={{ fontSize:9.5, color:T.legendText, fontWeight:500 }}>{l}</span>
            </div>
          ))}
          {/* Zoom controls */}
          <div style={{ display:"flex", alignItems:"center", gap:3, background:T.ctrlBg, borderRadius:6, padding:"2px 6px" }}>
            <button onClick={()=>setZoomPan(Math.min(6,zoomRef.current*1.25),panRef.current)} style={{ background:"none",border:"none",color:T.ctrlText,cursor:"pointer",fontSize:14,lineHeight:1,padding:"1px 3px" }}>+</button>
            <span style={{ fontSize:9.5, color:T.ctrlTextDim, minWidth:32, textAlign:"center" }}>{Math.round(zoom*100)}%</span>
            <button onClick={()=>setZoomPan(Math.max(0.15,zoomRef.current/1.25),panRef.current)} style={{ background:"none",border:"none",color:T.ctrlText,cursor:"pointer",fontSize:14,lineHeight:1,padding:"1px 3px" }}>−</button>
            <button onClick={resetView} style={{ background:"none",border:"none",color:T.ctrlTextDim,cursor:"pointer",fontSize:10,lineHeight:1,padding:"1px 4px" }} title="Reset vista">⌂</button>
          </div>
          {/* Export */}
          <div style={{ display:"flex", gap:4 }}>
            <button onClick={()=>exportDiagram('svg')} style={{ fontSize:9.5, fontWeight:600, padding:"3px 9px", borderRadius:5, border:`1px solid ${T.ctrlBorder}`, background:T.ctrlBg, color:T.ctrlText, cursor:"pointer" }}>↓ SVG</button>
            <button onClick={()=>exportDiagram('png')} style={{ fontSize:9.5, fontWeight:600, padding:"3px 9px", borderRadius:5, border:`1px solid ${T.ctrlBorder}`, background:T.ctrlBg, color:T.ctrlText, cursor:"pointer" }}>↓ PNG</button>
          </div>
          <button
            onClick={()=>setRouteMode(m=>m==='bezier'?'ortho':'bezier')}
            style={{ fontSize:10, fontWeight:600, padding:"4px 10px", borderRadius:6, border:`1px solid ${T.ctrlBorder}`, cursor:"pointer",
              background:routeMode==='ortho'?"rgba(251,191,36,0.2)":T.routeBtnBg,
              color:routeMode==='ortho'?"#fbbf24":T.routeBtnText, letterSpacing:"0.05em" }}>
            {routeMode==='ortho'?"⌐ 90°":"∿ Curvas"}
          </button>
          <button
            onClick={toggleTheme}
            title="Cambiar tema"
            style={{ fontSize:10, fontWeight:600, padding:"4px 10px", borderRadius:6, border:`1px solid ${T.ctrlBorder}`, cursor:"pointer",
              background:T.ctrlBg, color:T.ctrlText, letterSpacing:"0.05em" }}>
            {dark ? "☾ Oscuro" : "☀ Claro"}
          </button>
          <button
            onClick={() => { setEditMode(m=>!m); setConnectFrom(null); setSelectedNode(null); }}
            style={{ fontSize:10, fontWeight:700, padding:"4px 12px", borderRadius:6, border:"none", cursor:"pointer",
              background:editMode?"#ef4444":T.editBtnBg, color:editMode?"#fff":T.editBtnText,
              letterSpacing:"0.06em" }}>
            {editMode ? "✓ LISTO" : "✏ EDITAR"}
          </button>
        </div>
      </div>
      {/* Barra de edición */}
      {editMode && (
        <div style={{ padding:"8px 18px", background:"rgba(239,68,68,0.12)", borderBottom:"1px solid rgba(239,68,68,0.3)", display:"flex", alignItems:"center", gap:16, flexWrap:"wrap" }}>
          <span style={{ fontSize:10, color:T.editBarLabel, fontWeight:700, letterSpacing:"0.06em" }}>MODO EDICIÓN</span>
          {connectFrom
            ? <span style={{ fontSize:10, color:T.editBarAmber }}>Conectando desde <b>{effNodes[connectFrom]?.label||connectFrom}</b> — haz click en el nodo destino · <span style={{cursor:"pointer",textDecoration:"underline"}} onClick={()=>setConnectFrom(null)}>Cancelar (Esc)</span></span>
            : <span style={{ fontSize:10, color:T.editBarHint }}>Arrastra nodos · Click en dos nodos para conectar · Click en una línea para eliminarla</span>
          }
          <div style={{ marginLeft:"auto", display:"flex", gap:8 }}>
            {(Object.keys(nodeOverrides).length>0 || editConns!==null) &&
              <button onClick={handleReset} style={{ fontSize:10, padding:"3px 10px", borderRadius:5, border:"1px solid rgba(239,68,68,0.5)", background:"transparent", color:T.editBarLabel, cursor:"pointer" }}>↺ Restaurar original</button>
            }
          </div>
        </div>
      )}

      <svg ref={svgRef} viewBox="0 0 1160 620" style={{ width:"100%", height:"auto", display:"block", fontFamily:"'Segoe UI',sans-serif", cursor:editMode?(connectFrom?"crosshair":"default"):"default" }}
        onMouseMove={e=>{ if(editMode&&connectFrom) setMousePos(svgPt(e)); }}
        onClick={()=>{ if(editMode&&connectFrom) setConnectFrom(null); }}>
        <defs>
          <filter id="ndrop" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="2" stdDeviation="5" floodColor="#000" floodOpacity={T.nodeShadowOp}/>
          </filter>
          <filter id="selglow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="6" result="b"/>
            <feFlood floodColor="#60a5fa" floodOpacity="0.55" result="col"/>
            <feComposite in="col" in2="b" operator="in" result="glow"/>
            <feMerge><feMergeNode in="glow"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <marker id="arrD"  viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M1 2L8 5L1 8" fill="none" stroke={T.arrDefault} strokeWidth="1.5" strokeLinecap="round"/></marker>
          <marker id="arrHL" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M1 2L8 5L1 8" fill="none" stroke="#60a5fa" strokeWidth="2"   strokeLinecap="round"/></marker>
          <marker id="arrDsh" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M1 2L8 5L1 8" fill="none" stroke={T.arrDashed} strokeWidth="1.5" strokeLinecap="round"/></marker>
        </defs>

        {/* Fondo con grid de puntos */}
        <rect width="1160" height="620" fill={T.svgBg}/>
        <pattern id="dotgrid" x="0" y="0" width="22" height="22" patternUnits="userSpaceOnUse">
          <circle cx="11" cy="11" r="0.7" fill={T.dotFill}/>
        </pattern>
        <rect width="1160" height="620" fill="url(#dotgrid)"/>

        {/* ── Grupo zoom/pan ── */}
        <g transform={`translate(${panXY.x},${panXY.y}) scale(${zoom})`}>
        {!editMode && <rect width="1160" height="620" fill="transparent"
          style={{cursor:'grab'}}
          onMouseDown={e=>{
            if(dragRef.current) return;
            const r=svgRef.current?.getBoundingClientRect(); if(!r) return;
            panDragRef.current={
              mx0:(e.clientX-r.left)*(1160/r.width),
              my0:(e.clientY-r.top)*(620/r.height),
              px0:panRef.current.x, py0:panRef.current.y
            };
          }}
        />}

        {/* ── ZONAS ── */}
        {(()=>{
          const opz=effNodes.onpremise_zone;
          const awz=effNodes.aws_zone;
          const viz=effNodes.vias_zone;
          const azz=effNodes.azure_zone;
          const clz=effNodes.clientes_zone;
          const mwz=effNodes.middleware_zone;
          return <>
            {/* On-Premise */}
            <rect x={opz.x} y={opz.y} width={opz.w} height={opz.h} rx="10" fill="rgba(59,130,246,0.08)" stroke="#3b82f6" strokeWidth="0.8" strokeOpacity="0.4"/>
            <rect x={opz.x} y={opz.y} width={opz.w} height={24} rx="10" fill="rgba(59,130,246,0.18)"/>
            <rect x={opz.x} y={opz.y+14} width={opz.w} height={10} fill="rgba(59,130,246,0.18)"/>
            <text x={opz.x+10} y={opz.y+16} fill={T.onpremLabel} fontSize="8.5" fontWeight="700" letterSpacing="0.12em">OLO · ON-PREMISE</text>
            <text x={opz.x+10} y={opz.y+30} fill={T.qaText} fontSize="7" fontFamily="'JetBrains Mono',monospace">qa: 10.17.224.226  ·  prod: 10.48.17.91</text>
            {/* AWS OLO */}
            <rect x={awz.x} y={awz.y} width={awz.w} height={awz.h} rx="10" fill="rgba(245,158,11,0.06)" stroke="#f59e0b" strokeWidth="0.8" strokeOpacity="0.4"/>
            <rect x={awz.x} y={awz.y} width={awz.w} height={24} rx="10" fill="rgba(245,158,11,0.14)"/>
            <rect x={awz.x} y={awz.y+14} width={awz.w} height={10} fill="rgba(245,158,11,0.14)"/>
            <text x={awz.x+12} y={awz.y+16} fill={T.awsLabel} fontSize="8.5" fontWeight="700" letterSpacing="0.12em">AWS OLO · SERVICIOS OLO</text>
            {/* Vías de Entradas sub-box */}
            <rect x={viz.x} y={viz.y} width={viz.w} height={viz.h} rx="7" fill={T.viasBg} stroke={T.viasBorder} strokeWidth="0.7"/>
            <text x={viz.x+viz.w/2} y={viz.y+14} textAnchor="middle" fill={T.viasText} fontSize="7" fontWeight="700" letterSpacing="0.08em">VÍAS DE</text>
            <text x={viz.x+viz.w/2} y={viz.y+24} textAnchor="middle" fill={T.viasText} fontSize="7" fontWeight="700" letterSpacing="0.08em">ENTRADAS</text>
            {/* Azure */}
            <rect x={azz.x} y={azz.y} width={azz.w} height={azz.h} rx="10" fill="rgba(96,165,250,0.08)" stroke="#60a5fa" strokeWidth="0.8" strokeOpacity="0.4"/>
            <rect x={azz.x} y={azz.y} width={azz.w} height={20} rx="10" fill="rgba(96,165,250,0.16)"/>
            <rect x={azz.x} y={azz.y+10} width={azz.w} height={10} fill="rgba(96,165,250,0.16)"/>
            <text x={azz.x+azz.w/2} y={azz.y+14} textAnchor="middle" fill={T.azureLabel} fontSize="7.5" fontWeight="700" letterSpacing="0.12em">AZURE</text>
            {/* Clientes / ERP */}
            <rect x={clz.x} y={clz.y} width={clz.w} height={clz.h} rx="10" fill={T.clientesBg} stroke={T.clientesBorder} strokeWidth="0.7" strokeDasharray="5 4"/>
            <text x={clz.x+10} y={clz.y+18} fill={T.clientesText} fontSize="8" fontWeight="600" letterSpacing="0.1em">CLIENTES / ERP</text>
            {/* Middleware */}
            <rect x={mwz.x} y={mwz.y} width={mwz.w} height={mwz.h} rx="10" fill="rgba(248,113,113,0.05)" stroke="#f87171" strokeWidth="0.7" strokeOpacity="0.4" strokeDasharray="5 4"/>
            <text x={mwz.x+14} y={mwz.y+16} fill={T.middlewareLabel} fontSize="8" fontWeight="700" letterSpacing="0.12em">CAPA DE INTEGRACIÓN · MIDDLEWARE</text>
          </>;
        })()}

        {/* ── CONEXIONES ── */}
        {effConns.map((c,i)=>{
          const f=effNodes[c.from],t=effNodes[c.to];
          if(!f||!t) return null;
          const hl=isConnHl(c), dim=(hoveredNode||selectedNode)&&!hl;
          const isHovConn = editMode && hovConn===i;
          const d=getPath(c);
          const lineColor = isHovConn?"#ef4444":hl?"#60a5fa":(c.dashed?(c.color??T.connDashedDefault):T.connDefault);
          return <g key={i}>
            <path d={d} fill="none"
              stroke={lineColor}
              strokeWidth={isHovConn?2.5:hl?2.2:c.color&&c.dashed?1.1:0.85}
              strokeDasharray={c.dashed?"5 3":"0"}
              strokeOpacity={dim?0.05:1}
              markerEnd={isHovConn?"url(#arrHL)":hl?"url(#arrHL)":c.dashed?"url(#arrDsh)":"url(#arrD)"}
              style={{ transition:"stroke-opacity 0.18s" }}
            />
            {editMode && <path d={d} fill="none" stroke="transparent" strokeWidth={14}
              style={{ cursor:"pointer" }}
              onMouseEnter={()=>setHovConn(i)}
              onMouseLeave={()=>setHovConn(null)}
              onClick={e=>{e.stopPropagation();handleConnDelete(i);}}
            />}
          </g>;
        })}
        {/* Línea de preview al conectar */}
        {editMode && connectFrom && effNodes[connectFrom] && (
          <line
            x1={effNodes[connectFrom].x+effNodes[connectFrom].w/2}
            y1={effNodes[connectFrom].y+effNodes[connectFrom].h/2}
            x2={mousePos.x} y2={mousePos.y}
            stroke="#60a5fa" strokeWidth="1.5" strokeDasharray="5 3"
            pointerEvents="none"
          />
        )}

        {/* ── ZONAS editables ── */}
        {editMode && Object.values(effNodes).filter(n=>n.type==="zone").map(n=>{
          const isConnSrc = connectFrom===n.id;
          const hl = isHl(n.id);
          const dim = (hoveredNode||selectedNode) && !hl && !isConnSrc;
          const col = isConnSrc?"#fbbf24":hl?"#60a5fa":(n.color||"rgba(255,255,255,0.3)");
          const labelW = Math.min((n.label?.length||0)*6+16, n.w-16);
          const HS = 8;
          const corners=[
            {h:'nw',x:n.x-HS/2,      y:n.y-HS/2,       cur:'nw-resize'},
            {h:'ne',x:n.x+n.w-HS/2,  y:n.y-HS/2,       cur:'ne-resize'},
            {h:'se',x:n.x+n.w-HS/2,  y:n.y+n.h-HS/2,   cur:'se-resize'},
            {h:'sw',x:n.x-HS/2,      y:n.y+n.h-HS/2,   cur:'sw-resize'},
          ];
          return <g key={`zone-${n.id}`} style={{opacity:dim?0.2:1}}>
            <rect x={n.x} y={n.y} width={n.w} height={n.h} rx="10"
              fill="none" stroke="transparent" strokeWidth={14}
              style={{cursor:"crosshair", pointerEvents:"stroke"}}
              onClick={e=>{e.stopPropagation();handleNodeClick(e,n.id);}}
              onMouseEnter={()=>setHoveredNode(n.id)}
              onMouseLeave={()=>setHoveredNode(null)}/>
            <rect x={n.x} y={n.y} width={n.w} height={n.h} rx="10"
              fill="none" stroke={col}
              strokeWidth={isConnSrc||hl?2.5:1.2} strokeDasharray="8 4"
              style={{pointerEvents:"none"}}/>
            <rect x={n.x+8} y={n.y+4} width={labelW} height={14} rx="3"
              fill={isConnSrc?"#fbbf24":hl?"#1D4ED8":T.zoneLabelBg}
              stroke={col} strokeWidth="0.8"
              style={{cursor:"move", pointerEvents:"all"}}
              onMouseDown={e=>{
                e.stopPropagation(); e.preventDefault();
                const pt=svgPt(e);
                dragRef.current={type:'zone-move',id:n.id,ox:n.x,oy:n.y,mx0:pt.x,my0:pt.y,moved:false};
              }}
              onClick={e=>e.stopPropagation()}/>
            <text x={n.x+14} y={n.y+13.8} fill={isConnSrc?"#1e293b":hl?"#fff":col}
              fontSize="6.5" fontWeight="700" letterSpacing="0.07em"
              style={{pointerEvents:"none", userSelect:"none"}}>{n.label}</text>
            {corners.map(({h,x,y,cur})=>(
              <rect key={h} x={x} y={y} width={HS} height={HS} rx="2"
                fill={col} stroke={T.zoneCornerStroke} strokeWidth="0.8"
                style={{cursor:cur, pointerEvents:"all"}}
                onMouseDown={e=>{
                  e.stopPropagation(); e.preventDefault();
                  const pt=svgPt(e);
                  dragRef.current={type:'zone-resize',id:n.id,handle:h,
                    ox:n.x,oy:n.y,ow:n.w,oh:n.h,mx0:pt.x,my0:pt.y,moved:false};
                }}
                onClick={e=>e.stopPropagation()}/>
            ))}
          </g>;
        })}

        {/* ── NODOS (cards oscuras) ── */}
        {Object.values(effNodes).filter(n=>n.type!=="zone").map(n=>{
          const hl=isHl(n.id), dim=(hoveredNode||selectedNode)&&!hl;
          const isSel=selectedNode===n.id, isHov=hoveredNode===n.id;
          const isConnSrc = connectFrom===n.id;
          const q = searchQuery.trim().toLowerCase();
          const matchSearch = !q || n.label?.toLowerCase().includes(q) || n.id?.toLowerCase().includes(q) || n.desc?.toLowerCase().includes(q);
          const searchDim = q && !matchSearch;
          return <g key={n.id}
            onClick={e=>handleNodeClick(e,n.id)}
            onMouseDown={e=>handleNodeDown(e,n.id)}
            onMouseEnter={()=>setHoveredNode(n.id)}
            onMouseLeave={()=>setHoveredNode(null)}
            style={{ cursor:editMode?(connectFrom?"crosshair":"grab"):"pointer", opacity:searchDim?0.08:dim?0.18:1, transition:"opacity 0.16s" }}
            filter={isSel||isConnSrc?"url(#selglow)":(matchSearch&&q)?"url(#selglow)":undefined}>
            <rect x={n.x} y={n.y+2} width={n.w} height={n.h} rx="7" fill={T.nodeShadow} filter="url(#ndrop)"/>
            <rect x={n.x} y={n.y} width={n.w} height={n.h} rx="7"
              fill={isSel?n.color+"30":T.nodeCardBg}
              stroke={isSel?n.color:isHov||hl?n.color+"cc":T.nodeCardBorder}
              strokeWidth={isSel?2:isHov||hl?1.5:0.7}/>
            <rect x={n.x+2} y={n.y+1} width={n.w-4} height={3} rx="5"
              fill={isSel||hl?n.color:n.color+"66"}/>
            <text x={n.x+n.w/2} y={n.y+n.h/2+3.5} textAnchor="middle"
              fill={isSel?n.color:hl?n.color:T.nodeText}
              fontSize={n.w>90?"8.5":"8"} fontWeight={isSel||hl?"700":"600"}
              fontFamily="'Segoe UI',sans-serif">{n.label}</text>
          </g>;
        })}
        </g>
      </svg>
    </div>

    {/* Cards de leyenda */}
    <div style={{ marginTop:14, display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:10 }}>
      {[
        { c:"#3b82f6", t:"BLOQUE 1-2 · On-Premise", b:"eflow_api → db Intermedia → db eFlow → ePrac. ePrac ↔ Softland bidireccional (Facturación de Servicios)." },
        { c:"#f59e0b", t:"BLOQUE 5-6 · AWS OLO",    b:"RagaNext → APIs/S3 → Colas → Persistencia → Repositorio → Monitor. Normalización → RDS OLO → Lago de Datos." },
        { c:"#ef4444", t:"BLOQUE 3-7 · Middleware",  b:"Terceros, Comercializadoras, Mayoreo, EPA → RagaNext → AWS. Notificación → RagaNext, API Dim, OLO API, Mecalux, Trade." },
        { c:"#60a5fa", t:"BLOQUE 8-10 · Azure/Retorno", b:"OLO API ↔ SRO, APOLLO, Última Milla, Liquidador (Azure). RagaNext retorna datos a EPA, Mayoreo, Terceros." },
      ].map(({c,t,b})=>(
        <div key={t} style={{ background:c+"0a", border:`1px solid ${c}33`, borderLeft:`3px solid ${c}`, borderRadius:8, padding:"10px 14px" }}>
          <div style={{ fontSize:10, fontWeight:700, color:c, textTransform:"uppercase", marginBottom:5, letterSpacing:"0.05em" }}>{t}</div>
          <div style={{ fontSize:11, color:"#555", lineHeight:1.55 }}>{b}</div>
        </div>
      ))}
    </div>

    {/* Clusters detallados */}
    <div style={{ marginTop:20 }}>
      <div style={{ fontSize:12, fontWeight:700, color:"#444", letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:12 }}>Clusters del ecosistema</div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:10, marginBottom:10 }}>
        <ClusterCard color="#185FA5" bg="#EBF3FB" title="eFlow · CR y VE" desc="Plataforma de operación logística activa en Costa Rica y Venezuela. Solo estos dos países están en scope.">
          <ClusterTag label="CR" color="#185FA5"/>
          <ClusterTag label="VE" color="#185FA5"/>
        </ClusterCard>
        <ClusterCard color="#6B7280" bg="#F8F9FA" title="Intermedia Lago de Datos" desc="Capa de integración central. Consolida datos del ERP y los distribuye hacia Power BI y la Suite OLO.">
          <ClusterTag label="Power BI" color="#D97706"/>
          <ClusterTag label="Suite OLO" color="#185FA5"/>
          <ClusterTag label="Multi cliente" color="#6B7280"/>
        </ClusterCard>
        <ClusterCard color="#185FA5" bg="#EBF3FB" title="Suite OLO · Integración de Data" desc="Módulos de integración de datos expuestos vía OLO API.">
          <ClusterTag label="GoRamp" color="#059669"/>
          <ClusterTag label="Trade · eTrade" color="#d35400"/>
          <ClusterTag label="Liq. de Viajes" color="#185FA5"/>
          <ClusterTag label="RFID" color="#555"/>
          <ClusterTag label="Next Raga Orders" color="#7B1FA2"/>
          <ClusterTag label="RAGA.x" color="#7B1FA2"/>
          <ClusterTag label="Pricing" color="#185FA5"/>
          <ClusterTag label="OLO API" color="#059669" outline/>
        </ClusterCard>
        <ClusterCard color="#5B21B6" bg="#F3E8FD" title="Interfaces de Sistema" desc="Interfaces directas con el core de negocio de OLO, gestionadas vía ePRAC.">
          <ClusterTag label="CCA" color="#5B21B6"/>
          <ClusterTag label="Facturación de Servicios" color="#5B21B6"/>
          <ClusterTag label="MPF" color="#5B21B6"/>
          <ClusterTag label="ePRAC (×2)" color="#D97706"/>
        </ClusterCard>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:10 }}>
        <ClusterCard color="#D97706" bg="#FEF3C7" title="Integraciones Internas" desc="Integraciones propias del ecosistema OLO con sistemas físicos y de tiempo.">
          <ClusterTag label="Mecalux" color="#D97706"/>
          <ClusterTag label="Sistemas de Tiempo" color="#D97706"/>
        </ClusterCard>
        <ClusterCard color="#7B1FA2" bg="#EDE9FE" title="Middleware" desc="Capa de orquestación central. Conecta Suite OLO con clientes, integraciones internas y sistemas del Estado.">
          <ClusterTag label="Suite OLO → clientes" color="#7B1FA2"/>
          <ClusterTag label="Comerc. Compiere" color="#7B1FA2"/>
          <ClusterTag label="Integ. Internas" color="#D97706"/>
          <ClusterTag label="Sistemas del Estado" color="#94A3B8"/>
        </ClusterCard>
        <ClusterCard color="#6B7280" bg="#F8F9FA" title="Intermedia Multi cliente" desc="Segmentos de clientes conectados a través de la capa Intermedia.">
          <ClusterTag label="Mayoreo · Cofersa" color="#78350F"/>
          <ClusterTag label="Mayoreo · Febeca" color="#78350F"/>
          <ClusterTag label="Mayoreo · Siliaca" color="#78350F"/>
          <ClusterTag label="EPA CR" color="#065F46"/>
          <ClusterTag label="EPA VE" color="#065F46"/>
          <ClusterTag label="Comerc. Compiere" color="#6B7280"/>
          <ClusterTag label="Comerc. OLO System" color="#6B7280"/>
          <ClusterTag label="Otros Clientes" color="#6B7280"/>
        </ClusterCard>
        <ClusterCard color="#94A3B8" bg="#F1F5F9" title="Sistemas del Estado" desc="Sistemas regulatorios y aduaneros del Estado con los que interactúa el ecosistema OLO.">
          <ClusterTag label="Delzof" color="#475569"/>
          <ClusterTag label="TICA" color="#475569"/>
        </ClusterCard>
      </div>
    </div>
  </div>;
}
