import React from 'react';
import { Zap, Shield, Code2, Headphones, Infinity, Lightbulb } from 'lucide-react';

const BenefitsSection = () => {
    return (
        <section className="relative py-24 px-6 bg-black overflow-hidden">
            {/* Background Texture */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] opacity-20" />

            <div className="max-w-6xl mx-auto relative z-10">
                {/* Header */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
                        Menos enrolação.
                        <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                            Mais código rodando.
                        </span>
                    </h2>
                </div>

                {/* Grid - Rounded & Clean */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <BenefitCard
                        icon={<Zap className="w-6 h-6" />}
                        title="Respostas em 5s"
                        desc="Sem fila, sem espera. Colou, a IA resolveu."
                        accent="emerald"
                    />
                    <BenefitCard
                        icon={<Lightbulb className="w-6 h-6" />}
                        title="Correção + Explicação"
                        desc="Não é só 'arrumar'. A gente mostra onde você errou."
                        accent="cyan"
                    />
                    <BenefitCard
                        icon={<Code2 className="w-6 h-6" />}
                        title="Qualquer Linguagem"
                        desc="JS, Python, PHP, Rust... Se tem código, a gente corrige."
                        accent="purple"
                    />
                    <BenefitCard
                        icon={<Shield className="w-6 h-6" />}
                        title="Código Privado"
                        desc="Seu código é processado e descartado. Zero log."
                        accent="emerald"
                    />
                    <BenefitCard
                        icon={<Headphones className="w-6 h-6" />}
                        title="Suporte 24/7"
                        desc="São 3 da manhã? A IA tá acordada pra te salvar."
                        accent="cyan"
                    />
                    <BenefitCard
                        icon={<Infinity className="w-6 h-6" />}
                        title="700 Créditos"
                        desc="Suficiente pra corrigir bug o mês inteiro."
                        accent="purple"
                    />
                </div>
            </div>
        </section>
    );
};

const BenefitCard = ({ icon, title, desc, accent }) => {
    const accents = {
        emerald: 'text-emerald-400 bg-emerald-500/10 group-hover:bg-emerald-500',
        cyan: 'text-cyan-400 bg-cyan-500/10 group-hover:bg-cyan-500',
        purple: 'text-purple-400 bg-purple-500/10 group-hover:bg-purple-500',
    };

    return (
        <div className="group p-6 rounded-[2rem] bg-zinc-900/80 border border-white/5 hover:border-white/20 transition-all duration-300 hover:-translate-y-1">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${accents[accent]} group-hover:text-black transition-colors duration-300`}>
                {icon}
            </div>
            <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
                {desc}
            </p>
        </div>
    );
};

export default BenefitsSection;
