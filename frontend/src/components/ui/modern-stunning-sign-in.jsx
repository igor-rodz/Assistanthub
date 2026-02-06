"use client"

import * as React from "react"
import { Chrome, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

const SignIn1 = () => {
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [fullName, setFullName] = React.useState("");
    const [error, setError] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const [isLogin, setIsLogin] = React.useState(true);
    const navigate = useNavigate();

    const validateEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleAuth = async () => {
        if (!email || !password) {
            setError("Por favor, preencha email e senha.");
            return;
        }
        if (!validateEmail(email)) {
            setError("Por favor, insira um email válido.");
            return;
        }
        if (!isLogin && !fullName) {
            setError("Por favor, insira seu nome completo.");
            return;
        }

        setError("");
        setLoading(true);

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
            } else {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: { data: { full_name: fullName } },
                });
                if (error) throw error;
            }
            navigate('/dashboard');
        } catch (err) {
            setError(err.message === 'Invalid login credentials' ? 'Credenciais inválidas.' : err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: window.location.origin + '/dashboard' }
        });
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#121212] relative overflow-hidden w-full font-['Inter',sans-serif]">
            {/* Centered glass card */}
            <div className="relative z-10 w-full max-w-sm rounded-3xl bg-gradient-to-r from-[#ffffff10] to-[#121212] backdrop-blur-sm shadow-2xl p-8 flex flex-col items-center border border-white/10">
                {/* Logo */}
                <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-white/5 mb-6 shadow-lg border border-white/5 p-2">
                    <img src="/logo-hub.png" alt="Logo" className="w-full h-full object-contain" />
                </div>
                {/* Title */}
                <h2 className="text-2xl font-semibold text-white mb-6 text-center tracking-tight">
                    {isLogin ? 'Bem-vindo de volta' : 'Criar Conta'}
                </h2>
                {/* Form */}
                <div className="flex flex-col w-full gap-4">
                    <div className="w-full flex flex-col gap-3">
                        {!isLogin && (
                            <input
                                placeholder="Nome Completo"
                                type="text"
                                value={fullName}
                                className="w-full px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                                onChange={(e) => setFullName(e.target.value)}
                            />
                        )}
                        <input
                            placeholder="Email"
                            type="email"
                            value={email}
                            className="w-full px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <input
                            placeholder="Senha"
                            type="password"
                            value={password}
                            className="w-full px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        {error && (
                            <div className="text-sm text-red-400 text-left bg-red-400/10 p-2 rounded-lg border border-red-400/20">{error}</div>
                        )}
                    </div>
                    <div className="h-px bg-white/10 w-full my-1"></div>
                    <div>
                        <button
                            onClick={handleAuth}
                            disabled={loading}
                            className="w-full bg-white text-black font-semibold px-5 py-3 rounded-full shadow hover:bg-gray-200 transition mb-3 text-sm flex items-center justify-center"
                        >
                            {loading ? <Loader2 className="animate-spin w-4 h-4" /> : (isLogin ? 'Entrar' : 'Registrar')}
                        </button>
                        {/* Google Sign In */}
                        <button
                            onClick={handleGoogleLogin}
                            className="w-full flex items-center justify-center gap-2 bg-gradient-to-b from-[#232526] to-[#2d2e30] border border-white/5 rounded-full px-5 py-3 font-medium text-white shadow hover:brightness-110 transition mb-2 text-sm"
                        >
                            <Chrome className="w-4 h-4" />
                            Entrar com Google
                        </button>
                        <div className="w-full text-center mt-4">
                            <span className="text-xs text-gray-400">
                                {isLogin ? "Não tem uma conta? " : "Já tem uma conta? "}
                                <button
                                    onClick={() => setIsLogin(!isLogin)}
                                    className="underline text-white/80 hover:text-white"
                                >
                                    {isLogin ? "Crie grátis!" : "Faça login"}
                                </button>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            {/* User count and avatars */}
            <div className="relative z-10 mt-12 flex flex-col items-center text-center">
                <p className="text-gray-400 text-sm mb-2">
                    Junte-se a <span className="font-medium text-white">milhares</span> de
                    desenvolvedores que já economizam tempo.
                </p>
                <div className="flex -space-x-2">
                    <img
                        src="https://randomuser.me/api/portraits/men/32.jpg"
                        alt="user"
                        className="w-8 h-8 rounded-full border-2 border-[#121212] object-cover"
                    />
                    <img
                        src="https://randomuser.me/api/portraits/women/44.jpg"
                        alt="user"
                        className="w-8 h-8 rounded-full border-2 border-[#121212] object-cover"
                    />
                    <img
                        src="https://randomuser.me/api/portraits/men/54.jpg"
                        alt="user"
                        className="w-8 h-8 rounded-full border-2 border-[#121212] object-cover"
                    />
                    <img
                        src="https://randomuser.me/api/portraits/women/68.jpg"
                        alt="user"
                        className="w-8 h-8 rounded-full border-2 border-[#121212] object-cover"
                    />
                </div>
            </div>
        </div>
    );
};

export { SignIn1 };
export default SignIn1;
