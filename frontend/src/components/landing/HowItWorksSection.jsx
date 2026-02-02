import React from 'react';
import { Copy, Sparkles, Check } from 'lucide-react';

const HowItWorksSection = () => {
    const steps = [
        {
            number: '01',
            icon: <Copy className="w-8 h-8" />,
            title: 'Cole o Erro',
            description: 'Copie a mensagem de erro, stack trace, ou o código que não funciona.',
            color: 'from-blue-500 to-cyan-500',
        },
        {
            number: '02',
            icon: <Sparkles className="w-8 h-8" />,
            title: 'IA Analisa',
            description: 'Nossa IA identifica o problema e gera a correção explicada.',
            color: 'from-emerald-500 to-teal-500',
        },
        {
            number: '03',
            icon: <Check className="w-8 h-8" />,
            title: 'Aplique e Rode',
            description: 'Copie a solução, cole no seu código, e veja funcionando.',
            color: 'from-amber-500 to-orange-500',
        },
    ];

    return (
        <section className="relative py-24 px-6 bg-black overflow-hidden">
            {/* Subtle grid background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

            <div className="max-w-6xl mx-auto relative z-10">
                {/* Header */}
                <div className="text-center mb-16">
                    <span className="inline-block px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/60 text-sm font-medium mb-6">
                        Como Funciona
                    </span>
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        3 passos.{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                            Zero complicação.
                        </span>
                    </h2>
                    <p className="text-lg text-zinc-400 max-w-xl mx-auto">
                        Sem setup, sem configuração, sem curva de aprendizado.
                    </p>
                </div>

                {/* Steps */}
                <div className="grid md:grid-cols-3 gap-8">
                    {steps.map((step, index) => (
                        <div
                            key={index}
                            className="group relative"
                        >
                            {/* Connection line */}
                            {index < steps.length - 1 && (
                                <div className="hidden md:block absolute top-16 left-[60%] w-[80%] h-px bg-gradient-to-r from-white/20 to-transparent" />
                            )}

                            <div className="relative p-8 rounded-3xl bg-zinc-900/50 border border-white/5 hover:border-white/10 transition-all duration-500 hover:-translate-y-2">
                                {/* Step number */}
                                <span className="absolute -top-4 -left-2 text-7xl font-black text-white/5 select-none">
                                    {step.number}
                                </span>

                                {/* Icon */}
                                <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${step.color} text-white mb-6`}>
                                    {step.icon}
                                </div>

                                <h3 className="text-2xl font-bold text-white mb-3">
                                    {step.title}
                                </h3>
                                <p className="text-zinc-400 leading-relaxed">
                                    {step.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HowItWorksSection;
