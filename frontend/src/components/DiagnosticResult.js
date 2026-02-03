import { useState } from 'react';
import {
  Bookmark,
  Plus,
  Copy,
  Check,
  ArrowRight,
  GraduationCap,
  Pencil,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Zap,
  Clock,
  Cpu,
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Terminal
} from 'lucide-react';

// Diagnostic Result Screen - Tech/HUD Style Redesign
const DiagnosticResult = ({ analysisResult, onNewAnalysis, onBack }) => {
  const [copied, setCopied] = useState(false);
  const [promptExpanded, setPromptExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('cause'); // 'cause' or 'solution'

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

  const getSeverityConfig = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'alta':
        return { bg: 'bg-red-500/20', border: 'border-red-500/30', text: 'text-red-400', dot: 'bg-red-400' };
      case 'média':
        return { bg: 'bg-amber-500/20', border: 'border-amber-500/30', text: 'text-amber-400', dot: 'bg-amber-400' };
      case 'baixa':
        return { bg: 'bg-emerald-500/20', border: 'border-emerald-500/30', text: 'text-emerald-400', dot: 'bg-emerald-400' };
      default:
        return { bg: 'bg-amber-500/20', border: 'border-amber-500/30', text: 'text-amber-400', dot: 'bg-amber-400' };
    }
  };

  const severityConfig = getSeverityConfig(diagnosticData.severity);
  const promptLines = diagnosticData.prompt.split('\n');
  const visibleLines = promptExpanded ? promptLines : promptLines.slice(0, 6);

  const handleSave = () => {
    alert("Análise salva no histórico com sucesso!");
  };

  const formatText = (text) => {
    return text.split('`').map((part, i) =>
      i % 2 === 1
        ? <code key={i} className="text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded font-mono text-xs">{part}</code>
        : <span key={i}>{part}</span>
    );
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-x-hidden">
      {/* Subtle grid background */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(0,255,255,0.1) 1px, transparent 1px), 
                           linear-gradient(90deg, rgba(0,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/5">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-2 text-white/60 hover:text-white hover:bg-white/5 rounded transition-all duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Voltar</span>
        </button>

        {/* Terminal-style log info */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#0d1117] border border-white/10 rounded font-mono text-xs">
          <Terminal className="w-3 h-3 text-cyan-400" />
          <span className="text-white/40">ID:</span>
          <span className="text-cyan-400">{diagnosticData.logId}</span>
          <span className="text-white/20">•</span>
          <span className="text-white/40">{diagnosticData.timestamp}</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 px-6 py-6 max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="mb-8">
          {/* Status Badge with pulse */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            <span className="text-emerald-400 text-sm font-medium tracking-wide">DIAGNÓSTICO CONCLUÍDO</span>
          </div>

          <h1 className="text-3xl font-bold text-white mb-2">
            Resultado do Diagnóstico
          </h1>
          <p className="text-white/50 text-sm max-w-xl">
            Analisamos o log e geramos um prompt otimizado para correção imediata.
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

          {/* Left Column - Prompt Card */}
          <div className="xl:col-span-7">
            <div className="bg-[#0d1117] border border-cyan-500/10 rounded overflow-hidden shadow-[0_0_30px_rgba(0,255,255,0.03)]">
              {/* Card Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-[#161b22]/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded flex items-center justify-center">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-sm">O Prompt Perfeito</h3>
                    <p className="text-white/40 text-xs">Pronto para copiar e colar</p>
                  </div>
                </div>
                <button
                  onClick={handleCopyPrompt}
                  className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-medium transition-all duration-200 ${copied
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20'
                    }`}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copiado!' : 'Copiar'}
                </button>
              </div>

              {/* Code Block */}
              <div className="bg-[#0a0d12] p-4 font-mono text-xs overflow-hidden">
                <div className={`transition-all duration-300 ${promptExpanded ? '' : 'max-h-[180px]'} overflow-hidden`}>
                  {visibleLines.map((line, idx) => (
                    <div key={idx} className="flex hover:bg-white/[0.02] rounded px-1 -mx-1">
                      <span className="text-white/20 w-8 flex-shrink-0 select-none text-right pr-3">{idx + 1}</span>
                      <span className={
                        line.startsWith('#')
                          ? 'text-emerald-400/80'
                          : line.includes('`')
                            ? 'text-white/80'
                            : 'text-white/60'
                      }>
                        {line.split('`').map((part, i) =>
                          i % 2 === 1
                            ? <code key={i} className="text-cyan-400 bg-cyan-500/10 px-1 rounded">{part}</code>
                            : <span key={i}>{part}</span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>

                {promptLines.length > 6 && (
                  <button
                    onClick={() => setPromptExpanded(!promptExpanded)}
                    className="flex items-center gap-2 mt-3 px-3 py-1.5 text-cyan-400 hover:text-cyan-300 text-xs transition-colors"
                  >
                    {promptExpanded ? (
                      <>
                        <ChevronUp className="w-3 h-3" />
                        Recolher
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-3 h-3" />
                        Ver mais ({promptLines.length - 6} linhas)
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Stacked Cards */}
          <div className="xl:col-span-5 space-y-4">

            {/* Quick Analysis Card */}
            <div className="bg-[#0d1117] border border-white/5 rounded p-4">
              <h3 className="text-white/60 text-xs font-medium tracking-wider mb-4 flex items-center gap-2">
                <FileText className="w-3 h-3" />
                MÉTRICAS DA ANÁLISE
              </h3>

              <div className="grid grid-cols-2 gap-4">
                {/* Framework */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-white/5 rounded flex items-center justify-center flex-shrink-0">
                    <Cpu className="w-4 h-4 text-white/40" />
                  </div>
                  <div>
                    <p className="text-white/40 text-xs mb-0.5">Framework</p>
                    <p className="text-white text-sm font-medium">{diagnosticData.framework}</p>
                  </div>
                </div>

                {/* Severity */}
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 ${severityConfig.bg} ${severityConfig.border} border rounded flex items-center justify-center flex-shrink-0`}>
                    <AlertTriangle className={`w-4 h-4 ${severityConfig.text}`} />
                  </div>
                  <div>
                    <p className="text-white/40 text-xs mb-0.5">Gravidade</p>
                    <p className={`text-sm font-medium ${severityConfig.text}`}>{diagnosticData.severity}</p>
                  </div>
                </div>

                {/* Tokens */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-white/5 rounded flex items-center justify-center flex-shrink-0">
                    <Zap className="w-4 h-4 text-white/40" />
                  </div>
                  <div>
                    <p className="text-white/40 text-xs mb-0.5">Tokens</p>
                    <p className="text-white text-sm font-medium">
                      {diagnosticData.tokensTotal}
                      <span className="text-white/30 text-xs ml-1">({diagnosticData.tokensInput}↓ {diagnosticData.tokensOutput}↑)</span>
                    </p>
                  </div>
                </div>

                {/* Credits */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-cyan-500/10 border border-cyan-500/20 rounded flex items-center justify-center flex-shrink-0">
                    <CreditCard className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-white/40 text-xs mb-0.5">Créditos</p>
                    <p className="text-cyan-400 text-sm font-semibold">-{diagnosticData.creditsUsed?.toFixed(2)}</p>
                  </div>
                </div>

                {/* Time */}
                <div className="flex items-start gap-3 col-span-2">
                  <div className="w-8 h-8 bg-white/5 rounded flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 text-white/40" />
                  </div>
                  <div>
                    <p className="text-white/40 text-xs mb-0.5">Tempo de Processamento</p>
                    <p className="text-white text-sm font-medium">{diagnosticData.processingTime}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Insight Educativo Card */}
            <div className="bg-[#0d1117] border border-white/5 rounded overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-[#161b22]/30">
                <div className="w-7 h-7 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded flex items-center justify-center">
                  <GraduationCap className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-white font-semibold text-sm">Insight Educativo</h3>
              </div>

              {/* Tab Navigation */}
              <div className="flex border-b border-white/5">
                <button
                  onClick={() => setActiveTab('cause')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium transition-all ${activeTab === 'cause'
                    ? 'text-red-400 border-b-2 border-red-400 bg-red-500/5'
                    : 'text-white/40 hover:text-white/60 hover:bg-white/[0.02]'
                    }`}
                >
                  <AlertTriangle className="w-3 h-3" />
                  CAUSA RAIZ
                </button>
                <button
                  onClick={() => setActiveTab('solution')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium transition-all ${activeTab === 'solution'
                    ? 'text-emerald-400 border-b-2 border-emerald-400 bg-emerald-500/5'
                    : 'text-white/40 hover:text-white/60 hover:bg-white/[0.02]'
                    }`}
                >
                  <CheckCircle2 className="w-3 h-3" />
                  SOLUÇÃO
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-4">
                {activeTab === 'cause' ? (
                  <div className="space-y-3">
                    <h4 className="text-white font-bold text-base">{diagnosticData.rootCause}</h4>
                    <p className="text-white/60 text-sm leading-relaxed">
                      {formatText(diagnosticData.rootCauseDescription)}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-white/60 text-sm leading-relaxed">
                      {formatText(diagnosticData.solution)}
                    </p>
                  </div>
                )}

                <button className="flex items-center gap-2 w-full justify-center mt-4 py-2.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-medium rounded transition-all">
                  <FileText className="w-3 h-3" />
                  Ver Documentação Completa
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Action Buttons - Sticky at bottom on mobile */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSave}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-white/10 text-white/70 hover:text-white hover:bg-white/5 hover:border-white/20 rounded transition-all text-sm font-medium"
              >
                <Bookmark className="w-4 h-4" />
                Salvar
              </button>
              <button
                onClick={onNewAnalysis}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-medium rounded transition-all text-sm shadow-lg shadow-cyan-500/20"
              >
                <Plus className="w-4 h-4" />
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
