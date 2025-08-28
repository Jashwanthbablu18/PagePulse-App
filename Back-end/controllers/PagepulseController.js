// server/controllers/PagepulseController.js
import axios from 'axios'
import { generateInsights } from '../services/openaiService.js'

const GOOGLE_BOOKS_BASE = 'https://www.googleapis.com/books/v1/volumes'
const API_KEY = process.env.GOOGLE_BOOKS_API_KEY || ''

const uiAvatar = (name = 'Unknown Author') =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=128&background=1f2a44&color=fff&rounded=true`

const amazonSearch = (title = '', authors = []) => {
  const q = encodeURIComponent(`${title} ${Array.isArray(authors) ? authors.join(' ') : authors}`.trim())
  return `https://www.amazon.in/s?k=${q}`
}

// GET /api/pagepulse/search?title=...
export async function searchController(req, res) {
  try {
    const title = (req.query.title || '').toString().trim()
    if (!title) return res.status(400).json({ error: 'title is required' })

    const resp = await axios.get(GOOGLE_BOOKS_BASE, {
      params: { q: title, key: API_KEY, maxResults: 10 }
    })

    const items = resp.data?.items || []
    const results = items.map((it) => {
      const v = it.volumeInfo || {}
      const thumbnail = v.imageLinks?.thumbnail || v.imageLinks?.smallThumbnail || null
      const authors = Array.isArray(v.authors) ? v.authors : (v.authors ? [v.authors] : [])
      return {
        id: it.id,
        workId: it.id,
        title: v.title || null,
        authors,
        author: authors[0] || null,
        thumbnail,
        coverUrl: thumbnail,
        publishedDate: v.publishedDate || null,
        description: v.description || null,
        averageRating: v.averageRating || null,
        ratingsCount: v.ratingsCount || null
      }
    })
    return res.json({ results })
  } catch (err) {
    console.error('[searchController] error', err?.response?.data || err?.message || err)
    return res.status(500).json({ error: 'Failed to fetch books' })
  }
}

// GET /api/pagepulse/books/:workId
export async function getBookController(req, res) {
  try {
    const workId = req.params.workId
    if (!workId) return res.status(400).json({ error: 'workId is required' })

    const { data: bookData } = await axios.get(`${GOOGLE_BOOKS_BASE}/${workId}`, {
      params: { key: API_KEY }
    })

    const v = bookData?.volumeInfo || {}
    const book = {
      id: bookData?.id || null,
      title: v.title || null,
      authors: Array.isArray(v.authors) ? v.authors : (v.authors ? [v.authors] : []),
      publishedDate: v.publishedDate || null,
      description: v.description || null,
      categories: v.categories || [],
      pageCount: v.pageCount || null,
      publisher: v.publisher || null,
      language: v.language || null,
      previewLink: v.previewLink || null,
      thumbnail: v.imageLinks?.thumbnail || v.imageLinks?.smallThumbnail || null,
      averageRating: v.averageRating || null,
      ratingsCount: v.ratingsCount || null
    }

    const primaryAuthor = book.authors?.[0] || null
    const author = primaryAuthor ? { name: primaryAuthor, photoUrl: uiAvatar(primaryAuthor) } : { name: null, photoUrl: null }

    const buyLinks = [
      book.previewLink ? { label: 'Google Books', href: book.previewLink } : null,
      { label: 'Amazon', href: amazonSearch(book.title, book.authors) }
    ].filter(Boolean)

    // More from author
    let moreFromAuthor = []
    if (primaryAuthor) {
      try {
        const { data: more } = await axios.get(GOOGLE_BOOKS_BASE, {
          params: { q: `inauthor:"${primaryAuthor}"`, key: API_KEY, maxResults: 8 }
        })
        moreFromAuthor = (more.items || [])
          .filter(it => it.id !== book.id)
          .map(it => ({
            title: it.volumeInfo?.title || 'Untitled',
            workId: it.id,
            coverUrl: it.volumeInfo?.imageLinks?.thumbnail || it.volumeInfo?.imageLinks?.smallThumbnail || null
          })).filter(x => x.workId && x.title)
      } catch (err) {
        console.warn('[getBookController] moreFromAuthor fetch failed', err?.response?.data || err?.message || err)
        moreFromAuthor = []
      }
    }

    // Try AI generation (best-effort). If it fails we include ai_error but still return book.
    let ai = null
    let ai_error = null
    try {
      ai = await generateInsights({ title: book.title, author: primaryAuthor, description: book.description || '' })
    } catch (err) {
      ai_error = err?.message || 'AI generation failed'
      console.error('[getBookController] AI error', err?.response?.data || err?.message || err)
    }

    return res.json({ book, author, buyLinks, moreFromAuthor, ai, ai_error })
  } catch (err) {
    console.error('[getBookController] error', err?.response?.data || err?.message || err)
    return res.status(500).json({ error: 'Failed to fetch book details' })
  }
}

// POST /api/pagepulse/insights
export async function insightsController(req, res) {
  try {
    const { title, author, description } = req.body || {}
    if (!title) return res.status(400).json({ error: 'title is required for insights' })
    const ai = await generateInsights({ title, author, description })
    return res.json(ai || { summary: null, insights: [], reviews: [] })
  } catch (err) {
    console.error('[insightsController] error', err?.response?.data || err?.message || err)
    return res.status(500).json({ error: 'Failed to generate insights' })
  }
}
