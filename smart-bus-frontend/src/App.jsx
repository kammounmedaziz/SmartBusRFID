import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Nav from './components/Nav'
import Home from './pages/Home'
import About from './pages/About'
import AuthPage from './pages/AuthPage'
import Dashboard from './pages/Dashboard'
import NotFound from './pages/NotFound'
import Users from './pages/Users'
import Reports from './pages/Reports'

export default function App() {
  const [token, setToken] = useState(null)

  useEffect(() => {
    const saved = localStorage.getItem('sb_token')
    if (saved) setToken(saved)
  }, [])

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
      <Nav token={token} onLogout={handleLogout} />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/auth" element={<AuthPage onLogin={handleLogin} />} />
          <Route path="/dashboard" element={token ? <Dashboard token={token} /> : <Navigate to="/auth" replace />} />
          <Route path="/users" element={token ? <Users token={token} /> : <Navigate to="/auth" replace />} />
          <Route path="/reports" element={token ? <Reports token={token} /> : <Navigate to="/auth" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}
