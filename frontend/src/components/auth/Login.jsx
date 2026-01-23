import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';

const Login = () => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;
            navigate('/dashboard');
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[120px] rounded-full point-events-none"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full point-events-none"></div>

            <div className="w-full max-w-md bg-[#121216] border border-white/10 rounded-3xl p-8 relative z-10 shadow-2xl animate-in fade-in zoom-in-95 duration-500">
                <div className="text-center mb-8">
                    <img src="/logo-hub.png" alt="Assistant Hub Logo" className="w-16 h-16 mx-auto mb-6 rounded-xl shadow-lg shadow-purple-500/20" />
                    <h2 className="text-2xl font-bold text-white mb-2">Bem-vindo de volta</h2>
                    <p className="text-white/40 text-sm">Entre para acessar suas ferramentas</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-white/40 uppercase tracking-widest pl-1">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                                placeholder="seu@email.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-medium text-white/40 uppercase tracking-widest pl-1">Senha</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end text-sm">
                        <a href="#" className="text-purple-400 hover:text-purple-300 transition-colors">Esqueceu a senha?</a>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-white text-black hover:bg-gray-200 font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 mt-4"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : (
                            <>
                                Entrar
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-white/40">
                    Não tem uma conta?{' '}
                    <Link to="/register" className="text-white hover:underline font-medium">
                        Criar conta
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
