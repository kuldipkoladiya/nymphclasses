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
        success: "text-green-500",
        error: "text-red-500",
        info: "text-indigo-500",
        confirm: "text-yellow-500",
    };

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <motion.div
                    initial={{ scale: 0.92, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.92, y: 20 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className="
            w-[90%] max-w-sm rounded-2xl p-6
            bg-white dark:bg-slate-900
            border border-gray-200 dark:border-slate-700
            shadow-xl
          "
                >
                    <h2 className={`text-lg font-semibold ${accent[type]}`}>
                        {title}
                    </h2>

                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        {message}
                    </p>

                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="
                px-4 py-2 rounded-lg text-sm
                border border-gray-300 dark:border-slate-600
                text-gray-700 dark:text-gray-300
                hover:bg-gray-100 dark:hover:bg-slate-800
              "
                        >
                            Cancel
                        </button>

                        {type === "confirm" ? (
                            <button
                                onClick={onConfirm}
                                className="px-4 py-2 rounded-lg text-sm bg-red-600 text-white"
                            >
                                Confirm
                            </button>
                        ) : (
                            <button
                                onClick={onClose}
                                className="px-4 py-2 rounded-lg text-sm bg-indigo-600 text-white"
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
