"use client";

import { motion } from "framer-motion";
import { MdLockOutline, MdArrowBack, MdLogout } from "react-icons/md";

export default function AccessDenied({ moduleName }) {
    const handleGoBack = () => {
        if (typeof window !== "undefined") {
            window.history.back();
        }
    };

    const handleLogout = () => {
        if (typeof window !== "undefined") {
            localStorage.removeItem("token");
            localStorage.removeItem("admin");
            window.location.href = "/login";
        }
    };

    const displayModuleName = moduleName 
        ? moduleName.replace("/", "").replace("-", " ").toUpperCase() 
        : "THIS SECTION";

    return (
        <div className="flex items-center justify-center min-h-[70vh] px-4">
            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
                className="w-full max-w-lg glass-card p-8 md:p-12 bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-white/20 dark:border-white/5 shadow-2xl rounded-[2.5rem] text-center relative overflow-hidden"
            >
                {/* Background ambient glow inside card */}
                <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-rose-500/10 dark:bg-rose-500/5 blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-blue-500/10 dark:bg-blue-500/5 blur-3xl pointer-events-none" />

                {/* ANIMATED ICON */}
                <motion.div 
                    initial={{ scale: 0.8, rotate: -15 }}
                    animate={{ scale: [0.8, 1.1, 1], rotate: [0, 5, 0] }}
                    transition={{ delay: 0.1, duration: 0.6 }}
                    className="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-500 dark:text-rose-400 flex items-center justify-center mx-auto mb-8 shadow-lg shadow-rose-500/5"
                >
                    <MdLockOutline className="w-10 h-10 md:w-12 md:h-12 animate-pulse" />
                </motion.div>

                {/* TEXT CONTENT */}
                <motion.h2 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tightest leading-tight"
                >
                    Access Denied
                </motion.h2>

                <motion.p 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-blue-600 dark:text-blue-400 font-black uppercase tracking-[0.2em] text-[10px] mt-2.5"
                >
                    Module: {displayModuleName}
                </motion.p>

                <motion.p 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed text-sm md:text-base mt-6 max-w-sm mx-auto"
                >
                    You do not have the required permissions to view this section. Please contact your administrator if you believe this is an error.
                </motion.p>

                <div className="w-full h-px bg-slate-100 dark:bg-slate-800/50 my-8" />

                {/* ACTION BUTTONS */}
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex flex-col sm:flex-row items-center gap-4 justify-center"
                >
                    <button
                        onClick={handleGoBack}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs uppercase tracking-widest transition-all duration-300 shadow-lg shadow-slate-950/20 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 dark:shadow-none"
                    >
                        <MdArrowBack size={16} /> Go Back
                    </button>

                    <button
                        onClick={handleLogout}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-rose-500/5 hover:bg-rose-500/10 text-rose-500 font-bold text-xs uppercase tracking-widest border border-rose-500/10 transition-all duration-300"
                    >
                        <MdLogout size={16} /> Log Out
                    </button>
                </motion.div>
            </motion.div>
        </div>
    );
}
