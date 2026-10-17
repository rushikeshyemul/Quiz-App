import express from "express";
import multer from "multer";
import Quiz from "../models/Quiz.js";
import StudyMaterial from "../models/StudyMaterial.js";
import { assessExtractedText, detectUploadKind, MAX_UPLOAD_BYTES } from "../lib/documents.js";
import { HttpError } from "../lib/httpError.js";
import { toPlayerQuiz } from "../lib/presenters.js";
import { validateDifficulty, validateQuestionCount, validateTimeLimit } from "../lib/validators.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { rateLimit } from "../middleware/rateLimit.js";
import { extractPdfText, extractPlainText } from "../services/extractText.js";
import { generateQuizWithGemini, isGeminiConfigured } from "../services/geminiQuiz.js";

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_BYTES, files: 1 },
});
const uploadLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  keyFn: (req) => req.userId || req.ip || "unknown",
});

function readUpload(req, res, next) {
  upload.single("file")(req, res, (error) => {
    if (error?.code === "LIMIT_FILE_SIZE") {
      next(new HttpError(413, "File must be 8 MB or smaller"));
      return;
    }
    if (error) {
      next(new HttpError(400, "Could not read that file"));
      return;
    }
    next();
  });
}

function toMaterialSummary(material) {
  return {
    id: String(material._id),
    filename: material.filename,
    kind: material.kind,
    pageCount: material.pageCount,
    charCount: material.charCount,
    createdAt: material.createdAt,
    preview: material.text.slice(0, 800),
  };
}

router.use(requireAuth);

router.get("/", async (req, res, next) => {
  try {
    const materials = await StudyMaterial.find({ user: req.userId }).sort({ createdAt: -1 }).limit(50);
    res.json(materials.map(toMaterialSummary));
  } catch (error) {
    next(error);
  }
});

router.post("/", uploadLimiter, readUpload, async (req, res, next) => {
  try {
    if (!req.file) {
      throw new HttpError(400, "Choose a PDF or text file");
    }

    const kind = detectUploadKind(req.file.buffer, req.file.originalname, req.file.mimetype);
    if (!kind) {
      throw new HttpError(400, "Upload a PDF or plain text file");
    }

    const extracted = kind === "pdf"
      ? await extractPdfText(req.file.buffer)
      : extractPlainText(req.file.buffer);
    const assessed = assessExtractedText({ text: extracted.text, pageCount: extracted.pageCount });
    if (!assessed.ok) {
      throw new HttpError(422, assessed.message, assessed.code);
    }

    const material = await StudyMaterial.create({
      user: req.userId,
      filename: String(req.file.originalname || "notes").slice(0, 180),
      kind,
      pageCount: extracted.pageCount,
      charCount: assessed.charCount,
      text: assessed.text,
      pages: extracted.pages.slice(0, 40).map((page) => ({
        page: page.page,
        text: page.text.slice(0, 4000),
      })),
    });

    res.status(201).json(toMaterialSummary(material));
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const deleted = await StudyMaterial.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!deleted) {
      throw new HttpError(404, "Study material not found");
    }
    res.json({ deleted: true });
  } catch (error) {
    next(error);
  }
});

router.post("/:id/quiz", uploadLimiter, async (req, res, next) => {
  try {
    const material = await StudyMaterial.findOne({ _id: req.params.id, user: req.userId });
    if (!material) {
      throw new HttpError(404, "Study material not found");
    }
    if (!isGeminiConfigured()) {
      throw new HttpError(
        503,
        "Quiz generation is unavailable. Add GEMINI_API_KEY to the server configuration and restart the API.",
        "GEMINI_NOT_CONFIGURED"
      );
    }

    const questionCount = validateQuestionCount(req.body.questionCount ?? 5);
    const difficulty = validateDifficulty(req.body.difficulty ?? "medium");
    const timeLimit = validateTimeLimit(req.body.timeLimit ?? 15);
    const topic = material.filename.replace(/\.[^.]+$/, "").slice(0, 200) || "Study notes";
    const questions = await generateQuizWithGemini({
      topic,
      questionCount,
      difficulty,
      sourceText: material.text,
    });
    const quiz = await Quiz.create({
      user: req.userId,
      topic,
      questions,
      timeLimit,
      difficulty,
      material: material._id,
      source: "document",
    });
    res.status(201).json(toPlayerQuiz(quiz));
  } catch (error) {
    next(error);
  }
});

export default router;
