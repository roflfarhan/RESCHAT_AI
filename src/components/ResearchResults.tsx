import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  FileText, 
  Users, 
  Calendar, 
  ExternalLink, 
  Quote, 
  Download,
  Share,
  BookOpen,
  TrendingUp,
  Globe,
  Code,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import ExportOptions from './ExportOptions';
import PaperDraftGenerator from './PaperDraftGenerator';
import AcademicToneRewriter from './AcademicToneRewriter';

interface Paper {
  id: string;
  title: string;
  authors: string;
  abstract: string;
  year: number;
  venue: string;
  url: string;
  source: string;
  citationCount?: number;
}

interface Analysis {
  summaries: { [key: string]: string };
  outline: {
    introduction: string;
    literature_review: string;
    methodology: string;
    results: string;
    conclusion: string;
    future_scope: string;
  };
  citations: string;
  keywords: string[];
  research_gaps: string;
  comparison: string;
}

interface ResearchResultsProps {
  papers: Paper[];
  analysis: Analysis;
  searchQuery: string;
  onNewSearch: () => void;
}

const ResearchResults: React.FC<ResearchResultsProps> = ({
  papers,
  analysis,
  searchQuery,
  onNewSearch
}) => {
  const [expandedPapers, setExpandedPapers] = useState<Set<string>>(new Set());

  const togglePaperExpansion = (paperId: string) => {
    const newExpanded = new Set(expandedPapers);
    if (newExpanded.has(paperId)) {
      newExpanded.delete(paperId);
    } else {
      newExpanded.add(paperId);
    }
    setExpandedPapers(newExpanded);
  };

  const getSourceBadgeColor = (source: string) => {
    switch (source.toLowerCase()) {
      case 'crossref': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'arxiv': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'semantic scholar': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const exportData = {
    summary: analysis.comparison,
    outline: `Introduction: ${analysis.outline.introduction}\n\nLiterature Review: ${analysis.outline.literature_review}\n\nMethodology: ${analysis.outline.methodology}\n\nResults: ${analysis.outline.results}\n\nConclusion: ${analysis.outline.conclusion}\n\nFuture Scope: ${analysis.outline.future_scope}`,
    citations: analysis.citations,
    keywords: analysis.keywords,
    gaps: analysis.research_gaps
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold font-poppins bg-gradient-primary bg-clip-text text-transparent">
              Research Results
            </h1>
            <p className="text-muted-foreground mt-2">
              Found {papers.length} papers • Generated comprehensive analysis
            </p>
          </div>
          <Button onClick={onNewSearch} className="glass-button">
            <FileText className="mr-2 h-4 w-4" />
            New Search
          </Button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Papers List */}
          <div className="xl:col-span-2 space-y-6">
            <h2 className="text-2xl font-semibold font-poppins mb-4">Research Papers</h2>
            {papers.map((paper) => (
              <Card key={paper.id} className="glass-card hover:shadow-glow transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start gap-4">
                    <CardTitle className="text-xl font-semibold text-card-foreground line-clamp-2">
                      {paper.title}
                    </CardTitle>
                    <Badge className={`shrink-0 ${getSourceBadgeColor(paper.source)}`}>
                      {paper.source}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span className="line-clamp-1">{paper.authors}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{paper.year}</span>
                    </div>
                    {paper.citationCount && (
                      <div className="flex items-center gap-1">
                        <Quote className="h-4 w-4" />
                        <span>{paper.citationCount} citations</span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {paper.venue && (
                      <p className="text-sm font-medium text-accent">
                        Published in: {paper.venue}
                      </p>
                    )}
                    
                    <div>
                      <p className={`text-muted-foreground ${
                        expandedPapers.has(paper.id) ? '' : 'line-clamp-3'
                      }`}>
                        {paper.abstract}
                      </p>
                      {paper.abstract.length > 200 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => togglePaperExpansion(paper.id)}
                          className="mt-2 p-0 h-auto text-primary hover:text-primary-hover"
                        >
                          {expandedPapers.has(paper.id) ? (
                            <>Show Less <ChevronUp className="ml-1 h-4 w-4" /></>
                          ) : (
                            <>Show More <ChevronDown className="ml-1 h-4 w-4" /></>
                          )}
                        </Button>
                      )}
                    </div>

                    {analysis.summaries[paper.title] && (
                      <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
                        <h4 className="font-semibold text-primary mb-2">AI Summary</h4>
                        <p className="text-sm text-card-foreground">
                          {analysis.summaries[paper.title]}
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      {paper.url && (
                        <Button variant="outline" size="sm" asChild className="glass-button">
                          <a href={paper.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            View Paper
                          </a>
                        </Button>
                      )}
                      <Button variant="outline" size="sm" className="glass-button">
                        <Share className="mr-2 h-4 w-4" />
                        Share
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Analysis Panel */}
          <div className="space-y-6">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid grid-cols-4 glass mb-6">
                <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
                <TabsTrigger value="analysis" data-testid="tab-analysis">Analysis</TabsTrigger>
                <TabsTrigger value="draft" data-testid="tab-draft">Draft</TabsTrigger>
                <TabsTrigger value="rewriter" data-testid="tab-rewriter">Rewriter</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Quick Stats */}
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Quick Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{papers.length}</div>
                        <div className="text-sm text-muted-foreground">Papers Found</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-accent">{analysis.keywords.length}</div>
                        <div className="text-sm text-muted-foreground">Keywords</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Keywords */}
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      Trending Keywords
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {analysis.keywords.map((keyword, index) => (
                        <Badge key={index} variant="secondary" className="bg-accent/20 text-accent-foreground">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Research Gaps */}
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      Research Gaps
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{analysis.research_gaps}</p>
                  </CardContent>
                </Card>

                {/* Export Options */}
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Download className="h-5 w-5" />
                      Export Research
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ExportOptions data={exportData} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analysis" className="space-y-6">
                {/* Research Outline */}
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle>Research Outline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-96">
                      <div className="space-y-6">
                        <div>
                          <h4 className="font-semibold text-primary mb-2">Introduction</h4>
                          <p className="text-sm text-muted-foreground">{analysis.outline.introduction}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-primary mb-2">Literature Review</h4>
                          <p className="text-sm text-muted-foreground">{analysis.outline.literature_review}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-primary mb-2">Methodology</h4>
                          <p className="text-sm text-muted-foreground">{analysis.outline.methodology}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-primary mb-2">Results</h4>
                          <p className="text-sm text-muted-foreground">{analysis.outline.results}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-primary mb-2">Conclusion</h4>
                          <p className="text-sm text-muted-foreground">{analysis.outline.conclusion}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-primary mb-2">Future Scope</h4>
                          <p className="text-sm text-muted-foreground">{analysis.outline.future_scope}</p>
                        </div>
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* Comparison */}
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle>Paper Comparison</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{analysis.comparison}</p>
                  </CardContent>
                </Card>

                {/* Citations */}
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle>Citations (APA Format)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64">
                      <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-mono">
                        {analysis.citations}
                      </pre>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="draft" className="space-y-6">
                <PaperDraftGenerator
                  papers={papers}
                  analysis={analysis}
                  searchQuery={searchQuery}
                />
              </TabsContent>

              <TabsContent value="rewriter" className="space-y-6">
                <AcademicToneRewriter />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResearchResults;