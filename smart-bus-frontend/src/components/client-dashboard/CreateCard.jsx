import React, { useState } from 'react'
import { apiFetch } from '../../api.js'
import { isNonEmpty, isPositiveNumber } from '../../utils/validate.js'

export default function CreateCard({ token, me, onDone }) {
  const [uid, setUid] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [balance, setBalance] = useState(0)
  const [userId, setUserId] = useState('')
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

      // Admins must provide a user_id to attach the card to
      if (me?.role === 'admin') {
        if (!isNonEmpty(userId)) {
          setMsg('Admin must provide a user id to assign the card to')
          return
        }
        body.user_id = Number(userId)
        await apiFetch('/api/cards', token, { method: 'POST', body: JSON.stringify(body) })
      } else {
        // Normal users create a card for themselves
        await apiFetch('/api/cards/me', token, { method: 'POST', body: JSON.stringify(body) })
      }

      setMsg('Card created')
      setUid('')
      setCardNumber('')
      setBalance(0)
      setUserId('')
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

      {me?.role === 'admin' && (
        <input placeholder="Assign to user id" value={userId} onChange={(e) => setUserId(e.target.value)} />
      )}

      <button type="submit">Create</button>
      {msg && <p>{msg}</p>}
    </form>
  )
}


