"use client";

import { useEffect, useState } from "react";
import axios from "@/utils/axios";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { MdArrowBack, MdWarning, MdSearch, MdFilterList, MdPayments, MdPerson, MdEmail } from "react-icons/md";
import toast from "react-hot-toast";
import { STANDARDS } from "@/utils/standards";

export default function PendingFeesPage() {
    const router = useRouter();

    const [standard, setStandard] = useState("");
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");

    const load = async () => {
        if (!standard) return toast.error("Enter standard first.");

        setLoading(true);
        try {
            const res = await axios.get(`/fees/pending?standard=${standard}`);
            setList(res.data || []);
            if (res.data?.length === 0) toast.error("No pending fees found.");
        } catch {
            setList([]);
        } finally {
            setLoading(false);
        }
    };

    const filtered = list.filter(p =>
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.rollNumber?.includes(search)
    );

    const totalDeficit = filtered.reduce((sum, p) => sum + p.remaining, 0);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-7xl mx-auto space-y-6 pb-20">
            {/* HEADER */}
            <div className="glass-card p-8 flex flex-col md:flex-row justify-between items-center bg-white dark:bg-slate-900/60 border-l-[12px] border-l-rose-500">
                <div className="flex items-center gap-6">
                    <button onClick={() => router.back()} className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-rose-600 hover:text-white transition-all shadow-sm">
                        <MdArrowBack size={20} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Deficit Tracker</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">Pending Fees & Arrears</p>
                    </div>
                </div>
                <div className="text-right mt-4 md:mt-0">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Outstanding</p>
                    <p className="text-3xl font-black text-rose-600 tracking-tightest">Rs. {totalDeficit.toLocaleString()}</p>
                </div>
            </div>

            {/* CONTROLS */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-3 relative group">
                    <MdFilterList className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-500 transition-colors" size={20} />
                    <select className="input-premium pl-14 appearance-none cursor-pointer" value={standard} onChange={(e) => setStandard(e.target.value)}>
                        <option value="">Select Class</option>
                        {STANDARDS.map(s => <option key={s} value={s}>Standard {s}</option>)}
                    </select>
                </div>
                <div className="md:col-span-6 relative group">
                    <MdSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-500 transition-colors" size={20} />
                    <input className="input-premium pl-14" placeholder="Search pending list..." value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <button onClick={load} disabled={loading} className="md:col-span-3 btn-primary bg-rose-600 shadow-rose-600/20 hover:bg-rose-700">
                    {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "LOAD DEFAULTERS"}
                </button>
            </div>

            {/* LIST */}
            <div className="glass-card overflow-hidden bg-white dark:bg-slate-900/60">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-slate-800">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Information</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Standard</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Commitment</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Outstanding Amount</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="5" className="px-8 py-6"><div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-lg w-full" /></td>
                                    </tr>
                                ))
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-8 py-20 text-center text-slate-400 font-bold text-[10px] uppercase tracking-widest">No pending fees found for this class</td>
                                </tr>
                            ) : (
                                filtered.map((p) => (
                                    <tr key={p.studentId} className="hover:bg-rose-600/[0.02] transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-rose-600/10 group-hover:text-rose-600 transition-all">
                                                    <MdPerson size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-900 dark:text-white">{p.name}</p>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">ID: {p.rollNumber}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            <span className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-black text-slate-500">STD {p.standard}</span>
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            <div className="flex flex-col items-center gap-1">
                                                <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                    <div className="h-full bg-rose-500" style={{ width: `${100 - parseFloat(p.percentagePaid)}%` }} />
                                                </div>
                                                <span className="text-[9px] font-bold text-rose-500 uppercase tracking-widest">{p.percentagePaid}% Paid</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right font-black text-rose-600">
                                            Rs. {p.remaining.toLocaleString()}
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                <button onClick={() => router.push(`/fees/payments?id=${p.studentId}`)} className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all shadow-sm">
                                                    <MdPayments size={18} />
                                                </button>
                                                <button className="p-2 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                                                    <MdEmail size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
}
