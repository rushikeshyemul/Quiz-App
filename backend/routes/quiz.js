import express from 'express';
import jwt from 'jsonwebtoken';
import Quiz from '../models/Quiz.js';
import QuizAttempt from '../models/QuizAttempt.js';
import { generateQuizWithGemini, isGeminiConfigured } from '../services/geminiQuiz.js';

const router = express.Router();

// Middleware to verify JWT
function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
}

const ALLOWED_COUNTS = new Set([5, 10, 15, 20]);
const ALLOWED_DIFFICULTIES = new Set(['easy', 'medium', 'hard']);

router.post('/generate', auth, async (req, res) => {
  try {
    const topic = typeof req.body.topic === 'string' ? req.body.topic.trim() : '';
    const questionCount = Number(req.body.questionCount);
    const difficulty = req.body.difficulty;

    if (!topic || topic.length > 200) {
      return res.status(400).json({ message: 'A topic is required' });
    }
    if (!ALLOWED_COUNTS.has(questionCount)) {
      return res.status(400).json({ message: 'Choose 5, 10, 15, or 20 questions' });
    }
    if (!ALLOWED_DIFFICULTIES.has(difficulty)) {
      return res.status(400).json({ message: 'Difficulty must be easy, medium, or hard' });
    }
    if (!isGeminiConfigured()) {
      return res.status(503).json({
        code: 'GEMINI_NOT_CONFIGURED',
        message: 'Add GEMINI_API_KEY to backend/.env and restart the API',
      });
    }

    const questions = await generateQuizWithGemini({ topic, questionCount, difficulty });
    res.json({ questions });
  } catch (err) {
    console.error('Gemini quiz generation failed:', err.message);
    res.status(502).json({ message: 'Gemini could not generate this quiz. Check the API key and model, then try again.' });
  }
});

// Save a quiz
router.post('/', auth, async (req, res) => {
  try {
    const { topic, questions, timeLimit } = req.body;
    const quiz = await Quiz.create({
      user: req.userId,
      topic,
      questions,
      timeLimit,
    });
    res.json(quiz);
  } catch (err) {
    res.status(500).json({ message: 'Failed to save quiz', error: err.message });
  }
});

// Get all quizzes for the logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const quizzes = await Quiz.find({ user: req.userId });
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch quizzes', error: err.message });
  }
});

// Save quiz attempt
router.post('/attempt', auth, async (req, res) => {
  try {
    const { quizId, topic, answers, score, totalQuestions, timeTaken, difficulty } = req.body;
    const incomingAnswers = Array.isArray(answers) ? answers : [];
    const recentDuplicate = await QuizAttempt.findOne({
      user: req.userId,
      quiz: quizId,
      score,
      totalQuestions,
      timeTaken,
      difficulty,
      completedAt: { $gte: new Date(Date.now() - 5000) },
    }).sort({ completedAt: -1 });

    if (
      recentDuplicate &&
      recentDuplicate.answers.length === incomingAnswers.length &&
      recentDuplicate.answers.every((answer, index) => answer === incomingAnswers[index])
    ) {
      return res.json(recentDuplicate);
    }

    const quizAttempt = await QuizAttempt.create({
      user: req.userId,
      quiz: quizId,
      topic,
      answers: incomingAnswers,
      score,
      totalQuestions,
      timeTaken,
      difficulty,
    });
    res.json(quizAttempt);
  } catch (err) {
    res.status(500).json({ message: 'Failed to save quiz attempt', error: err.message });
  }
});

// Get user's quiz attempts (test records)
router.get('/attempts', auth, async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({ user: req.userId })
      .sort({ completedAt: -1 })
      .populate('quiz', 'topic questions');
    res.json(attempts);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch quiz attempts', error: err.message });
  }
});

// Get user's quiz statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({ user: req.userId }).sort({ completedAt: -1 });
    const averagePercentage = attempts.reduce((sum, attempt) => {
      if (!attempt.totalQuestions) return sum;
      return sum + (attempt.score / attempt.totalQuestions) * 100;
    }, 0);

    const stats = {
      totalAttempts: attempts.length,
      averageScore: attempts.length > 0
        ? (averagePercentage / attempts.length).toFixed(2)
        : 0,
      totalQuestions: attempts.reduce((sum, attempt) => sum + attempt.totalQuestions, 0),
      totalTime: attempts.reduce((sum, attempt) => sum + attempt.timeTaken, 0),
      topics: [...new Set(attempts.map(attempt => attempt.topic))],
      recentAttempts: attempts.slice(0, 5), // Last 5 attempts
    };
    
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch quiz statistics', error: err.message });
  }
});

export default router; 