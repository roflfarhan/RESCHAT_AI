import React, { useState } from 'react';
import { Search, Home, MessageSquare, BookOpen, Settings, Plus, Edit, Trash2, Bot } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ChatHistory {
  id: string;
  title: string;
  timestamp: string;
  category: 'recent' | 'today' | 'yesterday' | '7days';
}

interface SidebarProps {
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
  activeChat: string | null;
}

const Sidebar: React.FC<SidebarProps> = ({ onNewChat, onSelectChat, activeChat }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const chatHistory: ChatHistory[] = [
    { id: '1', title: 'Machine Learning in Healthcare', timestamp: '2 hours ago', category: 'recent' },
    { id: '2', title: 'Quantum Computing Research', timestamp: '4 hours ago', category: 'recent' },
    { id: '3', title: 'AI Ethics Literature Review', timestamp: '6 hours ago', category: 'today' },
    { id: '4', title: 'Deep Learning Applications', timestamp: '8 hours ago', category: 'today' },
    { id: '5', title: 'Natural Language Processing', timestamp: '1 day ago', category: 'yesterday' },
    { id: '6', title: 'Computer Vision Papers', timestamp: '2 days ago', category: 'yesterday' },
    { id: '7', title: 'Blockchain Technology', timestamp: '5 days ago', category: '7days' },
    { id: '8', title: 'Renewable Energy Research', timestamp: '6 days ago', category: '7days' },
  ];

  const groupedChats = chatHistory.reduce((acc, chat) => {
    if (!acc[chat.category]) acc[chat.category] = [];
    acc[chat.category].push(chat);
    return acc;
  }, {} as Record<string, ChatHistory[]>);

  const categoryLabels = {
    recent: 'Recent',
    today: 'Today',
    yesterday: 'Yesterday',
    '7days': '7 days'
  };

  return (
    <div className="w-80 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col h-screen">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-gray-900 dark:text-white">Research AI</h1>
            <p className="text-xs text-gray-500">Fast and reliable</p>
          </div>
          <div className="ml-auto flex gap-2">
            <Button variant="ghost" size="sm">
              Export Chat
            </Button>
            <Button variant="default" size="sm">
              Upgrade
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600"
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <nav className="space-y-2">
          <Button variant="ghost" className="w-full justify-start text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
            <Home className="h-4 w-4 mr-3" />
            Home
          </Button>
          <Button variant="default" className="w-full justify-start bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white">
            <MessageSquare className="h-4 w-4 mr-3" />
            Chat
          </Button>
          <Button variant="ghost" className="w-full justify-start text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
            <BookOpen className="h-4 w-4 mr-3" />
            Prompt Library
          </Button>
          <Button variant="ghost" className="w-full justify-start text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
            <Settings className="h-4 w-4 mr-3" />
            Integrations
          </Button>
        </nav>
      </div>

      {/* New Chat Button */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <Button onClick={onNewChat} className="w-full bg-gradient-primary hover:opacity-90 text-white">
          <Plus className="h-4 w-4 mr-2" />
          New Research Chat
        </Button>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-4">
        {Object.entries(groupedChats).map(([category, chats]) => (
          <div key={category} className="mb-6">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
              {categoryLabels[category as keyof typeof categoryLabels]}
            </h3>
            <div className="space-y-1">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => onSelectChat(chat.id)}
                  className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                    activeChat === chat.id
                      ? 'bg-gray-200 dark:bg-gray-700'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {chat.title}
                    </p>
                    <p className="text-xs text-gray-500">{chat.timestamp}</p>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 flex gap-1">
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="text-center py-4">
          <Button variant="ghost" className="text-gray-500 text-sm">
            Show 4 more
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;