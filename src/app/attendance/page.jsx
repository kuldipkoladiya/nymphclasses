"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "../../utils/axios";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import Link from "next/link";
import { MdSearch, MdCalendarMonth, MdClass, MdCheckCircle, MdCancel, MdSave } from "react-icons/md";

export default function AttendancePage() {
    const [standard, setStandard] = useState("");
    const [date, setDate] = useState("");
    const [students, setStudents] = useState([]);
    const [attendance, setAttendance] = useState({});
    const [attendanceExists, setAttendanceExists] = useState(false);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!date) {
            const d = new Date();
            setDate(d.toISOString().slice(0, 10));
        }
    }, [date]);

    useEffect(() => {
        const loadData = async () => {
            if (!standard || !date) return;
            setLoading(true);
            try {
                const sRes = await axios.get(`/students/by-standard/${standard}`);
                const list = sRes.data?.students || sRes.data || [];
                setStudents(list);

                try {
                    const aRes = await axios.get(`/attendance/filter?standard=${standard}&date=${date}`);
                    const map = {};
                    const attendanceData = aRes.data?.attendance || aRes.data || [];
                    attendanceData.forEach((a) => {
                        map[a.studentId?._id || a.studentId] = a.status;
                    });
                    setAttendance(map);
                    setAttendanceExists(Object.keys(map).length > 0);
                } catch {
                    setAttendance({});
                    setAttendanceExists(false);
                }
            } catch {
                setStudents([]);
                setAttendance({});
                toast.error("Failed to load records.");
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [standard, date]);

    const filtered = useMemo(() => {
        if (!search) return students;
        return students.filter(
            (s) => s.name?.toLowerCase().includes(search.toLowerCase()) || String(s.rollNumber || "").includes(search)
        );
    }, [students, search]);

    const setStatus = (id, status) => setAttendance((p) => ({ ...p, [id]: status }));

    const bulk = (status) => {
        const map = {};
        filtered.forEach((s) => (map[s._id] = status));
        setAttendance((p) => ({ ...p, ...map }));
    };

    const save = async () => {
        if (!students.length) return;
        setSaving(true);
        try {
            await Promise.all(
                students.map((s) => axios.post("/attendance", { studentId: s._id, date, status: attendance[s._id] || "Absent" }))
            );
            setAttendanceExists(true);
            toast.success("Attendance committed successfully!");
        } catch {
            toast.error("Error saving records.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-7xl mx-auto space-y-6 pb-20">
            {/* HEADER */}
            <div className="glass-card p-8 flex flex-col md:flex-row justify-between items-center bg-white dark:bg-slate-900/60">
                <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-blue-600/10 text-blue-600 rounded-2xl flex items-center justify-center border border-blue-600/20">
                        <MdCalendarMonth size={28} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Attendance</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">Daily Record</p>
                    </div>
                </div>

                <div className="flex gap-4 mt-4 md:mt-0">
                    <Link href="/attendance/view">
                        <button className="px-6 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-sm uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center gap-3">
                            <MdCalendarMonth size={20} /> View Logs
                        </button>
                    </Link>
                    <button onClick={save} disabled={saving || students.length === 0} className="btn-primary">
                        {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <MdSave size={20} />}
                        {saving ? "SAVING..." : attendanceExists ? "UPDATE RECORDS" : "SAVE ATTENDANCE"}
                    </button>
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

                <div className="relative group">
                    <MdSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                    <input className="input-premium pl-14" placeholder="Search students..." value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
            </div>

            {/* BATCH ACTIONS */}
            {filtered.length > 0 && (
                <div className="flex gap-4 justify-end">
                    <button onClick={() => bulk("Present")} className="px-5 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-600 hover:text-white transition-all">Mark All Present</button>
                    <button onClick={() => bulk("Absent")} className="px-5 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest bg-rose-50 text-rose-600 dark:bg-rose-500/10 border border-rose-500/20 hover:bg-rose-600 hover:text-white transition-all">Mark All Absent</button>
                </div>
            )}

            {/* ATTENDANCE GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {loading ? (
                    Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="glass-card p-6 h-[160px] animate-pulse bg-white dark:bg-slate-900/40" />
                    ))
                ) : !standard ? (
                    <div className="col-span-full glass-card p-20 text-center bg-white dark:bg-slate-900/40">
                        <MdClass className="mx-auto text-slate-300 mb-4" size={48} />
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Select a Standard</h3>
                        <p className="text-slate-400 mt-2 font-bold text-[10px] uppercase tracking-widest">Please choose a standard to load students</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="col-span-full glass-card p-20 text-center bg-white dark:bg-slate-900/40">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Students Found</h3>
                        <p className="text-slate-400 mt-2 font-bold text-[10px] uppercase tracking-widest">No student records match your selection</p>
                    </div>
                ) : (
                    filtered.map((s) => {
                        const isPresent = (attendance[s._id] || "Absent") === "Present";
                        return (
                            <motion.div key={s._id} layout className={`glass-card p-6 flex flex-col justify-between transition-all duration-500 border ${isPresent ? 'border-emerald-500/30 bg-emerald-50/30 dark:bg-emerald-500/5' : 'border-rose-500/30 bg-rose-50/30 dark:bg-rose-500/5'}`}>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="overflow-hidden">
                                        <p className="font-bold text-slate-900 dark:text-white text-base truncate">{s.name}</p>
                                        <p className="text-[10px] font-bold text-slate-400 tracking-widest mt-1 uppercase">Roll No: {s.rollNumber}</p>
                                    </div>
                                    <div className={`w-8 h-8 flex flex-shrink-0 items-center justify-center rounded-xl text-white ${isPresent ? 'bg-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-rose-500 shadow-lg shadow-rose-500/20'}`}>
                                        {isPresent ? <MdCheckCircle size={18} /> : <MdCancel size={18} />}
                                    </div>
                                </div>

                                <div className="flex rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 p-1 gap-1 border border-slate-200 dark:border-slate-700">
                                    <button onClick={() => setStatus(s._id, "Present")} className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${isPresent ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:bg-white dark:hover:bg-slate-700'}`}>Present</button>
                                    <button onClick={() => setStatus(s._id, "Absent")} className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${!isPresent ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:bg-white dark:hover:bg-slate-700'}`}>Absent</button>
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>
        </motion.div>
    );
}
