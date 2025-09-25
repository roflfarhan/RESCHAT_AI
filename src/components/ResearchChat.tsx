import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Loader2, FileText, Search, Brain, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import ExportOptions from './ExportOptions';

interface Paper {
  title: string;
  authors: string[];
  abstract?: string;
  year?: number;
  venue?: string;
  url?: string;
  doi?: string;
  citationCount?: number;
  referenceCount?: number;
  source: 'crossref' | 'arxiv' | 'semantic';
}

interface AdvancedAnalysis {
  summary: string;
  outline: string;
  comparison: string;
  citations: {
    apa: string;
    mla: string;
    ieee: string;
  };
  keywords: string[];
  researchGaps: string;
  futureDirections: string;
}

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  papers?: Paper[];
  analysis?: AdvancedAnalysis;
}

interface ResearchChatProps {
  initialQuery?: string;
}

const ResearchChat: React.FC<ResearchChatProps> = ({ initialQuery }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState(initialQuery || '');
  const [loading, setLoading] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<'idle' | 'fetching' | 'analyzing' | 'complete'>('idle');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (initialQuery && messages.length === 0) {
      handleSend();
    }
  }, [initialQuery]);

  const fetchAdvancedPapers = async (query: string): Promise<Paper[]> => {
    const papers: Paper[] = [];

    try {
      // Enhanced CrossRef API call
      const crossrefResponse = await fetch(
        `https://api.crossref.org/works?query=${encodeURIComponent(query)}&rows=5&select=title,author,published-print,published-online,container-title,URL,DOI,abstract`,
        { headers: { Accept: 'application/json' } }
      );
      const crossrefData = await crossrefResponse.json();
      
      if (crossrefData.message?.items) {
        crossrefData.message.items.forEach((item: any) => {
          papers.push({
            title: item.title?.[0] || 'Untitled',
            authors: item.author?.map((a: any) => `${a.given || ''} ${a.family || ''}`.trim()) || [],
            year: item['published-print']?.['date-parts']?.[0]?.[0] || item['published-online']?.['date-parts']?.[0]?.[0],
            venue: item['container-title']?.[0],
            url: item.URL,
            doi: item.DOI,
            source: 'crossref'
          });
        });
      }

      // Enhanced Semantic Scholar API call
      const semanticResponse = await fetch(
        `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(query)}&limit=5&fields=title,abstract,authors,year,venue,doi,url,citationCount,referenceCount`,
        { headers: { Accept: 'application/json' } }
      );
      const semanticData = await semanticResponse.json();
      
      if (semanticData.data) {
        semanticData.data.forEach((paper: any) => {
          papers.push({
            title: paper.title || 'Untitled',
            authors: paper.authors?.map((a: any) => a.name) || [],
            abstract: paper.abstract,
            year: paper.year,
            venue: paper.venue,
            url: paper.url,
            doi: paper.doi,
            citationCount: paper.citationCount,
            referenceCount: paper.referenceCount,
            source: 'semantic'
          });
        });
      }

      // ArXiv API remains the same but with more papers
      const arxivResponse = await fetch(
        `http://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&start=0&max_results=5`,
        { headers: { Accept: 'application/xml' } }
      );
      const arxivText = await arxivResponse.text();
      const parser = new DOMParser();
      const arxivDoc = parser.parseFromString(arxivText, 'text/xml');
      
      const entries = arxivDoc.querySelectorAll('entry');
      entries.forEach((entry) => {
        const title = entry.querySelector('title')?.textContent || 'Untitled';
        const authors = Array.from(entry.querySelectorAll('author name')).map(a => a.textContent || '');
        const summary = entry.querySelector('summary')?.textContent;
        const published = entry.querySelector('published')?.textContent;
        const year = published ? new Date(published).getFullYear() : undefined;
        const url = entry.querySelector('id')?.textContent;

        papers.push({
          title,
          authors,
          abstract: summary,
          year,
          venue: 'arXiv',
          url,
          source: 'arxiv'
        });
      });

    } catch (error) {
      console.error('Error fetching papers:', error);
    }

    return papers;
  };

  const generateAdvancedAnalysis = async (papers: Paper[], query: string): Promise<AdvancedAnalysis> => {
    try {
      const prompt = `You are an advanced academic research assistant. Analyze the following research papers for the topic \\\"${query}\\\":\\n\\n${papers.map((paper, index) => `\\nPaper ${index + 1}:\\nTitle: ${paper.title}\\nAuthors: ${paper.authors.join(', ')}\\nYear: ${paper.year || 'Unknown'}\\nVenue: ${paper.venue || 'Unknown'}\\nDOI: ${paper.doi || 'N/A'}\\nCitations: ${paper.citationCount || 'N/A'}\\nAbstract: ${paper.abstract || 'Not available'}\\nSource: ${paper.source}\\n`).join('\\\\n')}\\n\\nPlease provide a comprehensive analysis with the following sections:\\n\\n1. SUMMARY: A concise 2-3 paragraph summary of the research landscape\\n2. COMPARISON: Compare and contrast the papers, highlighting similarities and differences\\n3. OUTLINE: Create a structured academic outline with:\\n   - Introduction\\n   - Literature Review (with specific paper references)\\n   - Methodology\\n   - Results & Discussion\\n   - Conclusion\\n   - Future Scope\\n4. KEYWORDS: Extract 10-15 relevant keywords\\n5. RESEARCH GAPS: Identify unexplored areas and limitations\\n6. FUTURE DIRECTIONS: Suggest 5-7 specific research directions\\n7. CITATIONS: Format key papers in APA, MLA, and IEEE styles\\n\\nMake the analysis detailed, professional, and suitable for academic use.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyBTqDgZ2zee5zCwQp2H6u6cOfA3aNR2J5k`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ]
        })
      });

      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

      // Parse the response into sections
      const sections = content.split(/\\\\d+\\\\.\\\\s*(SUMMARY|COMPARISON|OUTLINE|KEYWORDS|RESEARCH GAPS|FUTURE DIRECTIONS|CITATIONS)/i);
      
      const analysis: AdvancedAnalysis = {
        summary: sections[2] || `AI-generated analysis of ${papers.length} research papers on \\\"${query}\\\".`,
        outline: sections[4] || 'Detailed outline not available',
        comparison: sections[3] || 'Comparative analysis not available',
        citations: {
          apa: 'APA citations will be generated',
          mla: 'MLA citations will be generated',
          ieee: 'IEEE citations will be generated'
        },
        keywords: sections[5]?.split(/[,\\\\n]/).map(k => k.trim()).filter(k => k.length > 0).slice(0, 15) || [],
        researchGaps: sections[6] || 'Research gaps analysis not available',
        futureDirections: sections[7] || 'Future directions not available'
      };

      // Extract citations if available
      const citationSection = sections[8] || '';
      if (citationSection.includes('APA:')) {
        analysis.citations.apa = citationSection.split('APA:')[1]?.split('MLA:')[0]?.trim() || analysis.citations.apa;
      }
      if (citationSection.includes('MLA:')) {
        analysis.citations.mla = citationSection.split('MLA:')[1]?.split('IEEE:')[0]?.trim() || analysis.citations.mla;
      }
      if (citationSection.includes('IEEE:')) {
        analysis.citations.ieee = citationSection.split('IEEE:')[1]?.trim() || analysis.citations.ieee;
      }

      return analysis;

    } catch (error) {
      console.error('Gemini API error:', error);
      return {
        summary: `Found ${papers.length} relevant research papers on \\\"${query}\\\". Analysis includes theoretical foundations, practical applications, and recent developments.`,
        outline: 'AI analysis temporarily unavailable. Please try again.',
        comparison: 'Paper comparison temporarily unavailable.',
        citations: {
          apa: 'Citations temporarily unavailable',
          mla: 'Citations temporarily unavailable',
          ieee: 'Citations temporarily unavailable'
        },
        keywords: ['research', 'analysis', 'academic', 'papers'],
        researchGaps: 'Research gap analysis temporarily unavailable.',
        futureDirections: 'Future directions analysis temporarily unavailable.'
      };
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setCurrentPhase('fetching');

    try {
      // Fetch papers
      const papers = await fetchAdvancedPapers(userMessage.content);
      setCurrentPhase('analyzing');

      // Generate advanced analysis
      const analysis = await generateAdvancedAnalysis(papers, userMessage.content);
      setCurrentPhase('complete');

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: `I found ${papers.length} relevant research papers and generated a comprehensive analysis for \\\"${userMessage.content}\\\".`,
        timestamp: new Date(),
        papers,
        analysis
      };

      setMessages(prev => [...prev, botMessage]);
      
      toast({
        title: "Research completed!",
        description: `Found ${papers.length} papers with advanced AI analysis.`,
      });

    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: 'I encountered an error while processing your request. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Error",
        description: "Failed to complete research. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setCurrentPhase('idle');
    }
  };

  const getSourceBadgeColor = (source: string) => {
    switch (source) {
      case 'crossref': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'arxiv': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'semantic': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-900">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((message) => (
          <div key={message.id} className={`flex gap-4 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            {message.type === 'bot' && (
              <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="h-5 w-5 text-white" />
              </div>
            )}
            
            <div className={`max-w-4xl ${message.type === 'user' ? 'order-first' : ''}`}>
              {message.type === 'user' ? (
                <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3">
                  <p className="text-gray-900 dark:text-white">{message.content}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl px-4 py-3">
                    <p className="text-gray-900 dark:text-white">{message.content}</p>
                  </div>

                  {message.papers && message.analysis && (
                    <div className="space-y-6">
                      {/* Advanced Analysis */}
                      <Card className="shadow-lg">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Brain className="h-5 w-5 text-primary" />
                            Advanced AI Analysis
                            <Badge>AI Generated</Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Tabs defaultValue="summary" className="w-full">
                            <TabsList className="grid w-full grid-cols-6">
                              <TabsTrigger value="summary">Summary</TabsTrigger>
                              <TabsTrigger value="outline">Outline</TabsTrigger>
                              <TabsTrigger value="comparison">Compare</TabsTrigger>
                              <TabsTrigger value="gaps">Gaps</TabsTrigger>
                              <TabsTrigger value="citations">Citations</TabsTrigger>
                              <TabsTrigger value="export">Export</TabsTrigger>
                            </TabsList>

                            <TabsContent value="summary" className="mt-4">
                              <div className="prose max-w-none">
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                  {message.analysis.summary}
                                </p>
                                <div className="mt-4">
                                  <h4 className="font-medium mb-2">Keywords:</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {message.analysis.keywords.map((keyword, idx) => (
                                      <Badge key={idx} variant="secondary">{keyword}</Badge>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </TabsContent>

                            <TabsContent value="outline" className="mt-4">
                              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                                <pre className="whitespace-pre-wrap text-sm font-mono text-gray-700 dark:text-gray-300">
                                  {message.analysis.outline}
                                </pre>
                              </div>
                            </TabsContent>

                            <TabsContent value="comparison" className="mt-4">
                              <div className="prose max-w-none">
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                  {message.analysis.comparison}
                                </p>
                              </div>
                            </TabsContent>

                            <TabsContent value="gaps" className="mt-4">
                              <div className="space-y-4">
                                <div>
                                  <h4 className="font-medium mb-2">Research Gaps:</h4>
                                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                    {message.analysis.researchGaps}
                                  </p>
                                </div>
                                <div>
                                  <h4 className="font-medium mb-2">Future Directions:</h4>
                                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                    {message.analysis.futureDirections}
                                  </p>
                                </div>
                              </div>
                            </TabsContent>

                            <TabsContent value="citations" className="mt-4">
                              <Tabs defaultValue="apa" className="w-full">
                                <TabsList>
                                  <TabsTrigger value="apa">APA</TabsTrigger>
                                  <TabsTrigger value="mla">MLA</TabsTrigger>
                                  <TabsTrigger value="ieee">IEEE</TabsTrigger>
                                </TabsList>
                                <TabsContent value="apa" className="mt-4">
                                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                                    <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
                                      {message.analysis.citations.apa}
                                    </pre>
                                  </div>
                                </TabsContent>
                                <TabsContent value="mla" className="mt-4">
                                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                                    <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
                                      {message.analysis.citations.mla}
                                    </pre>
                                  </div>
                                </TabsContent>
                                <TabsContent value="ieee" className="mt-4">
                                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                                    <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
                                      {message.analysis.citations.ieee}
                                    </pre>
                                  </div>
                                </TabsContent>
                              </Tabs>
                            </TabsContent>

                            <TabsContent value="export" className="mt-4">
                              <ExportOptions 
                                data={{
                                  summary: message.analysis.summary,
                                  outline: message.analysis.outline,
                                  citations: `APA:\\n${message.analysis.citations.apa}\\n\\nMLA:\\n${message.analysis.citations.mla}\\n\\nIEEE:\\n${message.analysis.citations.ieee}`,
                                  keywords: message.analysis.keywords,
                                  gaps: message.analysis.researchGaps
                                }}
                              />
                            </TabsContent>
                          </Tabs>
                        </CardContent>
                      </Card>

                      {/* Papers List */}
                      <Card className="shadow-lg">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary" />
                            Found Papers ({message.papers.length})
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {message.papers.map((paper, idx) => (
                            <div key={idx} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-medium text-gray-900 dark:text-white">{paper.title}</h4>
                                <Badge className={getSourceBadgeColor(paper.source)}>
                                  {paper.source.toUpperCase()}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                {paper.authors.join(', ')} ({paper.year || 'Unknown year'})
                              </p>
                              {paper.venue && (
                                <p className="text-sm text-gray-500 dark:text-gray-500 mb-2">{paper.venue}</p>
                              )}
                              {paper.citationCount && (
                                <p className="text-xs text-gray-500">Citations: {paper.citationCount}</p>
                              )}
                              {paper.abstract && (
                                <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 line-clamp-3">
                                  {paper.abstract}
                                </p>
                              )}
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              )}
            </div>

            {message.type === 'user' && (
              <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-4">
            <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-gray-600 dark:text-gray-400">
                  {currentPhase === 'fetching' && 'Fetching research papers...'}
                  {currentPhase === 'analyzing' && 'Analyzing with AI...'}
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-4 max-w-4xl mx-auto">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Ask me anything about research..."
            className="flex-1 bg-gray-100 dark:bg-gray-800 border-0 focus:ring-2 focus:ring-primary/50"
            disabled={loading}
          />
          <Button onClick={handleSend} disabled={loading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ResearchChat;
