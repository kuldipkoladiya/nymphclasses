"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    MdDashboard,
    MdPeople,
    MdSchool,
    MdMoney,
    MdList,
    MdSecurity,
    MdLogout
} from "react-icons/md";
import { FiSun, FiMoon } from "react-icons/fi";
import Image from "next/image";
import Logo from "../assets/logo.png";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

/* =====================
   DARK MODE HOOK
===================== */
function useTheme() {
    const [dark, setDark] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem("theme");
        if (saved === "dark") {
            document.documentElement.classList.add("dark");
            setDark(true);
        }
    }, []);

    const toggle = () => {
        const isDark = document.documentElement.classList.toggle("dark");
        localStorage.setItem("theme", isDark ? "dark" : "light");
        setDark(isDark);
    };

    return { dark, toggle };
}

/* =====================
   SIDEBAR
===================== */
export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
    const { dark, toggle } = useTheme();

    return (
        <>
            {/* DESKTOP SIDEBAR */}
            <aside className="hidden md:flex fixed top-0 left-0 h-screen w-[280px] bg-white dark:bg-slate-950 z-50 flex flex-col border-r border-slate-200 dark:border-slate-800 shadow-premium transition-colors duration-300">
                <SidebarContent
                    dark={dark}
                    toggle={toggle}
                    setSidebarOpen={setSidebarOpen}
                />
            </aside>

            {/* MOBILE SIDEBAR */}
            <AnimatePresence>
                {sidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSidebarOpen(false)}
                            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] md:hidden"
                        />
                        <motion.aside
                            initial={{ x: -280 }}
                            animate={{ x: 0 }}
                            exit={{ x: -280 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="fixed top-0 left-0 z-[70] h-screen w-[280px] bg-white dark:bg-slate-950 flex flex-col shadow-2xl border-r border-blue-600/20 md:hidden"
                        >
                            <SidebarContent
                                dark={dark}
                                toggle={toggle}
                                setSidebarOpen={setSidebarOpen}
                            />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}

/* =====================
   SIDEBAR CONTENT
===================== */
function SidebarContent({ dark, toggle, setSidebarOpen }) {
    const pathname = usePathname();

    const navItems = [
        { href: "/dashboard", icon: MdDashboard, label: "Analytics" },
        { href: "/students", icon: MdPeople, label: "Student Roster" },
        { href: "/results", icon: MdSchool, label: "Academic Results" },
        { href: "/fees", icon: MdMoney, label: "Financial Hub" },
        { href: "/attendance", icon: MdList, label: "Attendance" },
    ];

    const handleLogout = () => {
        if (typeof window !== "undefined") {
            localStorage.removeItem("token");
            window.location.href = "/login";
        }
    };

    return (
        <>
            {/* LOGO */}
            <div className="px-8 py-10 border-b border-slate-100 dark:border-slate-800 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-600/10 transition-colors duration-500"></div>
                <div className="flex items-center gap-4 relative z-10 w-full justify-center flex-col text-center">
                    <div className="w-16 h-16 rounded-[1.25rem] bg-white dark:bg-slate-900 flex items-center justify-center border border-slate-200 dark:border-slate-800 p-2 shadow-sm group-hover:shadow-premium group-hover:scale-105 transition-all duration-500">
                        <Image src={Logo} alt="Logo" width={48} height={48} className="object-contain" priority />
                    </div>
                    <div>
                        <p className="font-display font-black text-xl text-slate-900 dark:text-white tracking-tightest leading-tight mt-4">
                            Nymph Classes
                        </p>
                        <div className="flex items-center justify-center gap-2 mt-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                             <p className="font-sans text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.3em]">
                                 Operational System
                             </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* NAV */}
            <nav className="flex-1 px-4 py-8 space-y-1.5 overflow-y-auto custom-scrollbar">
                {navItems.map((item) => (
                    <NavItem
                        key={item.href}
                        href={item.href}
                        icon={item.icon}
                        label={item.label}
                        isActive={pathname.startsWith(item.href)}
                        setSidebarOpen={setSidebarOpen}
                    />
                ))}
            </nav>

            {/* FOOTER */}
            <div className="px-6 py-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
                <div className="flex flex-col gap-4">
                    <ThemeSwitch dark={dark} toggle={toggle} />
                    <button 
                        onClick={handleLogout}
                        className="flex items-center gap-4 px-4 py-3 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/5 transition-all duration-300 font-black text-[11px] uppercase tracking-widest"
                    >
                        <MdLogout size={20} /> Terminate Session
                    </button>
                </div>
            </div>
        </>
    );
}

/* =====================
   NAV ITEM
===================== */
const NavItem = ({ href, icon: Icon, label, isActive, setSidebarOpen }) => {
    const handleClick = () => {
        if (window.innerWidth < 768) {
            setSidebarOpen(false);
        }
    };

    return (
        <Link href={href} className="block group outline-none" onClick={handleClick}>
            <motion.div
                whileHover={{ x: 4 }}
                className={`relative flex items-center gap-4 px-4 py-3.5 rounded-xl cursor-pointer overflow-hidden transition-all duration-300 ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'}`}
            >
                {/* ICON */}
                <div className={`transition-transform duration-500 group-hover:scale-110 ${isActive ? 'text-white' : ''}`}>
                    <Icon size={24} />
                </div>

                {/* LABEL */}
                <span className={`font-sans text-[13px] font-black uppercase tracking-widest transition-colors`}>
                    {label}
                </span>

                {/* ACTIVE GLOW */}
                {isActive && (
                    <motion.div 
                        layoutId="active-nav"
                        className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0"
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />
                )}
            </motion.div>
        </Link>
    );
};

/* =====================
   THEME SWITCH
===================== */
const ThemeSwitch = ({ dark, toggle }) => (
    <div className="flex items-center justify-between px-2">
        <span className="font-sans text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
            Appearance
        </span>

        <button
            onClick={toggle}
            className={`relative w-[50px] h-[28px] rounded-full transition-colors duration-500 shadow-inner outline-none border border-slate-200 dark:border-slate-700 ${
                dark ? "bg-slate-900" : "bg-slate-100"
            }`}
        >
            <motion.span
                layout
                transition={{ type: "spring", stiffness: 600, damping: 30 }}
                className={`absolute top-[3px] left-[3px] w-5 h-5 rounded-full flex items-center justify-center shadow-premium ${dark ? 'bg-blue-600' : 'bg-white'}`}
                style={{ x: dark ? 22 : 0 }}
            >
                {dark ? (
                    <FiMoon className="text-white text-[10px]" />
                ) : (
                    <FiSun className="text-slate-400 text-[10px]" />
                )}
            </motion.span>
        </button>
    </div>
);
