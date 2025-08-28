// server/services/openaiService.js
import axios from 'axios'

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || ''
const TIMEOUT = Number(process.env.REQUEST_TIMEOUT_MS || 12000)

// Return { summary: string|null, insights: string[], reviews: string[] }
export async function generateInsights({ title, author, description }) {
  if (!title) return { summary: null, insights: [], reviews: [] }
  if (!OPENAI_API_KEY) {
    console.warn('[openaiService] OPENAI_API_KEY not configured')
    return { summary: null, insights: [], reviews: [] }
  }

  // Ask for explicit labeled sections so we can parse reliably
  const system = 'You are a concise literary analyst. Provide clear labeled sections: ###SUMMARY, ###INSIGHTS, ###REVIEWS.'
  const user = `Book: ${title}
Author: ${author || 'Unknown'}
Description: ${description || 'N/A'}

Please reply with three sections, each starting with a header on its own line:
###SUMMARY
<4-6 sentence plain-English summary>

###INSIGHTS
- <short bullet insight 1>
- <short bullet insight 2>
- <short bullet insight 3>

###REVIEWS
- <short synthesized review highlight 1>
- <short synthesized review highlight 2>

Only output those three sections (no extra commentary).`

  // try list — prefer advanced if available, fallback to gpt-3.5-turbo
  const models = ['gpt-4o-mini', 'gpt-4o', 'gpt-4o-mini-claude', 'gpt-3.5-turbo']

  for (const model of models) {
    try {
      const body = {
        model,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user }
        ],
        temperature: 0.6,
        max_tokens: 500
      }

      const resp = await axios.post('https://api.openai.com/v1/chat/completions', body, {
        headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
        timeout: TIMEOUT
      })

      const text = resp?.data?.choices?.[0]?.message?.content || ''
      if (!text) {
        console.warn(`[openaiService] model=${model} returned empty content`)
        continue
      }

      // Attempt to extract by header sections
      const getSection = (hdr) => {
        const re = new RegExp(`###\\s*${hdr}\\s*([\\s\\S]*?)(?:\\n###|$)`, 'i')
        const m = text.match(re)
        return m ? m[1].trim() : null
      }

      const summaryRaw = getSection('SUMMARY') || ''
      const insightsRaw = getSection('INSIGHTS') || ''
      const reviewsRaw = getSection('REVIEWS') || ''

      const bulletsFrom = (txt) => {
        if (!txt) return []
        const arr = []
        const re = /^[-*•]\s*(.+)$/gm
        let match
        while ((match = re.exec(txt)) !== null) {
          arr.push(match[1].trim())
        }
        // If no bullets found, fallback: split by line breaks and trim short sentences
        if (arr.length === 0) {
          const lines = txt.split(/\n/).map(l => l.trim()).filter(Boolean)
          return lines.slice(0, 5)
        }
        return arr
      }

      const summary = summaryRaw ? summaryRaw.replace(/\n+/g, ' ').trim() : null
      const insights = bulletsFrom(insightsRaw).slice(0, 6)
      const reviews = bulletsFrom(reviewsRaw).slice(0, 6)

      return { summary, insights, reviews }
    } catch (err) {
      const status = err?.response?.status
      console.error(`[openaiService] model=${model} failed`, {
        status,
        data: err?.response?.data || err?.message || err
      })
      // If server error or rate-limit, stop trying to avoid repeated failures
      if (status && (status >= 500 || status === 429)) break
      // otherwise try next model
    }
  }

  // fallback: return empty but well-formed object
  return { summary: null, insights: [], reviews: [] }
}
