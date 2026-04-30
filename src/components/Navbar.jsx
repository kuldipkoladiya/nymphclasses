"use client";

import Image from "next/image";
import { MdMenu, MdNotifications, MdSearch, MdSecurity, MdLogout } from "react-icons/md";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "../assets/logo.png";
import axios from "../utils/axios";

export default function Navbar({ setSidebarOpen }) {
    const [admin, setAdmin] = useState(null);
    const [profileOpen, setProfileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [greeting, setGreeting] = useState("Welcome");

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        
        const hour = new Date().getHours();
        if (hour < 12) setGreeting("Good Morning");
        else if (hour < 18) setGreeting("Good Afternoon");
        else setGreeting("Good Evening");

        // Fetch Real Profile from API
        const fetchProfile = async () => {
            try {
                const res = await axios.get("/auth/profile");
                setAdmin(res.data);
            } catch (err) {
                // Fallback to local storage
                const saved = localStorage.getItem("admin");
                if (saved) setAdmin(JSON.parse(saved));
            }
        };
        fetchProfile();
        
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
            {/* MOBILE LOGO & GREETING */}
            <div className="flex items-center gap-4 flex-1">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center border border-blue-600/20 md:hidden">
                        <Image src={Logo} alt="Logo" width={24} height={24} className="object-contain" />
                    </div>
                    <div className="hidden sm:block">
                        <p className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em] mb-0.5">
                            {greeting}
                        </p>
                        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                            Administrative Panel
                        </h2>
                    </div>
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

                {/* ADMIN PROFILE */}
                <div className="relative">
                    <motion.button 
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setProfileOpen(!profileOpen)}
                        className={`flex items-center gap-3 pl-1 pr-3 py-1.5 rounded-2xl transition-all duration-300 border ${profileOpen ? 'bg-blue-600 border-blue-600 shadow-lg shadow-blue-600/20' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-600/30'}`}
                    >
                        <div className="h-8 w-8 relative flex-shrink-0">
                            <Image src={Logo} alt="Logo" layout="fill" objectFit="contain" priority />
                        </div>
                        <div className="text-right hidden sm:block">
                            <p className={`text-[10px] font-black uppercase tracking-wider leading-none mb-1 ${profileOpen ? 'text-white' : 'text-slate-900 dark:text-white'}`}>Nymph Admin</p>
                            <p className={`text-[8px] font-bold uppercase tracking-widest leading-none ${profileOpen ? 'text-white/70' : 'text-slate-400'}`}>Control Panel</p>
                        </div>
                    </motion.button>

                    <AnimatePresence>
                        {profileOpen && (
                            <>
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100]" 
                                    onClick={() => setProfileOpen(false)} 
                                />
                                
                                <motion.div 
                                    initial={{ y: "100%", opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: "100%", opacity: 0 }}
                                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                    className="
                                        fixed bottom-0 left-0 right-0 rounded-t-[2.5rem] bg-white dark:bg-slate-900 z-[101] p-8 pb-12 shadow-2xl border-t border-blue-600/10
                                        md:absolute md:top-full md:bottom-auto md:left-auto md:right-0 md:mt-4 md:w-80 md:rounded-3xl md:origin-top-right md:translate-y-0
                                    "
                                >
                                    <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mb-8 md:hidden" />

                                    <div className="flex flex-col items-center text-center">
                                        <div className="relative group mb-6">
                                            <div className="w-24 h-24 rounded-[2rem] bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 shadow-xl border border-slate-100 dark:border-slate-800 transition-transform group-hover:scale-105">
                                                <Image src={Logo} alt="Logo" width={64} height={64} className="object-contain" />
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <h3 className="font-black text-slate-900 dark:text-white text-2xl tracking-tightest leading-none">
                                                {admin?.name || "Administrator"}
                                            </h3>
                                            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 lowercase break-all">
                                                {admin?.email || "admin@nymph.edu"}
                                            </p>
                                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-600/10 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest mt-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                                                Super Admin
                                            </div>
                                        </div>
                                        
                                        <div className="w-full h-px bg-slate-100 dark:bg-slate-800 my-8" />
                                        
                                        <div className="w-full space-y-3">
                                            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Account Status</span>
                                                <span className="text-xs font-bold text-emerald-500 flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                    Active
                                                </span>
                                            </div>
                                            
                                            <button 
                                                onClick={() => {
                                                    localStorage.removeItem("token");
                                                    window.location.href = "/login";
                                                }}
                                                className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl bg-rose-500/5 text-rose-500 border border-rose-500/10 hover:bg-rose-500 hover:text-white transition-all font-black text-xs uppercase tracking-widest"
                                            >
                                                <MdLogout size={18} /> Logout Account
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>

                <motion.button 
                    whileTap={{ scale: 0.95 }}
                    className="relative p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 shadow-sm hover:border-blue-600/30 transition-all"
                >
                    <MdNotifications size={20} />
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-blue-600 rounded-full border-2 border-white dark:border-slate-900"></span>
                </motion.button>
            </div>
        </header>
    );
}
