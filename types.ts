
export enum ConceptStatus {
  LOCKED = 'locked',
  UNLOCKED = 'unlocked',
  CURRENT = 'current',
  MASTERED = 'mastered',
  ASSESSMENT = 'assessment'
}

export interface ConceptNode {
  id: string;
  title: string;
  description: string;
  prerequisites: string[];
  category: string; // e.g., "Algebra", "Calculus Basics"
  estimatedTime: string; // e.g., "30 mins"
}

export interface ConceptContent {
  explanation: string;
  examples: string[];
  // realWorldApplications: string[]; // Future enhancement
}

export interface QuizQuestion {
  id: string;
  questionText: string;
  type: 'multiple-choice' | 'short-answer';
  options?: string[]; // For multiple-choice
  // correctAnswer?: string; // For auto-grading simple cases, Gemini will evaluate complex ones
}

export interface UserQuizAttempt {
  questionId: string;
  userAnswer: string;
  isCorrect?: boolean;
  feedback?: string;
}

export interface UserState {
  isOnboardingComplete: boolean;
  priorKnowledge: string[]; // topics user claims to know
  learningGoals: string[];  // user's stated goals
  masteredConceptIds: Set<string>;
  unlockedConceptIds: Set<string>;
  currentConceptId: string | null;
  assessmentScore?: number; // 0-100
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
  relatedConceptId?: string;
}

// Represents a simplified edge for visualization if needed
export interface KnowledgeGraphEdge {
  source: string; // conceptId
  target: string; // conceptId
  type: 'prerequisite' | 'related';
}

export interface KnowledgeGraph {
  concepts: ConceptNode[];
  // edges: KnowledgeGraphEdge[]; // if we draw lines later
}

export const MOCK_API_KEY = "mock_api_key_for_development_only";
// API key handling is now done via window.GEMINI_API_KEY set in index.tsx
// and read in geminiService.ts.

export interface GroundingChunkWeb {
  uri?: string; // Made optional to align with @google/genai type
  title?: string; // Made optional to align with @google/genai type
}

export interface GroundingChunk {
  web?: GroundingChunkWeb;
  retrievedPassage?: {
    passage: string;
    title?: string;
  };
}

// Video Presentation Types
export type NarrativeStage = 'hook' | 'discovery' | 'evolution' | 'application' | 'future';

export interface VideoSlide {
  stage: NarrativeStage;
  heading: string;
  narration: string;
  imagePrompt: string;
  imageUrl?: string;
  audioUrl?: string;
  duration?: number; // in seconds
}

export interface VideoOutline {
  title: string;
  conceptId: string;
  slides: VideoSlide[];
  estimatedDuration: number;
  generatedAt: Date;
}

export interface VideoMetadata {
  conceptId: string;
  title: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration: number;
  generatedAt: Date;
  fileSize?: number;
}

export interface VideoGenerationProgress {
  stage: 'outline' | 'images' | 'narration' | 'assembly' | 'complete';
  progress: number; // 0-100
  message: string;
  error?: string;
}