@echo off
title Running SPK Mobil Listrik - Backend and Frontend
color 0B

echo =======================================================
echo  SPK MOBIL LISTRIK - BACKEND & FRONTEND RUNNER
echo =======================================================
echo.

REM 1. Start Backend in a separate window
echo [INFO] Menjalankan Backend Flask...
start "Backend Flask Server" cmd /c "call .venv\Scripts\activate.bat && cd backend && python app.py"

REM 2. Start Frontend in the current window
echo [INFO] Menjalankan Frontend React (Vite)...
echo [INFO] Untuk mobile, buka alamat Network yang muncul dari Vite.
cd frontend
npm run dev

pause
