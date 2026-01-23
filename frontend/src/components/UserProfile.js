import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import {
  User,
  CreditCard,
  Coins,
  Settings,
  ChevronRight,
  LogOut,
  ArrowLeft
} from 'lucide-react';
import ProfileView from './profile/ProfileView';
import SubscriptionView from './profile/SubscriptionView';
import CreditsView from './profile/CreditsView';

// API Config is handled in lib/api.js

const UserProfile = ({ user: initialUser, onBack, onLogout }) => {
  const [activeView, setActiveView] = useState('Perfil');
  const [user, setUser] = useState(initialUser || {});
  const [credits, setCredits] = useState({
    plan: 'starter',
    credit_balance: 300,
    monthly_limit: 300,
    credits_used: 0,
    plan_price: 19.90
  });
  const [usageHistory, setUsageHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, creditsRes, usageRes] = await Promise.all([
          api.get('/dashboard/user'),
          api.get('/credits/balance'),
          api.get('/credits/usage')
        ]);
        if (userRes.data) setUser(userRes.data);
        if (creditsRes.data) setCredits(creditsRes.data);
        if (usageRes.data?.usage_history) setUsageHistory(usageRes.data.usage_history);
      } catch (e) {
        console.warn("Backend not available, using default data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleUpgrade = async (newPlan) => {
    try {
      const response = await api.post(`/credits/set-plan?plan=${newPlan}`);
      if (response.data) {
        setCredits(response.data);
      }
    } catch (e) {
      console.error("Error upgrading plan:", e);
    }
  };

  const renderView = () => {
    switch (activeView) {
      case 'Perfil':
        return <ProfileView user={user} />;
      case 'Assinatura':
        return <SubscriptionView credits={credits} onUpgrade={handleUpgrade} />;
      case 'Créditos':
        return <CreditsView credits={credits} usageHistory={usageHistory} />;
      default:
        return <ProfileView user={user} />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#0a0a0c] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 flex flex-col border-r border-white/5 bg-[#0d0d0f] z-10 hidden md:flex">
        <div className="p-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft size={20} />
            <span>Voltar</span>
          </button>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center font-bold text-xl text-white">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'R'}
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <NavItem
            icon={<User size={20} />}
            label="Perfil"
            active={activeView === 'Perfil'}
            onClick={() => setActiveView('Perfil')}
          />
          <NavItem
            icon={<CreditCard size={20} />}
            label="Assinatura"
            active={activeView === 'Assinatura'}
            onClick={() => setActiveView('Assinatura')}
          />
          <NavItem
            icon={<Coins size={20} />}
            label="Créditos"
            active={activeView === 'Créditos'}
            onClick={() => setActiveView('Créditos')}
          />
        </nav>

        <div className="p-4 border-t border-white/5 space-y-2">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-400/80 hover:text-red-400 hover:bg-white/5 rounded-xl transition-all"
          >
            <LogOut size={20} />
            <span className="font-medium">Sair da Conta</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative overflow-y-auto bg-gradient-to-br from-[#0a0a0c] via-[#110d18] to-[#0a0a0c]">
        {/* Decorative background blobs */}
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full point-events-none"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-blue-600/10 blur-[100px] rounded-full point-events-none"></div>

        {/* Mobile Header (Back + Menu) */}
        <div className="md:hidden flex justify-between items-center p-6 border-b border-white/5 relative z-20">
          <button onClick={onBack} className="p-2 text-white/60">
            <ArrowLeft size={24} />
          </button>
          <div className="flex gap-4">
            <button onClick={() => setActiveView('Perfil')} className={`p-2 ${activeView === 'Perfil' ? 'text-purple-400' : 'text-white/40'}`}><User size={24} /></button>
            <button onClick={() => setActiveView('Assinatura')} className={`p-2 ${activeView === 'Assinatura' ? 'text-purple-400' : 'text-white/40'}`}><CreditCard size={24} /></button>
            <button onClick={() => setActiveView('Créditos')} className={`p-2 ${activeView === 'Créditos' ? 'text-purple-400' : 'text-white/40'}`}><Coins size={24} /></button>
          </div>
        </div>

        {/* Top Header */}
        <header className="hidden md:flex justify-between items-center px-12 py-8 relative z-10 text-white">
          <h1 className="text-2xl font-bold tracking-tight">
            {activeView === 'Créditos' ? 'Dashboard de Uso Avançado' : activeView}
          </h1>
          <button className="p-2 glass-panel rounded-lg text-white/60 hover:text-white transition-colors">
            <Settings size={20} />
          </button>
        </header>

        {/* Content Area */}
        <div className="px-4 md:px-12 pb-12 relative z-10 pt-6 md:pt-0">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            renderView()
          )}
        </div>
      </main>
    </div>
  );
};

const NavItem = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all group ${active
      ? 'bg-purple-600/20 text-purple-400 border-l-4 border-purple-500 rounded-l-none'
      : 'text-white/50 hover:text-white hover:bg-white/5'
      }`}
  >
    <div className="flex items-center gap-3">
      <span className={active ? 'text-purple-400' : 'text-inherit'}>{icon}</span>
      <span className="font-medium">{label}</span>
    </div>
    {active && <ChevronRight size={16} />}
  </button>
);

export default UserProfile;
