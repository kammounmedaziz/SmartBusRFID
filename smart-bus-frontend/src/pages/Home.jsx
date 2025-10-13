import React from 'react'
import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="page home">
      <div className="hero">
        <h1>Smart Bus Admin</h1>
        <p>Future-ready transit card management.</p>
        <div className="cta">
          <Link to="/auth" className="btn">Sign in</Link>
          <Link to="/about" className="btn btn-outline">About</Link>
        </div>
      </div>
    </div>
  )
}
