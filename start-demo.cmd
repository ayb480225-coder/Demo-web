@echo off
setlocal
cd /d "%~dp0"
echo.
echo  Ayurved Clinic demo
echo  Starting local server at http://127.0.0.1:5500
echo  Keep this window open while you present. Press Ctrl+C to stop.
echo.
start "Ayurved Clinic demo server" cmd /k python -m http.server 5500 --bind 127.0.0.1
timeout /t 2 /nobreak >nul
start "" "http://127.0.0.1:5500/index.html"
endlocal
