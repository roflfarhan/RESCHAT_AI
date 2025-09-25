import React from 'react';
import { Bot, Globe, Image, Code, FileText, Search, Brain, Target } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface FeatureCardsProps {
  onFeatureSelect: (feature: string) => void;
}

const FeatureCards: React.FC<FeatureCardsProps> = ({ onFeatureSelect }) => {
  const features = [
    {
      id: 'research',
      title: 'Research Papers',
      description: 'Find and analyze academic papers from multiple databases',
      icon: Search,
      gradient: 'from-blue-400 to-blue-600',
      example: 'Machine Learning in Healthcare'
    },
    {
      id: 'analysis',
      title: 'AI Analysis',
      description: 'Generate summaries, outlines and research gaps using AI',
      icon: Brain,
      gradient: 'from-purple-400 to-purple-600',
      example: 'Analyze quantum computing trends'
    },
    {
      id: 'citations',
      title: 'Smart Citations',
      description: 'Generate APA, MLA, and IEEE citations automatically',
      icon: FileText,
      gradient: 'from-green-400 to-green-600',
      example: 'Format 10 research citations'
    },
    {
      id: 'export',
      title: 'Export Options',
      description: 'Export results to PDF, DOCX, or BibTeX formats',
      icon: Target,
      gradient: 'from-orange-400 to-orange-600',
      example: 'Export research outline to PDF'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl">
      {features.map((feature, index) => (
        <Card
          key={feature.id}
          onClick={() => onFeatureSelect(feature.example)}
          className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 animate-fade-in"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <CardContent className="p-6">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-4 shadow-lg`}>
              <feature.icon className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              {feature.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              {feature.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default FeatureCards;