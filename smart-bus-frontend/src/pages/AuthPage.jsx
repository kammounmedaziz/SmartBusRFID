import React, { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Login from '../components/auth/Login'
import Register from '../components/auth/Register'

export default function AuthPage({ onLogin }) {
  const [search] = useSearchParams()
  const initial = search.get('mode') === 'register' ? 'register' : 'login'
  const [mode, setMode] = useState(initial)
  return (
    <div className="page auth">
      <div style={{display:'flex',gap:12,alignItems:'center'}}>
        <button onClick={() => setMode('login')}>Sign in</button>
        <button onClick={() => setMode('register')}>Sign up</button>
      </div>
      {mode === 'login' ? <Login onLogin={onLogin} /> : <Register onRegistered={() => setMode('login')} onLogin={onLogin} />}
    </div>
  )
}


