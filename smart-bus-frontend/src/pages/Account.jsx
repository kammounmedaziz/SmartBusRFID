import React, { useEffect, useState } from 'react'
import QRGenerate from '../components/QRGenerate'
import QRScan from '../components/QRScan'
import { apiFetch } from '../api'

export default function Account({ token, me }) {
  const [cards, setCards] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [payState, setPayState] = useState({ card_id: '', amount: '' })
  const [qrPayload, setQrPayload] = useState(null)
  const [scanning, setScanning] = useState(false)

  useEffect(() => {
    if (!token) return
    setLoading(true)
    apiFetch('/api/cards/me/cards', token).then(data => setCards(data.data || [])).catch(() => setCards([])).finally(() => setLoading(false))

    // user transactions: fetch user-scoped transactions
    apiFetch('/api/cards/me/transactions', token).then(data => setTransactions(data.data || [])).catch(() => setTransactions([]))
  }, [token])

  function handlePay(e) {
    e.preventDefault()
    apiFetch('/api/cards/me/pay', token, { method: 'POST', body: JSON.stringify({ card_id: payState.card_id, amount: payState.amount }) })
      .then(res => {
        alert('Payment successful. New balance: ' + res.balance)
        return apiFetch('/api/cards/me/cards', token)
      })
      .then(d => setCards(d.data || []) )
      .catch(err => alert('Payment failed: ' + (err.message || JSON.stringify(err))))
  }

  function handleGenerateQR() {
    const c = cards.find(x => String(x.id) === String(payState.card_id))
    if (!c) return alert('choose card')
    setQrPayload({ card_id: c.id, uid: c.uid, amount: payState.amount || 0 })
  }

  async function handleScanned(payload) {
    // payload may be { card_id, amount } or { uid, amount } or a plain string
    setScanning(false)
    let body = null
    if (payload && typeof payload === 'object' && payload.card_id) body = { card_id: payload.card_id, amount: payload.amount || payState.amount }
    else if (payload && typeof payload === 'object' && payload.uid) {
      // find card by uid
      const c = cards.find(x => x.uid === payload.uid)
      if (!c) return alert('Scanned card not found for this user')
      body = { card_id: c.id, amount: payload.amount || payState.amount }
    } else if (typeof payload === 'string') {
      try {
        const p = JSON.parse(payload)
        return handleScanned(p)
      } catch (e) {
        return alert('Scanned: ' + payload)
      }
    }
    if (!body) return
    // attempt payment
    try {
      const j = await apiFetch('/api/cards/me/pay', token, { method: 'POST', body: JSON.stringify(body) })
      alert('Payment success. New balance: ' + j.balance)
      const d = await apiFetch('/api/cards/me/cards', token)
      setCards(d.data || [])
    } catch (err) {
      alert('Payment failed: ' + (err.message || JSON.stringify(err)))
    }
  }

  if (!me) return <div>Please sign in</div>

  return (
    <div className="account-page">
      <h2>Account</h2>
      <p>Signed in as: {me.id} ({me.role})</p>
      <section>
        <h3>Your cards</h3>
        {loading ? <div>Loading...</div> : (
          <ul>
            {cards.map(c => (
              <li key={c.id}>UID: {c.uid} — Balance: {c.balance}</li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h3>Transactions</h3>
        <ul>
          {transactions.map(t => (
            <li key={t.id}>{t.timestamp} — {t.type} — {t.amount} — card {t.card_uid}</li>
          ))}
        </ul>
      </section>

      <section>
        <h3>Pay</h3>
        <form onSubmit={handlePay}>
          <label>Card
            <select value={payState.card_id} onChange={e => setPayState(s => ({ ...s, card_id: e.target.value }))}>
              <option value="">-- choose card --</option>
              {cards.map(c => <option key={c.id} value={c.id}>{c.uid} — {c.balance}</option>)}
            </select>
          </label>
          <label>Amount
            <input value={payState.amount} onChange={e => setPayState(s => ({ ...s, amount: e.target.value }))} />
          </label>
          <button type="submit">Pay</button>
        </form>
        <div style={{marginTop:12}}>
          <button onClick={handleGenerateQR} type="button">Generate QR for this payment</button>
          <button onClick={() => setScanning(s => !s)} style={{marginLeft:8}} type="button">{scanning ? 'Stop scan' : 'Scan QR'}</button>
        </div>
        {qrPayload && (
          <div style={{marginTop:12}}>
            <h4>QR</h4>
            <QRGenerate payload={qrPayload} />
          </div>
        )}
        {scanning && (
          <div style={{marginTop:12}}>
            <h4>Scan QR</h4>
            <QRScan onScan={handleScanned} />
          </div>
        )}
      </section>
    </div>
  )
}
