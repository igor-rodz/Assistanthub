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
import LandingPageV2 from "@/components/LandingPageV2";
import Login from "@/components/auth/Login";
import Register from "@/components/auth/Register";
import { supabase } from "@/lib/supabaseClient";

// Backend URL is handled in api.js now

const MAX_IMAGE_UPLOAD_BYTES = 1300000;
const MAX_IMAGE_DIMENSION = 1600;

async function blobToBase64Data(blob) {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== 'string') return reject(new Error('Invalid FileReader result'));
      const parts = result.split(',');
      resolve(parts[1] || '');
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function compressImageForUpload(file) {
  const imageEl = await new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });

  const srcW = imageEl.naturalWidth || imageEl.width;
  const srcH = imageEl.naturalHeight || imageEl.height;

  const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(srcW, srcH));
  const targetW = Math.max(1, Math.round(srcW * scale));
  const targetH = Math.max(1, Math.round(srcH * scale));

  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');

  ctx.drawImage(imageEl, 0, 0, targetW, targetH);

  const mimeType = 'image/jpeg';
  let quality = 0.85;
  let lastBlob = null;

  while (quality >= 0.45) {
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, mimeType, quality));
    if (blob && blob.size <= MAX_IMAGE_UPLOAD_BYTES) {
      lastBlob = blob;
      break;
    }
    if (blob) lastBlob = blob;
    quality -= 0.1;
  }

  if (!lastBlob) throw new Error('Failed to encode image');

  const base64 = await blobToBase64Data(lastBlob);
  return { base64, mimeType, size: lastBlob.size };
}

// Dashboard Page acts as the One Shot Fixes tool directly
const DashboardPage = () => {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState('input'); // 'input', 'loading', or 'result'
  const [analysisResult, setAnalysisResult] = useState(null);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState('Lendo log de erro...');
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);

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

      // Prepare request data
      const requestData = {
        error_log: data.errorLog,
        tags: data.tags
      };

      // If image is provided, convert to base64
      if (data.image) {
        console.log('[OneShotFix] Processando imagem...');
        setLoadingStatus('Processando imagem...');

        const { base64, mimeType } = await compressImageForUpload(data.image);
        requestData.image = { data: base64, mimeType };
      }

      const response = await api.post('/analyze-error', requestData);

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
        const noCredits = e.response.data?.noCredits;

        if (e.response.status === 402 && noCredits) {
          // User has 0 credits - show subscribe modal
          setShowSubscribeModal(true);
          setCurrentView('input');
          return;
        } else if (e.response.status === 402) {
          setError('Créditos insuficientes. Adquira mais créditos para continuar.');
        } else if (e.response.status === 504) {
          setError('⏱️ Timeout na análise. A imagem pode ser muito grande. Tente novamente ou use apenas texto.');
        } else if (e.response.status === 429) {
          setError(isQuotaError ? '⚠️ Cota da API de IA excedida.' : 'Muitas requisições. Tente em breve.');
        } else if (e.response.status === 413) {
          setError('Imagem muito grande para envio. Tente novamente com um screenshot menor/mais comprimido.');
        } else {
          // Ensure serverMsg is a string
          const errorMsg = typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg) || `Erro do servidor: ${e.response.status}`;
          setError(errorMsg);
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
    <>
      <ErrorLogInput
        onGenerate={handleGenerate}
        onBack={() => { }}
        user={user}
        onOpenProfile={handleOpenProfile}
        error={error}
      />

      {/* Subscribe Modal */}
      {showSubscribeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md bg-gradient-to-b from-[#1a1a2e] to-[#0d0d0f] border border-white/10 rounded-2xl p-8 shadow-2xl">
            {/* Close button */}
            <button
              onClick={() => setShowSubscribeModal(false)}
              className="absolute top-4 right-4 p-2 text-white/40 hover:text-white transition-colors hover:bg-white/5 rounded-lg"
            >
              ✕
            </button>

            {/* Icon */}
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center">
              <span className="text-3xl">🚀</span>
            </div>

            {/* Title */}
            <h3 className="text-2xl font-bold text-white text-center mb-3">
              Ative sua Conta
            </h3>

            {/* Description */}
            <p className="text-white/60 text-center mb-6">
              Para usar o One-Shot Fixes, você precisa de créditos.
              Assine agora e comece a corrigir seus erros instantaneamente!
            </p>

            {/* Benefits */}
            <div className="space-y-3 mb-6">
              {[
                '700 créditos para análises',
                'Suporte a múltiplos frameworks',
                'Respostas detalhadas com IA',
                'Histórico de análises'
              ].map((benefit, i) => (
                <div key={i} className="flex items-center gap-3 text-white/80">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs">✓</span>
                  <span className="text-sm">{benefit}</span>
                </div>
              ))}
            </div>

            {/* Price */}
            <div className="text-center mb-6">
              <span className="text-white/40 text-sm line-through">R$ 49,90</span>
              <div className="text-3xl font-bold text-white">
                R$ 29,90
                <span className="text-sm font-normal text-white/40">/único</span>
              </div>
            </div>

            {/* CTA Button */}
            <a
              href="https://pay.perfectpay.com.br/pago/MGT2LDQ2LDQ1LDQxLDIx="
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-4 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-black font-bold rounded-xl transition-all text-center"
            >
              Assinar Agora
            </a>

            <p className="text-white/30 text-xs text-center mt-4">
              Pagamento seguro via PerfectPay
            </p>
          </div>
        </div>
      )}
    </>
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
        Assistant Hub
      </motion.span>
    </Link>
  );
};

function App() {
  return (
    <div className="App dark">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPageV2 />} />
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
