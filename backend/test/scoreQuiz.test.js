import assert from "node:assert/strict";
import test from "node:test";
import { HttpError } from "../lib/httpError.js";
import { scoreQuiz, summarizeAttempts } from "../lib/scoreQuiz.js";

const questions = [
  {
    id: "q1",
    question: "What is two plus two?",
    options: ["1", "2", "3", "4"],
    correctAnswer: 3,
    explanation: "2 + 2 = 4",
  },
  {
    id: "q2",
    question: "Which is a fruit?",
    options: ["Carrot", "Apple", "Bread", "Rice"],
    correctAnswer: 1,
    explanation: "An apple is a fruit.",
  },
];

test("scoreQuiz counts only saved answer-key matches", () => {
  const result = scoreQuiz(questions, [3, 0]);
  assert.equal(result.score, 1);
  assert.equal(result.totalQuestions, 2);
  assert.equal(result.percentage, 50);
  assert.equal(result.review[0].isCorrect, true);
  assert.equal(result.review[1].isCorrect, false);
  assert.equal(result.review[1].correctAnswer, 1);
});

test("scoreQuiz treats unanswered and invalid selections as wrong", () => {
  const result = scoreQuiz(questions, [-1, 1.5]);
  assert.equal(result.score, 0);
  assert.deepEqual(result.answers, [-1, -1]);
});

test("scoreQuiz rejects a mismatched answer list", () => {
  assert.throws(() => scoreQuiz(questions, [3]), HttpError);
});

test("summarizeAttempts ignores empty quizzes when averaging", () => {
  const summary = summarizeAttempts([
    { topic: "Math", score: 1, totalQuestions: 2, timeTaken: 30 },
    { topic: "Math", score: 1, totalQuestions: 1, timeTaken: 10 },
    { topic: "", score: 0, totalQuestions: 0, timeTaken: 5 },
  ]);
  assert.equal(summary.totalAttempts, 3);
  assert.equal(summary.averageScore, 75);
  assert.equal(summary.totalQuestions, 3);
  assert.equal(summary.totalTime, 45);
  assert.deepEqual(summary.topics, ["Math"]);
});
