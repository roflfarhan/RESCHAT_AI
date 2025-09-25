-- Create queries table
CREATE TABLE public.queries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    query_text TEXT NOT NULL,
    query_type VARCHAR(50) DEFAULT 'text', -- text / voice / file
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create uploaded files table
CREATE TABLE public.uploaded_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    query_id UUID REFERENCES public.queries(id) ON DELETE CASCADE,
    file_name VARCHAR(255),
    file_url TEXT,
    file_type VARCHAR(50), -- pdf / image
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create research results table
CREATE TABLE public.research_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query_id UUID REFERENCES public.queries(id) ON DELETE CASCADE,
    title TEXT,
    authors TEXT,
    abstract TEXT,
    year INT,
    venue TEXT,
    url TEXT,
    source VARCHAR(50), -- crossref / arxiv / semanticscholar
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create summaries table
CREATE TABLE public.summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    research_result_id UUID REFERENCES public.research_results(id) ON DELETE CASCADE,
    summary TEXT,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create outlines table
CREATE TABLE public.outlines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    research_result_id UUID REFERENCES public.research_results(id) ON DELETE CASCADE,
    introduction TEXT,
    literature_review TEXT,
    methodology TEXT,
    results TEXT,
    conclusion TEXT,
    future_scope TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create exports table
CREATE TABLE public.exports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    research_result_id UUID REFERENCES public.research_results(id) ON DELETE CASCADE,
    export_type VARCHAR(20), -- pdf / docx / bibtex
    file_url TEXT,
    exported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create collaborations table
CREATE TABLE public.collaborations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    research_result_id UUID REFERENCES public.research_results(id) ON DELETE CASCADE,
    shared_with_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    permission VARCHAR(20) DEFAULT 'view', -- view / edit
    shared_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trending keywords table
CREATE TABLE public.trending_keywords (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query_id UUID REFERENCES public.queries(id) ON DELETE CASCADE,
    keyword VARCHAR(100),
    frequency INT DEFAULT 1,
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create translations table
CREATE TABLE public.translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    research_result_id UUID REFERENCES public.research_results(id) ON DELETE CASCADE,
    language VARCHAR(50),
    translated_text TEXT,
    translated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create code & math extractions table
CREATE TABLE public.code_math_extractions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    research_result_id UUID REFERENCES public.research_results(id) ON DELETE CASCADE,
    extraction_type VARCHAR(50), -- pseudocode / python / latex
    content TEXT,
    extracted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workflow tasks table
CREATE TABLE public.workflow_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    task_name VARCHAR(100),
    task_order INT, -- e.g., 1=Search, 2=Summarize, etc.
    status VARCHAR(20) DEFAULT 'pending', -- pending / in_progress / completed
    associated_query_id UUID REFERENCES public.queries(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uploaded_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaborations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trending_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.code_math_extractions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_tasks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for queries table
CREATE POLICY "Users can view their own queries" ON public.queries
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own queries" ON public.queries
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own queries" ON public.queries
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own queries" ON public.queries
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for uploaded_files table
CREATE POLICY "Users can view their own uploaded files" ON public.uploaded_files
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own uploaded files" ON public.uploaded_files
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own uploaded files" ON public.uploaded_files
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for research_results table (viewable by query owner)
CREATE POLICY "Users can view research results from their queries" ON public.research_results
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.queries 
            WHERE queries.id = research_results.query_id 
            AND queries.user_id = auth.uid()
        )
    );
CREATE POLICY "Research results can be created" ON public.research_results
    FOR INSERT WITH CHECK (true);

-- Create RLS policies for summaries table
CREATE POLICY "Users can view summaries from their research" ON public.summaries
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.research_results r
            JOIN public.queries q ON r.query_id = q.id
            WHERE r.id = summaries.research_result_id 
            AND q.user_id = auth.uid()
        )
    );
CREATE POLICY "Summaries can be created" ON public.summaries
    FOR INSERT WITH CHECK (true);

-- Create RLS policies for outlines table
CREATE POLICY "Users can view outlines from their research" ON public.outlines
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.research_results r
            JOIN public.queries q ON r.query_id = q.id
            WHERE r.id = outlines.research_result_id 
            AND q.user_id = auth.uid()
        )
    );
CREATE POLICY "Outlines can be created" ON public.outlines
    FOR INSERT WITH CHECK (true);

-- Create RLS policies for exports table
CREATE POLICY "Users can view their own exports" ON public.exports
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own exports" ON public.exports
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for collaborations table
CREATE POLICY "Users can view collaborations they're part of" ON public.collaborations
    FOR SELECT USING (
        auth.uid() = shared_with_user_id OR
        EXISTS (
            SELECT 1 FROM public.research_results r
            JOIN public.queries q ON r.query_id = q.id
            WHERE r.id = collaborations.research_result_id 
            AND q.user_id = auth.uid()
        )
    );
CREATE POLICY "Users can create collaborations for their research" ON public.collaborations
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.research_results r
            JOIN public.queries q ON r.query_id = q.id
            WHERE r.id = research_result_id 
            AND q.user_id = auth.uid()
        )
    );

-- Create RLS policies for trending_keywords table
CREATE POLICY "Users can view keywords from their queries" ON public.trending_keywords
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.queries 
            WHERE queries.id = trending_keywords.query_id 
            AND queries.user_id = auth.uid()
        )
    );
CREATE POLICY "Keywords can be created" ON public.trending_keywords
    FOR INSERT WITH CHECK (true);

-- Create RLS policies for translations table
CREATE POLICY "Users can view translations from their research" ON public.translations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.research_results r
            JOIN public.queries q ON r.query_id = q.id
            WHERE r.id = translations.research_result_id 
            AND q.user_id = auth.uid()
        )
    );
CREATE POLICY "Translations can be created" ON public.translations
    FOR INSERT WITH CHECK (true);

-- Create RLS policies for code_math_extractions table
CREATE POLICY "Users can view extractions from their research" ON public.code_math_extractions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.research_results r
            JOIN public.queries q ON r.query_id = q.id
            WHERE r.id = code_math_extractions.research_result_id 
            AND q.user_id = auth.uid()
        )
    );
CREATE POLICY "Extractions can be created" ON public.code_math_extractions
    FOR INSERT WITH CHECK (true);

-- Create RLS policies for workflow_tasks table
CREATE POLICY "Users can view their own workflow tasks" ON public.workflow_tasks
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own workflow tasks" ON public.workflow_tasks
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own workflow tasks" ON public.workflow_tasks
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own workflow tasks" ON public.workflow_tasks
    FOR DELETE USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for workflow_tasks updated_at
CREATE TRIGGER update_workflow_tasks_updated_at
    BEFORE UPDATE ON public.workflow_tasks
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();