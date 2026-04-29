"use client";

import { useEffect, useState } from "react";
import axios from "../../utils/axios";
import Link from "next/link";
import { MdDelete, MdEdit, MdAdd, MdSearch, MdFilterList, MdPeople } from "react-icons/md";
import Popup from "@/components/Popup";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

export default function StudentsPage() {
    const [students, setStudents] = useState([]);
    const [search, setSearch] = useState("");
    const [filterStd, setFilterStd] = useState("");
    const [popup, setPopup] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const res = await axios.get("/students");
                setStudents(res.data || []);
            } catch (error) {
                // Error already handled by axios interceptor toast
            } finally {
                setLoading(false);
            }
        };
        fetchStudents();
    }, []);

    const filtered = students.filter((s) => {
        const matchStd = filterStd ? s.standard === filterStd : true;
        const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.rollNumber?.includes(search);
        return matchStd && matchSearch;
    });

    const openDeletePopup = (id) => {
        setDeleteId(id);
        setPopup({
            type: "confirm",
            title: "Purge Student Record",
            message: "Warning: This action is irreversible. All student diagnostics will be permanently erased.",
        });
    };

    const confirmDelete = async () => {
        try {
            await axios.delete(`/students/${deleteId}`);
            setStudents((prev) => prev.filter((s) => s._id !== deleteId));
            toast.success("Record purged successfully.");
        } catch (error) {
            // Error handled by axios interceptor
        } finally {
            setPopup(null);
            setDeleteId(null);
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 max-w-[1400px] mx-auto px-4 md:px-0">
            {/* HERO BAR */}
            <div className="glass-card p-8 flex flex-col md:flex-row justify-between items-center bg-white dark:bg-slate-900/40 border-l-[12px] border-l-indigo-600">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-indigo-600 text-white rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-500/40">
                        <MdPeople size={32} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tightest">Student Roster</h1>
                        <p className="text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-[0.2em] text-[10px] mt-1">Active Personnel Directory</p>
                    </div>
                </div>
                <Link href="/students/add">
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="mt-6 md:mt-0 px-10 py-4 rounded-3xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-indigo-500/30 flex items-center gap-3">
                        <MdAdd size={22} /> Add Student
                    </motion.button>
                </Link>
            </div>

            {/* FILTERS */}
            <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 glass-card px-8 py-2 bg-white dark:bg-slate-900/40 flex items-center gap-5 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all border border-gray-100 dark:border-white/5">
                    <MdSearch className="text-indigo-600" size={26} />
                    <input className="w-full py-5 bg-transparent outline-none font-bold text-gray-900 dark:text-white placeholder-gray-400" placeholder="Search identities..." value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <div className="w-full md:w-[300px] glass-card px-8 py-2 bg-white dark:bg-slate-900/40 flex items-center gap-5 border border-gray-100 dark:border-white/5">
                    <MdFilterList className="text-indigo-600" size={26} />
                    <select className="w-full py-5 bg-transparent outline-none font-bold text-gray-900 dark:text-white appearance-none cursor-pointer" value={filterStd} onChange={(e) => setFilterStd(e.target.value)}>
                        <option value="">All Academic Standards</option>
                        {["1","2","3","4","5","6","7","8","9","10","11","12"].map(s => <option key={s} value={s}>Standard {s}</option>)}
                    </select>
                </div>
            </div>

            {/* TABLE CONTAINER */}
            <div className="glass-card overflow-hidden bg-white dark:bg-slate-900/40 border border-gray-100 dark:border-white/5 shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 dark:bg-white/[0.03] border-b border-gray-100 dark:border-white/5">
                                <th className="px-10 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-slate-500">Personnel Identity</th>
                                <th className="px-10 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-slate-500 text-center">ID Tag</th>
                                <th className="px-10 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-slate-500 text-center">Level</th>
                                <th className="px-10 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-slate-500 text-right">Operational Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-10 py-8"><div className="h-5 w-48 bg-gray-100 dark:bg-white/5 rounded-xl" /></td>
                                        <td className="px-10 py-8"><div className="h-5 w-16 bg-gray-100 dark:bg-white/5 rounded-xl mx-auto" /></td>
                                        <td className="px-10 py-8"><div className="h-5 w-12 bg-gray-100 dark:bg-white/5 rounded-xl mx-auto" /></td>
                                        <td className="px-10 py-8"><div className="h-5 w-24 bg-gray-100 dark:bg-white/5 rounded-xl ml-auto" /></td>
                                    </tr>
                                ))
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan="4" className="px-10 py-24 text-center font-black text-gray-400 dark:text-slate-600 uppercase tracking-widest text-xs">Zero operational records discovered.</td></tr>
                            ) : (
                                filtered.map((s) => (
                                    <motion.tr key={s._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-indigo-600/[0.02] dark:hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-10 py-7 font-bold text-gray-900 dark:text-white tracking-tight">{s.name}</td>
                                        <td className="px-10 py-7 text-center">
                                            <span className="px-4 py-1.5 rounded-xl bg-gray-100 dark:bg-white/[0.05] font-black text-[10px] tracking-widest text-gray-600 dark:text-slate-400">#{s.rollNumber}</span>
                                        </td>
                                        <td className="px-10 py-7 text-center font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest text-xs">Std {s.standard}</td>
                                        <td className="px-10 py-7 text-right">
                                            <div className="flex gap-3 justify-end opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0 translate-x-4">
                                                <Link href={`/students/${s._id}`}>
                                                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"><MdEdit size={20} /></motion.button>
                                                </Link>
                                                <motion.button onClick={() => openDeletePopup(s._id)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500 hover:text-white transition-all shadow-sm"><MdDelete size={20} /></motion.button>
                                            </div>
                                        </td>
                                    </motion.tr>
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

