
import { GoogleGenAI, GenerateContentResponse, Chat, GroundingChunk } from "@google/genai";
import { ConceptNode, QuizQuestion, ChatMessage } from '../types';
import { GEMINI_MODEL_TEXT, UI_MESSAGES } from '../constants';

// Read API_KEY from the global window object
const API_KEY = (window as any).GEMINI_API_KEY;

let ai: GoogleGenAI | null = null;
if (API_KEY) {
  ai = new GoogleGenAI({ apiKey: API_KEY });
} else {
  console.error(UI_MESSAGES.NO_API_KEY + " (geminiService.ts). Ensure window.GEMINI_API_KEY is set in index.tsx for development.");
}

const parseJsonFromMarkdown = <T,>(jsonString: string): T | null => {
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
};


export const geminiService = {
  isConfigured: () => !!ai && !!API_KEY,

  fetchConceptContent: async (concept: ConceptNode): Promise<{ explanation: string; examples: string[], groundingChunks?: GroundingChunk[] }> => {
    if (!ai) throw new Error(UI_MESSAGES.NO_API_KEY);
    try {
      const prompt = `Explain the concept "${concept.title}" which is about "${concept.description}". 
      Provide a clear explanation suitable for a student learning this topic. 
      Also, provide 2-3 distinct examples that illustrate the concept.
      
      IMPORTANT: For mathematical expressions, use LaTeX format:
      - Inline math: $expression$ (e.g., $x^2 + 2x + 1$)
      - Display math: $$expression$$ (e.g., $$\\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}$$)
      - Use proper LaTeX syntax for fractions, exponents, roots, etc.
      
      Format the response as JSON with keys "explanation" (string) and "examples" (array of strings).`;
      
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: GEMINI_MODEL_TEXT,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          // Potentially use Google Search for real-world examples or up-to-date info.
          // tools: [{googleSearch: {}}], 
        }
      });

      const parsed = parseJsonFromMarkdown<{ explanation: string; examples: string[] }>(response.text);
      if (!parsed) {
          throw new Error("Failed to parse concept content from AI response.");
      }
      
      // const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      // return { ...parsed, groundingChunks };
       return parsed;

    } catch (error) {
      console.error("Error fetching concept content:", error);
      throw new Error(UI_MESSAGES.API_ERROR);
    }
  },

  generateQuizQuestion: async (concept: ConceptNode): Promise<QuizQuestion> => {
    if (!ai) throw new Error(UI_MESSAGES.NO_API_KEY);
    try {
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

      const response: GenerateContentResponse = await ai.models.generateContent({
        model: GEMINI_MODEL_TEXT,
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      
      const parsed = parseJsonFromMarkdown<any>(response.text); // Use 'any' then validate
      if (!parsed || !parsed.id || !parsed.questionText || !parsed.type) {
         throw new Error("Failed to parse quiz question from AI response or missing required fields.");
      }
      // Simple validation for multiple choice
      if (parsed.type === 'multiple-choice' && (!Array.isArray(parsed.options) || typeof parsed.correctAnswerIndex !== 'number')) {
        // Fallback or re-prompt logic could be here. For now, try to make it a short answer.
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

  evaluateQuizAnswer: async (question: QuizQuestion, userAnswer: string): Promise<{ isCorrect: boolean; feedback: string }> => {
    if (!ai) throw new Error(UI_MESSAGES.NO_API_KEY);
    try {
      const prompt = `A student was asked the following question: "${question.questionText}".
      ${question.type === 'multiple-choice' && question.options ? `The options were: ${question.options.join(', ')}.` : ''}
      The student's answer was: "${userAnswer}".
      ${question.type === 'multiple-choice' && question.options && typeof (question as any).correctAnswerIndex === 'number' ? `The correct option is: "${question.options[(question as any).correctAnswerIndex]}".` : 'This is a short-answer question.'}
      
      Evaluate if the student's answer is correct. Provide brief feedback.
      Format the response as JSON with keys "isCorrect" (boolean) and "feedback" (string).`;

      const response: GenerateContentResponse = await ai.models.generateContent({
        model: GEMINI_MODEL_TEXT,
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      const parsed = parseJsonFromMarkdown<{ isCorrect: boolean; feedback: string }>(response.text);
      if (!parsed) {
          throw new Error("Failed to parse evaluation from AI response.");
      }
      return parsed;

    } catch (error) {
      console.error("Error evaluating quiz answer:", error);
      throw new Error(UI_MESSAGES.API_ERROR);
    }
  },

  getChatResponse: async (messages: ChatMessage[], currentConcept?: ConceptNode): Promise<{text: string, groundingChunks?: GroundingChunk[]}> => {
    if (!ai) throw new Error(UI_MESSAGES.NO_API_KEY);
    
    // Convert ChatMessage[] to Gemini's history format if needed, or just use the latest message.
    // For simplicity, we'll use a stateless approach here, but a real chat would build history.
    const lastUserMessage = messages.filter(m => m.sender === 'user').pop();
    if (!lastUserMessage) return {text: "I'm not sure how to respond to that."};

    let systemInstruction = "You are a helpful AI tutor. Assist the student with their learning questions.";
    if (currentConcept) {
      systemInstruction += ` The student is currently studying "${currentConcept.title}: ${currentConcept.description}". Try to relate your answers to this topic if relevant.`;
    }
    
    // For a more conversational experience, you'd use ai.chats.create() and chat.sendMessage()
    // For a one-off Q&A, generateContent is fine.

    try {
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: GEMINI_MODEL_TEXT,
        contents: lastUserMessage.text,
        config: {
            systemInstruction: systemInstruction,
            tools: [{googleSearch: {}}], // Enable search for relevant, up-to-date info
        }
      });
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      return {text: response.text, groundingChunks};
    } catch (error) {
      console.error("Error getting chat response:", error);
      throw new Error(UI_MESSAGES.API_ERROR);
    }
  },

  getInitialAssessmentGuidance: async (answers: { [questionId: string]: string }): Promise<{ recommendedStartingConceptIds: string[], feedback: string }> => {
    if (!ai) throw new Error(UI_MESSAGES.NO_API_KEY);
    try {
      const prompt = `A student has provided the following answers in an initial assessment:
      ${JSON.stringify(answers, null, 2)}
      
      Based on these answers, provide:
      1. Brief feedback to the student.
      2. A list of recommended concept IDs they should start with or have unlocked. Assume the available concept IDs are: intro, algebra_basics, linear_equations, functions_intro, quadratic_equations, graphing_functions, polynomials, calculus_intro. The 'intro' concept should always be recommended.
      
      Format the response as JSON with keys "feedback" (string) and "recommendedStartingConceptIds" (array of strings).`;

      const response: GenerateContentResponse = await ai.models.generateContent({
        model: GEMINI_MODEL_TEXT,
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      const parsed = parseJsonFromMarkdown<{ recommendedStartingConceptIds: string[], feedback: string }>(response.text);
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