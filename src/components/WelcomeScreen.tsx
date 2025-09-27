import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Video, 
  Music, 
  BarChart3, 
  Sparkles,
  Send,
  Plus,
  FileText,
  Image,
  Mic,
  TrendingUp
} from 'lucide-react';

interface WelcomeScreenProps {
  onSearch: (query: string, files?: FileList) => void;
  isLoading: boolean;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSearch, isLoading }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('General');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && !isLoading) {
      onSearch(searchQuery.trim());
    }
  };

  const featureCards = [
    {
      id: 'research',
      title: 'Research Analysis',
      subtitle: 'Multi-source paper discovery',
      description: 'Comprehensive insights & analysis',
      icon: <BarChart3 className="w-8 h-8" />,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'writing',
      title: 'Academic Writing',
      subtitle: 'AI-powered drafting',
      description: 'Generate & refine content',
      icon: <FileText className="w-8 h-8" />,
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'analytics',
      title: 'Smart Analytics',
      subtitle: 'Deep insights & data',
      description: 'Visualization & trends',
      icon: <TrendingUp className="w-8 h-8" />,
      color: 'from-green-500 to-teal-500'
    },
    {
      id: 'creative',
      title: 'Creative AI',
      subtitle: 'Automated content creation',
      description: 'Innovative assistance',
      icon: <Sparkles className="w-8 h-8" />,
      color: 'from-orange-500 to-red-500'
    }
  ];

  const categories = [
    { id: 'General', label: 'General', icon: <FileText className="w-4 h-4" /> },
    { id: 'Text', label: 'Text', icon: <FileText className="w-4 h-4" /> },
    { id: 'Media', label: 'Media', icon: <Image className="w-4 h-4" /> },
    { id: 'Music', label: 'Music', icon: <Music className="w-4 h-4" /> },
    { id: 'Analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> }
  ];

  return (
    <div className="min-h-screen welcome-gradient relative overflow-hidden" data-testid="welcome-screen">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/10 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      {/* Left sidebar */}
      <div className="fixed left-0 top-0 h-full w-20 bg-black/30 backdrop-blur-sm border-r border-white/10 flex flex-col items-center py-6 z-10">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center mb-8">
          <div className="w-6 h-6 bg-white rounded-full"></div>
        </div>
        
        <div className="flex-1 flex flex-col gap-4">
          <button className="w-12 h-12 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-300 hover:scale-105">
            <BarChart3 className="w-6 h-6 text-white" />
          </button>
          <button className="w-12 h-12 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-300 hover:scale-105">
            <FileText className="w-6 h-6 text-white" />
          </button>
          <button className="w-12 h-12 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-300 hover:scale-105">
            <Image className="w-6 h-6 text-white" />
          </button>
          <button className="w-12 h-12 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-300 hover:scale-105">
            <TrendingUp className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="ml-20 min-h-screen flex flex-col items-center justify-center px-8 relative z-10">
        {/* Logo and floating orb */}
        <div className="relative mb-12">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 via-cyan-400 to-teal-400 flex items-center justify-center relative animate-float">
            {/* Outer glow ring */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 via-cyan-400 to-teal-400 blur-md opacity-60 animate-pulse"></div>
            
            {/* Particles around orb */}
            <div className="absolute inset-0">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className={`absolute w-2 h-2 bg-white rounded-full animate-orbit-${i + 1}`}
                  style={{
                    top: '50%',
                    left: '50%',
                    transform: `translate(-50%, -50%) rotate(${i * 45}deg) translateX(40px)`,
                  }}
                ></div>
              ))}
            </div>
            
            {/* Inner orb */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 relative z-10 shadow-2xl">
              <div className="w-full h-full rounded-full bg-gradient-to-tl from-white/30 to-transparent"></div>
            </div>
          </div>
        </div>

        {/* Welcome text */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4 font-poppins" data-testid="welcome-heading">
            Hello, Welcome to ResChat!
          </h1>
          <p className="text-xl text-white/70 font-inter" data-testid="welcome-subtitle">
            How can I assist you today with AI-powered research conversations?
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-2 gap-6 mb-12 max-w-2xl">
          {featureCards.map((card) => (
            <Card 
              key={card.id}
              className="relative group cursor-pointer bg-black/40 backdrop-blur-sm border-white/10 hover:border-teal-400/50 transition-all duration-300 hover:scale-105"
              data-testid={`feature-card-${card.id}`}
            >
              <CardContent className="p-8 text-center">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center mx-auto mb-4 text-white group-hover:shadow-lg group-hover:shadow-teal-400/25 transition-all duration-300`}>
                  {card.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{card.title}</h3>
                <p className="text-sm text-white/60 mb-1">{card.subtitle}</p>
                <p className="text-xs text-white/40">{card.description}</p>
              </CardContent>
              
              {/* Hover glow effect */}
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-teal-400/0 via-teal-400/0 to-teal-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </Card>
          ))}
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 mb-12" data-testid="category-tabs">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={activeTab === category.id ? "default" : "ghost"}
              onClick={() => setActiveTab(category.id)}
              className={`px-6 py-2 rounded-full transition-all duration-300 ${
                activeTab === category.id
                  ? 'bg-gradient-to-r from-blue-500 to-teal-500 text-white shadow-lg shadow-blue-500/25'
                  : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
              }`}
              data-testid={`tab-${category.id.toLowerCase()}`}
            >
              <span className="flex items-center gap-2">
                {category.icon}
                {category.label}
              </span>
            </Button>
          ))}
        </div>

        {/* Input field */}
        <form onSubmit={handleSubmit} className="w-full max-w-2xl">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-teal-500/20 rounded-2xl blur-sm"></div>
            <div className="relative flex items-center bg-black/40 backdrop-blur-sm border border-white/20 rounded-2xl p-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-white/60 hover:text-white hover:bg-white/10 rounded-xl mr-2"
                data-testid="button-attach"
              >
                <Plus className="w-5 h-5" />
              </Button>
              
              <Input
                type="text"
                placeholder="Type your research query here..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent border-0 text-white placeholder:text-white/40 focus:ring-0 text-lg px-4"
                disabled={isLoading}
                data-testid="input-search"
              />
              
              <Button
                type="submit"
                disabled={!searchQuery.trim() || isLoading}
                className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white rounded-xl px-6 py-2 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="button-search"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </form>

        {/* Bottom hint text */}
        <p className="text-white/40 text-sm mt-6 text-center">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
};

export default WelcomeScreen;