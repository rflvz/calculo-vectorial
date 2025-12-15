@echo off
REM Script simple para iniciar la aplicacion
cd /d "%~dp0"
start http://localhost:8000
npx --yes http-server -p 8000 -o -c-1

