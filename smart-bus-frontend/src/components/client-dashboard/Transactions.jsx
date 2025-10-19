import React from 'react'

export default function Transactions({ transactions }) {
  return (
    <div>
      <h4>Transactions</h4>
      <ul>
        {transactions.map((t) => (
          <li key={t.id}>{t.id} — {t.uid} — {t.type} — ${t.amount} — {t.timestamp}</li>
        ))}
      </ul>
    </div>
  )
}
