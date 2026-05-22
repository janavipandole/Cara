@echo off
echo ===================================================
echo   🛍️  Starting Cara E-commerce Platform  🛍️
echo ===================================================
echo.

:: Move into the Cara project directory (robust check for both parent and child directories)
if exist "%~dp0\Cara" (
    cd /d "%~dp0\Cara"
) else (
    cd /d "%~dp0"
)

echo [1/4] Checking Python Virtual Environment...
if not exist ".venv" (
    echo [ERROR] .venv folder not found in %CD%
    echo Please make sure you are running this from the correct workspace.
    pause
    exit /b
)

echo [2/4] Activating Virtual Environment...
call .venv\Scripts\activate.bat

echo [3/4] Installing / Verifying Dependencies...
pip install -r backend\requirements.txt

echo [4/4] Starting Services...
echo.
echo 🌐 Opening Frontend in your default browser...
start index.html

:: Dynamically detect the computer's current local IP address
set "LOCAL_IP="
for /f "usebackq tokens=*" %%i in (`powershell -NoProfile -Command "(Get-NetIPAddress -AddressFamily IPv4 | Where-Object IPAddress -NotLike '127.*' | Where-Object IPAddress -NotLike '169.254.*' | Select-Object -ExpandProperty IPAddress -First 1)"`) do set "LOCAL_IP=%%i"

echo 🐍 Starting FastAPI Backend Server (Uvicorn)...
echo.
echo 💻 Local Access:            http://127.0.0.1:8000
echo 🌐 Local Loopback Docs:     http://127.0.0.1:8000/docs
if defined LOCAL_IP (
    echo 📱 Wi-Fi / Local Network:   http://%LOCAL_IP%:8000
    echo 📶 Network Docs:            http://%LOCAL_IP%:8000/docs
    echo.
    echo [INFO] You can open http://%LOCAL_IP%:8000 on your phone
    echo        or other devices connected to the same Wi-Fi network!
)
echo.
echo Press Ctrl+C to stop the server.
echo ===================================================
echo.

:: Bind to 0.0.0.0 so that the server listens on all interfaces (Wi-Fi, Ethernet, and localhost)
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
