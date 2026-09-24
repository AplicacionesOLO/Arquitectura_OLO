# schema_watch — monitoreo de las bases de datos del BPA

Revisa periódicamente las bases SQL Server de eFlow, Torre de Control, eIntegra y
Softland (las 6 instancias de `db_config.js`) y le dice al BPA qué cambió.

## Qué hace cada corrida (`node schema_watch/run.js`)

1. **Instantánea** (`snapshot.js`): lee solo metadatos (`sys.*`) de todas las bases
   de usuario. Guarda esquemas, tablas, columnas (tipo y nulos), PK, FK,
   procedimientos, vistas, funciones y triggers (con su fecha de modificación) y
   cuántas filas tiene cada tabla. También guarda el estado de cada base y si el
   usuario de integración tiene permiso. Así el informe no confunde «sin permiso»
   con «borrado». Destino: `snapshots/AAAA-MM-DD-HH-MM.json.gz`, conservando las
   últimas 30.
2. **Comparación** (`diff.js`):
   - Contra el BPA: tablas o columnas que el BPA usa y ya no existen, tablas
     nuevas, bases sin mapear y esquemas que no se pueden verificar.
   - Contra la instantánea anterior: tablas, columnas, tipos, PK y FK agregadas o
     borradas; objetos nuevos, modificados o borrados; tablas que empezaron a
     tener datos.

   El informe queda en `reports/` (en `.md` y `.json`).
3. **Análisis con Claude** (solo si hubo cambios): Claude Code (`claude -p`, Opus
   5.5) lee el informe y los datos del BPA y escribe en español qué cambió, a qué
   procesos afecta y qué habría que actualizar. Corre en **solo lectura**
   (`Read`, `Grep`, `Glob`) y no modifica nada. El prompt está en
   `analizar_prompt.md`.
4. **Publicación** (`publicar.js`): se sube a Supabase (`bpa_schema_cambios`) y el
   BPA lo muestra en **Contexto › Cambios en bases**.

Opciones de `run.js`:

- `--sin-claude`: salta el análisis.
- `--analizar`: fuerza el análisis aunque no haya cambios.
- `--sin-publicar`: no sube nada.

## Tarea programada

`instalar_tarea.cmd` la registra en el Programador de tareas de Windows con el
nombre «BPA OLO - Monitoreo de bases». Corre de lunes a viernes a las 7:00 y solo
con la sesión del usuario iniciada. Log en `reports/job.log`.

- Debe correr en un equipo **dentro de la red de OLO o con VPN**: las bases usan IPs
  privadas. Por eso no sirve una rutina en la nube.
- Para cambiar el horario, edita `instalar_tarea.cmd` y vuelve a ejecutarlo.
- Para quitarla: `schtasks /Delete /TN "BPA OLO - Monitoreo de bases" /F`.

## Seguridad

- Las credenciales salen de `../.env`, por medio de `db_config.js` y `publicar.js`.
  Nunca se escriben en los informes.
- `snapshots/` y `reports/` no se versionan (están en `.gitignore`).
- El usuario de integración solo necesita permiso de lectura de metadatos
  (VIEW DEFINITION).
