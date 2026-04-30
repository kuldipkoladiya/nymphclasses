"use client";

import { useState } from "react";
import axios from "@/utils/axios";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MdArrowBack, MdPayments, MdAccountBalance, MdHistory, MdDelete, MdEdit, MdCheckCircle, MdReceipt, MdSearch, MdPerson } from "react-icons/md";
import toast from "react-hot-toast";
import Popup from "@/components/Popup";

export default function FeePaymentsPage() {
    const router = useRouter();

    const [studentId, setStudentId] = useState("");
    const [status, setStatus] = useState(null);

    const [amount, setAmount] = useState("");
    const [mode, setMode] = useState("Cash");
    const [note, setNote] = useState("");

    const [loadingStatus, setLoadingStatus] = useState(false);
    const [paying, setPaying] = useState(false);
    const [popup, setPopup] = useState(null);
    const [actionId, setActionId] = useState(null);

    const loadStatus = async () => {
        if (!studentId) return toast.error("Enter student ID");
        setLoadingStatus(true);
        try {
            const res = await axios.get(`/fees/status/${studentId}`);
            setStatus(res.data);
        } catch {
            setStatus(null);
            toast.error("Student not found.");
        } finally {
            setLoadingStatus(false);
        }
    };

    const payFee = async () => {
        if (!studentId || !amount) return toast.error("Amount is required.");
        setPaying(true);
        try {
            await axios.post("/fees/pay", {
                studentId,
                amount,
                paymentMode: mode,
                note,
            });
            toast.success("Payment recorded!");
            setAmount("");
            setNote("");
            loadStatus();
        } catch {
            toast.error("Payment failed.");
        } finally {
            setPaying(false);
        }
    };

    const deletePayment = async () => {
        try {
            await axios.delete(`/fees/pay/${actionId}`);
            toast.success("Payment deleted.");
            loadStatus();
        } catch {
            toast.error("Delete failed.");
        } finally {
            setPopup(null);
            setActionId(null);
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-7xl mx-auto space-y-6 pb-20">
            {/* HEADER */}
            <div className="glass-card p-8 flex flex-col md:flex-row justify-between items-center bg-white dark:bg-slate-900/60">
                <div className="flex items-center gap-6">
                    <button onClick={() => router.back()} className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                        <MdArrowBack size={20} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Finance Management</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">Fee Collections & Payment History</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* LEFT: STATUS & PAYMENT */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="glass-card p-6 bg-white dark:bg-slate-900/60">
                        <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-4">Student Identity</h3>
                        <div className="flex gap-2">
                            <div className="relative flex-1 group">
                                <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600" />
                                <input className="input-premium pl-11 py-2.5 text-sm" placeholder="Student ID..." value={studentId} onChange={(e) => setStudentId(e.target.value)} />
                            </div>
                            <button onClick={loadStatus} disabled={loadingStatus} className="px-4 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20">
                                {loadingStatus ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <MdCheckCircle size={20} />}
                            </button>
                        </div>
                    </div>

                    <AnimatePresence>
                        {status && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                                {/* STATS */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="glass-card p-4 bg-emerald-500/5 border-emerald-500/20">
                                        <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">Paid</p>
                                        <p className="text-xl font-black text-emerald-600 tracking-tight">₹{status.totalPaid}</p>
                                    </div>
                                    <div className="glass-card p-4 bg-rose-500/5 border-rose-500/20">
                                        <p className="text-[9px] font-black text-rose-600 uppercase tracking-widest mb-1">Remaining</p>
                                        <p className="text-xl font-black text-rose-600 tracking-tight">₹{status.remaining}</p>
                                    </div>
                                </div>

                                {/* RECORD NEW */}
                                <div className="glass-card p-6 bg-white dark:bg-slate-900/60">
                                    <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-4">Record New Payment</h3>
                                    <div className="space-y-4">
                                        <div className="relative group">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                            <input type="number" className="input-premium pl-10" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
                                        </div>
                                        <select className="input-premium cursor-pointer" value={mode} onChange={(e) => setMode(e.target.value)}>
                                            <option>Cash</option>
                                            <option>Online</option>
                                            <option>Bank Transfer</option>
                                            <option>Cheque</option>
                                        </select>
                                        <textarea className="input-premium h-20 py-3" placeholder="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} />
                                        <button onClick={payFee} disabled={paying} className="btn-primary w-full py-4 mt-2">
                                            {paying ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><MdPayments size={20} /> Confirm Payment</>}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* RIGHT: HISTORY */}
                <div className="lg:col-span-8">
                    <div className="glass-card overflow-hidden bg-white dark:bg-slate-900/60 min-h-[500px]">
                        <div className="p-6 bg-slate-50/50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-3">
                                <MdHistory className="text-blue-600" /> Transaction Ledger
                            </h3>
                        </div>

                        {!status ? (
                            <div className="flex flex-col items-center justify-center py-40 text-slate-400">
                                <MdReceipt size={60} className="mb-4 opacity-10" />
                                <p className="text-[11px] font-black uppercase tracking-[0.2em]">Select student to view ledger</p>
                            </div>
                        ) : status.paymentHistory?.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-40 text-slate-400">
                                <p className="text-[11px] font-black uppercase tracking-[0.2em]">No payments recorded yet</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-50/30 dark:bg-white/[0.01]">
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Receipt</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Mode</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                        {status.paymentHistory.slice().reverse().map((p) => (
                                            <tr key={p._id} className="hover:bg-blue-600/[0.02] transition-colors group">
                                                <td className="px-8 py-5">
                                                    <p className="text-xs font-black text-slate-700 dark:text-slate-300">{new Date(p.createdAt || p.date).toLocaleDateString()}</p>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{p.note || "Standard Payment"}</p>
                                                </td>
                                                <td className="px-8 py-5 text-center">
                                                    <span className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-black text-slate-500 uppercase tracking-widest">#{p.receiptNo || 'N/A'}</span>
                                                </td>
                                                <td className="px-8 py-5 text-center">
                                                    <span className="px-3 py-1 rounded-lg bg-blue-600/10 text-blue-600 text-[9px] font-black uppercase tracking-widest">{p.paymentMode}</span>
                                                </td>
                                                <td className="px-8 py-5 text-right font-black text-slate-900 dark:text-white">₹{p.amount}</td>
                                                <td className="px-8 py-5">
                                                    <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-all">
                                                        <button 
                                                            onClick={() => {
                                                                setActionId(p._id);
                                                                setPopup({
                                                                    type: "confirm",
                                                                    title: "Remove Payment Entry",
                                                                    message: "Warning: This will void the payment and increase the student's remaining balance."
                                                                });
                                                            }}
                                                            className="p-2 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                                                        >
                                                            <MdDelete size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {popup && <Popup open={true} {...popup} onClose={() => setPopup(null)} onConfirm={deletePayment} />}
        </motion.div>
    );
}
