import React from 'react'
import { Link } from 'react-router-dom'

export default function Sidebar({ onLogout }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">SmartBus</div>
      <nav>
        <ul>
          <li><Link to="/dashboard">Dashboard</Link></li>
          <li><Link to="/account">Account</Link></li>
          <li><button className="btn-link" onClick={onLogout}>Logout</button></li>
        </ul>
      </nav>
    </aside>
  )
}


