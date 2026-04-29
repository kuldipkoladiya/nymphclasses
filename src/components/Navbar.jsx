"use client";

import Image from "next/image";
import { MdMenu, MdNotifications, MdSearch } from "react-icons/md";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function Navbar({ setSidebarOpen }) {
    const [scrolled, setScrolled] = useState(false);
    const [greeting, setGreeting] = useState("Welcome");

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        
        const hour = new Date().getHours();
        if (hour < 12) setGreeting("Good Morning");
        else if (hour < 18) setGreeting("Good Afternoon");
        else setGreeting("Good Evening");
        
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header
            className={`
                fixed top-0 left-0 md:left-[280px] right-0
                h-24 z-30 transition-all duration-500
                flex items-center px-6 lg:px-12
                ${scrolled ? 'bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 shadow-sm py-4' : 'bg-transparent py-6'}
            `}
        >
            {/* MOBILE MENU BUTTON & GREETING */}
            <div className="flex items-center gap-6 flex-1">
                <button
                    className={`md:hidden p-3 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all shadow-premium border border-slate-200 dark:border-slate-800`}
                    onClick={() => setSidebarOpen(true)}
                >
                    <MdMenu size={24} />
                </button>
                <div className="hidden sm:block">
                    <div className="flex items-center gap-2 mb-1">
                         <div className="w-1 h-1 rounded-full bg-blue-600"></div>
                         <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">
                            {greeting},
                        </p>
                    </div>
                    <h2 className="text-2xl font-display font-black text-slate-900 dark:text-white tracking-tightest">
                        Administrative Console
                    </h2>
                </div>
            </div>

            {/* ACTIONS */}
            <div className="flex items-center gap-6">
                <div className="hidden md:flex items-center gap-3 px-6 py-3 bg-white/50 dark:bg-slate-900/50 backdrop-blur border border-slate-200 dark:border-slate-800 rounded-[2rem] shadow-inner focus-within:ring-2 focus-within:ring-blue-600/20 transition-all">
                    <MdSearch size={22} className="text-blue-600" />
                    <input 
                        type="text" 
                        placeholder="Search infrastructure..." 
                        className="bg-transparent border-none outline-none font-black text-[11px] uppercase tracking-widest text-slate-700 dark:text-slate-200 w-48 placeholder-slate-400"
                    />
                </div>

                <motion.button 
                    whileHover={{ scale: 1.05, y: -2 }}
                    className="relative p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 shadow-premium group"
                >
                    <MdNotifications size={24} className="group-hover:text-blue-600 transition-colors" />
                    <span className="absolute top-3.5 right-3.5 w-2 h-2 bg-blue-600 rounded-full animate-pulse shadow-premium"></span>
                </motion.button>

                <div className="flex items-center gap-3 group cursor-pointer p-1.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all duration-300">
                    <div className="h-11 w-11 rounded-[1.25rem] bg-blue-600 p-[2px] shadow-premium group-hover:rotate-6 transition-transform">
                        <div className="h-full w-full rounded-[1.15rem] border-2 border-white dark:border-slate-900 bg-white dark:bg-slate-900 overflow-hidden relative">
                            <Image src="https://ui-avatars.com/api/?name=Admin+User&background=2563eb&color=fff&bold=true" alt="Admin" layout="fill" objectFit="cover" />
                        </div>
                    </div>
                    <div className="hidden lg:block">
                        <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-widest leading-none mb-1">Admin User</p>
                        <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">Super Administrator</p>
                    </div>
                </div>
            </div>
        </header>
    );
}
