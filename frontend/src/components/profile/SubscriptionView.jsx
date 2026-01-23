import React from 'react';
import { CreditCard, CheckCircle, Calendar, Zap, Crown } from 'lucide-react';

const SubscriptionView = ({ credits, onUpgrade }) => {
    const currentPlan = credits?.plan || 'starter';
    const planPrice = credits?.plan_price || 19.90;

    return (
        <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Current Subscription Card */}
            <div className="glass-panel p-8 rounded-3xl relative overflow-hidden group">
                <div className="flex items-start justify-between mb-8">
                    <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-xl glass-panel flex items-center justify-center text-white/60">
                            <CreditCard size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">Status da Assinatura</h3>
                            <p className="text-white/40 text-sm">Gerencie sua assinatura e veja detalhes do plano atual</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-semibold neon-blue">
                        <CheckCircle size={14} />
                        Ativo
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                        <span className="text-white/50">Plano Atual:</span>
                        <span className="font-bold text-lg text-white capitalize">{currentPlan}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                        <span className="text-white/50">Valor:</span>
                        <span className="font-bold text-lg text-white">R$ {planPrice?.toFixed(2)}/mês</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                        <span className="text-white/50">Créditos:</span>
                        <span className="font-bold text-lg text-white">{credits?.monthly_limit || 300}/mês</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                        <span className="text-white/50">Próxima cobrança:</span>
                        <div className="flex items-center gap-2 font-semibold text-white">
                            <Calendar size={16} className="text-white/40" />
                            Renovação mensal
                        </div>
                    </div>
                </div>

                <button className="w-full mt-8 py-4 rounded-2xl glass-panel hover:bg-white/5 text-white/60 hover:text-white transition-all font-semibold">
                    Cancelar Plano
                </button>
            </div>

            {/* Upgrade Section */}
            <div className="space-y-6">
                <h3 className="text-sm font-bold tracking-widest text-white/40 uppercase">Fazer Upgrade</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Starter Plan */}
                    <div className={`p-6 rounded-[2rem] glass-panel relative group cursor-pointer hover:scale-[1.02] transition-all ${currentPlan === 'starter' ? 'border-2 border-green-500/50' : 'border border-white/10'}`}>
                        {currentPlan === 'starter' && (
                            <div className="absolute top-4 right-4 px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-bold">
                                Atual
                            </div>
                        )}
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                                <CreditCard className="text-white/60" size={20} />
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-white">Starter</h4>
                                <p className="text-white/40 text-xs">300 créditos/mês</p>
                            </div>
                        </div>

                        <ul className="space-y-2 mb-6 text-white/60 text-sm">
                            <li className="flex items-center gap-2">
                                <CheckCircle size={14} className="text-green-400" />
                                OneShot Fixes
                            </li>
                            <li className="flex items-center gap-2 text-white/30">
                                <span className="w-3.5 h-3.5 flex items-center justify-center">✕</span>
                                Design Lab
                            </li>
                            <li className="flex items-center gap-2 text-white/30">
                                <span className="w-3.5 h-3.5 flex items-center justify-center">✕</span>
                                Scripts Premium
                            </li>
                        </ul>

                        <button
                            disabled={currentPlan === 'starter'}
                            className={`w-full py-3 rounded-xl font-bold transition-all ${currentPlan === 'starter' ? 'bg-white/5 text-white/30 cursor-not-allowed' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                        >
                            R$ 19,90/mês
                        </button>
                    </div>

                    {/* Builder Plan */}
                    <div className={`p-6 rounded-[2rem] bg-gradient-to-br from-blue-600 to-blue-800 relative group cursor-pointer hover:scale-[1.02] transition-all ${currentPlan === 'builder' ? 'ring-2 ring-green-500' : ''}`}>
                        {currentPlan === 'builder' && (
                            <div className="absolute top-4 right-4 px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-bold">
                                Atual
                            </div>
                        )}
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                                <Zap className="text-white" size={20} />
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-white">Builder</h4>
                                <p className="text-white/70 text-xs">500 créditos/mês</p>
                            </div>
                        </div>

                        <ul className="space-y-2 mb-6 text-white/90 text-sm">
                            <li className="flex items-center gap-2">
                                <CheckCircle size={14} className="text-white" />
                                OneShot Fixes
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle size={14} className="text-white" />
                                Design Lab
                            </li>
                            <li className="flex items-center gap-2 text-white/50">
                                <span className="w-3.5 h-3.5 flex items-center justify-center">✕</span>
                                Scripts Premium
                            </li>
                        </ul>

                        <button
                            onClick={() => onUpgrade?.('builder')}
                            disabled={currentPlan === 'builder'}
                            className={`w-full py-3 rounded-xl font-bold transition-all border border-white/10 ${currentPlan === 'builder' ? 'bg-white/5 text-white/30 cursor-not-allowed' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                        >
                            R$ 24,90/mês
                        </button>
                    </div>

                    {/* Pro Plan */}
                    <div className={`p-6 rounded-[2rem] glass-panel border relative group cursor-pointer hover:scale-[1.02] transition-all overflow-hidden ${currentPlan === 'pro' ? 'border-green-500' : 'border-purple-500/50'}`}>
                        {/* Glow Effect */}
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/20 blur-[60px]"></div>

                        <div className="absolute top-4 right-4 px-2 py-1 rounded-full bg-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-wider neon-purple">
                            {currentPlan === 'pro' ? 'Atual' : 'Popular'}
                        </div>

                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                                <Crown className="text-purple-400" size={20} />
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-white">Pro</h4>
                                <p className="text-white/40 text-xs">1.000 créditos/mês</p>
                            </div>
                        </div>

                        <ul className="space-y-2 mb-6 text-white/80 text-sm">
                            <li className="flex items-center gap-2">
                                <CheckCircle size={14} className="text-purple-400" />
                                OneShot Fixes
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle size={14} className="text-purple-400" />
                                Design Lab
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle size={14} className="text-purple-400" />
                                Scripts Premium
                            </li>
                        </ul>

                        <button
                            onClick={() => onUpgrade?.('pro')}
                            disabled={currentPlan === 'pro'}
                            className={`w-full py-3 rounded-xl font-bold transition-all shadow-lg shadow-purple-500/20 ${currentPlan === 'pro' ? 'bg-white/5 text-white/30 cursor-not-allowed' : 'bg-gradient-to-r from-purple-500 to-purple-700 text-white'}`}
                        >
                            R$ 34,90/mês
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionView;
