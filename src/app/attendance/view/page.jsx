"use client";

import { useEffect, useState } from "react";
import axios from "@/utils/axios";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { MdSearch, MdCalendarMonth, MdClass, MdArrowBack, MdFilterList } from "react-icons/md";
import Link from "next/link";

export default function AttendanceViewPage() {
    const [standard, setStandard] = useState("");
    const [date, setDate] = useState("");
    const [attendanceData, setAttendanceData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");

    useEffect(() => {
        if (!date) {
            const d = new Date();
            setDate(d.toISOString().slice(0, 10));
        }
    }, []);

    const loadAttendance = async () => {
        if (!standard || !date) return toast.error("Select Standard and Date");
        setLoading(true);
        try {
            const res = await axios.get(`/attendance/filter?standard=${standard}&date=${date}`);
            setAttendanceData(res.data || []);
        } catch (error) {
            toast.error("Failed to fetch attendance");
        } finally {
            setLoading(false);
        }
    };

    const filtered = attendanceData.filter(a => 
        a.studentId?.name?.toLowerCase().includes(search.toLowerCase()) ||
        String(a.studentId?.rollNumber || "").includes(search)
    );

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-7xl mx-auto space-y-6 pb-20">
            {/* HEADER */}
            <div className="glass-card p-8 flex flex-col md:flex-row justify-between items-center bg-white dark:bg-slate-900/60">
                <div className="flex items-center gap-6">
                    <Link href="/attendance">
                        <button className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-blue-600 hover:text-white transition-all">
                            <MdArrowBack size={20} />
                        </button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Attendance Logs</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">Review Historical Presence Data</p>
                    </div>
                </div>
            </div>

            {/* CONTROLS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative group">
                    <MdClass className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                    <select className="input-premium pl-14 appearance-none cursor-pointer" value={standard} onChange={(e) => setStandard(e.target.value)}>
                        <option value="">Select Standard</option>
                        {["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"].map(s => <option key={s} value={s}>Standard {s}</option>)}
                    </select>
                </div>

                <div className="relative group">
                    <MdCalendarMonth className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                    <input type="date" className="input-premium pl-14" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>

                <button onClick={loadAttendance} disabled={loading} className="btn-primary h-[58px]">
                    {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <MdSearch size={20} />}
                    Fetch Records
                </button>
            </div>

            {/* LIST */}
            <div className="glass-card overflow-hidden bg-white dark:bg-slate-900/60">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <div className="relative w-full max-w-md">
                        <MdFilterList className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-blue-600 transition-all"
                            placeholder="Filter by name or roll number..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-4">
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                            Present: {filtered.filter(a => a.status === "Present").length}
                        </span>
                        <span className="text-[10px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
                            Absent: {filtered.filter(a => a.status === "Absent").length}
                        </span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-white/[0.02]">
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Student Name</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Roll Number</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Remark</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-8 py-6"><div className="h-4 w-40 bg-slate-100 dark:bg-slate-800 rounded-lg" /></td>
                                        <td className="px-8 py-6"><div className="h-4 w-12 bg-slate-100 dark:bg-slate-800 rounded-lg mx-auto" /></td>
                                        <td className="px-8 py-6"><div className="h-4 w-16 bg-slate-100 dark:bg-slate-800 rounded-lg mx-auto" /></td>
                                        <td className="px-8 py-6"><div className="h-4 w-32 bg-slate-100 dark:bg-slate-800 rounded-lg" /></td>
                                    </tr>
                                ))
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan="4" className="px-8 py-20 text-center font-bold text-slate-400 uppercase tracking-widest text-xs">No records found for the selection.</td></tr>
                            ) : (
                                filtered.map((a) => (
                                    <tr key={a._id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                                        <td className="px-8 py-5 font-bold text-slate-900 dark:text-white">{a.studentId?.name}</td>
                                        <td className="px-8 py-5 text-center">
                                            <span className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 font-bold text-[10px] text-slate-600 dark:text-slate-400">#{a.studentId?.rollNumber}</span>
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            <span className={`px-3 py-1 rounded-lg font-bold text-[10px] uppercase tracking-widest ${
                                                a.status === "Present" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10" : "bg-rose-50 text-rose-600 dark:bg-rose-500/10"
                                            }`}>
                                                {a.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-slate-500 dark:text-slate-400 text-sm italic">{a.remark || "-"}</td>
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
