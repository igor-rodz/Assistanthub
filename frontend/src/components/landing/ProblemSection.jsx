import React from 'react';
import { AlertTriangle, Zap, Clock, CheckCircle } from 'lucide-react';

const ProblemSection = () => {
    return (
        <section className="relative py-24 px-6 bg-gradient-to-b from-black via-zinc-950 to-black overflow-hidden">
            {/* Background glow */}
            <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-[120px] -translate-y-1/2" />
            <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] -translate-y-1/2" />

            <div className="max-w-6xl mx-auto relative z-10">
                {/* Header */}
                <div className="text-center mb-16">
                    <span className="inline-block px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium mb-6">
                        O Problema
                    </span>
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Erros de código consomem{' '}
                        <span className="text-red-400">horas</span> do seu dia
                    </h2>
                    <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
                        Você passa mais tempo debugando do que desenvolvendo. Stack traces confusos,
                        mensagens de erro crípticas, e horas pesquisando no Google.
                    </p>
                </div>

                {/* Problem cards */}
                <div className="grid md:grid-cols-3 gap-6 mb-20">
                    <ProblemCard
                        icon={<Clock className="w-6 h-6" />}
                        title="Tempo Perdido"
                        description="Em média, devs gastam 35% do tempo corrigindo bugs em vez de criar features novas."
                        color="red"
                    />
                    <ProblemCard
                        icon={<AlertTriangle className="w-6 h-6" />}
                        title="Frustração Constante"
                        description="Stack traces gigantes, erros genéricos, e zero contexto de onde o problema realmente está."
                        color="orange"
                    />
                    <ProblemCard
                        icon={<Zap className="w-6 h-6" />}
                        title="Produtividade Travada"
                        description="Você sabe o que quer construir, mas fica preso tentando entender por que não funciona."
                        color="yellow"
                    />
                </div>

                {/* Solution transition */}
                <div className="text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-6">
                        <CheckCircle className="w-4 h-4" />
                        A Solução
                    </div>
                    <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
                        Nossa IA corrige em{' '}
                        <span className="text-emerald-400">segundos</span>
                    </h3>
                    <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
                        Cole o erro, receba a correção explicada passo a passo.
                        Sem jargão, sem enrolação. Só a solução que funciona.
                    </p>
                </div>
            </div>
        </section>
    );
};

const ProblemCard = ({ icon, title, description, color }) => {
    const colorClasses = {
        red: 'bg-red-500/10 border-red-500/20 text-red-400',
        orange: 'bg-orange-500/10 border-orange-500/20 text-orange-400',
        yellow: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
    };

    return (
        <div className="group p-6 rounded-2xl bg-zinc-900/50 border border-white/5 hover:border-white/10 transition-all duration-300">
            <div className={`inline-flex p-3 rounded-xl ${colorClasses[color]} mb-4`}>
                {icon}
            </div>
            <h4 className="text-xl font-semibold text-white mb-2">{title}</h4>
            <p className="text-zinc-400">{description}</p>
        </div>
    );
};

export default ProblemSection;
