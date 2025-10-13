import React, { useState, useEffect } from 'react'
import Login from './components/Login'
import Cards from './components/Cards'

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

  if (!token) return <Login onLogin={handleLogin} />

  return (
    <div className="app">
      <header>
        <h1>Smart Bus Admin</h1>
        <button onClick={handleLogout}>Logout</button>
      </header>
      <main>
        <Cards token={token} />
      </main>
    </div>
  )
}
