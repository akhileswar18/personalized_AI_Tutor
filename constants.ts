
import { KnowledgeGraph, ConceptNode, QuizQuestion } from './types';

export const APP_TITLE = "Personalized AI Tutor";

export const INITIAL_ASSESSMENT_QUESTIONS: QuizQuestion[] = [
  { id: 'q1', questionText: "What is your current level of understanding of basic algebra (e.g., solving linear equations)?", type: 'multiple-choice', options: ['Beginner', 'Intermediate', 'Advanced'] },
  { id: 'q2', questionText: "Are you familiar with the concept of functions in mathematics?", type: 'multiple-choice', options: ['Not at all', 'Somewhat', 'Very familiar'] },
  { id: 'q3', questionText: "What are your primary goals for using this tutor?", type: 'short-answer'},
];

export const INITIAL_KNOWLEDGE_GRAPH: KnowledgeGraph = {
  concepts: [
    // Getting Started
    { id: 'intro', title: "Introduction to Personalized Learning", description: "Understanding how this tutor works and setting up your learning path.", prerequisites: [], category: "Getting Started", estimatedTime: "10 mins" },
    
    // Algebra Foundation
    { id: 'algebra_basics', title: "Algebra Basics", description: "Fundamental concepts of algebra including variables, expressions, and equations.", prerequisites: ['intro'], category: "Algebra", estimatedTime: "1 hr" },
    { id: 'linear_equations', title: "Linear Equations", description: "Solving and graphing linear equations using various methods.", prerequisites: ['algebra_basics'], category: "Algebra", estimatedTime: "1.5 hrs" },
    { id: 'systems_equations', title: "Systems of Linear Equations", description: "Solving systems of equations using substitution, elimination, and graphing methods.", prerequisites: ['linear_equations'], category: "Algebra", estimatedTime: "2 hrs" },
    { id: 'inequalities', title: "Linear Inequalities", description: "Solving and graphing linear inequalities in one and two variables.", prerequisites: ['linear_equations'], category: "Algebra", estimatedTime: "1.5 hrs" },
    
    // Functions
    { id: 'functions_intro', title: "Introduction to Functions", description: "Understanding what functions are, their notation, and types.", prerequisites: ['algebra_basics'], category: "Functions", estimatedTime: "1 hr" },
    { id: 'graphing_functions', title: "Graphing Functions", description: "Visualizing functions on a coordinate plane and understanding key features.", prerequisites: ['functions_intro'], category: "Functions", estimatedTime: "1.5 hrs" },
    { id: 'function_operations', title: "Function Operations", description: "Adding, subtracting, multiplying, and composing functions.", prerequisites: ['functions_intro'], category: "Functions", estimatedTime: "2 hrs" },
    
    // Quadratic and Polynomial
    { id: 'quadratic_equations', title: "Quadratic Equations", description: "Solving quadratic equations using factoring, completing the square, and the quadratic formula.", prerequisites: ['linear_equations'], category: "Algebra", estimatedTime: "2 hrs" },
    { id: 'quadratic_functions', title: "Quadratic Functions", description: "Understanding the properties and graphs of quadratic functions.", prerequisites: ['quadratic_equations', 'graphing_functions'], category: "Functions", estimatedTime: "2 hrs" },
    { id: 'polynomials', title: "Polynomials", description: "Working with polynomial expressions, factoring, and polynomial functions.", prerequisites: ['quadratic_equations', 'functions_intro'], category: "Algebra", estimatedTime: "2.5 hrs" },
    { id: 'rational_expressions', title: "Rational Expressions", description: "Simplifying, multiplying, dividing, and solving rational expressions and equations.", prerequisites: ['polynomials'], category: "Algebra", estimatedTime: "2 hrs" },
    
    // Advanced Algebra
    { id: 'radicals', title: "Radicals and Rational Exponents", description: "Working with square roots, cube roots, and rational exponents.", prerequisites: ['algebra_basics'], category: "Algebra", estimatedTime: "1.5 hrs" },
    { id: 'exponential_functions', title: "Exponential Functions", description: "Understanding exponential growth and decay, and solving exponential equations.", prerequisites: ['functions_intro'], category: "Functions", estimatedTime: "2 hrs" },
    { id: 'logarithmic_functions', title: "Logarithmic Functions", description: "Introduction to logarithms, their properties, and solving logarithmic equations.", prerequisites: ['exponential_functions'], category: "Functions", estimatedTime: "2 hrs" },
    
    // Trigonometry
    { id: 'trigonometry_intro', title: "Introduction to Trigonometry", description: "Understanding angles, the unit circle, and basic trigonometric ratios.", prerequisites: ['graphing_functions'], category: "Trigonometry", estimatedTime: "2 hrs" },
    { id: 'trig_functions', title: "Trigonometric Functions", description: "Sine, cosine, tangent functions and their graphs and properties.", prerequisites: ['trigonometry_intro'], category: "Trigonometry", estimatedTime: "2.5 hrs" },
    { id: 'trig_identities', title: "Trigonometric Identities", description: "Fundamental trigonometric identities and their applications.", prerequisites: ['trig_functions'], category: "Trigonometry", estimatedTime: "2 hrs" },
    
    // Calculus Introduction
    { id: 'calculus_intro', title: "Introduction to Calculus", description: "A high-level overview of what calculus is and its main branches.", prerequisites: ['polynomials', 'graphing_functions'], category: "Calculus", estimatedTime: "45 mins" },
    { id: 'limits', title: "Limits", description: "Understanding the concept of limits and their applications.", prerequisites: ['calculus_intro'], category: "Calculus", estimatedTime: "2 hrs" },
    { id: 'derivatives', title: "Derivatives", description: "Introduction to derivatives, their meaning, and basic differentiation rules.", prerequisites: ['limits'], category: "Calculus", estimatedTime: "3 hrs" },
    { id: 'applications_derivatives', title: "Applications of Derivatives", description: "Using derivatives to solve optimization problems and analyze function behavior.", prerequisites: ['derivatives'], category: "Calculus", estimatedTime: "2.5 hrs" },
    
    // Statistics and Probability
    { id: 'descriptive_stats', title: "Descriptive Statistics", description: "Measures of central tendency, variability, and data visualization.", prerequisites: ['algebra_basics'], category: "Statistics", estimatedTime: "2 hrs" },
    { id: 'probability_basics', title: "Probability Basics", description: "Fundamental concepts of probability, sample spaces, and events.", prerequisites: ['descriptive_stats'], category: "Statistics", estimatedTime: "2 hrs" },
    { id: 'normal_distribution', title: "Normal Distribution", description: "Understanding the normal distribution and z-scores.", prerequisites: ['probability_basics'], category: "Statistics", estimatedTime: "1.5 hrs" },
    
    // Geometry
    { id: 'coordinate_geometry', title: "Coordinate Geometry", description: "Distance formula, midpoint, and equations of lines and circles.", prerequisites: ['algebra_basics'], category: "Geometry", estimatedTime: "2 hrs" },
    { id: 'triangle_properties', title: "Triangle Properties", description: "Angles, sides, and special triangles including right triangles.", prerequisites: ['coordinate_geometry'], category: "Geometry", estimatedTime: "1.5 hrs" },
    { id: 'circle_properties', title: "Circle Properties", description: "Arcs, chords, tangents, and inscribed angles in circles.", prerequisites: ['triangle_properties'], category: "Geometry", estimatedTime: "2 hrs" },
  ]
};

export const GEMINI_MODEL_TEXT = 'gemini-2.5-flash-preview-04-17';
export const GEMINI_MODEL_IMAGE = 'imagen-3.0-generate-002';

export const UI_MESSAGES = {
  LOADING_CONTENT: "Loading content from AI tutor...",
  LOADING_QUIZ: "Generating quiz...",
  EVALUATING_ANSWER: "Evaluating your answer...",
  LOADING_HINT: "Getting a hint...",
  NO_API_KEY: "Gemini API Key is not configured. Please set the API_KEY environment variable.",
  API_ERROR: "An error occurred while communicating with the AI. Please try again.",
  CONCEPT_MASTERED: "Congratulations! You've mastered this concept.",
  QUIZ_PASSED: "Great job! Quiz passed.",
  QUIZ_FAILED: "Keep trying! Review the material and attempt the quiz again.",
};
