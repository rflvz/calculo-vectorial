@echo off
chcp 65001 >nul
title Aplicacion de Calculo Vectorial
color 0A

echo.
echo ╔══════════════════════════════════════════════════════════╗
echo ║   Aplicacion de Calculo Vectorial                      ║
echo ║   Producto Escalar y Similitud Coseno                  ║
echo ╚══════════════════════════════════════════════════════════╝
echo.
echo Iniciando servidor local...
echo.

REM Cambiar al directorio del script
cd /d "%~dp0"

REM Verificar si Node.js esta instalado (prioridad 1)
node --version >nul 2>&1
if %errorlevel% == 0 (
    echo [✓] Node.js detectado
    echo [→] Iniciando servidor con Node.js...
    echo.
    echo La aplicacion se abrira automaticamente en tu navegador.
    echo Presiona Ctrl+C para detener el servidor.
    echo.
    timeout /t 1 /nobreak >nul
    npx --yes http-server -p 8000 -o -c-1
    goto :end
)

REM Verificar si Python esta instalado (prioridad 2)
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo [✓] Python detectado
    echo [→] Iniciando servidor con Python...
    echo.
    echo La aplicacion se abrira automaticamente en tu navegador.
    echo Presiona Ctrl+C para detener el servidor.
    echo.
    start http://localhost:8000
    timeout /t 2 /nobreak >nul
    python -m http.server 8000
    goto :end
)

REM Verificar si PHP esta instalado (prioridad 3)
php --version >nul 2>&1
if %errorlevel% == 0 (
    echo [✓] PHP detectado
    echo [→] Iniciando servidor con PHP...
    echo.
    echo La aplicacion se abrira automaticamente en tu navegador.
    echo Presiona Ctrl+C para detener el servidor.
    echo.
    start http://localhost:8000
    timeout /t 2 /nobreak >nul
    php -S localhost:8000
    goto :end
)

REM Si no hay servidor disponible, abrir directamente el archivo
echo [⚠] No se encontro Python, Node.js ni PHP.
echo [→] Abriendo index.html directamente en el navegador...
echo.
echo Nota: Algunas funcionalidades pueden no funcionar correctamente
echo       sin un servidor local. Se recomienda instalar Node.js.
echo.
timeout /t 2 /nobreak >nul
start index.html
goto :end

:end
echo.
echo Servidor detenido.
pause

