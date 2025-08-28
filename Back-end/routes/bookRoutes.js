// routes/bookRoutes.js
import express from "express";
import { searchBooks } from "../services/openLibraryService.js";
import { generateInsights } from "../services/openaiService.js";

const router = express.Router();

router.get("/search", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: "Query missing" });

    // Fetch book data
    const books = await searchBooks(q);

    // Add AI insights to first book (best-effort, non-fatal)
    if (books.length > 0) {
      try {
        const b = books[0];
        const ai = await generateInsights({
          title: b.title,
          author: b.author || '',
          description: b.description || ''
        });
        b.aiInsights = ai;
      } catch (aiErr) {
        console.warn("AI insights failed for /search route:", aiErr?.message || aiErr);
      }
    }

    res.json(books);
  } catch (err) {
    console.error("❌ Error in /search route:", err?.message || err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
