@echo off
rem Corrida programada del monitoreo de bases (la registra instalar_tarea.cmd).
rem Necesita estar en la red de OLO (o VPN): las bases SQL Server son privadas.
cd /d "%~dp0.."
node schema_watch\run.js >> schema_watch\reports\tarea.log 2>&1
