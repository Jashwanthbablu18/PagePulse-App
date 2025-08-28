import axios from 'axios'

const GR_COUNTS = 'https://www.goodreads.com/book/review_counts.json'

/**
 * Returns { average_rating, ratings_count, work_ratings_count } or null
 * Goodreads key is optional — function returns null if not configured.
 */
export async function getGoodreadsRatingsByIsbn(isbn) {
  try {
    const key = process.env.GOODREADS_KEY
    if (!key || !isbn) return null
    const { data } = await axios.get(GR_COUNTS, { params: { key, isbns: isbn } })
    const b = data?.books?.[0]
    if (!b) return null
    return {
      average_rating: Number(b.average_rating) || null,
      ratings_count: b.ratings_count || null,
      work_ratings_count: b.work_ratings_count || null
    }
  } catch (err) {
    console.warn('[goodreadsService] error', err?.message || err)
    return null
  }
}
