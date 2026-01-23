
import React, { useState } from 'react';
import { 
  User, 
  CreditCard, 
  Coins, 
  LogOut, 
  Settings,
  ChevronRight
} from 'lucide-react';
import { ViewType } from './types';
import ProfileView from './components/ProfileView';
import SubscriptionView from './components/SubscriptionView';
import CreditsView from './components/CreditsView';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewType>(ViewType.PROFILE);

  const renderView = () => {
    switch (activeView) {
      case ViewType.PROFILE:
        return <ProfileView />;
      case ViewType.SUBSCRIPTION:
        return <SubscriptionView />;
      case ViewType.CREDITS:
        return <CreditsView />;
      default:
        return <ProfileView />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#0a0a0c] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 flex flex-col border-r border-white/5 bg-[#0d0d0f] z-10">
        <div className="p-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center font-bold text-xl">
            R
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <NavItem 
            icon={<User size={20} />} 
            label={ViewType.PROFILE} 
            active={activeView === ViewType.PROFILE} 
            onClick={() => setActiveView(ViewType.PROFILE)} 
          />
          <NavItem 
            icon={<CreditCard size={20} />} 
            label={ViewType.SUBSCRIPTION} 
            active={activeView === ViewType.SUBSCRIPTION} 
            onClick={() => setActiveView(ViewType.SUBSCRIPTION)} 
          />
          <NavItem 
            icon={<Coins size={20} />} 
            label={ViewType.CREDITS} 
            active={activeView === ViewType.CREDITS} 
            onClick={() => setActiveView(ViewType.CREDITS)} 
          />
        </nav>

        <div className="p-4 border-t border-white/5 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 text-red-400/80 hover:text-red-400 hover:bg-white/5 rounded-xl transition-all">
            <LogOut size={20} />
            <span className="font-medium">Sair da Conta</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative overflow-y-auto bg-gradient-to-br from-[#0a0a0c] via-[#110d18] to-[#0a0a0c]">
        {/* Decorative background blobs */}
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-blue-600/10 blur-[100px] rounded-full"></div>

        {/* Top Header */}
        <header className="flex justify-between items-center px-12 py-8 relative z-10">
          <h1 className="text-2xl font-bold tracking-tight">
            {activeView === ViewType.CREDITS ? 'Advanced Usage & Credits Dashboard' : ''}
          </h1>
          <button className="p-2 glass-panel rounded-lg text-white/60 hover:text-white transition-colors">
            <Settings size={20} />
          </button>
        </header>

        {/* Content Area */}
        <div className="px-12 pb-12 relative z-10">
          {renderView()}
        </div>
      </main>
    </div>
  );
};

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all group ${
      active 
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

export default App;
