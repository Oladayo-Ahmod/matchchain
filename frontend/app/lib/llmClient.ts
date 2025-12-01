import OpenAI from "openai";
import { Anthropic } from "@anthropic-ai/sdk";
import axios from "axios";

// -------------------------
// TYPES
// -------------------------

export interface InterviewQuestion {
  id: string;
  question: string;
  type: "technical" | "behavioral" | "situational";
  maxDuration?: number;
}

export interface EvaluationResult {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

// -------------------------
// LLM CLIENT
// -------------------------

class LLMClient {
  private provider:
    | "openai"
    | "anthropic"
    | "openrouter"
    | "ollama"
    | "fallback";

  private openai?: OpenAI;
  private anthropic?: Anthropic;

  constructor() {
    this.provider =
      (process.env.LLM_PROVIDER as any) ||
      (process.env.OLLAMA_HOST ? "ollama" : "fallback");

    // --- OpenAI ---
    if (this.provider === "openai" && process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }

    // --- Anthropic ---
    else if (this.provider === "anthropic" && process.env.ANTHROPIC_API_KEY) {
      this.anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });
    }

    // --- OpenRouter ---
    else if (this.provider === "openrouter" && process.env.OPENROUTER_API_KEY) {

      console.log(process.env.OPENROUTER_API_KEY,'<<<<<<<<<<');
      this.openai = new OpenAI({
        apiKey: process.env.OPENROUTER_API_KEY,
        baseURL: "https://openrouter.ai/api/v1",
      });
    }

    // --- Ollama ---
    else if (this.provider === "ollama") {
      console.log("Using Ollama (local LLM)");
    }

    // --- Fallback ---
    else {
      console.warn("No API provider available → Using fallback mode");
      this.provider = "fallback";
    }
  }

  // ============================================================================
  // GENERATE INTERVIEW QUESTIONS
  // ============================================================================

  async generateInterviewQuestions(
    jobTitle: string,
    skills: string[],
    experienceLevel: "entry" | "mid" | "senior",
    count: number = 5
  ): Promise<InterviewQuestion[]> {
    const prompt = `Generate ${count} interview questions for a ${experienceLevel} ${jobTitle}.
Skills: ${skills.join(", ")}

Return ONLY valid JSON array:
[
  {
    "id": "unique_id", 
    "question": "...",
    "type": "technical|behavioral|situational",
    "maxDuration": 120
  }
]`;

    try {
      const content = await this.runLLM(prompt);

      if (content) return this.parseQuestions(content);
    } catch (err) {
      console.error("LLM Error:", err);
    }

    return this.getFallbackQuestions(jobTitle, skills, count);
  }

  // ============================================================================
  // EVALUATE ANSWERS
  // ============================================================================

  async evaluateAnswers(
    questions: InterviewQuestion[],
    answers: { questionId: string; answer: string }[],
    jobRequirements: string
  ): Promise<EvaluationResult> {
    const qaPairs = questions
      .map((q) => {
        const answer = answers.find((a) => a.questionId === q.id);
        return `Q: ${q.question}\nA: ${
          answer?.answer || "No answer provided"
        }\nType: ${q.type}\n---`;
      })
      .join("\n");

    const prompt = `Evaluate the following interview answers for role: ${jobRequirements}

${qaPairs}

Return ONLY valid JSON:
{
  "score": 0.85,
  "feedback": "...",
  "strengths": ["..."],
  "improvements": ["..."]
}`;

    try {
      const content = await this.runLLM(prompt);

      if (content) return this.parseEvaluation(content);
    } catch (err) {
      console.error("LLM Error:", err);
    }

    return this.getFallbackEvaluation();
  }

  // ============================================================================
  // CORE LLM RUNNER — handles ALL providers
  // ============================================================================

  private async runLLM(prompt: string): Promise<string | null> {
    switch (this.provider) {
      // --------------------------
      // OPENAI
      // --------------------------
      case "openai":
      case "openrouter":
        if (!this.openai) return null;

        const openaiRes = await this.openai.chat.completions.create({
          model:
            this.provider === "openrouter"
              ? "x-ai/grok-4.1-fast:free"
              : "x-ai/grok-4.1-fast:free",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
        });

        return openaiRes.choices[0]?.message?.content || null;

      // --------------------------
      // ANTHROPIC
      // --------------------------
      case "anthropic":
        if (!this.anthropic) return null;

        const claudeRes = await this.anthropic.messages.create({
          model: "claude-3-sonnet-20240229",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        });

        return claudeRes.content[0]?.type === "text"
          ? claudeRes.content[0].text
          : null;

      // --------------------------
      // OLLAMA (LOCAL)
      // --------------------------
      case "ollama":
        const ollamaRes = await axios.post(
          `${process.env.OLLAMA_HOST || "http://localhost:11434"}/api/generate`,
          {
            model: process.env.OLLAMA_MODEL || "llama3",
            prompt,
            stream: false,
          }
        );

        return ollamaRes.data?.response || null;

      // --------------------------
      // FALLBACK
      // --------------------------
      default:
        return null;
    }
  }

  // ============================================================================
  // PARSERS
  // ============================================================================

  private parseQuestions(content: string): InterviewQuestion[] {
    try {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        return parsed.map((q: any) => ({
          id: q.id || `q_${Date.now()}_${Math.random()}`,
          question: q.question,
          type: q.type || "technical",
          maxDuration: q.maxDuration || 120,
        }));
      }
    } catch (err) {
      console.error("Question JSON parse error:", err);
    }
    return this.getFallbackQuestions();
  }

  private parseEvaluation(content: string): EvaluationResult {
    try {
      const parsed = JSON.parse(content);
      return {
        score: Math.min(Math.max(parsed.score || 0.5, 0), 1),
        feedback: parsed.feedback || "Evaluation complete",
        strengths: parsed.strengths || [],
        improvements: parsed.improvements || [],
      };
    } catch (err) {
      console.error("Evaluation JSON parse error:", err);
      return this.getFallbackEvaluation();
    }
  }

  // ============================================================================
  // FALLBACKS
  // ============================================================================

  private getFallbackQuestions(
    jobTitle?: string,
    skills?: string[],
    count: number = 5
  ): InterviewQuestion[] {
    return [
      {
        id: "fallback_1",
        question: `Tell me about your experience with ${
          skills?.[0] || "relevant technologies"
        }`,
        type: "technical" as const,
        maxDuration: 120,
      },
      {
        id: "fallback_2",
        question:
          "Describe a challenging project you worked on and how you handled it.",
        type: "behavioral" as const,
        maxDuration: 180,
      },
      {
        id: "fallback_3",
        question: "How do you learn new technologies?",
        type: "behavioral" as const,
        maxDuration: 120,
      },
      {
        id: "fallback_4",
        question: "What coding best practices do you follow?",
        type: "technical" as const,
        maxDuration: 150,
      },
      {
        id: "fallback_5",
        question: "How do you handle multiple priorities and tight deadlines?",
        type: "situational" as const,
        maxDuration: 120,
      },
    ].slice(0, count);
  }

  private getFallbackEvaluation(): EvaluationResult {
    return {
      score: 0.7,
      feedback:
        "Evaluation completed using fallback mode. Connect an LLM provider for detailed scoring.",
      strengths: ["Good communication", "Solid technical foundation"],
      improvements: ["Provide more examples", "Be more concise"],
    };
  }
}

export const llmClient = new LLMClient();
