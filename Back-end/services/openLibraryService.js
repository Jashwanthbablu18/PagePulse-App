import axios from 'axios'
import { getGoodreadsRatingsByIsbn } from './goodreadService.js'

const OL = 'https://openlibrary.org'
const COVERS = 'https://covers.openlibrary.org'

function coverFromEdition(olid) {
  return olid ? `${COVERS}/b/olid/${olid}-L.jpg` : null
}

function authorPhotoFromKey(authorKey) {
  // authorKey looks like '/authors/OLxxxxA' — convert to OLID used by covers API
  const olid = (authorKey || '').replace('/authors/', '')
  return olid ? `${COVERS}/a/olid/${olid}-M.jpg` : null
}

async function fetchJson(path) {
  // path must start with slash, e.g. '/works/OL123W'
  const { data } = await axios.get(`${OL}${path}.json`)
  return data
}

/**
 * Search function used by /search endpoint
 * returns array of simplified results
 */
export async function searchBooks(title) {
  try {
    const { data } = await axios.get(`${OL}/search.json`, { params: { title, limit: 10 } })
    const docs = data?.docs || []
    return docs.map(d => ({
      title: d.title,
      author: d.author_name?.[0] || null,
      workId: (d.key || '').replace('/works/', ''),
      edition_olid: d.cover_edition_key || d.edition_key?.[0] || null,
      isbn: d.isbn?.[0] || null,
      coverUrl: coverFromEdition(d.cover_edition_key || d.edition_key?.[0] || null)
    })).filter(x => x.workId)
  } catch (err) {
    console.error('[openLibraryService.searchBooks] error', err?.message || err)
    return []
  }
}

/**
 * Returns a bundle with book, author, languages, goodreads, buyLinks, moreFromAuthor
 */
export async function getBookBundleByWorkId(workId) {
  try {
    const work = await fetchJson(`/works/${workId}`)

    // Representative edition (best effort)
    let edition = null
    try {
      const edRes = await axios.get(`${OL}/works/${workId}/editions.json?limit=1`)
      edition = edRes.data?.entries?.[0] || null
    } catch (err) {
      edition = null
    }

    // Author
    const authorKey = work?.authors?.[0]?.author?.key
    let author = {}
    if (authorKey) {
      try {
        const a = await fetchJson(authorKey)
        author = {
          key: authorKey.replace('/authors/', ''),
          name: a?.name || null,
          photoUrl: authorPhotoFromKey(authorKey)
        }
      } catch {
        author = { key: authorKey.replace('/authors/', ''), name: null, photoUrl: null }
      }
    }

    // Languages
    const languages = []
    if (work?.languages?.length) {
      for (const ref of work.languages) {
        try {
          const lang = await fetchJson(ref.key)
          if (lang?.name) languages.push(lang.name)
        } catch { /* ignore individual failures */ }
      }
    }

    const original_language = languages[0] || null

    const book = {
      title: work?.title || null,
      description: typeof work?.description === 'string' ? work.description : work?.description?.value || null,
      publish_date: edition?.publish_date || work?.created?.value?.slice(0, 10) || null,
      publisher: edition?.publishers?.[0] || null,
      coverUrl: coverFromEdition(edition?.covers?.[0] || edition?.cover_edition_key || edition?.key?.replace('/books/', '') || null),
      original_language
    }

    // Goodreads rating via ISBN (if available)
    let goodreads = null
    const isbn = edition?.isbn_13?.[0] || edition?.isbn_10?.[0] || null
    if (isbn) {
      try {
        goodreads = await getGoodreadsRatingsByIsbn(isbn)
      } catch { goodreads = null }
    }

    // Buy links
    const q = encodeURIComponent(`${book.title || ''} ${author?.name || ''}`.trim())
    const buyLinks = [
      { label: 'Amazon', href: `https://www.amazon.in/s?k=${q}` },
      { label: 'Open Library', href: `${OL}/works/${workId}` }
    ]

    // More from author
    let moreFromAuthor = []
    if (author?.name) {
      try {
        const { data } = await axios.get(`${OL}/search.json`, { params: { author: author.name, limit: 8 } })
        moreFromAuthor = (data?.docs || []).map(d => ({
          title: d.title,
          workId: (d.key || '').replace('/works/', ''),
          coverUrl: coverFromEdition(d.cover_edition_key || d.edition_key?.[0] || null)
        })).filter(x => x.workId && x.title)
      } catch { moreFromAuthor = [] }
    }

    return { book, author, languages, goodreads, buyLinks, moreFromAuthor }
  } catch (err) {
    console.error('[openLibraryService.getBookBundleByWorkId] error', err?.message || err)
    throw err
  }
}
