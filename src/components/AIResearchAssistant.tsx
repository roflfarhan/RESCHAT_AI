import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import SearchModule from './SearchModule';
import ResearchResults from './ResearchResults';
import LoadingSpinner from './LoadingSpinner';

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

const AIResearchAssistant: React.FC = () => {
  const [isSearching, setIsSearching] = useState(false);
  const [papers, setPapers] = useState<Paper[]>([]);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check for existing session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setCurrentUser(session?.user || null);
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setCurrentUser(session?.user || null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleSearch = async (query: string, files?: FileList) => {
    if (!currentUser) {
      // For demo purposes, create a temporary user ID
      const tempUserId = 'demo-user-' + Date.now();
      await performSearch(query, tempUserId, files);
      return;
    }

    await performSearch(query, currentUser.id, files);
  };

  const performSearch = async (query: string, userId: string, files?: FileList) => {
    setIsSearching(true);
    setPapers([]);
    setAnalysis(null);

    try {
      toast({
        title: "Search Started",
        description: "Fetching research papers and generating analysis...",
      });

      // If files are uploaded, we should process them first
      if (files && files.length > 0) {
        toast({
          title: "Processing Files",
          description: "Extracting content from uploaded files...",
        });
        // Here you would implement file processing
        // For now, we'll append file info to the query
        const fileNames = Array.from(files).map(f => f.name).join(', ');
        query = `${query} (analyzing uploaded files: ${fileNames})`;
      }

      const response = await supabase.functions.invoke('research-assistant', {
        body: {
          query: query,
          userId: userId
        }
      });

      if (response.error) {
        console.error('Function error:', response.error);
        throw new Error(response.error.message || 'Failed to process research query');
      }

      const { papers: fetchedPapers, analysis: generatedAnalysis } = response.data;

      if (!fetchedPapers || fetchedPapers.length === 0) {
        toast({
          title: "No Results Found",
          description: "Try refining your search query or using different keywords.",
          variant: "destructive"
        });
        return;
      }

      setPapers(fetchedPapers);
      setAnalysis(generatedAnalysis);

      toast({
        title: "Search Complete",
        description: `Found ${fetchedPapers.length} papers with comprehensive analysis.`,
      });

    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleNewSearch = () => {
    setPapers([]);
    setAnalysis(null);
  };

  if (isSearching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-6">
          <LoadingSpinner />
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold font-poppins">Analyzing Research</h2>
            <p className="text-muted-foreground">
              Fetching papers from multiple sources and generating AI analysis...
            </p>
          </div>
          <div className="glass-card p-6 max-w-md">
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                Searching CrossRef database...
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                Querying ArXiv repository...
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                Accessing Semantic Scholar...
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-warning rounded-full animate-pulse"></div>
                Generating AI analysis...
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (papers.length > 0 && analysis) {
    return (
      <ResearchResults
        papers={papers}
        analysis={analysis}
        onNewSearch={handleNewSearch}
      />
    );
  }

  return <SearchModule onSearch={handleSearch} isLoading={isSearching} />;
};

export default AIResearchAssistant;