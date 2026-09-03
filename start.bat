@echo off
chcp 65001 >nul
title Projekt starten
cd /d "%~dp0"

echo ============================================
echo   Projekt wird gestartet...
echo ============================================
echo.

echo [1/2] Backend starten (Flask, Port 4000)...
start "Backend - Flask" cmd /k "python backend/app.py"

echo [2/2] Frontend starten (Vite, Port 3000)...
start "Frontend - Vite" cmd /k "cd frontend && npm run dev"

echo.
echo Warte auf Server-Start...
timeout /t 5 /nobreak >nul

echo Öffne http://localhost:3000 im Browser...
start http://localhost:3000

echo.
echo Fertig! Zum Stoppen einfach die beiden Server-Fenster schließen.
timeout /t 5 >nul
exit
