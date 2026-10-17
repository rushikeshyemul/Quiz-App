import { HttpError } from "./httpError.js";

function fail(source, message) {
  const status = source === "gemini" ? 502 : 400;
  const publicMessage =
    source === "gemini"
      ? "Gemini returned a quiz that failed validation. Try again."
      : message;
  throw new HttpError(status, publicMessage, source === "gemini" ? "GEMINI_INVALID" : undefined);
}

export function normalizeQuizQuestions(rawQuestions, { expectedCount, optionCount, source = "request" } = {}) {
  if (!Array.isArray(rawQuestions) || rawQuestions.length === 0) {
    fail(source, "A quiz needs at least one question");
  }

  const limited = expectedCount ? rawQuestions.slice(0, expectedCount) : rawQuestions;
  if (limited.length > 50) {
    fail(source, "A quiz can contain at most 50 questions");
  }

  const questions = limited.map((item, index) => {
    const question = typeof item?.question === "string" ? item.question.trim() : "";
    const options = Array.isArray(item?.options)
      ? item.options.map((option) => String(option).trim()).filter(Boolean)
      : [];
    const correctAnswer = Number(item?.correctAnswer);
    const explanation = typeof item?.explanation === "string" ? item.explanation.trim().slice(0, 2000) : "";
    const id = typeof item?.id === "string" && item.id.trim().length > 0 && item.id.trim().length <= 40
      ? item.id.trim()
      : `q${index + 1}`;

    if (question.length < 3 || question.length > 1000) {
      fail(source, "Each question must be between 3 and 1000 characters");
    }
    if (options.length < 2 || options.length > 6 || (optionCount && options.length !== optionCount)) {
      fail(source, optionCount ? `Each question needs exactly ${optionCount} options` : "Each question needs between 2 and 6 options");
    }
    if (new Set(options).size !== options.length) {
      fail(source, "Question options must be unique");
    }
    if (!Number.isInteger(correctAnswer) || correctAnswer < 0 || correctAnswer >= options.length) {
      fail(source, "Each question needs one valid correct answer");
    }

    return {
      id,
      question,
      options,
      correctAnswer,
      explanation,
      sourceQuote: typeof item?.sourceQuote === "string" ? item.sourceQuote.trim().slice(0, 500) : "",
    };
  });

  const seen = new Set();
  for (const question of questions) {
    const key = question.question.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    if (seen.has(key)) {
      fail(source, "The quiz contained duplicate questions");
    }
    seen.add(key);
  }

  if (expectedCount && questions.length !== expectedCount) {
    fail(source, `Expected ${expectedCount} questions`);
  }

  return questions;
}
