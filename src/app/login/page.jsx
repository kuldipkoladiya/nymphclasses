"use client";

import { useState, useRef } from "react";
import axios from "../../utils/axios";
import Image from "next/image";
import Logo from "../../assets/logo.png";
import { FiEye, FiEyeOff, FiMail, FiLock } from "react-icons/fi";
import { MdLogin, MdAdminPanelSettings, MdSecurity } from "react-icons/md";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);

    // 3D Tilt Logic
    const cardRef = useRef(null);
    const [rotateX, setRotateX] = useState(0);
    const [rotateY, setRotateY] = useState(0);

    const handleMouseMove = (e) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        
        setRotateY((mouseX - centerX) / 30);
        setRotateX((centerY - mouseY) / 30);
    };

    const handleMouseLeave = () => {
        setRotateX(0);
        setRotateY(0);
    };

    const login = async () => {
        if (!email || !password) {
            toast.error("Credentials required");
            return;
        }
        setLoading(true);
        try {
            const res = await axios.post("/auth/login", { email, password });
            if (typeof window !== "undefined") {
                localStorage.setItem("token", res.data.token);
                toast.success("Identity Verified");
                window.location.href = "/dashboard";
            }
        } catch (err) {
            // Error handled by axios interceptor
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 relative overflow-hidden selection:bg-blue-500/30">
            
            <div className="purple-blobs-bg" />

            {/* LEFT SIDE (Desktop) */}
            <div className="hidden lg:flex w-1/2 relative bg-slate-900 items-center justify-center p-20 overflow-hidden border-r border-white/5">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                <div className="relative z-10 max-w-xl">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex p-5 bg-white/5 rounded-[2.5rem] mb-12 border border-white/10 backdrop-blur-3xl shadow-2xl"
                    >
                        <Image src={Logo} alt="Logo" width={64} height={64} className="invert brightness-0" priority />
                    </motion.div>
                    
                    <motion.h1 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-7xl font-black text-white mb-10 leading-[0.85] tracking-tightest"
                    >
                        Unified <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                            Command.
                        </span>
                    </motion.h1>
                    
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="space-y-8"
                    >
                        <div className="flex items-center gap-6 text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 text-blue-400">
                                <MdSecurity size={24} />
                            </div>
                            Encrypted Authentication Layer
                        </div>
                        <div className="flex items-center gap-6 text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 text-emerald-400">
                                <MdAdminPanelSettings size={24} />
                            </div>
                            System-Level Administration
                        </div>
                    </motion.div>
                </div>

            </div>

            {/* RIGHT SIDE (Form) */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 relative z-10">
                <motion.div 
                    ref={cardRef}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    style={{ 
                        perspective: 1000,
                        rotateX,
                        rotateY,
                        transformStyle: "preserve-3d"
                    }}
                    initial={{ opacity: 0, y: 40 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className="w-full max-w-md"
                >
                    <div className="glass-card p-10 md:p-14 bg-white/80 dark:bg-slate-900/60 backdrop-blur-3xl border border-white dark:border-slate-800 shadow-premium relative">
                        <div className="mb-12 text-center lg:text-left">
                            <h2 className="text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tightest">Secure Login</h2>
                            <p className="text-slate-500 dark:text-slate-400 font-black text-[10px] uppercase tracking-[0.3em]">Accessing NymphClasses Infrastructure</p>
                        </div>

                        <div className="space-y-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.25em] ml-1">Identity (Email)</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                                        <FiMail size={20} />
                                    </div>
                                    <input 
                                        className="w-full pl-14 pr-5 py-5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all font-bold" 
                                        placeholder="admin@system.io" 
                                        value={email} 
                                        onChange={(e) => setEmail(e.target.value)} 
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.25em] ml-1">Secret Passcode</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                                        <FiLock size={20} />
                                    </div>
                                    <input 
                                        type={showPass ? "text" : "password"} 
                                        className="w-full pl-14 pr-14 py-5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all font-bold" 
                                        placeholder="••••••••" 
                                        value={password} 
                                        onChange={(e) => setPassword(e.target.value)} 
                                    />
                                    <button 
                                        onClick={() => setShowPass(!showPass)}
                                        className="absolute inset-y-0 right-0 pr-5 flex items-center text-slate-400 hover:text-blue-500 transition-colors"
                                    >
                                        {showPass ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                                    </button>
                                </div>
                            </div>

                            <button 
                                onClick={login} 
                                disabled={loading} 
                                className="w-full py-6 rounded-2xl font-black bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 text-white shadow-2xl hover:-translate-y-1.5 active:translate-y-0 transition-all flex items-center justify-center gap-4 disabled:opacity-50 disabled:hover:translate-y-0 group"
                            >
                                {loading ? (
                                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        Establish Connection <MdLogin size={24} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>
                        
                        <div className="mt-12 text-center lg:hidden">
                             <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em]">NymphClasses v2.1.0</p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

