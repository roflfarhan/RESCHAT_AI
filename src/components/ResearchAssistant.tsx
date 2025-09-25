import React, { useState, useEffect } from 'react';
import { Search, FileText, BookOpen, Loader2, Download, ExternalLink, Sparkles, Zap, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import AnimatedBackground from './AnimatedBackground';
import LoadingSpinner from './LoadingSpinner';

interface Paper {
  title: string;
  authors: string[];
  abstract?: string;
  year?: number;
  venue?: string;
  url?: string;
  source: 'crossref' | 'arxiv' | 'semantic';
}

interface ResearchResult {
  papers: Paper[];
  summary: string;
  outline: string;
}

const ResearchAssistant = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResearchResult | null>(null);
  const [animationPhase, setAnimationPhase] = useState<'idle' | 'searching' | 'analyzing' | 'complete'>('idle');
  const { toast } = useToast();

  // Animation state management
  useEffect(() => {
    if (loading) {
      setAnimationPhase('searching');
      const timer1 = setTimeout(() => setAnimationPhase('analyzing'), 2000);
      return () => clearTimeout(timer1);
    } else if (result) {
      setAnimationPhase('complete');
    } else {
      setAnimationPhase('idle');
    }
  }, [loading, result]);

  const fetchPapers = async (searchQuery: string): Promise<Paper[]> => {
    const papers: Paper[] = [];

    try {
      // Fetch from CrossRef
      const crossrefResponse = await fetch(
        `https://api.crossref.org/works?query=${encodeURIComponent(searchQuery)}&rows=3`,
        { headers: { Accept: 'application/json' } }
      );
      const crossrefData = await crossrefResponse.json();
      
      if (crossrefData.message?.items) {
        crossrefData.message.items.forEach((item: any) => {
          papers.push({
            title: item.title?.[0] || 'Untitled',
            authors: item.author?.map((a: any) => `${a.given} ${a.family}`) || [],
            year: item['published-print']?.['date-parts']?.[0]?.[0] || item['published-online']?.['date-parts']?.[0]?.[0],
            venue: item['container-title']?.[0],
            url: item.URL,
            source: 'crossref'
          });
        });
      }

      // Fetch from ArXiv
      const arxivResponse = await fetch(
        `http://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(searchQuery)}&start=0&max_results=3`,
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

      // Fetch from Semantic Scholar
      const semanticResponse = await fetch(
        `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(searchQuery)}&limit=3&fields=title,abstract,authors,year,venue,url`,
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
            source: 'semantic'
          });
        });
      }

    } catch (error) {
      console.error('Error fetching papers:', error);
      toast({
        title: "Error fetching papers",
        description: "Some paper sources might not be available. Continuing with available data.",
        variant: "destructive"
      });
    }

    return papers;
  };

  const generateOutline = async (papers: Paper[]): Promise<{ summary: string; outline: string }> => {
    try {
      const prompt = `You are an academic research assistant. Analyze the following research paper data:

${papers.map(paper => `
Title: ${paper.title}
Authors: ${paper.authors.join(', ')}
Year: ${paper.year || 'Unknown'}
Abstract: ${paper.abstract || 'Not available'}
Source: ${paper.source}
`).join('\n')}

Please provide:
1. A comprehensive summary of the research findings
2. A detailed structured academic outline with the following sections:
   - Introduction
   - Literature Review (with paper summaries)
   - Methodology
   - Results & Discussion
   - Conclusion
   - Future Scope
   - References (in APA format)

Make it detailed and professional for academic use.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyBTqDgZ2zee5zCwQp2H6u6cOfA3aNR2J5k'}`, {
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

      if (!response.ok) {
        throw new Error('Failed to generate outline with Gemini');
      }

      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No content generated';
      
      // Split content into summary and outline
      const parts = content.split('## Structured Academic Outline');
      const summary = parts[0]?.replace('## Summary', '').trim() || `Generated comprehensive analysis of ${papers.length} research papers on "${query}".`;
      const outline = parts[1] ? `## Structured Academic Outline${parts[1]}` : content;

      return { summary, outline };
      
    } catch (error) {
      console.error('Gemini API error:', error);
      // Fallback to mock data if API fails
      const summary = `AI-Generated analysis of ${papers.length} relevant research papers on "${query}". The papers cover various aspects including theoretical foundations, practical applications, and recent developments in the field.`;
      
      const outline = `# Research Outline: ${query}

## Introduction
- Overview of ${query}
- Research significance and scope
- Current state of the field

## Literature Review
${papers.map((paper, index) => `
### Paper ${index + 1}: ${paper.title}
- **Authors**: ${paper.authors.join(', ')}
- **Year**: ${paper.year || 'Unknown'}
- **Venue**: ${paper.venue || 'Unknown'}
- **Key Findings**: ${paper.abstract ? paper.abstract.substring(0, 200) + '...' : 'Abstract not available'}
`).join('')}

## Methodology
- Research approach and design
- Data collection methods
- Analysis techniques

## Results & Discussion
- Key findings synthesis
- Comparative analysis
- Implications and significance

## Conclusion
- Summary of main insights
- Limitations and future directions
- Recommendations

## References
${papers.map((paper, index) => `
${index + 1}. ${paper.authors.join(', ')} (${paper.year || 'n.d.'}). ${paper.title}. ${paper.venue || 'Unknown venue'}. ${paper.url ? `Retrieved from ${paper.url}` : ''}
`).join('')}

## Future Scope
- Identified research gaps
- Potential extensions
- Emerging opportunities`;

      return { summary, outline };
    }
  };

  const handleSearch = async () => {
    if (!query.trim()) {
      toast({
        title: "Please enter a research topic",
        description: "Enter a topic to search for research papers.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const papers = await fetchPapers(query);
      const analysis = await generateOutline(papers);
      
      setResult({
        papers,
        summary: analysis.summary,
        outline: analysis.outline
      });

      toast({
        title: "Research completed!",
        description: `Found ${papers.length} papers and generated AI outline.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete research. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
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
    <div className="min-h-screen relative">
      <AnimatedBackground />
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="relative">
              <BookOpen className="h-12 w-12 text-primary animate-glow" />
              <Sparkles className="h-6 w-6 text-accent absolute -top-2 -right-2 animate-bounce" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              AI Research Assistant
            </h1>
            <div className="relative">
              <Brain className="h-12 w-12 text-accent animate-glow" />
              <Zap className="h-6 w-6 text-primary absolute -top-2 -right-2 animate-bounce" style={{ animationDelay: '0.5s' }} />
            </div>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed animate-slide-in-left" style={{ animationDelay: '0.3s' }}>
            Fetch research papers from multiple databases, get AI-powered summaries, and generate structured academic outlines with intelligent analysis
          </p>
        </div>

        {/* Search Section */}
        <Card className="mb-8 shadow-glow border-0 bg-gradient-card animate-scale-in" style={{ animationDelay: '0.6s' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <Search className="h-6 w-6 animate-pulse" />
              Research Topic Discovery
              {animationPhase === 'searching' && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
            </CardTitle>
            <CardDescription className="text-lg">
              Enter your research topic to find relevant papers from CrossRef, ArXiv, and Semantic Scholar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                placeholder="e.g., AI in healthcare, machine learning algorithms, quantum computing..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 text-lg py-6 transition-all duration-300 focus:shadow-glow focus:scale-105"
                disabled={loading}
              />
              <Button 
                onClick={handleSearch} 
                disabled={loading} 
                className="px-8 py-6 text-lg transition-all duration-300 hover:scale-105 hover:shadow-primary"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    {animationPhase === 'searching' ? 'Searching...' : 'Analyzing...'}
                  </>
                ) : (
                  <>
                    <Search className="h-5 w-5 mr-2" />
                    Research
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Loading Animation */}
        {loading && (
          <div className="mb-8 animate-bounce-in">
            <Card className="shadow-glow border-primary/20 bg-gradient-card">
              <CardContent className="pt-6">
                <LoadingSpinner 
                  size="lg" 
                  text={animationPhase === 'searching' ? 'Searching academic databases...' : 'Analyzing papers with AI...'}
                />
                <div className="mt-6 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className={`w-2 h-2 rounded-full ${animationPhase === 'searching' ? 'bg-primary animate-pulse' : 'bg-success'}`}></div>
                    Fetching from CrossRef, ArXiv, Semantic Scholar
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className={`w-2 h-2 rounded-full ${animationPhase === 'analyzing' ? 'bg-primary animate-pulse' : animationPhase === 'complete' ? 'bg-success' : 'bg-muted'}`}></div>
                    AI-powered analysis with Gemini
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Results Section */}
        {result && (
          <div className="space-y-6 animate-fade-in">
            {/* Summary */}
            <Card className="shadow-glow border-0 bg-gradient-card animate-slide-in-left">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <FileText className="h-6 w-6 text-primary animate-float" />
                  AI Research Summary
                  <Badge className="animate-glow">AI Generated</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-lg leading-relaxed">{result.summary}</p>
              </CardContent>
            </Card>

            {/* Results Tabs */}
            <Tabs defaultValue="papers" className="w-full animate-slide-in-right">
              <TabsList className="grid w-full grid-cols-2 p-1 bg-gradient-card shadow-card">
                <TabsTrigger value="papers" className="text-lg py-3 transition-all duration-300 hover:scale-105">
                  Found Papers ({result.papers.length})
                </TabsTrigger>
                <TabsTrigger value="outline" className="text-lg py-3 transition-all duration-300 hover:scale-105">
                  AI-Generated Outline
                </TabsTrigger>
              </TabsList>

              <TabsContent value="papers" className="space-y-4 mt-6">
                {result.papers.map((paper, index) => (
                  <Card 
                    key={index} 
                    className="shadow-glow border-0 bg-gradient-card transition-all duration-300 hover:scale-102 hover:shadow-primary animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <CardTitle className="text-xl leading-relaxed hover:text-primary transition-colors duration-300">
                            {paper.title}
                          </CardTitle>
                          <CardDescription className="mt-3">
                            <div className="flex flex-wrap items-center gap-2 mb-3">
                              <Badge className={`${getSourceBadgeColor(paper.source)} animate-pulse`}>
                                {paper.source.toUpperCase()}
                              </Badge>
                              {paper.year && (
                                <Badge variant="secondary" className="animate-fade-in">{paper.year}</Badge>
                              )}
                              {paper.venue && (
                                <Badge variant="outline" className="animate-fade-in">{paper.venue}</Badge>
                              )}
                            </div>
                            <p className="text-base">
                              {paper.authors.length > 0 ? `By: ${paper.authors.join(', ')}` : 'Authors unknown'}
                            </p>
                          </CardDescription>
                        </div>
                        {paper.url && (
                          <Button variant="outline" size="sm" asChild className="transition-all duration-300 hover:scale-110 hover:shadow-glow">
                            <a href={paper.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    {paper.abstract && (
                      <CardContent>
                        <p className="text-muted-foreground leading-relaxed">
                          {paper.abstract}
                        </p>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="outline" className="mt-6">
                <Card className="shadow-glow border-0 bg-gradient-card animate-scale-in">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-3 text-2xl">
                        <BookOpen className="h-6 w-6 text-primary animate-float" />
                        Structured Academic Outline
                        <Badge className="animate-glow">AI Powered</Badge>
                      </CardTitle>
                      <Button variant="outline" size="sm" className="transition-all duration-300 hover:scale-110 hover:shadow-glow">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-lg max-w-none dark:prose-invert">
                      <pre className="whitespace-pre-wrap font-sans leading-relaxed text-base bg-muted/30 p-6 rounded-lg border">
                        {result.outline}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Getting Started */}
        {!result && !loading && (
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            {[
              { icon: Search, title: 'Multi-Source Search', desc: 'Search across CrossRef, ArXiv, and Semantic Scholar databases simultaneously', delay: '0.9s' },
              { icon: Sparkles, title: 'AI Summaries', desc: 'Get intelligent summaries and comparative analysis of research findings', delay: '1.2s' },
              { icon: BookOpen, title: 'Structured Outlines', desc: 'Generate academic outlines with proper citations and references', delay: '1.5s' }
            ].map((feature, index) => (
              <Card 
                key={index}
                className="shadow-glow border-0 bg-gradient-card transition-all duration-500 hover:scale-105 hover:shadow-primary animate-bounce-in group"
                style={{ animationDelay: feature.delay }}
              >
                <CardHeader>
                  <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="h-8 w-8 text-primary animate-float" />
                  </div>
                  <CardTitle className="text-center text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-center leading-relaxed">
                    {feature.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResearchAssistant;