import React, { useState } from 'react'

export default function PayForm({ token, onDone }) {
  const [uid, setUid] = useState('')
  const [amount, setAmount] = useState(0)
  const [msg, setMsg] = useState(null)

  async function submit(e) {
    e.preventDefault()
    setMsg(null)
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/cards/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ uid, amount: Number(amount) }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed')
      setMsg('Payment recorded')
      setUid('')
      setAmount(0)
      onDone()
    } catch (err) {
      setMsg(err.message)
    }
  }

  return (
    <form onSubmit={submit} className="form">
      <h4>Pay</h4>
      <input placeholder="UID" value={uid} onChange={(e) => setUid(e.target.value)} />
      <input placeholder="Amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
      <button type="submit">Pay</button>
      {msg && <p>{msg}</p>}
    </form>
  )
}
