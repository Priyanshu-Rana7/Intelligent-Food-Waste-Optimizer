@echo off
echo Starting Intelligent Food Waste Optimizer...

:: Create a start.bat file that launches backend and frontend in separate windows

echo Launching Backend (Flask) in a new window...
start "Backend - Flask" cmd /k "cd backend && python app.py"

echo Launching Frontend (React) in a new window...
start "Frontend - React" cmd /k "cd frontend && npm start"

echo.
echo Both servers are starting up.
echo Your browser should open automatically at http://localhost:3000 once the frontend is ready.
echo.
pause
