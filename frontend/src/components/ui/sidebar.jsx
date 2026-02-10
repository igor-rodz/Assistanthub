import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import React, { useState, createContext, useContext } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";

const SidebarContext = createContext(undefined);

export const useSidebar = () => {
    const context = useContext(SidebarContext);
    if (!context) {
        throw new Error("useSidebar must be used within a SidebarProvider");
    }
    return context;
};

export const SidebarProvider = ({
    children,
    open: openProp,
    setOpen: setOpenProp,
    animate = true,
}) => {
    const [openState, setOpenState] = useState(false);

    const open = openProp !== undefined ? openProp : openState;
    const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

    return (
        <SidebarContext.Provider value={{ open, setOpen, animate }}>
            {children}
        </SidebarContext.Provider>
    );
};

export const Sidebar = ({
    children,
    open,
    setOpen,
    animate,
}) => {
    return (
        <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
            {children}
        </SidebarProvider>
    );
};

export const SidebarBody = (props) => {
    return (
        <>
            <DesktopSidebar {...props} />
            <MobileSidebar>{props.children}</MobileSidebar>
        </>
    );
};

export const DesktopSidebar = ({
    className,
    children,
    ...props
}) => {
    const { open, setOpen, animate } = useSidebar();
    return (
        <motion.div
            className={cn(
                "h-full px-4 py-4 hidden md:flex md:flex-col bg-neutral-100 dark:bg-neutral-800 w-[300px] flex-shrink-0",
                className
            )}
            animate={{
                width: animate ? (open ? "300px" : "60px") : "300px",
            }}
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
            {...props}
        >
            {children}
        </motion.div>
    );
};

export const MobileSidebar = ({ children }) => {
    const { open, setOpen } = useSidebar();
    return (
        <>
            {/* Mobile header bar */}
            <div className="h-10 px-3 flex md:hidden items-center justify-between bg-neutral-900 border-b border-white/10 w-full flex-shrink-0">
                <Link to="/dashboard" className="flex items-center gap-1.5">
                    <img src="/logo-hub.png" alt="Logo" className="h-5 w-5 rounded" />
                    <span className="font-medium text-white text-xs">Assistant Hub</span>
                </Link>
                <button
                    onClick={() => setOpen(true)}
                    className="p-1.5 -mr-1 rounded-lg hover:bg-white/10 transition-colors"
                    aria-label="Abrir menu"
                >
                    <Menu className="text-white w-4 h-4" />
                </button>
            </div>

            {/* Fullscreen drawer via Portal */}
            {createPortal(
                <AnimatePresence>
                    {open && (
                        <>
                            {/* Dark backdrop */}
                            <motion.div
                                key="mobile-backdrop"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                onClick={() => setOpen(false)}
                                className="fixed inset-0 bg-black/70 z-[9998] md:hidden"
                            />
                            {/* Sidebar panel */}
                            <motion.div
                                key="mobile-drawer"
                                initial={{ x: "-100%" }}
                                animate={{ x: 0 }}
                                exit={{ x: "-100%" }}
                                transition={{ duration: 0.25, ease: "easeOut" }}
                                className="fixed inset-y-0 left-0 w-[280px] bg-neutral-900 z-[9999] flex flex-col shadow-2xl md:hidden"
                            >
                                {/* Close button */}
                                <button
                                    onClick={() => setOpen(false)}
                                    className="absolute top-3 right-3 p-2 rounded-lg hover:bg-white/10 transition-colors text-neutral-400 hover:text-white z-20"
                                    aria-label="Fechar menu"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                                {/* Sidebar content - same children as DesktopSidebar */}
                                <div className="flex flex-col flex-1 justify-between p-4 overflow-y-auto gap-6">
                                    {children}
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </>
    );
};

export const SidebarLink = ({
    link,
    className,
    ...props
}) => {
    const { open, animate, setOpen } = useSidebar();
    return (
        <Link
            to={link.href}
            onClick={() => {
                if (window.innerWidth < 768) setOpen(false);
            }}
            className={cn(
                "flex items-center justify-start gap-2 group/sidebar py-2",
                className
            )}
            {...props}
        >
            {link.icon}
            <motion.span
                animate={{
                    display: animate ? (open ? "inline-block" : "none") : "inline-block",
                    opacity: animate ? (open ? 1 : 0) : 1,
                }}
                className="text-neutral-700 dark:text-neutral-200 text-sm group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block !p-0 !m-0"
            >
                {link.label}
            </motion.span>
        </Link>
    );
};
