import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Sparkles, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { EtheralShadow } from '@/components/ui/etheral-shadow';
import TestimonialsSection from '@/components/ui/TestimonialsSection';
import { GlowCard } from '@/components/ui/GlowCard';

const CHECKOUT_URL = 'https://go.perfectpay.com.br/PPU38CQ71PE';

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
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[80px] md:blur-[150px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-cyan-500/10 rounded-full blur-[80px] md:blur-[150px]" />
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
                        onClick={() => navigate('/register')}
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


            {/* DEMO SHOWCASE - GIF */}
            <div id="demo" className="relative z-20 pb-32">
                <motion.div
                    style={{ y: demoY }}
                    className="max-w-5xl mx-auto px-6"
                >
                    {/* Section Label */}
                    <div className="text-center mb-10">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-zinc-400 text-sm font-medium mb-6"
                        >
                            <Play className="w-4 h-4 text-emerald-400" />
                            Veja funcionando
                        </motion.div>
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white">
                            Cole o erro. <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Receba a correção.</span>
                        </h2>
                    </div>

                    {/* GIF Container */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                        className="relative group"
                    >
                        {/* Glow Behind */}
                        <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/20 via-cyan-500/10 to-emerald-500/20 rounded-[3rem] blur-[60px] opacity-50 group-hover:opacity-80 transition-opacity duration-700 pointer-events-none" />

                        {/* Browser Window */}
                        <div className="relative rounded-[2rem] bg-zinc-900 overflow-hidden border border-white/10 shadow-2xl shadow-black/50 transition-all duration-700 hover:border-emerald-500/20 hover:shadow-emerald-900/20">
                            {/* Browser Chrome */}
                            <div className="flex items-center gap-4 px-6 py-4 border-b border-white/5 bg-white/5 backdrop-blur-md">
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500/50" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                                    <div className="w-3 h-3 rounded-full bg-green-500/50" />
                                </div>
                                <div className="flex-1 text-center">
                                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/30 text-xs text-zinc-500 font-mono">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        assistanthub.ai — One-Shot Fixes
                                    </div>
                                </div>
                                <div className="w-12" />
                            </div>

                            {/* GIF Content */}
                            <div className="relative">
                                <img
                                    src="/demo-oneshot.gif"
                                    alt="Demonstração do One-Shot Fixes - Cole um erro e receba a correção instantânea"
                                    className="w-full h-auto block"
                                    loading="lazy"
                                />
                            </div>
                        </div>
                    </motion.div>
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

                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<img src="/img/icon-clock.png" alt="Relógio 24h" className="w-16 h-16 object-contain" />}
                            title="Economize Horas"
                            desc="O que levaria uma manhã de debug, a IA resolve em segundos. Foco no que importa."
                        />
                        <FeatureCard
                            icon={<img src="/img/icon-support.png" alt="Suporte" className="w-16 h-16 object-contain" />}
                            title="Saia da Fila do Suporte"
                            desc="Não trave seu progresso esperando respostas. Receba diagnósticos precisos e solucione bugs em segundos."
                        />
                        <FeatureCard
                            icon={<img src="/img/icon-code.png" alt="Código" className="w-16 h-16 object-contain" />}
                            title="Explica o Porquê"
                            desc="Além de sugerir a correção, você aprende o que causou o erro com explicações didáticas."
                        />
                    </div>
                </div>
            </section>


            {/* FINAL CTA - MEGA CARD */}
            <section id="pricing-card" className="pb-12 px-6 relative z-10">
                <div className="max-w-4xl mx-auto">
                    <div className="relative rounded-[2.5rem] overflow-hidden bg-black border border-emerald-500/20 p-8 md:p-16 text-center">
                        {/* Pricing Background Animation */}
                        <div className="absolute inset-0 z-0">
                            <EtheralShadow
                                color="rgba(16, 185, 129, 0.4)"
                                animation={{ scale: 80, speed: 60 }}
                                noise={{ opacity: 0.2, scale: 1 }}
                            />
                        </div>

                        <div className="relative z-10 space-y-6">
                            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                                Comece agora.
                            </h2>
                            <p className="text-xl text-emerald-100/60 max-w-lg mx-auto">
                                700 créditos mensais. Cancele quando quiser.
                            </p>

                            <div className="flex flex-col items-center gap-1 pt-2">
                                <span className="text-zinc-500 line-through text-base">R$ 59,90</span>
                                <div className="text-4xl md:text-5xl font-black text-white tracking-tighter">
                                    R$ 39,90<span className="text-lg text-zinc-500 font-medium ml-2">/mês</span>
                                </div>
                                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider mt-1">
                                    Oferta de Lançamento
                                </span>
                            </div>

                            <div className="pt-6">
                                <button
                                    onClick={() => navigate('/register')}
                                    className="px-10 py-5 bg-white text-black text-lg font-bold rounded-full hover:scale-105 transition-transform shadow-2xl hover:shadow-white/20"
                                >
                                    Criar Conta e Assinar
                                </button>
                                <p className="mt-4 text-xs text-zinc-500">
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
            <footer className="py-12 flex flex-col items-center justify-center gap-4 text-zinc-600 text-sm">
                <div className="flex gap-6">
                    <button onClick={() => navigate('/terms')} className="hover:text-emerald-400 transition-colors">Termos de Uso</button>
                    <button onClick={() => navigate('/privacy')} className="hover:text-emerald-400 transition-colors">Privacidade</button>
                </div>
                <p>&copy; 2024 Assistant Hub. Feito por devs, para devs.</p>
            </footer>

        </div>
    );
};

const FeatureCard = ({ icon, title, desc }) => (
    <GlowCard className="text-left h-full flex flex-col items-start">
        <div className="mb-8 min-h-[64px] flex items-center justify-start">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
        <p className="text-zinc-400 leading-relaxed text-sm md:text-base">{desc}</p>
    </GlowCard>
);

export default LandingPageV2;
