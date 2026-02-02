import React from 'react';
import { useNavigate } from 'react-router-dom';
import AnimatedShaderHero from './ui/animated-shader-hero';

// Landing page sections
import ProblemSection from './landing/ProblemSection';
import HowItWorksSection from './landing/HowItWorksSection';
import DemoSection from './landing/DemoSection';
import BenefitsSection from './landing/BenefitsSection';
import PricingSection from './landing/PricingSection';
import FAQSection from './landing/FAQSection';
import FinalCTASection from './landing/FinalCTASection';

const CHECKOUT_URL = 'https://pay.perfectpay.com.br/PMW/SEU_LINK_AQUI'; // 👈 Altere para seu link

const LandingPage = () => {
    const navigate = useNavigate();

    const handleGetStarted = () => {
        window.open(CHECKOUT_URL, '_blank');
    };

    const handleExplore = () => {
        // Scroll to pricing section
        document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-black pointer-events-auto">
            {/* Hero Section */}
            <AnimatedShaderHero
                trustBadge={{
                    text: "Potencializado por IA Avançada",
                    icons: ["✨", "🤖", "🚀"]
                }}
                headline={{
                    line1: "Corrija erros de código",
                    line2: "em segundos"
                }}
                subtitle="Cole o erro, receba a solução. Nossa IA analisa, explica e corrige automaticamente. Para devs que querem entregar mais e debugar menos."
                buttons={{
                    primary: {
                        text: "Começar por R$ 29,90/mês",
                        onClick: handleGetStarted
                    },
                    secondary: {
                        text: "Como Funciona?",
                        onClick: handleExplore
                    }
                }}
            />

            {/* Conversion Sections */}
            <ProblemSection />
            <HowItWorksSection />
            <DemoSection />
            <BenefitsSection />
            <PricingSection />
            <FAQSection />
            <FinalCTASection />

            {/* Footer */}
            <footer className="py-12 px-6 bg-zinc-950 border-t border-white/5">
                <div className="max-w-6xl mx-auto text-center text-zinc-500 text-sm">
                    <p>© 2024 Assistant Hub. Todos os direitos reservados.</p>
                    <div className="flex items-center justify-center gap-6 mt-4">
                        <a href="#" className="hover:text-white transition-colors">Termos de Uso</a>
                        <a href="#" className="hover:text-white transition-colors">Privacidade</a>
                        <a href="#" className="hover:text-white transition-colors">Contato</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;

