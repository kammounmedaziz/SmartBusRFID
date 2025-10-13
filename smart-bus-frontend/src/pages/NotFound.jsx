import React from 'react'
import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="page notfound">
      <h2>404 — Not Found</h2>
      <p>The page you're looking for doesn't exist.</p>
      <Link to="/">Back home</Link>
    </div>
  )
}
