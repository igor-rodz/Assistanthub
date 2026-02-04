import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Copy, Check, Zap, Terminal, Sparkles, Play, Code2, Shield, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { EtheralShadow } from '@/components/ui/etheral-shadow';
import TestimonialsSection from '@/components/ui/TestimonialsSection';

const CHECKOUT_URL = 'https://pay.perfectpay.com.br/PMW/SEU_LINK_AQUI';

const LandingPageV2 = () => {
    const navigate = useNavigate();
    const { scrollY } = useScroll();

    // Parallax & Opacity transforms for fluid feel
    const heroOpacity = useTransform(scrollY, [0, 500], [1, 0]);
    const heroScale = useTransform(scrollY, [0, 500], [1, 0.95]);
    const demoY = useTransform(scrollY, [0, 800], [100, -50]);

    const [isScrolling, setIsScrolling] = useState(false);

    useEffect(() => {
        let timeout;
        const handleScroll = () => {
            setIsScrolling(true);
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                setIsScrolling(false);
            }, 2200); // Reaparece 2.2s após parar de rolar
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
            clearTimeout(timeout);
        };
    }, []);

    return (
        <div className="min-h-screen bg-black text-white selection:bg-emerald-500/30 selection:text-emerald-200 font-sans overflow-x-hidden">

            {/* Global Background Ambient */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[150px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-cyan-500/10 rounded-full blur-[150px]" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay" />
            </div>

            {/* Navbar Floating - Auto Hide */}
            <nav
                className={`fixed top-6 left-0 right-0 z-50 flex justify-center px-6 transition-transform duration-300 ${isScrolling ? '-translate-y-32' : 'translate-y-0'
                    }`}
            >
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3 flex items-center gap-6 shadow-2xl shadow-black/50">
                    <div className="flex items-center gap-2">
                        <img src="/logo-hub.png" alt="Assistant Hub" className="w-8 h-8 rounded-lg" />
                        <span className="font-bold tracking-tight text-white hidden md:block">Assistant Hub</span>
                    </div>
                    <div className="h-6 w-px bg-white/10" />
                    <button
                        onClick={() => window.open(CHECKOUT_URL)}
                        className="text-sm font-medium text-zinc-300 hover:text-white transition-colors"
                    >
                        Criar Conta
                    </button>
                    <button
                        onClick={() => document.getElementById('pricing-card').scrollIntoView({ behavior: 'smooth' })}
                        className="bg-white text-black px-4 py-2 rounded-full text-sm font-bold hover:scale-105 transition-transform"
                    >
                        Começar Agora
                    </button>
                </div>
            </nav>

            {/* FLUID HERO SECTION */}
            <motion.section
                style={{ opacity: heroOpacity, scale: heroScale }}
                className="relative min-h-[90vh] flex flex-col items-center justify-center pt-32 pb-20 px-6 z-10 overflow-hidden"
            >
                {/* Hero Background Animation */}
                <div className="absolute inset-0 z-0">
                    <EtheralShadow
                        color="rgba(16, 185, 129, 0.4)"
                        animation={{ scale: 80, speed: 60 }}
                        noise={{ opacity: 0.2, scale: 1 }}
                    />
                </div>

                <div className="text-center max-w-4xl mx-auto space-y-8 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium"
                    >
                        <Sparkles className="w-4 h-4" />
                        Nova Engine v2.0 Disponível
                    </motion.div>

                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.9]">
                        Corrija erros <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 animate-gradient-x">
                            em segundos.
                        </span>
                    </h1>

                    <p className="text-xl md:text-2xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                        Não perca horas no Stack Overflow. <br className="hidden md:block" />
                        Cole seu erro, receba a correção e a explicação.
                    </p>

                    <div className="flex flex-col md:flex-row items-center justify-center gap-4 pt-4">
                        <button
                            onClick={() => document.getElementById('pricing-card').scrollIntoView({ behavior: 'smooth' })}
                            className="group relative px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-black text-lg font-bold rounded-full transition-all hover:scale-105 hover:shadow-[0_0_40px_-10px_rgba(16,185,129,0.5)]"
                        >
                            <span className="flex items-center gap-2">
                                Corrigir meu código agora
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </span>
                        </button>
                        <button
                            onClick={() => document.getElementById('demo').scrollIntoView({ behavior: 'smooth' })}
                            className="px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white text-lg font-medium rounded-full transition-all"
                        >
                            Ver demonstração
                        </button>
                    </div>
                </div>
            </motion.section>


            {/* STICKY DEMO EXPERIENCE */}
            <div id="demo" className="relative z-20 pb-32">
                <motion.div
                    style={{ y: demoY }}
                    className="max-w-6xl mx-auto px-6"
                >
                    {/* The "Container" */}
                    <div className="relative group rounded-[3rem] bg-zinc-900 overflow-hidden border border-white/10 shadow-2xl transition-all duration-700 hover:shadow-emerald-900/20">
                        {/* Glow Behind */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[300px] bg-emerald-500/20 blur-[120px] rounded-full pointer-events-none" />

                        {/* Browser Chrome */}
                        <div className="flex items-center gap-4 px-8 py-6 border-b border-white/5 bg-white/5 backdrop-blur-md">
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                                <div className="w-3 h-3 rounded-full bg-green-500/50" />
                            </div>
                            <div className="flex-1 text-center">
                                <div className="inline-block px-4 py-1.5 rounded-full bg-black/20 text-xs text-zinc-500 font-mono">
                                    assistanthub.ai/demo
                                </div>
                            </div>
                            <div className="w-12" />
                        </div>

                        {/* Content Grid */}
                        <div className="grid lg:grid-cols-2 gap-0 min-h-[600px]">

                            {/* Left: Input (Paste Error) */}
                            <div className="p-10 md:p-14 border-b lg:border-b-0 lg:border-r border-white/5 relative overflow-hidden group/left">
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-red-500/5 opacity-0 group-hover/left:opacity-100 transition-opacity" />

                                <div className="relative z-10 h-full flex flex-col">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500">
                                            <Terminal className="w-5 h-5" />
                                        </div>
                                        <h3 className="text-xl font-bold">1. Cole o Erro</h3>
                                    </div>

                                    <div className="flex-1 bg-black/50 rounded-3xl border border-white/10 p-6 font-mono text-sm text-red-400 relative overflow-hidden">
                                        {/* Placeholder for GIF 1 */}
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900/90 z-20">
                                            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/10">
                                                <Play className="w-8 h-8 text-white ml-1" />
                                            </div>
                                            <p className="text-zinc-500 text-center px-4">
                                                GIF: Usuário colando erro
                                                <br />
                                                <code className="text-xs bg-black/50 px-2 py-1 rounded mt-2 inline-block">/demo/paste-error.gif</code>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Output (Fix) */}
                            <div className="p-10 md:p-14 relative overflow-hidden group/right bg-zinc-900/50">
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-emerald-500/5 opacity-0 group-hover/right:opacity-100 transition-opacity" />

                                <div className="relative z-10 h-full flex flex-col">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                            <Zap className="w-5 h-5" />
                                        </div>
                                        <h3 className="text-xl font-bold">2. Solução Pronta</h3>
                                    </div>

                                    <div className="flex-1 bg-gradient-to-br from-emerald-900/10 to-black rounded-3xl border border-emerald-500/20 p-6 relative overflow-hidden">
                                        {/* Placeholder for Result Image */}
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900/90 z-20">
                                            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4 border border-emerald-500/20">
                                                <Check className="w-8 h-8 text-emerald-400" />
                                            </div>
                                            <p className="text-zinc-500 text-center px-4">
                                                Print da Tela de Resultado
                                                <br />
                                                <code className="text-xs bg-black/50 px-2 py-1 rounded mt-2 inline-block">/demo/result-screen.png</code>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </motion.div>
            </div>


            {/* BENEFITS TICKER (Social Proof Style) */}
            <div className="py-20 border-y border-white/5 bg-black/50 backdrop-blur-sm overflow-hidden whitespace-nowrap relative z-10">
                <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-black to-transparent z-10" />
                <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-black to-transparent z-10" />

                <div className="inline-flex gap-16 animate-infinite-scroll pl-16">
                    {[
                        // Set 1
                        "Zero Configuração", "Erros de Preview", "Suporte a 50+ Linguagens", "Erros 3000",
                        "Privacidade Total", "CORS Policy Blocked", "Explicações Didáticas", "Undefined is not a function",
                        "Segmentation Fault", "Deploy Failed", "500 Internal Server Error", "Webpack Compilation Error",
                        // Set 2 (Duplicate for Loop)
                        "Zero Configuração", "Erros de Preview", "Suporte a 50+ Linguagens", "Erros 3000",
                        "Privacidade Total", "CORS Policy Blocked", "Explicações Didáticas", "Undefined is not a function",
                        "Segmentation Fault", "Deploy Failed", "500 Internal Server Error", "Webpack Compilation Error"
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-4 text-2xl font-bold text-zinc-600 shrink-0">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                            {item}
                        </div>
                    ))}
                </div>
            </div>


            {/* COPY-PASTE RESOLVE SECTION */}
            <section className="py-32 px-6 relative z-10">
                <div className="max-w-4xl mx-auto text-center space-y-20">
                    <div>
                        <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-8">
                            Seja &quot;Lasy&quot; ou &quot;Lovable&quot;. <br />
                            <span className="text-zinc-500">Só não perca tempo.</span>
                        </h2>
                        <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
                            Copie o erro. Cole na ferramenta. Volte a codar.
                            Sem ler documentação gigante, sem stack overflow, sem estresse.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        <FeatureCard
                            icon={<Clock className="w-6 h-6 text-orange-400" />}
                            title="Economize Horas"
                            desc="O que levaria uma manhã de debug, a IA resolve em segundos."
                        />
                        <FeatureCard
                            icon={<Shield className="w-6 h-6 text-emerald-400" />}
                            title="Saia da Fila do Suporte"
                            desc="Não trave seu progresso esperando respostas. Receba diagnósticos precisos e solucione bugs em segundos."
                        />
                        <FeatureCard
                            icon={<Code2 className="w-6 h-6 text-cyan-400" />}
                            title="Explica o Porquê"
                            desc="Além de corrigir, você aprende o que causou o erro."
                        />
                    </div>
                </div>
            </section>


            {/* FINAL CTA - MEGA CARD */}
            <section id="pricing-card" className="pb-32 px-6 relative z-10">
                <div className="max-w-5xl mx-auto">
                    <div className="relative rounded-[3rem] overflow-hidden bg-black border border-emerald-500/20 p-12 md:p-24 text-center">
                        {/* Pricing Background Animation */}
                        <div className="absolute inset-0 z-0">
                            <EtheralShadow
                                color="rgba(16, 185, 129, 0.4)"
                                animation={{ scale: 80, speed: 60 }}
                                noise={{ opacity: 0.2, scale: 1 }}
                            />
                        </div>

                        <div className="relative z-10 space-y-8">
                            <h2 className="text-5xl md:text-7xl font-black text-white tracking-tight">
                                Comece agora.
                            </h2>
                            <p className="text-2xl text-emerald-100/60 max-w-lg mx-auto">
                                700 créditos mensais. <br />
                                Cancele quando quiser.
                            </p>

                            <div className="pt-8">
                                <button
                                    onClick={() => window.open(CHECKOUT_URL)}
                                    className="px-12 py-6 bg-white text-black text-xl font-bold rounded-full hover:scale-105 transition-transform shadow-2xl hover:shadow-white/20"
                                >
                                    Assinar por R$ 29,90 <span className="opacity-50 text-sm ml-2">/mês</span>
                                </button>
                                <p className="mt-6 text-sm text-zinc-500">
                                    Garantia de 7 dias ou seu dinheiro de volta.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* TESTIMONIALS SECTION */}
            <TestimonialsSection />

            {/* Footer Simple */}
            <footer className="py-12 text-center text-zinc-600 text-sm">
                <p>&copy; 2024 Assistant Hub. Feito por devs, para devs.</p>
            </footer>

        </div>
    );
};

const FeatureCard = ({ icon, title, desc }) => (
    <div className="p-8 rounded-[2rem] bg-zinc-900/50 border border-white/5 text-left hover:bg-zinc-900 transition-colors">
        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6">
            {icon}
        </div>
        <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
        <p className="text-zinc-400">{desc}</p>
    </div>
);

export default LandingPageV2;
