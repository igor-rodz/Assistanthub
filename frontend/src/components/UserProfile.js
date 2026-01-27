import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../lib/api';
import {
  User,
  CreditCard,
  Coins,
  Settings,
  LogOut,
  ArrowLeft
} from 'lucide-react';
import ProfileView from './profile/ProfileView';
import SubscriptionView from './profile/SubscriptionView';
import CreditsView from './profile/CreditsView';
import { AnimeNavBar } from './ui/anime-navbar';

// API Config is handled in lib/api.js

const UserProfile = ({ user: initialUser, onBack, onLogout }) => {
  const [searchParams] = useSearchParams();
  const [activeView, setActiveView] = useState('Perfil');

  // Sync active view with query params
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'assinatura') setActiveView('Assinatura');
    else if (tab === 'creditos') setActiveView('Créditos');
    else if (tab === 'perfil') setActiveView('Perfil');
  }, [searchParams]);
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

  // Define Navbar Items
  const navItems = [
    { name: 'Voltar', icon: ArrowLeft, url: '#' },
    { name: 'Perfil', icon: User, url: '#' },
    { name: 'Assinatura', icon: CreditCard, url: '#' },
    { name: 'Créditos', icon: Coins, url: '#' },
    { name: 'Sair', icon: LogOut, url: '#' },
  ];

  const handleNavChange = (tab) => {
    if (tab === 'Voltar') {
      if (onBack) onBack();
    } else if (tab === 'Sair') {
      if (onLogout) onLogout();
    } else {
      setActiveView(tab);
    }
  };

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
    <div className="bg-[#0a0a0c] min-h-screen relative">
      {/* Floating Navbar */}
      <AnimeNavBar
        items={navItems}
        active={activeView}
        onTabChange={handleNavChange}
      />

      {/* Decorative background blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full point-events-none z-0"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-blue-600/10 blur-[100px] rounded-full point-events-none z-0"></div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-12 pt-28 pb-24 relative z-10">
        {/* Context Header */}
        <header className="flex justify-between items-center mb-8 text-white">
          <h1 className="text-2xl font-bold tracking-tight">
            {activeView === 'Créditos' ? 'Dashboard de Uso Avançado' : activeView}
          </h1>
          <button className="p-2 glass-panel rounded-lg text-white/60 hover:text-white transition-colors">
            <Settings size={20} />
          </button>
        </header>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          renderView()
        )}
      </main>
    </div>
  );
};

export default UserProfile;
