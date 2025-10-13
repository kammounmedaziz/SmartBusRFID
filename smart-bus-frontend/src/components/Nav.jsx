import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import Logo from './Logo'

export default function Nav({ token, me, onLogout }) {
  const location = useLocation()
  const path = location.pathname || ''
  const showLogout = token && (path === '/dashboard' || path === '/client-dashboard' || path === '/account')

  return (
    <nav className="nav">
      <div className="nav-left">
        <Logo size={36} />
        <div className="brand">SmartBus</div>
      </div>

      <div className="nav-links">
        <Link to="/">Home</Link>
        {token ? (
          <>
            <Link to="/account">Account</Link>
            <Link to="/dashboard">Dashboard</Link>
          </>
        ) : (
          <>
            <Link to="/auth">Sign in</Link>
          </>
        )}
      </div>

      <div className="nav-actions">
        {showLogout && <button className="btn-logout" onClick={onLogout}>Logout</button>}
      </div>
    </nav>
  )
}
