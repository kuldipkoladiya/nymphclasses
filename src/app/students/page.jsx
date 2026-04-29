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
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-7xl mx-auto">
            {/* HEADER */}
            <div className="glass-card p-8 flex flex-col md:flex-row justify-between items-center bg-white dark:bg-slate-900/60">
                <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-blue-600/10 text-blue-600 rounded-2xl flex items-center justify-center border border-blue-600/20">
                        <MdPeople size={28} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Student Records</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">Institutional Student Directory</p>
                    </div>
                </div>
                <Link href="/students/add">
                    <button className="btn-primary mt-4 md:mt-0">
                        <MdAdd size={20} /> Add New Student
                    </button>
                </Link>
            </div>

            {/* FILTERS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 relative group">
                    <MdSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                    <input className="input-premium pl-14" placeholder="Search by name or roll number..." value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <div className="relative group">
                    <MdFilterList className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                    <select className="input-premium pl-14 appearance-none cursor-pointer" value={filterStd} onChange={(e) => setFilterStd(e.target.value)}>
                        <option value="">All Standards</option>
                        {["1","2","3","4","5","6","7","8","9","10","11","12"].map(s => <option key={s} value={s}>Standard {s}</option>)}
                    </select>
                </div>
            </div>

            {/* DATA TABLE */}
            <div className="glass-card overflow-hidden bg-white dark:bg-slate-900/60">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-100 dark:border-slate-800">
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Student Name</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Roll Number</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Academic Year</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-8 py-6"><div className="h-4 w-40 bg-slate-100 dark:bg-slate-800 rounded-lg" /></td>
                                        <td className="px-8 py-6"><div className="h-4 w-12 bg-slate-100 dark:bg-slate-800 rounded-lg mx-auto" /></td>
                                        <td className="px-8 py-6"><div className="h-4 w-10 bg-slate-100 dark:bg-slate-800 rounded-lg mx-auto" /></td>
                                        <td className="px-8 py-6"><div className="h-4 w-20 bg-slate-100 dark:bg-slate-800 rounded-lg ml-auto" /></td>
                                    </tr>
                                ))
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan="4" className="px-8 py-20 text-center font-bold text-slate-400 uppercase tracking-widest text-xs">No records found.</td></tr>
                            ) : (
                                filtered.map((s) => (
                                    <tr key={s._id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-8 py-5 font-bold text-slate-900 dark:text-white">{s.name}</td>
                                        <td className="px-8 py-5 text-center">
                                            <span className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 font-bold text-[10px] text-slate-600 dark:text-slate-400">#{s.rollNumber}</span>
                                        </td>
                                        <td className="px-8 py-5 text-center font-bold text-blue-600 dark:text-blue-400 text-xs">Std {s.standard}</td>
                                        <td className="px-8 py-5">
                                            <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-all">
                                                <Link href={`/students/${s._id}`}>
                                                    <button className="p-2 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white transition-all"><MdEdit size={18} /></button>
                                                </Link>
                                                <button onClick={() => openDeletePopup(s._id)} className="p-2 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500 hover:text-white transition-all"><MdDelete size={18} /></button>
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
