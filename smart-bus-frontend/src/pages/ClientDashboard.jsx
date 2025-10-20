import React, { useEffect, useState } from 'react'
import QRGenerate from '../components/client-dashboard/QRGenerate'
import { apiFetch } from '../api.js'

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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-slate-900 to-black text-slate-200 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          <div className="md:col-span-2 bg-gradient-to-br from-slate-800/40 to-slate-900/40 p-6 rounded-2xl border border-white/5">
            <h3 className="text-lg font-semibold text-primary">Your balance</h3>
            {loading ? <div className="mt-4">Loading...</div> : (
              activeCard ? (
                <div className="mt-4 text-3xl font-extrabold text-white">${activeCard.balance}</div>
              ) : (
                <div className="mt-4">No cards yet. Add a card to start.</div>
              )
            )}

            <div className="mt-4">
              <label className="block text-sm text-slate-400">Selected card</label>
              <select className="mt-2 p-2 rounded-md bg-transparent border border-white/6 w-full" value={activeCard?.id || ''} onChange={e => setActiveCard(cards.find(c => String(c.id) === String(e.target.value)))}>
                <option value="">-- choose card --</option>
                {cards.map(c => <option key={c.id} value={c.id}>{c.uid} — ${c.balance}</option>)}
              </select>
            </div>
          </div>

          <aside className="bg-gradient-to-br from-slate-800/30 to-slate-900/30 p-4 rounded-2xl border border-white/5">
            <h4 className="text-sm font-semibold text-primary mb-3">Quick actions</h4>
            <div className="flex flex-col gap-3">
              <button className="py-2 px-3 rounded-md bg-gradient-to-r from-primary to-primary2 text-black font-semibold">Top-up</button>
              <button className="py-2 px-3 rounded-md border border-white/6">Pay</button>
              {activeCard && <div className="mt-2"><QRGenerate payload={{ card_id: activeCard.id, uid: activeCard.uid, amount: 0 }} /></div>}
            </div>
          </aside>
        </div>

        <div className="bg-gradient-to-br from-slate-800/30 to-slate-900/30 p-6 rounded-2xl border border-white/5">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-white">Recent transactions</h4>
            <div className="w-96">
              <form onSubmit={createCard} className="flex gap-2">
                <input className="flex-1 p-2 rounded-md bg-transparent border border-white/6" placeholder="UID" value={newUid} onChange={e=>setNewUid(e.target.value)} />
                <input className="w-36 p-2 rounded-md bg-transparent border border-white/6" placeholder="Card #" value={newCardNumber} onChange={e=>setNewCardNumber(e.target.value)} />
                <input className="w-28 p-2 rounded-md bg-transparent border border-white/6" placeholder="Balance" type="number" value={newBalance} onChange={e=>setNewBalance(e.target.value)} />
                <button type="submit" className="px-3 py-2 rounded-md bg-primary text-black font-semibold">Add card</button>
              </form>
            </div>
          </div>

          <div className="mt-4">
            {transactions.length === 0 ? <div className="text-slate-400">No recent transactions</div> : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-400 border-b border-white/5"><th className="py-2">Date</th><th>Type</th><th>Amount</th><th>Card</th></tr>
                  </thead>
                  <tbody>
                    {transactions.map(t => (
                      <tr key={t.id} className="border-b border-white/3">
                        <td className="py-2">{new Date(t.timestamp).toLocaleString()}</td>
                        <td>{t.type}</td>
                        <td>{t.amount}</td>
                        <td>{t.card_uid}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}


