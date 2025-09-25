import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import FeatureCards from './FeatureCards';
import ResearchChat from './ResearchChat';

const ChatInterface: React.FC = () => {
  const [currentQuery, setCurrentQuery] = useState<string | null>(null);
  const [showWelcome, setShowWelcome] = useState(true);

  const handleFeatureSelect = (query: string) => {
    setCurrentQuery(query);
    setShowWelcome(false);
  };

  const handleNewChat = () => {
    setCurrentQuery(null);
    setShowWelcome(true);
  };

  if (!showWelcome) {
    return <ResearchChat initialQuery={currentQuery || undefined} />;
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white dark:bg-gray-900 p-8">
      {/* Welcome Header */}
      <div className="text-center mb-12 animate-fade-in">
        <div className="flex items-center justify-center gap-3 mb-6">
          <Sparkles className="h-8 w-8 text-primary animate-glow" />
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Welcome to Research AI
          </h1>
        </div>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Use multiple sources and tools to answer questions with citations
        </p>
      </div>

      {/* Feature Cards */}
      <div className="mb-12">
        <FeatureCards onFeatureSelect={handleFeatureSelect} />
      </div>

      {/* Quick Start Examples */}
      <div className="max-w-4xl w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            "Tell me a fun fact!",
            "Recommend a movie to watch.",
            "How do I make pancakes?",
            "What's the latest..."
          ].map((example, index) => (
            <button
              key={index}
              onClick={() => handleFeatureSelect(example)}
              className="p-4 text-left bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700 animate-fade-in"
              style={{ animationDelay: `${0.8 + index * 0.1}s` }}
            >
              <span className="text-gray-700 dark:text-gray-300">{example}</span>
            </button>
          ))}
        </div>

        {/* Chat Input Preview */}
        <div className="relative animate-fade-in" style={{ animationDelay: '1.2s' }}>
          <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-gray-500 dark:text-gray-400">Ask me anything...</span>
              <div className="flex items-center gap-2">
                <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <Sparkles className="h-4 w-4" />
                </button>
                <span className="text-xs text-gray-400">Saved prompts</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;