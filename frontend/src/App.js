import { useEffect, useState } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, useNavigate, Link, Navigate } from "react-router-dom";
import api from "@/lib/api";
import { Zap, Star, Bookmark, Sparkles, LayoutDashboard, Settings, LogOut, Wand2, FileCode } from "lucide-react";
import { motion } from "framer-motion";
import NeuralBackground from "@/components/NeuralBackground";
import ErrorLogInput from "@/components/ErrorLogInput";
import DiagnosticResult from "@/components/DiagnosticResult";
import UserProfile from "@/components/UserProfile";
import SettingsScreen from "@/components/Settings";
import RuixenMoonChat from "@/components/ui/ruixen-moon-chat";
// DesignLab import removed
import { ScriptLibrary } from "@/components/scripts";
import { AdminLayout, AdminDashboard, AdminUsers, AdminCredits, AdminUsageLogs, AdminScripts } from "@/components/admin";
import Layout from "@/components/Layout";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { Meteors } from "@/components/ui/meteors";
import { AiLoader } from "@/components/ui/ai-loader";
import { cn } from "@/lib/utils";
import LandingPage from "@/components/LandingPage";
import Login from "@/components/auth/Login";
import Register from "@/components/auth/Register";
import { supabase } from "@/lib/supabaseClient";

// Backend URL is handled in api.js now

// MetricCard Component - Compact for mobile
const MetricCard = ({ icon: Icon, title, value, subtitle, colorClass, glowClass }) => {
  return (
    <div
      data-testid={`metric-card-${title.toLowerCase().replace(/\s+/g, '-')}`}
      className={`relative rounded-xl sm:rounded-2xl p-3 sm:p-5 ${colorClass} ${glowClass} transition-all duration-300 hover:scale-105`}
    >
      <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
        <span className="text-xs sm:text-sm font-medium text-white/90">{title}</span>
      </div>
      <div className="flex items-end justify-between">
        <span className="text-2xl sm:text-4xl font-bold text-white">{value}</span>
        <span className="text-[10px] sm:text-sm text-white/60">{subtitle}</span>
      </div>
    </div>
  );
};

