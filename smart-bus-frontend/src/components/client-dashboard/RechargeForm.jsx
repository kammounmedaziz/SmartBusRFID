import React, { useState } from 'react'
import { apiFetch } from '../api'
import { isPositiveNumber, isNonEmpty } from '../utils/validate'

export default function RechargeForm({ token, onDone }) {
  const [uid, setUid] = useState('')
  const [amount, setAmount] = useState(0)
  const [msg, setMsg] = useState(null)

  async function submit(e) {
    e.preventDefault()
    setMsg(null)
    if (!isNonEmpty(uid)) return setMsg('UID is required')
    if (!isPositiveNumber(amount)) return setMsg('Amount must be positive')
    try {
      await apiFetch('/api/cards/recharge', token, { method: 'POST', body: JSON.stringify({ uid, amount: Number(amount) }) })
      setMsg('Recharged')
      setUid('')
      setAmount(0)
      onDone()
    } catch (err) {
      setMsg(err.message || 'Failed')
    }
  }

  return (
    <form onSubmit={submit} className="form">
      <h4>Recharge</h4>
      <input placeholder="UID" value={uid} onChange={(e) => setUid(e.target.value)} />
      <input placeholder="Amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
      <button type="submit">Recharge</button>
      {msg && <p className="error">{msg}</p>}
    </form>
  )
}
