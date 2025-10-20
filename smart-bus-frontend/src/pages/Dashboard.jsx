import React, { useEffect, useState } from 'react'
import { apiFetch } from '../api.js'

export default function Dashboard({ token, me }) {
  const [stats, setStats] = useState({ cards: 0, transactions: 0, revenue: 0 })

  useEffect(() => {
    if (!token) return
    let mounted = true
    apiFetch('/api/reports/summary', token).then(r => { if (mounted) setStats(r) }).catch(()=>{})
    return () => mounted = false
  }, [token])

  return (
    <div className="page dashboard">
      <h2>Dashboard</h2>
      <div className="dashboard-grid">
        <div className="stat">Cards<br/><strong>{stats.cards}</strong></div>
        <div className="stat">Transactions<br/><strong>{stats.transactions}</strong></div>
        <div className="stat">Revenue<br/><strong>${stats.revenue}</strong></div>
      </div>
    </div>
  )
}


