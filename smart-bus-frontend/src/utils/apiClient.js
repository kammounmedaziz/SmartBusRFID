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

export async function loginWithFace(imageBase64) {
  return request('/auth/login', { method: 'POST', body: { loginMethod: 'face', image: imageBase64 } });
}

export async function register({ name, email, password, face_image }) {
  // Backend always assigns 'user' role to new registrations
  return request('/auth/register', { method: 'POST', body: { name, email, password, face_image } });
}

export async function me(token) {
  return request('/auth/me', { method: 'GET', token });
}

export async function enableFaceAuth(token, imageBase64) {
  return request('/auth/me/settings/face', { method: 'PUT', token, body: { action: 'enable', image: imageBase64 } });
}

export async function disableFaceAuth(token) {
  return request('/auth/me/settings/face', { method: 'PUT', token, body: { action: 'disable' } });
}

// Cards
export async function getMyCards(token) {
  return request('/api/cards/my-cards', { method: 'GET', token });
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

export async function rechargeMyCard(token, { card_id, amount }) {
  return request('/api/cards/me/recharge', { method: 'POST', token, body: { card_id, amount } });
}

export async function deleteMyCard(token, id) {
  return request(`/api/cards/me/${id}`, { method: 'DELETE', token });
}

export async function scanCardWithRFID(token, timeout = 30000) {
  return request(`/api/cards/me/scan-rfid?timeout=${timeout}`, { method: 'POST', token });
}

// Admin/operator actions
export async function rechargeCard(token, { uid, amount }) {
  return request('/api/cards/recharge', { method: 'POST', token, body: { uid, amount } });
}

export async function testCard(token, cardUid) {
  return request('/api/controller/test-card', { method: 'POST', token, body: { card_uid: cardUid } });
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
  loginWithFace,
  register,
  me,
  enableFaceAuth,
  disableFaceAuth,
  getMyCards,
  createCardForMe,
  payWithMyCard,
  getMyTransactions,
  rechargeMyCard,
  deleteMyCard,
  scanCardWithRFID,
  rechargeCard,
  createCard,
  getCards,
  getTransactions,
  testCard,
};
