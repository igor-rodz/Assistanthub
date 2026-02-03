import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { RefreshCw, History, ArrowUpRight, X, FileText, Code, CheckCircle, AlertCircle, Coins } from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';

const CreditsView = ({ credits, usageHistory }) => {
    const creditBalance = credits?.credit_balance || 0;
    const monthlyLimit = credits?.monthly_limit || 700;
    const creditsUsed = credits?.credits_used || 0;
    const availableCredits = creditBalance;
    // Fix division by zero
    const usedPercent = monthlyLimit > 0 ? Math.round((creditsUsed / monthlyLimit) * 100) : 0;

    const [selectedLog, setSelectedLog] = useState(null);

    const data = [
        { name: 'Usado', value: creditsUsed },
        { name: 'Disponível', value: Math.max(0, availableCredits) }, // Ensure non-negative
    ];

    const COLORS = ['#3b82f6', '#a855f7'];

    return (
        <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Uso de Créditos</h1>
                    <p className="text-zinc-400">Monitore seu consumo e histórico de atividades.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg font-semibold hover:bg-zinc-200 transition-colors">
                    <Coins size={16} />
                    <span>Adicionar Créditos</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Chart & Balance (40%) */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="p-6 rounded-2xl border border-white/5 bg-zinc-900/50 backdrop-blur-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-50">
                            <RefreshCw size={20} className="text-white/20" />
                        </div>

                        <div className="flex flex-col items-center justify-center py-8">
                            <div className="w-56 h-56 relative mb-6">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={data}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={75}
                                            outerRadius={90}
                                            paddingAngle={4}
                                            dataKey="value"
                                            startAngle={90}
                                            endAngle={450}
                                            stroke="none"
                                            cornerRadius={4}
                                        >
                                            {data.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-4xl font-bold text-white tracking-tighter">{Math.round(availableCredits * 100) / 100}</span>
                                    <span className="text-xs text-zinc-500 uppercase tracking-widest font-medium mt-1">Disponíveis</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8 w-full px-8">
                                <div className="text-center">
                                    <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Usado Mês</p>
                                    <p className="text-xl font-bold text-blue-400">{Math.round(creditsUsed * 100) / 100}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Limite Plano</p>
                                    <p className="text-xl font-bold text-purple-400">{monthlyLimit}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Breakdown & History (60%) */}
                <div className="lg:col-span-7 space-y-6">
                    {/* Breakdown List */}
                    <div className="p-6 rounded-2xl border border-white/5 bg-zinc-900/30">
                        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-6">Detalhamento</h3>
                        <div className="space-y-4">
                            <CreditRow
                                label="Créditos da Assinatura"
                                value={availableCredits}
                                total={monthlyLimit}
                                color="purple"
                                details="Renova Mensalmente"
                            />
                            <CreditRow
                                label="Créditos Adicionais"
                                value={0}
                                total={0}
                                color="blue"
                                details="Sem expiração"
                            />
                        </div>
                    </div>

                    {/* Quick History Preview */}
                    <div className="p-6 rounded-2xl border border-white/5 bg-zinc-900/30">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest">Histórico Detalhado</h3>
                            <div className="text-xs text-purple-400 flex items-center gap-1 font-medium">
                                Últimas 50 atividades
                            </div>
                        </div>

                        {usageHistory && usageHistory.length > 0 ? (
                            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {usageHistory.map((item, i) => (
                                    <div
                                        key={item.id || i}
                                        onClick={() => setSelectedLog(item)}
                                        className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-purple-500/20 cursor-pointer group"
                                    >
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-purple-400 transition-colors shrink-0">
                                                <History size={14} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-zinc-200 truncate">{item.action || 'Análise'}</p>
                                                <p className="text-xs text-zinc-500 truncate max-w-[200px] md:max-w-[300px]">
                                                    {item.full_prompt ? item.full_prompt.substring(0, 60) + '...' : item.summary}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end shrink-0 pl-4">
                                            <span className="text-sm font-mono text-zinc-400 font-bold group-hover:text-white transition-colors">
                                                -{item.cost || 0} cr
                                            </span>
                                            <span className="text-[10px] text-zinc-600">{item.date}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-zinc-600 text-sm">Nenhuma atividade recente</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Detail Modal */}
            <AnimatePresence>
                {selectedLog && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedLog(null)}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-[#0f0f12] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl shadow-purple-900/20"
                        >
                            <div className="flex items-center justify-between p-6 border-b border-white/5 bg-zinc-900/50">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
                                        <CheckCircle size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Detalhes da Transação</h3>
                                        <p className="text-sm text-zinc-400">{selectedLog.date} • Custo: {selectedLog.cost} créditos</p>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedLog(null)} className="p-2 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
                                {/* Prompt Section */}
                                <div>
                                    <h4 className="flex items-center gap-2 text-sm font-semibold text-zinc-300 mb-3">
                                        <FileText size={16} className="text-blue-400" />
                                        Prompt Enviado (Log de Erro)
                                    </h4>
                                    <div className="bg-zinc-950 rounded-lg p-4 border border-white/5 font-mono text-sm text-zinc-300 whitespace-pre-wrap break-words max-h-[300px] overflow-y-auto custom-scrollbar">
                                        {selectedLog.full_prompt || "Conteúdo não disponível"}
                                    </div>
                                </div>

                                {/* Result Preview (Optional) */}
                                {selectedLog.result && (
                                    <div>
                                        <h4 className="flex items-center gap-2 text-sm font-semibold text-zinc-300 mb-3">
                                            <Code size={16} className="text-purple-400" />
                                            Resultado da Análise (Resumo JSON)
                                        </h4>
                                        <div className="bg-zinc-950 rounded-lg p-4 border border-white/5 font-mono text-xs text-zinc-400 overflow-x-auto custom-scrollbar">
                                            <pre>{JSON.stringify(selectedLog.result, null, 2)}</pre>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="p-4 border-t border-white/5 bg-zinc-900/30 flex justify-end">
                                <button onClick={() => setSelectedLog(null)} className="px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-zinc-200 transition-colors">
                                    Fechar
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

const CreditRow = ({ label, value, total, color, details }) => {
    // Prevent division by zero
    const safeTotal = total > 0 ? total : 1;
    const percent = Math.min(100, (value / safeTotal) * 100);
    const barColor = color === 'purple' ? 'bg-purple-500' : 'bg-blue-500';

    return (
        <div className="group">
            <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-medium text-white group-hover:text-zinc-200 transition-colors">{label}</span>
                <div className="flex items-baseline gap-1">
                    <span className="text-lg font-bold text-white">{Math.round(value * 100) / 100}</span>
                    <span className="text-xs text-zinc-500">/{total}</span>
                </div>
            </div>
            <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden mb-2">
                <div className={`h-full ${barColor} transition-all duration-1000`} style={{ width: `${percent}%` }}></div>
            </div>
            <p className="text-xs text-zinc-500">{details}</p>
        </div>
    );
}

export default CreditsView;
