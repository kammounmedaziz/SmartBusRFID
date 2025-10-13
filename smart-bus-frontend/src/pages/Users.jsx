import React, { useEffect, useState } from 'react'
import { apiFetch } from '../api'
import CreateUser from '../components/CreateUser'

export default function Users({ token }) {
  const [users, setUsers] = useState([])

  async function load(){
    try{
      const data = await apiFetch('/api/users', token)
      setUsers(data)
    }catch(e){}
  }

  useEffect(() => { load() }, [token])

  return (
    <div className="page users">
      <h2>Users</h2>
      <div style={{display:'flex',gap:12}}>
        <div style={{flex:1}}>
          <ul>
            {users.map(u => <li key={u.id}>{u.email} — {u.role}</li>)}
          </ul>
        </div>
        <div style={{width:340}}>
          <CreateUser token={token} onDone={load} />
        </div>
      </div>
    </div>
  )
}
