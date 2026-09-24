@echo off
rem Lo ejecuta el Programador de tareas cada 15 minutos (ver instalar_tarea.cmd).
cd /d "%~dp0.."
node jobs\despachador.js >nul 2>&1
