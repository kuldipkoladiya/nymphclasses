"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "../../utils/axios";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import Link from "next/link";
import { MdSearch, MdCalendarMonth, MdClass, MdCheckCircle, MdCancel, MdSave, MdTrendingUp, MdPeople, MdFactCheck, MdAssignmentTurnedIn } from "react-icons/md";
import { FaWhatsapp } from "react-icons/fa";

export default function AttendancePage() {
    const [standard, setStandard] = useState("");
    const [date, setDate] = useState("");
    const [students, setStudents] = useState([]);
    const [attendance, setAttendance] = useState({});
    const [attendanceExists, setAttendanceExists] = useState(false);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [sendWhatsApp, setSendWhatsApp] = useState(true);

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
                
                // Sort students numerically by roll number
                const sortedList = [...list].sort((a, b) => {
                    const rollA = parseInt(a.rollNumber) || 0;
                    const rollB = parseInt(b.rollNumber) || 0;
                    return rollA - rollB;
                });
                setStudents(sortedList);

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

    const toggleStatus = (id) => {
        const current = attendance[id] || "Absent";
        setStatus(id, current === "Present" ? "Absent" : "Present");
    };

    const bulk = (status) => {
        const map = {};
        filtered.forEach((s) => (map[s._id] = status));
        setAttendance((p) => ({ ...p, ...map }));
        toast.success(`Marked all as ${status}.`);
    };
    const save = async () => {
        if (!students.length) return;
        setSaving(true);
        try {
            await Promise.all(
                students.map((s) => axios.post("/attendance", { 
                    studentId: s._id, 
                    date, 
                    status: attendance[s._id] || "Absent",
                    sendWhatsApp
                }))
            );
            setAttendanceExists(true);
            toast.success(sendWhatsApp ? "Attendance saved & WhatsApp alerts sent!" : "Attendance saved successfully!");
        } catch {
            toast.error("Error saving records.");
        } finally {
            setSaving(false);
        }
    };

    // Dynamic metrics
    const stats = useMemo(() => {
        const total = filtered.length;
        if (total === 0) return { present: 0, absent: 0, rate: 0, markedCount: 0 };
        
        let present = 0;
        let markedCount = 0;
        filtered.forEach(s => {
            if (attendance[s._id]) {
                markedCount++;
            }
            if ((attendance[s._id] || "Absent") === "Present") {
                present++;
            }
        });
        
        const absent = total - present;
        const rate = Math.round((present / total) * 100);
        return { present, absent, rate, markedCount };
    }, [filtered, attendance]);

    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-6 pb-24 px-4 sm:px-6">
            
            {/* 1. HEADER SECTION */}
            <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 p-6 md:p-8 shadow-sm">
                <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-650/5 rounded-full blur-3xl pointer-events-none" />
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-gradient-to-br from-indigo-550 to-indigo-700 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/15">
                            <MdAssignmentTurnedIn size={28} />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none">Take Attendance</h1>
                            <p className="text-slate-405 dark:text-slate-500 font-bold text-[9px] uppercase tracking-widest mt-2">Log daily roll calls and dispatch parental WhatsApp alerts</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <Link href="/attendance/view" className="w-full md:w-auto">
                            <button className="w-full px-5 py-3 rounded-2xl bg-slate-50 hover:bg-slate-105 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-355 font-extrabold text-xs uppercase tracking-wider transition-all border border-slate-200/60 dark:border-slate-800 flex items-center justify-center gap-2">
                                <MdCalendarMonth size={18} /> View Logs
                            </button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* 2. STATS SUMMARY & PROGRESS BAR */}
            {filtered.length > 0 && (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Present Students</p>
                                <p className="text-xl font-black text-emerald-650 dark:text-emerald-400 mt-0.5">{stats.present} / {filtered.length}</p>
                            </div>
                            <span className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-655 flex items-center justify-center"><MdCheckCircle size={18} /></span>
                        </div>
                        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Absent Students</p>
                                <p className="text-xl font-black text-rose-655 mt-0.5">{stats.absent} / {filtered.length}</p>
                            </div>
                            <span className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-600 flex items-center justify-center"><MdCancel size={18} /></span>
                        </div>
                        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Attendance Rate</p>
                                <p className="text-xl font-black text-indigo-650 dark:text-indigo-400 mt-0.5">{stats.rate}% Present</p>
                            </div>
                            <span className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center"><MdTrendingUp size={18} /></span>
                        </div>
                    </div>
                    {/* Marked Progress Bar */}
                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 shadow-sm space-y-2">
                        <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-wider text-slate-400">
                            <span className="flex items-center gap-1"><MdFactCheck size={14} className="text-indigo-500" /> Completion status</span>
                            <span>{stats.markedCount} of {filtered.length} marked</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-600 rounded-full transition-all duration-300" style={{ width: `${(stats.markedCount / filtered.length) * 100}%` }} />
                        </div>
                    </div>
                </div>
            )}

            {/* 3. FILTERS & SEARCH */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="relative group">
                    <MdClass className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors pointer-events-none z-10" size={20} />
                    <select 
                        className="w-full pl-12 pr-5 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-indigo-650/5 focus:border-indigo-600/40 transition-all outline-none font-extrabold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-200 appearance-none cursor-pointer" 
                        value={standard} 
                        onChange={(e) => setStandard(e.target.value)}
                    >
                        <option value="">Select Standard</option>
                        {["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"].map(s => (
                            <option key={s} value={s}>Standard {s}</option>
                        ))}
                    </select>
                </div>

                <div className="relative group">
                    <MdCalendarMonth className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors pointer-events-none z-10" size={20} />
                    <input 
                        type="date" 
                        className="w-full pl-12 pr-5 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-indigo-650/5 focus:border-indigo-600/40 transition-all outline-none font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-200 cursor-pointer" 
                        value={date} 
                        onChange={(e) => setDate(e.target.value)} 
                    />
                </div>

                <div className="relative group">
                    <MdSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors pointer-events-none z-10" size={20} />
                    <input 
                        className="w-full pl-12 pr-5 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-indigo-650/5 focus:border-indigo-600/40 transition-all outline-none font-medium text-slate-900 dark:text-white placeholder:text-slate-400 text-sm" 
                        placeholder="Search standard students list..." 
                        value={search} 
                        onChange={(e) => setSearch(e.target.value)} 
                    />
                </div>
            </div>

            {/* 4. WHATSAPP & BATCH BULK ACTIONS */}
            {filtered.length > 0 && (
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 p-4 rounded-3xl shadow-sm">
                    <label className="flex items-center gap-3 cursor-pointer group select-none px-2">
                        <div className="relative">
                            <input 
                                type="checkbox" 
                                checked={sendWhatsApp} 
                                onChange={(e) => setSendWhatsApp(e.target.checked)} 
                                className="sr-only peer" 
                            />
                            <div className="w-10 h-5 bg-slate-200 dark:bg-slate-800 rounded-full peer peer-focus:ring-2 peer-focus:ring-indigo-600/20 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-350 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                        </div>
                        <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest flex items-center gap-2">
                            <FaWhatsapp className="text-emerald-500 text-sm" /> WhatsApp Alert Absentee Parents
                        </span>
                    </label>

                    <div className="flex gap-2 w-full md:w-auto">
                        <button 
                            onClick={() => bulk("Present")} 
                            className="flex-1 md:flex-initial px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest border border-slate-200 text-slate-650 bg-white hover:bg-emerald-50 hover:border-emerald-250 hover:text-emerald-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-emerald-950/20 dark:hover:text-emerald-400 dark:hover:border-emerald-800/40 shadow-sm transition-all"
                        >
                            Mark All Present
                        </button>
                        <button 
                            onClick={() => bulk("Absent")} 
                            className="flex-1 md:flex-initial px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest border border-slate-200 text-rose-600 bg-white hover:bg-rose-50 hover:border-rose-250 hover:text-rose-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-rose-950/20 dark:hover:text-rose-400 dark:hover:border-rose-800/40 shadow-sm transition-all"
                        >
                            Mark All Absent
                        </button>
                    </div>
                </div>
            )}

            {/* 5. DYNAMIC LEDGER CARDS LIST (Visible on all screens) */}
            <div className="space-y-3">
                {loading ? (
                    // LOADING SKELETON
                    Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="h-16 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl animate-pulse" />
                    ))
                ) : !standard ? (
                    // PLACEHOLDER STATE
                    <div className="rounded-3xl border border-slate-200/60 dark:border-slate-800/60 p-20 text-center bg-white dark:bg-slate-900 shadow-sm">
                        <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-850 text-slate-400 flex items-center justify-center mx-auto mb-4">
                            <MdClass size={32} />
                        </div>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Select Class Standard</h3>
                        <p className="text-slate-400 mt-2 font-bold text-[10px] uppercase tracking-widest">Choose standard level to configure active logs</p>
                    </div>
                ) : filtered.length === 0 ? (
                    // EMPTY RECORD
                    <div className="rounded-3xl border border-slate-200/60 dark:border-slate-800/60 p-20 text-center bg-white dark:bg-slate-900 shadow-sm">
                        <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">No Profiles Located</h3>
                        <p className="text-slate-400 mt-2 font-bold text-[10px] uppercase tracking-widest">No student profiles found matching filters</p>
                    </div>
                ) : (
                    // PREMIUM DUAL SELECTOR BUTTON GROUPS
                    filtered.map((s) => {
                        const isPresent = (attendance[s._id] || "Absent") === "Present";
                        const initialLetter = s.name ? s.name.charAt(0).toUpperCase() : "?";
                        
                        return (
                            <div 
                                key={s._id} 
                                className={`
                                    p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900
                                    transition-all duration-300 shadow-sm border-l-4
                                    ${isPresent 
                                        ? 'border-slate-200/60 dark:border-slate-800/60 border-l-emerald-500' 
                                        : 'border-slate-200/60 dark:border-slate-800/60 border-l-rose-500'
                                    }
                                `}
                            >
                                <div className="flex items-center gap-4">
                                    {/* Monogram Avatar */}
                                    <div className={`
                                        w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm border flex-shrink-0 transition-colors
                                        ${isPresent 
                                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-650 dark:text-emerald-400' 
                                            : 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-455'
                                        }
                                    `}>
                                        {initialLetter}
                                    </div>
                                    <div>
                                        <p className="font-extrabold text-sm leading-snug">{s.name}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">
                                                Roll No: #{s.rollNumber}
                                            </span>
                                            <span className="w-1 h-1 rounded-full bg-slate-350 dark:bg-slate-700" />
                                            <span className={`text-[8px] font-black uppercase tracking-wider ${isPresent ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                                {isPresent ? "Present" : "Absent"}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* EXPLICIT DUAL BUTTON SELECTOR GROUP */}
                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                    <button
                                        onClick={() => setStatus(s._id, "Present")}
                                        className={`
                                            flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all duration-200 border text-center justify-center flex items-center gap-1.5
                                            ${isPresent 
                                                ? 'bg-emerald-600 border-emerald-700 text-white shadow-sm shadow-emerald-500/20' 
                                                : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:bg-slate-800/40 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
                                            }
                                        `}
                                    >
                                        Present
                                    </button>
                                    <button
                                        onClick={() => setStatus(s._id, "Absent")}
                                        className={`
                                            flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all duration-200 border text-center justify-center flex items-center gap-1.5
                                            ${!isPresent 
                                                ? 'bg-rose-600 border-rose-700 text-white shadow-sm shadow-rose-550/20' 
                                                : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:bg-slate-800/40 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
                                            }
                                        `}
                                    >
                                        Absent
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* 6. SAVE LEDGER ACTION AT THE BOTTOM */}
            {filtered.length > 0 && !loading && (
                <div className="mt-8 flex justify-end bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 p-6 rounded-3xl shadow-sm">
                    <button 
                        onClick={save} 
                        disabled={saving} 
                        className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-indigo-650 hover:bg-indigo-700 text-white font-extrabold text-xs uppercase tracking-widest shadow-md shadow-indigo-600/15 hover:shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <MdSave size={18} />
                        )}
                        {saving ? "Saving..." : attendanceExists ? "Update Ledger" : "Save Ledger"}
                    </button>
                </div>
            )}

        </motion.div>
    );
}
