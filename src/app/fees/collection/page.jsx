"use client";

import { useEffect, useState } from "react";
import axios from "@/utils/axios";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MdArrowBack, MdHistory, MdSearch, MdFilterList, MdFileDownload, MdPayments, MdPerson, MdCalendarMonth, MdReceipt, MdDelete } from "react-icons/md";
import toast from "react-hot-toast";
import Popup from "@/components/Popup";

export default function CollectionPage() {
    const router = useRouter();
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterMode, setFilterMode] = useState("");
    const [popup, setPopup] = useState(null);
    const [deleteId, setDeleteId] = useState(null);

    useEffect(() => {
        loadPayments();
    }, []);

    const loadPayments = async () => {
        setLoading(true);
        try {
            const res = await axios.get("/fees/all-payments");
            setPayments(res.data || []);
        } catch {
            // Handled by interceptor
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = async () => {
        try {
            await axios.delete(`/fees/pay/${deleteId}`);
            toast.success("Payment removed");
            setPayments(p => p.filter(x => x._id !== deleteId));
        } catch {
            toast.error("Delete failed");
        } finally {
            setPopup(null);
            setDeleteId(null);
        }
    };

    const filtered = payments.filter(p => {
        const student = p.studentId || {};
        const matchesSearch = 
            student.name?.toLowerCase().includes(search.toLowerCase()) || 
            student.rollNumber?.includes(search) ||
            p.receiptNo?.includes(search);
        
        const matchesMode = filterMode ? p.paymentMode === filterMode : true;
        
        return matchesSearch && matchesMode;
    });

    const totalCollected = filtered.reduce((sum, p) => sum + p.amount, 0);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-7xl mx-auto space-y-6 pb-20">
            {/* HEADER */}
            <div className="glass-card p-8 flex flex-col md:flex-row justify-between items-center bg-white dark:bg-slate-900/60 border-l-[12px] border-l-emerald-500">
                <div className="flex items-center gap-6">
                    <button onClick={() => router.back()} className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-emerald-600 hover:text-white transition-all shadow-sm">
                        <MdArrowBack size={20} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Collection Registry</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">Global Payment Transaction Log</p>
                    </div>
                </div>
                <div className="text-right mt-4 md:mt-0">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Filtered Collection</p>
                    <p className="text-3xl font-black text-emerald-600 tracking-tightest">₹{totalCollected.toLocaleString()}</p>
                </div>
            </div>

            {/* FILTERS */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-8 relative group">
                    <MdSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                    <input 
                        className="input-premium pl-14" 
                        placeholder="Search by Name, Roll No or Receipt..." 
                        value={search} 
                        onChange={(e) => setSearch(e.target.value)} 
                    />
                </div>
                <div className="md:col-span-4 relative group">
                    <MdFilterList className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                    <select 
                        className="input-premium pl-14 appearance-none cursor-pointer" 
                        value={filterMode} 
                        onChange={(e) => setFilterMode(e.target.value)}
                    >
                        <option value="">All Payment Modes</option>
                        <option>Cash</option>
                        <option>Online</option>
                        <option>Cheque</option>
                        <option>Bank Transfer</option>
                    </select>
                </div>
            </div>

            {/* LIST */}
            <div className="glass-card overflow-hidden bg-white dark:bg-slate-900/60">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-slate-800">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction Date</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Details</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Receipt</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Mode</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                            {loading ? (
                                Array.from({ length: 8 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="6" className="px-8 py-6"><div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-lg w-full" /></td>
                                    </tr>
                                ))
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-8 py-20 text-center text-slate-400 font-bold text-[10px] uppercase tracking-widest">No transactions found matching filters</td>
                                </tr>
                            ) : (
                                filtered.map((p) => (
                                    <tr key={p._id} className="hover:bg-emerald-600/[0.02] transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                                    <MdCalendarMonth size={16} />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-slate-900 dark:text-white">{new Date(p.createdAt || p.date).toLocaleDateString()}</p>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{new Date(p.createdAt || p.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-600/10 text-blue-600 flex items-center justify-center">
                                                    <MdPerson size={16} />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-slate-900 dark:text-white">{p.studentId?.name || "Deleted Student"}</p>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Roll: {p.studentId?.rollNumber || "N/A"}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            <span className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-black text-slate-500 uppercase tracking-widest border border-slate-200 dark:border-slate-700">
                                                #{p.receiptNo || "N/A"}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${p.paymentMode === 'Cash' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                                                {p.paymentMode}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right font-black text-slate-900 dark:text-white">
                                            ₹{p.amount.toLocaleString()}
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-all">
                                                <button 
                                                    onClick={() => {
                                                        setDeleteId(p._id);
                                                        setPopup({
                                                            type: "confirm",
                                                            title: "Void Transaction",
                                                            message: "Are you sure you want to delete this payment record? This will adjust the student's remaining balance."
                                                        });
                                                    }}
                                                    className="p-2 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                                                >
                                                    <MdDelete size={18} />
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

            {popup && <Popup open={true} {...popup} onClose={() => setPopup(null)} onConfirm={confirmDelete} />}
        </motion.div>
    );
}
