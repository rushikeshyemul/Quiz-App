import express from "express";
import Quiz from "../models/Quiz.js";
import QuizAttempt from "../models/QuizAttempt.js";
import { HttpError } from "../lib/httpError.js";
import { normalizeQuizQuestions } from "../lib/questions.js";
import {
  toAttemptSummary,
  toCertificate,
  toPlayerQuiz,
  toQuizSummary,
  toSubmissionResponse,
} from "../lib/presenters.js";
import { scoreQuiz, summarizeAttempts, topicAccuracy } from "../lib/scoreQuiz.js";
import {
  validateDifficulty,
  validateQuestionCount,
  validateSubmissionId,
  validateTimeLimit,
  validateTimeTaken,
  validateTopic,
} from "../lib/validators.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { rateLimit } from "../middleware/rateLimit.js";
import { generateQuizWithGemini, isGeminiConfigured } from "../services/geminiQuiz.js";
import { issueCertificateForAttempt, listCertificatesForUser } from "../services/certificates.js";

const router = express.Router();
const generateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 12,
  keyFn: (req) => req.userId || req.ip || "unknown",
});

router.use(requireAuth);

async function saveOwnedAttempt(req, quiz) {
  const submissionId = validateSubmissionId(req.body.submissionId);
  const existing = await QuizAttempt.findOne({ user: req.userId, submissionId });
  if (existing) {
    if (String(existing.quiz) !== String(quiz._id)) {
      throw new HttpError(409, "This submission was already used");
    }
    return { attempt: existing, duplicate: true, certificate: await issueCertificateForAttempt(req.user, existing) };
  }

  const scored = scoreQuiz(quiz.questions, req.body.answers);
  const timeTaken = validateTimeTaken(req.body.timeTaken);

  try {
    const attempt = await QuizAttempt.create({
      user: req.userId,
      quiz: quiz._id,
      topic: quiz.topic,
      answers: scored.answers,
      score: scored.score,
      totalQuestions: scored.totalQuestions,
      timeTaken,
      difficulty: quiz.difficulty || "medium",
      submissionId,
    });
    const certificate = await issueCertificateForAttempt(req.user, attempt);
    return { attempt, duplicate: false, certificate };
  } catch (error) {
    if (error?.code === 11000) {
      const raced = await QuizAttempt.findOne({ user: req.userId, submissionId });
      if (raced && String(raced.quiz) === String(quiz._id)) {
        return {
          attempt: raced,
          duplicate: true,
          certificate: await issueCertificateForAttempt(req.user, raced),
        };
      }
    }
    throw error;
  }
}

router.post("/generate", generateLimiter, async (req, res, next) => {
  try {
    const topic = validateTopic(req.body.topic);
    const questionCount = validateQuestionCount(req.body.questionCount);
    const difficulty = validateDifficulty(req.body.difficulty);
    const timeLimit = validateTimeLimit(req.body.timeLimit ?? 15);

    if (!isGeminiConfigured()) {
      throw new HttpError(
        503,
        "Quiz generation is unavailable. Add GEMINI_API_KEY to the server configuration and restart the API.",
        "GEMINI_NOT_CONFIGURED"
      );
    }

    const questions = await generateQuizWithGemini({ topic, questionCount, difficulty });
    const quiz = await Quiz.create({
      user: req.userId,
      topic,
      questions,
      timeLimit,
      difficulty,
    });
    res.status(201).json(toPlayerQuiz(quiz));
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const topic = validateTopic(req.body.topic);
    const questions = normalizeQuizQuestions(req.body.questions);
    const timeLimit = validateTimeLimit(req.body.timeLimit ?? 15);
    const difficulty = req.body.difficulty ? validateDifficulty(req.body.difficulty) : "medium";
    const quiz = await Quiz.create({
      user: req.userId,
      topic,
      questions,
      timeLimit,
      difficulty,
    });
    res.status(201).json(toPlayerQuiz(quiz));
  } catch (error) {
    next(error);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const quizzes = await Quiz.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json(quizzes.map(toQuizSummary));
  } catch (error) {
    next(error);
  }
});

router.post("/attempt", async (req, res, next) => {
  try {
    if (!req.body.quizId) {
      throw new HttpError(400, "A quiz id is required");
    }
    const quiz = await Quiz.findOne({ _id: req.body.quizId, user: req.userId });
    if (!quiz) {
      throw new HttpError(404, "Quiz not found");
    }
    const { attempt, duplicate, certificate } = await saveOwnedAttempt(req, quiz);
    const status = duplicate ? 200 : 201;
    res.status(status).json(toSubmissionResponse(attempt, quiz, { duplicate, certificate }));
  } catch (error) {
    next(error);
  }
});

router.post("/:id/submit", async (req, res, next) => {
  try {
    const quiz = await Quiz.findOne({ _id: req.params.id, user: req.userId });
    if (!quiz) {
      throw new HttpError(404, "Quiz not found");
    }
    const { attempt, duplicate, certificate } = await saveOwnedAttempt(req, quiz);
    const status = duplicate ? 200 : 201;
    res.status(status).json(toSubmissionResponse(attempt, quiz, { duplicate, certificate }));
  } catch (error) {
    next(error);
  }
});

router.get("/attempts", async (req, res, next) => {
  try {
    const attempts = await QuizAttempt.find({ user: req.userId }).sort({ completedAt: -1 });
    res.json(attempts.map(toAttemptSummary));
  } catch (error) {
    next(error);
  }
});

router.get("/stats", async (req, res, next) => {
  try {
    const attempts = await QuizAttempt.find({ user: req.userId }).sort({ completedAt: -1 });
    const summary = summarizeAttempts(attempts);
    res.json({
      ...summary,
      recentAttempts: attempts.slice(0, 5).map(toAttemptSummary),
      topicAccuracy: topicAccuracy(attempts),
    });
  } catch (error) {
    next(error);
  }
});

router.get("/certificates", async (req, res, next) => {
  try {
    const certificates = await listCertificatesForUser(req.user);
    res.json(certificates.map(toCertificate));
  } catch (error) {
    next(error);
  }
});

router.get("/certificates/:id", async (req, res, next) => {
  try {
    const certificates = await listCertificatesForUser(req.user);
    const certificate = certificates.find((item) => String(item._id) === req.params.id);
    if (!certificate) {
      throw new HttpError(404, "Certificate not found");
    }
    res.json(toCertificate(certificate));
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const quiz = await Quiz.findOne({ _id: req.params.id, user: req.userId });
    if (!quiz) {
      throw new HttpError(404, "Quiz not found");
    }
    res.json(toPlayerQuiz(quiz));
  } catch (error) {
    next(error);
  }
});

export default router;
