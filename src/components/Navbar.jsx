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
                h-20 z-30 transition-all duration-300
                flex items-center px-4 md:px-8
                ${scrolled ? 'bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm' : 'bg-transparent'}
            `}
        >
            {/* MOBILE MENU BUTTON & GREETING */}
            <div className="flex items-center gap-4 flex-1">
                <button
                    className="md:hidden p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 shadow-sm active:scale-95 transition-all"
                    onClick={() => setSidebarOpen(true)}
                >
                    <MdMenu size={20} />
                </button>
                <div className="hidden sm:block">
                    <p className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em] mb-0.5">
                        {greeting}
                    </p>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                        Administrative Panel
                    </h2>
                </div>
            </div>

            {/* ACTIONS */}
            <div className="flex items-center gap-4">
                <div className="hidden lg:flex items-center gap-3 px-4 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus-within:ring-2 focus-within:ring-blue-600/20 transition-all">
                    <MdSearch size={18} className="text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Search..." 
                        className="bg-transparent border-none outline-none font-bold text-xs text-slate-700 dark:text-slate-200 w-32 placeholder-slate-400"
                    />
                </div>

                <motion.button 
                    whileTap={{ scale: 0.95 }}
                    className="relative p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 shadow-sm hover:border-blue-600/30 transition-all"
                >
                    <MdNotifications size={20} />
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-blue-600 rounded-full border-2 border-white dark:border-slate-900"></span>
                </motion.button>

                <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block"></div>

                <div className="flex items-center gap-3 pl-1">
                    <div className="text-right hidden sm:block">
                        <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-wider leading-none mb-1">Admin</p>
                        <p className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">Control</p>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-blue-600 p-[2px] shadow-lg shadow-blue-600/20">
                        <div className="h-full w-full rounded-[9px] bg-white dark:bg-slate-900 overflow-hidden relative">
                            <Image src="https://ui-avatars.com/api/?name=Admin&background=2563eb&color=fff&bold=true" alt="Admin" layout="fill" objectFit="cover" />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
