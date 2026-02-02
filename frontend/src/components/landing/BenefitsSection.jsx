import React from 'react';
import { Zap, Shield, Clock, Code2, Lightbulb, Infinity } from 'lucide-react';

const BenefitsSection = () => {
    const benefits = [
        {
            icon: <Zap className="w-6 h-6" />,
            title: 'Respostas Instantâneas',
            description: 'Correções em menos de 5 segundos. Sem esperar, sem filas.',
        },
        {
            icon: <Lightbulb className="w-6 h-6" />,
            title: 'Explicações Claras',
            description: 'Não só corrige, mas explica o porquê. Você aprende enquanto resolve.',
        },
        {
            icon: <Code2 className="w-6 h-6" />,
            title: 'Todas as Linguagens',
            description: 'JavaScript, Python, PHP, Java, C#, Go, Rust, e mais 50+ linguagens.',
        },
        {
            icon: <Shield className="w-6 h-6" />,
            title: 'Código Privado',
            description: 'Seu código nunca é armazenado. Processamos e descartamos.',
        },
        {
            icon: <Clock className="w-6 h-6" />,
            title: 'Disponível 24/7',
            description: 'Às 3h da manhã com deadline? A IA tá acordada.',
        },
        {
            icon: <Infinity className="w-6 h-6" />,
            title: '1000 Créditos/Mês',
            description: 'Correções suficientes para resolver tudo que aparecer.',
        },
    ];

    return (
        <section className="relative py-24 px-6 bg-black overflow-hidden">
            <div className="max-w-6xl mx-auto relative z-10">
                {/* Header */}
                <div className="text-center mb-16">
                    <span className="inline-block px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/60 text-sm font-medium mb-6">
                        Benefícios
                    </span>
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Por que devs escolhem{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                            One-Shot Fixes
                        </span>
                    </h2>
                    <p className="text-lg text-zinc-400 max-w-xl mx-auto">
                        Projetado por devs, para devs. Cada feature pensada para sua produtividade.
                    </p>
                </div>

                {/* Benefits grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {benefits.map((benefit, index) => (
                        <div
                            key={index}
                            className="group p-6 rounded-2xl bg-zinc-900/50 border border-white/5 hover:border-emerald-500/30 transition-all duration-300 hover:-translate-y-1"
                        >
                            <div className="inline-flex p-3 rounded-xl bg-emerald-500/10 text-emerald-400 mb-4 group-hover:bg-emerald-500/20 transition-colors">
                                {benefit.icon}
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">
                                {benefit.title}
                            </h3>
                            <p className="text-zinc-400">
                                {benefit.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default BenefitsSection;
