import React from 'react';
import { Copy, Zap, CheckCircle, ArrowDown } from 'lucide-react';

const WorkflowDemoSection = () => {
    return (
        <section className="relative py-32 px-6 bg-zinc-950 overflow-hidden">
            {/* Background Texture */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] opacity-20" />

            <div className="max-w-5xl mx-auto relative z-10 text-center">

                {/* Header Copy */}
                <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tight">
                    Copiou. Colou. <span className="text-emerald-400">Resolveu.</span>
                </h2>
                <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-16">
                    Seja Lazy ou Lovable: você não precisa perder tempo.
                    <br />
                    Cole o erro e deixe a mágica acontecer.
                </p>

                {/* Main GIF Card */}
                <div className="relative max-w-4xl mx-auto mb-20 group">
                    {/* Floating Shadow */}
                    <div className="absolute top-8 left-8 -right-8 -bottom-8 bg-black/50 rounded-[3rem] -z-10 blur-2xl" />

                    {/* Hover Glow */}
                    <div className="absolute -inset-1 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-[3rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className="relative bg-zinc-900 rounded-[2.5rem] border border-white/10 p-2 shadow-2xl overflow-hidden hover:scale-[1.02] transition-transform duration-500">
                        {/* Editor Window */}
                        <div className="bg-black rounded-[2rem] overflow-hidden border border-white/5">
                            {/* Window Actions */}
                            <div className="flex items-center justify-between px-6 py-4 bg-white/5 border-b border-white/5">
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 rounded-full bg-zinc-700" />
                                    <div className="w-3 h-3 rounded-full bg-zinc-700" />
                                </div>
                                <span className="text-xs font-mono text-zinc-500">VS Code - Error.log</span>
                                <div className="w-8" />
                            </div>

                            {/* GIF Placeholder */}
                            <div className="aspect-[16/9] flex items-center justify-center bg-zinc-950/50">
                                <div className="text-center p-8">
                                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-4 animate-pulse">
                                        <Copy className="w-8 h-8 text-cyan-400" />
                                    </div>
                                    <h3 className="text-white text-lg font-medium mb-1">
                                        GIF do Fluxo
                                    </h3>
                                    <p className="text-zinc-500 text-sm">
                                        Espaço para: Copiando erro do terminal → Colando na ferramenta
                                        <br />
                                        <code className="text-zinc-400">/demo/copy-paste.gif</code>
                                    </p>
                                </div>
                                {/* <img src="/demo/copy-paste.gif" className="w-full h-full object-cover" /> */}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Steps - Clean & Direct */}
                <div className="grid md:grid-cols-3 gap-8 text-left">
                    <StepCard
                        number="01"
                        icon={<Copy className="w-6 h-6" />}
                        title="Copie o Erro"
                        desc="Do terminal, do log, de onde for. A gente entende tudo."
                    />
                    <StepCard
                        number="02"
                        icon={<Zap className="w-6 h-6" />}
                        title="IA Analisa"
                        desc="Identifica a causa raiz em segundos. Sem enrolação."
                    />
                    <StepCard
                        number="03"
                        icon={<CheckCircle className="w-6 h-6" />}
                        title="Aplique o Fix"
                        desc="Solução pronta pra copiar. Problema resolvido."
                    />
                </div>
            </div>
        </section>
    );
};

const StepCard = ({ number, icon, title, desc }) => (
    <div className="group p-8 rounded-[2rem] bg-zinc-900/50 border border-white/5 hover:border-emerald-500/30 hover:bg-zinc-900 transition-all duration-300">
        <div className="flex items-center gap-4 mb-6">
            <span className="text-4xl font-black text-white/10 group-hover:text-emerald-500/10 transition-colors">
                {number}
            </span>
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white group-hover:bg-emerald-500 group-hover:text-black transition-colors duration-300">
                {icon}
            </div>
        </div>
        <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
        <p className="text-zinc-400 leading-relaxed text-sm">{desc}</p>
    </div>
);

export default WorkflowDemoSection;
