import React, { useState } from 'react';
import { Search, FileText, BookOpen, Loader2, Download, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();

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
    // Mock implementation - in real app, this would call Gemini API
    const summary = `Found ${papers.length} relevant research papers on "${query}". The papers cover various aspects including theoretical foundations, practical applications, and recent developments in the field.`;
    
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
        description: `Found ${papers.length} papers and generated outline.`,
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
    <div className="min-h-screen bg-gradient-secondary">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BookOpen className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              AI Research Assistant
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Fetch research papers from multiple databases, get AI-powered summaries, and generate structured academic outlines
          </p>
        </div>

        {/* Search Section */}
        <Card className="mb-8 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Research Topic
            </CardTitle>
            <CardDescription>
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
                className="flex-1"
              />
              <Button onClick={handleSearch} disabled={loading} className="px-8">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Researching...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Research
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        {result && (
          <div className="space-y-6">
            {/* Summary */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Research Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{result.summary}</p>
              </CardContent>
            </Card>

            {/* Results Tabs */}
            <Tabs defaultValue="papers" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="papers">Found Papers ({result.papers.length})</TabsTrigger>
                <TabsTrigger value="outline">Generated Outline</TabsTrigger>
              </TabsList>

              <TabsContent value="papers" className="space-y-4">
                {result.papers.map((paper, index) => (
                  <Card key={index} className="shadow-card">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <CardTitle className="text-lg leading-relaxed">
                            {paper.title}
                          </CardTitle>
                          <CardDescription className="mt-2">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <Badge className={getSourceBadgeColor(paper.source)}>
                                {paper.source.toUpperCase()}
                              </Badge>
                              {paper.year && (
                                <Badge variant="secondary">{paper.year}</Badge>
                              )}
                              {paper.venue && (
                                <Badge variant="outline">{paper.venue}</Badge>
                              )}
                            </div>
                            <p className="text-sm">
                              {paper.authors.length > 0 ? `By: ${paper.authors.join(', ')}` : 'Authors unknown'}
                            </p>
                          </CardDescription>
                        </div>
                        {paper.url && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={paper.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    {paper.abstract && (
                      <CardContent>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {paper.abstract}
                        </p>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="outline">
                <Card className="shadow-card">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Structured Academic Outline</CardTitle>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
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
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <Card className="shadow-card">
              <CardHeader>
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Search className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Multi-Source Search</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Search across CrossRef, ArXiv, and Semantic Scholar databases simultaneously
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <div className="h-12 w-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-accent" />
                </div>
                <CardTitle>AI Summaries</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Get intelligent summaries and comparative analysis of research findings
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <div className="h-12 w-12 bg-success/10 rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-success" />
                </div>
                <CardTitle>Structured Outlines</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Generate academic outlines with proper citations and references
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResearchAssistant;