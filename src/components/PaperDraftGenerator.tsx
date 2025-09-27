import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  FileText, 
  Download, 
  Copy, 
  RefreshCw, 
  GraduationCap, 
  Presentation,
  Search,
  Edit3,
  User
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

interface PaperDraftGeneratorProps {
  papers: Paper[];
  analysis: Analysis;
  searchQuery: string;
}

interface StudentInfo {
  name: string;
  affiliation: string;
  course: string;
  instructor: string;
  dueDate: string;
}

interface DraftTemplate {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  sections: string[];
}

const PAPER_TEMPLATES: DraftTemplate[] = [
  {
    id: 'research_paper',
    name: 'Research Paper',
    icon: <FileText className="w-4 h-4" />,
    description: 'Standard academic research paper format',
    sections: ['Abstract', 'Introduction', 'Literature Review', 'Methodology', 'Results', 'Discussion', 'Conclusion', 'References']
  },
  {
    id: 'thesis',
    name: 'Thesis',
    icon: <GraduationCap className="w-4 h-4" />,
    description: 'Comprehensive thesis structure',
    sections: ['Abstract', 'Introduction', 'Literature Review', 'Theoretical Framework', 'Methodology', 'Results', 'Discussion', 'Conclusion', 'Future Work', 'References']
  },
  {
    id: 'systematic_review',
    name: 'Systematic Review',
    icon: <Search className="w-4 h-4" />,
    description: 'Systematic literature review format',
    sections: ['Abstract', 'Introduction', 'Methods', 'Search Strategy', 'Results', 'Discussion', 'Limitations', 'Conclusion', 'References']
  },
  {
    id: 'conference_paper',
    name: 'Conference Paper',
    icon: <Presentation className="w-4 h-4" />,
    description: 'Concise conference paper format',
    sections: ['Abstract', 'Introduction', 'Related Work', 'Approach', 'Evaluation', 'Results', 'Conclusion', 'References']
  }
];

const PaperDraftGenerator: React.FC<PaperDraftGeneratorProps> = ({
  papers,
  analysis,
  searchQuery
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('research_paper');
  const [generatedDraft, setGeneratedDraft] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [studentInfo, setStudentInfo] = useState<StudentInfo>({
    name: '',
    affiliation: '',
    course: '',
    instructor: '',
    dueDate: ''
  });
  const [showStudentForm, setShowStudentForm] = useState(false);
  const { toast } = useToast();

  const generateDraft = async () => {
    setIsGenerating(true);
    try {
      const template = PAPER_TEMPLATES.find(t => t.id === selectedTemplate);
      if (!template) return;

      const draft = await createPaperDraft(template, papers, analysis, searchQuery, studentInfo);
      setGeneratedDraft(draft);
      
      toast({
        title: "Draft Generated",
        description: `${template.name} draft created successfully with ${papers.length} referenced papers.`,
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate paper draft. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const createPaperDraft = async (template: DraftTemplate, papers: Paper[], analysis: Analysis, query: string, studentInfo: StudentInfo): Promise<string> => {
    const currentDate = new Date().toLocaleDateString();
    const paperCount = papers.length;
    
    let draft = `# ${template.name}: ${query}\n\n`;
    
    // Student Information Header
    if (studentInfo.name || studentInfo.affiliation || studentInfo.course) {
      draft += `**Author:** ${studentInfo.name || '[STUDENT NAME]'}\n`;
      if (studentInfo.affiliation) draft += `**Affiliation:** ${studentInfo.affiliation}\n`;
      if (studentInfo.course) draft += `**Course:** ${studentInfo.course}\n`;
      if (studentInfo.instructor) draft += `**Instructor:** ${studentInfo.instructor}\n`;
      if (studentInfo.dueDate) draft += `**Due Date:** ${studentInfo.dueDate}\n`;
      draft += `\n`;
    } else {
      draft += `**Author:** [PLACEHOLDER: Enter your name]\n`;
      draft += `**Affiliation:** [PLACEHOLDER: Enter your institution/university]\n`;
      draft += `**Course:** [PLACEHOLDER: Enter course name and number]\n`;
      draft += `**Instructor:** [PLACEHOLDER: Enter instructor name]\n`;
      draft += `**Due Date:** [PLACEHOLDER: Enter due date]\n\n`;
    }
    
    draft += `**Generated on:** ${currentDate}\n`;
    draft += `**Based on:** ${paperCount} research papers\n`;
    draft += `**Keywords:** ${analysis.keywords.slice(0, 8).join(', ')}\n\n`;
    draft += `---\n\n`;

    // Generate content for each section based on template
    for (const section of template.sections) {
      draft += generateSectionContent(section, template.id, papers, analysis, query);
    }

    return draft;
  };

  const generateSectionContent = (section: string, templateId: string, papers: Paper[], analysis: Analysis, query: string): string => {
    switch (section.toLowerCase()) {
      case 'abstract':
        return `## Abstract\n\n` +
               `[**PLACEHOLDER: Write a 150-250 word abstract summarizing your research**]\n\n` +
               `This study examines ${query} through a comprehensive analysis of current literature. ` +
               `Based on ${papers.length} research papers, we identify key trends, methodologies, and gaps in the field. ` +
               `[**INSERT YOUR SPECIFIC RESEARCH CONTRIBUTION HERE**] ` +
               `The findings suggest [**INSERT YOUR MAIN FINDINGS**] with implications for [**INSERT APPLICATION AREAS**].\n\n` +
               `**Keywords:** ${analysis.keywords.slice(0, 5).join(', ')}\n\n---\n\n`;

      case 'introduction':
        return `## Introduction\n\n` +
               `${analysis.outline.introduction}\n\n` +
               `### Research Problem\n\n` +
               `[**PLACEHOLDER: Clearly state your research problem and why it matters**]\n\n` +
               `### Research Questions\n\n` +
               `[**PLACEHOLDER: List 2-3 specific research questions your study addresses**]\n` +
               `1. [Research Question 1]\n` +
               `2. [Research Question 2]\n` +
               `3. [Research Question 3]\n\n` +
               `### Contribution\n\n` +
               `[**PLACEHOLDER: Describe your unique contribution to the field**]\n\n---\n\n`;

      case 'literature review':
      case 'related work':
        return `## Literature Review\n\n` +
               `${analysis.outline.literature_review}\n\n` +
               `### Current State of Research\n\n` +
               `Our analysis of ${papers.length} papers reveals several key themes:\n\n` +
               `**Key Findings from Literature:**\n` +
               papers.slice(0, 5).map((paper, index) => 
                 `${index + 1}. **${paper.title}** (${paper.authors}, ${paper.year}): ` +
                 `${paper.abstract.substring(0, 150)}... [**PLACEHOLDER: Add your analysis of how this paper relates to your work**]\n`
               ).join('\n') + `\n` +
               `### Research Gaps\n\n` +
               `${analysis.research_gaps}\n\n` +
               `[**PLACEHOLDER: Expand on specific gaps your research will address**]\n\n---\n\n`;

      case 'methodology':
      case 'methods':
        return `## Methodology\n\n` +
               `[**PLACEHOLDER: Describe your research methodology in detail**]\n\n` +
               `### Research Design\n\n` +
               `[**PLACEHOLDER: Explain your overall research approach (qualitative, quantitative, mixed methods)**]\n\n` +
               `### Data Collection\n\n` +
               `[**PLACEHOLDER: Describe how you will collect data**]\n` +
               `- Participants/Sample: [DESCRIBE]\n` +
               `- Data Sources: [DESCRIBE]\n` +
               `- Collection Methods: [DESCRIBE]\n\n` +
               `### Data Analysis\n\n` +
               `[**PLACEHOLDER: Explain your analysis methods and tools**]\n\n` +
               `### Ethical Considerations\n\n` +
               `[**PLACEHOLDER: Address ethical aspects of your research**]\n\n---\n\n`;

      case 'results':
        return `## Results\n\n` +
               `[**PLACEHOLDER: Present your research findings**]\n\n` +
               `### Key Findings\n\n` +
               `[**PLACEHOLDER: Summarize your main results**]\n` +
               `1. [Finding 1 with supporting data]\n` +
               `2. [Finding 2 with supporting data]\n` +
               `3. [Finding 3 with supporting data]\n\n` +
               `### Statistical Analysis\n\n` +
               `[**PLACEHOLDER: Include relevant tables, figures, and statistical results**]\n\n` +
               `*Table 1: [INSERT YOUR RESULTS TABLE]*\n` +
               `*Figure 1: [INSERT YOUR RESULTS VISUALIZATION]*\n\n---\n\n`;

      case 'discussion':
        return `## Discussion\n\n` +
               `### Interpretation of Results\n\n` +
               `[**PLACEHOLDER: Interpret your findings in context**]\n\n` +
               `### Comparison with Existing Literature\n\n` +
               `${analysis.comparison}\n\n` +
               `[**PLACEHOLDER: Compare your results with the literature reviewed**]\n\n` +
               `### Implications\n\n` +
               `[**PLACEHOLDER: Discuss theoretical and practical implications**]\n\n` +
               `### Limitations\n\n` +
               `[**PLACEHOLDER: Acknowledge study limitations**]\n\n---\n\n`;

      case 'conclusion':
        return `## Conclusion\n\n` +
               `${analysis.outline.conclusion}\n\n` +
               `### Summary of Contributions\n\n` +
               `[**PLACEHOLDER: Summarize your key contributions**]\n\n` +
               `### Recommendations\n\n` +
               `[**PLACEHOLDER: Provide practical recommendations based on your findings**]\n\n---\n\n`;

      case 'theoretical framework':
        return `## Theoretical Framework\n\n` +
               `[**PLACEHOLDER: Describe the theoretical foundation for your research**]\n\n` +
               `### Key Theories and Models\n\n` +
               `Based on the literature review, the following theoretical frameworks are relevant:\n\n` +
               `[**PLACEHOLDER: List and explain 2-3 key theoretical frameworks**]\n` +
               `1. [Theory/Model 1]: [Brief explanation]\n` +
               `2. [Theory/Model 2]: [Brief explanation]\n` +
               `3. [Theory/Model 3]: [Brief explanation]\n\n` +
               `### Conceptual Model\n\n` +
               `[**PLACEHOLDER: Include your conceptual model diagram and explanation**]\n\n` +
               `*Figure: Conceptual Model [INSERT YOUR DIAGRAM]*\n\n---\n\n`;

      case 'search strategy':
        return `## Search Strategy\n\n` +
               `### Search Protocol\n\n` +
               `Our systematic search was conducted across multiple academic databases to ensure comprehensive coverage.\n\n` +
               `**Databases Searched:**\n` +
               `- CrossRef (via DOI lookup)\n` +
               `- ArXiv (preprint repository)\n` +
               `- Semantic Scholar (AI-powered search)\n` +
               `- CORE (open access repository)\n` +
               `- [**PLACEHOLDER: Add additional databases you searched**]\n\n` +
               `**Search Terms:**\n` +
               `Primary keywords: ${analysis.keywords.slice(0, 5).join(', ')}\n` +
               `[**PLACEHOLDER: Add your Boolean search strings**]\n\n` +
               `**Inclusion Criteria:**\n` +
               `[**PLACEHOLDER: Define what papers you included**]\n` +
               `- Published in peer-reviewed journals\n` +
               `- Available in English\n` +
               `- Published within [DATE RANGE]\n` +
               `- [ADDITIONAL CRITERIA]\n\n` +
               `**Exclusion Criteria:**\n` +
               `[**PLACEHOLDER: Define what papers you excluded**]\n\n---\n\n`;

      case 'limitations':
        return `## Limitations\n\n` +
               `### Study Limitations\n\n` +
               `This review acknowledges several limitations that may affect the interpretation of results:\n\n` +
               `**Methodological Limitations:**\n` +
               `[**PLACEHOLDER: Describe methodological constraints**]\n` +
               `- Search limited to ${papers.length} papers from selected databases\n` +
               `- Language bias (English-language publications only)\n` +
               `- [ADDITIONAL LIMITATIONS]\n\n` +
               `**Data Limitations:**\n` +
               `[**PLACEHOLDER: Describe data-related limitations**]\n\n` +
               `**Scope Limitations:**\n` +
               `[**PLACEHOLDER: Describe scope constraints**]\n\n` +
               `Despite these limitations, the findings provide valuable insights into ${query}.\n\n---\n\n`;

      case 'approach':
        return `## Approach\n\n` +
               `### Research Approach\n\n` +
               `[**PLACEHOLDER: Describe your specific approach to solving the research problem**]\n\n` +
               `Our approach builds upon existing work in ${query}, specifically:\n\n` +
               `**Novel Contributions:**\n` +
               `[**PLACEHOLDER: List your novel contributions**]\n` +
               `1. [Contribution 1]\n` +
               `2. [Contribution 2]\n` +
               `3. [Contribution 3]\n\n` +
               `**Technical Approach:**\n` +
               `[**PLACEHOLDER: Describe your technical methodology**]\n\n` +
               `### Implementation Details\n\n` +
               `[**PLACEHOLDER: Provide implementation specifics**]\n\n---\n\n`;

      case 'evaluation':
        return `## Evaluation\n\n` +
               `### Evaluation Framework\n\n` +
               `[**PLACEHOLDER: Describe your evaluation methodology**]\n\n` +
               `**Evaluation Metrics:**\n` +
               `[**PLACEHOLDER: List evaluation metrics**]\n` +
               `- [Metric 1]: [Description]\n` +
               `- [Metric 2]: [Description]\n` +
               `- [Metric 3]: [Description]\n\n` +
               `**Baseline Comparisons:**\n` +
               `[**PLACEHOLDER: Describe baseline methods for comparison**]\n\n` +
               `**Experimental Setup:**\n` +
               `[**PLACEHOLDER: Describe experimental configuration**]\n` +
               `- Dataset: [DESCRIPTION]\n` +
               `- Hardware: [SPECIFICATIONS]\n` +
               `- Software: [TOOLS AND VERSIONS]\n\n---\n\n`;

      case 'future work':
      case 'future scope':
        return `## Future Work\n\n` +
               `${analysis.outline.future_scope}\n\n` +
               `### Recommended Research Directions\n\n` +
               `[**PLACEHOLDER: Suggest specific future research directions**]\n` +
               `1. [Future research direction 1]\n` +
               `2. [Future research direction 2]\n` +
               `3. [Future research direction 3]\n\n---\n\n`;

      case 'references':
        return `## References\n\n` +
               `### Key Papers Referenced\n\n` +
               papers.map((paper, index) => 
                 `[${index + 1}] ${paper.authors} (${paper.year}). *${paper.title}*. ${paper.venue}. ${paper.url ? `Available: ${paper.url}` : ''}\n`
               ).join('\n') + `\n\n` +
               `[**PLACEHOLDER: Add additional references from your own research**]\n\n---\n\n`;

      default:
        return `## ${section}\n\n[**PLACEHOLDER: Add content for ${section}**]\n\n---\n\n`;
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedDraft);
    toast({
      title: "Copied to Clipboard",
      description: "Paper draft has been copied to your clipboard.",
    });
  };

  const downloadDraft = () => {
    const blob = new Blob([generatedDraft], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${searchQuery.replace(/\s+/g, '_')}_draft.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Draft Downloaded",
      description: "Paper draft has been downloaded as a Markdown file.",
    });
  };

  return (
    <Card className="w-full" data-testid="paper-draft-generator">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Research Paper Draft Generator
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Student Information Form */}
          <Card className="border-dashed" data-testid="student-info-form">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Student Information (Optional)
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowStudentForm(!showStudentForm)}
                  data-testid="toggle-student-form"
                >
                  {showStudentForm ? 'Hide' : 'Show'}
                </Button>
              </CardTitle>
            </CardHeader>
            {showStudentForm && (
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="student-name">Full Name</Label>
                    <Input
                      id="student-name"
                      placeholder="Enter your full name"
                      value={studentInfo.name}
                      onChange={(e) => setStudentInfo(prev => ({ ...prev, name: e.target.value }))}
                      data-testid="input-student-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="student-affiliation">Institution/University</Label>
                    <Input
                      id="student-affiliation"
                      placeholder="Enter your institution"
                      value={studentInfo.affiliation}
                      onChange={(e) => setStudentInfo(prev => ({ ...prev, affiliation: e.target.value }))}
                      data-testid="input-student-affiliation"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="student-course">Course</Label>
                    <Input
                      id="student-course"
                      placeholder="e.g., CS 101, Advanced Data Science"
                      value={studentInfo.course}
                      onChange={(e) => setStudentInfo(prev => ({ ...prev, course: e.target.value }))}
                      data-testid="input-student-course"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="student-instructor">Instructor</Label>
                    <Input
                      id="student-instructor"
                      placeholder="Professor/Instructor name"
                      value={studentInfo.instructor}
                      onChange={(e) => setStudentInfo(prev => ({ ...prev, instructor: e.target.value }))}
                      data-testid="input-student-instructor"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="student-due-date">Due Date</Label>
                    <Input
                      id="student-due-date"
                      type="date"
                      value={studentInfo.dueDate}
                      onChange={(e) => setStudentInfo(prev => ({ ...prev, dueDate: e.target.value }))}
                      data-testid="input-student-due-date"
                    />
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Template Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Choose Paper Type</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PAPER_TEMPLATES.map((template) => (
                <Card 
                  key={template.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedTemplate === template.id ? 'border-purple-500 bg-purple-50 dark:bg-purple-950' : ''
                  }`}
                  onClick={() => setSelectedTemplate(template.id)}
                  data-testid={`template-${template.id}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      {template.icon}
                      <h4 className="font-semibold">{template.name}</h4>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                      {template.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {template.sections.slice(0, 4).map((section, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {section}
                        </Badge>
                      ))}
                      {template.sections.length > 4 && (
                        <Badge variant="outline" className="text-xs">
                          +{template.sections.length - 4} more
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <div className="flex gap-2">
            <Button 
              onClick={generateDraft} 
              disabled={isGenerating}
              className="flex-1"
              data-testid="generate-draft-button"
            >
              {isGenerating ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Edit3 className="w-4 h-4 mr-2" />
              )}
              {isGenerating ? 'Generating...' : 'Generate Draft'}
            </Button>
          </div>

          {/* Generated Draft Display */}
          {generatedDraft && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Generated Draft</h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={copyToClipboard} data-testid="copy-draft-button">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                  <Button variant="outline" size="sm" onClick={downloadDraft} data-testid="download-draft-button">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
              
              <ScrollArea className="h-96 w-full border rounded-md p-4">
                <pre className="whitespace-pre-wrap text-sm font-mono" data-testid="generated-draft-content">
                  {generatedDraft}
                </pre>
              </ScrollArea>
              
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                <span>📄 {generatedDraft.split('\n').length} lines</span>
                <span>📚 {papers.length} papers referenced</span>
                <span>🏷️ {analysis.keywords.length} keywords included</span>
              </div>
            </div>
          )}

          {/* Usage Instructions */}
          {!generatedDraft && (
            <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
              <CardContent className="p-4">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  How to Use the Draft Generator
                </h4>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• Select the type of paper you want to write</li>
                  <li>• Click "Generate Draft" to create a structured template</li>
                  <li>• Replace placeholders with your own research data</li>
                  <li>• Use the generated structure as a starting point</li>
                  <li>• Download or copy the draft to your preferred editor</li>
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PaperDraftGenerator;