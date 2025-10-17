
import React, { useState, useCallback } from 'react';
import { INITIAL_ASSESSMENT_QUESTIONS, UI_MESSAGES } from '../constants';
import { QuizQuestion, UserState } from '../types';
import { aiService } from '../services/aiService';
import LoadingSpinner from './LoadingSpinner';
import Alert from './Alert';

interface OnboardingFlowProps {
  onOnboardingComplete: (updatedUserState: Partial<UserState>) => void;
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onOnboardingComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState('');


  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };
  
  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserName(event.target.value);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < INITIAL_ASSESSMENT_QUESTIONS.length -1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      submitAssessment();
    }
  };
  
  const currentQuestion: QuizQuestion | undefined = INITIAL_ASSESSMENT_QUESTIONS[currentQuestionIndex];

  const submitAssessment = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    if (!aiService.isConfigured()) {
      setError(UI_MESSAGES.NO_API_KEY);
      setIsLoading(false);
      // Fallback: simple logic if API not configured
      onOnboardingComplete({ 
        isOnboardingComplete: true, 
        priorKnowledge: Object.values(answers), // Simplified
        learningGoals: [answers['q3'] || 'General learning'],
        unlockedConceptIds: new Set(['intro', 'algebra_basics']), // Default unlock
        currentConceptId: 'intro'
      });
      return;
    }

    try {
      const allAnswers = {...answers, userName};
      const guidance = await aiService.getInitialAssessmentGuidance(allAnswers);
      
      const learningGoals = answers['q3'] ? [answers['q3']] : ['General improvement'];
      const priorKnowledge = Object.values(answers).filter((_,idx) => idx < INITIAL_ASSESSMENT_QUESTIONS.length -1); // Exclude goals question

      onOnboardingComplete({
        isOnboardingComplete: true,
        priorKnowledge: priorKnowledge,
        learningGoals: learningGoals,
        unlockedConceptIds: new Set(guidance.recommendedStartingConceptIds),
        currentConceptId: guidance.recommendedStartingConceptIds.includes('intro') ? 'intro' : (guidance.recommendedStartingConceptIds[0] || null),
        // assessmentScore could be derived here if Gemini provided one
      });
      // Optionally, show guidance.feedback to user
    } catch (e: any) {
      setError(e.message || UI_MESSAGES.API_ERROR);
      // Fallback on error
       onOnboardingComplete({ 
        isOnboardingComplete: true, 
        priorKnowledge: Object.values(answers),
        learningGoals: [answers['q3'] || 'General learning'],
        unlockedConceptIds: new Set(['intro', 'algebra_basics']),
        currentConceptId: 'intro'
      });
    } finally {
      setIsLoading(false);
    }
  }, [answers, userName, onOnboardingComplete]);


  if (!currentQuestion) {
    return (
      <div className="p-8 max-w-2xl mx-auto bg-slate-800 shadow-xl rounded-lg">
         <h2 className="text-3xl font-bold mb-6 text-primary-400">Welcome!</h2>
         <p className="mb-4 text-slate-300">Let's get to know you. What should we call you?</p>
         <input
            type="text"
            value={userName}
            onChange={handleNameChange}
            placeholder="Your Name"
            className="w-full p-3 mb-6 bg-slate-700 border border-slate-600 rounded-md focus:ring-2 focus:ring-primary-500 outline-none text-slate-100"
          />
          <button
            onClick={() => { if(userName.trim() !== '') setCurrentQuestionIndex(0); else alert("Please enter your name.") }}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-4 rounded-md transition duration-150 ease-in-out disabled:opacity-50"
            disabled={isLoading || userName.trim() === ''}
          >
            Start Assessment
          </button>
      </div>
    );
  }


  return (
    <div className="p-8 max-w-2xl mx-auto bg-slate-800 shadow-xl rounded-lg">
      <h2 className="text-3xl font-bold mb-2 text-primary-400">Welcome, {userName}!</h2>
      <p className="text-slate-400 mb-6">Let's personalize your learning path. ({currentQuestionIndex + 1}/{INITIAL_ASSESSMENT_QUESTIONS.length})</p>
      
      {error && <Alert message={error} type="error" onClose={() => setError(null)} />}

      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-3 text-slate-200">{currentQuestion.questionText}</h3>
        {currentQuestion.type === 'multiple-choice' && currentQuestion.options ? (
          <div className="space-y-2">
            {currentQuestion.options.map((option, index) => (
              <label key={index} className="flex items-center p-3 bg-slate-700 rounded-md hover:bg-slate-600 cursor-pointer">
                <input
                  type="radio"
                  name={currentQuestion.id}
                  value={option}
                  checked={answers[currentQuestion.id] === option}
                  onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                  className="form-radio h-5 w-5 text-primary-600 bg-slate-800 border-slate-500 focus:ring-primary-500"
                />
                <span className="ml-3 text-slate-200">{option}</span>
              </label>
            ))}
          </div>
        ) : (
          <textarea
            value={answers[currentQuestion.id] || ''}
            onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
            rows={3}
            className="w-full p-3 bg-slate-700 border border-slate-600 rounded-md focus:ring-2 focus:ring-primary-500 outline-none text-slate-100"
            placeholder="Your answer..."
          />
        )}
      </div>

      <button
        onClick={nextQuestion}
        className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-4 rounded-md transition duration-150 ease-in-out disabled:opacity-50"
        disabled={isLoading || !answers[currentQuestion.id]}
      >
        {isLoading ? <LoadingSpinner size="sm" /> : (currentQuestionIndex < INITIAL_ASSESSMENT_QUESTIONS.length - 1 ? 'Next Question' : 'Finish Assessment')}
      </button>
    </div>
  );
};

export default OnboardingFlow;
