
import React, { useState, useEffect, useCallback } from 'react';
import OnboardingFlow from './components/OnboardingFlow';
import KnowledgeGraphView from './components/KnowledgeGraphView';
import ConceptView from './components/ConceptView';
import Dashboard from './components/Dashboard';
import ChatInterface from './components/ChatInterface';
import QuizModal from './components/QuizModal';
import ErrorBoundary from './components/ErrorBoundary';
import { UserState, ConceptNode, ConceptStatus } from './types';
import { knowledgeGraphService } from './services/knowledgeGraphService';
import { APP_TITLE, UI_MESSAGES } from './constants';
import Alert from './components/Alert';
import { aiService } from './services/aiService';

type ActiveTab = 'roadmap' | 'concept' | 'dashboard' | 'chat';

const App: React.FC = () => {
  const [userState, setUserState] = useState<UserState>(() => {
    const savedState = localStorage.getItem('aiTutorUserState');
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      return {
        ...parsedState,
        masteredConceptIds: new Set(parsedState.masteredConceptIds || []),
        unlockedConceptIds: new Set(parsedState.unlockedConceptIds || ['intro']),
      };
    }
    return {
      isOnboardingComplete: false,
      priorKnowledge: [],
      learningGoals: [],
      masteredConceptIds: new Set(),
      unlockedConceptIds: new Set(['intro']),
      currentConceptId: 'intro', // Default to intro before onboarding completes or if no other
    };
  });

  const [selectedConceptForView, setSelectedConceptForView] = useState<ConceptNode | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('roadmap');
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [conceptForQuiz, setConceptForQuiz] = useState<ConceptNode | null>(null);
  const [alertMessage, setAlertMessage] = useState<{ message: string, type: 'success' | 'error' | 'info' | 'warning' } | null>(null);

  useEffect(() => {
    localStorage.setItem('aiTutorUserState', JSON.stringify({
      ...userState,
      masteredConceptIds: Array.from(userState.masteredConceptIds),
      unlockedConceptIds: Array.from(userState.unlockedConceptIds),
    }));
  }, [userState]);

  useEffect(() => {
    // If a concept is selected (currentConceptId changes), try to load it for view.
    // Also, switch to concept tab if not already there, unless it's null (e.g. all mastered)
    if (userState.currentConceptId) {
      const concept = knowledgeGraphService.getConceptById(userState.currentConceptId);
      setSelectedConceptForView(concept || null);
      if (concept && activeTab !== 'concept' && activeTab !== 'chat') { // don't interrupt chat
         // setActiveTab('concept'); // Avoid auto-switching tab if user is on dashboard/chat
      }
    } else {
      setSelectedConceptForView(null); // No current concept
    }
  }, [userState.currentConceptId, activeTab]);
  
 useEffect(() => {
    if (!aiService.isConfigured()) {
      setAlertMessage({ message: UI_MESSAGES.NO_API_KEY + " Some features will be limited.", type: 'warning' });
    }
  }, []);


  const handleOnboardingComplete = useCallback((partialState: Partial<UserState>) => {
    setUserState(prev => {
      const updatedUnlockedIds = new Set(partialState.unlockedConceptIds || prev.unlockedConceptIds);
      if (!updatedUnlockedIds.has('intro')) {
        updatedUnlockedIds.add('intro');
      }
      
      let currentConceptId = partialState.currentConceptId || prev.currentConceptId;
      if (!currentConceptId || updatedUnlockedIds.has(currentConceptId) && prev.masteredConceptIds.has(currentConceptId)) {
        // Find first unlocked, non-mastered concept
        currentConceptId = knowledgeGraphService.getGraph().concepts.find(c => updatedUnlockedIds.has(c.id) && !prev.masteredConceptIds.has(c.id))?.id || 'intro';
      }


      return {
        ...prev,
        ...partialState,
        isOnboardingComplete: true,
        unlockedConceptIds: updatedUnlockedIds,
        currentConceptId: currentConceptId,
      };
    });
    setActiveTab('roadmap');
    setAlertMessage({ message: "Onboarding complete! Welcome to your personalized learning journey.", type: 'success' });
  }, []);

  const handleSelectConcept = useCallback((conceptId: string) => {
    const concept = knowledgeGraphService.getConceptById(conceptId);
    const status = knowledgeGraphService.getConceptStatus(conceptId, userState);
    if (concept && status !== ConceptStatus.LOCKED) {
      setSelectedConceptForView(concept);
      setUserState(prev => ({...prev, currentConceptId: conceptId})); // Update current focused concept
      setActiveTab('concept');
    } else if (status === ConceptStatus.LOCKED) {
      setAlertMessage({ message: "This concept is currently locked. Master prerequisites to unlock.", type: 'info' });
    }
  }, [userState]);

  const handleMasterConcept = useCallback((conceptId: string) => {
    setUserState(prev => knowledgeGraphService.masterConcept(conceptId, prev));
    setAlertMessage({ message: `"${knowledgeGraphService.getConceptById(conceptId)?.title}" marked as mastered!`, type: 'success' });
    // The masterConcept service already tries to set the next currentConceptId
    // So, the useEffect for userState.currentConceptId will handle updating selectedConceptForView
  }, []);

  const handleTakeQuiz = useCallback((concept: ConceptNode) => {
    setConceptForQuiz(concept);
    setIsQuizModalOpen(true);
  }, []);

  const handleQuizComplete = useCallback((conceptId: string, passed: boolean) => {
    setIsQuizModalOpen(false);
    setConceptForQuiz(null);
    if (passed) {
      handleMasterConcept(conceptId); // This will show its own "mastered" alert
      setAlertMessage({ message: UI_MESSAGES.QUIZ_PASSED, type: 'success' });
    } else {
      setAlertMessage({ message: UI_MESSAGES.QUIZ_FAILED, type: 'info' });
    }
  }, [handleMasterConcept]);
  
  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'roadmap':
        return <KnowledgeGraphView userState={userState} onSelectConcept={handleSelectConcept} />;
      case 'concept':
        return <ConceptView concept={selectedConceptForView} userState={userState} onMasterConcept={handleMasterConcept} onTakeQuiz={handleTakeQuiz} />;
      case 'dashboard':
        return <Dashboard userState={userState} />;
      case 'chat':
        return <ChatInterface currentConcept={selectedConceptForView} />;
      default:
        return <KnowledgeGraphView userState={userState} onSelectConcept={handleSelectConcept} />;
    }
  };

  if (!userState.isOnboardingComplete) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4">
        <OnboardingFlow onOnboardingComplete={handleOnboardingComplete} />
      </div>
    );
  }
  
  const mainAppLayoutClasses = "flex flex-col md:flex-row h-screen max-h-screen overflow-hidden bg-slate-900 text-slate-100";
  const navClasses = "bg-slate-800 p-3 md:p-4 shadow-md flex md:flex-col justify-around md:justify-start md:space-y-3";
  const tabButtonBase = "px-3 py-2 md:py-3 rounded-md text-sm font-medium transition-colors duration-150 flex items-center justify-center md:justify-start space-x-2";
  const tabButtonActive = "bg-primary-600 text-white";
  const tabButtonInactive = "text-slate-300 hover:bg-slate-700 hover:text-white";


  return (
    <ErrorBoundary>
      <div className={mainAppLayoutClasses}>
         {alertMessage && (
              <div className="fixed top-5 right-5 z-[100] w-auto max-w-sm">
                   <Alert message={alertMessage.message} type={alertMessage.type} onClose={() => setAlertMessage(null)} />
              </div>
          )}

        <nav className={navClasses}>
        <h1 className="text-xl md:text-2xl font-bold text-primary-400 mb-0 md:mb-6 hidden md:block px-2">{APP_TITLE.split(" ")[0]} Tutor</h1>
        {([
            { id: 'roadmap', label: 'Roadmap', icon: '🗺️' }, 
            { id: 'concept', label: 'Learn', icon: '💡' }, 
            { id: 'dashboard', label: 'Progress', icon: '📊' }, 
            { id: 'chat', label: 'Chat', icon: '💬' }
        ] as {id: ActiveTab, label: string, icon: string}[])
        .map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`${tabButtonBase} ${activeTab === tab.id ? tabButtonActive : tabButtonInactive}`}
            aria-current={activeTab === tab.id ? 'page' : undefined}
          >
            <span className="text-lg" role="img" aria-label={`${tab.label} icon`}>{tab.icon}</span>
            <span className="hidden md:inline">{tab.label}</span>
          </button>
        ))}
      </nav>

      <main className="flex-grow p-3 md:p-4 overflow-y-auto h-full"> {/* Ensure main content area can scroll */}
        {renderActiveTabContent()}
      </main>

        {isQuizModalOpen && conceptForQuiz && (
          <QuizModal
            concept={conceptForQuiz}
            isOpen={isQuizModalOpen}
            onClose={() => { setIsQuizModalOpen(false); setConceptForQuiz(null); }}
            onQuizComplete={handleQuizComplete}
          />
        )}
      </div>
    </ErrorBoundary>
  );
};

export default App;