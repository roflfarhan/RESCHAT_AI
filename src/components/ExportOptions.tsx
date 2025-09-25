import React from 'react';
import { Download, FileText, File, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface ExportOptionsProps {
  data: {
    summary: string;
    outline: string;
    citations: string;
    keywords: string[];
    gaps: string;
  };
}

const ExportOptions: React.FC<ExportOptionsProps> = ({ data }) => {
  const { toast } = useToast();

  const exportToPDF = () => {
    // Mock PDF export
    const content = `
Research Summary:
${data.summary}

Outline:
${data.outline}

Citations:
${data.citations}

Keywords: ${data.keywords.join(', ')}

Research Gaps:
${data.gaps}
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'research-analysis.txt';
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Export successful",
      description: "Research analysis exported as text file.",
    });
  };

  const exportToDOCX = () => {
    // Mock DOCX export
    const content = `
<!DOCTYPE html>
<html>
<head><title>Research Analysis</title></head>
<body>
<h1>Research Summary</h1>
<p>${data.summary}</p>

<h1>Outline</h1>
<pre>${data.outline}</pre>

<h1>Citations</h1>
<pre>${data.citations}</pre>

<h1>Keywords</h1>
<p>${data.keywords.join(', ')}</p>

<h1>Research Gaps</h1>
<p>${data.gaps}</p>
</body>
</html>
    `;

    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'research-analysis.html';
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Export successful",
      description: "Research analysis exported as HTML file.",
    });
  };

  const exportToBibTeX = () => {
    // Mock BibTeX export
    const bibtex = `
@article{sample2024,
  title={Sample Research Paper},
  author={Author, Sample},
  journal={Journal Name},
  year={2024},
  publisher={Publisher}
}

% Keywords: ${data.keywords.join(', ')}
% Research Gaps: ${data.gaps}
    `;

    const blob = new Blob([bibtex], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'references.bib';
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Export successful",
      description: "Citations exported as BibTeX file.",
    });
  };

  return (
    <Card className="shadow-glow border-0 bg-gradient-card animate-scale-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export Options
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          onClick={exportToPDF}
          variant="outline"
          className="w-full justify-start transition-all duration-300 hover:scale-105"
        >
          <FileText className="h-4 w-4 mr-3" />
          Export as PDF
          <span className="text-xs text-muted-foreground ml-auto">Complete analysis</span>
        </Button>
        
        <Button
          onClick={exportToDOCX}
          variant="outline"
          className="w-full justify-start transition-all duration-300 hover:scale-105"
        >
          <File className="h-4 w-4 mr-3" />
          Export as DOCX
          <span className="text-xs text-muted-foreground ml-auto">Editable format</span>
        </Button>
        
        <Button
          onClick={exportToBibTeX}
          variant="outline"
          className="w-full justify-start transition-all duration-300 hover:scale-105"
        >
          <Code className="h-4 w-4 mr-3" />
          Export as BibTeX
          <span className="text-xs text-muted-foreground ml-auto">Citations only</span>
        </Button>
      </CardContent>
    </Card>
  );
};

export default ExportOptions;