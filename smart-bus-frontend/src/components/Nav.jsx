import React from 'react'
import { Link } from 'react-router-dom'
import Logo from './Logo'

export default function Nav({ token, onLogout }) {
  return (
    <nav className="nav">
      <div style={{display:'flex',alignItems:'center',gap:12}}>
        <Logo size={36} />
        <div className="brand">SmartBus</div>
      </div>
      <div className="links">
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        {token ? (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/users">Users</Link>
            <Link to="/reports">Reports</Link>
          </>
        ) : (
          <Link to="/auth">Sign in</Link>
        )}
      </div>
      {token && <button className="btn-logout" onClick={onLogout}>Logout</button>}
    </nav>
  )
}
