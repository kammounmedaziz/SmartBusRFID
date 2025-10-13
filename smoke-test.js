// Quick smoke test script for local API
import fetch from 'node-fetch'
import dotenv from 'dotenv'
dotenv.config()

const API = process.env.API_BASE || 'http://localhost:5000'

async function run(){
  console.log('Starting smoke tests against', API)
  // 1) Ensure admin user exists: POST /api/users with role 'admin' (requires admin) - we don't have admin token yet.
  // We'll try login as admin first using env ADMIN_EMAIL / ADMIN_PASSWORD, if present.
  const adminEmail = process.env.ADMIN_EMAIL
  const adminPass = process.env.ADMIN_PASSWORD
  let adminToken = null
  if (adminEmail && adminPass) {
    const r = await fetch(`${API}/auth/login`, { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ email: adminEmail, password: adminPass }) })
    if (r.ok) {
      const j = await r.json(); adminToken = j.token; console.log('Admin login OK')
    } else {
      console.log('Admin login failed; status', r.status)
    }
  } else {
    console.log('No ADMIN_EMAIL/ADMIN_PASSWORD in env; skipping admin creation')
  }

  // 2) Create client user via admin if we have adminToken
  const clientEmail = 'client@example.test'
  const clientPass = 'clientpass'
  let clientId = null
  if (adminToken){
    const r = await fetch(`${API}/api/users`, { method:'POST', headers:{ 'Content-Type':'application/json', Authorization: `Bearer ${adminToken}` }, body: JSON.stringify({ name:'Client', email: clientEmail, password: clientPass, role:'user' }) })
    const j = await r.json(); console.log('Create user:', j); if (r.ok) clientId = j.id
  } else {
    console.log('No admin token; skipping create user')
  }

  // 3) Login as client
  const rLogin = await fetch(`${API}/auth/login`, { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ email: clientEmail, password: clientPass }) })
  if (!rLogin.ok) return console.log('Client login failed', await rLogin.text())
  const jLogin = await rLogin.json(); const token = jLogin.token
  console.log('Client login token len', token?.length)

  // 4) Create card for client via admin
  if (adminToken && clientId){
    const r = await fetch(`${API}/api/cards`, { method:'POST', headers:{ 'Content-Type':'application/json', Authorization: `Bearer ${adminToken}` }, body: JSON.stringify({ uid: 'card-' + Date.now(), user_id: clientId, balance: 50 }) })
    console.log('Create card response status', r.status)
  } else {
    console.log('Skipping create card; no adminToken or clientId')
  }

  // 5) Client fetches /auth/me
  const rMe = await fetch(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
  console.log('/auth/me status', rMe.status, await rMe.json())

  // 6) Client lists their cards
  const rCards = await fetch(`${API}/api/cards/me/cards`, { headers: { Authorization: `Bearer ${token}` } })
  console.log('/api/cards/me/cards status', rCards.status, await rCards.json())

  // 7) Client attempts a pay (if they have card)
  const cardsJson = await rCards.json()
  const cardId = cardsJson.data && cardsJson.data[0] && cardsJson.data[0].id
  if (cardId){
    const rPay = await fetch(`${API}/api/cards/me/pay`, { method:'POST', headers: { 'Content-Type':'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ card_id: cardId, amount: 2.5 }) })
    console.log('/api/cards/me/pay status', rPay.status, await rPay.json())
  } else console.log('No cards for client; skipping pay')
}

run().catch(e => { console.error(e); process.exit(1) })
