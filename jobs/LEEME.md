# jobs — despachador de los jobs automáticos del BPA

`despachador.js` lo ejecuta el Programador de tareas de Windows cada 15 minutos,
con la tarea «BPA OLO - Despachador de jobs» (se instala con `instalar_tarea.cmd`).
En cada revisión hace esto:

1. Lee los jobs y su configuración desde Supabase (`bpa_jobs`). Se editan en el BPA,
   en **Monitor › Jobs**, y solo el rol admin puede cambiarlos.
2. Corre los que tocan según su frecuencia (`olo-architecture/src/lib/frecuencia.js`)
   o los pedidos con «Ejecutar ahora». Nunca corre dos a la vez, gracias al archivo
   `.lock`.
3. Respeta el tope de gasto mensual de cada job: al alcanzarlo, el job corre sin la
   parte de IA.
4. Registra la corrida en `bpa_job_runs`: inicio, fin, duración, estado, modelo,
   costo y tokens. El costo lo informa Claude Code en su salida JSON.
5. Deja un latido (`ultima_revision`) para que el BPA muestre si el despachador
   está vivo.

## Jobs actuales

| Job | Qué hace | IA |
|---|---|---|
| `schema_watch` | Monitorea las bases SQL Server contra el BPA (Monitor › Cambios en bases) | Claude, solo si hay cambios |
| `softland_dd` | Compara el diccionario de Softland (menú, acciones, tablas) y actualiza `softland_dd.json` si cambió | No |

## Agregar un job nuevo

1. Agrega su fila en `bpa_jobs`, igual que en `olo-architecture/supabase_jobs.sql`.
2. Agrega su comando en `JOBS` dentro de `despachador.js`.
3. Si el job usa IA, debe imprimir al final una línea
   `RESULTADO_JOB {"modelo":…,"costo_usd":…,"tokens_entrada":…,"tokens_salida":…,"mensaje":…}`.

## Limitaciones

- Solo corre con el equipo encendido, la sesión iniciada y acceso a la red de OLO.
- Los jobs pueden llegar hasta 15 minutos tarde.
- Si el equipo estuvo apagado, al volver cada job corre una sola vez, aunque haya
  perdido varias corridas.
- Log en `despachador.log`; el lock y el log no se versionan.
