@echo off
chcp 65001 >nul
title Subir a GitHub
color 0B

echo.
echo ╔══════════════════════════════════════════════════════════╗
echo ║   Subir Proyecto a GitHub                              ║
echo ╚══════════════════════════════════════════════════════════╝
echo.

REM Verificar si ya hay un remoto configurado
git remote -v >nul 2>&1
if %errorlevel% == 0 (
    echo [✓] Repositorio remoto ya configurado
    echo.
    echo ¿Deseas hacer push al repositorio existente? (S/N)
    set /p respuesta="> "
    if /i "%respuesta%"=="S" (
        echo.
        echo [→] Haciendo push a GitHub...
        git push -u origin master
        if %errorlevel% == 0 (
            echo.
            echo [✓] ¡Proyecto subido exitosamente a GitHub!
        ) else (
            echo.
            echo [✗] Error al hacer push. Verifica tu conexión y permisos.
        )
        goto :end
    )
)

echo.
echo INSTRUCCIONES:
echo.
echo 1. Ve a https://github.com y crea un nuevo repositorio
echo 2. NO inicialices con README, .gitignore o licencia
echo 3. Copia la URL del repositorio (ej: https://github.com/usuario/repo.git)
echo.
set /p repo_url="Ingresa la URL del repositorio: "

if "%repo_url%"=="" (
    echo.
    echo [✗] No se ingresó URL. Operación cancelada.
    goto :end
)

echo.
echo [→] Configurando repositorio remoto...
git remote add origin %repo_url%

if %errorlevel% == 0 (
    echo [✓] Repositorio remoto configurado
    echo.
    echo [→] Cambiando nombre de rama a 'main' (estándar de GitHub)...
    git branch -M main 2>nul
    echo.
    echo [→] Haciendo push a GitHub...
    git push -u origin main
    
    if %errorlevel% == 0 (
        echo.
        echo [✓] ¡Proyecto subido exitosamente a GitHub!
        echo.
        echo Tu repositorio está disponible en:
        echo %repo_url%
    ) else (
        echo.
        echo [✗] Error al hacer push. Posibles causas:
        echo    - La URL del repositorio es incorrecta
        echo    - No tienes permisos para escribir en el repositorio
        echo    - Problemas de autenticación
        echo.
        echo Intenta:
        echo   1. Verificar la URL del repositorio
        echo   2. Configurar tus credenciales de GitHub
        echo   3. Usar un token de acceso personal si es necesario
    )
) else (
    echo.
    echo [✗] Error al configurar el repositorio remoto.
    echo    Verifica que la URL sea correcta.
)

:end
echo.
pause

