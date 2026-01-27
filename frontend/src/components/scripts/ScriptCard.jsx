import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { User, Sparkles } from 'lucide-react';

/**
 * ScriptCard - Card estilo Aceternity UI com Live Preview
 */
const ScriptCard = ({ script, onView }) => {
    const iframeRef = useRef(null);

    // Ajusta a altura do iframe baseado no conteúdo (opcional, aqui fixaremos altura para o card)
    useEffect(() => {
        if (iframeRef.current && script.script_content) {
            // Injeta CSS básico para garantir que o preview fique bonito
            const style = `
                <style>
                    body { margin: 0; overflow: hidden; display: flex; align-items: center; justify-content: center; height: 100vh; background: #000; font-family: sans-serif; }
                    ::-webkit-scrollbar { width: 0px; background: transparent; }
                </style>
            `;
            // Envolvendo o código para centralização se for componente pequeno
            const content = style + script.script_content;
            iframeRef.current.srcdoc = content;
        }
    }, [script.script_content]);

    return (
        <div
            className="group relative flex flex-col bg-[#0f0f13] border border-white/5 rounded-3xl overflow-hidden hover:border-white/10 transition-all duration-300 cursor-pointer h-[320px]"
            onClick={onView}
        >
            {/* Header do Card (Autor e Status) */}
            <div className="absolute top-0 left-0 right-0 p-5 flex items-center justify-between z-10 pointer-events-none">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center border border-white/5">
                        {/* Ícone ou Avatar Genérico */}
                        <User size={12} className="text-white/70" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-white/40 leading-none mb-0.5">
                            Assistant Hub
                        </span>
                        <span className="text-xs font-medium text-white/90 leading-none">
                            {script.category === 'ui' ? 'UI Component' : script.category}
                        </span>
                    </div>
                </div>

                {script.tags?.includes('Novo') && (
                    <div className="px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/20">
                        <span className="text-[10px] font-medium text-purple-300">Novo</span>
                    </div>
                )}
            </div>

            {/* Preview Area */}
            <div className="flex-1 w-full bg-[#050505] relative mt-16 mx-auto w-[90%] rounded-t-xl overflow-hidden border-t border-l border-r border-white/5">
                {/* Camada de proteção para capturar clique no card e não no iframe */}
                <div className="absolute inset-0 z-10 bg-transparent" />

                {/* Iframe com scale para caber o conteúdo */}
                <iframe
                    ref={iframeRef}
                    title={script.title}
                    className="w-full h-[200%] origin-top transform scale-50 pointer-events-none"
                    sandbox="allow-scripts"
                    loading="lazy"
                />
            </div>

            {/* Footer com Título */}
            <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-[#0f0f13] via-[#0f0f13] to-transparent pt-12 z-20">
                <h3 className="text-lg font-bold text-white mb-1 group-hover:text-purple-400 transition-colors">
                    {script.title}
                </h3>
                <p className="text-sm text-white/50 line-clamp-1">
                    {script.description}
                </p>
            </div>

            {/* Hover Glow Effect */}
            <div className="absolute -inset-px rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0">
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-3xl" />
            </div>
        </div>
    );
};

export default ScriptCard;
