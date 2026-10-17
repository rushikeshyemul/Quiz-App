import { HttpError } from "./httpError.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const QUESTION_COUNTS = new Set([5, 10, 15, 20]);
const DIFFICULTIES = new Set(["easy", "medium", "hard"]);

export function validateRegistration(body) {
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (name.length < 2 || name.length > 80) {
    throw new HttpError(400, "Name must be between 2 and 80 characters");
  }
  if (!EMAIL_PATTERN.test(email) || email.length > 254) {
    throw new HttpError(400, "A valid email is required");
  }
  if (password.length < 8 || password.length > 128) {
    throw new HttpError(400, "Password must be between 8 and 128 characters");
  }

  return { name, email, password };
}

export function validateLogin(body) {
  const rawEmail = typeof body?.email === "string" ? body.email.trim() : "";
  const email = rawEmail.toLowerCase();
  const password = typeof body?.password === "string" ? body.password : "";

  if (!email || !EMAIL_PATTERN.test(email) || !password || password.length > 128) {
    throw new HttpError(400, "Invalid credentials");
  }

  return { email, rawEmail, password };
}

export function validateTopic(topic) {
  if (typeof topic !== "string") {
    throw new HttpError(400, "A topic is required");
  }
  const value = topic.trim();
  if (!value || value.length > 200) {
    throw new HttpError(400, "A topic is required");
  }
  return value;
}

export function validateQuestionCount(value) {
  const questionCount = Number(value);
  if (!QUESTION_COUNTS.has(questionCount)) {
    throw new HttpError(400, "Choose 5, 10, 15, or 20 questions");
  }
  return questionCount;
}

export function validateDifficulty(value) {
  if (!DIFFICULTIES.has(value)) {
    throw new HttpError(400, "Difficulty must be easy, medium, or hard");
  }
  return value;
}

export function validateTimeLimit(value) {
  const timeLimit = Number(value);
  if (!Number.isInteger(timeLimit) || timeLimit < 1 || timeLimit > 180) {
    throw new HttpError(400, "Time limit must be between 1 and 180 minutes");
  }
  return timeLimit;
}

export function validateTimeTaken(value) {
  const timeTaken = Number(value);
  if (!Number.isInteger(timeTaken) || timeTaken < 0 || timeTaken > 60 * 60 * 6) {
    throw new HttpError(400, "Invalid time taken");
  }
  return timeTaken;
}

export function validateSubmissionId(value) {
  if (typeof value !== "string" || !UUID_PATTERN.test(value)) {
    throw new HttpError(400, "A valid submission id is required");
  }
  return value.toLowerCase();
}
