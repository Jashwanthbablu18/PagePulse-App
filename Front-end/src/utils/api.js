import axios from 'axios'

const DEFAULT_BASE = 'http://localhost:8080'
const API_BASE = import.meta.env.VITE_API_BASE || DEFAULT_BASE

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000
})

export async function searchBooks(title) {
  const res = await api.get('/api/pagepulse/search', { params: { title } })
  return res.data
}

export async function getBook(workId) {
  const res = await api.get(`/api/pagepulse/books/${encodeURIComponent(workId)}`)
  return res.data
}

export async function getInsights(payload) {
  const res = await api.post('/api/pagepulse/insights', payload)
  return res.data
}

export default { searchBooks, getBook, getInsights }
