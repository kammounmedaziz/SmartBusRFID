export function apiFetch(path, token, options = {}) {
  const base = import.meta.env.VITE_API_URL || ''
  const url = base + path
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) }
  if (token) headers.Authorization = `Bearer ${token}`
  return fetch(url, { ...options, headers }).then(async (res) => {
    const text = await res.text().catch(() => '')
    const body = text ? JSON.parse(text) : {}
    if (!res.ok) throw body || { message: 'Network error' }
    return body
  })
}
