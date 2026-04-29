"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "../../utils/axios";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
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
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-[1400px] mx-auto space-y-10 pb-20 px-4 md:px-0">
            {/* HEADER */}
            <div className="glass-card p-10 flex flex-col md:flex-row justify-between items-center bg-white dark:bg-slate-900/40 border-l-[12px] border-l-blue-600">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-blue-600 text-white rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-600/40">
                        <MdCalendarMonth size={32} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tightest uppercase">Roster Control</h1>
                        <p className="text-blue-600 dark:text-blue-400 font-black uppercase tracking-[0.2em] text-[10px] mt-1">Personnel Presence Tracking</p>
                    </div>
                </div>

                <div className="mt-6 md:mt-0">
                    <button onClick={save} disabled={saving || students.length === 0} className="px-10 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-600/30 flex items-center gap-3 transition-all active:scale-95 disabled:opacity-50">
                        {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <MdSave size={22} />}
                        {saving ? "SAVING..." : attendanceExists ? "OVERRIDE" : "COMMIT LOG"}
                    </button>
                </div>
            </div>

            {/* CONTROLS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card px-8 py-2 bg-white dark:bg-slate-900/40 flex items-center gap-4 border border-slate-100 dark:border-white/5">
                    <MdClass className="text-blue-600" size={24} />
                    <select className="w-full py-5 bg-transparent outline-none font-bold text-slate-900 dark:text-white appearance-none cursor-pointer" value={standard} onChange={(e) => setStandard(e.target.value)}>
                        <option value="">Academic Level</option>
                        {["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"].map(s => <option key={s} value={s}>Grade {s}</option>)}
                    </select>
                </div>

                <div className="glass-card px-8 py-2 bg-white dark:bg-slate-900/40 flex items-center gap-4 border border-slate-100 dark:border-white/5">
                    <MdCalendarMonth className="text-blue-600" size={24} />
                    <input type="date" className="w-full py-5 bg-transparent outline-none font-bold text-slate-900 dark:text-white" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>

                <div className="glass-card px-8 py-2 bg-white dark:bg-slate-900/40 flex items-center gap-4 border border-slate-100 dark:border-white/5">
                    <MdSearch className="text-blue-600" size={24} />
                    <input className="w-full py-5 bg-transparent outline-none font-bold text-slate-900 dark:text-white placeholder-slate-400" placeholder="Filter Roster..." value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
            </div>

            {/* BATCH ACTIONS */}
            {filtered.length > 0 && (
                <div className="flex gap-4 justify-end">
                    <button onClick={() => bulk("Present")} className="px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all">All Present</button>
                    <button onClick={() => bulk("Absent")} className="px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-rose-500/10 text-rose-600 border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all">All Absent</button>
                </div>
            )}

            {/* ROSTER GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {loading ? (
                    Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="glass-card p-8 h-[180px] animate-pulse bg-white dark:bg-white/5" />
                    ))
                ) : !standard ? (
                    <div className="col-span-full glass-card p-24 text-center bg-white dark:bg-white/5">
                        <MdClass className="mx-auto text-slate-300 mb-6" size={64} />
                        <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-widest">Select Level</h3>
                        <p className="text-slate-400 mt-2 font-bold uppercase tracking-widest text-[10px]">Awaiting grade configuration...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="col-span-full glass-card p-24 text-center bg-white dark:bg-white/5">
                        <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-widest">No Personnel Found</h3>
                        <p className="text-slate-400 mt-2 font-bold uppercase tracking-widest text-[10px]">Zero records discovered in this sector.</p>
                    </div>
                ) : (
                    filtered.map((s) => {
                        const isPresent = (attendance[s._id] || "Absent") === "Present";
                        return (
                            <motion.div key={s._id} layout className={`glass-card p-8 flex flex-col justify-between transition-all duration-500 border-2 ${isPresent ? 'border-emerald-500/20 bg-emerald-500/[0.02]' : 'border-rose-500/20 bg-rose-500/[0.02]'}`}>
                                <div className="flex justify-between items-start mb-6">
                                    <div className="overflow-hidden">
                                        <p className="font-black text-slate-900 dark:text-white text-lg tracking-tightest truncate">{s.name}</p>
                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">ID: {s.rollNumber}</p>
                                    </div>
                                    <div className={`w-10 h-10 flex flex-shrink-0 items-center justify-center rounded-2xl text-white shadow-lg ${isPresent ? 'bg-emerald-500 shadow-emerald-500/30' : 'bg-rose-500 shadow-rose-500/30'}`}>
                                        {isPresent ? <MdCheckCircle size={22} /> : <MdCancel size={22} />}
                                    </div>
                                </div>

                                <div className="flex rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-950 p-1.5 gap-1.5 border border-slate-100 dark:border-white/5">
                                    <button onClick={() => setStatus(s._id, "Present")} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${isPresent ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-400 hover:bg-white dark:hover:bg-white/5'}`}>Present</button>
                                    <button onClick={() => setStatus(s._id, "Absent")} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${!isPresent ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'text-slate-400 hover:bg-white dark:hover:bg-white/5'}`}>Absent</button>
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>
        </motion.div>
    );
}
