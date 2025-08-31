// server.js
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import axios from 'axios'
import path from 'path'
import { fileURLToPath } from 'url'
import { generateInsights } from './services/openaiService.js'

const app = express()
app.use(cors())
app.use(express.json())

// Config
const PORT = process.env.PORT || 8080
const GOOGLE_BOOKS_API_KEY = process.env.GOOGLE_BOOKS_API_KEY || ''
const GOOGLE_BOOKS_BASE = 'https://www.googleapis.com/books/v1/volumes'

// File paths
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const distPath = path.join(__dirname, '../Front-end/dist')

// ---- API ROUTES ----
app.get('/api/health', (req, res) => {
  res.json({ ok: true })
})

app.get('/api/pagepulse/search', async (req, res) => {
  try {
    const { title } = req.query
    if (!title) return res.status(400).json({ error: 'Missing title' })

    const { data } = await axios.get(GOOGLE_BOOKS_BASE, {
      params: { q: title, key: GOOGLE_BOOKS_API_KEY, maxResults: 10 }
    })

    const results = data.items?.map((item) => {
      const v = item.volumeInfo || {}
      return {
        title: v.title,
        author: v.authors?.[0] || null,
        workId: item.id,
        coverUrl: v.imageLinks?.thumbnail || null
      }
    }) || []

    res.json({ results })
  } catch (err) {
    console.error('[search]', err.message)
    res.status(500).json({ error: 'Failed to fetch books' })
  }
})

app.get('/api/pagepulse/books/:workId', async (req, res) => {
  try {
    const { workId } = req.params
    const { data } = await axios.get(`${GOOGLE_BOOKS_BASE}/${workId}`, {
      params: { key: GOOGLE_BOOKS_API_KEY }
    })

    const v = data.volumeInfo || {}
    res.json({
      id: data.id,
      title: v.title,
      authors: v.authors || [],
      description: v.description,
      thumbnail: v.imageLinks?.thumbnail || null
    })
  } catch (err) {
    console.error('[book details]', err.message)
    res.status(500).json({ error: 'Failed to fetch details' })
  }
})

app.post('/api/pagepulse/insights', async (req, res) => {
  try {
    const { title, author, description } = req.body
    if (!title) return res.status(400).json({ error: 'title required' })

    const ai = await generateInsights({ title, author, description })
    res.json(ai)
  } catch (err) {
    console.error('[insights]', err.message)
    res.status(500).json({ error: 'Failed to generate insights' })
  }
})

// ---- FRONTEND STATIC ----
app.use(express.static(distPath))

// ⚡ Catch-all: send index.html for ANY non-API request
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(distPath, 'index.html'))
  }
})

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`)
})
