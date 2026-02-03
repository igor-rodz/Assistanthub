-- Tabela para histórico detalhado de análises (Prompts + Resultados)
CREATE TABLE IF NOT EXISTS public.analysis_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    prompt_content TEXT,        -- O log de erro ou texto enviado
    full_log TEXT,              -- Caso queira armazenar algo mais bruto
    analysis_result JSONB,      -- O JSON retornado pela IA
    metadata JSONB,             -- Tokens, modelo usado, tempo de execução
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_analysis_history_user_id ON public.analysis_history(user_id);
CREATE INDEX IF NOT EXISTS idx_analysis_history_created_at ON public.analysis_history(created_at DESC);

-- Habilitar RLS (Segurança)
ALTER TABLE public.analysis_history ENABLE ROW LEVEL SECURITY;

-- Política: Usuário só pode ver seus próprios registros
CREATE POLICY "Users can view own history" 
ON public.analysis_history 
FOR SELECT 
USING (auth.uid() = user_id);

-- Política: Usuário (ou Service Role) pode inserir registros
CREATE POLICY "Users can insert own history" 
ON public.analysis_history 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Comentários
COMMENT ON TABLE public.analysis_history IS 'Armazena histórico detalhado de análises de erro com prompts para auditoria.';
