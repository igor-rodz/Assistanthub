import React from 'react';
import { AlertTriangle, Clock, Zap } from 'lucide-react';

const ProblemSection = () => {
    return (
        <section className="relative py-24 px-6 bg-zinc-950 overflow-hidden">
            <div className="max-w-6xl mx-auto relative z-10">
                {/* Header Copy - Pain Point */}
                <div className="text-center mb-20">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-wider mb-6">
                        <AlertTriangle className="w-3 h-3" />
                        O caos diário
                    </div>

                    <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">
                        Erros 3000 que
                        <br className="hidden md:block" />
                        <span className="text-red-500"> acontecem demais.</span>
                    </h2>

                    <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
                        Stack trace gigante? Erro genérico?
                        <br />
                        <span className="text-white font-medium">Não perca tempo chamando suporte.</span> Corrija agora.
                    </p>
                </div>

                {/* Cards - Rounded & Modern */}
                <div className="grid md:grid-cols-3 gap-8">
                    <ProblemCard
                        icon={<Clock className="w-8 h-8" />}
                        title="Perda de Tempo"
                        desc="Horas pesquisando no Google por um erro que a IA resolve em segundos."
                        color="red"
                    />
                    <ProblemCard
                        icon={<AlertTriangle className="w-8 h-8" />}
                        title="O Código Quebrou"
                        desc="Adicionou uma lib nova e tudo parou? Cole o erro e descubra o conflito na hora."
                        color="orange"
                    />
                    <ProblemCard
                        icon={<Zap className="w-8 h-8" />}
                        title="Deadline Apertado"
                        desc="O chefe tá esperando e o deploy falhou. Resolva rápido e entregue."
                        color="yellow"
                    />
                </div>
            </div>
        </section>
    );
};

const ProblemCard = ({ icon, title, desc, color }) => {
    const colorMap = {
        red: 'text-red-400 bg-red-500/10 group-hover:bg-red-500 group-hover:text-black',
        orange: 'text-orange-400 bg-orange-500/10 group-hover:bg-orange-500 group-hover:text-black',
        yellow: 'text-yellow-400 bg-yellow-500/10 group-hover:bg-yellow-500 group-hover:text-black',
    };

    return (
        <div className="group p-8 rounded-[2.5rem] bg-zinc-900 border border-white/5 hover:border-white/10 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
            <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center ${colorMap[color]} transition-colors duration-500 mb-6`}>
                {icon}
            </div>
            <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">
                {title}
            </h3>
            <p className="text-zinc-400 leading-relaxed">
                {desc}
            </p>
        </div>
    );
};

export default ProblemSection;
