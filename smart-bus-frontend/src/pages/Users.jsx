import React, { useEffect, useState } from 'react'
import { apiFetch } from '../api.js'
import CreateUser from '../components/users/CreateUser'

export default function Users({ token }) {
  const [users, setUsers] = useState([])
  const [cards, setCards] = useState([])
  const [expandedUser, setExpandedUser] = useState(null)

  async function load(){
    try{
      const data = await apiFetch('/api/users', token)
      setUsers(data)
      // prefetch cards for admin view
      const c = await apiFetch('/api/cards', token)
      setCards(c.data || c)
    }catch(e){}
  }

  useEffect(() => { load() }, [token])

  return (
    <div className="page users">
      <h2>Users</h2>
      <div style={{display:'flex',gap:12}}>
        <div style={{flex:1}}>
          <ul>
            {users.map(u => (
              <li key={u.id} style={{marginBottom:10}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div>{u.email} — {u.role}</div>
                  <div>
                    <button onClick={() => setExpandedUser(expandedUser === u.id ? null : u.id)}>View cards</button>
                  </div>
                </div>
                {expandedUser === u.id && (
                  <div style={{marginTop:8,padding:8,background:'rgba(255,255,255,0.02)',borderRadius:8}}>
                    <strong>Cards</strong>
                    <ul>
                      {cards.filter(cc => cc.user_id === u.id).map(cc => (
                        <li key={cc.id}>{cc.uid} — Balance: {cc.balance}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
        <div style={{width:340}}>
          <CreateUser token={token} onDone={load} />
        </div>
      </div>
    </div>
  )
}


