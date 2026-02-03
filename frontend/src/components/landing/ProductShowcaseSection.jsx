import React from 'react';
import { ArrowRight, Sparkles, Play } from 'lucide-react';

const ProductShowcaseSection = () => {
    return (
        <section className="relative py-32 px-6 bg-black overflow-hidden">
            {/* Soft accent glow - Emerald for trust/tech */}
            <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] -translate-y-1/2" />

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header Badge */}
                <div className="text-center mb-16">
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-emerald-400 text-sm font-medium shadow-lg shadow-emerald-500/10 backdrop-blur-sm">
                        <Sparkles className="w-4 h-4" />
                        Veja a Mágica
                    </span>
                </div>

                {/* Main Content: 60/40 Split with Rounded Aesthetics */}
                <div className="relative grid lg:grid-cols-12 gap-12 items-center">

                    {/* LEFT: GIF Demo (60%) */}
                    <div className="lg:col-span-7 relative group">
                        {/* Soft Glow behind container */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                        <div className="relative bg-zinc-900/80 border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl backdrop-blur-sm hover:translate-y-[-4px] transition-transform duration-500">
                            {/* Browser Header */}
                            <div className="flex items-center gap-3 px-6 py-4 bg-white/5 border-b border-white/5">
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                                </div>
                                <div className="flex-1 text-center">
                                    <div className="inline-block px-3 py-1 rounded-full bg-black/20 text-xs text-zinc-500 font-mono">
                                        one-shot-fixes.app
                                    </div>
                                </div>
                                <div className="w-12" />
                            </div>

                            {/* GIF Placeholder Area */}
                            <div className="aspect-video bg-zinc-950 flex items-center justify-center relative">
                                {/* Placeholder Content */}
                                <div className="text-center p-8">
                                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4 group-hover:scale-110 transition-transform duration-300">
                                        <Play className="w-8 h-8 text-emerald-400 ml-1" />
                                    </div>
                                    <h3 className="text-white font-medium text-lg mb-2">
                                        Ferramenta em Ação
                                    </h3>
                                    <p className="text-zinc-500 text-sm">
                                        Espaço reservado para o GIF gerando a solução.
                                        <br />
                                        Substitua por: <code className="text-emerald-400 bg-emerald-500/10 px-1 py-0.5 rounded">/demo/paste-error.gif</code>
                                    </p>
                                </div>

                                {/* Actual Image (Commented out) */}
                                {/* <img 
                                    src="/demo/paste-error.gif" 
                                    alt="Demonstração da ferramenta" 
                                    className="w-full h-full object-cover"
                                /> */}
                            </div>
                        </div>

                        {/* Caption */}
                        <div className="mt-6 text-center lg:text-left">
                            <p className="text-zinc-400 text-sm">
                                <span className="text-emerald-400">●</span> A IA analisa, corrige e explica passo a passo.
                            </p>
                        </div>
                    </div>

                    {/* RIGHT: Result & Feature (40%) */}
                    <div className="lg:col-span-5 relative">
                        {/* Floating Result Card */}
                        <div className="relative group/card cursor-default">
                            {/* Depth Shadow */}
                            <div className="absolute top-10 left-10 -right-4 -bottom-4 bg-black/50 rounded-[2rem] -z-10 blur-xl" />

                            <div className="bg-zinc-900 border border-white/10 rounded-[2rem] p-1 shadow-2xl hover:translate-y-[-4px] transition-transform duration-500">
                                <div className="bg-zinc-950 rounded-[1.8rem] border border-white/5 overflow-hidden">
                                    {/* Card Header */}
                                    <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                            <span className="text-sm text-white font-medium">Resultado Pronto</span>
                                        </div>
                                        <span className="text-xs text-zinc-500 font-mono">500ms</span>
                                    </div>

                                    {/* Result Placeholder */}
                                    <div className="aspect-[4/3] bg-zinc-950 flex items-center justify-center p-8">
                                        <div className="text-center">
                                            <div className="w-16 h-16 mx-auto mb-4 border-2 border-dashed border-zinc-800 rounded-2xl flex items-center justify-center">
                                                <span className="text-2xl">📸</span>
                                            </div>
                                            <p className="text-zinc-500 text-xs">
                                                Coloque o print do resultado aqui
                                                <br />
                                                <code className="text-zinc-400">/demo/result-screen.png</code>
                                            </p>
                                        </div>

                                        {/* Actual Image (Commented out) */}
                                        {/* <img 
                                            src="/demo/result-screen.png" 
                                            alt="Tela de resultado" 
                                            className="w-full h-full object-contain"
                                        /> */}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Direct Copy */}
                        <div className="mt-10 lg:pl-4">
                            <h3 className="text-2xl font-bold text-white mb-4 leading-tight">
                                Você não precisa entender.
                                <br />
                                <span className="text-emerald-400">A IA resolve.</span>
                            </h3>
                            <p className="text-zinc-400 mb-6 leading-relaxed">
                                Esqueça horas no StackOverflow. A ferramenta corrige o erro e te explica o porquê, sem você precisar quebrar a cabeça.
                            </p>

                            <div className="flex items-center gap-3">
                                <div className="flex -space-x-2">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="w-8 h-8 rounded-full bg-zinc-800 border-2 border-black flex items-center justify-center text-[10px] text-white">
                                            Dev
                                        </div>
                                    ))}
                                </div>
                                <span className="text-sm text-zinc-500">
                                    Usado por devs <span className="text-emerald-400 font-medium">Lazy & Lovable</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ProductShowcaseSection;
