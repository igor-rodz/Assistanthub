import { useEffect, useState } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, useNavigate, Link, Navigate } from "react-router-dom";
import api from "@/lib/api";
import { motion } from "framer-motion";
import ErrorLogInput from "@/components/ErrorLogInput";
import DiagnosticResult from "@/components/DiagnosticResult";
import UserProfile from "@/components/UserProfile";
import SettingsScreen from "@/components/Settings";
import { AdminLayout, AdminDashboard, AdminUsers, AdminCredits, AdminUsageLogs } from "@/components/admin";
import Layout from "@/components/Layout";
import { AiLoader } from "@/components/ui/ai-loader";
import LandingPage from "@/components/LandingPage";
import Login from "@/components/auth/Login";
import Register from "@/components/auth/Register";
import { supabase } from "@/lib/supabaseClient";

// Backend URL is handled in api.js now

// Dashboard Page acts as the One Shot Fixes tool directly
const DashboardPage = () => {
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
      }, 2500);

      return () => clearInterval(interval);
    }
  }, [currentView]);

  const handleGenerate = async (data) => {
    setCurrentView('loading');
    setError(null);
    setLoadingStatus('Lendo...');

    try {
      console.log('[OneShotFix] Enviando log de erro para análise...');

      const response = await api.post('/analyze-error', {
        error_log: data.errorLog,
        tags: data.tags
      });

      console.log('[OneShotFix] Análise concluída:', response.data);
      setAnalysisResult(response.data);
      setCurrentView('result');
    } catch (e) {
      console.error("Error analyzing:", e);

      if (e.code === 'ECONNABORTED') {
        setError('A análise está demorando muito. Tente com um log menor.');
      } else if (e.response) {
        const serverMsg = e.response.data?.error || e.response.data?.message;
        const isQuotaError = e.response.data?.isQuotaError;

        if (e.response.status === 429) {
          setError(isQuotaError ? '⚠️ Cota da API de IA excedida.' : 'Muitas requisições. Tente em breve.');
        } else {
          setError(serverMsg || `Erro do servidor: ${e.response.status}`);
        }
      } else {
        setError('Backend indisponível. Verifique a conexão.');
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
      onBack={() => { }}
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

const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
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

          <Route path="/correcoes" element={<Navigate to="/dashboard" replace />} />

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
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
