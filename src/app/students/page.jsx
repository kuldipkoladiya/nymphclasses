"use client";

import { useEffect, useState } from "react";
import axios from "../../utils/axios";
import Link from "next/link";
import { MdDelete, MdEdit, MdAdd, MdSearch, MdFilterList, MdPeople, MdSchool, MdAssignmentInd } from "react-icons/md";
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

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalStudents, setTotalStudents] = useState(0);
    const [debouncedSearch, setDebouncedSearch] = useState("");

    // Debounce search query to avoid spamming requests
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    // Reset to page 1 on standard filter change
    useEffect(() => {
        setPage(1);
    }, [filterStd]);

    useEffect(() => {
        const fetchStudents = async () => {
            setLoading(true);
            try {
                const res = await axios.get(
                    `/students?paginate=true&page=${page}&limit=15&search=${debouncedSearch}&standard=${filterStd}`
                );
                setStudents(res.data.students || []);
                setTotalPages(res.data.totalPages || 1);
                setTotalStudents(res.data.totalStudents || 0);
            } catch (error) {
                // Handled by axios interceptor
            } finally {
                setLoading(false);
            }
        };
        fetchStudents();
    }, [page, debouncedSearch, filterStd]);

    const filtered = students;

    const openDeletePopup = (id) => {
        setDeleteId(id);
        setPopup({
            type: "confirm",
            title: "Delete Student Profile",
            message: "Are you sure you want to delete this student? All attendances, results, and fee configurations linked to this profile will be permanently removed.",
        });
    };

    const confirmDelete = async () => {
        try {
            await axios.delete(`/students/${deleteId}`);
            setStudents((prev) => prev.filter((s) => s._id !== deleteId));
            toast.success("Student deleted successfully.");
        } catch (error) {
            // Handled by axios interceptor
        } finally {
            setPopup(null);
            setDeleteId(null);
        }
    };

    // Curated HSL standard badge color-coding
    const getStandardBadgeStyle = (std) => {
        const num = parseInt(std);
        if (num <= 4) return "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 border-blue-100 dark:border-blue-500/20";
        if (num <= 8) return "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20";
        if (num <= 10) return "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 border-indigo-100 dark:border-indigo-500/20";
        return "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 border-rose-100 dark:border-rose-500/20";
    };

    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6">
            
            {/* 1. HEADER SECTION */}
            <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 p-6 md:p-8 shadow-sm">
                <div className="absolute right-0 top-0 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/15">
                            <MdPeople size={28} />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none">Student Registry</h1>
                            <p className="text-slate-400 dark:text-slate-500 font-bold text-[9px] uppercase tracking-widest mt-2">Manage profiles, standards, and contact details</p>
                        </div>
                    </div>
                    <Link href="/students/add">
                        <button className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs uppercase tracking-widest shadow-md shadow-indigo-600/15 hover:shadow-indigo-600/25 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2">
                            <MdAdd size={18} /> Add New Student
                        </button>
                    </Link>
                </div>
            </div>

            {/* 2. QUICK METRICS CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Total Enrollment Card */}
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 shadow-sm flex items-center gap-4 hover:scale-[1.01] transition-transform duration-300">
                    <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center flex-shrink-0">
                        <MdPeople size={20} />
                    </div>
                    <div>
                        <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Total Enrollment</p>
                        <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                            {totalStudents} {totalStudents === 1 ? "Student" : "Students"}
                        </p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Global active roster</p>
                    </div>
                </div>

                {/* Class Standards Card */}
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 shadow-sm flex items-center gap-4 hover:scale-[1.01] transition-transform duration-300">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600/10 text-emerald-600 flex items-center justify-center flex-shrink-0">
                        <MdSchool size={20} />
                    </div>
                    <div>
                        <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Class Standards</p>
                        <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                            {filterStd ? `Standard ${filterStd}` : "Std 1 to 12"}
                        </p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                            {filterStd ? "Filtered standard view" : "Configured grade levels"}
                        </p>
                    </div>
                </div>

                {/* Registry Search Results Card */}
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 shadow-sm flex items-center gap-4 hover:scale-[1.01] transition-transform duration-300">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center flex-shrink-0">
                        <MdAssignmentInd size={20} />
                    </div>
                    <div>
                        <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Registry View</p>
                        <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                            {search || filterStd ? `${filtered.length} Matches` : `${filtered.length} Listings`}
                        </p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                            {search || filterStd ? "Filtered results set" : "Shown on current page"}
                        </p>
                    </div>
                </div>
            </div>

            {/* 3. FILTERS PANEL */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 relative group">
                    <MdSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors pointer-events-none z-10" size={20} />
                    <input 
                        className="w-full pl-12 pr-5 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600/40 transition-all outline-none font-medium text-slate-900 dark:text-white placeholder:text-slate-400 text-sm" 
                        placeholder="Search student profile name or roll number..." 
                        value={search} 
                        onChange={(e) => setSearch(e.target.value)} 
                    />
                </div>
                <div className="relative group">
                    <MdFilterList className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors pointer-events-none z-10" size={20} />
                    <select 
                        className="w-full pl-12 pr-5 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600/40 transition-all outline-none font-extrabold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-200 appearance-none cursor-pointer" 
                        value={filterStd} 
                        onChange={(e) => setFilterStd(e.target.value)}
                    >
                        <option value="">All Standards</option>
                        {["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"].map(s => (
                            <option key={s} value={s}>Standard {s}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* 4. DATA SECTION */}
            {loading ? (
                // SKELETON LOADER
                <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:hidden">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 space-y-4 animate-pulse">
                                <div className="h-4 w-40 bg-slate-100 dark:bg-slate-800 rounded-lg" />
                                <div className="h-4 w-24 bg-slate-100 dark:bg-slate-800 rounded-lg" />
                            </div>
                        ))}
                    </div>
                    <div className="rounded-3xl border border-slate-200/60 dark:border-slate-800/60 overflow-hidden bg-white dark:bg-slate-900 hidden md:block">
                        <table className="w-full text-left">
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-8 py-6"><div className="h-4 w-48 bg-slate-100 dark:bg-slate-800 rounded-lg" /></td>
                                        <td className="px-8 py-6"><div className="h-4 w-12 bg-slate-100 dark:bg-slate-800 rounded-lg mx-auto" /></td>
                                        <td className="px-8 py-6"><div className="h-4 w-10 bg-slate-100 dark:bg-slate-800 rounded-lg mx-auto" /></td>
                                        <td className="px-8 py-6"><div className="h-4 w-20 bg-slate-100 dark:bg-slate-800 rounded-lg ml-auto" /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : filtered.length === 0 ? (
                // EMPTY STATE
                <div className="rounded-3xl border border-slate-200/60 dark:border-slate-800/60 p-20 text-center font-bold text-slate-400 uppercase tracking-widest text-xs bg-white dark:bg-slate-900">
                    No records found matching filters.
                </div>
            ) : (
                <>
                    {/* MOBILE CARDS VIEW */}
                    <div className="grid grid-cols-1 gap-4 md:hidden">
                        {filtered.map((s) => (
                            <div key={s._id} className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 space-y-4 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <Link href={`/students/${s._id}`} className="font-black text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-base leading-snug">
                                            {s.name}
                                        </Link>
                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Student Registry</p>
                                    </div>
                                    <span className={`px-2.5 py-1 rounded-lg border font-extrabold text-[9px] uppercase tracking-wider ${getStandardBadgeStyle(s.standard)}`}>
                                        Std {s.standard}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between pt-3.5 border-t border-slate-100 dark:border-slate-850">
                                    <div className="flex flex-col">
                                        <span className="text-[8px] font-black uppercase text-slate-400 tracking-wider">Roll Number</span>
                                        <span className="font-bold text-xs text-slate-700 dark:text-slate-300">{s.rollNumber}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <Link href={`/students/${s._id}`}>
                                            <button className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-600 hover:text-white dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 transition-all flex items-center gap-1 font-bold text-[10px] uppercase tracking-wider">
                                                <MdEdit size={14} /> Edit
                                            </button>
                                        </Link>
                                        <button onClick={() => openDeletePopup(s._id)} className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-600 hover:text-white dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 transition-all flex items-center gap-1 font-bold text-[10px] uppercase tracking-wider">
                                            <MdDelete size={14} /> Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* DESKTOP TABLE VIEW */}
                    <div className="rounded-3xl border border-slate-200/60 dark:border-slate-800/60 overflow-hidden bg-white dark:bg-slate-900 shadow-sm hidden md:block">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Student Name</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Roll Number</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Standard</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                    {filtered.map((s) => (
                                        <tr key={s._id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors">
                                            <td className="px-8 py-5">
                                                <Link href={`/students/${s._id}`} className="font-extrabold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer text-sm">
                                                    {s.name}
                                                </Link>
                                            </td>
                                            <td className="px-8 py-5 text-center">
                                                <span className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/60 font-bold text-[10px] text-slate-600 dark:text-slate-400">{s.rollNumber}</span>
                                            </td>
                                            <td className="px-8 py-5 text-center">
                                                <span className={`px-2.5 py-1 rounded-lg border font-extrabold text-[9px] uppercase tracking-wider ${getStandardBadgeStyle(s.standard)}`}>
                                                    Std {s.standard}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex gap-2 justify-end">
                                                    <Link href={`/students/${s._id}`}>
                                                        <button className="p-2 rounded-xl bg-blue-50 hover:bg-blue-600 hover:text-white dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 transition-all" title="Edit Student Profile">
                                                            <MdEdit size={16} />
                                                        </button>
                                                    </Link>
                                                    <button onClick={() => openDeletePopup(s._id)} className="p-2 rounded-xl bg-rose-50 hover:bg-rose-600 hover:text-white dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 transition-all" title="Delete Student Profile">
                                                        <MdDelete size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {/* 5. PAGINATION CONTROLS */}
            {totalPages > 1 && (
                <div className="rounded-3xl border border-slate-200/60 dark:border-slate-800/60 p-4 flex flex-col sm:flex-row justify-between items-center bg-white dark:bg-slate-900 shadow-sm gap-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Showing Page {page} of {totalPages} ({totalStudents} Students Registered)
                    </p>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <button
                            disabled={page <= 1}
                            onClick={() => setPage((p) => p - 1)}
                            className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-extrabold text-[10px] uppercase tracking-wider disabled:opacity-50 transition-all border border-slate-200/60 dark:border-slate-800"
                        >
                            Previous
                        </button>
                        <button
                            disabled={page >= totalPages}
                            onClick={() => setPage((p) => p + 1)}
                            className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[10px] uppercase tracking-wider disabled:opacity-50 transition-all shadow-md shadow-indigo-600/15"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            {popup && <Popup open={true} {...popup} onClose={() => setPopup(null)} onConfirm={confirmDelete} />}
        </motion.div>
    );
}
