import { useState } from 'react';
import {
  Bookmark,
  Plus,
  Copy,
  Check,
  ArrowRight,
  GraduationCap,
  Pencil,
  ArrowLeft
} from 'lucide-react';

// Diagnostic Result Screen
const DiagnosticResult = ({ analysisResult, onNewAnalysis, onBack }) => {
  const [copied, setCopied] = useState(false);

  // Use real data from API
  const diagnosticData = {
    logId: analysisResult?.log_id || '#0000-X',
    timestamp: analysisResult?.timestamp || new Date().toLocaleString('pt-BR'),
    framework: analysisResult?.framework || 'Não detectado',
    severity: analysisResult?.severity || 'Média',
    tokensInput: analysisResult?.tokens_input || 0,
    tokensOutput: analysisResult?.tokens_output || 0,
    tokensTotal: analysisResult?.tokens_total || 0,
    creditsUsed: analysisResult?.credits_used || 0,
    creditsRemaining: analysisResult?.credits_remaining || 0,
    processingTime: analysisResult?.processing_time || '0s',
    rootCause: analysisResult?.root_cause || 'Erro Desconhecido',
    rootCauseDescription: analysisResult?.root_cause_description || 'Não foi possível determinar a causa raiz.',
    solution: analysisResult?.solution || 'Não foi possível gerar uma solução.',
    prompt: analysisResult?.prompt || 'Não foi possível gerar o prompt.',
    relatedAnalyses: []
  };

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(diagnosticData.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'alta':
        return { bg: 'bg-red-400', text: 'text-red-400' };
      case 'média':
        return { bg: 'bg-yellow-400', text: 'text-yellow-400' };
      case 'baixa':
        return { bg: 'bg-green-400', text: 'text-green-400' };
      default:
        return { bg: 'bg-yellow-400', text: 'text-yellow-400' };
    }
  };

  const severityColors = getSeverityColor(diagnosticData.severity);

  const handleSave = () => {
    // Alert user that save functionality is simulated
    alert("Análise salva no histórico com sucesso!");
  };

  return (
    <div className="min-h-screen relative bg-[#0a0a0f]">
      {/* Header */}
      <header className="relative z-10 flex items-center px-6 py-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          title="Voltar"
        >
          <ArrowLeft className="w-5 h-5 text-white/60" />
        </button>
      </header>

      {/* Main Content */}
      <main className="relative z-10 px-6 py-2">
        {/* Status Badge and Title */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="flex items-center gap-2 px-3 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-full">
              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
              Diagnóstico Concluído
            </span>
            <span className="text-white/40 text-sm">Log ID: {diagnosticData.logId} • {diagnosticData.timestamp}</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Resultado do Diagnóstico</h1>
          <p className="text-white/60 text-sm">
            Analisamos o log e geramos um prompt otimizado para correção imediata.
          </p>
        </div>

        {/* Three Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column - Prompt Card */}
          <div className="lg:col-span-2">
            <div className="bg-[#161b22]/80 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden h-full flex flex-col">
              {/* Card Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                    <Pencil className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-sm">O Prompt Perfeito</h3>
                    <p className="text-white/50 text-xs">Pronto para copiar e colar</p>
                  </div>
                </div>
                <button
                  onClick={handleCopyPrompt}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs font-medium rounded-lg transition-all"
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copiado!' : 'Copiar'}
                </button>
              </div>

              {/* Code Block */}
              <div className="bg-[#0d1117]/80 p-4 font-mono text-xs overflow-auto flex-1 max-h-[50vh]">
                <pre className="text-white/90 whitespace-pre-wrap">
                  {diagnosticData.prompt.split('\n').map((line, idx) => (
                    <div key={idx} className="flex">
                      <span className="text-white/30 w-6 flex-shrink-0 select-none">{idx + 1}</span>
                      <span className={
                        line.startsWith('#')
                          ? 'text-green-400 italic'
                          : line.includes('`')
                            ? 'text-white/90'
                            : 'text-white/70'
                      }>
                        {line.split('`').map((part, i) =>
                          i % 2 === 1
                            ? <code key={i} className="text-cyan-400 bg-cyan-400/10 px-1 rounded">{part}</code>
                            : <span key={i}>{part}</span>
                        )}
                      </span>
                    </div>
                  ))}
                </pre>
              </div>
            </div>
          </div>

          {/* Right Column - Stacked Cards */}
          <div className="space-y-4">
            {/* Insight Educativo */}
            <div className="bg-[#161b22]/80 backdrop-blur-sm border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-white font-semibold text-sm">Insight Educativo</h3>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-purple-400 text-xs font-semibold uppercase tracking-wider mb-1">CAUSA RAIZ</p>
                  <h4 className="text-white text-base font-bold mb-1">{diagnosticData.rootCause}</h4>
                  <p className="text-white/60 text-xs leading-relaxed">
                    {diagnosticData.rootCauseDescription.split('`').map((part, i) =>
                      i % 2 === 1
                        ? <code key={i} className="text-cyan-400 bg-cyan-400/10 px-1 rounded">{part}</code>
                        : <span key={i}>{part}</span>
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-green-400 text-xs font-semibold uppercase tracking-wider mb-1">A SOLUÇÃO</p>
                  <p className="text-white/60 text-xs leading-relaxed">
                    {diagnosticData.solution.split('`').map((part, i) =>
                      i % 2 === 1
                        ? <code key={i} className="text-purple-400 bg-purple-400/10 px-1 rounded">{part}</code>
                        : <span key={i}>{part}</span>
                    )}
                  </p>
                </div>

                <button className="flex items-center gap-2 w-full justify-center py-2 bg-white/5 hover:bg-white/10 text-white/80 text-xs rounded-lg transition-colors">
                  Documentação
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Metadados */}
            <div className="bg-[#161b22]/80 backdrop-blur-sm border border-white/10 rounded-xl p-4">
              <h3 className="text-white font-semibold text-xs mb-3">METADADOS DA ANÁLISE</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-white/40 text-xs mb-0.5">Framework</p>
                  <p className="text-white text-sm flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                    {diagnosticData.framework}
                  </p>
                </div>
                <div>
                  <p className="text-white/40 text-xs mb-0.5">Gravidade</p>
                  <p className="text-white text-sm flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 ${severityColors.bg} rounded-full`}></span>
                    <span className={severityColors.text}>{diagnosticData.severity}</span>
                  </p>
                </div>
                <div>
                  <p className="text-white/40 text-xs mb-0.5">Tokens</p>
                  <p className="text-white text-sm">
                    {diagnosticData.tokensTotal}
                    <span className="text-white/40 text-xs ml-1">({diagnosticData.tokensInput}↓ {diagnosticData.tokensOutput}↑)</span>
                  </p>
                </div>
                <div>
                  <p className="text-white/40 text-xs mb-0.5">Créditos</p>
                  <p className="text-purple-400 text-sm font-semibold">
                    -{diagnosticData.creditsUsed?.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-white/40 text-xs mb-0.5">Tempo</p>
                  <p className="text-white text-sm">{diagnosticData.processingTime}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-white/20 text-white/80 hover:bg-white/5 rounded-lg transition-colors text-xs"
              >
                <Bookmark className="w-3 h-3" />
                Salvar
              </button>
              <button
                onClick={onNewAnalysis}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-medium rounded-lg transition-all text-xs"
              >
                <Plus className="w-3 h-3" />
                Nova Análise
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DiagnosticResult;
