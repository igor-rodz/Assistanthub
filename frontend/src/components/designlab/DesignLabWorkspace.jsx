import React, { useState, useRef, useEffect } from 'react';
import {
    Monitor,
    Tablet,
    Smartphone,
    Download,
    ExternalLink,
    Copy,
    Check,
    ChevronDown,
    ChevronRight,
    Clock,
    Sparkles,
    Code2,
    Eye,
    Layers,
    Grid3X3,
    ZoomIn,
    ZoomOut,
    RotateCcw,
    Maximize2,
    Plus,
    MessageSquare,
    Palette,
    Wand2,
    Share2,
    FileCode,
    Undo2,
    Settings2,
    Layout
} from 'lucide-react';
import { cn } from '@/lib/utils';
import DesignLabPreview from './DesignLabPreview';

/**
 * DesignLabWorkspace - Premium workspace with enhanced UX
 * Inspired by Lovable/Bolt but with unique identity
 */
const DesignLabWorkspace = ({ job, prompt, onRefine, onNewDesign }) => {
    const [refinementText, setRefinementText] = useState('');
    const [viewport, setViewport] = useState('desktop');
    const [copied, setCopied] = useState(false);
    const [showCodePanel, setShowCodePanel] = useState(false);
    const [showGrid, setShowGrid] = useState(false);
    const [zoom, setZoom] = useState(100);
    const [activeTab, setActiveTab] = useState('preview'); // preview, code
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showQuickActions, setShowQuickActions] = useState(false);
    const [notification, setNotification] = useState(null);
    const textareaRef = useRef(null);

    const [iterations, setIterations] = useState([
        { id: 1, text: prompt, time: 'Agora', type: 'user' }
    ]);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
        }
    }, [refinementText]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.metaKey || e.ctrlKey) {
                switch (e.key) {
                    case 'c':
                        if (e.shiftKey) {
                            e.preventDefault();
                            handleCopyCode();
                        }
                        break;
                    case 's':
                        e.preventDefault();
                        handleDownload();
                        break;
                    case 'g':
                        e.preventDefault();
                        setShowGrid(!showGrid);
                        break;
                    case 'f':
                        if (e.shiftKey) {
                            e.preventDefault();
                            setIsFullscreen(!isFullscreen);
                        }
                        break;
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [showGrid, isFullscreen]);

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 2500);
    };

    const handleRefine = () => {
        if (refinementText.trim()) {
            setIterations(prev => [...prev, {
                id: prev.length + 1,
                text: refinementText.trim(),
                time: 'Agora',
                type: 'user'
            }]);
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
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>${job.css || ''}</style>
</head>
<body>
${job.html || ''}
</body>
</html>`;
        navigator.clipboard.writeText(fullCode);
        setCopied(true);
        showNotification('Código copiado!', 'success');
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        const fullCode = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Design Lab Export</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
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
        showNotification('Download iniciado!', 'success');
    };

    const handleOpenInNewTab = () => {
        const fullCode = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
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

    const handleZoom = (direction) => {
        if (direction === 'in' && zoom < 150) {
            setZoom(zoom + 10);
        } else if (direction === 'out' && zoom > 50) {
            setZoom(zoom - 10);
        } else if (direction === 'reset') {
            setZoom(100);
        }
    };

    const quickSuggestions = [
        { icon: Palette, label: 'Mudar cores', prompt: 'Mude a paleta de cores para tons mais vibrantes' },
        { icon: Layout, label: 'Ajustar layout', prompt: 'Melhore o espaçamento e alinhamento dos elementos' },
        { icon: Wand2, label: 'Adicionar animações', prompt: 'Adicione animações sutis aos elementos interativos' },
        { icon: Layers, label: 'Modernizar', prompt: 'Aplique um visual mais moderno e premium' }
    ];

    return (
        <div className={cn(
            "flex h-screen bg-[#09090b] transition-all duration-300",
            isFullscreen && "fixed inset-0 z-50"
        )}>
            {/* Toast Notification */}
            {notification && (
                <div className={cn(
                    "fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-2xl",
                    "animate-in slide-in-from-top-2 fade-in duration-300",
                    "flex items-center gap-3 text-sm font-medium",
                    notification.type === 'success'
                        ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                        : "bg-red-500/10 border border-red-500/20 text-red-400"
                )}>
                    <Check size={16} />
                    {notification.message}
                </div>
            )}

            {/* Left Sidebar - Enhanced Chat Panel */}
            {!isFullscreen && (
                <div className="w-[340px] bg-[#0c0c0e] border-r border-white/[0.06] flex flex-col">
                    {/* Header with project info */}
                    <div className="px-5 py-4 border-b border-white/[0.06]">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-teal-500/20">
                                <Sparkles size={16} className="text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-semibold text-white truncate">
                                    {prompt.length > 30 ? prompt.substring(0, 30) + '...' : prompt}
                                </h3>
                                <p className="text-xs text-white/40 mt-0.5">Design gerado</p>
                            </div>
                            <button
                                onClick={onNewDesign}
                                className="p-2 rounded-lg hover:bg-white/[0.05] text-white/40 hover:text-white/70 transition-all"
                            >
                                <Plus size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Quick Suggestions */}
                    <div className="px-4 py-3 border-b border-white/[0.06]">
                        <p className="text-[11px] font-medium text-white/30 uppercase tracking-wider mb-2">Sugestões rápidas</p>
                        <div className="flex flex-wrap gap-1.5">
                            {quickSuggestions.map((suggestion, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setRefinementText(suggestion.prompt)}
                                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-white/50 bg-white/[0.03] hover:bg-white/[0.06] hover:text-white/70 rounded-lg transition-all border border-white/[0.04] hover:border-white/[0.08]"
                                >
                                    <suggestion.icon size={12} />
                                    {suggestion.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Chat History */}
                    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                        {iterations.map((item, idx) => (
                            <div
                                key={item.id}
                                className={cn(
                                    "group animate-in fade-in slide-in-from-bottom-2",
                                    "duration-300"
                                )}
                                style={{ animationDelay: `${idx * 50}ms` }}
                            >
                                <div className="flex items-center gap-2 text-[11px] text-white/30 mb-2">
                                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center">
                                        <MessageSquare size={10} className="text-white/50" />
                                    </div>
                                    <span>Você</span>
                                    <span className="text-white/20">•</span>
                                    <span className="flex items-center gap-1">
                                        <Clock size={10} />
                                        {item.time}
                                    </span>
                                </div>
                                <div className="ml-7 bg-white/[0.03] hover:bg-white/[0.05] rounded-xl p-3.5 text-sm text-white/70 transition-all border border-white/[0.04] group-hover:border-white/[0.08]">
                                    {item.text}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Enhanced Input Area */}
                    <div className="p-4 border-t border-white/[0.06] bg-[#0a0a0c]">
                        <div className="relative bg-white/[0.03] rounded-xl border border-white/[0.08] focus-within:border-teal-500/30 focus-within:shadow-lg focus-within:shadow-teal-500/5 transition-all">
                            <textarea
                                ref={textareaRef}
                                value={refinementText}
                                onChange={(e) => setRefinementText(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleRefine();
                                    }
                                }}
                                placeholder="Descreva as alterações que deseja..."
                                className="w-full bg-transparent px-4 py-3 pr-12 text-sm text-white placeholder:text-white/25 focus:outline-none resize-none min-h-[44px] max-h-[120px]"
                                rows={1}
                            />
                            <button
                                onClick={handleRefine}
                                disabled={!refinementText.trim()}
                                className={cn(
                                    "absolute right-2.5 bottom-2.5 p-2 rounded-lg transition-all duration-200",
                                    refinementText.trim()
                                        ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 hover:scale-105"
                                        : "bg-white/[0.05] text-white/20 cursor-not-allowed"
                                )}
                            >
                                <Sparkles size={16} />
                            </button>
                        </div>
                        <p className="text-[10px] text-white/20 mt-2 text-center">
                            Press Enter para enviar • Shift+Enter para nova linha
                        </p>
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Enhanced Top Bar - Fixed Layout */}
                <div className="h-14 border-b border-white/[0.06] flex items-center px-4 bg-[#0a0a0c] gap-4 relative">
                    {/* Left - Tab Navigation (Takes available space initially) */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="flex items-center gap-1 p-1 bg-white/[0.03] rounded-xl shrink-0">
                            <button
                                onClick={() => setActiveTab('preview')}
                                className={cn(
                                    "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
                                    activeTab === 'preview'
                                        ? "bg-white text-black shadow-lg"
                                        : "text-white/50 hover:text-white/80 hover:bg-white/[0.05]"
                                )}
                            >
                                <Eye size={14} />
                                <span className="hidden sm:inline">Preview</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('code')}
                                className={cn(
                                    "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
                                    activeTab === 'code'
                                        ? "bg-white text-black shadow-lg"
                                        : "text-white/50 hover:text-white/80 hover:bg-white/[0.05]"
                                )}
                            >
                                <Code2 size={14} />
                                <span className="hidden sm:inline">Código</span>
                            </button>
                        </div>

                        <div className="h-4 w-px bg-white/[0.08] shrink-0" />

                        {/* Viewport Toggles (Hidden on very small screens) */}
                        <div className="hidden md:flex items-center gap-1 p-1 bg-white/[0.03] rounded-xl shrink-0">
                            {[
                                { id: 'desktop', icon: Monitor, label: 'Desktop' },
                                { id: 'tablet', icon: Tablet, label: 'Tablet' },
                                { id: 'mobile', icon: Smartphone, label: 'Mobile' }
                            ].map((vp) => (
                                <button
                                    key={vp.id}
                                    onClick={() => setViewport(vp.id)}
                                    title={vp.label}
                                    className={cn(
                                        "p-1.5 rounded-lg transition-all duration-200",
                                        viewport === vp.id
                                            ? "bg-white/10 text-white"
                                            : "text-white/40 hover:text-white/70 hover:bg-white/[0.05]"
                                    )}
                                >
                                    <vp.icon size={14} />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Center - Zoom Controls (Only show if space allows, usually centered) */}
                    {activeTab === 'preview' && (
                        <div className="flex items-center gap-2 absolute left-1/2 -translate-x-1/2 pointer-events-none md:pointer-events-auto opacity-0 md:opacity-100 transition-opacity">
                            {/* Keep absolute only for large screens where we WANT it centered, but hide on small screens or collision */}
                            <div className="flex items-center gap-1 p-1 bg-white/[0.03] rounded-xl shadow-sm border border-black/20">
                                <button
                                    onClick={() => handleZoom('out')}
                                    className="p-1.5 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/[0.05] transition-all"
                                    disabled={zoom <= 50}
                                >
                                    <ZoomOut size={14} />
                                </button>
                                <span className="w-10 text-center text-xs font-medium text-white/50 tabular-nums">
                                    {zoom}%
                                </span>
                                <button
                                    onClick={() => handleZoom('in')}
                                    className="p-1.5 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/[0.05] transition-all"
                                    disabled={zoom >= 150}
                                >
                                    <ZoomIn size={14} />
                                </button>
                            </div>

                            <button
                                onClick={() => setShowGrid(!showGrid)}
                                title="Toggle grid (⌘G)"
                                className={cn(
                                    "p-1.5 rounded-lg transition-all border",
                                    showGrid
                                        ? "bg-teal-500/10 text-teal-400 border-teal-500/20"
                                        : "text-white/40 hover:text-white/70 hover:bg-white/[0.05] border-transparent"
                                )}
                            >
                                <Grid3X3 size={16} />
                            </button>
                        </div>
                    )}

                    {/* Right - Actions (Takes available space at end) */}
                    <div className="flex items-center gap-3 shrink-0 justify-end flex-1">
                        {/* Zoom for mobile (shown only when center is hidden) */}
                        {activeTab === 'preview' && (
                            <div className="md:hidden flex items-center gap-1 bg-white/[0.03] rounded-lg px-2 py-1">
                                <span className="text-xs text-white/50">{zoom}%</span>
                            </div>
                        )}

                        <button
                            onClick={() => setIsFullscreen(!isFullscreen)}
                            title="Fullscreen (⌘⇧F)"
                            className="p-2 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/[0.05] transition-all hidden sm:flex"
                        >
                            <Maximize2 size={16} />
                        </button>

                        <div className="h-4 w-px bg-white/[0.08] hidden sm:block" />

                        <button
                            onClick={handleOpenInNewTab}
                            className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-white/70 hover:text-white bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-white/[0.15] rounded-xl transition-all"
                        >
                            <ExternalLink size={14} />
                            <span className="hidden sm:inline">Abrir</span>
                        </button>

                        <div className="relative">
                            <button
                                onClick={() => setShowQuickActions(!showQuickActions)}
                                className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-white bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 rounded-xl shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 transition-all"
                            >
                                <span>Exportar</span>
                                <ChevronDown size={14} className={cn(
                                    "transition-transform duration-200",
                                    showQuickActions && "rotate-180"
                                )} />
                            </button>

                            {showQuickActions && (
                                <>
                                    <div
                                        className="fixed inset-0 z-10"
                                        onClick={() => setShowQuickActions(false)}
                                    />
                                    <div className="absolute right-0 top-full mt-2 w-56 bg-[#151517] border border-white/[0.08] rounded-xl shadow-2xl overflow-hidden z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                                        <div className="p-1.5">
                                            <button
                                                onClick={() => {
                                                    handleCopyCode();
                                                    setShowQuickActions(false);
                                                }}
                                                className="w-full px-3 py-2.5 text-left text-sm text-white/70 hover:bg-white/[0.05] hover:text-white flex items-center gap-3 rounded-lg transition-colors group"
                                            >
                                                <div className="p-1.5 rounded-md bg-white/[0.05] group-hover:bg-teal-500/10">
                                                    {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                                                </div>
                                                <div>
                                                    <p className="font-medium">{copied ? 'Copiado!' : 'Copiar Código'}</p>
                                                    <p className="text-[10px] text-white/40">⌘⇧C</p>
                                                </div>
                                            </button>
                                            <button
                                                onClick={() => {
                                                    handleDownload();
                                                    setShowQuickActions(false);
                                                }}
                                                className="w-full px-3 py-2.5 text-left text-sm text-white/70 hover:bg-white/[0.05] hover:text-white flex items-center gap-3 rounded-lg transition-colors group"
                                            >
                                                <div className="p-1.5 rounded-md bg-white/[0.05] group-hover:bg-teal-500/10">
                                                    <Download size={14} />
                                                </div>
                                                <div>
                                                    <p className="font-medium">Baixar HTML</p>
                                                    <p className="text-[10px] text-white/40">⌘S</p>
                                                </div>
                                            </button>
                                            <div className="h-px bg-white/[0.06] my-1.5" />
                                            <button
                                                onClick={() => {
                                                    handleOpenInNewTab();
                                                    setShowQuickActions(false);
                                                }}
                                                className="w-full px-3 py-2.5 text-left text-sm text-white/70 hover:bg-white/[0.05] hover:text-white flex items-center gap-3 rounded-lg transition-colors group"
                                            >
                                                <div className="p-1.5 rounded-md bg-white/[0.05] group-hover:bg-teal-500/10">
                                                    <ExternalLink size={14} />
                                                </div>
                                                <div>
                                                    <p className="font-medium">Abrir em Nova Aba</p>
                                                    <p className="text-[10px] text-white/40">Preview completo</p>
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-hidden relative">
                    {/* Grid Overlay */}
                    {showGrid && activeTab === 'preview' && (
                        <div
                            className="absolute inset-0 z-10 pointer-events-none opacity-20"
                            style={{
                                backgroundImage: `
                                    linear-gradient(to right, rgba(20, 184, 166, 0.3) 1px, transparent 1px),
                                    linear-gradient(to bottom, rgba(20, 184, 166, 0.3) 1px, transparent 1px)
                                `,
                                backgroundSize: '20px 20px'
                            }}
                        />
                    )}

                    {/* Preview Tab */}
                    {activeTab === 'preview' && (
                        <div className="h-full bg-[#0f0f11] overflow-auto p-6">
                            <div
                                className={cn(
                                    "mx-auto transition-all duration-300 ease-out",
                                    viewport === 'desktop' && "w-full max-w-full",
                                    viewport === 'tablet' && "max-w-[768px]",
                                    viewport === 'mobile' && "max-w-[375px]"
                                )}
                                style={{
                                    transform: `scale(${zoom / 100})`,
                                    transformOrigin: 'top center'
                                }}
                            >
                                {/* Device Frame for mobile/tablet */}
                                {viewport !== 'desktop' && (
                                    <div className="mb-2 flex items-center justify-center gap-2 text-[10px] text-white/30">
                                        <div className="w-16 h-1 rounded-full bg-white/10" />
                                        <span>{viewport === 'tablet' ? '768 × 1024' : '375 × 667'}</span>
                                        <div className="w-16 h-1 rounded-full bg-white/10" />
                                    </div>
                                )}
                                <div className={cn(
                                    "bg-white rounded-xl overflow-hidden shadow-2xl shadow-black/50",
                                    viewport !== 'desktop' && "border-[8px] border-[#1c1c1e] rounded-[28px]"
                                )}>
                                    <DesignLabPreview
                                        html={job.html}
                                        css={job.css}
                                        viewport={viewport}
                                        zoom={100}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Code Tab */}
                    {activeTab === 'code' && (
                        <div className="h-full flex">
                            {/* HTML Panel */}
                            <div className="flex-1 flex flex-col border-r border-white/[0.06]">
                                <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between bg-[#0c0c0e]">
                                    <div className="flex items-center gap-2">
                                        <FileCode size={14} className="text-orange-400" />
                                        <span className="text-sm font-medium text-white/70">HTML</span>
                                    </div>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(job.html || '');
                                            showNotification('HTML copiado!');
                                        }}
                                        className="p-1.5 rounded-md hover:bg-white/[0.05] text-white/40 hover:text-white/70 transition-all"
                                    >
                                        <Copy size={14} />
                                    </button>
                                </div>
                                <pre className="flex-1 overflow-auto p-4 text-xs text-white/60 font-mono leading-relaxed bg-[#0a0a0c]">
                                    <code>{job.html || 'Nenhum HTML gerado'}</code>
                                </pre>
                            </div>

                            {/* CSS Panel */}
                            <div className="flex-1 flex flex-col">
                                <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between bg-[#0c0c0e]">
                                    <div className="flex items-center gap-2">
                                        <Palette size={14} className="text-cyan-400" />
                                        <span className="text-sm font-medium text-white/70">CSS</span>
                                    </div>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(job.css || '');
                                            showNotification('CSS copiado!');
                                        }}
                                        className="p-1.5 rounded-md hover:bg-white/[0.05] text-white/40 hover:text-white/70 transition-all"
                                    >
                                        <Copy size={14} />
                                    </button>
                                </div>
                                <pre className="flex-1 overflow-auto p-4 text-xs text-white/60 font-mono leading-relaxed bg-[#0a0a0c]">
                                    <code>{job.css || 'Nenhum CSS gerado'}</code>
                                </pre>
                            </div>
                        </div>
                    )}
                </div>

                {/* Bottom Status Bar */}
                <div className="h-8 border-t border-white/[0.06] flex items-center justify-between px-4 bg-[#0a0a0c] text-[11px] text-white/30">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            Design gerado com sucesso
                        </span>
                        <span>•</span>
                        <span>Viewport: {viewport}</span>
                        <span>•</span>
                        <span>Zoom: {zoom}%</span>
                    </div>
                    <div className="flex items-center gap-3">
                        {job.credits_used && (
                            <span className="text-teal-400/70">
                                {job.credits_used.toFixed(2)} créditos
                            </span>
                        )}
                        <span className="text-white/20">⌘K para atalhos</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DesignLabWorkspace;
