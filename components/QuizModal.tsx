
import React, { useState, useEffect, useCallback } from 'react';
import { ConceptNode, QuizQuestion, UserQuizAttempt } from '../types';
import { aiService } from '../services/aiService';
import { UI_MESSAGES } from '../constants';
import LoadingSpinner from './LoadingSpinner';
import Alert from './Alert';

interface QuizModalProps {
  concept: ConceptNode;
  isOpen: boolean;
  onClose: () => void;
  onQuizComplete: (conceptId: string, passed: boolean) => void;
}

const QuizModal: React.FC<QuizModalProps> = ({ concept, isOpen, onClose, onQuizComplete }) => {
  const [quizQuestion, setQuizQuestion] = useState<QuizQuestion | null>(null);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [attemptResult, setAttemptResult] = useState<UserQuizAttempt | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuiz = useCallback(async () => {
    if (!concept || !aiService.isConfigured()) {
      if (!aiService.isConfigured()) setError(UI_MESSAGES.NO_API_KEY);
      return;
    }
    setIsLoading(true);
    setError(null);
    setAttemptResult(null);
    setUserAnswer('');
    try {
      const question = await aiService.generateQuizQuestion(concept);
      setQuizQuestion(question);
    } catch (e: any) {
      setError(e.message || UI_MESSAGES.API_ERROR);
    } finally {
      setIsLoading(false);
    }
  }, [concept]);

  useEffect(() => {
    if (isOpen && concept) {
      fetchQuiz();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, concept]); // fetchQuiz is memoized

  const handleSubmitAnswer = async () => {
    if (!quizQuestion || !userAnswer.trim() || !aiService.isConfigured()) {
       if (!aiService.isConfigured()) setError(UI_MESSAGES.NO_API_KEY);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await aiService.evaluateQuizAnswer(quizQuestion, userAnswer);
      setAttemptResult({
        questionId: quizQuestion.id,
        userAnswer: userAnswer,
        isCorrect: result.isCorrect,
        feedback: result.feedback,
      });
      if (result.isCorrect) {
        // onQuizComplete(concept.id, true); // Don't auto-close, let user see feedback
      }
    } catch (e: any) {
      setError(e.message || UI_MESSAGES.API_ERROR);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleProceed = () => {
    if (attemptResult?.isCorrect) {
      onQuizComplete(concept.id, true);
    }
    onClose(); // Close regardless of pass/fail, or retry
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-primary-400">Quiz: {concept.title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 text-2xl">&times;</button>
        </div>

        {error && <Alert message={error} type="error" onClose={() => setError(null)} />}
        
        {isLoading && !quizQuestion && <LoadingSpinner text={UI_MESSAGES.LOADING_QUIZ} />}

        {quizQuestion && !attemptResult && (
          <div>
            <p className="text-slate-300 mb-3">{quizQuestion.questionText}</p>
            {quizQuestion.type === 'multiple-choice' && quizQuestion.options ? (
              <div className="space-y-2">
                {quizQuestion.options.map((option, index) => (
                  <label key={index} className="flex items-center p-3 bg-slate-700 rounded-md hover:bg-slate-600 cursor-pointer">
                    <input
                      type="radio"
                      name={quizQuestion.id}
                      value={option}
                      checked={userAnswer === option}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      className="form-radio h-5 w-5 text-primary-600 bg-slate-800 border-slate-500 focus:ring-primary-500"
                    />
                    <span className="ml-3 text-slate-200">{option}</span>
                  </label>
                ))}
              </div>
            ) : (
              <textarea
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                rows={4}
                className="w-full p-3 bg-slate-700 border border-slate-600 rounded-md focus:ring-2 focus:ring-primary-500 outline-none text-slate-100"
                placeholder="Your answer..."
              />
            )}
            <button
              onClick={handleSubmitAnswer}
              disabled={isLoading || !userAnswer.trim()}
              className="mt-6 w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-4 rounded-md transition duration-150 ease-in-out disabled:opacity-50"
            >
              {isLoading ? <LoadingSpinner size="sm" /> : 'Submit Answer'}
            </button>
          </div>
        )}

        {attemptResult && (
          <div className="mt-4">
            <h3 className={`text-xl font-semibold ${attemptResult.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
              {attemptResult.isCorrect ? 'Correct!' : 'Needs Review'}
            </h3>
            <p className="text-slate-300 mt-2">{attemptResult.feedback}</p>
            <button
              onClick={handleProceed}
              className={`mt-6 w-full ${attemptResult.isCorrect ? 'bg-green-600 hover:bg-green-700' : 'bg-yellow-600 hover:bg-yellow-700'} text-white font-semibold py-3 px-4 rounded-md transition duration-150 ease-in-out`}
            >
              {attemptResult.isCorrect ? 'Continue Learning' : 'Got it, Close Quiz'}
            </button>
            {!attemptResult.isCorrect && (
                 <button
                 onClick={() => { fetchQuiz(); }} // Retries by fetching a (potentially new) question
                 className="mt-2 w-full bg-slate-600 hover:bg-slate-500 text-white font-semibold py-3 px-4 rounded-md transition duration-150 ease-in-out"
               >
                 Try Again
               </button>
            )}
          </div>
        )}
         {!aiService.isConfigured() && !isLoading && (
            <p className="text-center text-yellow-400 mt-4">Quiz functionality requires API key configuration.</p>
        )}
      </div>
    </div>
  );
};

export default QuizModal;
