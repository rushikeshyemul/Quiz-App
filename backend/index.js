import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import materialsRoutes from "./routes/materials.js";
import quizRoutes from "./routes/quiz.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

dotenv.config();

const app = express();
app.disable("x-powered-by");

const allowedOrigins = (
  process.env.FRONTEND_ORIGIN || "http://localhost:5173,http://127.0.0.1:5173"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
  })
);
app.use(express.json({ limit: "1mb" }));

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/quiz-app";
console.log("Connecting to MongoDB at:", MONGO_URI.replace(/:(.*)@/, ":*****@"));

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

app.get("/api/health", (req, res) => {
  const connected = mongoose.connection.readyState === 1;
  res.status(connected ? 200 : 503).json({
    ok: connected,
    db: connected ? "connected" : "disconnected",
  });
});

app.get("/", (req, res) => {
  res.json({ message: "Quiz API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/materials", materialsRoutes);
app.use("/api/quiz", quizRoutes);
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
