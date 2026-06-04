@echo off
setlocal
echo Starting E-commerce Website Services...
echo.

echo Starting Chatbot Backend (Python FastAPI)...
start "Chatbot Backend" cmd /k cd /d "%~dp0chatbot" ^& uvicorn chatbot:app --reload

echo Starting Recommendation Service (Python FastAPI)...
start "Recommend Service" cmd /k cd /d "%~dp0recommend" ^& python -m uvicorn app:app --host 0.0.0.0 --port 8001 --reload

echo Starting Backend API (Node.js)...
start "Backend API" cmd /k cd /d "%~dp0unified-backend" ^& npm run dev

echo Starting Frontend (React/Vite)...
start "Frontend" cmd /k cd /d "%~dp0frontend" ^& npm run dev

echo.
echo Services are starting up...
echo - Chatbot Backend: http://localhost:8000
echo - Recommend Service: http://localhost:8001/recommend
echo - Backend API: http://localhost:5001
echo - Frontend: http://localhost:5174 (or next available port)
echo.
pause > nul
