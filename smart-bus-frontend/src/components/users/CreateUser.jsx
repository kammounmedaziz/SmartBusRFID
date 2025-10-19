import React, { useState } from 'react'
import { apiFetch } from '../api'
import { isNonEmpty, isPositiveNumber } from '../utils/validate'

export default function CreateUser({ token, onDone }){
  const [name,setName]=useState('')
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [role,setRole]=useState('operator')
  const [msg,setMsg]=useState(null)

  async function submit(e){
    e.preventDefault(); setMsg(null)
    if(!email||!password) return setMsg('email and password required')
    try{
      const body={name,email,password,role}
      await apiFetch('/api/users', token, { method:'POST', body: JSON.stringify(body) })
      setMsg('User created')
      setName(''); setEmail(''); setPassword(''); setRole('operator')
      onDone?.()
    }catch(err){ setMsg(err.message||'Failed') }
  }

  return (
    <form className="form" onSubmit={submit}>
      <h4>Create User</h4>
      <input placeholder="Full name" value={name} onChange={e=>setName(e.target.value)} />
      <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
      <input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
      <select value={role} onChange={e=>setRole(e.target.value)}>
        <option value="operator">Operator</option>
        <option value="admin">Admin</option>
      </select>
      <button type="submit">Create</button>
      {msg && <p className="error">{msg}</p>}
    </form>
  )
}
