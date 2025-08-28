// server.js
// Entry point — load env immediately (side-effect import) before any module that reads process.env
import 'dotenv/config'

import express from 'express'
import cors from 'cors'
import axios from 'axios'

// import the OpenAI helper AFTER env is loaded
import { generateInsights } from './services/openaiService.js'

const app = express()
app.use(cors())
app.use(express.json({ limit: '1mb' }))

const PORT = process.env.PORT || 8080
const GOOGLE_BOOKS_API_KEY = process.env.GOOGLE_BOOKS_API_KEY || ''
const GOOGLE_BOOKS_BASE = 'https://www.googleapis.com/books/v1/volumes'

// Small helpers
const uiAvatar = (name = 'Unknown Author') =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=128&background=1f2a44&color=fff&rounded=true`

const amazonSearch = (title = '', authors = []) => {
  const q = encodeURIComponent(`${title} ${authors.join(' ')}`.trim())
  return `https://www.amazon.in/s?k=${q}`
}

// ---- HEALTH ----
app.get('/', (_req, res) =>
  res.json({ ok: true, name: 'PagePulse API', tagline: 'Your next read, one pulse away' })
)

// ---- SEARCH ----
// GET /api/pagepulse/search?title=...
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
          edition_olid: null,
          isbn: (v.industryIdentifiers && v.industryIdentifiers[0]?.identifier) || null,
          coverUrl: v.imageLinks?.thumbnail || null,
          averageRating: v.averageRating || null,
          ratingsCount: v.ratingsCount || null
        }
      }) || []

    res.json({ results })
  } catch (err) {
    console.error('[search]', err?.message || err)
    res.status(500).json({ error: 'Failed to fetch books from Google Books API' })
  }
})

// ---- BOOK DETAILS (ENRICHED) ----
// GET /api/pagepulse/books/:workId
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
          more.items
            ?.filter((it) => it.id !== book.id)
            .map((it) => ({
              title: it.volumeInfo?.title || 'Untitled',
              workId: it.id,
              coverUrl: it.volumeInfo?.imageLinks?.thumbnail || null
            }))
            .filter((x) => x.workId && x.title) || []
      } catch {
        moreFromAuthor = []
      }
    }

    res.json({ book, author, buyLinks, moreFromAuthor })
  } catch (err) {
    console.error('[book details]', err?.message || err)
    res.status(500).json({ error: 'Failed to fetch book details' })
  }
})

// ---- AI INSIGHTS ----
// POST /api/pagepulse/insights  { title, author, description }
app.post('/api/pagepulse/insights', async (req, res) => {
  try {
    const { title, author, description } = req.body || {}
    if (!title) return res.status(400).json({ error: 'title is required for insights' })

    const ai = await generateInsights({ title, author, description })
    res.json(ai || { summary: null, insights: [] })
  } catch (err) {
    console.error('[insights]', err?.message || err)
    res.status(500).json({ error: 'Failed to generate insights' })
  }
})

app.listen(PORT, () => {
  console.log(`PagePulse API running on http://localhost:${PORT}`)
})
