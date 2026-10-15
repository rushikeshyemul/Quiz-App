const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash";

const DIFFICULTY = {
  easy: "simple questions for beginners",
  medium: "moderately tricky questions that need some understanding",
  hard: "concept based questions for confident learners",
};

const QUIZ_SCHEMA = {
  type: "OBJECT",
  properties: {
    questions: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          question: { type: "STRING" },
          options: {
            type: "ARRAY",
            items: { type: "STRING" },
          },
          correctAnswer: { type: "INTEGER" },
          explanation: { type: "STRING" },
        },
        required: ["question", "options", "correctAnswer", "explanation"],
      },
    },
  },
  required: ["questions"],
};

function buildPrompt({ topic, questionCount, difficulty }) {
  return `Generate ${questionCount} multiple choice questions about ${topic} at ${DIFFICULTY[difficulty]} difficulty.

Requirements:
- Each question must have exactly 4 options
- Only one correct answer per question
- correctAnswer is the index of the correct option, from 0 to 3
- Include a brief explanation for the correct answer
- Questions must be relevant to ${topic}
- Avoid overly trivial or extremely obscure questions`;
}

function parseQuizJson(text) {
  const trimmed = text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/, "")
    .trim();
  return JSON.parse(trimmed);
}

function normalizeQuestions(raw, count) {
  if (!raw || !Array.isArray(raw.questions)) {
    throw new Error("Gemini returned an unexpected quiz format");
  }

  const questions = raw.questions.slice(0, count).map((item, index) => {
    const options = Array.isArray(item.options)
      ? item.options.map((option) => String(option)).slice(0, 4)
      : [];
    const correctAnswer = Number(item.correctAnswer);

    if (!item.question || options.length !== 4) {
      throw new Error("Gemini returned a question without 4 options");
    }
    if (!Number.isInteger(correctAnswer) || correctAnswer < 0 || correctAnswer > 3) {
      throw new Error("Gemini returned an invalid correct answer");
    }

    return {
      id: `q${index + 1}`,
      question: String(item.question),
      options,
      correctAnswer,
      explanation: item.explanation ? String(item.explanation) : "",
    };
  });

  if (questions.length === 0) {
    throw new Error("Gemini returned no questions");
  }

  return questions;
}

export function isGeminiConfigured() {
  const key = process.env.GEMINI_API_KEY;
  return Boolean(key && key !== "your_gemini_api_key_here");
}

export async function generateQuizWithGemini({ topic, questionCount, difficulty }) {
  const apiKey = process.env.GEMINI_API_KEY;
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [
            {
              text: "You are an expert quiz generator. Return only the quiz JSON requested by the schema.",
            },
          ],
        },
        contents: [
          {
            role: "user",
            parts: [{ text: buildPrompt({ topic, questionCount, difficulty }) }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8192,
          responseMimeType: "application/json",
          responseSchema: QUIZ_SCHEMA,
        },
      }),
    }
  );

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Gemini request failed (${response.status}): ${details}`);
  }

  const payload = await response.json();
  const text = payload.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || "")
    .join("");

  if (!text) {
    throw new Error("Gemini returned no quiz content");
  }

  return normalizeQuestions(parseQuizJson(text), questionCount);
}
