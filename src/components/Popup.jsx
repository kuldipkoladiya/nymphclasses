"use client";

import { motion, AnimatePresence } from "framer-motion";

export default function Popup({
                                  open,
                                  title,
                                  message,
                                  type = "info",
                                  onClose,
                                  onConfirm,
                              }) {
    if (!open) return null;

    const accent = {
        success: "text-emerald-500",
        error: "text-rose-500",
        info: "text-blue-600",
        confirm: "text-amber-500",
    };

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    className="w-[90%] max-w-md glass-card p-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xl"
                >
                    <h2 className={`text-2xl font-black uppercase tracking-tightest ${accent[type]}`}>
                        {title}
                    </h2>

                    <p className="mt-4 text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                        {message}
                    </p>

                    <div className="mt-10 flex justify-end gap-4">
                        <button
                            onClick={onClose}
                            className="px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                        >
                            Cancel
                        </button>

                        {type === "confirm" ? (
                            <button
                                onClick={onConfirm}
                                className="px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest bg-rose-500 text-white shadow-lg shadow-rose-500/30 hover:bg-rose-600 transition-all"
                            >
                                Confirm
                            </button>
                        ) : (
                            <button
                                onClick={onClose}
                                className="px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest bg-blue-600 text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition-all"
                            >
                                OK
                            </button>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
