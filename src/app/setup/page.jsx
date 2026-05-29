"use client";

import { useState } from "react";
import axios from "../../utils/axios";
import Image from "next/image";
import Logo from "../../assets/logo.png";
import { FiEye, FiEyeOff, FiMail, FiLock, FiUser, FiKey } from "react-icons/fi";
import { MdAdminPanelSettings, MdSecurity, MdVerified, MdWarning } from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

export default function SetupPage() {
    const [step, setStep] = useState(1); // 1 = secret key, 2 = create account
    const [secretKey, setSecretKey] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [keyLoading, setKeyLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Step 1 — Verify the setup key against the backend before showing the form
    const verifySecretKey = async (e) => {
        e.preventDefault();
        if (!secretKey.trim()) {
            toast.error("Please enter the setup secret key");
            return;
        }

        setKeyLoading(true);
        try {
            await axios.post("/auth/verify-setup-key", { setupKey: secretKey });
            // Key is valid → proceed to Step 2
            setStep(2);
        } catch (err) {
            // Error toast is already shown by the axios interceptor
            // Extra: shake the input back to step 1 (already there)
            setSecretKey(""); // clear wrong key
        } finally {
            setKeyLoading(false);
        }
    };


    const handleSetup = async (e) => {
        e.preventDefault();
        if (!name || !email || !password || !confirmPassword) {
            toast.error("All fields are required");
            return;
        }
        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }
        if (password.length < 8) {
            toast.error("Password must be at least 8 characters");
            return;
        }

        setLoading(true);
        try {
            const res = await axios.post("/auth/setup", {
                name,
                email,
                password,
                setupKey: secretKey,
            });
            toast.success(res.data.message || "Superadmin created successfully!");
            setSuccess(true);
        } catch (err) {
            if (err.response?.status === 403) {
                toast.error("Invalid setup key. Go back and try again.");
                setStep(1);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 relative overflow-hidden selection:bg-blue-500/30">
            
            <div className="purple-blobs-bg" />

            {/* LEFT PANEL */}
            <div className="hidden lg:flex w-1/2 relative bg-slate-950 items-center justify-center p-24 overflow-hidden border-r border-slate-800">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#1e293b,transparent)] opacity-50" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_40%,rgba(234,179,8,0.05),transparent_60%)]" />
                <div className="relative z-10 max-w-xl">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex p-6 bg-white dark:bg-slate-900 rounded-[2rem] mb-10 border border-slate-200 dark:border-slate-800 shadow-2xl"
                    >
                        <Image src={Logo} alt="Logo" width={64} height={64} className="object-contain" priority />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-black uppercase tracking-widest mb-6"
                    >
                        <MdWarning size={14} />
                        One-Time Setup
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="text-6xl font-black text-white mb-6 tracking-tightest leading-none"
                    >
                        Admin <br />
                        <span className="text-amber-400">Setup.</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-400 text-base font-medium leading-relaxed mb-10"
                    >
                        Create the master superadmin account for Nymph Classes. This route works only once — when no admin exists.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="space-y-4"
                    >
                        {[
                            { icon: MdSecurity, color: "text-amber-400", text: "Protected by secret key" },
                            { icon: MdAdminPanelSettings, color: "text-blue-400", text: "Full superadmin access" },
                            { icon: MdVerified, color: "text-emerald-400", text: "One-time registration only" },
                        ].map(({ icon: Icon, color, text }) => (
                            <div key={text} className="flex items-center gap-4 text-slate-300 font-bold uppercase tracking-widest text-[9px]">
                                <div className={`w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center border border-slate-800 ${color} shadow-sm`}>
                                    <Icon size={20} />
                                </div>
                                {text}
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>

            {/* RIGHT PANEL */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md"
                >
                    <AnimatePresence mode="wait">

                        {/* SUCCESS STATE */}
                        {success && (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="glass-card p-12 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xl text-center"
                            >
                                <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/20 flex items-center justify-center text-emerald-500 mx-auto mb-6">
                                    <MdVerified size={40} />
                                </div>
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-3">Setup Complete!</h2>
                                <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">
                                    Your superadmin account has been created. You can now log in.
                                </p>
                                <button
                                    onClick={() => window.location.href = "/login"}
                                    className="w-full py-4 rounded-2xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 transition-all"
                                >
                                    Go to Login →
                                </button>
                                <p className="mt-6 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                    This setup page will now be locked permanently.
                                </p>
                            </motion.div>
                        )}

                        {/* STEP 1 — SECRET KEY */}
                        {!success && step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="glass-card p-10 md:p-12 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xl"
                            >
                                <div className="mb-8">
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-black uppercase tracking-widest mb-4">
                                        <MdWarning size={12} />
                                        Step 1 of 2
                                    </div>
                                    <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Enter Setup Key</h2>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                                        Provide the secret key set in your backend <code className="text-amber-500 bg-amber-50 dark:bg-amber-950/30 px-1.5 py-0.5 rounded text-xs font-mono">.env</code> file to proceed.
                                    </p>
                                </div>

                                <form onSubmit={verifySecretKey} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
                                            Secret Setup Key
                                        </label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-amber-500 transition-colors">
                                                <FiKey size={18} />
                                            </div>
                                            <input
                                                type={showPass ? "text" : "password"}
                                                value={secretKey}
                                                onChange={(e) => setSecretKey(e.target.value)}
                                                className="w-full pl-12 pr-12 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500/50 transition-all font-bold text-sm"
                                                placeholder="Enter your secret key..."
                                                autoComplete="off"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPass(!showPass)}
                                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-amber-500 transition-colors"
                                            >
                                                {showPass ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={keyLoading}
                                        className="w-full py-4 rounded-2xl font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-3 disabled:opacity-60"
                                    >
                                        {keyLoading ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>Continue <span>→</span></>
                                        )}
                                    </button>
                                </form>

                                <div className="mt-8 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1">Where is the setup key?</p>
                                    <p className="text-xs text-slate-600 dark:text-slate-400">
                                        Set <code className="text-amber-500 font-mono">SETUP_SECRET_KEY=yourkey</code> in your backend <code className="font-mono">.env</code> file.
                                    </p>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 2 — CREATE SUPERADMIN */}
                        {!success && step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="glass-card p-10 md:p-12 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xl"
                            >
                                <div className="mb-8">
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[10px] font-black uppercase tracking-widest mb-4">
                                        <MdAdminPanelSettings size={12} />
                                        Step 2 of 2
                                    </div>
                                    <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Create Superadmin</h2>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                                        Set up your master admin credentials. Keep these safe.
                                    </p>
                                </div>

                                <form onSubmit={handleSetup} className="space-y-5">
                                    {/* Name */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
                                            Full Name
                                        </label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                                                <FiUser size={18} />
                                            </div>
                                            <input
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600/50 transition-all font-bold text-sm"
                                                placeholder="Your full name"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
                                            Email Address
                                        </label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                                                <FiMail size={18} />
                                            </div>
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600/50 transition-all font-bold text-sm"
                                                placeholder="admin@nymphclasses.com"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Password */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
                                            Password
                                        </label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                                                <FiLock size={18} />
                                            </div>
                                            <input
                                                type={showPass ? "text" : "password"}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="w-full pl-12 pr-12 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600/50 transition-all font-bold text-sm"
                                                placeholder="Min. 8 characters"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPass(!showPass)}
                                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-blue-600 transition-colors"
                                            >
                                                {showPass ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Confirm Password */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
                                            Confirm Password
                                        </label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                                                <FiLock size={18} />
                                            </div>
                                            <input
                                                type={showConfirm ? "text" : "password"}
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="w-full pl-12 pr-12 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600/50 transition-all font-bold text-sm"
                                                placeholder="Re-enter password"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirm(!showConfirm)}
                                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-blue-600 transition-colors"
                                            >
                                                {showConfirm ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                            </button>
                                        </div>
                                        {confirmPassword && password !== confirmPassword && (
                                            <p className="text-xs text-rose-500 font-bold ml-1">Passwords do not match</p>
                                        )}
                                    </div>

                                    <div className="flex gap-3 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => setStep(1)}
                                            className="px-5 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all"
                                        >
                                            ←
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="flex-1 py-4 rounded-2xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                        >
                                            {loading ? (
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <>
                                                    Create Superadmin <MdAdminPanelSettings size={20} />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        )}

                    </AnimatePresence>

                    <p className="text-center text-slate-400 text-[9px] font-bold uppercase tracking-[0.3em] mt-6">
                        Nymph Classes · Admin Setup
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
