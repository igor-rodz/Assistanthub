import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Settings, Coins, RefreshCw, History, ArrowUpRight } from 'lucide-react';

const CreditsView = ({ credits, usageHistory }) => {
    const creditBalance = credits?.credit_balance || 0;
    const monthlyLimit = credits?.monthly_limit || 300;
    const creditsUsed = credits?.credits_used || 0;
    const availableCredits = creditBalance;
    const usedPercent = monthlyLimit > 0 ? Math.round((creditsUsed / monthlyLimit) * 100) : 0;

    const data = [
        { name: 'Usado', value: creditsUsed },
        { name: 'Disponível', value: availableCredits },
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
                                    <span className="text-4xl font-bold text-white tracking-tighter">{Math.round(availableCredits)}</span>
                                    <span className="text-xs text-zinc-500 uppercase tracking-widest font-medium mt-1">Disponíveis</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8 w-full px-8">
                                <div className="text-center">
                                    <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Usado</p>
                                    <p className="text-xl font-bold text-blue-400">{Math.round(creditsUsed)}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Total</p>
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
                            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest">Histórico Recente</h3>
                            <button className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 font-medium transition-colors">
                                Ver tudo <ArrowUpRight size={12} />
                            </button>
                        </div>

                        {usageHistory && usageHistory.length > 0 ? (
                            <div className="space-y-3">
                                {usageHistory.slice(0, 3).map((item, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400">
                                                <History size={14} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-zinc-200">{item.action || 'Ação Desconhecida'}</p>
                                                <p className="text-xs text-zinc-500">{item.date || 'Data Recente'}</p>
                                            </div>
                                        </div>
                                        <span className="text-sm font-mono text-zinc-400">-{item.cost || 0}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-zinc-600 text-sm">Nenhuma atividade recente</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const CreditRow = ({ label, value, total, color, details }) => {
    const percent = total > 0 ? (value / total) * 100 : 0;
    const barColor = color === 'purple' ? 'bg-purple-500' : 'bg-blue-500';

    return (
        <div className="group">
            <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-medium text-white group-hover:text-zinc-200 transition-colors">{label}</span>
                <div className="flex items-baseline gap-1">
                    <span className="text-lg font-bold text-white">{value}</span>
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
