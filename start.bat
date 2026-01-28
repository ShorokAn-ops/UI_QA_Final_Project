@echo off
echo Starting ERPNext Risk Analyzer Dashboard...
echo.
echo Make sure the backend API is running on http://localhost:8081
echo.
cd /d "%~dp0"
npm run dev
