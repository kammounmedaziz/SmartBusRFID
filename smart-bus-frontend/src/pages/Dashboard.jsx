import React from 'react'
import Cards from '../components/Cards'

export default function Dashboard({ token }) {
  return (
    <div className="page dashboard">
      <h2>Dashboard</h2>
      <Cards token={token} />
    </div>
  )
}
