import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ArrowUp, Paperclip, Code2, Palette, Layers, Rocket, CircleUserRound, MonitorIcon, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import ProceduralGroundBackground from '../ui/ProceduralGroundBackground';

/**
 * DesignLabPromptInput - Initial prompt input screen
 */
const DesignLabPromptInput = ({ onSubmit, initialPrompt = '' }) => {
    const [prompt, setPrompt] = useState(initialPrompt);
    const [designType, setDesignType] = useState('component');
    const [fidelity, setFidelity] = useState('high');
    const textareaRef = useRef(null);

    const adjustHeight = useCallback(() => {
        const textarea = textareaRef.current;
        if (!textarea) return;
        textarea.style.height = 'auto';
        textarea.style.height = `${Math.min(textarea.scrollHeight, 300)}px`;
    }, []);

    useEffect(() => {
        adjustHeight();
    }, [prompt, adjustHeight]);

    const handleSubmit = () => {
        if (prompt.trim()) {
            onSubmit(prompt.trim(), designType, fidelity);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const handleSuggestion = (template, type) => {
        setPrompt(template);
        setDesignType(type);
        // Focus and resize happens via effect
        textareaRef.current?.focus();
    };

    const suggestions = [
        {
            icon: <Code2 size={16} />,
            label: 'Componente',
            type: 'component',
            template: "Um card de perfil de usuário moderno com efeito de vidro (glassmorphism), foto circular, e botões de redes sociais com hover animado."
        },
        {
            icon: <MonitorIcon size={16} />,
            label: 'Landing Page',
            type: 'landing_page',
            template: "Uma landing page vibrante para um SaaS de Inteligência Artificial. Seção Hero com título grande e gradiente, grid de features interativo e rodapé minimalista."
        },
        {
            icon: <CircleUserRound size={16} />,
            label: 'Dashboard',
            type: 'dashboard',
            template: "Um painel administrativo dark mode com sidebar de navegação, gráficos de linha para métricas financeiras e uma tabela de transações recentes."
        },
        {
            icon: <Rocket size={16} />,
            label: 'App',
            type: 'app',
            template: "Tela principal de um aplicativo de viagens, com barra de busca no topo, categorias de destinos em carrossel horizontal e lista de hotéis populares."
        },
    ];

    return (
        <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden">
            {/* Ambient Background */}
            <ProceduralGroundBackground />

            {/* Title */}
            <div className="text-center mb-8 relative z-10">
                <h1 className="text-5xl font-bold text-white drop-shadow-2xl mb-3 tracking-tight">
                    Design Lab AI
                </h1>
                <p className="text-white/60 text-lg font-light">
                    Transforme ideias em código — comece com um prompt.
                </p>
            </div>

            {/* Input Box */}
            <div className="w-full max-w-3xl px-4 relative z-10">
                <div className="bg-zinc-900/80 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden transition-all focus-within:border-white/20 focus-within:ring-1 focus-within:ring-white/10">
                    <textarea
                        ref={textareaRef}
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Descreva o que você quer criar... Ex: Uma landing page moderna para SaaS com hero, features e pricing"
                        className={cn(
                            "w-full px-6 py-5 resize-none border-none",
                            "bg-transparent text-white text-lg leading-relaxed",
                            "focus:outline-none focus:ring-0",
                            "placeholder:text-white/30 min-h-[80px]"
                        )}
                        style={{ overflow: 'hidden' }}
                    />

                    {/* Footer with options */}
                    <div className="flex items-center justify-between p-4 bg-black/20 border-t border-white/5">
                        <div className="flex items-center gap-3">
                            <button
                                className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                title="Anexar referência (Em breve)"
                            >
                                <Paperclip size={18} />
                            </button>

                            {/* Fidelity selector */}
                            <div className="h-6 w-px bg-white/10 mx-1" />

                            <select
                                value={fidelity}
                                onChange={(e) => setFidelity(e.target.value)}
                                className="bg-transparent text-xs uppercase tracking-wider font-medium text-white/50 hover:text-white border-none focus:ring-0 cursor-pointer"
                            >
                                <option value="wireframe" className="bg-zinc-900 text-white">Wireframe</option>
                                <option value="medium" className="bg-zinc-900 text-white">Fidelidade Média</option>
                                <option value="high" className="bg-zinc-900 text-white">Alta Fidelidade</option>
                            </select>
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={!prompt.trim()}
                            className={cn(
                                "flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all shadow-lg active:scale-95",
                                prompt.trim()
                                    ? "bg-white text-black hover:bg-zinc-200 shadow-white/10"
                                    : "bg-white/5 text-white/30 cursor-not-allowed"
                            )}
                        >
                            <Sparkles size={18} className={prompt.trim() ? "text-indigo-600" : ""} />
                            Criar
                        </button>
                    </div>
                </div>

                {/* Suggestions */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
                    {suggestions.map((item) => (
                        <button
                            key={item.type}
                            onClick={() => handleSuggestion(item.template, item.type)}
                            className="group flex flex-col items-start gap-2 p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10 transition-all text-left"
                        >
                            <div className="p-2 rounded-lg bg-white/5 group-hover:bg-white/10 text-white/70 group-hover:text-white transition-colors">
                                {item.icon}
                            </div>
                            <div>
                                <span className="block text-sm font-medium text-white/90 group-hover:text-white">
                                    {item.label}
                                </span>
                                <span className="block text-[10px] text-white/40 group-hover:text-white/50 line-clamp-2 mt-1 leading-tight">
                                    {item.template}
                                </span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DesignLabPromptInput;
