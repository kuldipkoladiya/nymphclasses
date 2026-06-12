import axios from "axios";
import toast from "react-hot-toast";
import { createPortal } from "react-dom";

const instance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "https://nymph-be.vercel.app/api",
});

instance.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

instance.interceptors.response.use(
    (response) => {
        const message = response.data?.message;
        const method = response.config?.method?.toLowerCase();
        if (message && typeof window !== "undefined" && ["post", "put", "delete"].includes(method)) {
            toast.dismiss();
            toast.custom(
                (t) => {
                    const content = (
                        <div className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-[4px] p-4 transition-all duration-200 ${
                            t.visible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                        }`}>
                            <style>{`
                                @keyframes shrink-progress {
                                    0% { width: 100%; }
                                    100% { width: 0%; }
                                }
                                .toast-progress-bar {
                                    animation: shrink-progress 1000ms linear forwards;
                                }
                            `}</style>
                            <div
                                className={`${
                                    t.visible ? "scale-100" : "scale-95"
                                } transition-all duration-200 max-w-sm w-full bg-white dark:bg-slate-900 shadow-2xl rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 text-center p-8 flex flex-col items-center justify-center gap-5 relative`}
                            >
                                <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-500 shadow-inner relative">
                                    <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin" />
                                    <svg className="w-7 h-7 relative z-10 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                
                                <div className="pb-2">
                                    <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider">
                                        Success
                                    </h3>
                                    <p className="mt-2 text-xs font-bold text-slate-500 dark:text-slate-400 leading-relaxed px-4">
                                        {message}
                                    </p>
                                </div>

                                {/* Animated countdown progress bar */}
                                <div className="absolute bottom-0 left-0 h-1.5 bg-emerald-500 toast-progress-bar" />
                            </div>
                        </div>
                    );

                    if (typeof window !== "undefined" && document.body) {
                        return createPortal(content, document.body);
                    }
                    return content;
                },
                { id: "global-success-toast", duration: 1000 }
            );
        }
        return response;
    },
    (error) => {
        const message = error.response?.data?.message || "An unexpected error occurred";
        // Only show toast if it's not a 401/403 and we're in the browser
        if (typeof window !== "undefined" && error.response?.status !== 401 && error.response?.status !== 403) {
            toast.custom(
                (t) => {
                    const content = (
                        <div className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-[4px] p-4 transition-all duration-200 ${
                            t.visible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                        }`}>
                            <div
                                className={`${
                                    t.visible ? "scale-100" : "scale-95"
                                } transition-all duration-200 max-w-sm w-full bg-white dark:bg-slate-900 shadow-2xl rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 text-center p-6 flex flex-col items-center justify-center gap-4`}
                            >
                                <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center text-red-500 shadow-inner">
                                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                
                                <div>
                                    <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider">
                                        Action Required
                                    </h3>
                                    <p className="mt-2 text-xs font-bold text-slate-500 dark:text-slate-400 leading-relaxed">
                                        {message}
                                    </p>
                                </div>

                                <button
                                    onClick={() => toast.dismiss(t.id)}
                                    className="mt-2 w-full py-3.5 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-red-500/20 active:scale-95 focus:outline-none"
                                >
                                    Dismiss
                                </button>
                            </div>
                        </div>
                    );

                    if (typeof window !== "undefined" && document.body) {
                        return createPortal(content, document.body);
                    }
                    return content;
                },
                { id: "global-error-toast", duration: 8000 }
            );
        }
        return Promise.reject(error);
    }
);

export default instance;
