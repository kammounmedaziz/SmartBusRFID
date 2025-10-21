const BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

function getAuthHeader(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, { method = 'GET', body, token, headers = {} } = {}) {
  const opts = { method, headers: { 'Content-Type': 'application/json', ...headers } };
  if (body) opts.body = JSON.stringify(body);
  if (token) opts.headers = { ...opts.headers, ...getAuthHeader(token) };
  const res = await fetch(`${BASE}${path}`, opts);
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch (e) { data = text; }
  if (!res.ok) {
    const err = new Error(data?.error || data?.message || res.statusText || 'Request failed');
    err.status = res.status;
    err.payload = data;
    throw err;
  }
  return data;
}

// Auth
export async function login(email, password) {
  return request('/auth/login', { method: 'POST', body: { email, password } });
}

export async function register({ name, email, password, role = 'user' }) {
  return request('/auth/register', { method: 'POST', body: { name, email, password, role } });
}

export async function me(token) {
  return request('/auth/me', { method: 'GET', token });
}

// Cards
export async function getMyCards(token) {
  return request('/api/cards/me/cards', { method: 'GET', token });
}

export async function createCardForMe(token, { uid, balance = 0 }) {
  return request('/api/cards/me', { method: 'POST', token, body: { uid, balance } });
}

export async function payWithMyCard(token, { card_id, amount }) {
  return request('/api/cards/me/pay', { method: 'POST', token, body: { card_id, amount } });
}

export async function getMyTransactions(token) {
  return request('/api/cards/me/transactions', { method: 'GET', token });
}

// Admin/operator actions
export async function rechargeCard(token, { uid, amount }) {
  return request('/api/cards/recharge', { method: 'POST', token, body: { uid, amount } });
}

export async function payFare(token, { uid, fare }) {
  return request('/api/cards/pay', { method: 'POST', token, body: { uid, fare } });
}

export async function createCard(token, { uid, user_id, balance = 0, status = 'active' }) {
  return request('/api/cards', { method: 'POST', token, body: { uid, user_id, balance, status } });
}

export async function getCards(token) {
  return request('/api/cards', { method: 'GET', token });
}

export async function getTransactions(token) {
  return request('/api/cards/transactions', { method: 'GET', token });
}

export default {
  login,
  register,
  me,
  getMyCards,
  createCardForMe,
  payWithMyCard,
  getMyTransactions,
  rechargeCard,
  payFare,
  createCard,
  getCards,
  getTransactions,
};
