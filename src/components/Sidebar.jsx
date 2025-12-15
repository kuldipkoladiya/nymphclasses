"use client";

import Link from "next/link";
import {
    MdDashboard,
    MdPeople,
    MdSchool,
    MdMoney,
    MdList,
} from "react-icons/md";
import { FiSun, FiMoon } from "react-icons/fi";
import Image from "next/image";
import Logo from "@/assets/logo.png";
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
        document.documentElement.classList.toggle("dark");
        localStorage.setItem("theme", dark ? "light" : "dark");
        setDark(!dark);
    };

    return { dark, toggle };
}

/* =====================
   SIDEBAR
===================== */
export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
    const [isDesktop, setIsDesktop] = useState(false);
    const { dark, toggle } = useTheme();

    useEffect(() => {
        const check = () => setIsDesktop(window.innerWidth >= 768);
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    /* DESKTOP */
    if (isDesktop) {
        return (
            <aside className="fixed top-0 left-0 h-screen w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700 flex flex-col">
                <SidebarContent
                    dark={dark}
                    toggle={toggle}
                    setSidebarOpen={setSidebarOpen}
                />
            </aside>
        );
    }

    /* MOBILE */
    return (
        <>
            {/* BACKDROP */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.45 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSidebarOpen(false)}
                        className="fixed inset-0 bg-black z-40"
                    />
                )}
            </AnimatePresence>

            {/* SIDEBAR */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.aside
                        initial={{ x: -280 }}
                        animate={{ x: 0 }}
                        exit={{ x: -280 }}
                        transition={{ type: "spring", stiffness: 260, damping: 26 }}
                        className="fixed top-0 left-0 z-50 h-screen w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700 flex flex-col"
                    >
                        <SidebarContent
                            dark={dark}
                            toggle={toggle}
                            setSidebarOpen={setSidebarOpen}
                        />
                    </motion.aside>
                )}
            </AnimatePresence>
        </>
    );
}

/* =====================
   SIDEBAR CONTENT
===================== */
function SidebarContent({ dark, toggle, setSidebarOpen }) {
    return (
        <>
            {/* LOGO */}
            <div className="px-6 py-6 border-b dark:border-slate-700">
                <div className="flex items-center gap-3">
                    <Image src={Logo} width={40} alt="logo" />
                    <div>
                        <p className="font-semibold text-gray-800 dark:text-white">
                            Nymph Classes
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            School Admin
                        </p>
                    </div>
                </div>
            </div>

            {/* NAV */}
            <nav className="flex-1 px-3 py-6 space-y-1">
                <NavItem
                    href="/dashboard"
                    icon={MdDashboard}
                    label="Dashboard"
                    setSidebarOpen={setSidebarOpen}
                />
                <NavItem
                    href="/students"
                    icon={MdPeople}
                    label="Students"
                    setSidebarOpen={setSidebarOpen}
                />
                <NavItem
                    href="/results"
                    icon={MdSchool}
                    label="Results"
                    setSidebarOpen={setSidebarOpen}
                />
                <NavItem
                    href="/fees"
                    icon={MdMoney}
                    label="Fees"
                    setSidebarOpen={setSidebarOpen}
                />
                <NavItem
                    href="/attendance"
                    icon={MdList}
                    label="Attendance"
                    setSidebarOpen={setSidebarOpen}
                />
            </nav>

            {/* FOOTER */}
            <div className="px-4 py-4 border-t dark:border-slate-700">
                <ThemeSwitch dark={dark} toggle={toggle} />
            </div>
        </>
    );
}

/* =====================
   NAV ITEM
===================== */
const NavItem = ({ href, icon: Icon, label, setSidebarOpen }) => {
    const handleClick = () => {
        if (window.innerWidth < 768) {
            setSidebarOpen(false);
        }
    };

    return (
        <Link href={href} className="block" onClick={handleClick}>
            <motion.div
                whileHover="hover"
                initial="rest"
                animate="rest"
                variants={{
                    rest: { backgroundColor: "rgba(0,0,0,0)" },
                    hover: { backgroundColor: "rgba(99,102,241,0.08)" },
                }}
                className="relative flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer overflow-hidden"
            >
                {/* ACTIVE BAR */}
                <motion.span
                    variants={{
                        rest: { scaleY: 0 },
                        hover: { scaleY: 1 },
                    }}
                    transition={{ duration: 0.25 }}
                    className="absolute left-0 top-0 h-full w-1 bg-indigo-500 origin-top"
                />

                {/* ICON */}
                <motion.div
                    variants={{
                        rest: { scale: 1, rotate: 0 },
                        hover: { scale: 1.15, rotate: -5 },
                    }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="text-indigo-500 dark:text-indigo-400"
                >
                    <Icon size={22} />
                </motion.div>

                {/* LABEL */}
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
    <div className="flex items-center justify-between">
    <span className="text-sm text-gray-600 dark:text-gray-400">
      Appearance
    </span>

        <button
            onClick={toggle}
            className={`relative w-14 h-7 rounded-full transition-colors ${
                dark ? "bg-indigo-600" : "bg-gray-300"
            }`}
        >
            <motion.span
                layout
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow flex items-center justify-center"
                style={{ x: dark ? 28 : 0 }}
            >
                {dark ? (
                    <FiMoon className="text-indigo-600 text-xs" />
                ) : (
                    <FiSun className="text-yellow-500 text-xs" />
                )}
            </motion.span>
        </button>
    </div>
);
