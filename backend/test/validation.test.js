import assert from "node:assert/strict";
import test from "node:test";
import { HttpError } from "../lib/httpError.js";
import { normalizeQuizQuestions } from "../lib/questions.js";
import { toPlayerQuiz } from "../lib/presenters.js";
import {
  validateLogin,
  validateQuestionCount,
  validateRegistration,
  validateSubmissionId,
} from "../lib/validators.js";

test("registration rejects short passwords and invalid emails", () => {
  assert.throws(
    () => validateRegistration({ name: "A", email: "not-an-email", password: "short" }),
    (error) => error instanceof HttpError && error.status === 400
  );
});

test("registration normalizes a valid account", () => {
  const value = validateRegistration({
    name: "  Ada Lovelace  ",
    email: "Ada@Example.com",
    password: "correct-horse",
  });
  assert.equal(value.name, "Ada Lovelace");
  assert.equal(value.email, "ada@example.com");
});

test("login does not accept a non-string email", () => {
  assert.throws(
    () => validateLogin({ email: { $gt: "" }, password: "correct-horse" }),
    (error) => error instanceof HttpError && error.message === "Invalid credentials"
  );
});

test("question count and submission id are constrained", () => {
  assert.equal(validateQuestionCount("10"), 10);
  assert.throws(() => validateQuestionCount(7), HttpError);
  assert.throws(() => validateSubmissionId("not-a-uuid"), HttpError);
});

test("generated questions must match the requested count and option size", () => {
  const questions = [
    {
      question: "Capital of France?",
      options: ["Paris", "Lyon", "Nice", "Lille"],
      correctAnswer: 0,
      explanation: "Paris is the capital.",
    },
  ];
  assert.equal(normalizeQuizQuestions(questions, { expectedCount: 1, optionCount: 4 }).length, 1);
  assert.throws(
    () => normalizeQuizQuestions([{ question: "Too short", options: ["A"], correctAnswer: 0 }], { source: "request" }),
    HttpError
  );
});

test("player quizzes do not include the answer key", () => {
  const player = toPlayerQuiz({
    _id: "abc123",
    topic: "History",
    timeLimit: 10,
    difficulty: "easy",
    createdAt: "2026-01-01T00:00:00.000Z",
    questions: [
      {
        id: "q1",
        question: "Capital of France?",
        options: ["Paris", "Lyon", "Nice", "Lille"],
        correctAnswer: 0,
        explanation: "Paris is the capital.",
      },
    ],
  });

  assert.equal(player.questions[0].correctAnswer, undefined);
  assert.equal(player.questions[0].explanation, undefined);
  assert.equal(JSON.stringify(player).includes("correctAnswer"), false);
});
