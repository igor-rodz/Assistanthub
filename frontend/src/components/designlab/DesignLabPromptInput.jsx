import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ArrowUp, Paperclip, Code2, Palette, Layers, Rocket, CircleUserRound, MonitorIcon, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

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
        textarea.style.height = '48px';
        const newHeight = Math.max(48, Math.min(textarea.scrollHeight, 200));
        textarea.style.height = `${newHeight}px`;
    }, []);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = '48px';
        }
    }, []);

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

    const quickActions = [
        { icon: <Code2 size={16} />, label: 'Componente', type: 'component' },
        { icon: <MonitorIcon size={16} />, label: 'Landing Page', type: 'landing_page' },
        { icon: <CircleUserRound size={16} />, label: 'Dashboard', type: 'dashboard' },
        { icon: <Rocket size={16} />, label: 'App', type: 'app' },
    ];

    return (
        <div className="relative w-full h-full flex flex-col items-center justify-center"
            style={{
                backgroundImage: "url('https://pub-940ccf6255b54fa799a9b01050e6c227.r2.dev/ruixen_moon_2.png')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed'
            }}
        >
            {/* Title */}
            <div className="text-center mb-8">
                <h1 className="text-5xl font-bold text-white drop-shadow-lg mb-3">
                    Design Lab AI
                </h1>
                <p className="text-white/70 text-lg">
                    Crie interfaces incríveis — descreva o que você imagina.
                </p>
            </div>

            {/* Input Box */}
            <div className="w-full max-w-3xl px-4">
                <div className="bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
                    <textarea
                        ref={textareaRef}
                        value={prompt}
                        onChange={(e) => {
                            setPrompt(e.target.value);
                            adjustHeight();
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder="Descreva o que você quer criar... Ex: Uma landing page moderna para SaaS com hero, features e pricing"
                        className={cn(
                            "w-full px-5 py-4 resize-none border-none",
                            "bg-transparent text-white text-base",
                            "focus:outline-none focus:ring-0",
                            "placeholder:text-white/40 min-h-[48px]"
                        )}
                        style={{ overflow: 'hidden' }}
                    />

                    {/* Footer with options */}
                    <div className="flex items-center justify-between p-4 border-t border-white/5">
                        <div className="flex items-center gap-2">
                            <button className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                                <Paperclip size={18} />
                            </button>

                            {/* Fidelity selector */}
                            <select
                                value={fidelity}
                                onChange={(e) => setFidelity(e.target.value)}
                                className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white/70 focus:outline-none focus:border-teal-500"
                            >
                                <option value="wireframe">Wireframe</option>
                                <option value="medium">Médio</option>
                                <option value="high">Alta Fidelidade</option>
                            </select>
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={!prompt.trim()}
                            className={cn(
                                "flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all",
                                prompt.trim()
                                    ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-400 hover:to-cyan-400 shadow-lg shadow-teal-500/25"
                                    : "bg-white/10 text-white/30 cursor-not-allowed"
                            )}
                        >
                            <Sparkles size={18} />
                            Criar
                        </button>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center justify-center flex-wrap gap-3 mt-6">
                    {quickActions.map((action) => (
                        <button
                            key={action.type}
                            onClick={() => {
                                setDesignType(action.type);
                                if (!prompt) {
                                    setPrompt(`Crie um ${action.label.toLowerCase()} `);
                                    textareaRef.current?.focus();
                                }
                            }}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-full border transition-all",
                                designType === action.type
                                    ? "border-teal-500 bg-teal-500/20 text-teal-300"
                                    : "border-white/20 bg-black/30 text-white/60 hover:text-white hover:bg-white/5"
                            )}
                        >
                            {action.icon}
                            <span className="text-sm">{action.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DesignLabPromptInput;
