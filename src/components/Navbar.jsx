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
                flex items-center px-6 lg:px-10
                ${scrolled ? 'bg-white/80 dark:bg-darkCard/80 backdrop-blur-lg border-b border-secondary-200 dark:border-darkBorder shadow-sm py-4' : 'bg-transparent py-6'}
            `}
        >
            {/* MOBILE MENU BUTTON & GREETING */}
            <div className="flex items-center gap-4 flex-1">
                <button
                    className={`md:hidden p-2 rounded-xl bg-white/50 dark:bg-darkCard/50 hover:bg-white dark:hover:bg-darkBorder text-secondary-700 dark:text-secondary-200 transition-colors shadow-sm border border-secondary-200 dark:border-darkBorder`}
                    onClick={() => setSidebarOpen(true)}
                >
                    <MdMenu size={24} />
                </button>
                <div className="hidden sm:block">
                    <p className="text-xs font-bold text-secondary-500 dark:text-secondary-400 leading-tight uppercase tracking-widest">
                        {greeting},
                    </p>
                    <h2 className="text-2xl font-display font-bold text-secondary-900 dark:text-white">
                        Admin User
                    </h2>
                </div>
            </div>

            {/* ACTIONS */}
            <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-darkBg/60 backdrop-blur border border-secondary-200 dark:border-darkBorder rounded-full shadow-inner text-secondary-400 focus-within:ring-1 focus-within:ring-primary-500 transition-all">
                    <MdSearch size={20} className="text-primary-500" />
                    <input 
                        type="text" 
                        placeholder="Search..." 
                        className="bg-transparent border-none outline-none font-medium text-sm text-secondary-700 dark:text-secondary-200 w-40"
                    />
                </div>

                <motion.button 
                    whileHover={{ scale: 1.05 }}
                    className="relative p-2.5 rounded-full bg-white dark:bg-darkBg border border-secondary-200 dark:border-darkBorder text-secondary-600 dark:text-secondary-300 shadow-sm"
                >
                    <MdNotifications size={22} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-primary-500 rounded-full animate-pulse shadow-neon"></span>
                </motion.button>

                <div className="h-10 w-10 rounded-full bg-primary-500 p-[2px] cursor-pointer shadow-neon">
                    <div className="h-full w-full rounded-full border-2 border-white dark:border-darkCard bg-white dark:bg-darkBg overflow-hidden relative">
                        <Image src="https://ui-avatars.com/api/?name=Admin+User&background=8b5cf6&color=fff&bold=true" alt="Admin" layout="fill" objectFit="cover" />
                    </div>
                </div>
            </div>
        </header>
    );
}
