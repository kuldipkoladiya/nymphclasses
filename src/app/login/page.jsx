"use client";

import { useState } from "react";
import axios from "../../utils/axios";
import Image from "next/image";
import Logo from "../../assets/logo.png";
import { FiEye, FiEyeOff, FiMail, FiLock } from "react-icons/fi";
import { MdLogin, MdPeopleAlt, MdList, MdMonetizationOn } from "react-icons/md";
import toast from "react-hot-toast";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
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
        <div className="min-h-screen w-full flex bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans">
            
            {/* LEFT SIDE: BRAND SHOWCASE (Desktop Only) */}
            <div className="hidden lg:flex lg:w-1/2 bg-slate-900 dark:bg-slate-900/50 p-16 flex-col justify-between relative overflow-hidden border-r border-slate-200 dark:border-slate-800">
                {/* Background styling elements */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#2563eb,transparent)] opacity-10 pointer-events-none" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

                {/* Top Logo */}
                <div className="flex items-center gap-3 relative z-10">
                    <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center p-1.5 shadow-sm">
                        <Image src={Logo} alt="Logo" width={28} height={28} className="object-contain" priority />
                    </div>
                    <span className="font-extrabold text-white text-lg tracking-tight uppercase">Nymph Classes</span>
                </div>

                {/* Center Mockup Dashboard Visualization */}
                <div className="my-auto relative z-10 max-w-md w-full space-y-8">
                    <div className="space-y-3">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold text-[10px] uppercase tracking-wider">
                            Management Portal
                        </span>
                        <h2 className="text-4xl font-extrabold text-white tracking-tight leading-tight">
                            Simplify student administration with precision tools.
                        </h2>
                    </div>

                    {/* Portal Features List */}
                    <div className="space-y-5">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/10 text-blue-400 flex items-center justify-center flex-shrink-0">
                                <MdPeopleAlt size={20} />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-white">Student Registry</h4>
                                <p className="text-slate-400 text-xs mt-0.5">Manage and organize detailed student profile logs.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/10 text-emerald-400 flex items-center justify-center flex-shrink-0">
                                <MdList size={20} />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-white">Attendance Tracking</h4>
                                <p className="text-slate-400 text-xs mt-0.5">Track daily student absentees and connection gateway logs.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/10 text-amber-400 flex items-center justify-center flex-shrink-0">
                                <MdMonetizationOn size={20} />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-white">Fee Configuration</h4>
                                <p className="text-slate-400 text-xs mt-0.5">Collect term transactions, manage payments, and view deficits.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer text */}
                <div className="relative z-10">
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Unified Administrative System</p>
                </div>
            </div>

            {/* RIGHT SIDE: SECURE LOGIN FORM (Responsive) */}
            <div className="w-full lg:w-1/2 flex flex-col justify-between p-8 sm:p-16 relative bg-slate-50 dark:bg-slate-950">
                {/* Mobile Header (Hidden on Desktop) */}
                <div className="flex items-center gap-3 lg:hidden">
                    <div className="w-9 h-9 rounded-xl bg-blue-600/10 dark:bg-blue-500/20 border border-blue-600/20 flex items-center justify-center p-1.5">
                        <Image src={Logo} alt="Logo" width={24} height={24} className="object-contain" priority />
                    </div>
                    <span className="font-extrabold text-slate-900 dark:text-white text-base tracking-tight uppercase">Nymph</span>
                </div>

                {/* Center Form Card */}
                <div className="my-auto mx-auto w-full max-w-[380px] space-y-8">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Welcome back</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">
                            Enter your account details to access the management portal.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email Address */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Email address</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors">
                                    <FiMail size={16} />
                                </div>
                                <input 
                                    type="email"
                                    required
                                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 dark:focus:border-indigo-500 transition-all font-medium text-sm placeholder-slate-400" 
                                    placeholder="name@domain.com" 
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)} 
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors">
                                    <FiLock size={16} />
                                </div>
                                <input 
                                    type={showPass ? "text" : "password"} 
                                    required
                                    className="w-full pl-10 pr-11 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 dark:focus:border-indigo-500 transition-all font-medium text-sm placeholder-slate-400" 
                                    placeholder="••••••••" 
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)} 
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowPass(!showPass)}
                                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-655 dark:hover:text-slate-300 transition-colors"
                                >
                                    {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button 
                            type="submit" 
                            disabled={loading} 
                            className="w-full py-2.5 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-1"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    Login Now <MdLogin size={16} />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer copyright */}
                <div className="text-center lg:text-left pt-6 border-t border-slate-200/50 dark:border-slate-800/50">
                    <p className="text-slate-400 dark:text-slate-500 text-[9px] font-bold uppercase tracking-[0.25em]">Nymph Classes © 2026</p>
                </div>
            </div>
        </div>
    );
}
