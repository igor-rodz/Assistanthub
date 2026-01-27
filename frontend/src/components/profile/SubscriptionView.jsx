import React from 'react';
import { CreditCard, CheckCircle, Calendar, Zap, Crown, Check, X } from 'lucide-react';

const SubscriptionView = ({ credits, onUpgrade }) => {
    const currentPlan = credits?.plan || 'starter';
    const planPrice = credits?.plan_price || 19.90;

    return (
        <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Assinatura & Planos</h1>
                    <p className="text-zinc-400">Gerencie seu nível de acesso e capacidade de processamento.</p>
                </div>

                {/* Active Plan Badge */}
                <div className="flex items-center gap-3 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
                    <span className="text-sm font-medium text-purple-200">Plano {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)} Ativo</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Plan Cards */}
                <PlanCard
                    title="Starter"
                    price="19,90"
                    credits="300"
                    features={['OneShot Fixes']}
                    missing={['Design Lab', 'Scripts Premium']}
                    isActive={currentPlan === 'starter'}
                    onSelect={() => onUpgrade('starter')}
                    color="zinc"
                />

                <PlanCard
                    title="Builder"
                    price="24,90"
                    credits="500"
                    features={['OneShot Fixes', 'Design Lab']}
                    missing={['Scripts Premium']}
                    isActive={currentPlan === 'builder'}
                    onSelect={() => onUpgrade('builder')}
                    color="blue"
                    isPopular
                />

                <PlanCard
                    title="Pro"
                    price="34,90"
                    credits="1.000"
                    features={['OneShot Fixes', 'Design Lab', 'Scripts Premium']}
                    missing={[]}
                    isActive={currentPlan === 'pro'}
                    onSelect={() => onUpgrade('pro')}
                    color="purple"
                />
            </div>

            {/* Current Billing Info */}
            <div className="pt-8 border-t border-white/5">
                <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-6">Status de Faturamento</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <BillingStat
                        label="Próxima Renovação"
                        value="Mensal"
                        icon={<Calendar size={16} />}
                    />
                    <BillingStat
                        label="Método de Pagamento"
                        value="•••• 4242"
                        icon={<CreditCard size={16} />}
                    />
                    <BillingStat
                        label="Status"
                        value="Ativo"
                        icon={<CheckCircle size={16} />}
                        highlight
                    />
                </div>
            </div>
        </div>
    );
};

const PlanCard = ({ title, price, credits, features, missing, isActive, onSelect, color, isPopular }) => {
    const borderColor = isActive
        ? color === 'purple' ? 'border-purple-500' : color === 'blue' ? 'border-blue-500' : 'border-zinc-500'
        : 'border-white/5 group-hover:border-white/10';

    const bgGradient = color === 'purple'
        ? 'from-purple-500/10 to-transparent'
        : color === 'blue'
            ? 'from-blue-500/10 to-transparent'
            : 'from-zinc-500/10 to-transparent';

    return (
        <div className={`relative group p-6 rounded-2xl border ${borderColor} bg-zinc-900/40 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1`}>
            {isPopular && !isActive && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-lg shadow-blue-500/20">
                    Recomendado
                </div>
            )}

            <div className={`absolute inset-0 bg-gradient-to-b ${bgGradient} opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none`}></div>

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <h3 className={`text-xl font-bold ${isActive ? 'text-white' : 'text-zinc-300'}`}>{title}</h3>
                    {isActive && <div className="p-1 rounded-full bg-green-500/20 text-green-400"><Check size={14} /></div>}
                </div>

                <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-3xl font-bold text-white">R$ {price}</span>
                    <span className="text-sm text-zinc-500">/mês</span>
                </div>
                <p className="text-zinc-400 text-sm mb-6">{credits} créditos mensais</p>

                <button
                    onClick={onSelect}
                    disabled={isActive}
                    className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-all mb-8 ${isActive
                            ? 'bg-white/5 text-zinc-500 cursor-default'
                            : 'bg-white text-black hover:bg-zinc-200'
                        }`}
                >
                    {isActive ? 'Plano Atual' : 'Selecionar Plano'}
                </button>

                <div className="space-y-3">
                    {features.map((feature, i) => (
                        <div key={i} className="flex items-center gap-3 text-sm text-zinc-300">
                            <Check size={14} className={color === 'purple' ? 'text-purple-400' : color === 'blue' ? 'text-blue-400' : 'text-zinc-400'} />
                            {feature}
                        </div>
                    ))}
                    {missing.map((feature, i) => (
                        <div key={i} className="flex items-center gap-3 text-sm text-zinc-600">
                            <X size={14} />
                            {feature}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const BillingStat = ({ label, value, icon, highlight }) => (
    <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-3 text-zinc-400">
            {icon}
            <span className="text-sm font-medium">{label}</span>
        </div>
        <span className={`font-mono font-semibold ${highlight ? 'text-green-400' : 'text-white'}`}>
            {value}
        </span>
    </div>
);

export default SubscriptionView;
