export function apiFetch(path, token, options = {}) {
  // Default to localhost backend when VITE_API_URL isn't provided in the env.
  const base = import.meta.env.VITE_API_URL || 'http://localhost:5000'
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
