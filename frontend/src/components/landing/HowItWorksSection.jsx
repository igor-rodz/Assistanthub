import React from 'react';
import { Copy, Sparkles, Check, ArrowDown } from 'lucide-react';

const HowItWorksSection = () => {
    const steps = [
        {
            number: '01',
            icon: <Copy className="w-6 h-6" />,
            title: 'Cole o Erro',
            description: 'Copie a mensagem de erro, stack trace, ou o código que não funciona. Aceita qualquer formato.',
            accent: 'emerald',
        },
        {
            number: '02',
            icon: <Sparkles className="w-6 h-6" />,
            title: 'IA Analisa',
            description: 'Nossa IA identifica o problema em milissegundos e gera a correção com explicação detalhada.',
            accent: 'cyan',
        },
        {
            number: '03',
            icon: <Check className="w-6 h-6" />,
            title: 'Aplique e Rode',
            description: 'Copie a solução pronta, cole no seu código, e veja funcionando imediatamente.',
            accent: 'amber',
        },
    ];

    return (
        <section className="relative py-32 px-6 bg-black overflow-hidden">
            {/* Vertical line */}
            <div className="absolute left-1/2 top-40 bottom-40 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent hidden lg:block" />

            <div className="max-w-6xl mx-auto relative z-10">
                {/* Header */}
                <div className="text-center mb-20">
                    <span className="inline-block px-4 py-2 bg-white/5 border border-white/10 text-zinc-400 text-sm font-medium mb-6">
                        Como Funciona
                    </span>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                        3 passos.
                        <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                            Zero complicação.
                        </span>
                    </h2>
                    <p className="text-lg text-zinc-500 max-w-md mx-auto">
                        Sem setup, sem configuração, sem curva de aprendizado.
                    </p>
                </div>

                {/* Steps - Staggered vertical layout */}
                <div className="relative space-y-8 lg:space-y-0">
                    {steps.map((step, index) => (
                        <StepCard
                            key={index}
                            step={step}
                            position={index}
                            isLast={index === steps.length - 1}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

const StepCard = ({ step, position, isLast }) => {
    const accentColors = {
        emerald: {
            bg: 'bg-emerald-500/10',
            border: 'border-emerald-500/30',
            text: 'text-emerald-400',
            glow: 'group-hover:shadow-emerald-500/10',
        },
        cyan: {
            bg: 'bg-cyan-500/10',
            border: 'border-cyan-500/30',
            text: 'text-cyan-400',
            glow: 'group-hover:shadow-cyan-500/10',
        },
        amber: {
            bg: 'bg-amber-500/10',
            border: 'border-amber-500/30',
            text: 'text-amber-400',
            glow: 'group-hover:shadow-amber-500/10',
        },
    };

    const colors = accentColors[step.accent];

    // Stagger positions for desktop
    const offsetClasses = [
        'lg:ml-0 lg:mr-auto',      // Step 1: left
        'lg:mx-auto',               // Step 2: center
        'lg:ml-auto lg:mr-0',       // Step 3: right
    ];

    return (
        <div className={`relative ${offsetClasses[position]} lg:w-[450px]`}>
            {/* Connector arrow */}
            {!isLast && (
                <div className="hidden lg:flex absolute -bottom-4 left-1/2 -translate-x-1/2 translate-y-full z-10">
                    <ArrowDown className="w-6 h-6 text-zinc-700" />
                </div>
            )}

            {/* Card */}
            <div className={`group relative p-8 bg-zinc-950 border border-white/5 hover:${colors.border} transition-all duration-500 hover:-translate-y-1 ${colors.glow} hover:shadow-2xl`}>
                {/* Large background number */}
                <span className="absolute -top-6 -left-2 text-8xl font-black text-white/[0.03] select-none pointer-events-none">
                    {step.number}
                </span>

                {/* Content */}
                <div className="relative">
                    {/* Icon */}
                    <div className={`inline-flex items-center justify-center w-14 h-14 ${colors.bg} ${colors.text} mb-6 group-hover:scale-110 transition-transform`}>
                        {step.icon}
                    </div>

                    {/* Step indicator */}
                    <div className="flex items-center gap-3 mb-4">
                        <span className={`text-sm font-mono ${colors.text}`}>
                            PASSO {step.number}
                        </span>
                        <div className={`flex-1 h-px ${colors.bg}`} />
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl font-bold text-white mb-3">
                        {step.title}
                    </h3>

                    {/* Description */}
                    <p className="text-zinc-400 leading-relaxed">
                        {step.description}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default HowItWorksSection;