// ToolCard Component
const ToolCard = ({ tool, onOpen }) => {
  const getIconComponent = (iconName) => {
    switch (iconName) {
      case 'wand':
        return Sparkles;
      case 'star':
        return Star;
      case 'code':
        return FileCode;
      default:
        return Sparkles;
    }
  };

  const getColorClasses = (color) => {
    switch (color) {
      case 'purple':
        return {
          card: 'bg-gradient-to-br from-purple-900/80 to-purple-950/90 border border-purple-500/30',
          glow: 'shadow-[0_0_30px_rgba(168,85,247,0.15)]',
          icon: 'bg-gradient-to-br from-purple-500 to-purple-700',
          text: 'text-purple-400'
        };
      case 'red':
        return {
          card: 'bg-gradient-to-br from-red-900/80 to-red-950/90 border border-red-500/30',
          glow: 'shadow-[0_0_30px_rgba(239,68,68,0.15)]',
          icon: 'bg-gradient-to-br from-red-500 to-red-700',
          text: 'text-red-400'
        };
      case 'blue':
        return {
          card: 'bg-gradient-to-br from-blue-900/80 to-blue-950/90 border border-blue-500/30',
          glow: 'shadow-[0_0_30px_rgba(59,130,246,0.15)]',
          icon: 'bg-gradient-to-br from-blue-500 to-blue-700',
          text: 'text-blue-400'
        };
      case 'emerald':
        return {
          card: 'bg-gradient-to-br from-emerald-900/80 to-emerald-950/90 border border-emerald-500/30',
          glow: 'shadow-[0_0_30px_rgba(16,185,129,0.15)]',
          icon: 'bg-gradient-to-br from-emerald-500 to-emerald-700',
          text: 'text-emerald-400'
        };
      default:
        return {
          card: 'bg-gradient-to-br from-gray-900/80 to-gray-950/90 border border-gray-500/30',
          glow: 'shadow-[0_0_30px_rgba(156,163,175,0.15)]',
          icon: 'bg-gradient-to-br from-gray-500 to-gray-700',
          text: 'text-gray-400'
        };
    }
  };

  const Icon = getIconComponent(tool.icon);
  const colors = getColorClasses(tool.color);

  return (
    <div className="w-full relative">
      {/* Gradient glow background for all tools */}
      <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-blue-500 to-teal-500 transform scale-[0.80] rounded-full blur-3xl" />
      <div
        data-testid={`tool-card-${tool.id}`}
        className="relative rounded-2xl p-5 overflow-hidden bg-gray-900 border border-gray-800 shadow-xl transition-all duration-300 hover:scale-[1.02]"
      >
        <div className="flex items-start gap-4 relative z-10">
          <div className="p-3 rounded-xl border border-gray-500">
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-white relative z-50">{tool.name}</h3>
              {tool.available ? (
                <span className="px-3 py-1 text-xs font-medium bg-green-500 text-white rounded-full">
                  Disponível
                </span>
              ) : (
                <span className="px-3 py-1 text-xs font-medium bg-yellow-500 text-white rounded-full">
                  Em Breve
                </span>
              )}
            </div>
            <p className="text-sm text-white/60 mb-4 leading-relaxed relative z-50">
              {tool.description}
            </p>
            <button
              data-testid={`open-tool-${tool.id}`}
              onClick={() => tool.available && onOpen(tool.id)}
              disabled={!tool.available}
              className={`px-4 py-2 font-medium rounded-lg text-sm transition-colors relative z-50 ${tool.available ? 'border border-gray-500 text-gray-300 hover:bg-gray-800' : 'border border-gray-500 text-gray-300 cursor-not-allowed'}`}
            >
              {tool.available ? 'Explorar' : 'Em Breve'}
            </button>
          </div>
        </div>
        {/* Meteor effect for all tools */}
        <Meteors number={20} />
      </div>
    </div>
  );
};

// Logo Component
// Logo Component
const Logo = () => {
  return (
    <Link
      to="/"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <img src="/logo-hub.png" alt="Logo" className="h-8 w-8 flex-shrink-0 rounded-lg" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium text-white whitespace-pre"
      >
        AI Assistant Hub
      </motion.span>
    </Link>
  );
};

const LogoIcon = () => {
  return (
    <Link
      to="/"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <img src="/logo-hub.png" alt="Logo" className="h-8 w-8 flex-shrink-0 rounded-lg" />
    </Link>
  );
};

