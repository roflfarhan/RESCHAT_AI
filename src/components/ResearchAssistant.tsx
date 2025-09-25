import React, { useState } from 'react';
import Sidebar from './Sidebar';
import ChatInterface from './ChatInterface';
import ResearchChat from './ResearchChat';

const ResearchAssistant = () => {
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [showWelcome, setShowWelcome] = useState(true);

  const handleNewChat = () => {
    setActiveChat(null);
    setShowWelcome(true);
  };

  const handleSelectChat = (chatId: string) => {
    setActiveChat(chatId);
    setShowWelcome(false);
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 font-inter">
      <Sidebar 
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        activeChat={activeChat}
      />
      <div className="flex-1">
        {showWelcome ? (
          <ChatInterface />
        ) : (
          <ResearchChat />
        )}
      </div>
    </div>
  );
};

export default ResearchAssistant;