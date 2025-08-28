import { Router } from 'express'
import { searchController, getBookController, insightsController } from '../controllers/PagepulseController.js'

const router = Router()

// GET /api/pagepulse/search?title=...
router.get('/search', searchController)

// GET /api/pagepulse/books/:workId
router.get('/books/:workId', getBookController)

// POST /api/pagepulse/insights
router.post('/insights', insightsController)

export default router
