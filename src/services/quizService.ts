import { Quiz, Question, QuizConfig, QuizAttempt, UserStats } from "../types";
import { API_URL } from "../config";

export const quizService = {
  async generateQuiz(config: QuizConfig): Promise<Quiz> {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      throw new Error("User not authenticated");
    }

    const response = await fetch(`${API_URL}/quiz/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        topic: config.topic,
        questionCount: config.questionCount,
        difficulty: config.difficulty,
      }),
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as {
        code?: string;
        message?: string;
      } | null;
      if (response.status === 503 && data?.code === "GEMINI_NOT_CONFIGURED") {
        return this.generateMockQuiz(config);
      }
      throw new Error(data?.message || "Gemini could not generate this quiz");
    }

    const quizData = (await response.json()) as { questions: Question[] };
    return {
      id: Date.now().toString(),
      topic: config.topic,
      questions: quizData.questions,
      timeLimit: config.timeLimit,
      createdAt: new Date().toISOString(),
    };
  },

  async generateMockQuiz(config: QuizConfig): Promise<Quiz> {
    // Enhanced mock data with topic-specific questions
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const topicQuestions = this.getTopicSpecificQuestions(
      config.topic,
      config.questionCount
    );

    return {
      id: Date.now().toString(),
      topic: config.topic,
      questions: topicQuestions,
      timeLimit: config.timeLimit,
      createdAt: new Date().toISOString(),
    };
  },

  getTopicSpecificQuestions(topic: string, count: number): Question[] {
    const questionBank: Record<string, Question[]> = {
      "Operating Systems": [
        {
          id: "os1",
          question: "What is the main purpose of an operating system?",
          options: [
            "Compile programs",
            "Manage hardware resources",
            "Create databases",
            "Design user interfaces",
          ],
          correctAnswer: 1,
          explanation:
            "The primary purpose of an OS is to manage hardware resources and provide services to applications.",
        },
        {
          id: "os2",
          question:
            "Which scheduling algorithm gives priority to the process with the shortest execution time?",
          options: ["FCFS", "SJF", "Round Robin", "Priority Scheduling"],
          correctAnswer: 1,
          explanation:
            "Shortest Job First (SJF) algorithm prioritizes processes with the shortest execution time.",
        },
        {
          id: "os3",
          question: "What is a deadlock in operating systems?",
          options: [
            "A crashed program",
            "A circular wait condition",
            "A memory leak",
            "A network error",
          ],
          correctAnswer: 1,
          explanation:
            "Deadlock occurs when processes are waiting for each other in a circular chain.",
        },
      ],
      "Data Structures": [
        {
          id: "ds1",
          question:
            "What is the time complexity of searching in a balanced binary search tree?",
          options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
          correctAnswer: 1,
          explanation:
            "In a balanced BST, search operations take O(log n) time due to the tree height.",
        },
        {
          id: "ds2",
          question: "Which data structure follows LIFO principle?",
          options: ["Queue", "Stack", "Array", "Linked List"],
          correctAnswer: 1,
          explanation:
            "Stack follows Last In First Out (LIFO) principle where the last element added is the first to be removed.",
        },
      ],
      "Database Management Systems": [
        {
          id: "dbms1",
          question: "What does ACID stand for in database transactions?",
          options: [
            "Atomicity, Consistency, Isolation, Durability",
            "Access, Control, Integration, Data",
            "Automatic, Concurrent, Independent, Distributed",
            "Authentication, Compression, Indexing, Distribution",
          ],
          correctAnswer: 0,
          explanation:
            "ACID represents the four key properties that guarantee reliable database transactions.",
        },
      ],
      "Computer Networks": [
        {
          id: "cn1",
          question: "Which layer of the OSI model is responsible for routing?",
          options: [
            "Physical Layer",
            "Data Link Layer",
            "Network Layer",
            "Transport Layer",
          ],
          correctAnswer: 2,
          explanation:
            "The Network Layer (Layer 3) handles routing and logical addressing.",
        },
      ],
      "Object-Oriented Programming": [
        {
          id: "oop1",
          question: "What is encapsulation in OOP?",
          options: [
            "Creating multiple objects",
            "Hiding internal implementation details",
            "Inheriting from parent class",
            "Overriding methods",
          ],
          correctAnswer: 1,
          explanation:
            "Encapsulation is the bundling of data and methods while hiding internal implementation details.",
        },
      ],
    };

    const questions = questionBank[topic] || [];

    // If we have enough questions for the topic, return them
    if (questions.length >= count) {
      return questions.slice(0, count);
    }

    // Otherwise, generate generic questions
    return Array.from({ length: count }, (_, i) => ({
      id: `q${i + 1}`,
      question: `Sample question ${i + 1} about ${topic}?`,
      options: ["Option A", "Option B", "Option C", "Option D"],
      correctAnswer: Math.floor(Math.random() * 4),
      explanation: `This is the explanation for question ${
        i + 1
      } about ${topic}.`,
    }));
  },

  async uploadPDFQuiz(file: File): Promise<Quiz> {
    // Mock PDF processing - replace with actual PDF parsing API
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const mockQuestions: Question[] = Array.from({ length: 10 }, (_, i) => ({
      id: `pdf_q${i + 1}`,
      question: `PDF-based question ${i + 1} extracted from ${file.name}?`,
      options: ["PDF Option A", "PDF Option B", "PDF Option C", "PDF Option D"],
      correctAnswer: Math.floor(Math.random() * 4),
      explanation: `Explanation extracted from PDF content for question ${
        i + 1
      }.`,
    }));

    return {
      id: Date.now().toString(),
      topic: `PDF: ${file.name}`,
      questions: mockQuestions,
      timeLimit: 30,
      createdAt: new Date().toISOString(),
    };
  },

  async getQuizTopics(): Promise<string[]> {
    return [
      // Core Computer Science
      "Operating Systems",
      "Data Structures",
      "Algorithms",
      "Database Management Systems",
      "Computer Networks",
      "Object-Oriented Programming",
      "Software Engineering",
      "Computer Architecture",

      // Programming Languages
      "Java Programming",
      "Python Programming",
      "C++ Programming",
      "JavaScript",
      "React.js",
      "Node.js",

      // Advanced Topics
      "Machine Learning",
      "Artificial Intelligence",
      "Cybersecurity",
      "Cloud Computing",
      "DevOps",
      "System Design",

      // Mathematics & Theory
      "Discrete Mathematics",
      "Theory of Computation",
      "Compiler Design",
      "Digital Logic Design",

      // General Knowledge
      "General Knowledge",
      "Current Affairs",
      "Science",
      "History",
    ];
  },

  // Save quiz to backend
  async saveQuizToBackend(quizData: {
    topic: string;
    questions: Question[];
    timeLimit: number;
  }): Promise<Quiz> {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      throw new Error("User not authenticated");
    }

    const response = await fetch(`${API_URL}/quiz`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(quizData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to save quiz to backend");
    }

    const savedQuiz = await response.json();
    return {
      id: savedQuiz._id, // Use MongoDB _id as id
      topic: savedQuiz.topic,
      questions: savedQuiz.questions,
      timeLimit: savedQuiz.timeLimit,
      createdAt: savedQuiz.createdAt,
    };
  },

  // New methods for quiz attempts and user statistics
  async saveQuizAttempt(attemptData: {
    quizId: string;
    topic: string;
    answers: number[];
    score: number;
    totalQuestions: number;
    timeTaken: number;
    difficulty: "easy" | "medium" | "hard";
  }): Promise<QuizAttempt> {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      throw new Error("User not authenticated");
    }

    const response = await fetch(`${API_URL}/quiz/attempt`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(attemptData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to save quiz attempt");
    }

    return response.json();
  },

  async getUserQuizAttempts(): Promise<QuizAttempt[]> {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      throw new Error("User not authenticated");
    }

    const response = await fetch(`${API_URL}/quiz/attempts`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch quiz attempts");
    }

    return response.json();
  },

  async getUserStats(): Promise<UserStats> {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      throw new Error("User not authenticated");
    }

    const response = await fetch(`${API_URL}/quiz/stats`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch user statistics");
    }

    return response.json();
  },
};
