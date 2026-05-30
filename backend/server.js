import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Load .env BEFORE importing routes ─────────────────────────────────────────
// In ES Modules, static `import` statements are hoisted above all code,
// so dotenv.config() MUST be called before routes are loaded to ensure
// process.env.JWT_SECRET (and other variables) are available when
// authRoutes.js, authMiddleware.js, etc. are first evaluated.
dotenv.config({ path: path.resolve(__dirname, ".env") });

console.log("✅ JWT_SECRET loaded:", !!process.env.JWT_SECRET);
console.log("✅ MONGODB_URI loaded:", !!process.env.MONGODB_URI);

// ── Route imports (after dotenv so env vars are available) ────────────────────
const { default: authRoutes } = await import("./routes/authRoutes.js");
const { default: gpaRoutes } = await import("./routes/gpaRoutes.js");
const { default: scoreFlowRoutes } = await import("./routes/scoreFlowRoutes.js");
const { default: profileRoutes } = await import("./routes/profileRoutes.js");

const app = express();

// ── Middleware ─────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '5mb' }));

// ── Root route ─────────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.send("API Running 🚀");
});

// ── Routes ─────────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/gpa", gpaRoutes);
app.use("/api/scoreflow", scoreFlowRoutes);
app.use("/api/profile", profileRoutes);

// ── MongoDB ────────────────────────────────────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB Connected 🚀"))
  .catch((err) => console.error("Mongo Error:", err));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  const status = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  res.status(status).json({ success: false, error: message });
});

// ── Start server ───────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
});
