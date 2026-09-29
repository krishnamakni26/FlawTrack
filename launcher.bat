@echo off
setlocal

:: Ensure system executables and Node.js / NPM are on PATH
set "PATH=%SystemRoot%\system32;%SystemRoot%;%SystemRoot%\System32\Wbem;%SystemRoot%\System32\WindowsPowerShell\v1.0\;C:\Program Files\nodejs;C:\Users\KRISHNA MAKANI\AppData\Roaming\npm;C:\Program Files\Git\cmd;C:\Program Files\Git\bin;%PATH%"

:: Change directory to the folder containing this batch script
cd /d "%~dp0"

title VulnTrack System Launcher
color 0B

echo ================================================================================
echo   VULNTRACK -- Smart Cybersecurity Vulnerability Management System
echo   Automated Launcher and Service Manager
echo ================================================================================
echo.

:: Verify Node.js is installed
where node >nul 2>&1
if %errorlevel% neq 0 goto ERR_NO_NODE

echo [*] Checking runtime environment...
node -v >nul 2>&1
if %errorlevel% neq 0 goto ERR_NO_NODE

for /f "tokens=*" %%v in ('node -v') do set "NODE_VER=%%v"
echo [*] Node.js version: %NODE_VER%

:: Check dependencies
if not exist "backend\node_modules" goto INSTALL_BACKEND
goto CHECK_FRONTEND_DEPS

:INSTALL_BACKEND
echo [*] Installing backend dependencies...
cd backend
call npm install
cd ..

:CHECK_FRONTEND_DEPS
if not exist "frontend\node_modules" goto INSTALL_FRONTEND
goto BOOT_SERVICES

:INSTALL_FRONTEND
echo [*] Installing frontend dependencies...
cd frontend
call npm install
cd ..

:BOOT_SERVICES
echo [*] Checking active services...

:: Check if port 5000 (Backend) is already listening
netstat -ano | findstr ":5000" | findstr "LISTENING" >nul 2>&1
if %errorlevel% equ 0 goto BACKEND_RUNNING

echo [*] Starting Backend API Server (Port 5000)...
start "VulnTrack Backend Server [Port 5000]" cmd /k "title VulnTrack Backend Server && cd /d "%~dp0backend" && node src/server.js"
goto CHECK_FRONTEND

:BACKEND_RUNNING
echo [OK] Backend API is already running on http://localhost:5000

:CHECK_FRONTEND
:: Check if port 5173 (Frontend) is already listening
netstat -ano | findstr ":5173" | findstr "LISTENING" >nul 2>&1
if %errorlevel% equ 0 goto FRONTEND_RUNNING

echo [*] Starting Frontend Web Server (Port 5173)...
start "VulnTrack Frontend Web [Port 5173]" cmd /k "title VulnTrack Frontend Web && cd /d "%~dp0frontend" && npx vite --port 5173"
goto WAIT_AND_OPEN

:FRONTEND_RUNNING
echo [OK] Frontend Web App is already running on http://localhost:5173

:WAIT_AND_OPEN
echo [*] Waiting 3 seconds for services to be ready...
ping 127.0.0.1 -n 4 >nul

echo [*] Opening VulnTrack in your default browser...
start http://localhost:5173

:MENU
cls
echo ================================================================================
echo   VULNTRACK -- MANAGEMENT CONSOLE
echo ================================================================================
echo   Status: SERVICES ACTIVE
echo.
echo   Application URLs:
echo     - Frontend Web App:  http://localhost:5173
echo     - Backend REST API:  http://localhost:5000/api/v1
echo     - Health Endpoint:   http://localhost:5000/api/v1/health
echo.
echo   Default Credentials (Quick-fill on Login screen):
echo     [Admin]    admin@vulntrack.local    /  Password123!
echo     [Analyst]  analyst1@vulntrack.local /  Password123!
echo     [Reporter] reporter1@vulntrack.local /  Password123!
echo ================================================================================
echo.
echo   [1] Open Web App in browser (http://localhost:5173)
echo   [2] Run Automated E2E System Verification
echo   [3] View API Health Check (JSON)
echo   [4] Stop Backend and Frontend Servers
echo   [5] Exit console (Leaves servers running)
echo.
set /p "CHOICE=Enter choice [1-5]: "

if "%CHOICE%"=="1" goto OP_BROWSER
if "%CHOICE%"=="2" goto OP_E2E
if "%CHOICE%"=="3" goto OP_HEALTH
if "%CHOICE%"=="4" goto OP_STOP
if "%CHOICE%"=="5" goto OP_EXIT

echo Invalid choice. Please choose 1, 2, 3, 4, or 5.
ping 127.0.0.1 -n 2 >nul
goto MENU

:OP_BROWSER
start http://localhost:5173
goto MENU

:OP_E2E
echo.
echo [*] Executing E2E Verification Suite...
cd /d "%~dp0backend"
node scripts/e2e-verify.js
cd /d "%~dp0"
echo.
echo Press any key to return to menu...
pause >nul
goto MENU

:OP_HEALTH
start http://localhost:5000/api/v1/health
goto MENU

:OP_STOP
echo.
echo [*] Stopping VulnTrack processes on ports 5000 and 5173...
powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort 5000,5173 -State Listen -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue; Write-Host ('Stopped process on port ' + $_.LocalPort) }"
echo [OK] Done.
ping 127.0.0.1 -n 3 >nul
goto MENU

:OP_EXIT
echo Exiting console. VulnTrack servers remain active.
exit /b 0

:ERR_NO_NODE
echo.
echo ================================================================================
echo [ERROR] Node.js was not detected in PATH or C:\Program Files\nodejs.
echo.
echo Please ensure Node.js (v18 or higher) is installed on your computer.
echo You can download it from: https://nodejs.org/
echo ================================================================================
echo.
echo Press any key to exit...
pause >nul
exit /b 1
