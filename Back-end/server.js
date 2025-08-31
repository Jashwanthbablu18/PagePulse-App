// Back-end/server.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve frontend build
const frontendPath = path.join(__dirname, "../Front-end/dist");
app.use(express.static(frontendPath));

// Example API route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Backend is running fine 🚀" });
});

// Catch-all → send index.html (important for React Router)
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ PagePulse running on http://localhost:${PORT}`);
});
