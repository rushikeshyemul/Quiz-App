import { scoreQuiz } from "./scoreQuiz.js";

export function toPublicUser(user) {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role || "user",
    createdAt: user.createdAt,
  };
}

export function toPlayerQuiz(quiz) {
  return {
    id: String(quiz._id || quiz.id),
    topic: quiz.topic,
    timeLimit: quiz.timeLimit,
    difficulty: quiz.difficulty || "medium",
    createdAt: quiz.createdAt,
    questions: (quiz.questions || []).map((question, index) => ({
      id: question.id || `q${index + 1}`,
      question: question.question,
      options: question.options,
    })),
  };
}

export function toQuizSummary(quiz) {
  return {
    id: String(quiz._id || quiz.id),
    topic: quiz.topic,
    questionCount: quiz.questions?.length || 0,
    timeLimit: quiz.timeLimit,
    difficulty: quiz.difficulty || "medium",
    source: quiz.source || "topic",
    createdAt: quiz.createdAt,
  };
}

export function toAttemptSummary(attempt) {
  const id = String(attempt._id || attempt.id);
  return {
    id,
    _id: id,
    userId: attempt.user ? String(attempt.user) : undefined,
    quizId: attempt.quiz ? String(attempt.quiz._id || attempt.quiz) : undefined,
    topic: attempt.topic,
    answers: attempt.answers,
    score: attempt.score,
    totalQuestions: attempt.totalQuestions,
    completedAt: attempt.completedAt,
    timeTaken: attempt.timeTaken,
    difficulty: attempt.difficulty,
  };
}

export function toCertificate(certificate) {
  if (!certificate) return null;
  return {
    id: String(certificate._id),
    attemptId: String(certificate.attempt),
    quizId: String(certificate.quiz),
    recipientName: certificate.recipientName,
    topic: certificate.topic,
    score: certificate.score,
    totalQuestions: certificate.totalQuestions,
    difficulty: certificate.difficulty,
    timeTaken: certificate.timeTaken || 0,
    certificateNumber: certificate.certificateNumber,
    issuedAt: certificate.issuedAt,
  };
}

export function toSubmissionResponse(attempt, quiz, { duplicate = false, certificate = null } = {}) {
  const scored = scoreQuiz(quiz.questions, attempt.answers);
  return {
    ...toAttemptSummary(attempt),
    score: scored.score,
    totalQuestions: scored.totalQuestions,
    percentage: scored.percentage,
    answers: scored.answers,
    review: scored.review,
    duplicate,
    certificate: toCertificate(certificate),
  };
}
