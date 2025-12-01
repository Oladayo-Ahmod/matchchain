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
  private openRouterApiKey?: string;

  constructor() {
    this.provider =
      (process.env.LLM_PROVIDER as any) ||
      (process.env.OLLAMA_HOST ? "ollama" : "fallback");

    console.log(`🤖 Using LLM Provider: ${this.provider}`);

    // --- OpenAI ---
    if (this.provider === "openai" && process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      console.log("✅ OpenAI initialized");
    }

    // --- Anthropic ---
    else if (this.provider === "anthropic" && process.env.ANTHROPIC_API_KEY) {
      this.anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });
      console.log("✅ Anthropic initialized");
    }

    // --- OpenRouter ---
    else if (this.provider === "openrouter") {
      this.openRouterApiKey = process.env.OPENROUTER_API_KEY;
      
      if (!this.openRouterApiKey) {
        console.error("❌ OpenRouter API key not found!");
        this.provider = "fallback";
      } else {
        // Initialize OpenAI client with OpenRouter settings
        this.openai = new OpenAI({
          baseURL: "https://openrouter.ai/api/v1",
          apiKey: this.openRouterApiKey,
          defaultHeaders: {
            "HTTP-Referer": "http://localhost:3000", // Required by OpenRouter
            "X-Title": "AI JobMatch", // Optional
          },
        });
        console.log("✅ OpenRouter initialized with key:", this.openRouterApiKey?.substring(0, 10) + "...");
      }
    }

    // --- Ollama ---
    else if (this.provider === "ollama") {
      console.log("✅ Using Ollama (local LLM)");
    }

    // --- Fallback ---
    else {
      console.warn("⚠️ No API provider available → Using fallback mode");
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
    const prompt = `Generate ${count} interview questions for a ${experienceLevel} level ${jobTitle} position.
Required skills: ${skills.join(', ')}

Return a JSON array of questions with this exact structure:
[
  {
    "id": "unique_id",
    "question": "the interview question",
    "type": "technical|behavioral|situational",
    "maxDuration": 120
  }
]

Make sure to include a mix of question types and focus on practical, role-specific questions.`;

    console.log(`📝 Generating ${count} questions for ${jobTitle}`);
    
    try {
      const content = await this.runLLM(prompt, 0.7); // Higher temp for creativity

      if (content) {
        console.log("✅ Got LLM response for questions");
        const questions = this.parseQuestions(content);
        console.log(`✅ Parsed ${questions.length} questions`);
        return questions;
      }
    } catch (err: any) {
      console.error("❌ LLM Error generating questions:", err.message || err);
    }

    console.log("⚠️ Falling back to default questions");
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
    // Build Q&A pairs with proper formatting
    const qaPairs = questions.map(q => {
      const answer = answers.find(a => a.questionId === q.id);
      return {
        question: q.question,
        answer: answer?.answer || 'No answer provided',
        type: q.type
      };
    });

    const prompt = `Evaluate these interview answers for a candidate applying to: ${jobRequirements}

Question-Answer Pairs:
${qaPairs.map(qa => `Q: ${qa.question}\nA: ${qa.answer}\nType: ${qa.type}\n---`).join('\n')}

Analyze the answers and provide:
1. Overall score (0.0 to 1.0) based on relevance, depth, and clarity
2. Specific feedback on performance
3. 3-5 strengths demonstrated
4. 3-5 areas for improvement

Return a JSON object with this exact structure:
{
  "score": 0.85,
  "feedback": "Overall feedback...",
  "strengths": ["strength1", "strength2", "strength3"],
  "improvements": ["improvement1", "improvement2", "improvement3"]
}`;

    console.log(`📊 Evaluating ${answers.length} answers for: ${jobRequirements}`);
    
    try {
      const content = await this.runLLM(prompt, 0.3); // Lower temp for consistency

      if (content) {
        console.log("✅ Got LLM response for evaluation");
        const evaluation = this.parseEvaluation(content);
        console.log(`✅ Evaluation score: ${evaluation.score}`);
        return evaluation;
      }
    } catch (err: any) {
      console.error("❌ LLM Error evaluating answers:", err.message || err);
    }

    console.log("⚠️ Falling back to default evaluation");
    return this.getFallbackEvaluation();
  }

  // ============================================================================
  // CORE LLM RUNNER — handles ALL providers
  // ============================================================================

  private async runLLM(prompt: string, temperature: number = 0.7): Promise<string | null> {
    console.log(`🚀 Running ${this.provider} with prompt length: ${prompt.length}`);
    
    switch (this.provider) {
      // --------------------------
      // OPENAI & OPENROUTER
      // --------------------------
      case "openai":
      case "openrouter":
        if (!this.openai) {
          console.error("❌ OpenAI client not initialized");
          return null;
        }

        try {
          const model = this.provider === "openrouter" 
            ? "x-ai/grok-4.1-fast:free"  // OpenRouter free model
            : "gpt-3.5-turbo";  // Default OpenAI model

          console.log(`🤖 Using model: ${model}`);
          
          const openaiRes = await this.openai.chat.completions.create({
            model,
            messages: [{ role: "user", content: prompt }],
            temperature,
            max_tokens: 2000,
          });

          const content = openaiRes.choices[0]?.message?.content;
          
          if (!content) {
            console.warn("⚠️ Empty response from LLM");
            return null;
          }

          console.log(`📄 Response length: ${content.length} chars`);
          return content;

        } catch (error: any) {
          console.error(`❌ ${this.provider.toUpperCase()} API Error:`, {
            message: error.message,
            status: error.status,
            code: error.code
          });
          throw error;
        }

      // --------------------------
      // ANTHROPIC
      // --------------------------
      case "anthropic":
        if (!this.anthropic) {
          console.error("❌ Anthropic client not initialized");
          return null;
        }

        try {
          const claudeRes = await this.anthropic.messages.create({
            model: "claude-3-haiku-20240307", // Faster/cheaper than Sonnet
            max_tokens: 2000,
            messages: [{ role: "user", content: prompt }],
            temperature,
          });

          return claudeRes.content[0]?.type === "text"
            ? claudeRes.content[0].text
            : null;

        } catch (error: any) {
          console.error("❌ Anthropic API Error:", error.message);
          throw error;
        }

      // --------------------------
      // OLLAMA (LOCAL)
      // --------------------------
      case "ollama":
        try {
          const ollamaRes = await axios.post(
            `${process.env.OLLAMA_HOST || "http://localhost:11434"}/api/generate`,
            {
              model: process.env.OLLAMA_MODEL || "llama3",
              prompt,
              stream: false,
              options: {
                temperature,
              },
            },
            { timeout: 60000 } // 60 second timeout
          );

          return ollamaRes.data?.response || null;

        } catch (error: any) {
          console.error("❌ Ollama Error:", error.message);
          throw error;
        }

      // --------------------------
      // FALLBACK
      // --------------------------
      default:
        console.warn("⚠️ Using fallback mode - no LLM response");
        return null;
    }
  }

  // ============================================================================
  // PARSERS
  // ============================================================================

  private parseQuestions(content: string): InterviewQuestion[] {
    console.log("🔍 Parsing questions from LLM response...");
    
    try {
      // Try to extract JSON from the response (in case there's extra text)
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      const jsonString = jsonMatch ? jsonMatch[0] : content;
      
      const parsed = JSON.parse(jsonString);
      
      if (Array.isArray(parsed)) {
        const questions = parsed.map((q: any, index: number) => ({
          id: q.id || `q_${Date.now()}_${index}`,
          question: q.question || `Question ${index + 1}`,
          type: this.validateQuestionType(q.type),
          maxDuration: q.maxDuration || 120,
        }));
        
        console.log(`✅ Successfully parsed ${questions.length} questions`);
        return questions;
      }
      
      throw new Error("Parsed content is not an array");
      
    } catch (err: any) {
      console.error("❌ Question JSON parse error:", err.message);
      console.log("📄 Raw content that failed to parse:", content.substring(0, 200) + "...");
      return this.getFallbackQuestions();
    }
  }

  private parseEvaluation(content: string): EvaluationResult {
    console.log("🔍 Parsing evaluation from LLM response...");
    
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : content;
      
      const parsed = JSON.parse(jsonString);
      
      const evaluation = {
        score: Math.min(Math.max(parsed.score || 0.5, 0), 1),
        feedback: parsed.feedback || "Evaluation completed.",
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
        improvements: Array.isArray(parsed.improvements) ? parsed.improvements : [],
      };
      
      console.log(`✅ Successfully parsed evaluation with score: ${evaluation.score}`);
      return evaluation;
      
    } catch (err: any) {
      console.error("❌ Evaluation JSON parse error:", err.message);
      console.log("📄 Raw content that failed to parse:", content.substring(0, 200) + "...");
      return this.getFallbackEvaluation();
    }
  }

  private validateQuestionType(type: string): "technical" | "behavioral" | "situational" {
    const validTypes = ["technical", "behavioral", "situational"];
    return validTypes.includes(type.toLowerCase()) ? type.toLowerCase() as any : "technical";
  }

  // ============================================================================
  // FALLBACKS
  // ============================================================================

  private getFallbackQuestions(
    jobTitle?: string,
    skills?: string[],
    count: number = 5
  ): InterviewQuestion[] {
    const baseQuestions: InterviewQuestion[] = [
      {
        id: 'fallback_1',
        question: `Tell me about your experience with ${skills?.[0] || 'relevant technologies'}`,
        type: 'technical',
        maxDuration: 120
      },
      {
        id: 'fallback_2',
        question: 'Describe a challenging project you worked on and how you overcame obstacles',
        type: 'behavioral',
        maxDuration: 180
      },
      {
        id: 'fallback_3',
        question: 'How do you approach learning new technologies?',
        type: 'behavioral',
        maxDuration: 120
      },
      {
        id: 'fallback_4',
        question: 'What coding best practices do you follow?',
        type: 'technical',
        maxDuration: 120
      },
      {
        id: 'fallback_5',
        question: 'How do you handle tight deadlines and multiple priorities?',
        type: 'situational',
        maxDuration: 120
      }
    ];

    return baseQuestions.slice(0, count);
  }

  private getFallbackEvaluation(): EvaluationResult {
    return {
      score: 0.7,
      feedback: 'Evaluation completed using fallback mode. Consider reconnecting LLM services for detailed analysis.',
      strengths: ['Good technical foundation', 'Clear communication'],
      improvements: ['Provide more specific examples', 'Demonstrate deeper expertise']
    };
  }
}

export const llmClient = new LLMClient();