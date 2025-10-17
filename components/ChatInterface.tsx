
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChatMessage, ConceptNode, GroundingChunk } from '../types';
import { aiService } from '../services/aiService';
import { UI_MESSAGES } from '../constants';
import LoadingSpinner from './LoadingSpinner';
import Alert from './Alert';

interface ChatInterfaceProps {
  currentConcept: ConceptNode | null;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ currentConcept }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatGroundingChunks, setChatGroundingChunks] = useState<GroundingChunk[] | undefined>(undefined);


  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = useCallback(async () => {
    if (!userInput.trim() || !aiService.isConfigured()) {
        if (!aiService.isConfigured()) setError(UI_MESSAGES.NO_API_KEY);
      return;
    }

    const newUserMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: userInput,
      timestamp: new Date(),
      relatedConceptId: currentConcept?.id
    };

    setMessages(prev => [...prev, newUserMessage]);
    setUserInput('');
    setIsLoading(true);
    setError(null);
    setChatGroundingChunks(undefined);

    try {
      // Pass current messages for context, or just the new one if service handles history
      const response = await aiService.getChatResponse([...messages, newUserMessage], currentConcept);
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: response.text,
        timestamp: new Date(),
        relatedConceptId: currentConcept?.id
      };
      setMessages(prev => [...prev, aiResponse]);
      setChatGroundingChunks(response.groundingChunks);
    } catch (e: any) {
      setError(e.message || UI_MESSAGES.API_ERROR);
      const errorResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: "Sorry, I couldn't process your request. Please try again.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  }, [userInput, currentConcept, messages]);

  return (
    <div className="p-4 bg-slate-800 rounded-lg shadow-xl flex flex-col h-full max-h-[calc(100vh-2rem)]">
      <h2 className="text-xl font-bold text-primary-400 mb-4">Chat with Your AI Tutor</h2>
      
      {error && <Alert message={error} type="error" onClose={() => setError(null)} />}

      <div className="flex-grow overflow-y-auto mb-4 pr-2 space-y-3">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[70%] p-3 rounded-lg shadow ${
                msg.sender === 'user' 
                ? 'bg-primary-600 text-white' 
                : 'bg-slate-700 text-slate-200'
            }`}>
              <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
              <p className="text-xs opacity-70 mt-1 text-right">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="max-w-[70%] p-3 rounded-lg shadow bg-slate-700 text-slate-200">
                <LoadingSpinner size="sm" text="AI is thinking..." />
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

       {chatGroundingChunks && chatGroundingChunks.length > 0 && (
            <div className="mb-2 text-xs text-slate-400">
              <p className="font-semibold mb-1">AI used these sources:</p>
              <ul className="list-disc list-inside max-h-20 overflow-y-auto">
                {chatGroundingChunks.map((chunk, index) => (
                  chunk.web && (
                    <li key={index}>
                      <a href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="text-sky-500 hover:text-sky-400 hover:underline">
                        {chunk.web.title || chunk.web.uri}
                      </a>
                    </li>
                  )
                ))}
              </ul>
            </div>
        )}

      <div className="flex items-center border-t border-slate-700 pt-3">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
          placeholder={aiService.isConfigured() ? "Ask a question or for a hint..." : "API key not configured for chat"}
          className="flex-grow p-3 bg-slate-700 border border-slate-600 rounded-l-md focus:ring-2 focus:ring-primary-500 outline-none text-slate-100 placeholder-slate-500 disabled:opacity-50"
          disabled={!aiService.isConfigured() || isLoading}
        />
        <button
          onClick={handleSendMessage}
          disabled={!userInput.trim() || isLoading || !aiService.isConfigured()}
          className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-5 rounded-r-md transition duration-150 ease-in-out disabled:opacity-50"
        >
          Send
        </button>
      </div>
      {!aiService.isConfigured() && !isLoading && (
            <p className="text-center text-yellow-400 text-xs mt-2">Chat functionality requires API key configuration.</p>
      )}
    </div>
  );
};

export default ChatInterface;
