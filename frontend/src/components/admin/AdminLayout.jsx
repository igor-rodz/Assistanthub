import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import {
    LayoutDashboard,
    Users,
    Coins,
    Activity,
    Settings,
    LogOut,
    Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';

// SEGURANÇA BRUTA: APENAS ESTES EMAILS PASSAM
const ALLOWED_ADMINS = ['rodzigor@gmail.com']; // Hardcoded para segurança máxima

/**
 * AdminLayout - Main layout for admin panel with sidebar navigation
 */
const AdminLayout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        const checkGuard = async () => {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                navigate('/login');
                return;
            }

            if (ALLOWED_ADMINS.includes(user.email)) {
                setIsAuthorized(true);
            } else {
                console.error("⛔ ACESSO NEGADO: Tentativa de acesso admin por", user.email);
                console.error("Este incidente será reportado.");
                navigate('/dashboard');
            }
            setChecking(false);
        };

        checkGuard();
    }, [navigate]);

    if (checking) {
        return (
            <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center">
                <Shield className="w-12 h-12 text-emerald-500 animate-pulse" />
            </div>
        );
    }

    if (!isAuthorized) return null;

    const navItems = [
        {
            label: "Dashboard",
            href: "/admin/dashboard",
            icon: LayoutDashboard
        },
        {
            label: "Usuários",
            href: "/admin/users",
            icon: Users
        },
        {
            label: "Créditos",
            href: "/admin/credits",
            icon: Coins
        },
        {
            label: "Uso & Logs",
            href: "/admin/usage-logs",
            icon: Activity
        },
        {
            label: "Scripts Premium",
            href: "/admin/scripts",
            icon: Shield
        }
    ];

    const isActive = (href) => location.pathname === href;

    return (
        <div className="min-h-screen bg-[#0a0a0c] flex">
            {/* Sidebar */}
            <div className="w-64 bg-[#0d0d0f] border-r border-white/5 flex flex-col">
                {/* Logo */}
                <div className="p-6 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <img src="/logo-hub.png" alt="Logo" className="w-10 h-10 rounded-xl shadow-md shadow-orange-500/10" />
                        <div>
                            <h1 className="text-lg font-bold text-white">Admin Panel</h1>
                            <p className="text-xs text-white/40">Assistant Hub</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            to={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium",
                                isActive(item.href)
                                    ? "bg-orange-500/10 text-orange-400 border border-orange-500/20 shadow-lg shadow-orange-500/10"
                                    : "text-white/50 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <item.icon size={20} />
                            {item.label}
                        </Link>
                    ))}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-white/5">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-all font-medium"
                    >
                        <LogOut size={20} />
                        Voltar ao App
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto">
                {/* Header */}
                <header className="h-16 border-b border-white/5 bg-[#0d0d0f]/50 backdrop-blur-sm sticky top-0 z-10 px-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-white">
                            {navItems.find(item => isActive(item.href))?.label || 'Admin'}
                        </h2>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="px-3 py-1.5 bg-orange-500/10 text-orange-400 rounded-lg text-xs font-bold uppercase tracking-wider border border-orange-500/20">
                            Admin
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-6">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
