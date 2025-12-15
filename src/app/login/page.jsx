"use client";

import { useState } from "react";
import axios from "@/utils/axios";
import Image from "next/image";
import Logo from "@/assets/logo.png";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const login = async () => {
        if (!email || !password) {
            setError("Email and password are required");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const res = await axios.post("/auth/login", { email, password });
            localStorage.setItem("token", res.data.token);
            window.location.href = "/dashboard";
        } catch {
            setError("Invalid email or password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="
          min-h-screen flex items-center justify-center px-4
          bg-gradient-to-br
          from-purple-100 via-white to-blue-100
          dark:from-slate-900 dark:via-slate-900 dark:to-slate-800
        ">

            {/* CARD */}
            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="
                  w-full max-w-md rounded-3xl p-8
                  bg-white dark:bg-slate-900
                  shadow-2xl border border-slate-200 dark:border-slate-700
                "
            >
                {/* LOGO */}
                <div className="flex justify-center mb-6">
                    <Image src={Logo} alt="Logo" width={70} />
                </div>

                {/* TITLE */}
                <h1 className="text-3xl font-bold text-center text-slate-800 dark:text-white">
                    Welcome Back
                </h1>
                <p className="text-center text-slate-500 dark:text-slate-400 mb-8">
                    Login to Nymph Classes Admin
                </p>

                {/* EMAIL */}
                <div className="mb-5">
                    <label className="label">Email</label>
                    <input
                        type="email"
                        className="input"
                        placeholder="admin@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && login()}
                    />
                </div>

                {/* PASSWORD */}
                <div className="mb-6 relative">
                    <label className="label">Password</label>
                    <input
                        type={showPass ? "text" : "password"}
                        className="input pr-12"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && login()}
                    />
                    <button
                        type="button"
                        className="
                          absolute right-3 top-9
                          text-slate-500 hover:text-slate-700
                          dark:text-slate-400 dark:hover:text-white
                        "
                        onClick={() => setShowPass(!showPass)}
                    >
                        {showPass ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                    </button>
                </div>

                {/* ERROR */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            className="
                              mb-4 text-sm px-4 py-2 rounded-lg
                              bg-red-100 text-red-700
                              dark:bg-red-500/20 dark:text-red-300
                            "
                        >
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* BUTTON */}
                <button
                    onClick={login}
                    disabled={loading}
                    className="
                      w-full py-3 rounded-xl font-semibold
                      bg-gradient-to-r from-purple-600 to-blue-600
                      hover:opacity-90 transition
                      text-white shadow-lg
                      disabled:opacity-60
                    "
                >
                    {loading ? "Signing in..." : "Login"}
                </button>
            </motion.div>

            {/* STYLES */}
            <style jsx>{`
                .label {
                  display: block;
                  margin-bottom: 6px;
                  font-size: 14px;
                  color: #64748b;
                }
                :global(.dark) .label {
                  color: #cbd5f5;
                }
                .input {
                  width: 100%;
                  padding: 12px;
                  border-radius: 12px;
                  border: 1px solid #cbd5e1;
                  background: white;
                  outline: none;
                }
                .input:focus {
                  border-color: #7c3aed;
                  box-shadow: 0 0 0 2px rgba(124,58,237,0.3);
                }
                :global(.dark) .input {
                  background: #020617;
                  border-color: #334155;
                  color: white;
                }
              `}</style>
        </div>
    );
}
