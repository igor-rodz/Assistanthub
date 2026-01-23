
import React from 'react';
import { CreditCard, CheckCircle, Calendar, Zap, Crown } from 'lucide-react';

const SubscriptionView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Current Subscription Card */}
      <div className="glass-panel p-8 rounded-3xl relative overflow-hidden group">
        <div className="flex items-start justify-between mb-8">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-xl glass-panel flex items-center justify-center text-white/60">
              <CreditCard size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold">Status da Assinatura</h3>
              <p className="text-white/40 text-sm">Gerencie sua assinatura e veja detalhes do plano atual</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-semibold neon-blue">
            <CheckCircle size={14} />
            Ativo
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex justify-between items-center py-2 border-b border-white/5">
            <span className="text-white/50">Plano Atual:</span>
            <span className="font-bold text-lg">Starter</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-white/5">
            <span className="text-white/50">Valor:</span>
            <span className="font-bold text-lg">Gratuito</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-white/50">Próxima cobrança:</span>
            <div className="flex items-center gap-2 font-semibold">
              <Calendar size={16} className="text-white/40" />
              Renovação mensal
            </div>
          </div>
        </div>

        <button className="w-full mt-8 py-4 rounded-2xl glass-panel hover:bg-white/5 text-white/60 hover:text-white transition-all font-semibold">
          Cancelar Plano
        </button>
      </div>

      {/* Upgrade Section */}
      <div className="space-y-6">
        <h3 className="text-sm font-bold tracking-widest text-white/40 uppercase">Fazer Upgrade</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Builder Plan */}
          <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-blue-800 relative group cursor-pointer hover:scale-[1.02] transition-all">
             <div className="flex items-center gap-4 mb-6">
               <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                 <Zap className="text-white" size={24} />
               </div>
               <div>
                 <h4 className="text-xl font-bold">Builder</h4>
                 <p className="text-white/70 text-sm">1.500 créditos/mês</p>
               </div>
             </div>
             
             <ul className="space-y-4 mb-10 text-white/90 font-medium">
               <li className="flex items-center gap-3">
                 <div className="w-1.5 h-1.5 rounded-full bg-white/50"></div>
                 50 GB de armazenamento
               </li>
               <li className="flex items-center gap-3">
                 <div className="w-1.5 h-1.5 rounded-full bg-white/50"></div>
                 Suporte por e-mail
               </li>
             </ul>

             <button className="w-full py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold transition-all border border-white/10">
               R$ 29/mês
             </button>
          </div>

          {/* Pro Plan */}
          <div className="p-8 rounded-[2.5rem] glass-panel border border-purple-500/50 relative group cursor-pointer hover:scale-[1.02] transition-all overflow-hidden">
             {/* Glow Effect */}
             <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/20 blur-[60px]"></div>
             
             <div className="absolute top-6 right-6 px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-wider neon-purple">
               Popular
             </div>

             <div className="flex items-center gap-4 mb-6">
               <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                 <Crown className="text-purple-400" size={24} />
               </div>
               <div>
                 <h4 className="text-xl font-bold">Pro</h4>
                 <p className="text-white/40 text-sm">5.000 créditos/mês</p>
               </div>
             </div>
             
             <ul className="space-y-4 mb-10 text-white/60 font-medium">
               <li className="flex items-center gap-3">
                 <div className="w-1.5 h-1.5 rounded-full bg-purple-500/50"></div>
                 100 GB de armazenamento
               </li>
               <li className="flex items-center gap-3 text-white/80">
                 <div className="w-1.5 h-1.5 rounded-full bg-purple-500/50"></div>
                 Suporte prioritário
               </li>
               <li className="flex items-center gap-3 text-white/80">
                 <div className="w-1.5 h-1.5 rounded-full bg-purple-500/50"></div>
                 Análises avançadas
               </li>
             </ul>

             <button className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-purple-700 text-white font-bold transition-all shadow-lg shadow-purple-500/20">
               R$ 49/mês
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionView;
