import React from 'react';
import { cn } from '@/lib/utils';
import { Code2, FileCode, Sparkles } from 'lucide-react';

/**
 * ScriptCard - Card com prévia de texto do script
 */
const ScriptCard = ({ script, onView }) => {
    // Pega as primeiras linhas do script para prévia
    const previewLines = (script.script_content || '')
        .split('\n')
        .slice(0, 8)
        .join('\n');

    // Ícone baseado na categoria
    const getCategoryIcon = () => {
        const cat = (script.category || '').toLowerCase();
        if (cat.includes('ui') || cat.includes('component')) return <Code2 size={20} />;
        if (cat.includes('landing') || cat.includes('page')) return <FileCode size={20} />;
        return <Sparkles size={20} />;
    };

    return (
        <div
            className="group relative flex flex-col bg-[#0f0f13] border border-white/5 rounded-2xl overflow-hidden hover:border-purple-500/30 transition-all duration-300 cursor-pointer h-[340px]"
            onClick={onView}
        >
            {/* Header do Card */}
            <div className="p-4 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center text-purple-400">
                        {getCategoryIcon()}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs uppercase tracking-wider font-medium text-white/40">
                            {script.category || 'Geral'}
                        </span>
                    </div>
                </div>

                {script.is_active && (
                    <div className="px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20">
                        <span className="text-[10px] font-medium text-green-400">Ativo</span>
                    </div>
                )}
            </div>

            {/* Preview Area - Mostra código como texto */}
            <div className="flex-1 p-4 overflow-hidden relative">
                <pre className="text-[11px] leading-relaxed text-white/40 font-mono whitespace-pre-wrap overflow-hidden h-full">
                    {previewLines || 'Sem conteúdo...'}
                </pre>
                {/* Fade effect at bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#0f0f13] to-transparent pointer-events-none" />
            </div>

            {/* Footer com Título */}
            <div className="p-4 border-t border-white/5 bg-[#0a0a0c]">
                <h3 className="text-base font-bold text-white mb-1 group-hover:text-purple-400 transition-colors truncate">
                    {script.title}
                </h3>
                <p className="text-sm text-white/50 line-clamp-1">
                    {script.description || 'Sem descrição'}
                </p>
            </div>

            {/* Hover Glow Effect */}
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none -z-10">
                <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent rounded-2xl" />
            </div>
        </div>
    );
};

export default ScriptCard;
