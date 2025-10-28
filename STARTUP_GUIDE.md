# 🚀 SmartBus Startup Scripts

Quick commands to manage all SmartBus services.

## Scripts

### `start.ps1` - Start All Services
Starts all three services in separate PowerShell windows:
1. **AI Server** (Python FastAPI) - Port 8000
2. **Backend** (Node.js Express) - Port 5000
3. **Frontend** (React Vite) - Port 5173

**Usage:**
```powershell
.\start.ps1
```

**What it does:**
- ✅ Checks if AI server exists
- ✅ Starts AI server with Python
- ✅ Starts backend with `npm run dev`
- ✅ Starts frontend with `npm run dev`
- ✅ Opens each in separate window for easy log viewing

### `stop.ps1` - Stop All Services
Stops all running SmartBus services.

**Usage:**
```powershell
.\stop.ps1
```

**What it does:**
- ✅ Stops all Node.js processes (Backend + Frontend)
- ✅ Stops all Python processes (AI Server)
- ✅ Closes gracefully

### `smart-bus-ai/check-dependencies.ps1` - Check AI Dependencies
Verifies Python and AI server dependencies are installed.

**Usage:**
```powershell
cd smart-bus-ai
.\check-dependencies.ps1
```

**What it does:**
- ✅ Checks Python installation
- ✅ Checks/creates virtual environment
- ✅ Verifies requirements.txt
- ✅ Checks installed packages
- ✅ Installs missing dependencies

## Quick Start

### First Time Setup

1. **Install dependencies:**
```powershell
# Backend
cd smart-bus-backend
npm install

# Frontend
cd ../smart-bus-frontend
npm install

# AI Server
cd ../smart-bus-ai
python -m venv venv
venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

2. **Setup database:**
```powershell
cd smart-bus-backend
npm run init-db
```

3. **Start everything:**
```powershell
cd ..
.\start.ps1
```

### Daily Usage

**Start all services:**
```powershell
.\start.ps1
```

**Access applications:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- AI Server: http://localhost:8000

**Stop all services:**
```powershell
.\stop.ps1
```

Or just close the PowerShell windows.

## Service Details

### AI Server (Port 8000)
- **Technology:** Python, FastAPI, DeepFace
- **Purpose:** Face recognition, voice assistant, predictions
- **Endpoints:**
  - `GET /health` - Health check
  - `POST /ai/face/register` - Register face
  - `POST /ai/face/verify` - Verify face
  - `DELETE /ai/face/delete/:userId` - Delete face
  - `POST /ai/voice/query` - Voice queries
  - `POST /ai/predict/low-balance` - Balance predictions

### Backend (Port 5000)
- **Technology:** Node.js, Express, MySQL
- **Purpose:** Business logic, authentication, RFID management
- **Key Endpoints:**
  - `POST /auth/register` - User registration
  - `POST /auth/login` - Login (password or face)
  - `PUT /auth/me/settings/face` - Face auth settings
  - `GET /auth/me` - Get current user
  - `POST /cards` - Card management
  - `POST /transactions` - Transactions

### Frontend (Port 5173)
- **Technology:** React, Vite, TailwindCSS
- **Purpose:** User interface
- **Features:**
  - User authentication (password + face)
  - Dashboard
  - Card management
  - Face auth settings
  - Real-time updates

## Troubleshooting

### AI Server won't start
```powershell
cd smart-bus-ai
.\check-dependencies.ps1
```

### Port already in use
```powershell
# Kill specific port
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

### Services not stopping
```powershell
.\stop.ps1
# Or manually:
Get-Process -Name "node","python" | Stop-Process -Force
```

### Camera not working (Face Auth)
- Ensure HTTPS or use localhost
- Check browser permissions
- Verify AI server is running

## Environment Variables

Create `.env` files in each directory:

**smart-bus-backend/.env**
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=smartbus
JWT_SECRET=your_secret_key
AI_SERVER_URL=http://localhost:8000
```

**smart-bus-ai/.env**
```env
USE_LOCAL_LLM=true
LOCAL_LLM_MODEL=llama3.1
DB_HOST=localhost
DB_NAME=smartbus
```

## Notes

- **Development Mode:** All services run with auto-reload
  - Backend: nodemon watches for changes
  - Frontend: Vite HMR (Hot Module Replacement)
  - AI Server: FastAPI auto-reload

- **Production:** Use proper process managers
  - Backend: PM2
  - Frontend: Build and serve static files
  - AI Server: Gunicorn + systemd

- **Logs:** Each service runs in separate window for easy debugging

## Scripts Summary

| Script | Purpose | Usage |
|--------|---------|-------|
| `start.ps1` | Start all services | `.\start.ps1` |
| `stop.ps1` | Stop all services | `.\stop.ps1` |
| `smart-bus-ai/check-dependencies.ps1` | Check AI deps | `cd smart-bus-ai; .\check-dependencies.ps1` |

**Happy coding! 🚀**
