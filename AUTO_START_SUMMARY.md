# ✅ AI Server Auto-Start Configuration Complete

## What Changed

The `start.ps1` script now automatically starts **all three services**:

1. ✅ **AI Server** (Python FastAPI) - Port 8000
2. ✅ **Backend** (Node.js Express) - Port 5000  
3. ✅ **Frontend** (React Vite) - Port 5173

---

## New Scripts Created

### 1. `start.ps1` (Updated)
**Purpose:** Start all services automatically

**Usage:**
```powershell
.\start.ps1
```

**What it does:**
- Checks if AI server exists
- Starts AI server in separate PowerShell window
- Starts backend with nodemon (auto-reload)
- Starts frontend with Vite dev server
- Shows status and URLs for all services

### 2. `stop.ps1` (New)
**Purpose:** Stop all services at once

**Usage:**
```powershell
.\stop.ps1
```

**What it does:**
- Stops all Node.js processes (Backend + Frontend)
- Stops all Python processes (AI Server)
- Clean shutdown

### 3. `status.ps1` (New)
**Purpose:** Check which services are running

**Usage:**
```powershell
.\status.ps1
```

**What it does:**
- Checks if AI server is running
- Checks if backend is running
- Checks if frontend is accessible
- Runs health checks on endpoints
- Shows summary status

### 4. `smart-bus-ai/check-dependencies.ps1` (New)
**Purpose:** Verify AI server dependencies

**Usage:**
```powershell
cd smart-bus-ai
.\check-dependencies.ps1
```

**What it does:**
- Checks Python installation
- Creates/verifies virtual environment
- Checks requirements.txt
- Verifies installed packages (fastapi, uvicorn, deepface, opencv-python)
- Installs missing dependencies automatically

---

## How It Works

### Startup Sequence

```
1. User runs: .\start.ps1
   ↓
2. Script checks AI server path
   ↓
3. Opens PowerShell window → AI Server
   Command: python app.py
   ↓
4. Opens PowerShell window → Backend
   Command: npm run dev
   ↓
5. Opens PowerShell window → Frontend
   Command: npm run dev
   ↓
6. Shows success message with URLs
```

Each service runs in its **own window** so you can:
- See logs separately
- Debug individual services
- Stop services independently

---

## Quick Commands

| Command | Purpose |
|---------|---------|
| `.\start.ps1` | Start all services |
| `.\stop.ps1` | Stop all services |
| `.\status.ps1` | Check service status |

---

## Service URLs

After running `.\start.ps1`, access:

- **AI Server:** http://localhost:8000
  - Health: http://localhost:8000/health
  - Docs: http://localhost:8000/docs

- **Backend:** http://localhost:5000
  - API endpoints available

- **Frontend:** http://localhost:5173
  - Main application UI

---

## Face Authentication Ready

With the AI server auto-starting, **face authentication is now fully operational**:

✅ Register with face during signup  
✅ Login with face recognition  
✅ Enable/disable face auth in settings  
✅ All endpoints working automatically  

---

## Troubleshooting

### AI Server doesn't start

**Check Python:**
```powershell
python --version
```

**Check dependencies:**
```powershell
cd smart-bus-ai
.\check-dependencies.ps1
```

**Manual start:**
```powershell
cd smart-bus-ai
python app.py
```

### Port already in use

**Find process using port:**
```powershell
netstat -ano | findstr :8000
```

**Kill process:**
```powershell
taskkill /PID <PID> /F
```

### Services won't stop

```powershell
.\stop.ps1
# Or force stop:
Get-Process -Name "node","python" | Stop-Process -Force
```

---

## First Time Setup

If you haven't set up the AI server yet:

1. **Navigate to AI folder:**
```powershell
cd smart-bus-ai
```

2. **Create virtual environment:**
```powershell
python -m venv venv
```

3. **Activate environment:**
```powershell
venv\Scripts\Activate.ps1
```

4. **Install dependencies:**
```powershell
pip install -r requirements.txt
```

5. **Test AI server:**
```powershell
python app.py
```

6. **Return to root and start all:**
```powershell
cd ..
.\start.ps1
```

---

## What Happens on Startup

### AI Server Window
```
Starting AI Server (Python FastAPI)...
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Backend Window
```
[nodemon] starting `node server.js`
Server running on port 5000
Database connected
```

### Frontend Window
```
VITE v5.x.x ready in XXX ms
➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

---

## Development Workflow

**Morning startup:**
```powershell
.\start.ps1
```

**Check if everything is running:**
```powershell
.\status.ps1
```

**Work on your code** - All services auto-reload on changes!

**End of day:**
```powershell
.\stop.ps1
```

Or just close the PowerShell windows.

---

## Production Notes

For production deployment:

- **AI Server:** Use Gunicorn/Uvicorn with systemd
- **Backend:** Use PM2 process manager
- **Frontend:** Build and serve static files with nginx

This auto-start script is for **development only**.

---

## Summary

✅ AI server now starts automatically with `.\start.ps1`  
✅ Face authentication fully integrated  
✅ All services start in separate windows  
✅ Easy to monitor and debug  
✅ Simple stop command to shut down everything  
✅ Status checker to verify services  

**Everything is ready! Just run `.\start.ps1` and start developing!** 🚀
