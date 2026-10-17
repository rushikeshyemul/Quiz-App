import { Certificate, Quiz, QuizAttempt, QuizConfig, SubmissionResult, UserStats } from "../types";
import { API_URL } from "../config";

const generatedQuizLoads = new Map<string, Promise<Quiz>>();

function authHeaders() {
  const token = localStorage.getItem("auth_token");
  if (!token) {
    throw new Error("User not authenticated");
  }
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

async function readError(response: Response, fallback: string) {
  const data = (await response.json().catch(() => null)) as { message?: string } | null;
  return data?.message || fallback;
}

function generatedQuizKey(config: QuizConfig) {
  return [config.topic, config.questionCount, config.timeLimit, config.difficulty].join("|");
}

export const quizService = {
  async generateQuiz(config: QuizConfig): Promise<Quiz> {
    const response = await fetch(`${API_URL}/quiz/generate`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        topic: config.topic,
        questionCount: config.questionCount,
        difficulty: config.difficulty,
        timeLimit: config.timeLimit,
      }),
    });

    if (!response.ok) {
      throw new Error(await readError(response, "Gemini could not generate this quiz"));
    }

    return response.json() as Promise<Quiz>;
  },

  async createGeneratedQuiz(config: QuizConfig): Promise<Quiz> {
    const key = generatedQuizKey(config);
    const current = generatedQuizLoads.get(key);
    if (current) return current;

    const load = this.generateQuiz(config).finally(() => {
      queueMicrotask(() => {
        if (generatedQuizLoads.get(key) === load) {
          generatedQuizLoads.delete(key);
        }
      });
    });

    generatedQuizLoads.set(key, load);
    return load;
  },

  async submitQuiz(
    quizId: string,
    payload: { answers: number[]; timeTaken: number; submissionId: string }
  ): Promise<SubmissionResult> {
    const response = await fetch(`${API_URL}/quiz/${quizId}/submit`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(await readError(response, "Failed to submit quiz"));
    }

    return response.json() as Promise<SubmissionResult>;
  },

  async getQuizTopics(): Promise<string[]> {
    return [
      "Operating Systems",
      "Data Structures",
      "Algorithms",
      "Database Management Systems",
      "Computer Networks",
      "Object-Oriented Programming",
      "Software Engineering",
      "Computer Architecture",
      "Java Programming",
      "Python Programming",
      "C++ Programming",
      "JavaScript",
      "React.js",
      "Node.js",
      "Machine Learning",
      "Artificial Intelligence",
      "Cybersecurity",
      "Cloud Computing",
      "DevOps",
      "System Design",
      "Discrete Mathematics",
      "Theory of Computation",
      "Compiler Design",
      "Digital Logic Design",
      "General Knowledge",
      "Current Affairs",
      "Science",
      "History",
    ];
  },

  async getUserQuizAttempts(): Promise<QuizAttempt[]> {
    const response = await fetch(`${API_URL}/quiz/attempts`, {
      headers: authHeaders(),
    });

    if (!response.ok) {
      throw new Error(await readError(response, "Failed to fetch quiz attempts"));
    }

    return response.json();
  },

  async getUserStats(): Promise<UserStats> {
    const response = await fetch(`${API_URL}/quiz/stats`, {
      headers: authHeaders(),
    });

    if (!response.ok) {
      throw new Error(await readError(response, "Failed to fetch user statistics"));
    }

    return response.json();
  },

  async listCertificates(): Promise<Certificate[]> {
    const response = await fetch(`${API_URL}/quiz/certificates`, { headers: authHeaders() });
    if (!response.ok) {
      throw new Error(await readError(response, "Failed to load certificates"));
    }
    return response.json();
  },

  async getCertificate(certificateId: string): Promise<Certificate> {
    const response = await fetch(`${API_URL}/quiz/certificates/${certificateId}`, { headers: authHeaders() });
    if (!response.ok) {
      throw new Error(await readError(response, "Certificate not found"));
    }
    return response.json();
  },

  async listQuizzes(): Promise<Array<Pick<Quiz, "id" | "topic" | "timeLimit" | "createdAt"> & { questionCount: number; difficulty: QuizConfig["difficulty"]; source?: string }>> {
    const response = await fetch(`${API_URL}/quiz`, { headers: authHeaders() });
    if (!response.ok) {
      throw new Error(await readError(response, "Failed to load your quizzes"));
    }
    return response.json();
  },

  async getQuiz(quizId: string): Promise<Quiz> {
    const response = await fetch(`${API_URL}/quiz/${quizId}`, { headers: authHeaders() });
    if (!response.ok) {
      throw new Error(await readError(response, "Failed to open that quiz"));
    }
    return response.json();
  },

  async uploadStudyMaterial(file: File): Promise<{ id: string; filename: string; preview: string; charCount: number; pageCount: number; kind: string }> {
    const token = localStorage.getItem("auth_token");
    if (!token) throw new Error("User not authenticated");
    const body = new FormData();
    body.append("file", file);
    const response = await fetch(`${API_URL}/materials`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body,
    });
    if (!response.ok) {
      throw new Error(await readError(response, "Could not read that document"));
    }
    return response.json();
  },

  async generateQuizFromMaterial(materialId: string, config: Pick<QuizConfig, "questionCount" | "difficulty" | "timeLimit">): Promise<Quiz> {
    const response = await fetch(`${API_URL}/materials/${materialId}/quiz`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(config),
    });
    if (!response.ok) {
      throw new Error(await readError(response, "Could not generate a quiz from this document"));
    }
    return response.json();
  },
};
