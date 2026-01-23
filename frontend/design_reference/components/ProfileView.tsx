
import React from 'react';
import { Camera, Zap, Clock, Award } from 'lucide-react';

const ProfileView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="glass-panel p-10 rounded-[2.5rem] relative overflow-hidden group">
        {/* Glow effect */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        
        <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
          <div className="relative">
            <div className="w-32 h-32 rounded-full border-2 border-purple-500/30 p-1">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-900/40 to-blue-900/40 flex items-center justify-center overflow-hidden">
                <img src="https://picsum.photos/seed/rodzigor/200" alt="Avatar" className="w-full h-full object-cover opacity-80" />
              </div>
            </div>
            <button className="absolute bottom-0 right-0 p-2 bg-zinc-800 rounded-full border border-white/10 hover:bg-zinc-700 transition-colors">
              <Camera size={16} className="text-white/70" />
            </button>
          </div>
          
          <div className="text-center md:text-left">
            <h2 className="text-4xl font-bold mb-1">Rodzigor</h2>
            <p className="text-white/40 font-medium">Membro desde Outubro 2023</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <StatCard 
            icon={<Zap className="text-purple-400" size={24} />} 
            value="127" 
            label="Análises" 
            color="purple" 
          />
          <StatCard 
            icon={<Clock className="text-purple-400" size={24} />} 
            value="45" 
            label="Prompts Salvos" 
            color="purple" 
          />
          <StatCard 
            icon={<Award className="text-blue-400" size={24} />} 
            value="15.420" 
            label="Tokens Usados" 
            color="blue" 
          />
        </div>

        {/* Form Fields */}
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-white/40 text-sm font-medium ml-1">Nome Completo</label>
            <input 
              type="text" 
              defaultValue="Rodzigor" 
              className="w-full px-5 py-4 rounded-2xl glass-panel focus:ring-1 focus:ring-purple-500/50 transition-all" 
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-white/40 text-sm font-medium ml-1">Email</label>
            <input 
              type="email" 
              defaultValue="rodzigor@ermail.com" 
              className="w-full px-5 py-4 rounded-2xl glass-panel focus:ring-1 focus:ring-purple-500/50 transition-all" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-white/40 text-sm font-medium ml-1">Idioma Preferido</label>
            <div className="relative">
              <select className="w-full px-5 py-4 rounded-2xl glass-panel appearance-none focus:ring-1 focus:ring-purple-500/50 transition-all cursor-pointer">
                <option>Português (Brasil)</option>
                <option>English (US)</option>
                <option>Español</option>
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-white/30">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  color: 'purple' | 'blue';
}

const StatCard: React.FC<StatCardProps> = ({ icon, value, label, color }) => {
  const borderColor = color === 'purple' ? 'border-purple-500/30' : 'border-blue-500/30';
  const shadowColor = color === 'purple' ? 'shadow-[0_0_20px_rgba(168,85,247,0.15)]' : 'shadow-[0_0_20px_rgba(59,130,246,0.15)]';
  
  return (
    <div className={`p-6 rounded-3xl border ${borderColor} glass-panel flex items-center gap-5 ${shadowColor} hover:scale-[1.02] transition-transform cursor-default`}>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-white/5`}>
        {icon}
      </div>
      <div>
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        <div className="text-white/40 text-sm font-medium">{label}</div>
      </div>
    </div>
  );
};

export default ProfileView;
