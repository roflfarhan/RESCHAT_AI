import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Paper {
  title: string;
  authors: string;
  abstract: string;
  year: number;
  venue: string;
  url: string;
  source: string;
  doi?: string;
  citationCount?: number;
}

interface ResearchRequest {
  query: string;
  userId: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, userId }: ResearchRequest = await req.json();
    console.log('Processing research query:', query, 'for user:', userId);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Store the query in database
    const { data: queryData, error: queryError } = await supabase
      .from('queries')
      .insert({
        user_id: userId,
        query_text: query,
        query_type: 'text'
      })
      .select()
      .single();

    if (queryError) {
      console.error('Query storage error:', queryError);
      throw new Error(`Failed to store query: ${queryError.message || 'Unknown database error'}`);
    }

    console.log('Query stored with ID:', queryData.id);

    // Fetch papers from multiple sources
    const papers = await fetchFromAllSources(query);
    console.log(`Fetched ${papers.length} papers from all sources`);

    // Store research results
    const storedPapers = [];
    for (const paper of papers) {
      const { data: paperData, error: paperError } = await supabase
        .from('research_results')
        .insert({
          query_id: queryData.id,
          title: paper.title,
          authors: paper.authors,
          abstract: paper.abstract,
          year: paper.year,
          venue: paper.venue || '',
          url: paper.url,
          source: paper.source
        })
        .select()
        .single();

      if (!paperError && paperData) {
        storedPapers.push({ ...paper, id: paperData.id });
      }
    }

    // Generate analysis using Gemini
    const analysis = await generateAnalysis(papers, query, geminiApiKey);
    console.log('Generated analysis with Gemini');

    // Store summaries and outlines
    for (const paper of storedPapers) {
      const paperSummary = analysis.summaries[paper.title] || 'Summary not available';
      
      await supabase.from('summaries').insert({
        research_result_id: paper.id,
        summary: paperSummary
      });

      await supabase.from('outlines').insert({
        research_result_id: paper.id,
        introduction: analysis.outline.introduction,
        literature_review: analysis.outline.literature_review,
        methodology: analysis.outline.methodology,
        results: analysis.outline.results,
        conclusion: analysis.outline.conclusion,
        future_scope: analysis.outline.future_scope
      });
    }

    // Extract and store trending keywords
    if (analysis.keywords.length > 0) {
      for (const keyword of analysis.keywords) {
        await supabase.from('trending_keywords').insert({
          query_id: queryData.id,
          keyword: keyword,
          frequency: 1
        });
      }
    }

    return new Response(JSON.stringify({
      success: true,
      queryId: queryData.id,
      papers: storedPapers,
      analysis: analysis
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in research-assistant function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function fetchFromAllSources(query: string): Promise<Paper[]> {
  console.log('Fetching papers from all sources for query:', query);
  const allPapers: Paper[] = [];

  try {
    // Fetch from CrossRef
    console.log('Fetching from CrossRef...');
    const crossrefPapers = await fetchFromCrossRef(query);
    allPapers.push(...crossrefPapers);
    console.log(`CrossRef returned ${crossrefPapers.length} papers`);
  } catch (error) {
    console.error('CrossRef fetch error:', error);
  }

  try {
    // Fetch from ArXiv
    console.log('Fetching from ArXiv...');
    const arxivPapers = await fetchFromArxiv(query);
    allPapers.push(...arxivPapers);
    console.log(`ArXiv returned ${arxivPapers.length} papers`);
  } catch (error) {
    console.error('ArXiv fetch error:', error);
  }

  try {
    // Fetch from Semantic Scholar
    console.log('Fetching from Semantic Scholar...');
    const semanticPapers = await fetchFromSemanticScholar(query);
    allPapers.push(...semanticPapers);
    console.log(`Semantic Scholar returned ${semanticPapers.length} papers`);
  } catch (error) {
    console.error('Semantic Scholar fetch error:', error);
  }

  return allPapers.slice(0, 15); // Limit to 15 papers total
}

async function fetchFromCrossRef(query: string): Promise<Paper[]> {
  const response = await fetch(`https://api.crossref.org/works?query=${encodeURIComponent(query)}&rows=5`);
  const data = await response.json();
  
  return data.message.items.map((item: any) => ({
    title: item.title?.[0] || 'No title',
    authors: item.author?.map((a: any) => `${a.given || ''} ${a.family || ''}`).join(', ') || 'Unknown authors',
    abstract: item.abstract || 'No abstract available',
    year: item.published?.['date-parts']?.[0]?.[0] || new Date().getFullYear(),
    venue: item['container-title']?.[0] || '',
    url: item.URL || '',
    source: 'CrossRef',
    doi: item.DOI || ''
  }));
}

async function fetchFromArxiv(query: string): Promise<Paper[]> {
  const response = await fetch(`http://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&start=0&max_results=5`);
  const xmlText = await response.text();
  
  // Simple XML parsing for ArXiv
  const entries = xmlText.split('<entry>').slice(1);
  return entries.map(entry => {
    const titleMatch = entry.match(/<title>(.*?)<\/title>/s);
    const summaryMatch = entry.match(/<summary>(.*?)<\/summary>/s);
    const authorMatch = entry.match(/<name>(.*?)<\/name>/g);
    const publishedMatch = entry.match(/<published>(.*?)<\/published>/);
    const linkMatch = entry.match(/<id>(.*?)<\/id>/);

    return {
      title: titleMatch?.[1]?.trim() || 'No title',
      authors: authorMatch?.map(a => a.replace(/<\/?name>/g, '')).join(', ') || 'Unknown authors',
      abstract: summaryMatch?.[1]?.trim() || 'No abstract available',
      year: publishedMatch ? new Date(publishedMatch[1]).getFullYear() : new Date().getFullYear(),
      venue: 'arXiv',
      url: linkMatch?.[1] || '',
      source: 'ArXiv'
    };
  });
}

async function fetchFromSemanticScholar(query: string): Promise<Paper[]> {
  const response = await fetch(`https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(query)}&limit=5&fields=title,abstract,authors,year,venue,url,citationCount`);
  const data = await response.json();
  
  return data.data?.map((item: any) => ({
    title: item.title || 'No title',
    authors: item.authors?.map((a: any) => a.name).join(', ') || 'Unknown authors',
    abstract: item.abstract || 'No abstract available',
    year: item.year || new Date().getFullYear(),
    venue: item.venue || '',
    url: item.url || '',
    source: 'Semantic Scholar',
    citationCount: item.citationCount || 0
  })) || [];
}

async function generateAnalysis(papers: Paper[], query: string, geminiApiKey: string) {
  console.log('Generating analysis with Gemini for', papers.length, 'papers');
  
  const prompt = `You are an advanced academic research assistant. Analyze the following research papers related to the query: "${query}"

Papers:
${papers.map((paper, i) => `
${i + 1}. Title: ${paper.title}
   Authors: ${paper.authors}
   Year: ${paper.year}
   Abstract: ${paper.abstract}
   Source: ${paper.source}
`).join('\n')}

Please provide a comprehensive analysis in JSON format with the following structure:
{
  "summaries": {
    "Paper Title 1": "Concise summary of paper 1",
    "Paper Title 2": "Concise summary of paper 2",
    ...
  },
  "outline": {
    "introduction": "Introduction section content",
    "literature_review": "Literature review content",
    "methodology": "Methodology section content", 
    "results": "Results and discussion content",
    "conclusion": "Conclusion content",
    "future_scope": "Future research directions"
  },
  "citations": "APA format citations for all papers",
  "keywords": ["keyword1", "keyword2", "keyword3", ...],
  "research_gaps": "Identified research gaps and unexplored areas",
  "comparison": "Comparison of similarities and differences between papers"
}

Ensure all content is academic, well-structured, and professionally written.`;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.3,
        topK: 32,
        topP: 1,
        maxOutputTokens: 4096,
      }
    }),
  });

  const data = await response.json();
  const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!generatedText) {
    console.error('No text generated from Gemini');
    throw new Error('Failed to generate analysis');
  }

  try {
    // Extract JSON from the response
    const jsonStart = generatedText.indexOf('{');
    const jsonEnd = generatedText.lastIndexOf('}') + 1;
    const jsonString = generatedText.slice(jsonStart, jsonEnd);
    
    return JSON.parse(jsonString);
  } catch (parseError) {
    console.error('Failed to parse Gemini response as JSON:', parseError);
    // Return a fallback structure
    return {
      summaries: papers.reduce((acc, paper) => ({
        ...acc,
        [paper.title]: `Summary for ${paper.title}: ${paper.abstract.slice(0, 200)}...`
      }), {}),
      outline: {
        introduction: `Research on ${query} encompasses various approaches and methodologies.`,
        literature_review: `The literature review reveals multiple perspectives on ${query}.`,
        methodology: 'Various methodologies have been employed in this research area.',
        results: 'Results show promising developments in the field.',
        conclusion: 'The research provides valuable insights for future work.',
        future_scope: 'Future research should explore additional dimensions of this topic.'
      },
      citations: papers.map(p => `${p.authors} (${p.year}). ${p.title}. ${p.venue}.`).join('\n'),
      keywords: [query, 'research', 'analysis'],
      research_gaps: `Further research is needed in ${query} to address current limitations.`,
      comparison: 'The papers show both similarities and differences in their approaches.'
    };
  }
}