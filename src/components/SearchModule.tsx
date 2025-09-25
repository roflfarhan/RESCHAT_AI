import React, { useState, useRef } from 'react';
import { Search, Upload, Mic, FileText, Image, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface SearchModuleProps {
  onSearch: (query: string, files?: FileList) => void;
  isLoading?: boolean;
}

const SearchModule: React.FC<SearchModuleProps> = ({ onSearch, isLoading = false }) => {
  const [query, setQuery] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleSearch = () => {
    if (!query.trim()) {
      toast({
        title: "Search Required",
        description: "Please enter a research query.",
        variant: "destructive"
      });
      return;
    }
    onSearch(query.trim());
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const validFiles = Array.from(files).filter(file => {
      const isValidType = file.type === 'application/pdf' || file.type.startsWith('image/');
      if (!isValidType) {
        toast({
          title: "Invalid File Type",
          description: "Please upload PDF documents or images only.",
          variant: "destructive"
        });
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      const fileList = new DataTransfer();
      validFiles.forEach(file => fileList.items.add(file));
      onSearch(query || "Analyze uploaded files", fileList.files);
    }
  };

  const handleVoiceSearch = async () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        title: "Voice Search Unavailable",
        description: "Your browser doesn't support voice recognition.",
        variant: "destructive"
      });
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsRecording(true);
      toast({
        title: "Listening...",
        description: "Speak your research query now.",
      });
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      setIsRecording(false);
      toast({
        title: "Voice Captured",
        description: `Detected: "${transcript}"`,
      });
    };

    recognition.onerror = () => {
      setIsRecording(false);
      toast({
        title: "Voice Recognition Error",
        description: "Please try again or use text input.",
        variant: "destructive"
      });
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFileUpload(e.dataTransfer.files);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6">
      <div className="w-full max-w-4xl">
        {/* Logo */}
        <div className="text-center mb-12">
          <a href="https://ibb.co/MDw02n8x" className="inline-block">
            <img 
              src="https://i.ibb.co/kgbCHK3s/unnamed-2.png" 
              alt="AI Research Assistant" 
              className="h-16 w-auto mx-auto mb-6 animate-float"
            />
          </a>
          <h1 className="text-5xl font-bold font-poppins bg-gradient-primary bg-clip-text text-transparent mb-4">
            AI Research Assistant
          </h1>
          <p className="text-xl text-muted-foreground font-inter">
            Discover, analyze, and synthesize academic research with advanced AI
          </p>
        </div>

        {/* Search Module */}
        <div className="glass-card glow-border rounded-2xl p-8 mb-8">
          <div className="space-y-6">
            {/* Text Input */}
            <div className="relative">
              <Input
                type="text"
                placeholder="Enter your research query (e.g., 'Machine Learning in Healthcare')"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="h-14 text-lg pl-14 pr-4 glass border-0 focus:ring-2 focus:ring-primary rounded-xl"
                disabled={isLoading}
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-muted-foreground" />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 justify-center">
              <Button
                onClick={handleSearch}
                disabled={isLoading || !query.trim()}
                className="glass-button px-8 py-3 text-lg font-semibold rounded-xl"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-5 w-5" />
                    Search Research
                  </>
                )}
              </Button>

              <Button
                onClick={handleVoiceSearch}
                disabled={isLoading || isRecording}
                variant="outline"
                className="glass-button px-6 py-3 rounded-xl"
              >
                <Mic className={`mr-2 h-5 w-5 ${isRecording ? 'animate-pulse text-red-500' : ''}`} />
                {isRecording ? 'Listening...' : 'Voice Search'}
              </Button>

              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                variant="outline"
                className="glass-button px-6 py-3 rounded-xl"
              >
                <Upload className="mr-2 h-5 w-5" />
                Upload Files
              </Button>
            </div>

            {/* File Drop Zone */}
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                dragActive 
                  ? 'border-primary bg-primary/10 shadow-glow' 
                  : 'border-muted-foreground/30 hover:border-primary/50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center space-y-3">
                <div className="flex space-x-2">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                  <Image className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-lg font-medium">
                  {dragActive ? 'Drop files here' : 'Drag & drop PDFs or images'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Or click the Upload Files button above
                </p>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,image/*"
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
            />
          </div>
        </div>

        {/* Quick Examples */}
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Try these example queries:</p>
          <div className="flex flex-wrap gap-3 justify-center">
            {[
              "Quantum Computing Applications",
              "Climate Change Machine Learning",
              "CRISPR Gene Editing Ethics",
              "Renewable Energy Storage"
            ].map((example) => (
              <button
                key={example}
                onClick={() => setQuery(example)}
                disabled={isLoading}
                className="glass px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchModule;