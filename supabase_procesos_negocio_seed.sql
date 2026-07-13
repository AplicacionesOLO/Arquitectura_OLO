-- ═══════════════════════════════════════════════════════════════════════════
-- OLO Architecture Map — Procesos: 14 nuevos silos "Negocio · Misionales"
-- (P1.9–P1.22), tomados tal cual del "Informe Final Diagnóstico de Procesos
-- OLO" (Cámara de Industrias de Costa Rica, diciembre 2024) — la misma
-- fuente ya citada en BPAView.jsx (30 procesos: 4 Estratégicos, 7 Apoyo,
-- 5 Control/Evaluación/Mejora, 14 Negocio/Misionales).
--
-- Se agregan como silos NUEVOS e independientes de los ya existentes
-- (Inbound, Outbound, CrossDocking, No Nacionalizado, Comercio,
-- Administrativo, P1.1–P1.8 Operación Logística) — sin eliminar ni
-- modificar nada existente. El usuario confirmó que la posible
-- superposición conceptual con P1.1–P1.8 (ej. "Gestión de transporte
-- Local" vs. "P1.4 · Transporte") es aceptable y no debe evitarse.
--
-- El Informe no desglosa estos 14 procesos en subprocesos (a diferencia del
-- modelo B2R de Mayoreo usado para P1.1–P1.8). Los 8 subprocesos por silo
-- que se agregan aquí SÍ son un borrador propio (no vienen del documento
-- fuente), redactados en base a práctica estándar de operación 3PL / zona
-- franca para cada proceso — mismo criterio de "borrador inicial editable"
-- ya usado y aprobado para P1.1–P1.8. El equipo de OLO puede ajustarlos
-- libremente desde la propia aplicación.
--
-- Idempotente vía "on conflict do nothing". Run en Supabase Dashboard →
-- SQL Editor → New query → Run. Safe to commit: solo datos de procesos.
-- ═══════════════════════════════════════════════════════════════════════════

insert into public.procesos_categorias (id, num, label, color) values
  ('neg_aduaneros',            15, 'P1.9 · Administración de procesos Aduaneros',            '#00838f'),
  ('neg_fin_contable',         16, 'P1.10 · Administración financiera contable a clientes',  '#7f8c8d'),
  ('neg_cobro',                17, 'P1.11 · Cobro',                                          '#c0392b'),
  ('neg_facturacion',          18, 'P1.12 · Facturación',                                    '#16a085'),
  ('neg_almacenamiento',       19, 'P1.13 · Gestión de Almacenamiento (zona franca-nacional)','#f39c12'),
  ('neg_comercializacion',     20, 'P1.14 · Gestión de comercialización',                    '#5B21B6'),
  ('neg_internamiento_szf',    21, 'P1.15 · Gestión de Internamiento Zona Franca SEL',        '#2980b9'),
  ('neg_relacion_clientes',    22, 'P1.16 · Gestión de relación con clientes',               '#27ae60'),
  ('neg_transporte_intl',      23, 'P1.17 · Gestión de transporte Internacional',            '#8e44ad'),
  ('neg_transporte_local',     24, 'P1.18 · Gestión de transporte Local',                    '#d35400'),
  ('neg_seguimiento_operacion',25, 'P1.19 · Seguimiento y control de la Operación',          '#00838f'),
  ('neg_talento_cliente',      26, 'P1.20 · Servicio de Gestión de talento al cliente',      '#7f8c8d'),
  ('neg_valor_agregado',       27, 'P1.21 · Servicios de Valor Agregado',                    '#c0392b'),
  ('neg_requerimientos',       28, 'P1.22 · Toma de requerimientos',                         '#16a085')
on conflict (id) do nothing;

insert into public.procesos_nodes (categoria_id, parent_id, level, name, sort_order) values
  -- P1.9 · Administración de procesos Aduaneros
  ('neg_aduaneros', null, 0, 'S1 · Clasificación arancelaria', 0),
  ('neg_aduaneros', null, 0, 'S2 · Declaración aduanera de importación/exportación', 1),
  ('neg_aduaneros', null, 0, 'S3 · Gestión de permisos y licencias de importación', 2),
  ('neg_aduaneros', null, 0, 'S4 · Control de regímenes especiales (perfeccionamiento, tránsito)', 3),
  ('neg_aduaneros', null, 0, 'S5 · Liquidación de tributos aduaneros', 4),
  ('neg_aduaneros', null, 0, 'S6 · Gestión de agentes aduaneros', 5),
  ('neg_aduaneros', null, 0, 'S7 · Auditoría y control posterior aduanero', 6),
  ('neg_aduaneros', null, 0, 'S8 · Actualización normativa aduanera', 7),
  -- P1.10 · Administración financiera contable a clientes
  ('neg_fin_contable', null, 0, 'S1 · Registro contable de operaciones por cliente', 0),
  ('neg_fin_contable', null, 0, 'S2 · Conciliación de cuentas por cliente', 1),
  ('neg_fin_contable', null, 0, 'S3 · Gestión de anticipos y depósitos de clientes', 2),
  ('neg_fin_contable', null, 0, 'S4 · Reportes financieros a clientes', 3),
  ('neg_fin_contable', null, 0, 'S5 · Control de costos asignados por cliente', 4),
  ('neg_fin_contable', null, 0, 'S6 · Cierre contable mensual por cliente', 5),
  ('neg_fin_contable', null, 0, 'S7 · Gestión de ajustes y notas de crédito/débito', 6),
  ('neg_fin_contable', null, 0, 'S8 · Auditoría de cuentas de clientes', 7),
  -- P1.11 · Cobro
  ('neg_cobro', null, 0, 'S1 · Emisión de recordatorios de pago', 0),
  ('neg_cobro', null, 0, 'S2 · Gestión de cartera vencida', 1),
  ('neg_cobro', null, 0, 'S3 · Negociación de planes de pago', 2),
  ('neg_cobro', null, 0, 'S4 · Aplicación de pagos recibidos', 3),
  ('neg_cobro', null, 0, 'S5 · Gestión de garantías y pólizas de cumplimiento', 4),
  ('neg_cobro', null, 0, 'S6 · Escalamiento a cobro judicial', 5),
  ('neg_cobro', null, 0, 'S7 · Reportes de antigüedad de saldos', 6),
  ('neg_cobro', null, 0, 'S8 · Conciliación de cobros con facturación', 7),
  -- P1.12 · Facturación
  ('neg_facturacion', null, 0, 'S1 · Generación de la factura electrónica', 0),
  ('neg_facturacion', null, 0, 'S2 · Validación de tarifas y servicios facturables', 1),
  ('neg_facturacion', null, 0, 'S3 · Consolidación de cargos por cliente', 2),
  ('neg_facturacion', null, 0, 'S4 · Envío y notificación de facturas', 3),
  ('neg_facturacion', null, 0, 'S5 · Gestión de reclamos de facturación', 4),
  ('neg_facturacion', null, 0, 'S6 · Corrección y refacturación', 5),
  ('neg_facturacion', null, 0, 'S7 · Control de facturación pendiente', 6),
  ('neg_facturacion', null, 0, 'S8 · Reportes de facturación por servicio', 7),
  -- P1.13 · Gestión de Almacenamiento (zona franca-nacional)
  ('neg_almacenamiento', null, 0, 'S1 · Recepción y clasificación de mercancía', 0),
  ('neg_almacenamiento', null, 0, 'S2 · Asignación de espacio zona franca vs. nacional', 1),
  ('neg_almacenamiento', null, 0, 'S3 · Control de inventario por régimen', 2),
  ('neg_almacenamiento', null, 0, 'S4 · Custodia y condiciones de almacenaje', 3),
  ('neg_almacenamiento', null, 0, 'S5 · Traslados entre régimen zona franca y nacional', 4),
  ('neg_almacenamiento', null, 0, 'S6 · Gestión de mermas y ajustes de inventario', 5),
  ('neg_almacenamiento', null, 0, 'S7 · Reportes de ocupación y capacidad', 6),
  ('neg_almacenamiento', null, 0, 'S8 · Auditorías de inventario por régimen', 7),
  -- P1.14 · Gestión de comercialización
  ('neg_comercializacion', null, 0, 'S1 · Prospección de nuevos clientes', 0),
  ('neg_comercializacion', null, 0, 'S2 · Elaboración de propuestas comerciales', 1),
  ('neg_comercializacion', null, 0, 'S3 · Negociación de tarifas y contratos', 2),
  ('neg_comercializacion', null, 0, 'S4 · Onboarding comercial de nuevos clientes', 3),
  ('neg_comercializacion', null, 0, 'S5 · Gestión de renovaciones contractuales', 4),
  ('neg_comercializacion', null, 0, 'S6 · Análisis de mercado y competencia', 5),
  ('neg_comercializacion', null, 0, 'S7 · Gestión de la cartera comercial activa', 6),
  ('neg_comercializacion', null, 0, 'S8 · Reportes de ventas y cumplimiento de metas', 7),
  -- P1.15 · Gestión de Internamiento Zona Franca SEL
  ('neg_internamiento_szf', null, 0, 'S1 · Solicitud de internamiento ante autoridad SEL', 0),
  ('neg_internamiento_szf', null, 0, 'S2 · Verificación documental de internamiento', 1),
  ('neg_internamiento_szf', null, 0, 'S3 · Registro de movimientos en el sistema SEL', 2),
  ('neg_internamiento_szf', null, 0, 'S4 · Control de plazos de permanencia en régimen', 3),
  ('neg_internamiento_szf', null, 0, 'S5 · Gestión de salidas y desinternamientos', 4),
  ('neg_internamiento_szf', null, 0, 'S6 · Coordinación con Zona Franca / Hacienda', 5),
  ('neg_internamiento_szf', null, 0, 'S7 · Reportes de cumplimiento normativo SEL', 6),
  ('neg_internamiento_szf', null, 0, 'S8 · Auditoría de operaciones bajo régimen SEL', 7),
  -- P1.16 · Gestión de relación con clientes
  ('neg_relacion_clientes', null, 0, 'S1 · Onboarding operativo de nuevos clientes', 0),
  ('neg_relacion_clientes', null, 0, 'S2 · Gestión de acuerdos de nivel de servicio (SLA)', 1),
  ('neg_relacion_clientes', null, 0, 'S3 · Comités y reuniones periódicas con el cliente', 2),
  ('neg_relacion_clientes', null, 0, 'S4 · Gestión de solicitudes y requerimientos especiales', 3),
  ('neg_relacion_clientes', null, 0, 'S5 · Medición de satisfacción del cliente', 4),
  ('neg_relacion_clientes', null, 0, 'S6 · Gestión de reclamos y no conformidades', 5),
  ('neg_relacion_clientes', null, 0, 'S7 · Seguimiento de indicadores por cliente', 6),
  ('neg_relacion_clientes', null, 0, 'S8 · Fidelización y retención de clientes', 7),
  -- P1.17 · Gestión de transporte Internacional
  ('neg_transporte_intl', null, 0, 'S1 · Coordinación de embarques internacionales', 0),
  ('neg_transporte_intl', null, 0, 'S2 · Selección de transportista/naviera/aerolínea', 1),
  ('neg_transporte_intl', null, 0, 'S3 · Gestión documental de exportación/importación', 2),
  ('neg_transporte_intl', null, 0, 'S4 · Seguimiento de tránsito internacional (tracking)', 3),
  ('neg_transporte_intl', null, 0, 'S5 · Gestión de incidencias en ruta internacional', 4),
  ('neg_transporte_intl', null, 0, 'S6 · Control de tiempos de tránsito y aduana', 5),
  ('neg_transporte_intl', null, 0, 'S7 · Liquidación de fletes internacionales', 6),
  ('neg_transporte_intl', null, 0, 'S8 · Reportes de desempeño de transporte internacional', 7),
  -- P1.18 · Gestión de transporte Local
  ('neg_transporte_local', null, 0, 'S1 · Planificación de rutas de distribución local', 0),
  ('neg_transporte_local', null, 0, 'S2 · Asignación de unidades y conductores', 1),
  ('neg_transporte_local', null, 0, 'S3 · Despacho y control de salida de rutas', 2),
  ('neg_transporte_local', null, 0, 'S4 · Seguimiento de entregas en tiempo real', 3),
  ('neg_transporte_local', null, 0, 'S5 · Gestión de novedades y devoluciones', 4),
  ('neg_transporte_local', null, 0, 'S6 · Prueba de entrega y cierre de ruta', 5),
  ('neg_transporte_local', null, 0, 'S7 · Liquidación de rutas y combustible', 6),
  ('neg_transporte_local', null, 0, 'S8 · Reportes de cumplimiento de entregas (OTIF)', 7),
  -- P1.19 · Seguimiento y control de la Operación
  ('neg_seguimiento_operacion', null, 0, 'S1 · Monitoreo de indicadores operativos diarios', 0),
  ('neg_seguimiento_operacion', null, 0, 'S2 · Control de cumplimiento de SLA por cliente', 1),
  ('neg_seguimiento_operacion', null, 0, 'S3 · Gestión de incidencias operativas', 2),
  ('neg_seguimiento_operacion', null, 0, 'S4 · Reuniones de control operativo', 3),
  ('neg_seguimiento_operacion', null, 0, 'S5 · Semáforos y tableros de control', 4),
  ('neg_seguimiento_operacion', null, 0, 'S6 · Escalamiento de desviaciones operativas', 5),
  ('neg_seguimiento_operacion', null, 0, 'S7 · Planes de acción correctiva', 6),
  ('neg_seguimiento_operacion', null, 0, 'S8 · Reportes gerenciales de operación', 7),
  -- P1.20 · Servicio de Gestión de talento al cliente
  ('neg_talento_cliente', null, 0, 'S1 · Reclutamiento de personal dedicado a cuentas', 0),
  ('neg_talento_cliente', null, 0, 'S2 · Inducción y capacitación operativa', 1),
  ('neg_talento_cliente', null, 0, 'S3 · Asignación y dimensionamiento de personal', 2),
  ('neg_talento_cliente', null, 0, 'S4 · Evaluación de desempeño del personal en cuenta', 3),
  ('neg_talento_cliente', null, 0, 'S5 · Gestión de rotación y reemplazos', 4),
  ('neg_talento_cliente', null, 0, 'S6 · Cumplimiento normativo laboral en sitio', 5),
  ('neg_talento_cliente', null, 0, 'S7 · Gestión de clima laboral en cuenta', 6),
  ('neg_talento_cliente', null, 0, 'S8 · Reportes de dotación de personal', 7),
  -- P1.21 · Servicios de Valor Agregado
  ('neg_valor_agregado', null, 0, 'S1 · Levantamiento de requerimientos de VAS', 0),
  ('neg_valor_agregado', null, 0, 'S2 · Etiquetado y reempaque', 1),
  ('neg_valor_agregado', null, 0, 'S3 · Kitting y ensamble', 2),
  ('neg_valor_agregado', null, 0, 'S4 · Control de calidad de VAS', 3),
  ('neg_valor_agregado', null, 0, 'S5 · Personalización y co-packing', 4),
  ('neg_valor_agregado', null, 0, 'S6 · Gestión de materiales para VAS', 5),
  ('neg_valor_agregado', null, 0, 'S7 · Facturación de servicios de valor agregado', 6),
  ('neg_valor_agregado', null, 0, 'S8 · Reportes de productividad de VAS', 7),
  -- P1.22 · Toma de requerimientos
  ('neg_requerimientos', null, 0, 'S1 · Recepción de solicitudes del cliente', 0),
  ('neg_requerimientos', null, 0, 'S2 · Validación de factibilidad operativa', 1),
  ('neg_requerimientos', null, 0, 'S3 · Cotización del requerimiento', 2),
  ('neg_requerimientos', null, 0, 'S4 · Aprobación y formalización con el cliente', 3),
  ('neg_requerimientos', null, 0, 'S5 · Planificación de la ejecución', 4),
  ('neg_requerimientos', null, 0, 'S6 · Comunicación y coordinación interna', 5),
  ('neg_requerimientos', null, 0, 'S7 · Seguimiento hasta el cierre del requerimiento', 6),
  ('neg_requerimientos', null, 0, 'S8 · Retroalimentación y lecciones aprendidas', 7)
on conflict do nothing;
