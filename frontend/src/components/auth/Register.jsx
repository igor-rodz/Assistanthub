import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Loader2, ArrowRight } from 'lucide-react';

const Register = () => {
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // 1. Sign Up
            const { data, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
            });

            if (signUpError) throw signUpError;

            if (data.user) {
                // 2. Create Profile
                const { error: profileError } = await supabase
                    .from('profiles')
                    .insert([
                        {
                            id: data.user.id,
                            name: name,
                            email: email,
                            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
                            member_since: new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
                        }
                    ]);

                if (profileError) {
                    console.error("Profile creation error:", profileError);
                    // Continue anyway as auth account is created
                }

                // 3. Initialize Credits - Handled by Backend on first access
                // The backend will automatically create credits when the user first logs in
                // or accesses the dashboard, using the secure Service Role.

                navigate('/dashboard');
            }
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
                    <h2 className="text-2xl font-bold text-white mb-2">Crie sua conta</h2>
                    <p className="text-white/40 text-sm">Comece a usar o Assistant Hub hoje</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-white/40 uppercase tracking-widest pl-1">Nome</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                                placeholder="Seu nome"
                            />
                        </div>
                    </div>

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

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-white text-black hover:bg-gray-200 font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 mt-4"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : (
                            <>
                                Criar Conta
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-white/40">
                    Já tem uma conta?{' '}
                    <Link to="/login" className="text-white hover:underline font-medium">
                        Fazer login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
