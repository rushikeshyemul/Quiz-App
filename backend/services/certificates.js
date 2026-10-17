import Certificate from "../models/Certificate.js";
import QuizAttempt from "../models/QuizAttempt.js";
import { buildCertificateNumber, qualifiesForCertificate } from "../lib/certificates.js";
import { scoreQuiz } from "../lib/scoreQuiz.js";

async function saveCertificate(user, attempt, scored) {
  const issuedAt = attempt.completedAt || new Date();
  const payload = {
    user: user._id,
    attempt: attempt._id,
    quiz: attempt.quiz?._id || attempt.quiz,
    recipientName: user.name,
    topic: attempt.topic,
    score: scored.score,
    totalQuestions: scored.totalQuestions,
    difficulty: attempt.difficulty || "medium",
    timeTaken: Number.isInteger(attempt.timeTaken) ? attempt.timeTaken : 0,
    certificateNumber: buildCertificateNumber(attempt._id, issuedAt),
    issuedAt,
  };

  const existing = await Certificate.findOne({ attempt: attempt._id, user: user._id });
  if (existing) {
    if (existing.timeTaken == null && Number.isInteger(attempt.timeTaken)) {
      existing.timeTaken = attempt.timeTaken;
      await existing.save();
    }
    return existing;
  }

  try {
    return await Certificate.create(payload);
  } catch (error) {
    if (error?.code === 11000) {
      return Certificate.findOne({ attempt: attempt._id, user: user._id });
    }
    throw error;
  }
}

export async function issueCertificateForAttempt(user, attempt) {
  if (!qualifiesForCertificate(attempt.score, attempt.totalQuestions)) {
    return null;
  }
  return saveCertificate(user, attempt, {
    score: attempt.score,
    totalQuestions: attempt.totalQuestions,
  });
}

export async function listCertificatesForUser(user) {
  const attempts = await QuizAttempt.find({ user: user._id }).populate("quiz");
  for (const attempt of attempts) {
    const questions = attempt.quiz?.questions;
    if (!Array.isArray(questions) || questions.length === 0) continue;
    try {
      const scored = scoreQuiz(questions, attempt.answers);
      if (!qualifiesForCertificate(scored.score, scored.totalQuestions)) continue;
      await saveCertificate(user, attempt, scored);
    } catch {
      continue;
    }
  }

  return Certificate.find({ user: user._id }).sort({ issuedAt: -1 });
}
