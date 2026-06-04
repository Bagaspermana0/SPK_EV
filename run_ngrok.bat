@echo off
title Ngrok Tunnel untuk Backend SPK EV
color 0A

echo =======================================================
echo  NGROK TUNNEL RUNNER - BACKEND SPK EV
echo =======================================================
echo.
echo [INFO] Membuka tunnel ngrok pada port 5000...
echo.
echo Petunjuk Penggunaan:
echo 1. Setelah window ngrok terbuka, salin URL Forwarding HTTPS nya.
echo    (Contoh: https://xxxx-xxxx-xxxx.ngrok-free.app)
echo 2. Buat file baru bernama ".env" di dalam folder "frontend/"
echo    dan tulis di dalamnya:
echo    VITE_API_URL=URL_FORWARDING_TERSEBUT
echo 3. Jalankan frontend React/Vite seperti biasa.
echo.
echo =======================================================
echo.

ngrok http 5000

pause
