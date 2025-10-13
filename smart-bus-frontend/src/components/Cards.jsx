import React, { useEffect, useState } from 'react'
import RechargeForm from './RechargeForm'
import PayForm from './PayForm'
import CreateCard from './CreateCard'
import Transactions from './Transactions'
import { apiFetch } from '../api'

export default function Cards({ token }) {
  const [cards, setCards] = useState([])
  const [transactions, setTransactions] = useState([])

  async function load() {
    try {
      const data = await apiFetch('/api/cards', token)
      setCards(data)
    } catch (err) {
      // ignore for now; could show UI error
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

  return (
    <div className="cards">
      <section>
        <h3>Cards</h3>
        <ul>
          {cards.map((c) => (
            <li key={c.uid}>{c.uid} — {c.card_number} — ${c.balance}</li>
          ))}
        </ul>
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
