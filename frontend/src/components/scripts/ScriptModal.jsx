import React, { useState, useRef, useEffect } from 'react';
import { X, Copy, Check, Moon, Sun, RefreshCw, Smartphone, Monitor, Code } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

const ScriptModal = ({ script, onClose }) => {
    const [copied, setCopied] = useState(false);
    const [viewMode, setViewMode] = useState('desktop'); // desktop, mobile
    const [themeMode, setThemeMode] = useState('dark');
    const iframeRef = useRef(null);
    const navigate = useNavigate();

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(script.code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy code');
        }
    };

    // Atualiza o iframe quando muda o tema ou modo
    useEffect(() => {
        if (iframeRef.current) {
            const bg = themeMode === 'dark' ? '#09090b' : '#ffffff';
            const color = themeMode === 'dark' ? '#ffffff' : '#000000';

            const style = `
                <style>
                    body { margin: 0; padding: 20px; min-height: 100vh; background: ${bg}; color: ${color}; font-family: 'Inter', sans-serif; display: flex; align-items: center; justify-content: center; }
                    * { box-sizing: border-box; }
                </style>
            `;
            iframeRef.current.srcdoc = style + script.code;
        }
    }, [script.code, themeMode]);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-200 p-4 sm:p-8">
            <div
                className="absolute inset-0"
                onClick={onClose}
            />

            <div className="relative w-full max-w-6xl h-full max-h-[90vh] bg-[#09090b] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">

                {/* Top Bar / Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#09090b]">
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                            <h2 className="text-lg font-bold text-white">{script.title}</h2>
                            <p className="text-xs text-white/40">Criado por Assistant Hub</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* View Toggles */}
                        <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1 border border-white/5 mr-4">
                            <button
                                onClick={() => setViewMode('desktop')}
                                className={cn("p-2 rounded-md transition-all", viewMode === 'desktop' ? "bg-white/10 text-white shadow-sm" : "text-white/40 hover:text-white")}
                                title="Desktop View"
                            >
                                <Monitor size={16} />
                            </button>
                            <button
                                onClick={() => setViewMode('mobile')}
                                className={cn("p-2 rounded-md transition-all", viewMode === 'mobile' ? "bg-white/10 text-white shadow-sm" : "text-white/40 hover:text-white")}
                                title="Mobile View"
                            >
                                <Smartphone size={16} />
                            </button>
                        </div>

                        {/* Theme Toggle */}
                        <button
                            onClick={() => setThemeMode(prev => prev === 'dark' ? 'light' : 'dark')}
                            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors border border-white/5"
                            title="Toggle Theme"
                        >
                            {themeMode === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
                        </button>

                        {/* Copy Button */}
                        <button
                            onClick={handleCopy}
                            className={cn(
                                "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all border",
                                copied
                                    ? "bg-green-500/10 text-green-400 border-green-500/20"
                                    : "bg-white text-black hover:bg-white/90 border-transparent"
                            )}
                        >
                            {copied ? (
                                <>
                                    <Check size={16} /> Copiado
                                </>
                            ) : (
                                <>
                                    <Copy size={16} /> Copiar Código
                                </>
                            )}
                        </button>

                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="p-2.5 rounded-xl hover:bg-white/10 text-white/40 hover:text-white transition-colors ml-2"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Main Content Area (Preview) */}
                <div className="flex-1 bg-[#050505] relative overflow-hidden flex items-center justify-center p-8 bg-[radial-gradient(#1a1a1a_1px,transparent_1px)] [background-size:16px_16px]">
                    <div className={cn(
                        "relative bg-background transition-all duration-500 shadow-2xl border border-white/10 overflow-hidden",
                        viewMode === 'mobile'
                            ? "w-[375px] h-[667px] rounded-[3rem] border-[8px] border-[#1a1a1a]"
                            : "w-full h-full rounded-xl"
                    )}>
                        <iframe
                            ref={iframeRef}
                            title="Preview"
                            className="w-full h-full"
                            sandbox="allow-scripts"
                        />
                    </div>
                </div>

                {/* Footer Info */}
                <div className="px-6 py-3 bg-[#09090b] border-t border-white/5 text-xs text-white/30 flex justify-between">
                    <span>Preview Mode</span>
                    <span>Use o botão "Copiar Código" para usar em seu projeto</span>
                </div>
            </div>
        </div>
    );
};

export default ScriptModal;
