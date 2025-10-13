import React, { useEffect, useState } from 'react'
import QRGenerate from '../components/QRGenerate'
import { apiFetch } from '../api'

export default function ClientDashboard({ token, me }) {
  const [cards, setCards] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCard, setActiveCard] = useState(null)
  const [newUid, setNewUid] = useState('')
  const [newCardNumber, setNewCardNumber] = useState('')
  const [newBalance, setNewBalance] = useState(0)

  useEffect(() => {
    if (!token) return
    setLoading(true)
    apiFetch('/api/cards/me/cards', token).then(d => {
      const cs = d.data || []
      setCards(cs)
      setActiveCard(cs[0] || null)
    }).catch(() => setCards([])).finally(() => setLoading(false))

    apiFetch('/api/cards/me/transactions', token).then(d => setTransactions(d.data || [])).catch(() => setTransactions([]))
  }, [token])

  if (!me) return <div className="page">Please sign in</div>

  async function createCard(e) {
    e.preventDefault()
    try {
      await apiFetch('/api/cards/me', token, { method: 'POST', body: JSON.stringify({ uid: newUid, card_number: newCardNumber, balance: Number(newBalance) }) })
      setNewUid('')
      setNewCardNumber('')
      setNewBalance(0)
      // refresh lists
      const d = await apiFetch('/api/cards/me/cards', token)
      setCards(d.data || [])
      setActiveCard((d.data || [])[0] || null)
      const t = await apiFetch('/api/cards/me/transactions', token)
      setTransactions(t.data || [])
    } catch (err) {
      alert('Failed to create card: ' + (err.message || JSON.stringify(err)))
    }
  }

  return (
    <div className="page client-dashboard">
      <div className="dashboard-top">
        <div className="balance-card">
          <h3>Your balance</h3>
          {loading ? <div>Loading...</div> : (
            activeCard ? (
              <div className="balance-amount">{activeCard.balance}</div>
            ) : (
              <div>No cards yet. Add a card to start.</div>
            )
          )}
          <div className="card-selector">
            <label>Selected card:</label>
            <select value={activeCard?.id || ''} onChange={e => setActiveCard(cards.find(c => String(c.id) === String(e.target.value)))}>
              <option value="">-- choose card --</option>
              {cards.map(c => <option key={c.id} value={c.id}>{c.uid} — {c.balance}</option>)}
            </select>
          </div>
        </div>

        <div className="quick-actions">
          <h4>Quick actions</h4>
          <div className="actions">
            <button onClick={() => alert('Top up UI coming')}>Top-up</button>
            <button onClick={() => alert('Pay UI coming')}>Pay</button>
            {activeCard && <QRGenerate payload={{ card_id: activeCard.id, uid: activeCard.uid, amount: 0 }} />}
          </div>
        </div>
      </div>

      <div className="transactions-section">
        <h4>Recent transactions</h4>
        <div style={{margin:'12px 0'}}>
          <h4>Add a new card</h4>
          <form onSubmit={createCard} className="form-inline">
            <input placeholder="UID" value={newUid} onChange={e=>setNewUid(e.target.value)} />
            <input placeholder="Card #" value={newCardNumber} onChange={e=>setNewCardNumber(e.target.value)} />
            <input placeholder="Balance" type="number" value={newBalance} onChange={e=>setNewBalance(e.target.value)} />
            <button type="submit">Add card</button>
          </form>
        </div>
        <div className="transactions-list">
          {transactions.length === 0 ? <div>No recent transactions</div> : (
            <table>
              <thead>
                <tr><th>Date</th><th>Type</th><th>Amount</th><th>Card</th></tr>
              </thead>
              <tbody>
                {transactions.map(t => (
                  <tr key={t.id}>
                    <td>{new Date(t.timestamp).toLocaleString()}</td>
                    <td>{t.type}</td>
                    <td>{t.amount}</td>
                    <td>{t.card_uid}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
