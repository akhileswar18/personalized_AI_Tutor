import { ConceptNode, QuizQuestion, ChatMessage } from '../types';
import { GEMINI_MODEL_TEXT, UI_MESSAGES } from '../constants';

// Unified AI service that can work with multiple providers
export const aiService = {
  isConfigured: (): boolean => {
    return !!(window as any).GEMINI_API_KEY || !!(window as any).GROQ_API_KEY;
  },

  getProvider: (): 'gemini' | 'groq' | null => {
    if ((window as any).GEMINI_API_KEY) return 'gemini';
    if ((window as any).GROQ_API_KEY) return 'groq';
    return null;
  },

  async makeRequest(prompt: string, systemInstruction?: string): Promise<string> {
    const provider = this.getProvider();
    
    if (!provider) {
      throw new Error(UI_MESSAGES.NO_API_KEY);
    }

    if (provider === 'groq') {
      return this.makeGroqRequest(prompt, systemInstruction);
    } else {
      return this.makeGeminiRequest(prompt, systemInstruction);
    }
  },

  async makeGroqRequest(prompt: string, systemInstruction?: string): Promise<string> {
    const apiKey = (window as any).GROQ_API_KEY;
    if (!apiKey) throw new Error('GROQ_API_KEY not configured');

    const messages = [];
    if (systemInstruction) {
      messages.push({ role: 'system', content: systemInstruction });
    }
    messages.push({ role: 'user', content: prompt });

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages,
        temperature: 0.7,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  },

  async makeGeminiRequest(prompt: string, systemInstruction?: string): Promise<string> {
    const { GoogleGenAI } = await import('@google/genai');
    const apiKey = (window as any).GEMINI_API_KEY;
    
    if (!apiKey) throw new Error('GEMINI_API_KEY not configured');

    const ai = new GoogleGenAI({ apiKey });
    
    const fullPrompt = systemInstruction ? `${systemInstruction}\n\n${prompt}` : prompt;
    
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: fullPrompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    return response.text;
  },

  parseJsonFromMarkdown<T>(jsonString: string): T | null {
    let cleanJsonString = jsonString.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = cleanJsonString.match(fenceRegex);
    if (match && match[2]) {
      cleanJsonString = match[2].trim();
    }
    try {
      return JSON.parse(cleanJsonString) as T;
    } catch (error) {
      console.error("Failed to parse JSON response:", error, "Original string:", jsonString);
      return null;
    }
  },

  async fetchConceptContent(concept: ConceptNode): Promise<{ explanation: string; examples: string[] }> {
    const prompt = `Explain the concept "${concept.title}" which is about "${concept.description}". 
    Provide a clear explanation suitable for a student learning this topic. 
    Also, provide 2-3 distinct examples that illustrate the concept.
    
    IMPORTANT: For mathematical expressions, use LaTeX format:
    - Inline math: $expression$ (e.g., $x^2 + 2x + 1$)
    - Display math: $$expression$$ (e.g., $$\\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}$$)
    - Use proper LaTeX syntax for fractions, exponents, roots, etc.
    
    Format the response as JSON with keys "explanation" (string) and "examples" (array of strings).`;

    try {
      const response = await this.makeRequest(prompt);
      const parsed = this.parseJsonFromMarkdown<{ explanation: string; examples: string[] }>(response);
      
      if (!parsed) {
        throw new Error("Failed to parse concept content from AI response.");
      }
      
      return parsed;
    } catch (error) {
      console.error("Error fetching concept content:", error);
      throw new Error(UI_MESSAGES.API_ERROR);
    }
  },

  async generateQuizQuestion(concept: ConceptNode): Promise<QuizQuestion> {
    const prompt = `Generate a single quiz question to test understanding of the concept "${concept.title}" (${concept.description}).
    The question should be challenging but fair.
    Format the response as a JSON object with keys: 
    "id" (string, use concept.id + "_q1"), 
    "questionText" (string), 
    "type" (string, either "multiple-choice" or "short-answer").
    If "multiple-choice", include "options" (array of 3-4 strings) and "correctAnswerIndex" (number, 0-based index of the correct option).
    If "short-answer", do not include options or correctAnswerIndex. We will evaluate short answers separately.
    Example for multiple-choice: {"id": "example_q1", "questionText": "What is 2+2?", "type": "multiple-choice", "options": ["3", "4", "5"], "correctAnswerIndex": 1}
    Example for short-answer: {"id": "example_q2", "questionText": "Explain the Pythagorean theorem in one sentence.", "type": "short-answer"}`;

    try {
      const response = await this.makeRequest(prompt);
      const parsed = this.parseJsonFromMarkdown<any>(response);
      
      if (!parsed || !parsed.id || !parsed.questionText || !parsed.type) {
        throw new Error("Failed to parse quiz question from AI response or missing required fields.");
      }
      
      // Simple validation for multiple choice
      if (parsed.type === 'multiple-choice' && (!Array.isArray(parsed.options) || typeof parsed.correctAnswerIndex !== 'number')) {
        console.warn("Multiple choice question from AI was malformed, converting to short-answer.");
        return {
          id: parsed.id,
          questionText: parsed.questionText + " (Please provide a detailed answer)",
          type: 'short-answer'
        };
      }
      
      return parsed as QuizQuestion;
    } catch (error) {
      console.error("Error generating quiz question:", error);
      throw new Error(UI_MESSAGES.API_ERROR);
    }
  },

  async evaluateQuizAnswer(question: QuizQuestion, userAnswer: string): Promise<{ isCorrect: boolean; feedback: string }> {
    const prompt = `A student was asked the following question: "${question.questionText}".
    ${question.type === 'multiple-choice' && question.options ? `The options were: ${question.options.join(', ')}.` : ''}
    The student's answer was: "${userAnswer}".
    ${question.type === 'multiple-choice' && question.options && typeof (question as any).correctAnswerIndex === 'number' ? `The correct option is: "${question.options[(question as any).correctAnswerIndex]}".` : 'This is a short-answer question.'}
    
    Evaluate if the student's answer is correct. Provide brief feedback.
    Format the response as JSON with keys "isCorrect" (boolean) and "feedback" (string).`;

    try {
      const response = await this.makeRequest(prompt);
      const parsed = this.parseJsonFromMarkdown<{ isCorrect: boolean; feedback: string }>(response);
      
      if (!parsed) {
        throw new Error("Failed to parse evaluation from AI response.");
      }
      
      return parsed;
    } catch (error) {
      console.error("Error evaluating quiz answer:", error);
      throw new Error(UI_MESSAGES.API_ERROR);
    }
  },

  async getChatResponse(messages: ChatMessage[], currentConcept?: ConceptNode): Promise<{text: string}> {
    const lastUserMessage = messages.filter(m => m.sender === 'user').pop();
    if (!lastUserMessage) return {text: "I'm not sure how to respond to that."};

    let systemInstruction = "You are a helpful AI tutor. Assist the student with their learning questions.";
    if (currentConcept) {
      systemInstruction += ` The student is currently studying "${currentConcept.title}: ${currentConcept.description}". Try to relate your answers to this topic if relevant.`;
    }

    try {
      const response = await this.makeRequest(lastUserMessage.text, systemInstruction);
      return {text: response};
    } catch (error) {
      console.error("Error getting chat response:", error);
      throw new Error(UI_MESSAGES.API_ERROR);
    }
  },

  async getInitialAssessmentGuidance(answers: { [questionId: string]: string }): Promise<{ recommendedStartingConceptIds: string[], feedback: string }> {
    const prompt = `A student has provided the following answers in an initial assessment:
    ${JSON.stringify(answers, null, 2)}
    
    Based on these answers, provide:
    1. Brief feedback to the student.
    2. A list of recommended concept IDs they should start with or have unlocked. Assume the available concept IDs are: intro, algebra_basics, linear_equations, functions_intro, quadratic_equations, graphing_functions, polynomials, calculus_intro, systems_equations, inequalities, function_operations, quadratic_functions, rational_expressions, radicals, exponential_functions, logarithmic_functions, trigonometry_intro, trig_functions, trig_identities, limits, derivatives, applications_derivatives, descriptive_stats, probability_basics, normal_distribution, coordinate_geometry, triangle_properties, circle_properties. The 'intro' concept should always be recommended.
    
    Format the response as JSON with keys "feedback" (string) and "recommendedStartingConceptIds" (array of strings).`;

    try {
      const response = await this.makeRequest(prompt);
      const parsed = this.parseJsonFromMarkdown<{ recommendedStartingConceptIds: string[], feedback: string }>(response);
      
      if (!parsed || !parsed.recommendedStartingConceptIds || !parsed.feedback) {
        throw new Error("Failed to parse assessment guidance from AI.");
      }
      
      // Ensure 'intro' is always included
      if (!parsed.recommendedStartingConceptIds.includes('intro')) {
        parsed.recommendedStartingConceptIds.push('intro');
      }
      
      return parsed;
    } catch (error) {
      console.error("Error getting initial assessment guidance:", error);
      throw new Error(UI_MESSAGES.API_ERROR);
    }
  }
};
