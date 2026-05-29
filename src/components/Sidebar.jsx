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
                            <div className="absolute top-4 right-4 z-[80]">
                                <button 
                                    onClick={() => setSidebarOpen(false)}
                                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-blue-600 transition-all"
                                >
                                    <MdLogout className="rotate-180" size={20} />
                                </button>
                            </div>
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
    const [admin, setAdmin] = useState(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("admin");
            if (saved) {
                try {
                    setAdmin(JSON.parse(saved));
                } catch (e) {
                    console.error("Error parsing admin data:", e);
                }
            }
        }
    }, []);

    const allNavItems = [
        { href: "/dashboard", icon: MdDashboard, label: "Dashboard", permission: "dashboard" },
        { href: "/students", icon: MdPeople, label: "Student Roster", permission: "students" },
        { href: "/results", icon: MdSchool, label: "Results", permission: "results" },
        { href: "/fees", icon: MdMoney, label: "Fee Config", permission: "fees" },
        { href: "/attendance", icon: MdList, label: "Attendance", permission: "attendance" },
        { href: "/expenses", icon: MdMoney, label: "Expenses", permission: "expenses" },
    ];

    // Filter nav items based on role and permissions
    const navItems = allNavItems.filter(item => {
        if (!admin) return false;
        if (admin.role === "superadmin") return true;
        return admin.permissions?.[item.permission] === true;
    });

    // If superadmin, add Staff Accounts management link
    if (admin && admin.role === "superadmin") {
        navItems.push({ href: "/staff", icon: MdSecurity, label: "Staff Accounts" });
    }

    const handleLogout = () => {
        if (typeof window !== "undefined") {
            localStorage.removeItem("token");
            localStorage.removeItem("admin");
            window.location.href = "/login";
        }
    };

    return (
        <>
            {/* LOGO */}
            <div className="px-6 py-10 relative overflow-hidden group">
                <div className="flex flex-col items-center text-center gap-4 relative z-10">
                    <div className="w-20 h-20 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center border border-slate-200 dark:border-slate-800 p-3 shadow-sm group-hover:shadow-md transition-all duration-500">
                        <Image src={Logo} alt="Logo" width={56} height={56} className="object-contain" priority />
                    </div>
                    <div>
                        <h1 className="font-display font-black text-xl text-slate-900 dark:text-white tracking-tightest leading-tight">
                            Nymph Classes
                        </h1>
                        <p className="font-sans text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.3em] mt-1.5 flex items-center justify-center gap-2">
                             <span className="w-1 h-1 rounded-full bg-emerald-500"></span>
                             {admin?.role === "superadmin" ? "Super Admin" : "Staff Panel"}
                        </p>
                    </div>
                </div>
            </div>

            {/* NAV */}
            <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto custom-scrollbar">
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
            <div className="px-4 py-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20">
                <div className="flex flex-col gap-4">
                    <ThemeSwitch dark={dark} toggle={toggle} />
                    <button 
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50/50 dark:hover:bg-rose-500/5 transition-all duration-300 font-bold text-[10px] uppercase tracking-widest"
                    >
                        <MdLogout size={18} /> Logout
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
                className={`relative flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer overflow-hidden transition-all duration-200 ${isActive ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/40'}`}
            >
                {/* ICON */}
                <div className={`transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-white' : ''}`}>
                    <Icon size={20} />
                </div>

                {/* LABEL */}
                <span className={`font-sans text-[13px] font-bold transition-colors`}>
                    {label}
                </span>

                {/* ACTIVE INDICATOR */}
                {isActive && (
                    <motion.div 
                        layoutId="active-nav"
                        className="absolute left-0 top-3 bottom-3 w-1 bg-white rounded-full"
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
