import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api from '../lib/api';
import { LayoutDashboard, Settings, LogOut, Wand2, Coins, Code2, Palette } from "lucide-react";
import { motion } from "framer-motion";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { UserMenu } from "@/components/ui/user-menu";
import { supabase } from "@/lib/supabaseClient";

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
                    api.get('/dashboard/user'),
                    api.get('/dashboard/metrics').catch(() => null) // Credits might be in metrics
                ]);
                if (userRes.data) setUser(userRes.data);
                // Credits are typically part of user data or metrics
                if (creditsRes?.data) {
                    setCredits({
                        credit_balance: creditsRes.data.credits || 0,
                        plan: creditsRes.data.plan || "starter",
                        monthly_limit: creditsRes.data.monthly_limit || 300
                    });
                }
            } catch (e) {
                // Only log as "backend not available" if it's a network error
                if (!e.response && e.request) {
                    console.warn("Backend not available, using mock data");
                } else {
                    console.warn("Backend error, using mock data:", e.response?.status);
                }
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
            label: "Design Lab",
            href: "/design-lab",
            icon: (
                <Palette className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
            ),
        },
        {
            label: "Scripts",
            href: "/scripts",
            icon: (
                <Code2 className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
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

                    <div className="mt-auto">
                        <UserMenu
                            user={user}
                            credits={credits}
                            onLogout={async () => {
                                await supabase.auth.signOut();
                                navigate('/login');
                            }}
                        />
                    </div>
                </SidebarBody>
            </Sidebar>
            <div className="flex flex-col flex-1 w-full h-full overflow-y-auto bg-[#0a0a0f]">
                {children}
            </div>
        </div >
    );
};

export default Layout;
