// server.js
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import axios from 'axios'
import path from 'path'
import { fileURLToPath } from 'url'

// Import OpenAI service
import { generateInsights } from './services/openaiService.js'

const app = express()
app.use(cors())
app.use(express.json({ limit: '1mb' }))

// ---- CONFIG ----
const PORT = process.env.PORT || 8080
const GOOGLE_BOOKS_API_KEY = process.env.GOOGLE_BOOKS_API_KEY || ''
const GOOGLE_BOOKS_BASE = 'https://www.googleapis.com/books/v1/volumes'

// File paths
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const distPath = path.resolve(__dirname, '../Front-end/dist')

// Helpers
const uiAvatar = (name = 'Unknown Author') =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=128&background=1f2a44&color=fff&rounded=true`

const amazonSearch = (title = '', authors = []) => {
  const q = encodeURIComponent(`${title} ${authors.join(' ')}`.trim())
  return `https://www.amazon.in/s?k=${q}`
}

// ---- HEALTH ----
app.get('/api/health', (_req, res) =>
  res.json({ ok: true, name: 'PagePulse API', status: 'running' })
)

// ---- SEARCH ----
app.get('/api/pagepulse/search', async (req, res) => {
  try {
    const { title } = req.query
    if (!title) return res.status(400).json({ error: 'Missing title query param' })

    const { data } = await axios.get(GOOGLE_BOOKS_BASE, {
      params: { q: title, key: GOOGLE_BOOKS_API_KEY, maxResults: 10 }
    })

    const results =
      data.items?.map((item) => {
        const v = item.volumeInfo || {}
        return {
          title: v.title,
          author: (v.authors && v.authors[0]) || null,
          workId: item.id,
          isbn: v.industryIdentifiers?.[0]?.identifier || null,
          coverUrl: v.imageLinks?.thumbnail || null,
          averageRating: v.averageRating || null,
          ratingsCount: v.ratingsCount || null
        }
      }) || []

    res.json({ results })
  } catch (err) {
    console.error('[search]', err.message || err)
    res.status(500).json({ error: 'Failed to fetch books from Google Books API' })
  }
})

// ---- BOOK DETAILS ----
app.get('/api/pagepulse/books/:workId', async (req, res) => {
  try {
    const { workId } = req.params
    if (!workId) return res.status(400).json({ error: 'Missing workId param' })

    const { data: bookData } = await axios.get(`${GOOGLE_BOOKS_BASE}/${workId}`, {
      params: { key: GOOGLE_BOOKS_API_KEY }
    })

    const v = bookData.volumeInfo || {}
    const book = {
      id: bookData.id,
      title: v.title || null,
      authors: v.authors || [],
      publishedDate: v.publishedDate || null,
      description: v.description || null,
      categories: v.categories || [],
      pageCount: v.pageCount || null,
      publisher: v.publisher || null,
      language: v.language || null,
      previewLink: v.previewLink || null,
      thumbnail: v.imageLinks?.thumbnail || null,
      averageRating: v.averageRating || null,
      ratingsCount: v.ratingsCount || null
    }

    const primaryAuthor = book.authors[0] || null
    const author = primaryAuthor
      ? { name: primaryAuthor, photoUrl: uiAvatar(primaryAuthor) }
      : { name: null, photoUrl: null }

    const buyLinks = [
      book.previewLink ? { label: 'Google Books', href: book.previewLink } : null,
      { label: 'Amazon', href: amazonSearch(book.title, book.authors) }
    ].filter(Boolean)

    let moreFromAuthor = []
    if (primaryAuthor) {
      try {
        const { data: more } = await axios.get(GOOGLE_BOOKS_BASE, {
          params: { q: `inauthor:"${primaryAuthor}"`, key: GOOGLE_BOOKS_API_KEY, maxResults: 8 }
        })
        moreFromAuthor =
          more.items?.filter((it) => it.id !== book.id).map((it) => ({
            title: it.volumeInfo?.title || 'Untitled',
            workId: it.id,
            coverUrl: it.volumeInfo?.imageLinks?.thumbnail || null
          })) || []
      } catch {
        moreFromAuthor = []
      }
    }

    res.json({ book, author, buyLinks, moreFromAuthor })
  } catch (err) {
    console.error('[book details]', err.message || err)
    res.status(500).json({ error: 'Failed to fetch book details' })
  }
})

// ---- AI INSIGHTS ----
app.post('/api/pagepulse/insights', async (req, res) => {
  try {
    const { title, author, description } = req.body || {}
    if (!title) return res.status(400).json({ error: 'title is required' })

    const ai = await generateInsights({ title, author, description })
    res.json(ai || { summary: null, insights: [] })
  } catch (err) {
    console.error('[insights]', err.message || err)
    res.status(500).json({ error: 'Failed to generate insights' })
  }
})

// ---- SERVE FRONTEND ----
app.use(express.static(distPath))

// React Router fallback
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(distPath, 'index.html'))
  }
})

app.listen(PORT, () => {
  console.log(`📂 Serving frontend from: ${distPath}`)
  console.log(`✅ PagePulse running on http://localhost:${PORT}`)
})
