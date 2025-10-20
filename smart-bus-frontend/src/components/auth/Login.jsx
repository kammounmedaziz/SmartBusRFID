import React, { useState } from 'react'
import { apiFetch } from '../../api.js'
import { useNavigate } from 'react-router-dom'

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  async function submit(e) {
    e.preventDefault()
    setError(null)
    try {
      const data = await apiFetch('/auth/login', null, { method: 'POST', body: JSON.stringify({ email, password }) })
      const token = data.token
      onLogin(token)
      // fetch user info and redirect
      try {
        const me = await apiFetch('/auth/me', token)
  if (me.role === 'admin') navigate('/dashboard', { replace: true })
  else navigate('/client-dashboard', { replace: true })
      } catch (_) {
        // fallback
  navigate('/client-dashboard', { replace: true })
      }
    } catch (err) {
      setError(err.error || err.message || 'Invalid credentials')
    }
  }

  return (
    <div className="login">
      <h2>Sign In</h2>
      <form onSubmit={submit}>
        <label>
          Email
          <input value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        <button type="submit">Sign in</button>
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  )
}


