
import React, { useState, useEffect } from 'react';
import { Search, ChevronRight, Lock, Crown } from 'lucide-react';
import api from '../../lib/api';
import { cn } from '@/lib/utils';
import ScriptCard from './ScriptCard';
import ScriptModal from './ScriptModal';
import { Link } from 'react-router-dom';

// API Config is handled in lib/api.js

const ScriptLibrary = () => {
    const [scripts, setScripts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedScript, setSelectedScript] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [userPlan, setUserPlan] = useState(null);
    const [hasAccess, setHasAccess] = useState(false);

    useEffect(() => {
        checkUserAccess();
    }, []);

    const checkUserAccess = async () => {
        try {
            const response = await api.get('/credits/balance');
            const plan = response.data.plan?.toLowerCase() || 'starter';
            setUserPlan(plan);
            // Only Pro users have access
            if (plan === 'pro') {
                setHasAccess(true);
                fetchScripts();
            } else {
                setHasAccess(false);
                setLoading(false);
            }
        } catch (error) {
            console.error('Error checking user access:', error);
            setHasAccess(false);
            setLoading(false);
        }
    };

    const fetchScripts = async () => {
        try {
            setLoading(true);
            const response = await api.get('/scripts');
            setScripts(response.data);
        } catch (error) {
            console.error('Error fetching scripts:', error);
        } finally {
            setLoading(false);
        }
    };

    // Agrupa scripts por categoria
    const getScriptsByCategory = (category) => {
        return scripts.filter(s => s.category === category);
    };

    // Filtra scripts globalmente se houver busca
    const filteredScripts = searchQuery
        ? scripts.filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase()))
        : scripts;

    const categories = [
        { id: 'ui', label: 'UI Components' },
        { id: 'landing', label: 'Landing Pages' },
        { id: 'form', label: 'Form Blocks' },
        { id: 'dashboard', label: 'Dashboard & Data' },
    ];

    // Access Denied UI for non-Pro users
    if (!loading && !hasAccess) {
        return (
            <div className="min-h-screen bg-[#000000] text-white flex items-center justify-center p-6">
                <div className="max-w-lg text-center">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center border border-white/10">
                        <Lock size={36} className="text-purple-400" />
                    </div>
                    <h1 className="text-3xl font-bold mb-4">Acesso Restrito</h1>
                    <p className="text-white/60 mb-8">
                        A Biblioteca de Scripts é exclusiva para assinantes do plano <span className="text-purple-400 font-semibold">Pro</span>.
                        Faça upgrade para desbloquear acesso ilimitado a componentes prontos, templates e muito mais.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            to="/perfil"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-all"
                        >
                            <Crown size={18} />
                            Fazer Upgrade
                        </Link>
                        <Link
                            to="/dashboard"
                            className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white/80 font-medium rounded-xl transition-all border border-white/10"
                        >
                            Voltar ao Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#000000] text-white selection:bg-purple-500/30">
            {/* Header / Nav */}
            <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b border-white/5">
                <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <h1 className="font-bold text-xl tracking-tight">Scripts<span className="text-purple-500">.lib</span></h1>
                        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-white/60">
                            <a href="#" className="hover:text-white transition-colors">Discover</a>
                            <a href="#" className="hover:text-white transition-colors">Components</a>
                            <a href="#" className="hover:text-white transition-colors">Templates</a>
                        </nav>
                    </div>

                    <div className="relative w-full max-w-md hidden sm:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                        <input
                            type="text"
                            placeholder="Search for components..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#161618] border border-white/5 rounded-full pl-10 pr-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
                        />
                    </div>
                </div>
            </header>

            <main className="py-8 px-6 max-w-[1400px] mx-auto">

                {/* Hero / Featured Section (Somente se não estiver buscando) */}
                {!searchQuery && !loading && (
                    <section className="mb-16">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-semibold">Featured & Popular</h2>
                            <button className="text-sm text-white/40 hover:text-white flex items-center gap-1 transition-colors">
                                View all <ChevronRight size={14} />
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Pega os 3 primeiros scripts como destaque */}
                            {scripts.slice(0, 3).map(script => (
                                <ScriptCard
                                    key={script.id}
                                    script={script}
                                    onView={() => setSelectedScript(script)}
                                />
                            ))}
                        </div>
                    </section>
                )}

                {/* Categories Sections */}
                {loading ? (
                    <div className="flex items-center justify-center py-40">
                        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    </div>
                ) : searchQuery ? (
                    /* Resultados de Busca */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredScripts.map(script => (
                            <ScriptCard
                                key={script.id}
                                script={script}
                                onView={() => setSelectedScript(script)}
                            />
                        ))}
                    </div>
                ) : (
                    /* Listagem por Categoria */
                    <div className="space-y-16">
                        {categories.map(cat => {
                            const catScripts = getScriptsByCategory(cat.id);
                            if (catScripts.length === 0) return null;

                            return (
                                <section key={cat.id}>
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-semibold text-white/90">{cat.label}</h2>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                        {catScripts.map(script => (
                                            <ScriptCard
                                                key={script.id}
                                                script={script}
                                                onView={() => setSelectedScript(script)}
                                            />
                                        ))}
                                    </div>
                                </section>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* Modal de Detalhes */}
            {selectedScript && (
                <ScriptModal
                    script={selectedScript}
                    onClose={() => setSelectedScript(null)}
                />
            )}
        </div>
    );
};

export default ScriptLibrary;
