import { HttpError } from "./httpError.js";

export function scoreQuiz(questions, answers) {
  if (!Array.isArray(questions) || questions.length === 0) {
    throw new HttpError(400, "This quiz has no questions");
  }
  if (!Array.isArray(answers) || answers.length !== questions.length) {
    throw new HttpError(400, "Answer count does not match this quiz");
  }

  const normalizedAnswers = answers.map((answer) => {
    const value = Number(answer);
    return Number.isInteger(value) ? value : -1;
  });

  let score = 0;
  const review = questions.map((question, index) => {
    const selectedAnswer = normalizedAnswers[index];
    const isCorrect = selectedAnswer === question.correctAnswer;
    if (isCorrect) score += 1;
    return {
      id: question.id || `q${index + 1}`,
      question: question.question,
      options: question.options,
      selectedAnswer,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation || "",
      sourceQuote: question.sourceQuote || "",
      isCorrect,
    };
  });

  return {
    score,
    totalQuestions: questions.length,
    answers: normalizedAnswers,
    percentage: Math.round((score / questions.length) * 100),
    review,
  };
}

export function summarizeAttempts(attempts) {
  const list = Array.isArray(attempts) ? attempts : [];
  const scored = list.filter((attempt) => attempt.totalQuestions > 0);
  const averageTotal = scored.reduce(
    (sum, attempt) => sum + (attempt.score / attempt.totalQuestions) * 100,
    0
  );

  return {
    totalAttempts: list.length,
    averageScore: scored.length ? Math.round((averageTotal / scored.length) * 100) / 100 : 0,
    totalQuestions: list.reduce((sum, attempt) => sum + (attempt.totalQuestions || 0), 0),
    totalTime: list.reduce((sum, attempt) => sum + (attempt.timeTaken || 0), 0),
    topics: [...new Set(list.map((attempt) => attempt.topic).filter(Boolean))],
  };
}

export function topicAccuracy(attempts) {
  const groups = new Map();
  for (const attempt of Array.isArray(attempts) ? attempts : []) {
    if (!attempt?.topic || !attempt.totalQuestions) continue;
    const current = groups.get(attempt.topic) || {
      topic: attempt.topic,
      correct: 0,
      total: 0,
      attempts: 0,
    };
    current.correct += attempt.score || 0;
    current.total += attempt.totalQuestions;
    current.attempts += 1;
    groups.set(attempt.topic, current);
  }

  return [...groups.values()]
    .map((row) => {
      const accuracy = Math.round((row.correct / row.total) * 100);
      const evidence = row.total >= 5 ? "sufficient" : "limited";
      return {
        ...row,
        accuracy,
        evidence,
        needsReview: evidence === "sufficient" && accuracy < 70,
      };
    })
    .sort((left, right) => left.accuracy - right.accuracy);
}
