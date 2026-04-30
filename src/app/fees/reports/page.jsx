"use client";

import { useEffect, useState } from "react";
import axios from "@/utils/axios";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { MdArrowBack, MdInsights, MdPieChart, MdBarChart, MdTrendingUp, MdGroups, MdWarning, MdCheckCircle } from "react-icons/md";

export default function FeesReportsPage() {
    const router = useRouter();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get("/fees/analytics")
            .then(res => setData(res.data))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
        </div>
    );

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-7xl mx-auto space-y-8 pb-20">
            {/* HEADER */}
            <div className="glass-card p-8 flex flex-col md:flex-row justify-between items-center bg-white dark:bg-slate-900/60 border-l-[12px] border-l-slate-900">
                <div className="flex items-center gap-6">
                    <button onClick={() => router.back()} className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-900 hover:text-white transition-all shadow-sm">
                        <MdArrowBack size={20} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Intelligence Reports</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">Advanced Financial Analytics & Insights</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* PAYMENT MODES */}
                <div className="glass-card p-8 bg-white dark:bg-slate-900/60">
                    <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <MdPieChart size={16} /> Revenue Channels
                    </h3>
                    <div className="space-y-4">
                        {data?.paymentModeStats?.map(mode => (
                            <div key={mode._id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
                                <span className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase">{mode._id}</span>
                                <span className="px-3 py-1 rounded-lg bg-blue-600 text-white font-black text-[10px]">{mode.total} TX</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* STANDARD WISE */}
                <div className="lg:col-span-2 glass-card p-8 bg-white dark:bg-slate-900/60">
                    <h3 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <MdBarChart size={16} /> Grade-wise Collection
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {data?.standardWise?.map(std => (
                            <div key={std._id} className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 text-center">
                                <p className="text-[9px] font-black text-emerald-600 uppercase mb-2">Std {std._id}</p>
                                <p className="text-lg font-black text-slate-900 dark:text-white">Rs. {std.total.toLocaleString()}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CRITICAL ATTENTION */}
            <div className="glass-card overflow-hidden bg-white dark:bg-slate-900/60">
                <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <h3 className="text-[10px] font-black text-rose-600 uppercase tracking-widest flex items-center gap-2">
                        <MdWarning size={16} /> Critical Arrears (Top 10)
                    </h3>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Action Required</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-white/[0.02]">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Total Commitment</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Amount Paid</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right text-rose-600">Arrears</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                            {data?.topPendingStudents?.map(item => (
                                <tr key={item.student._id} className="hover:bg-rose-500/[0.02] transition-colors">
                                    <td className="px-8 py-5">
                                        <p className="text-xs font-black text-slate-900 dark:text-white">{item.student.name}</p>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Std {item.student.standard}</p>
                                    </td>
                                    <td className="px-8 py-5 text-center text-xs font-bold text-slate-500">Rs. {item.totalFee.toLocaleString()}</td>
                                    <td className="px-8 py-5 text-center">
                                        <span className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 text-[10px] font-black">Rs. {item.totalPaid.toLocaleString()}</span>
                                    </td>
                                    <td className="px-8 py-5 text-right font-black text-rose-600">Rs. {item.remaining.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
}
