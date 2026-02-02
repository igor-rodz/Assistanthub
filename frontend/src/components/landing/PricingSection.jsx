import React from 'react';
import { Check, Sparkles, Shield, Zap } from 'lucide-react';

const CHECKOUT_URL = 'https://pay.perfectpay.com.br/PMW/SEU_LINK_AQUI'; // 👈 Altere para seu link

const PricingSection = () => {
    const features = [
        '1.000 créditos por mês',
        'Acesso total ao One-Shot Fixes',
        'Scripts Premium ilimitados',
        'Suporte prioritário',
        'Atualizações antecipadas',
        'Garantia de 7 dias',
    ];

    const handleCheckout = () => {
        window.open(CHECKOUT_URL, '_blank');
    };

    return (
        <section id="pricing" className="relative py-24 px-6 bg-gradient-to-b from-black via-zinc-950 to-black overflow-hidden">
            {/* Background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[150px]" />

            <div className="max-w-lg mx-auto relative z-10">
                {/* Header */}
                <div className="text-center mb-12">
                    <span className="inline-block px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-6">
                        Plano Único
                    </span>
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Acesso Total
                    </h2>
                    <p className="text-lg text-zinc-400">
                        Tudo que você precisa. Sem planos confusos.
                    </p>
                </div>

                {/* Pricing card */}
                <div className="relative group">
                    {/* Glow effect */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/30 via-cyan-500/30 to-emerald-500/30 rounded-3xl blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className="relative p-8 rounded-3xl bg-zinc-900 border border-emerald-500/30 overflow-hidden">
                        {/* Popular badge */}
                        <div className="absolute top-0 right-0 px-4 py-1 bg-emerald-500 text-black text-xs font-bold rounded-bl-xl">
                            MAIS POPULAR
                        </div>

                        {/* Price */}
                        <div className="text-center mb-8">
                            <div className="flex items-baseline justify-center gap-1">
                                <span className="text-2xl text-zinc-400">R$</span>
                                <span className="text-6xl font-bold text-white">29</span>
                                <span className="text-2xl text-zinc-400">,90</span>
                            </div>
                            <span className="text-zinc-500">/mês</span>
                        </div>

                        {/* Features */}
                        <ul className="space-y-4 mb-8">
                            {features.map((feature, index) => (
                                <li key={index} className="flex items-center gap-3 text-zinc-300">
                                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                        <Check className="w-3 h-3 text-emerald-400" />
                                    </div>
                                    {feature}
                                </li>
                            ))}
                        </ul>

                        {/* CTA Button */}
                        <button
                            onClick={handleCheckout}
                            className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-bold text-lg hover:from-emerald-400 hover:to-cyan-400 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            <Zap className="w-5 h-5" />
                            Começar Agora
                        </button>

                        {/* Trust badges */}
                        <div className="flex items-center justify-center gap-4 mt-6 text-xs text-zinc-500">
                            <div className="flex items-center gap-1">
                                <Shield className="w-4 h-4" />
                                <span>Pagamento Seguro</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Sparkles className="w-4 h-4" />
                                <span>Cancele quando quiser</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PricingSection;
