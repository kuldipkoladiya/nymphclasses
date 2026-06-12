import axios from "axios";
import toast from "react-hot-toast";

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
    (response) => response,
    (error) => {
        const message = error.response?.data?.message || "An unexpected error occurred";
        // Only show toast if it's not a 401/403 and we're in the browser
        if (typeof window !== "undefined" && error.response?.status !== 401 && error.response?.status !== 403) {
            toast.custom(
                (t) => (
                    <div
                        className={`${
                            t.visible ? "animate-enter" : "animate-leave"
                        } max-w-md w-full bg-white dark:bg-slate-950 shadow-2xl rounded-2xl pointer-events-auto flex border border-red-200 dark:border-red-900/30 overflow-hidden`}
                    >
                        <div className="flex-1 w-0 p-4">
                            <div className="flex items-start">
                                <div className="flex-shrink-0 pt-0.5">
                                    <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center text-red-500">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="ml-3 flex-1">
                                    <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                                        Error
                                    </p>
                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
                                        {message}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex border-l border-slate-100 dark:border-slate-800">
                            <button
                                onClick={() => toast.dismiss(t.id)}
                                className="w-full border border-transparent rounded-none rounded-r-2xl px-4 flex items-center justify-center text-xs font-black text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-350 focus:outline-none uppercase tracking-widest"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                ),
                { id: "global-error-toast", duration: 6000 }
            );
        }
        return Promise.reject(error);
    }
);

export default instance;
