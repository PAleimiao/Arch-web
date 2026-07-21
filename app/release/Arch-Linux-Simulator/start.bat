@echo off
echo ==========================================
echo   Arch Linux Web Simulator
echo ==========================================
echo.

REM Check if electron is installed
if not exist "node_modules\electron" (
    echo Installing Electron...
    call npm install electron --save-dev
    if errorlevel 1 (
        echo Failed to install Electron. Please install Node.js first.
        echo Download from: https://nodejs.org/
        pause
        exit /b 1
    )
)

echo Starting Arch Linux Web Simulator...
echo.
start npx electron electron/main.js
