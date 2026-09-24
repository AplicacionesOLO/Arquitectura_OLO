@echo off
rem Registra en el Programador de tareas de Windows la corrida del monitoreo:
rem de lunes a viernes a las 7:00, solo con la sesión del usuario iniciada
rem (usa su red/VPN y su sesión de Claude Code). Para quitarla:
rem   schtasks /Delete /TN "BPA OLO - Monitoreo de bases" /F
schtasks /Create /TN "BPA OLO - Monitoreo de bases" /TR "\"%~dp0tarea.cmd\"" /SC WEEKLY /D MON,TUE,WED,THU,FRI /ST 07:00 /F
