// filepath: frontend/src/utils/api.js
// ...existing code...
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

export async function apiGet(path) {
  const res = await fetch(`${API_BASE}/${path}`.replace(/\/+/g, '/'), {
    credentials: 'include', // jika pakai session/cookies dari Laravel
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}
// ...existing code...