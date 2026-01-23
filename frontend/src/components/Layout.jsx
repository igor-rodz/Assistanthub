import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api from '../lib/api';
import { LayoutDashboard, Settings, LogOut, Wand2, Coins, Code2 } from "lucide-react";
import { motion } from "framer-motion";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
const API = `${BACKEND_URL}/api`;

// Logo Component
const Logo = () => {
    return (
        <Link
            to="/dashboard"
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

// Logo Icon Component
const LogoIcon = () => {
    return (
        <Link
            to="/dashboard"
            className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
        >
            <img src="/logo-hub.png" alt="Logo" className="h-8 w-8 flex-shrink-0 rounded-lg" />
        </Link>
    );
};

// Layout Component with Persistent Sidebar
const Layout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [open, setOpen] = useState(false);
    const [user, setUser] = useState({
        name: "Rodzigor",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rodzigor",
        email: "rodzigor@gmail.com"
    });
    const [credits, setCredits] = useState({
        credit_balance: 0,
        plan: "starter",
        monthly_limit: 300
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [userRes, creditsRes] = await Promise.all([
                    api.post(`/dashboard/tool/${toolId}/open`),
                    axios.get(`${API}/credits/balance`)
                ]);
                if (userRes.data) setUser(userRes.data);
                if (creditsRes.data) setCredits(creditsRes.data);
            } catch (e) {
                console.warn("Backend not available, using mock data");
            }
        };
        fetchData();
    }, []);

    const links = [
        {
            label: "Dashboard",
            href: "/dashboard",
            icon: (
                <LayoutDashboard className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
            ),
        },
        {
            label: "One Shot Fixes",
            href: "/correcoes",
            icon: (
                <Wand2 className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
            ),
        },
        {
            label: "Scripts",
            href: "/scripts",
            icon: (
                <Code2 className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
            ),
        },
        {
            label: "Configurações",
            href: "/settings",
            icon: (
                <Settings className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
            ),
        },
        {
            label: "Sair",
            href: "/",
            icon: (
                <LogOut className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
            ),
        },
    ];

    return (
        <div
            className={cn(
                "flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-800 w-full flex-1 mx-auto border border-neutral-200 dark:border-neutral-700",
                "h-screen overflow-hidden"
            )}
        >
            <Sidebar open={open} setOpen={setOpen}>
                <SidebarBody className="justify-between gap-10 bg-neutral-900">
                    <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                        {open ? <Logo /> : <LogoIcon />}
                        <div className="mt-8 flex flex-col gap-2">
                            {links.map((link, idx) => (
                                <SidebarLink key={idx} link={link} />
                            ))}
                        </div>
                    </div>
                    <div className="space-y-2">
                        {/* Credit Balance */}
                        <div
                            className={cn(
                                "relative overflow-hidden transition-all duration-300 rounded-xl border",
                                credits.credit_balance < 10
                                    ? 'bg-red-500/10 border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]'
                                    : 'bg-purple-500/10 border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.1)]',
                                open ? "p-3 mx-0" : "p-2 mx-auto w-10 h-10 flex items-center justify-center"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "p-1.5 rounded-lg flex-shrink-0",
                                    credits.credit_balance < 10 ? "bg-red-500/20" : "bg-purple-500/20"
                                )}>
                                    <Coins className={cn(
                                        "h-4 w-4",
                                        credits.credit_balance < 10 ? 'text-red-400' : 'text-purple-400'
                                    )} />
                                </div>

                                {open && (
                                    <div className="flex flex-col min-w-0">
                                        <div className="flex items-center gap-1.5">
                                            <span className={cn(
                                                "text-sm font-bold tracking-tight",
                                                credits.credit_balance < 10 ? 'text-red-400' : 'text-purple-400'
                                            )}>
                                                {credits.credit_balance?.toFixed(1)}
                                            </span>
                                            <span className="text-[10px] text-neutral-400 font-medium">créditos</span>
                                        </div>
                                        <span className="text-[9px] text-neutral-500 uppercase tracking-wider font-bold">
                                            {credits.plan}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Decorative background glow */}
                            <div className={cn(
                                "absolute -right-2 -bottom-2 w-12 h-12 blur-2xl rounded-full opacity-20",
                                credits.credit_balance < 10 ? "bg-red-500" : "bg-purple-500"
                            )} />
                        </div>
                        {user && (
                            <SidebarLink
                                link={{
                                    label: user.name,
                                    href: "/perfil",
                                    icon: (
                                        <img
                                            src={user.avatar}
                                            className="h-7 w-7 flex-shrink-0 rounded-full"
                                            width={50}
                                            height={50}
                                            alt="Avatar"
                                        />
                                    ),
                                }}
                            />
                        )}
                    </div>
                </SidebarBody>
            </Sidebar>
            <div className="flex flex-col flex-1 w-full h-full overflow-y-auto bg-[#0a0a0f]">
                {children}
            </div>
        </div>
    );
};

export default Layout;
