
import React, { useState, useEffect, useCallback } from 'react';
import { ConceptNode, UserState, ConceptContent, GroundingChunk, VideoMetadata } from '../types';
import { aiService } from '../services/aiService';
import { videoService } from '../services/videoService';
import { UI_MESSAGES } from '../constants';
import LoadingSpinner from './LoadingSpinner';
import Alert from './Alert';
import MathRenderer from './MathRenderer';
import VideoPlayer from './VideoPlayer';
import VideoGenerator from './VideoGenerator';

interface ConceptViewProps {
  concept: ConceptNode | null;
  userState: UserState;
  onMasterConcept: (conceptId: string) => void;
  onTakeQuiz: (concept: ConceptNode) => void;
}

const ConceptView: React.FC<ConceptViewProps> = ({ concept, userState, onMasterConcept, onTakeQuiz }) => {
  const [content, setContent] = useState<ConceptContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [groundingChunks, setGroundingChunks] = useState<GroundingChunk[] | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<'learn' | 'video' | 'practice'>('learn');
  const [videoMetadata, setVideoMetadata] = useState<VideoMetadata | null>(null);
  const [showVideoGenerator, setShowVideoGenerator] = useState(false);


  const fetchContent = useCallback(async () => {
    if (!concept) {
      setContent(null); // Clear content if no concept selected
      return;
    }
    
    // Provide fallback static content for 'intro' concept always
    if (concept.id === 'intro') {
      setContent({
        explanation: "Welcome to your Personalized AI Tutor!\n\nThis platform helps you learn complex subjects by breaking them down into manageable concepts. \n- Navigate the 'Learning Roadmap' to see available topics. \n- Click on a concept to study its material. \n- Take quizzes to test your understanding and master concepts, which unlocks new ones. \n- Use the 'Chat' feature for hints, questions, or to explore topics further. \n- Your progress is tracked on the 'Dashboard'.\n\nLet's start learning!",
        examples: [
            "After this introduction, try exploring the 'Algebra Basics' concept.", 
            "Check your 'Dashboard' to see your initial progress after completing the onboarding.",
            "If you get stuck on a concept, use the 'Chat' to ask for a simpler explanation or a hint."
            ]
      });
      setIsLoading(false);
      setError(null);
      setGroundingChunks(undefined);
      return;
    }
    
    if (!aiService.isConfigured()) {
      setError(UI_MESSAGES.NO_API_KEY + " Content cannot be loaded dynamically.");
       setContent({explanation: `Content for "${concept.title}" would be loaded here if the API key was configured. This concept is about: ${concept.description}`, examples: ["Example 1 would appear here.", "Example 2 would appear here."]});
       setIsLoading(false);
       setGroundingChunks(undefined);
      return;
    }

    setIsLoading(true);
    setError(null);
    setGroundingChunks(undefined);
    try {
      const fetchedData = await aiService.fetchConceptContent(concept);
      setContent({explanation: fetchedData.explanation, examples: fetchedData.examples});
      setGroundingChunks(fetchedData.groundingChunks);
    } catch (e: any) {
      setError(e.message || UI_MESSAGES.API_ERROR);
      setContent({explanation: `Could not load content for "${concept.title}". Error: ${e.message}. You can try refreshing or asking the chat for help.`, examples:[]});
    } finally {
      setIsLoading(false);
    }
  }, [concept]);

  useEffect(() => {
    fetchContent();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [concept]); // fetchContent is memoized

  // Check for existing video when concept changes
  useEffect(() => {
    if (concept) {
      const existingVideo = videoService.getVideoMetadata(concept.id);
      setVideoMetadata(existingVideo);
    } else {
      setVideoMetadata(null);
    }
  }, [concept]);

  const handleVideoGenerated = useCallback((videoUrl: string) => {
    if (concept) {
      const metadata: VideoMetadata = {
        conceptId: concept.id,
        title: concept.title,
        videoUrl,
        duration: 0, // Will be updated when video loads
        generatedAt: new Date()
      };
      setVideoMetadata(metadata);
      videoService.cacheVideoMetadata(metadata);
      setShowVideoGenerator(false);
      setActiveTab('video');
    }
  }, [concept]);

  if (!concept) {
    return (
      <div className="p-6 md:p-8 bg-slate-800 rounded-lg shadow-xl flex flex-col items-center justify-center h-full text-center">
        {/* Placeholder image using a service like Pexels or a local asset */}
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-24 h-24 text-primary-500 mb-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
        </svg>
        <h2 className="text-2xl font-semibold text-primary-400 mb-2">Select a Concept</h2>
        <p className="text-slate-400">Choose a concept from the roadmap to start learning or review material.</p>
      </div>
    );
  }

  const isMastered = userState.masteredConceptIds.has(concept.id);

  return (
    <div className="p-6 md:p-8 bg-slate-800 rounded-lg shadow-xl h-full overflow-y-auto custom-scrollbar">
      <h2 className="text-3xl font-bold text-primary-400 mb-1">{concept.title}</h2>
      <p className="text-sm text-slate-500 mb-1">Category: {concept.category} | Est. Time: {concept.estimatedTime}</p>
      <p className="text-slate-400 mb-6 italic">{concept.description}</p>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-slate-700 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('learn')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'learn'
              ? 'bg-slate-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-600'
          }`}
        >
          📚 Learn
        </button>
        <button
          onClick={() => setActiveTab('video')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'video'
              ? 'bg-slate-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-600'
          }`}
        >
          🎬 Video {videoMetadata && '✓'}
        </button>
        <button
          onClick={() => setActiveTab('practice')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'practice'
              ? 'bg-slate-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-600'
          }`}
        >
          🧠 Practice
        </button>
      </div>

      {error && <Alert message={error} type="error" onClose={() => setError(null)} />}
      
      {isLoading && <div className="flex justify-center items-center h-64"><LoadingSpinner text={UI_MESSAGES.LOADING_CONTENT} /></div>}
      
      {/* Tab Content */}
      {activeTab === 'learn' && content && !isLoading && (
        <article className="prose prose-sm md:prose-base prose-invert max-w-none text-slate-300">
          <h3 className="text-xl font-semibold text-secondary-400 mt-6 mb-2 border-b border-slate-700 pb-1">Explanation</h3>
          {/* Using MathRenderer for proper math expression rendering */}
          <MathRenderer content={content.explanation} className="whitespace-pre-line" />

          {content.examples && content.examples.length > 0 && (
            <>
              <h3 className="text-xl font-semibold text-secondary-400 mt-6 mb-2 border-b border-slate-700 pb-1">Examples</h3>
              <ul className="list-disc pl-5 space-y-2">
                {content.examples.map((example, index) => (
                   <li key={index}>
                     <MathRenderer content={example} className="whitespace-pre-line" />
                   </li>
                ))}
              </ul>
            </>
          )}

          {groundingChunks && groundingChunks.length > 0 && (
            <>
              <h3 className="text-xl font-semibold text-secondary-400 mt-6 mb-2 border-b border-slate-700 pb-1">Sources & Further Reading</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                {groundingChunks.filter(chunk => chunk.web).map((chunk, index) => (
                  chunk.web && ( // Redundant check, but safe
                    <li key={index}>
                      <a href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:text-sky-300 hover:underline">
                        {chunk.web.title || chunk.web.uri}
                      </a>
                    </li>
                  )
                ))}
              </ul>
            </>
          )}
        </article>
      )}

      {activeTab === 'video' && (
        <div className="h-96">
          {videoMetadata ? (
            <VideoPlayer 
              videoMetadata={videoMetadata}
              onClose={() => setActiveTab('learn')}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="text-6xl mb-4">🎬</div>
              <h3 className="text-xl font-semibold text-slate-200 mb-2">
                No Video Available
              </h3>
              <p className="text-slate-400 mb-6">
                Generate an interactive video presentation for this concept
              </p>
              <button
                onClick={() => setShowVideoGenerator(true)}
                className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-md transition duration-150 ease-in-out"
              >
                Generate Video
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'practice' && (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="text-6xl mb-4">🧠</div>
          <h3 className="text-xl font-semibold text-slate-200 mb-2">
            Practice Mode
          </h3>
          <p className="text-slate-400 mb-6">
            Test your understanding with interactive exercises
          </p>
          <button
            onClick={() => onTakeQuiz(concept)}
            className="bg-secondary-600 hover:bg-secondary-700 text-white font-semibold py-3 px-6 rounded-md transition duration-150 ease-in-out"
          >
            Take Quiz
          </button>
        </div>
      )}

      {!isMastered && (
        <div className="mt-8 pt-6 border-t border-slate-700 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
          <button
            onClick={() => onMasterConcept(concept.id)}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-md transition duration-150 ease-in-out"
            aria-label={`Mark ${concept.title} as mastered`}
          >
            Mark as Mastered (Skip Quiz)
          </button>
          <button
            onClick={() => onTakeQuiz(concept)}
            disabled={!aiService.isConfigured() && concept.id !== 'intro'} // Disable quiz if API not configured, unless it's a mockable intro quiz
            className="flex-1 bg-secondary-600 hover:bg-secondary-700 text-white font-semibold py-3 px-4 rounded-md transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={`Take quiz for ${concept.title}`}
          >
            Take Quiz
          </button>
        </div>
      )}
      {isMastered && (
         <p className="mt-8 text-center text-green-400 font-semibold py-3 px-4 rounded-md bg-green-800 bg-opacity-40 border border-green-700">
          🎉 You've mastered "{concept.title}"!
        </p>
      )}
      {(!aiService.isConfigured() && concept.id !== 'intro' && !isLoading) && (
        <p className="text-center text-yellow-400 mt-6 p-3 bg-yellow-900 bg-opacity-50 rounded-md border border-yellow-700">
            Dynamic content and quizzes require API key configuration. The content above is a placeholder.
        </p>
      )}

      {/* Video Generator Modal */}
      {showVideoGenerator && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <VideoGenerator
              concept={concept}
              onVideoGenerated={handleVideoGenerated}
              onClose={() => setShowVideoGenerator(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ConceptView;
