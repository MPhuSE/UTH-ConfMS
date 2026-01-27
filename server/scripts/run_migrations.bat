@echo off
REM Migration Runner Script for Windows
REM Chạy tất cả migrations Alembic

echo ========================================
echo Running Database Migrations
echo ========================================
echo.

cd /d %~dp0\..

REM Activate venv if exists
if exist "venv\Scripts\activate.bat" (
    call venv\Scripts\activate.bat
)

REM Run Alembic migrations
python -m alembic upgrade head

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo Migration completed successfully!
    echo ========================================
) else (
    echo.
    echo ========================================
    echo Migration failed!
    echo ========================================
    exit /b 1
)
