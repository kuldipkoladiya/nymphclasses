"use client";

import { useEffect, useState } from "react";
import axios from "@/utils/axios";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MdArrowBack, MdSettings, MdClass, MdCurrencyRupee, MdSave, MdDelete, MdInfo, MdAddCircle } from "react-icons/md";
import toast from "react-hot-toast";
import Popup from "@/components/Popup";

export default function FeeStructurePage() {
    const router = useRouter();
    const [standard, setStandard] = useState("");
    const [fee, setFee] = useState("");
    const [structures, setStructures] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [popup, setPopup] = useState(null);
    const [deleteId, setDeleteId] = useState(null);

    useEffect(() => {
        loadStructures();
    }, []);

    const loadStructures = async () => {
        try {
            const res = await axios.get("/fees/all");
            setStructures(res.data || []);
        } catch {
            // Error handled by interceptor
        } finally {
            setFetching(false);
        }
    };

    const submit = async () => {
        if (!standard || !fee) return toast.error("Fill all fields");

        setLoading(true);
        try {
            await axios.post("/fees/structure", {
                standard,
                yearlyFee: fee,
            });
            toast.success("Structure updated");
            setStandard("");
            setFee("");
            loadStructures();
        } catch {
            toast.error("Failed to save");
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = async () => {
        try {
            await axios.delete(`/fees/${deleteId}`);
            toast.success("Structure removed");
            loadStructures();
        } catch {
            toast.error("Delete failed");
        } finally {
            setPopup(null);
            setDeleteId(null);
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
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Fee Configuration</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">Define Global Academic Fee Rules</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* FORM */}
                <div className="lg:col-span-4">
                    <div className="glass-card p-6 bg-white dark:bg-slate-900/60 sticky top-6">
                        <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <MdAddCircle size={16} /> Create / Update Rule
                        </h3>
                        
                        <div className="space-y-5">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Standard / Class</label>
                                <div className="relative group">
                                    <MdClass className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                    <input 
                                        type="number" 
                                        placeholder="e.g. 10" 
                                        className="input-premium pl-11" 
                                        value={standard} 
                                        onChange={(e) => setStandard(e.target.value)} 
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Yearly Tuition Fee</label>
                                <div className="relative group">
                                    <MdCurrencyRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                    <input 
                                        type="number" 
                                        placeholder="e.g. 25000" 
                                        className="input-premium pl-11" 
                                        value={fee} 
                                        onChange={(e) => setFee(e.target.value)} 
                                    />
                                </div>
                            </div>

                            <button onClick={submit} disabled={loading} className="btn-primary w-full py-4 mt-2">
                                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><MdSave size={20} /> Save Structure</>}
                            </button>

                            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/10 mt-4">
                                <p className="text-[9px] text-blue-600 dark:text-blue-400 font-bold leading-relaxed flex gap-2">
                                    <MdInfo size={14} className="shrink-0" />
                                    Updating a standard&apos;s fee will automatically reflect in the remaining balance for all students in that class.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* LIST */}
                <div className="lg:col-span-8">
                    <div className="glass-card overflow-hidden bg-white dark:bg-slate-900/60">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-3">
                                <MdSettings className="text-blue-600" /> Active Structures
                            </h3>
                        </div>

                        {fetching ? (
                            <div className="p-12 space-y-4">
                                {[1,2,3].map(i => <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />)}
                            </div>
                        ) : structures.length === 0 ? (
                            <div className="py-20 text-center text-slate-400">
                                <p className="text-[10px] font-black uppercase tracking-widest">No fee structures defined yet.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-50/50 dark:bg-white/[0.02]">
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Academic Standard</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Annual Fee</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                        {structures.map((s) => (
                                            <tr key={s._id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group">
                                                <td className="px-8 py-5">
                                                    <span className="px-4 py-1.5 rounded-xl bg-blue-600/10 text-blue-600 font-black text-xs uppercase tracking-widest border border-blue-600/20">
                                                        Standard {s.standard}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5 text-center font-black text-slate-900 dark:text-white">
                                                    ₹ {s.yearlyFee.toLocaleString()}
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-all gap-2">
                                                        <button 
                                                            onClick={() => {
                                                                setStandard(s.standard);
                                                                setFee(s.yearlyFee);
                                                            }}
                                                            className="p-2 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                                        >
                                                            <MdSettings size={18} />
                                                        </button>
                                                        <button 
                                                            onClick={() => {
                                                                setDeleteId(s._id);
                                                                setPopup({
                                                                    type: "confirm",
                                                                    title: "Delete Fee Rule",
                                                                    message: "Are you sure you want to remove the fee structure for this standard? This may cause calculation errors for students in this class."
                                                                });
                                                            }}
                                                            className="p-2 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white transition-all shadow-sm"
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

            {popup && <Popup open={true} {...popup} onClose={() => setPopup(null)} onConfirm={confirmDelete} />}
        </motion.div>
    );
}
