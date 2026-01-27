import React, { useState } from 'react';
import { X, Copy, Check, FileText, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';

const ScriptModal = ({ script, onClose }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(script.script_content || '');
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy code');
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-200 p-4 sm:p-8">
            <div
                className="absolute inset-0"
                onClick={onClose}
            />

            <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#0a0a0c] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#0f0f13]">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center text-purple-400">
                            <FileText size={20} />
                        </div>
                        <div className="flex flex-col">
                            <h2 className="text-lg font-bold text-white">{script.title}</h2>
                            <div className="flex items-center gap-2 mt-0.5">
                                <Tag size={12} className="text-white/40" />
                                <span className="text-xs text-white/40">{script.category || 'Geral'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Copy Button */}
                        <button
                            onClick={handleCopy}
                            className={cn(
                                "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all border",
                                copied
                                    ? "bg-green-500/10 text-green-400 border-green-500/20"
                                    : "bg-purple-500 text-white hover:bg-purple-600 border-transparent"
                            )}
                        >
                            {copied ? (
                                <>
                                    <Check size={16} /> Copiado!
                                </>
                            ) : (
                                <>
                                    <Copy size={16} /> Copiar Script
                                </>
                            )}
                        </button>

                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="p-2.5 rounded-xl hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Description */}
                {script.description && (
                    <div className="px-6 py-3 bg-white/[0.02] border-b border-white/5">
                        <p className="text-sm text-white/60">{script.description}</p>
                    </div>
                )}

                {/* Script Content */}
                <div className="flex-1 overflow-auto p-6">
                    <div className="bg-[#050507] border border-white/5 rounded-xl p-5 min-h-[300px]">
                        <pre className="text-sm leading-relaxed text-white/80 font-mono whitespace-pre-wrap break-words">
                            {script.script_content || 'Sem conteúdo disponível.'}
                        </pre>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-3 bg-[#0f0f13] border-t border-white/5 text-xs text-white/30 flex justify-between items-center">
                    <span>Criado em: {script.created_at ? new Date(script.created_at).toLocaleDateString('pt-BR') : 'N/A'}</span>
                    <span>Clique em "Copiar Script" para usar em seu projeto</span>
                </div>
            </div>
        </div>
    );
};

export default ScriptModal;
