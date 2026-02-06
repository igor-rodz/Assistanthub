import React, { useState } from "react";
import { useSidebar } from "./sidebar";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
    LogOut,
    User,
    HelpCircle,
    Link as LinkIcon,
    Settings
} from "lucide-react";
import { cn } from "@/lib/utils";

export const UserMenu = ({ user, credits, onLogout }) => {
    const { open, setOpen } = useSidebar();
    const [menuOpen, setMenuOpen] = useState(false);

    const toggleMenu = () => {
        if (!open) {
            setOpen(true);
            // Delay opening menu slightly to allow sidebar animation
            setTimeout(() => setMenuOpen(true), 150);
        } else {
            setMenuOpen(!menuOpen);
        }
    };

    return (
        <div className="relative">
            <AnimatePresence>
                {menuOpen && open && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute bottom-full left-0 w-full mb-3 bg-[#18181b] border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50 p-1"
                    >
                        {/* Header */}
                        <div className="p-3 border-b border-white/5 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-xs shrink-0 pt-0.5">
                                {user?.name?.charAt(0).toUpperCase() || "U"}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-white truncate">{user?.name}</p>
                                <p className="text-[10px] text-zinc-500 truncate">{user?.email}</p>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="p-2 border-b border-white/5 space-y-1">
                            <Link
                                to="/perfil?tab=assinatura"
                                onClick={() => setMenuOpen(false)}
                                className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors group cursor-pointer"
                            >
                                <span className="text-xs text-zinc-400 group-hover:text-zinc-300">Plano</span>
                                <span className="text-[10px] font-bold bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded uppercase tracking-wide">{credits?.plan || "Pro"}</span>
                            </Link>
                            <Link
                                to="/perfil?tab=creditos"
                                onClick={() => setMenuOpen(false)}
                                className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors group cursor-pointer"
                            >
                                <span className="text-xs text-zinc-400 group-hover:text-zinc-300">Créditos</span>
                                <div className="flex items-center gap-1.5 text-white">
                                    <LinkIcon size={10} className="text-zinc-500" />
                                    <span className="text-xs font-bold font-mono">{Math.floor(credits?.credit_balance || 0)}</span>
                                </div>
                            </Link>
                        </div>

                        {/* Menu Items */}
                        <div className="p-1 space-y-0.5">
                            <NavItem icon={User} label="Conta" to="/perfil?tab=perfil" />
                            <NavItem icon={Settings} label="Configurações" to="/settings" />
                            <button
                                onClick={onLogout}
                                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors text-xs font-medium"
                            >
                                <LogOut size={14} />
                                Sair
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Trigger Button */}
            <div
                onClick={toggleMenu}
                className={cn(
                    "flex items-center gap-3 p-1.5 rounded-xl transition-all cursor-pointer hover:bg-white/5 group border border-transparent",
                    menuOpen ? "bg-white/5 border-white/5" : "",
                    !open && "justify-center px-0"
                )}
            >
                <div className={cn(
                    "rounded-full bg-orange-500 flex items-center justify-center text-white font-bold flex-shrink-0 relative shadow-lg shadow-orange-500/20 transition-all duration-300",
                    open ? "w-9 h-9 text-sm pt-0.5" : "w-7 h-7 text-xs pt-0"
                )}>
                    {user?.name?.charAt(0).toUpperCase() || "I"}
                </div>

                {open && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex-1 min-w-0 flex items-center justify-between"
                    >
                        <span className="bg-zinc-800 border border-white/5 text-zinc-300 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide">
                            {credits?.plan || 'Pro'}
                        </span>

                        <div className="flex items-center gap-1.5 text-zinc-400 pr-1">
                            <LinkIcon size={12} className="text-zinc-600" />
                            <span className="text-xs font-bold font-mono text-zinc-300">{Math.floor(credits?.credit_balance || 0)}</span>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    )
}

const NavItem = ({ icon: Icon, label, to = "#" }) => (
    <Link to={to} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-colors">
        <Icon size={14} />
        <span className="text-xs font-medium">{label}</span>
    </Link>
)
