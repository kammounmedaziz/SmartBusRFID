import React, { useState } from 'react'
import { apiFetch } from '../api'
import { isNonEmpty, isPositiveNumber } from '../utils/validate'

export default function CreateCard({ token, onDone }) {
  const [uid, setUid] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [balance, setBalance] = useState(0)
  const [msg, setMsg] = useState(null)

  async function submit(e) {
    e.preventDefault()
    setMsg(null)
    if (!isNonEmpty(uid) || !isNonEmpty(cardNumber)) {
      setMsg('UID and card number are required')
      return
    }
    if (!isPositiveNumber(balance)) {
      setMsg('Balance must be a positive number')
      return
    }
    try {
      const body = { uid, card_number: cardNumber, balance: Number(balance) }
      await apiFetch('/api/cards', token, { method: 'POST', body: JSON.stringify(body) })
      setMsg('Card created')
      setUid('')
      setCardNumber('')
      setBalance(0)
      onDone?.()
    } catch (err) {
      setMsg(err.message || 'Failed')
    }
  }

  return (
    <form onSubmit={submit} className="form">
      <h4>Create Card</h4>
      <input placeholder="UID" value={uid} onChange={(e) => setUid(e.target.value)} />
      <input placeholder="Card Number" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} />
      <input placeholder="Balance" type="number" value={balance} onChange={(e) => setBalance(e.target.value)} />
      <button type="submit">Create</button>
      {msg && <p>{msg}</p>}
    </form>
  )
}
