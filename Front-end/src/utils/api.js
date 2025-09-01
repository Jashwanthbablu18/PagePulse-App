// Front-end/src/utils/api.js
import axios from "axios";

// ✅ Use same-origin by default. If VITE_API_BASE is set, use it.
const RAW_BASE = import.meta.env.VITE_API_BASE || "";
const API_BASE = RAW_BASE.replace(/\/$/, ""); // trim trailing slash if present

const api = axios.create({
  baseURL: API_BASE, // same origin by default
  timeout: 15000,
});

// GET /api/pagepulse/search?title=...
export async function searchBooks(title) {
  const res = await api.get("/api/pagepulse/search", { params: { title } });
  return res.data;
}

export async function getBook(workId) {
  const res = await api.get(`/api/pagepulse/books/${encodeURIComponent(workId)}`);
  return res.data;
}

export async function getInsights(payload) {
  const res = await api.post("/api/pagepulse/insights", payload);
  return res.data;
}

export default { searchBooks, getBook, getInsights };
