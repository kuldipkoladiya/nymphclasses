"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    MdDashboard,
    MdPeople,
    MdSchool,
    MdMoney,
    MdList,
} from "react-icons/md";
import { FiSun, FiMoon } from "react-icons/fi";
import Image from "next/image";
import Logo from "../assets/logo.png"; // Relative path
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
            <aside className="hidden md:flex fixed top-0 left-0 h-screen w-[280px] bg-white/70 dark:bg-darkCard/80 backdrop-blur-md z-50 flex flex-col border-r-2 border-secondary-200 dark:border-darkBorder shadow-[4px_0_24px_rgba(0,0,0,0.02)] transition-colors duration-300">
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
                            className="fixed inset-0 bg-secondary-900/80 backdrop-blur-sm z-[60] md:hidden"
                        />
                        <motion.aside
                            initial={{ x: -280 }}
                            animate={{ x: 0 }}
                            exit={{ x: -280 }}
                            transition={{ type: "spring", stiffness: 350, damping: 25 }}
                            className="fixed top-0 left-0 z-[70] h-screen w-[280px] bg-white dark:bg-darkCard flex flex-col shadow-2xl border-r-2 border-primary-500 md:hidden"
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
        { href: "/dashboard", icon: MdDashboard, label: "Dashboard" },
        { href: "/students", icon: MdPeople, label: "Students" },
        { href: "/results", icon: MdSchool, label: "Results" },
        { href: "/fees", icon: MdMoney, label: "Fees" },
        { href: "/attendance", icon: MdList, label: "Attendance" },
    ];

    return (
        <>
            {/* LOGO */}
            <div className="px-8 py-8 border-b-2 border-secondary-100 dark:border-darkBorder relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 dark:bg-primary-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary-500/20 transition-colors duration-500"></div>
                <div className="flex items-center gap-4 relative z-10 w-full justify-center flex-col text-center">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center border border-primary-100 dark:border-primary-900/50 p-2 shadow-neon group-hover:shadow-neon-intense transition-all duration-300">
                        <Image src={Logo} alt="Logo" width={60} height={60} className="object-contain" priority />
                    </div>
                    <div>
                        <p className="font-display font-bold text-xl text-secondary-900 dark:text-secondary-50 tracking-tight leading-tight mt-3">
                            Nymph Classes
                        </p>
                        <p className="font-sans text-[10px] font-bold text-primary-600 dark:text-primary-400 uppercase tracking-[0.2em] mt-1">
                            Core Interface
                        </p>
                    </div>
                </div>
            </div>

            {/* NAV */}
            <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
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
            <div className="px-6 py-6 border-t border-secondary-200 dark:border-darkBorder bg-secondary-50/50 dark:bg-darkCard/50">
                <ThemeSwitch dark={dark} toggle={toggle} />
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
                whileHover="hover"
                initial="rest"
                animate={isActive ? "active" : "rest"}
                variants={{
                    rest: { backgroundColor: "transparent" },
                    hover: { backgroundColor: "rgba(139, 92, 246, 0.05)" },
                    active: { backgroundColor: "rgba(139, 92, 246, 0.1)" }
                }}
                className={`relative flex items-center gap-4 px-4 py-3.5 rounded-xl cursor-pointer overflow-hidden transition-all duration-300 ${isActive ? 'shadow-[inset_0_0_12px_rgba(139,92,246,0.15)] border border-primary-500/20' : 'border border-transparent'}`}
            >
                {/* ACTIVE BAR */}
                <motion.span
                    initial={false}
                    animate={{ 
                        scaleY: isActive ? 1 : 0, 
                        opacity: isActive ? 1 : 0 
                    }}
                    transition={{ duration: 0.25, type: 'spring', stiffness: 400, damping: 25 }}
                    className="absolute left-0 top-[10%] h-[80%] w-1.5 rounded-r-sm bg-primary-500 dark:bg-primary-400 origin-top shadow-neon"
                />

                {/* ICON */}
                <motion.div
                    variants={{
                        rest: { scale: 1, rotate: 0 },
                        hover: { scale: 1.1, rotate: -5 },
                        active: { scale: 1.05, rotate: 0 }
                    }}
                    className={`transition-colors flex-shrink-0 ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-secondary-400 dark:text-secondary-500 group-hover:text-primary-500'}`}
                >
                    <Icon size={24} className={isActive ? "drop-shadow-neon" : ""} />
                </motion.div>

                {/* LABEL */}
                <span className={`font-sans text-[15px] font-semibold tracking-wide transition-colors ${isActive ? 'text-primary-700 dark:text-primary-300' : 'text-secondary-600 dark:text-secondary-400 group-hover:text-secondary-900 dark:group-hover:text-secondary-100'}`}>
                    {label}
                </span>
            </motion.div>
        </Link>
    );
};

/* =====================
   THEME SWITCH
===================== */
const ThemeSwitch = ({ dark, toggle }) => (
    <div className="flex items-center justify-between px-2">
        <span className="font-display text-xs font-bold text-secondary-500 dark:text-secondary-400 uppercase tracking-widest">
            Mode
        </span>

        <button
            onClick={toggle}
            className={`relative w-[54px] h-[30px] rounded-full transition-colors duration-500 shadow-inner outline-none border-2 border-transparent focus:border-primary-500 ${
                dark ? "bg-darkBg" : "bg-secondary-200"
            }`}
        >
            <motion.span
                layout
                transition={{ type: "spring", stiffness: 600, damping: 30 }}
                className={`absolute top-[2px] left-[2px] w-5 h-5 rounded-full flex items-center justify-center shadow-md ${dark ? 'bg-primary-500 shadow-neon' : 'bg-white'}`}
                style={{ x: dark ? 24 : 0 }}
            >
                {dark ? (
                    <FiMoon strokeWidth={3} className="text-white text-[11px]" />
                ) : (
                    <FiSun strokeWidth={3} className="text-secondary-500 text-[11px]" />
                )}
            </motion.span>
        </button>
    </div>
);
