import React, { useState } from 'react';
import {
    Monitor,
    Tablet,
    Smartphone,
    Download,
    ExternalLink,
    Copy,
    Check,
    ChevronDown,
    Clock,
    Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import DesignLabPreview from './DesignLabPreview';

/**
 * DesignLabWorkspace - Lovable exact layout
 */
const DesignLabWorkspace = ({ job, prompt, onRefine, onNewDesign }) => {
    const [refinementText, setRefinementText] = useState('');
    const [viewport, setViewport] = useState('desktop');
    const [copied, setCopied] = useState(false);
    const [showActions, setShowActions] = useState(false);
    const [iterations] = useState([
        { id: 1, text: prompt, time: 'Agora' }
    ]);

    const handleRefine = () => {
        if (refinementText.trim()) {
            onRefine(refinementText.trim());
            setRefinementText('');
        }
    };

    const handleCopyCode = () => {
        const fullCode = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>${job.css || ''}</style>
</head>
<body>
${job.html || ''}
</body>
</html>`;
        navigator.clipboard.writeText(fullCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        const fullCode = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Design Lab Export</title>
    <style>${job.css || ''}</style>
</head>
<body>
${job.html || ''}
</body>
</html>`;

        const blob = new Blob([fullCode], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'design-export.html';
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleOpenInNewTab = () => {
        const fullCode = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>${job.css || ''}</style>
</head>
<body>
${job.html || ''}
</body>
</html>`;

        const blob = new Blob([fullCode], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
    };

    return (
        <div className="flex h-screen bg-[#0f0f0f]">
            {/* Left Sidebar - Chat/Iterations (Lovable style) */}
            <div className="w-[300px] bg-[#0a0a0a] border-r border-white/5 flex flex-col">
                {/* Project name */}
                <div className="px-4 py-3 border-b border-white/5">
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-white/90 truncate">
                            {prompt.length > 35 ? prompt.substring(0, 35) + '...' : prompt}
                        </span>
                        <button className="ml-auto text-white/40 hover:text-white/60">
                            <ChevronDown size={16} />
                        </button>
                    </div>
                </div>

                {/* Iterations/Chat */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {iterations.map((item) => (
                        <div key={item.id} className="group">
                            <div className="flex items-start gap-2 text-xs text-white/40 mb-1.5">
                                <Clock size={12} className="mt-0.5" />
                                <span>{item.time}</span>
                            </div>
                            <div className="bg-white/5 rounded-lg p-3 text-sm text-white/70 hover:bg-white/[0.07] transition-colors cursor-pointer">
                                {item.text}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Input at bottom */}
                <div className="p-4 border-t border-white/5">
                    <div className="relative">
                        <textarea
                            value={refinementText}
                            onChange={(e) => setRefinementText(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleRefine();
                                }
                            }}
                            placeholder="Ask Lovable..."
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 pr-10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 resize-none"
                            rows={3}
                        />
                        <button
                            onClick={handleRefine}
                            disabled={!refinementText.trim()}
                            className={cn(
                                "absolute right-2 bottom-2 p-1.5 rounded-md transition-all",
                                refinementText.trim()
                                    ? "bg-purple-600 text-white hover:bg-purple-700"
                                    : "bg-white/5 text-white/20 cursor-not-allowed"
                            )}
                        >
                            <Sparkles size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Right - Main Preview Area */}
            <div className="flex-1 flex flex-col">
                {/* Top Bar (Lovable style) */}
                <div className="h-12 border-b border-white/5 flex items-center justify-between px-4 bg-[#0a0a0a]">
                    {/* Left - Viewport toggles */}
                    <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
                        <button
                            onClick={() => setViewport('desktop')}
                            className={cn(
                                "px-3 py-1.5 rounded text-xs font-medium transition-all",
                                viewport === 'desktop'
                                    ? "bg-white text-black"
                                    : "text-white/50 hover:text-white/80"
                            )}
                        >
                            <Monitor size={14} className="inline mr-1" />
                            Desktop
                        </button>
                        <button
                            onClick={() => setViewport('tablet')}
                            className={cn(
                                "px-3 py-1.5 rounded text-xs font-medium transition-all",
                                viewport === 'tablet'
                                    ? "bg-white text-black"
                                    : "text-white/50 hover:text-white/80"
                            )}
                        >
                            <Tablet size={14} className="inline mr-1" />
                            Tablet
                        </button>
                        <button
                            onClick={() => setViewport('mobile')}
                            className={cn(
                                "px-3 py-1.5 rounded text-xs font-medium transition-all",
                                viewport === 'mobile'
                                    ? "bg-white text-black"
                                    : "text-white/50 hover:text-white/80"
                            )}
                        >
                            <Smartphone size={14} className="inline mr-1" />
                            Mobile
                        </button>
                    </div>

                    {/* Right - Actions */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleOpenInNewTab}
                            className="px-4 py-1.5 text-sm text-white/70 hover:text-white border border-white/10 hover:border-white/20 rounded-lg transition-all"
                        >
                            Preview
                        </button>

                        <div className="relative">
                            <button
                                onClick={() => setShowActions(!showActions)}
                                className="px-4 py-1.5 text-sm text-white/70 hover:text-white border border-white/10 hover:border-white/20 rounded-lg transition-all flex items-center gap-1"
                            >
                                Exportar
                                <ChevronDown size={14} />
                            </button>

                            {showActions && (
                                <>
                                    <div
                                        className="fixed inset-0 z-10"
                                        onClick={() => setShowActions(false)}
                                    />
                                    <div className="absolute right-0 top-full mt-1 w-48 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-2xl overflow-hidden z-20">
                                        <button
                                            onClick={() => {
                                                handleCopyCode();
                                                setShowActions(false);
                                            }}
                                            className="w-full px-4 py-2.5 text-left text-sm text-white/70 hover:bg-white/5 hover:text-white flex items-center gap-3 transition-colors"
                                        >
                                            {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                                            {copied ? 'Copiado!' : 'Copiar Código'}
                                        </button>
                                        <button
                                            onClick={() => {
                                                handleDownload();
                                                setShowActions(false);
                                            }}
                                            className="w-full px-4 py-2.5 text-left text-sm text-white/70 hover:bg-white/5 hover:text-white flex items-center gap-3 transition-colors"
                                        >
                                            <Download size={16} />
                                            Baixar HTML
                                        </button>
                                        <button
                                            onClick={() => {
                                                handleOpenInNewTab();
                                                setShowActions(false);
                                            }}
                                            className="w-full px-4 py-2.5 text-left text-sm text-white/70 hover:bg-white/5 hover:text-white flex items-center gap-3 transition-colors"
                                        >
                                            <ExternalLink size={16} />
                                            Abrir em Nova Aba
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Preview Area - Full screen like Lovable */}
                <div className="flex-1 bg-[#0f0f0f] overflow-auto">
                    <DesignLabPreview
                        html={job.html}
                        css={job.css}
                        viewport={viewport}
                        zoom={100}
                    />
                </div>
            </div>
        </div>
    );
};

export default DesignLabWorkspace;
