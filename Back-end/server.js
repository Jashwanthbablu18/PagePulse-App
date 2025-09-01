// Back-end/server.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import pagepulseRoutes from "./routes/pagepulseRoutes.js"; // ✅ mount your API!

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

// ✅ API routes
app.use("/api/pagepulse", pagepulseRoutes);

// ✅ Serve frontend build (same origin)
const frontendPath = path.join(__dirname, "../Front-end/dist");
app.use(express.static(frontendPath));

// health
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Backend is running fine 🚀" });
});

// ✅ SPA fallback
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

app.listen(PORT, () => {
  console.log(`✅ PagePulse running on http://localhost:${PORT}`);
});
