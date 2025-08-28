// src/components/SearchBar.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { searchBooks } from '../utils/api'

export default function SearchBar() {
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function onSubmit(e) {
    e.preventDefault()
    if (!q.trim()) return
    setLoading(true)
    try {
      const res = await searchBooks(q)
      const first = res?.results?.[0]
      const targetId = first?.id || first?.workId
      if (targetId) {
        navigate(`/book/${encodeURIComponent(targetId)}`)
      } else {
        console.warn('No results to navigate')
      }
    } catch (err) {
      console.warn('search error', err?.message || err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      className="d-flex gap-2"
      onSubmit={onSubmit}
      style={{ width: '100%', maxWidth: 720 }}
    >
      <input
        className="form-control form-control-lg"
        placeholder="Search a book…"
        value={q}
        onChange={e => setQ(e.target.value)}
      />
      <button className="btn btn-lg btn-primary px-4" disabled={loading}>
        {loading ? 'Searching...' : 'Search'}
      </button>
    </form>
  )
}
