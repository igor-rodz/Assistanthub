import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

const CHECKOUT_URL = 'https://pay.perfectpay.com.br/PMW/SEU_LINK_AQUI'; // 👈 Altere para seu link

const FinalCTASection = () => {
    const handleCheckout = () => {
        window.open(CHECKOUT_URL, '_blank');
    };

    return (
        <section className="relative py-32 px-6 bg-gradient-to-b from-black to-zinc-950 overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-emerald-500/10 rounded-full blur-[150px]" />
            </div>

            <div className="max-w-4xl mx-auto relative z-10 text-center">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-8">
                    <Sparkles className="w-4 h-4" />
                    <span>Mais de 1.000+ devs já usam</span>
                </div>

                {/* Headline */}
                <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                    Pare de perder tempo com bugs.
                    <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                        Comece a entregar.
                    </span>
                </h2>

                <p className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto">
                    Junte-se a milhares de devs que já economizam horas toda semana
                    com correções instantâneas de IA.
                </p>

                {/* CTA Button */}
                <button
                    onClick={handleCheckout}
                    className="group inline-flex items-center gap-3 py-4 px-8 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-bold text-lg hover:from-emerald-400 hover:to-cyan-400 transition-all duration-300 transform hover:scale-105 active:scale-95"
                >
                    Começar por R$ 29,90/mês
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                {/* Trust note */}
                <p className="mt-6 text-sm text-zinc-500">
                    Garantia de 7 dias • Cancele quando quiser • Pagamento seguro
                </p>
            </div>
        </section>
    );
};

export default FinalCTASection;
