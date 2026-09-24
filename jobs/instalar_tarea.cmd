@echo off
rem Registra el despachador de jobs del BPA en el Programador de tareas de Windows:
rem cada 15 minutos, solo con la sesion del usuario iniciada (usa su red/VPN y su
rem sesion de Claude Code). La frecuencia de CADA job se edita en el BPA:
rem Monitor > Jobs. Reemplaza la tarea anterior del monitoreo de bases.
rem Para quitarla:  schtasks /Delete /TN "BPA OLO - Despachador de jobs" /F
schtasks /Delete /TN "BPA OLO - Monitoreo de bases" /F >nul 2>&1
schtasks /Create /TN "BPA OLO - Despachador de jobs" /TR "\"%~dp0tarea.cmd\"" /SC MINUTE /MO 15 /F
