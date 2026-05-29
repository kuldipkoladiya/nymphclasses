"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "@/utils/axios";
import { motion, AnimatePresence } from "framer-motion";
import { FaWhatsapp, FaCheckCircle, FaArrowLeft, FaSync } from "react-icons/fa";
import toast from "react-hot-toast";

export default function WhatsAppConnectionPage() {
    const router = useRouter();
    const [statusData, setStatusData] = useState({
        status: "initializing",
        message: "Connecting to backend...",
        qrCodeUrl: null
    });
    const [loading, setLoading] = useState(false);
    const intervalRef = useRef(null);

    const checkWhatsAppStatus = async (showToast = false) => {
        setLoading(true);
        try {
            const res = await axios.get("/results/whatsapp-status");
            setStatusData(res.data);
            if (showToast) {
                if (res.data.status === "authenticated") {
                    toast.success("WhatsApp is connected!");
                } else if (res.data.status === "scan_required") {
                    toast.success("New QR code generated!");
                } else {
                    toast.loading("WhatsApp is initializing...", { duration: 2000 });
                }
            }
        } catch (error) {
            console.error("Failed to load status:", error);
            setStatusData({
                status: "error",
                message: "Unable to reach the WhatsApp server. Please ensure the backend is running.",
                qrCodeUrl: null
            });
            if (showToast) toast.error("Failed to fetch WhatsApp status.");
        } finally {
            setLoading(false);
        }
    };

    // Auto-poll WhatsApp status every 5 seconds
    useEffect(() => {
        checkWhatsAppStatus();
        intervalRef.current = setInterval(() => {
            checkWhatsAppStatus();
        }, 5000);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="max-w-2xl mx-auto space-y-6 pb-20 pt-6"
        >
            {/* HEADER */}
            <div className="glass-card p-6 flex items-center justify-between bg-white dark:bg-slate-900/60">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => router.back()} 
                        className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                    >
                        <FaArrowLeft size={16} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">WhatsApp Link</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-bold text-[9px] uppercase tracking-widest mt-0.5">Device Authentication</p>
                    </div>
                </div>
                
                <button 
                    onClick={() => checkWhatsAppStatus(true)} 
                    disabled={loading} 
                    className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-green-600 hover:text-white transition-all disabled:opacity-50"
                >
                    <FaSync size={16} className={loading ? "animate-spin" : ""} />
                </button>
            </div>

            {/* STATUS CONTAINER */}
            <div className="glass-card p-8 bg-white dark:bg-slate-900/60 text-center flex flex-col items-center justify-center min-h-[450px]">
                <AnimatePresence mode="wait">
                    {/* 1. INITIALIZING */}
                    {statusData.status === "initializing" && (
                        <motion.div 
                            key="initializing"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex flex-col items-center space-y-6"
                        >
                            <div className="w-16 h-16 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
                            <div>
                                <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider">Initializing Client</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-sm">
                                    The server is launching the WhatsApp container. This can take up to 20 seconds. Please wait...
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {/* 2. AUTHENTICATED / READY */}
                    {statusData.status === "authenticated" && (
                        <motion.div 
                            key="authenticated"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex flex-col items-center space-y-6"
                        >
                            <div className="w-24 h-24 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center border-2 border-green-500/20 shadow-xl shadow-green-500/10 animate-pulse">
                                <FaCheckCircle size={48} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center justify-center gap-2">
                                    <FaWhatsapp className="text-green-500" /> WhatsApp Connected
                                </h3>
                                <p className="text-xs font-bold text-green-500 uppercase tracking-widest mt-1">Status: Active & Online</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 max-w-md">
                                    Your personal WhatsApp number has successfully authenticated. You can now publish results and send PDFs to students directly from the dashboard!
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {/* 3. SCAN REQUIRED (QR CODE DISPLAY) */}
                    {statusData.status === "scan_required" && (
                        <motion.div 
                            key="scan_required"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex flex-col items-center space-y-6 w-full"
                        >
                            <div className="bg-white p-6 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800/20 max-w-[320px]">
                                {statusData.qrCodeUrl ? (
                                    <img 
                                        src={statusData.qrCodeUrl} 
                                        alt="WhatsApp QR Code" 
                                        className="w-[250px] h-[250px] object-contain rounded-2xl"
                                    />
                                ) : (
                                    <div className="w-[250px] h-[250px] flex items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-2xl">
                                        <div className="w-8 h-8 border-4 border-slate-300 border-t-slate-800 rounded-full animate-spin" />
                                    </div>
                                )}
                            </div>
                            
                            <div className="space-y-4 max-w-md">
                                <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center justify-center gap-2">
                                    <FaWhatsapp className="text-green-500" /> Scan QR to Link
                                </h3>
                                <ol className="text-left text-xs text-slate-500 dark:text-slate-400 space-y-2 list-decimal pl-5">
                                    <li>Open **WhatsApp** on your phone.</li>
                                    <li>Tap **Menu** (Android) or **Settings** (iPhone).</li>
                                    <li>Tap **Linked Devices** and then **Link a Device**.</li>
                                    <li>Point your camera at this screen to capture the QR code.</li>
                                </ol>
                                <p className="text-[10px] text-slate-400 italic mt-2 animate-pulse">
                                    The status page will automatically update once authenticated.
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {/* 4. ERROR */}
                    {statusData.status === "error" && (
                        <motion.div 
                            key="error"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex flex-col items-center space-y-6"
                        >
                            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center border border-red-500/20">
                                <FaWhatsapp size={32} className="opacity-50" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-red-500 uppercase tracking-wider">Connection Failure</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-sm">
                                    {statusData.message}
                                </p>
                            </div>
                            <button 
                                onClick={() => checkWhatsAppStatus(true)}
                                className="px-6 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs uppercase tracking-wider hover:bg-blue-600 hover:text-white transition-all"
                            >
                                Retry Connection
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
