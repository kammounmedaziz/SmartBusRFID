import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Nav from './components/ui/Nav'
import Sidebar from './components/ui/Sidebar'
import Account from './pages/Account'
import Home from './pages/Home'
import AuthPage from './pages/AuthPage'
import NotFound from './pages/NotFound'
import Users from './pages/Users'
import Reports from './pages/Reports'
import ClientDashboard from './pages/ClientDashboard'
import Dashboard from './pages/Dashboard'
import { apiFetch } from './api'

export default function App() {
  const [token, setToken] = useState(null)
  const [me, setMe] = useState(null)

  useEffect(() => {
    const saved = localStorage.getItem('sb_token')
    if (saved) setToken(saved)
  }, [])

  useEffect(() => {
    if (!token) return setMe(null)
    // fetch /auth/me using apiFetch which respects VITE_API_URL
    apiFetch('/auth/me', token).then(data => setMe(data)).catch(() => setMe(null))
  }, [token])

  function handleLogin(t) {
    localStorage.setItem('sb_token', t)
    setToken(t)
  }

  function handleLogout() {
    localStorage.removeItem('sb_token')
    setToken(null)
  }

  return (
    <BrowserRouter>
      {/* If a normal client is signed in, show the sidebar layout */}
      {me?.role === 'user' ? (
        <div className="app-with-sidebar">
          <Sidebar onLogout={handleLogout} />
          <main className="content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/auth" element={<AuthPage onLogin={handleLogin} />} />
              <Route path="/client-dashboard" element={token ? <ClientDashboard token={token} me={me} /> : <Navigate to="/auth" replace />} />
              <Route path="/account" element={token ? <Account token={token} me={me} /> : <Navigate to="/auth" replace />} />
              <Route path="/dashboard" element={token ? <Dashboard token={token} me={me} /> : <Navigate to="/auth" replace />} />
              <Route path="/users" element={token && me?.role === 'admin' ? <Users token={token} /> : <Navigate to="/auth" replace />} />
              <Route path="/reports" element={token && me?.role === 'admin' ? <Reports token={token} /> : <Navigate to="/auth" replace />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      ) : (
        <>
          <Nav token={token} me={me} onLogout={handleLogout} />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/auth" element={<AuthPage onLogin={handleLogin} />} />
              <Route path="/client-dashboard" element={token ? <ClientDashboard token={token} me={me} /> : <Navigate to="/auth" replace />} />
              <Route path="/account" element={token ? <Account token={token} me={me} /> : <Navigate to="/auth" replace />} />
              <Route path="/dashboard" element={token ? <Dashboard token={token} me={me} /> : <Navigate to="/auth" replace />} />
              <Route path="/users" element={token && me?.role === 'admin' ? <Users token={token} /> : <Navigate to="/auth" replace />} />
              <Route path="/reports" element={token && me?.role === 'admin' ? <Reports token={token} /> : <Navigate to="/auth" replace />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </>
      )}
    </BrowserRouter>
  )
}
