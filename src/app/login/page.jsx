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
        
        setRotateY((mouseX - centerX) / 25);
        setRotateX((centerY - mouseY) / 25);
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
            localStorage.setItem("token", res.data.token);
            toast.success("Identity Verified");
            window.location.href = "/dashboard";
        } catch (err) {
            const msg = err.response?.data?.message || "Access Denied";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-[#f8fafc] dark:bg-[#030712] relative overflow-hidden selection:bg-indigo-500/30">
            
            {/* BACKGROUND ANIMATION */}
            <div className="fixed top-[-20%] left-[-10%] w-[70%] h-[70%] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none animate-pulse"></div>
            <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/5 blur-[120px] rounded-full pointer-events-none"></div>

            {/* LEFT SIDE (Desktop) */}
            <div className="hidden lg:flex w-1/2 relative bg-gray-900 dark:bg-slate-950 items-center justify-center p-20 overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                <div className="relative z-10 max-w-xl">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex p-5 bg-white/5 rounded-[2rem] mb-10 border border-white/10 backdrop-blur-3xl shadow-2xl"
                    >
                        <Image src={Logo} alt="Logo" width={60} height={60} className="invert brightness-0" priority />
                    </motion.div>
                    
                    <motion.h1 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-7xl font-black text-white mb-8 leading-[0.9] tracking-tighter"
                    >
                        Secure <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                            Authentication.
                        </span>
                    </h1 >
                    
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="space-y-6"
                    >
                        <div className="flex items-center gap-4 text-slate-400 font-medium">
                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                                <MdSecurity size={20} />
                            </div>
                            AES-256 encrypted session tokens
                        </div>
                        <div className="flex items-center gap-4 text-slate-400 font-medium">
                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                                <MdAdminPanelSettings size={20} />
                            </div>
                            Restricted administrative dashboard access
                        </div>
                    </motion.div>
                </div>

                {/* Decorative Circles */}
                <div className="absolute top-1/4 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32"></div>
                <div className="absolute bottom-1/4 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -ml-32"></div>
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
                    <div className="bg-white dark:bg-slate-900/60 backdrop-blur-3xl p-8 md:p-12 rounded-[2.5rem] border border-white dark:border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-none relative">
                        <div className="mb-10 text-center lg:text-left">
                            <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-3 tracking-tightest">Sign In</h2>
                            <p className="text-gray-500 dark:text-slate-400 font-bold text-sm uppercase tracking-widest">Admin Portal Access</p>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em] ml-1">Identity (Email)</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                                        <FiMail size={18} />
                                    </div>
                                    <input 
                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-white/5 rounded-2xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all font-medium" 
                                        placeholder="admin@system.io" 
                                        value={email} 
                                        onChange={(e) => setEmail(e.target.value)} 
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em] ml-1">Secret Passcode</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                                        <FiLock size={18} />
                                    </div>
                                    <input 
                                        type={showPass ? "text" : "password"} 
                                        className="w-full pl-12 pr-12 py-4 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-white/5 rounded-2xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all font-medium" 
                                        placeholder="••••••••" 
                                        value={password} 
                                        onChange={(e) => setPassword(e.target.value)} 
                                    />
                                    <button 
                                        onClick={() => setShowPass(!showPass)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-indigo-500 transition-colors"
                                    >
                                        {showPass ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <button 
                                onClick={login} 
                                disabled={loading} 
                                className="w-full py-5 rounded-2xl font-black bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-500/30 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:hover:translate-y-0"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        Access System <MdLogin size={20} />
                                    </>
                                )}
                            </button>
                        </div>
                        
                        <div className="mt-8 text-center lg:hidden">
                             <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">NymphClasses v2.0</p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

