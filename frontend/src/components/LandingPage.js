import React from 'react';
import { useNavigate } from 'react-router-dom';
import AnimatedShaderHero from './ui/animated-shader-hero';

const LandingPage = () => {
    const navigate = useNavigate();

    const handleGetStarted = () => {
        navigate('/login');
    };

    const handleExplore = () => {
        // Scroll to features or navigate to another page
        console.log("Exploring features...");
    };

    return (
        <div className="min-h-screen bg-black pointer-events-auto">
            <AnimatedShaderHero
                trustBadge={{
                    text: "Potencializado por IA Avançada",
                    icons: ["✨", "🤖", "🚀"]
                }}
                headline={{
                    line1: "Revolucione seu",
                    line2: "Fluxo de Trabalho"
                }}
                subtitle="Aumente sua produtividade com automação inteligente e integrações construídas para a próxima geração de desenvolvedores."
                buttons={{
                    primary: {
                        text: "Começar Agora",
                        onClick: handleGetStarted
                    },
                    secondary: {
                        text: "Saiba Mais",
                        onClick: handleExplore
                    }
                }}
            />
        </div>
    );
};

export default LandingPage;
