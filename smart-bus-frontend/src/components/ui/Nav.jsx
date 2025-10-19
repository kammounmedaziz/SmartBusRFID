import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import Logo from './Logo'

export default function Nav({ token, me, onLogout }) {
  const location = useLocation()
  const path = location.pathname || ''
  const showLogout = token && (path === '/dashboard' || path === '/client-dashboard' || path === '/account')

  return (
    <nav className="w-full bg-gradient-to-r from-[rgba(14,22,44,0.6)] to-transparent backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Logo size={36} />
            <div className="text-primary font-extrabold tracking-wide">SmartBus</div>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm text-slate-300 hover:text-primary transition">Home</Link>
            {token ? (
              <>
                <Link to="/account" className="text-sm text-slate-300 hover:text-primary transition">Account</Link>
                <Link to="/dashboard" className="text-sm text-slate-300 hover:text-primary transition">Dashboard</Link>
              </>
            ) : (
              <Link to="/auth" className="text-sm text-slate-300 hover:text-primary transition">Sign in</Link>
            )}
          </div>

          <div className="flex items-center">
            {showLogout && (
              <button onClick={onLogout} className="px-3 py-1 rounded-md border border-white/10 text-slate-200 hover:bg-white/5">Logout</button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
