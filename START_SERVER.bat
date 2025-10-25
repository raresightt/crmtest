@echo off
echo ========================================
echo   Order CRM - Starting Server
echo ========================================
echo.

REM Check if node_modules exists
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
    echo.
)

echo Starting server...
echo.
echo Server will be available at: http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.

npm start

pause

