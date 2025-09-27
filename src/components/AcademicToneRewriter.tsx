import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  RefreshCw, 
  Copy, 
  BookOpen, 
  Lightbulb, 
  CheckCircle2,
  AlertTriangle,
  Wand2,
  FileText,
  ArrowRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RewriteSuggestion {
  original: string;
  formal: string;
  reason: string;
  type: 'tone' | 'vocabulary' | 'structure' | 'citation';
}

interface ToneAnalysis {
  informalPhrases: string[];
  suggestions: RewriteSuggestion[];
  formalityScore: number;
  academicFeatures: {
    passiveVoice: number;
    complexSentences: number;
    academicVocabulary: number;
    hedging: number;
  };
}

const AcademicToneRewriter: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [rewrittenText, setRewrittenText] = useState<string>('');
  const [toneAnalysis, setToneAnalysis] = useState<ToneAnalysis | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('rewriter');
  const { toast } = useToast();

  // Academic vocabulary mappings
  const academicVocabulary = {
    'a lot of': ['numerous', 'substantial', 'considerable'],
    'really': ['significantly', 'notably', 'substantially'],
    'very': ['highly', 'extremely', 'particularly'],
    'thing': ['aspect', 'element', 'factor', 'component'],
    'stuff': ['materials', 'elements', 'components'],
    'good': ['effective', 'beneficial', 'advantageous'],
    'bad': ['detrimental', 'problematic', 'disadvantageous'],
    'big': ['substantial', 'significant', 'considerable'],
    'small': ['minimal', 'limited', 'modest'],
    'show': ['demonstrate', 'illustrate', 'reveal'],
    'find': ['discover', 'identify', 'determine'],
    'use': ['utilize', 'employ', 'implement'],
    'get': ['obtain', 'acquire', 'achieve'],
    'make': ['create', 'produce', 'generate'],
    'help': ['assist', 'facilitate', 'contribute to'],
    'because': ['due to', 'owing to', 'as a result of'],
    'but': ['however', 'nevertheless', 'conversely'],
    'so': ['therefore', 'consequently', 'thus'],
    'maybe': ['potentially', 'possibly', 'perhaps'],
    'I think': ['it is suggested that', 'evidence indicates that', 'findings suggest'],
    'in my opinion': ['it can be argued that', 'evidence suggests that', 'analysis indicates'],
    'everyone knows': ['it is widely recognized', 'research demonstrates', 'studies indicate'],
    'obviously': ['clearly', 'evidently', 'demonstrably'],
    'lots of': ['numerous', 'multiple', 'various'],
    'kind of': ['somewhat', 'relatively', 'moderately']
  };

  const processText = async () => {
    if (!inputText.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter some text to rewrite.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      const analysis = analyzeTone(inputText);
      const rewritten = rewriteText(inputText, analysis.suggestions);
      
      setToneAnalysis(analysis);
      setRewrittenText(rewritten);
      
      toast({
        title: "Text Rewritten",
        description: `Applied ${analysis.suggestions.length} academic improvements.`,
      });
    } catch (error) {
      toast({
        title: "Processing Failed",
        description: "Failed to process text. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const analyzeTone = (text: string): ToneAnalysis => {
    const suggestions: RewriteSuggestion[] = [];
    const informalPhrases: string[] = [];
    let processedText = text;

    // Find informal phrases and create suggestions
    Object.entries(academicVocabulary).forEach(([informal, formals]) => {
      const regex = new RegExp(`\\b${informal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      const matches = text.match(regex);
      
      if (matches) {
        matches.forEach(match => {
          informalPhrases.push(match);
          const formal = formals[0]; // Use first formal alternative
          suggestions.push({
            original: match,
            formal: formal,
            reason: `Replace informal "${match}" with more academic "${formal}"`,
            type: 'vocabulary'
          });
        });
      }
    });

    // Detect claims needing citations
    const citationPatterns = [
      /\b(studies show|research shows|it is proven|statistics show|data shows)\b(?!\s+\([^)]+\d{4}[^)]*\))/gi,
      /\b\d+(\.\d+)?%\b(?!\s+\([^)]+\d{4}[^)]*\))/g,
      /\b(according to experts|scientists believe|researchers found)\b(?!\s+\([^)]+\d{4}[^)]*\))/gi,
      /\b(obviously|clearly|everyone knows|it is well known|common knowledge)\b/gi,
      /\b(most people|many researchers|numerous studies|significant research)\b(?!\s+\([^)]+\d{4}[^)]*\))/gi
    ];

    citationPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          suggestions.push({
            original: match,
            formal: `${match} [citation needed]`,
            reason: `Claims like "${match}" require academic citations to support the statement`,
            type: 'citation'
          });
        });
      }
    });

    // Analyze sentence structure
    const sentences = text.split(/[.!?]+/).filter(s => s.trim());
    sentences.forEach(sentence => {
      const trimmed = sentence.trim();
      if (trimmed) {
        // Check for first person usage
        if (/\b(I|we|my|our)\b/i.test(trimmed)) {
          suggestions.push({
            original: trimmed,
            formal: convertToPassiveVoice(trimmed),
            reason: 'Convert first person to passive voice for academic tone',
            type: 'structure'
          });
        }
        
        // Check for contractions
        const contractions = trimmed.match(/\b(can't|won't|don't|isn't|aren't|wasn't|weren't|hasn't|haven't|hadn't|wouldn't|couldn't|shouldn't)\b/gi);
        if (contractions) {
          contractions.forEach(contraction => {
            suggestions.push({
              original: contraction,
              formal: expandContraction(contraction),
              reason: `Expand contraction "${contraction}" for formal writing`,
              type: 'tone'
            });
          });
        }
      }
    });

    // Calculate formality score
    const totalWords = text.split(/\s+/).length;
    const informalCount = informalPhrases.length;
    const formalityScore = Math.max(0, Math.min(100, (totalWords - informalCount * 2) / totalWords * 100));

    // Remove duplicates and sort by importance
    const uniqueSuggestions = suggestions.reduce((acc, current) => {
      const exists = acc.find(item => item.original.toLowerCase() === current.original.toLowerCase());
      if (!exists) {
        acc.push(current);
      }
      return acc;
    }, [] as RewriteSuggestion[]);

    // Sort suggestions by type priority: citation > structure > vocabulary > tone
    const priorityOrder = { citation: 1, structure: 2, vocabulary: 3, tone: 4 };
    uniqueSuggestions.sort((a, b) => priorityOrder[a.type] - priorityOrder[b.type]);

    return {
      informalPhrases,
      suggestions: uniqueSuggestions, // No limit - comprehensive suggestions
      formalityScore: Math.round(formalityScore),
      academicFeatures: {
        passiveVoice: countPassiveVoice(text),
        complexSentences: countComplexSentences(text),
        academicVocabulary: countAcademicVocabulary(text),
        hedging: countHedging(text)
      }
    };
  };

  const rewriteText = (text: string, suggestions: RewriteSuggestion[]): string => {
    let rewritten = text;
    
    // Apply suggestions in order of priority to avoid conflicts
    // Group by type and apply systematically
    const suggestionsByType = {
      citation: suggestions.filter(s => s.type === 'citation'),
      structure: suggestions.filter(s => s.type === 'structure'),
      vocabulary: suggestions.filter(s => s.type === 'vocabulary'),
      tone: suggestions.filter(s => s.type === 'tone')
    };

    // Apply each type of suggestion
    Object.values(suggestionsByType).forEach(typeSuggestions => {
      typeSuggestions.forEach(suggestion => {
        const regex = new RegExp(`\\b${suggestion.original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        rewritten = rewritten.replace(regex, (match) => {
          // Preserve original capitalization
          if (match[0] === match[0].toUpperCase()) {
            return suggestion.formal.charAt(0).toUpperCase() + suggestion.formal.slice(1);
          }
          return suggestion.formal;
        });
      });
    });

    return rewritten;
  };

  const convertToPassiveVoice = (sentence: string): string => {
    // Improved passive voice conversion with better grammar
    return sentence
      .replace(/\bI\s+(analyze|examine|investigate|study|evaluate|assess)/gi, 'An analysis was conducted')
      .replace(/\bI\s+(found|discovered|determined|identified)/gi, 'It was found')
      .replace(/\bI\s+(conclude|suggest|propose|recommend)/gi, 'It is concluded')
      .replace(/\bWe\s+(analyze|examine|investigate|study|evaluate|assess)/gi, 'An analysis was conducted')
      .replace(/\bWe\s+(found|discovered|determined|identified)/gi, 'It was found')
      .replace(/\bWe\s+(conclude|suggest|propose|recommend)/gi, 'It is concluded')
      .replace(/\bMy\s+research\s+(shows|demonstrates|reveals|indicates)/gi, 'Research $1')
      .replace(/\bOur\s+(study|research|analysis)\s+(found|revealed|showed|demonstrated)/gi, 'The $1 $2')
      .replace(/\bI\s+think/gi, 'It is suggested')
      .replace(/\bWe\s+believe/gi, 'It is believed')
      .replace(/\bIn\s+my\s+opinion/gi, 'It can be argued that');
  };

  const expandContraction = (contraction: string): string => {
    const expansions: { [key: string]: string } = {
      "can't": "cannot",
      "won't": "will not",
      "don't": "do not",
      "doesn't": "does not",
      "didn't": "did not",
      "isn't": "is not",
      "aren't": "are not",
      "wasn't": "was not",
      "weren't": "were not",
      "hasn't": "has not",
      "haven't": "have not",
      "hadn't": "had not",
      "wouldn't": "would not",
      "couldn't": "could not",
      "shouldn't": "should not",
      "mustn't": "must not",
      "needn't": "need not",
      "shan't": "shall not",
      "mightn't": "might not",
      "she's": "she is",
      "he's": "he is",
      "it's": "it is",
      "that's": "that is",
      "what's": "what is",
      "there's": "there is",
      "here's": "here is",
      "let's": "let us",
      "i'm": "I am",
      "you're": "you are",
      "we're": "we are",
      "they're": "they are",
      "i'll": "I will",
      "you'll": "you will",
      "we'll": "we will",
      "they'll": "they will",
      "i'd": "I would",
      "you'd": "you would",
      "we'd": "we would",
      "they'd": "they would",
      "i've": "I have",
      "you've": "you have",
      "we've": "we have",
      "they've": "they have"
    };
    return expansions[contraction.toLowerCase()] || contraction;
  };

  const countPassiveVoice = (text: string): number => {
    const passivePatterns = [/\bis\s+\w+ed\b/gi, /\bwas\s+\w+ed\b/gi, /\bare\s+\w+ed\b/gi, /\bwere\s+\w+ed\b/gi];
    return passivePatterns.reduce((count, pattern) => count + (text.match(pattern) || []).length, 0);
  };

  const countComplexSentences = (text: string): number => {
    return (text.match(/\b(although|however|nevertheless|furthermore|moreover|consequently|therefore)\b/gi) || []).length;
  };

  const countAcademicVocabulary = (text: string): number => {
    const academicWords = ['demonstrate', 'illustrate', 'substantial', 'significant', 'analyze', 'evaluate', 'synthesize'];
    return academicWords.reduce((count, word) => count + (text.match(new RegExp(`\\b${word}\\b`, 'gi')) || []).length, 0);
  };

  const countHedging = (text: string): number => {
    const hedgingWords = ['possibly', 'potentially', 'likely', 'suggests', 'appears', 'seems', 'may', 'might'];
    return hedgingWords.reduce((count, word) => count + (text.match(new RegExp(`\\b${word}\\b`, 'gi')) || []).length, 0);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to Clipboard",
      description: "Text has been copied to your clipboard.",
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle2 className="w-4 h-4 text-green-600" />;
    if (score >= 60) return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
    return <AlertTriangle className="w-4 h-4 text-red-600" />;
  };

  return (
    <Card className="w-full" data-testid="academic-tone-rewriter">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="w-5 h-5" />
          Academic Tone Rewriter
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="rewriter" data-testid="tab-rewriter">Rewriter</TabsTrigger>
            <TabsTrigger value="analysis" data-testid="tab-analysis">Analysis</TabsTrigger>
            <TabsTrigger value="suggestions" data-testid="tab-suggestions">Suggestions</TabsTrigger>
          </TabsList>

          <TabsContent value="rewriter" className="space-y-4">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Original Text</label>
                <Textarea
                  placeholder="Enter your casual text here to convert it to academic tone..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="min-h-32"
                  data-testid="textarea-input"
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={processText} 
                  disabled={isProcessing}
                  className="flex-1"
                  data-testid="button-rewrite"
                >
                  {isProcessing ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <ArrowRight className="w-4 h-4 mr-2" />
                  )}
                  {isProcessing ? 'Processing...' : 'Rewrite to Academic Tone'}
                </Button>
              </div>

              {rewrittenText && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Academic Version</label>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => copyToClipboard(rewrittenText)}
                      data-testid="button-copy-rewritten"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                  <ScrollArea className="h-32 w-full border rounded-md p-3">
                    <p className="text-sm" data-testid="rewritten-text">{rewrittenText}</p>
                  </ScrollArea>
                </div>
              )}

              {toneAnalysis && (
                <Alert>
                  <Lightbulb className="h-4 w-4" />
                  <AlertDescription>
                    Formality Score: <span className={`font-semibold ${getScoreColor(toneAnalysis.formalityScore)}`}>
                      {toneAnalysis.formalityScore}/100
                    </span>
                    {toneAnalysis.formalityScore < 70 && " - Consider applying more suggestions to improve academic tone"}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-4">
            {toneAnalysis ? (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <BookOpen className="w-5 h-5" />
                      Tone Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${getScoreColor(toneAnalysis.formalityScore)}`}>
                          {toneAnalysis.formalityScore}%
                        </div>
                        <div className="text-sm text-gray-600">Formality</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {toneAnalysis.academicFeatures.passiveVoice}
                        </div>
                        <div className="text-sm text-gray-600">Passive Voice</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {toneAnalysis.academicFeatures.academicVocabulary}
                        </div>
                        <div className="text-sm text-gray-600">Academic Words</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {toneAnalysis.academicFeatures.hedging}
                        </div>
                        <div className="text-sm text-gray-600">Hedging</div>
                      </div>
                    </div>

                    {toneAnalysis.informalPhrases.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Informal Phrases Detected</h4>
                        <div className="flex flex-wrap gap-2">
                          {toneAnalysis.informalPhrases.slice(0, 8).map((phrase, index) => (
                            <Badge key={index} variant="destructive">{phrase}</Badge>
                          ))}
                          {toneAnalysis.informalPhrases.length > 8 && (
                            <Badge variant="outline">+{toneAnalysis.informalPhrases.length - 8} more</Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Process some text first to see the tone analysis</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="suggestions" className="space-y-4">
            {toneAnalysis && toneAnalysis.suggestions.length > 0 ? (
              <div className="space-y-2">
                <h3 className="font-semibold">Improvement Suggestions</h3>
                {toneAnalysis.suggestions.map((suggestion, index) => (
                  <Card key={index} className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={suggestion.type === 'tone' ? 'default' : 
                                     suggestion.type === 'vocabulary' ? 'secondary' : 
                                     suggestion.type === 'structure' ? 'outline' : 'destructive'}>
                          {suggestion.type}
                        </Badge>
                        {getScoreIcon(80)}
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Original:</p>
                          <p className="font-mono text-sm bg-red-50 dark:bg-red-950 p-2 rounded">
                            {suggestion.original}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Academic:</p>
                          <p className="font-mono text-sm bg-green-50 dark:bg-green-950 p-2 rounded">
                            {suggestion.formal}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 italic">{suggestion.reason}</p>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Lightbulb className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Process some text first to see improvement suggestions</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Usage Instructions */}
        {!inputText && (
          <Card className="mt-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
            <CardContent className="p-4">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                How to Use the Academic Tone Rewriter
              </h4>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Paste your casual or informal text in the input area</li>
                <li>• Click "Rewrite to Academic Tone" to process the text</li>
                <li>• Review suggestions in the Analysis and Suggestions tabs</li>
                <li>• Copy the rewritten text for use in your academic work</li>
                <li>• Use formality score to gauge academic appropriateness</li>
              </ul>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};

export default AcademicToneRewriter;