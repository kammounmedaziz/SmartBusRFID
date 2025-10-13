import React, { useEffect, useState } from 'react'
import { apiFetch } from '../api'

export default function Users({ token }) {
  const [users, setUsers] = useState([])

  useEffect(() => {
    let mounted = true
    apiFetch('/api/users', token).then((data) => { if (mounted) setUsers(data) }).catch(()=>{})
    return ()=> mounted = false
  }, [])

  return (
    <div className="page users">
      <h2>Users</h2>
      <ul>
        {users.map(u => <li key={u.id}>{u.email} — {u.role}</li>)}
      </ul>
    </div>
  )
}
