import React from 'react'
import Login from '../components/Login'

export default function AuthPage({ onLogin }) {
  return (
    <div className="page auth">
      <h2>Sign in</h2>
      <Login onLogin={onLogin} />
    </div>
  )
}
