import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PrivacyPage = () => {
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

                <h1 className="text-4xl font-bold mb-8 text-cyan-400">Política de Privacidade</h1>

                <div className="space-y-6 text-zinc-300 leading-relaxed">
                    <p>Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">1. Coleta de Dados</h2>
                        <p>Coletamos seu email (para login) e os logs de erro que você envia para análise. Não vendemos seus dados.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">2. Uso das Informações</h2>
                        <p>Usamos seus dados apenas para fornecer o serviço e melhorar a qualidade das correções.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">3. IA e Terceiros</h2>
                        <p>Os logs anonimizados podem ser processados por provedores de IA (como Google Gemini) para gerar as respostas.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">4. Cookies</h2>
                        <p>Usamos cookies essenciais para manter você logado. Não usamos cookies de rastreamento invasivos.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">5. Contato</h2>
                        <p>Para questões de privacidade, contate: suporte@assistanthub.cloud</p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPage;
