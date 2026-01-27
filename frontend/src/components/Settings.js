import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import {
    ArrowLeft,
    Bell,
    Shield,
    Key,
    Trash2,
    ChevronRight,
    X,
    Loader2
} from 'lucide-react';

// API Config is handled in lib/api.js

const Settings = ({ onBack }) => {
    const [activeTab, setActiveTab] = useState('notificacoes');
    const [notifications, setNotifications] = useState({
        email: true,
        push: false,
        updates: true
    });
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [activeModal, setActiveModal] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const tabs = [
        { id: 'notificacoes', label: 'Notificações', icon: Bell },
        { id: 'seguranca', label: 'Segurança', icon: Shield },
    ];

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            alert("As senhas não coincidem!");
            return;
        }

        try {
            setLoading(true);
            const { error } = await supabase.auth.updateUser({ password });
            if (error) throw error;
            alert("Senha atualizada com sucesso!");
            setActiveModal(null);
            setPassword('');
            setConfirmPassword('');
        } catch (error) {
            alert("Erro ao atualizar senha: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm("Esta ação é irreversível. Todas as suas informações serão apagadas. Deseja continuar?")) return;

        try {
            setLoading(true);
            // 1. Delete data from backend (profiles, credits)
            await api.delete('/dashboard/user');

            // 2. Sign out (Supabase)
            await supabase.auth.signOut();

            navigate('/login');
        } catch (error) {
            console.error("Error deleting account:", error);
            alert("Erro ao excluir conta. Tente novamente mais tarde.");
        } finally {
            setLoading(false);
        }
    };

    const renderModal = () => {
        if (!activeModal) return null;

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                <div
                    className="absolute inset-0"
                    onClick={() => setActiveModal(null)}
                />
                <div className="relative w-full max-w-md bg-[#0d0d0f] border border-white/10 rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                    <button
                        onClick={() => setActiveModal(null)}
                        className="absolute top-4 right-4 p-2 text-white/40 hover:text-white transition-colors hover:bg-white/5 rounded-lg"
                    >
                        <X size={20} />
                    </button>

                    {activeModal === 'password' && (
                        <div>
                            <div className="mb-6">
                                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mb-4">
                                    <Key className="text-purple-400" size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Alterar Senha</h3>
                                <p className="text-white/60 text-sm">Digite sua nova senha abaixo para confirmar a alteração.</p>
                            </div>

                            <form className="space-y-4" onSubmit={handlePasswordChange}>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-white/40 uppercase tracking-widest pl-1">Nova Senha</label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-white/40 uppercase tracking-widest pl-1">Confirmar Senha</label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-all mt-4 flex items-center justify-center gap-2"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={20} /> : 'Atualizar Senha'}
                                </button>
                            </form>
                        </div>
                    )}

                    {activeModal === 'delete' && (
                        <div>
                            <div className="mb-6">
                                <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
                                    <Trash2 className="text-red-400" size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Excluir Conta</h3>
                                <p className="text-white/60 text-sm">Tem certeza que deseja excluir sua conta permanentemente? Esta ação não pode ser desfeita e todos os seus dados serão perdidos.</p>
                            </div>

                            <div className="flex gap-3 mt-8">
                                <button
                                    onClick={() => setActiveModal(null)}
                                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleDeleteAccount}
                                    disabled={loading}
                                    className="flex-1 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 font-semibold border border-red-500/20 rounded-xl transition-all flex items-center justify-center gap-2"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={20} /> : 'Sim, Excluir'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'notificacoes':
                return (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white mb-4">Preferências de Notificação</h3>

                        {[
                            { key: 'email', label: 'Notificações por Email', desc: 'Receber atualizações importantes por email' },
                            { key: 'push', label: 'Notificações Push', desc: 'Receber alertas em tempo real no navegador' },
                            { key: 'updates', label: 'Novidades e Atualizações', desc: 'Ser informado sobre novas funcionalidades' }
                        ].map((item) => (
                            <div key={item.key} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl">
                                <div>
                                    <p className="text-white font-medium">{item.label}</p>
                                    <p className="text-white/50 text-sm">{item.desc}</p>
                                </div>
                                <button
                                    onClick={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                                    className={`w-12 h-6 rounded-full transition-colors ${notifications[item.key] ? 'bg-purple-600' : 'bg-white/20'}`}
                                >
                                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${notifications[item.key] ? 'translate-x-6' : 'translate-x-0.5'}`} />
                                </button>
                            </div>
                        ))}
                    </div>
                );

            case 'seguranca':
                return (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white mb-4">Segurança da Conta</h3>

                        <button
                            onClick={() => setActiveModal('password')}
                            className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <Key className="w-5 h-5 text-purple-400" />
                                <div className="text-left">
                                    <p className="text-white font-medium">Alterar Senha</p>
                                    <p className="text-white/50 text-sm">Última alteração: há 30 dias</p>
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-white/40" />
                        </button>

                        <div className="pt-4 border-t border-white/10">
                            <button
                                onClick={() => setActiveModal('delete')}
                                className="w-full flex items-center justify-between p-4 bg-red-500/10 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <Trash2 className="w-5 h-5 text-red-400" />
                                    <div className="text-left">
                                        <p className="text-red-400 font-medium">Excluir Conta</p>
                                        <p className="text-red-400/60 text-sm">Esta ação é irreversível</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-red-400/40" />
                            </button>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0f]">
            {/* Header */}
            <header className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 max-w-6xl mx-auto">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                        title="Voltar"
                    >
                        <ArrowLeft className="w-5 h-5 text-white/60" />
                    </button>
                    <h1 className="text-xl font-semibold text-white">Configurações</h1>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Sidebar Tabs */}
                    <div className="md:col-span-1">
                        <nav className="space-y-1">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === tab.id
                                            ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
                                            : 'text-white/60 hover:bg-white/5 hover:text-white'
                                            }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span className="font-medium">{tab.label}</span>
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Tab Content */}
                    <div className="md:col-span-3 bg-[#161b22] border border-white/10 rounded-xl p-6">
                        {renderTabContent()}
                    </div>
                </div>
            </main>

            {/* Modals */}
            {renderModal()}
        </div>
    );
};

export default Settings;
