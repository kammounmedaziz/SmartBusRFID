import React, { useEffect, useState } from 'react'
import RechargeForm from './RechargeForm'
import PayForm from './PayForm'
import CreateCard from './CreateCard'
import Transactions from './Transactions'
import { apiFetch } from '../api'

export default function Cards({ token }) {
  const [cards, setCards] = useState([])
  const [transactions, setTransactions] = useState([])
  const [filter, setFilter] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 8
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const data = await apiFetch('/api/cards', token)
      setCards(data)
    } catch (err) {
      setError(err.message || 'Failed to load cards')
    } finally {
      setLoading(false)
    }
  }

  async function loadTx() {
    try {
      const data = await apiFetch('/api/cards/transactions', token)
      setTransactions(data)
    } catch (err) {
      // ignore for now
    }
  }

  useEffect(() => {
    load()
    loadTx()
  }, [])

  const filtered = cards.filter(c => !filter || c.uid.includes(filter) || (c.card_number||'').includes(filter))
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const pageItems = filtered.slice((page-1)*pageSize, page*pageSize)

  return (
    <div className="cards">
      <section>
        <h3>Cards</h3>
        <div className="controls">
          <input placeholder="Filter by uid/card#" value={filter} onChange={e=>{setFilter(e.target.value); setPage(1)}} />
        </div>
        {loading ? <p>Loading…</p> : (
          <ul>
            {pageItems.map((c) => (
              <li key={c.uid} className="card-row">{c.uid} — {c.card_number} — ${c.balance}</li>
            ))}
          </ul>
        )}
        {error && <p className="error">{error}</p>}
        <div className="pager">
          <button disabled={page<=1} onClick={()=>setPage(p=>Math.max(1,p-1))}>Prev</button>
          <span>Page {page} / {totalPages}</span>
          <button disabled={page>=totalPages} onClick={()=>setPage(p=>Math.min(totalPages,p+1))}>Next</button>
        </div>
      </section>

      <section>
        <CreateCard token={token} onDone={() => { load(); loadTx() }} />
        <RechargeForm token={token} onDone={() => { load(); loadTx() }} />
        <PayForm token={token} onDone={() => { load(); loadTx() }} />
      </section>

      <section>
        <Transactions transactions={transactions} />
      </section>
    </div>
  )
}
