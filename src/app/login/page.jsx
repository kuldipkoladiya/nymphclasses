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
                localStorage.setItem("admin", JSON.stringify(res.data.admin));
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
            <div className="hidden lg:flex w-1/2 relative bg-slate-950 items-center justify-center p-24 overflow-hidden border-r border-slate-800">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#1e293b,transparent)] opacity-50"></div>
                <div className="relative z-10 max-w-xl">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex p-6 bg-white dark:bg-slate-900 rounded-[2rem] mb-10 border border-slate-200 dark:border-slate-800 shadow-2xl"
                    >
                        <Image src={Logo} alt="Logo" width={64} height={64} className="object-contain" priority />
                    </motion.div>
                    
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-6xl font-black text-white mb-8 tracking-tightest leading-none"
                    >
                        Nymph <br />
                        <span className="text-blue-500">Classes.</span>
                    </motion.h1>
                    
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-400 text-lg font-medium leading-relaxed mb-10"
                    >
                        Access the most advanced administrative tools for Nymph Classes. Secure, fast, and unified.
                    </motion.p>

                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="space-y-6"
                    >
                        <div className="flex items-center gap-4 text-slate-300 font-bold uppercase tracking-widest text-[9px]">
                            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center border border-slate-800 text-blue-500 shadow-sm">
                                <MdSecurity size={20} />
                            </div>
                            Secure
                        </div>
                        <div className="flex items-center gap-4 text-slate-300 font-bold uppercase tracking-widest text-[9px]">
                            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center border border-slate-800 text-emerald-500 shadow-sm">
                                <MdAdminPanelSettings size={20} />
                            </div>
                            Admin
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* RIGHT SIDE (Form) */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 relative z-10">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className="w-full max-w-md"
                >
                    <div className="glass-card p-10 md:p-12 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xl relative">
                        <div className="mb-10">
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Login</h2>
                            <p className="text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">Admin Access</p>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Email</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                                        <FiMail size={18} />
                                    </div>
                                    <input 
                                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600/50 transition-all font-bold text-sm" 
                                        placeholder="admin@nymph.edu" 
                                        value={email} 
                                        onChange={(e) => setEmail(e.target.value)} 
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Password</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                                        <FiLock size={18} />
                                    </div>
                                    <input 
                                        type={showPass ? "text" : "password"} 
                                        className="w-full pl-12 pr-12 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600/50 transition-all font-bold text-sm" 
                                        placeholder="••••••••" 
                                        value={password} 
                                        onChange={(e) => setPassword(e.target.value)} 
                                    />
                                    <button 
                                        onClick={() => setShowPass(!showPass)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-blue-600 transition-colors"
                                    >
                                        {showPass ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <button 
                                onClick={login} 
                                disabled={loading} 
                                className="w-full py-4 rounded-2xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        Login Now <MdLogin size={20} />
                                    </>
                                )}
                            </button>
                        </div>
                        
                        <div className="mt-10 text-center">
                             <p className="text-slate-400 text-[9px] font-bold uppercase tracking-[0.3em]">Nymph Classes © 2024</p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

