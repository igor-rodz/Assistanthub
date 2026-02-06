import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TermsPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-black text-white p-6 md:p-12 font-sans">
            <div className="max-w-3xl mx-auto">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-zinc-400 hover:text-white mb-8 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> Voltar
                </button>

                <h1 className="text-4xl font-bold mb-8 text-emerald-400">Termos de Uso</h1>

                <div className="space-y-6 text-zinc-300 leading-relaxed">
                    <p>Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">1. Aceitação</h2>
                        <p>Ao acessar e usar o Assistant Hub, você concorda com estes termos. Se não concordar, não use o serviço.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">2. O Serviço</h2>
                        <p>Fornecemos ferramentas baseadas em IA para análise de código e geração de correções. O serviço é fornecido "como está".</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">3. Uso Aceitável</h2>
                        <p>Você concorda em não usar o serviço para fins ilegais ou para gerar código malicioso.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">4. Pagamentos e Reembolsos</h2>
                        <p>Os pagamentos são processados via Perfect Pay. Oferecemos garantia de 7 dias conforme o CDC.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">5. Limitação de Responsabilidade</h2>
                        <p>Não nos responsabilizamos por perdas decorrentes do uso das correções sugeridas pela IA. Sempre revise o código antes de usar em produção.</p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default TermsPage;