// Dashboard Content Component
const DashboardContent = ({ metrics, tools, user, onOpenTool }) => {
  return (
    <div className="flex flex-1">
      <div className="p-2 md:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-4 flex-1 w-full h-full overflow-y-auto">
        {/* Title Section */}
        <div className="mb-6">
          <h1 data-testid="dashboard-title" className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white mb-2">
            AI Assistant Dashboard
          </h1>
          {user && (
            <>
              <p data-testid="welcome-message" className="text-lg text-neutral-700 dark:text-white/90 mb-1">
                Bem-vindo, {user.name}
              </p>
              <p className="text-neutral-500 dark:text-white/50">
                Escolha uma ferramenta para turbinar seu fluxo.
              </p>
            </>
          )}
        </div>

        {/* Key Metrics Section */}
        <section className="mb-6">
          <h2 data-testid="metrics-title" className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
            Métricas Chave
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
            <MetricCard
              icon={Zap}
              title="Correções"
              value={metrics?.corrections || 0}
              subtitle="One-Shot"
              colorClass="bg-gradient-to-br from-purple-900/60 to-purple-950/80 border border-purple-500/20"
              glowClass="shadow-[0_0_40px_rgba(168,85,247,0.15)]"
            />
            <MetricCard
              icon={Star}
              title="Designs"
              value={metrics?.designs || 0}
              subtitle="Criados"
              colorClass="bg-gradient-to-br from-red-900/60 to-red-950/80 border border-red-500/20"
              glowClass="shadow-[0_0_40px_rgba(239,68,68,0.15)]"
            />
            <MetricCard
              icon={Bookmark}
              title="Salvos"
              value={metrics?.saved || 0}
              subtitle="Histórico"
              colorClass="bg-gradient-to-br from-teal-900/60 to-teal-950/80 border border-teal-500/20"
              glowClass="shadow-[0_0_40px_rgba(20,184,166,0.15)]"
            />
          </div>
        </section>

        {/* Available Tools Section */}
        <section>
          <h2 data-testid="tools-title" className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
            Ferramentas Disponíveis
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {tools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} onOpen={onOpenTool} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

// Dashboard Page Component (data fetching wrapper)
const DashboardPage = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState({
    corrections: 12,
    designs: 5,
    saved: 8
  });
  const [user, setUser] = useState({
    name: "Rodzigor",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rodzigor",
    email: "rodzigor@gmail.com"
  });
  const [tools, setTools] = useState([
    {
      id: 'tool-1',
      name: 'One Shot Fixes',
      description: 'Corrija erros de código instantaneamente com análise de IA avançada.',
      icon: 'wand',
      color: 'purple',
      available: true
    },
    // Tool 2 removed
    {
      id: 'tool-3',
      name: 'Scripts Premium',
      description: 'Automatize tarefas complexas com nossa biblioteca de scripts verificados.',
      icon: 'code',
      color: 'emerald',
      available: true
    }
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [metricsRes, userRes, toolsRes] = await Promise.all([
          api.get('/dashboard/metrics'),
          api.get('/dashboard/user'),
          api.get('/dashboard/tools')
        ]);

        if (metricsRes.data) setMetrics(metricsRes.data);
        if (userRes.data) setUser(userRes.data);
        if (toolsRes.data) {
          setTools(toolsRes.data.map(tool => tool.name === 'Scripts Premium' ? { ...tool, available: true } : tool));
        }
      } catch (e) {
        // Only show "backend not available" if it's a network error, not a 429/500/etc
        if (!e.response && e.request) {
          console.warn("Backend not available, using mock data:", e);
        } else {
          console.warn("Backend returned error, using mock data:", e.response?.status, e.response?.data);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleOpenTool = (toolId) => {
    const tool = tools.find(t => t.id === toolId);
    if (toolId === 'tool-1' || tool?.name === 'One Shot Fixes') {
      navigate('/correcoes');
    } else if (toolId === 'tool-3' || tool?.name === 'Scripts Premium') {
      navigate('/scripts');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  return (
    <DashboardContent
      metrics={metrics}
      tools={tools}
      user={user}
      onOpenTool={handleOpenTool}
    />
  );
};


const CorrecoesPage = () => {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState('input'); // 'input', 'loading', or 'result'
  const [analysisResult, setAnalysisResult] = useState(null);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState('Lendo log de erro...');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userRes = await api.get('/dashboard/user');
        setUser(userRes.data);
      } catch (e) {
        console.error("Error fetching user:", e);
      }
    };
    fetchUser();
  }, []);

  // Effect to cycle through loading statuses
  useEffect(() => {
    if (currentView === 'loading') {
      const statuses = [
        'Lendo...',
        'Identificando...',
        'Analisando...',
        'Consultando...',
        'Gerando...',
        'Escrevendo...'
      ];
      let currentIndex = 0;

      const interval = setInterval(() => {
        currentIndex = (currentIndex + 1) % statuses.length;
        setLoadingStatus(statuses[currentIndex]);
      }, 2500); // Change text every 2.5 seconds

      return () => clearInterval(interval);
    }
  }, [currentView]);

  const handleGenerate = async (data) => {
    setCurrentView('loading');
    setError(null);
    setLoadingStatus('Lendo...'); // Reset status

    try {
      console.log('[OneShotFix] Enviando log de erro para análise...');
      console.log('[OneShotFix] Tags:', data.tags);

      const response = await api.post('/analyze-error', {
        error_log: data.errorLog,
        tags: data.tags
      });

      console.log('[OneShotFix] Análise concluída com sucesso:', response.data);
      setAnalysisResult(response.data);
      setCurrentView('result');
    } catch (e) {
      console.error("Error analyzing:", e);

      // Detailed error handling
      if (e.code === 'ECONNABORTED') {
        console.error('[OneShotFix] Timeout: A requisição demorou mais de 60 segundos');
        setError('A análise está demorando muito. Por favor, tente novamente com um log menor.');
      } else if (e.response) {
        console.error('[OneShotFix] Erro do servidor:', e.response.status, e.response.data);
        const serverMsg = e.response.data?.error || e.response.data?.detail || e.response.data?.message;
        const isQuotaError = e.response.data?.isQuotaError;

        if (e.response.status === 429) {
          if (isQuotaError) {
            setError('⚠️ Cota da API Gemini excedida. Verifique seu plano no Google Cloud Console ou aguarde alguns minutos. O backend está funcionando, mas a API de IA atingiu o limite.');
          } else {
            setError('O sistema está sobrecarregado (Muitas requisições). Tente novamente em alguns segundos.');
          }
        } else if (e.response.status === 503) {
          setError('Serviço temporariamente indisponível. Tente novamente em alguns segundos.');
        } else {
          setError(serverMsg || `Erro do servidor: ${e.response.status}`);
        }
      } else if (e.request) {
        // Request was made but no response received - backend might be down
        console.error('[OneShotFix] Sem resposta do servidor:', e.message);
        setError('❌ Backend não disponível. Verifique se o servidor está rodando e se as variáveis de ambiente estão configuradas corretamente.');
      } else {
        console.error('[OneShotFix] Erro desconhecido:', e.message);
        setError(`Erro de conexão: ${e.message}`);
      }

      setCurrentView('input');
    }
  };

  const handleNewAnalysis = () => {
    setAnalysisResult(null);
    setError(null);
    setCurrentView('input');
  };

  const handleBack = () => {
    if (currentView === 'result') {
      setCurrentView('input');
    } else {
      navigate('/dashboard');
    }
  };

  const handleOpenProfile = () => {
    navigate('/perfil');
  };

  if (currentView === 'loading') {
    return (
      <AiLoader text={loadingStatus} size={250} />
    );
  }

  if (currentView === 'result' && analysisResult) {
    return (
      <DiagnosticResult
        analysisResult={analysisResult}
        onNewAnalysis={handleNewAnalysis}
        onBack={handleBack}
        user={user}
        onOpenProfile={handleOpenProfile}
      />
    );
  }

  return (
    <ErrorLogInput
      onGenerate={handleGenerate}
      onBack={handleBack}
      user={user}
      onOpenProfile={handleOpenProfile}
      error={error}
    />
  );
};

// Profile Page
const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userRes = await api.get('/dashboard/user');
        setUser(userRes.data);
      } catch (e) {
        console.error("Error fetching user:", e);
      }
    };
    fetchUser();
  }, []);

  const handleBack = () => {
    navigate('/dashboard');
  };

  const handleLogout = () => {
    // Implement logout logic
    alert('Você saiu da conta com sucesso!');
    navigate('/');
  };

  return (
    <UserProfile
      user={user}
      onBack={handleBack}
      onLogout={handleLogout}
    />
  );
};

const SettingsPage = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/dashboard');
  };

  return (
    <SettingsScreen
      onBack={handleBack}
    />
  );
};

// DesignLabPage component removed



const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0a0a0f]">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <div className="App dark">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Layout>
                <DashboardPage />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/correcoes" element={
            <ProtectedRoute>
              <Layout>
                <CorrecoesPage />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/perfil" element={
            <ProtectedRoute>
              <Layout>
                <ProfilePage />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <Layout>
                <SettingsPage />
              </Layout>
            </ProtectedRoute>
          } />
          {/* DesignLab Route Removed */}
          <Route path="/scripts" element={
            <ProtectedRoute>
              <Layout>
                <ScriptLibrary />
              </Layout>
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminUsers />
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/credits" element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminCredits />
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/usage-logs" element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminUsageLogs />
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/scripts" element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminScripts />
              </AdminLayout>
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
