import React, { useState } from 'react'
import { apiFetch } from '../api'
import { useNavigate } from 'react-router-dom'

export default function Register({ onRegistered, onLogin }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  async function submit(e) {
    e.preventDefault()
    setError(null)
    try {
      const data = await apiFetch('/auth/register', null, { method: 'POST', body: JSON.stringify({ name, email, password }) })
      // attempt to login immediately
      try {
        const login = await apiFetch('/auth/login', null, { method: 'POST', body: JSON.stringify({ email, password }) })
        const token = login.token
        onLogin?.(token)
        // fetch me and redirect
        const me = await apiFetch('/auth/me', token)
  if (me.role === 'admin') navigate('/dashboard', { replace: true })
  else navigate('/client-dashboard', { replace: true })
      } catch (_) {
        onRegistered(data)
      }
    } catch (err) {
      setError(err.error || err.message || 'Registration failed')
    }
  }

  return (
    <div className="register">
      <h2>Create account</h2>
      <form onSubmit={submit}>
        <label>
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label>
          Email
          <input value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        <button type="submit">Create account</button>
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  )
}
