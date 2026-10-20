-- ═════════════════════════════════════════════════════════════════════════
-- Asesor por voz: job «asesor_voz» en Monitor. No lo corre el despachador:
-- cada conversación de voz (navegador ↔ OpenAI Realtime) se registra como una
-- corrida en bpa_job_runs con su duración, tokens y costo, y la función
-- asesor-voz no abre conversaciones nuevas al llegar al tope mensual.
-- config: modelo, voz, transcripción, tope, minutos máximos y precios (editables).
-- ═════════════════════════════════════════════════════════════════════════
insert into public.bpa_jobs (id, nombre, descripcion, tipo, motor, ubicacion, config, limitaciones, orden)
values ('asesor_voz', 'Asesor por voz',
  'Conversación de voz en tiempo real con el Asesor de cambios (Asesor › Consultar › Hablar). El agente de voz contesta lo puntual con la base de conocimiento y delega los análisis al asesor de siempre; cada conversación queda aquí con su duración y su costo.',
  'Bajo demanda · navegador', 'OpenAI Realtime (gpt-realtime) + transcripción',
  '{"ruta":"supabase/functions/asesor-voz","equipo":"Supabase Edge Functions + navegador del usuario","comando":"Botón «Hablar con el asesor» en Asesor › Consultar"}'::jsonb,
  '{"activo":true,"modelo":"gpt-realtime","voz":"cedar","transcripcion":"gpt-4o-mini-transcribe","limite_mensual_usd":20,"max_minutos":20,"precios_usd_millon":{"audio_entrada":32,"audio_entrada_cache":0.4,"texto_entrada":4,"texto_entrada_cache":0.4,"audio_salida":64,"texto_salida":16,"transcripcion_entrada":3,"transcripcion_salida":5}}'::jsonb,
  to_jsonb(array['Solo administradores, con micrófono y en HTTPS (el BPA publicado o localhost).',
        'El costo lo calcula el BPA con los tokens que informa OpenAI y los precios de esta configuración: verifícalos contra la lista de precios de OpenAI si cambian.',
        'Las consultas que el agente de voz le pasa al asesor (análisis completo) se cobran aparte, como cualquier consulta escrita del asesor.',
        'Una conversación se corta sola a los minutos máximos configurados, y no se abren nuevas al llegar al tope mensual.']),
  5)
on conflict (id) do nothing;
