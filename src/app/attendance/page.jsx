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
                    const aRes = await axios.get(`/attendance/by-standard/${standard}?date=${date}`);
                    const map = {};
                    aRes.data?.attendance?.forEach((a) => {
                        map[a.studentId] = a.status;
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
                toast.error("Failed to fetch students for the selected class.");
            }
            setLoading(false);
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
            toast.success("Attendance directives saved!");
        } catch {
            toast.error("Failed to save records.");
        }
        setSaving(false);
    };

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full space-y-6">

            {/* HEROCARD HEADER */}
            <div className="saas-panel p-6 shadow-glass flex flex-col md:flex-row justify-between items-center bg-gradient-to-r from-primary-500/10 to-transparent border-l-4 border-l-primary-500">
                <div className="flex gap-4 items-center">
                    <div className="w-16 h-16 bg-white dark:bg-black/20 rounded-2xl flex items-center justify-center shadow-inner">
                        <MdCalendarMonth className="text-primary-500" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-display font-black text-secondary-900 dark:text-white tracking-tight">Active Roster Log</h1>
                        <p className="font-sans text-sm font-semibold text-secondary-500 mt-1 uppercase tracking-widest">Mark daily presence and absence</p>
                    </div>
                </div>

                <div className="mt-4 md:mt-0 flex gap-3">
                    <button
                        onClick={save} disabled={saving || students.length === 0}
                        className="px-8 py-3.5 rounded-2xl font-bold text-sm tracking-wide bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-glow hover:shadow-glass disabled:opacity-50 flex items-center gap-2 transition-all hover:-translate-y-1"
                    >
                        {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <MdSave size={22} />}
                        {saving ? "Processing..." : attendanceExists ? "Override Status" : "Commit File"}
                    </button>
                </div>
            </div>

            {/* CONTROL PANEL */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="saas-panel flex items-center px-4 overflow-hidden focus-within:shadow-md transition-shadow dark:bg-darkCard/80 backdrop-blur-md">
                    <div className="text-primary-500"><MdClass size={22} /></div>
                    <select className="w-full bg-transparent px-3 py-4 outline-none font-bold text-secondary-800 dark:text-white appearance-none cursor-pointer" value={standard} onChange={(e) => setStandard(e.target.value)}>
                        <option value="" disabled>Select Grade Level</option>
                        {["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"].map((s) => <option key={s} value={s}>Grade {s}</option>)}
                    </select>
                </div>

                <div className="saas-panel flex items-center px-4 overflow-hidden focus-within:shadow-md transition-shadow dark:bg-darkCard/80 backdrop-blur-md">
                    <div className="text-primary-500"><MdCalendarMonth size={22} /></div>
                    <input type="date" className="w-full bg-transparent px-3 py-4 outline-none font-bold text-secondary-800 dark:text-white" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>

                <div className="saas-panel flex items-center px-4 overflow-hidden focus-within:shadow-md transition-shadow dark:bg-darkCard/80 backdrop-blur-md">
                    <div className="text-primary-500"><MdSearch size={22} /></div>
                    <input className="w-full bg-transparent px-3 py-4 outline-none font-medium text-secondary-800 dark:text-white placeholder-secondary-400" placeholder="Filter roster..." value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
            </div>

            {/* BATCH ACTIONS */}
            {filtered.length > 0 && (
                <div className="flex gap-4 justify-end">
                    <button onClick={() => bulk("Present")} className="px-6 py-2 rounded-xl text-sm font-bold border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all">Mark All Present</button>
                    <button onClick={() => bulk("Absent")} className="px-6 py-2 rounded-xl text-sm font-bold border border-rose-500/30 bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white transition-all">Mark All Absent</button>
                </div>
            )}

            {/* MASONRY/GRID CARD LAYOUT FOR ATTENDANCE */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {loading ? (
                    Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="saas-panel p-6 h-[140px] flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-white/40 animate-pulse"></div>
                            <div className="space-y-3 flex-1"><div className="h-4 bg-white/40 animate-pulse w-full rounded"></div><div className="h-4 bg-white/40 animate-pulse w-1/2 rounded"></div></div>
                        </div>
                    ))
                ) : !standard ? (
                    <div className="col-span-full saas-panel p-16 text-center">
                        <MdClass className="mx-auto text-secondary-400 mb-4" size={48} />
                        <h3 className="text-xl font-bold">Select Grade Level</h3>
                        <p className="text-secondary-500 mt-2">Please select a class to load the student roster.</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="col-span-full saas-panel p-16 text-center">
                        <h3 className="text-xl font-bold">No Records Found</h3>
                        <p className="text-secondary-500 mt-2">Adjust your search or check class allocations.</p>
                    </div>
                ) : (
                    filtered.map((s) => {
                        const status = attendance[s._id] || "Absent";
                        const isPresent = status === "Present";

                        return (
                            <motion.div key={s._id} layout className={`saas-panel p-5 flex flex-col justify-between transition-all duration-300 ${isPresent ? 'border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.1)]'}`}>
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="font-bold text-secondary-900 dark:text-white text-lg truncate pr-2">{s.name}</p>
                                        <p className="text-xs font-black uppercase text-secondary-500 tracking-widest mt-1">TAG: {s.rollNumber}</p>
                                    </div>
                                    <div className={`w-8 h-8 flex flex-shrink-0 items-center justify-center rounded-full text-white ${isPresent ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                                        {isPresent ? <MdCheckCircle size={18} /> : <MdCancel size={18} />}
                                    </div>
                                </div>

                                <div className="flex rounded-xl overflow-hidden shadow-inner border border-white/20 dark:border-black/50 bg-secondary-100 dark:bg-black/20 p-1 gap-1">
                                    <button
                                        onClick={() => setStatus(s._id, "Present")}
                                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${isPresent ? 'bg-emerald-500 text-white shadow-md' : 'text-secondary-500 hover:bg-white dark:hover:bg-white/10'}`}
                                    >Present</button>
                                    <button
                                        onClick={() => setStatus(s._id, "Absent")}
                                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${!isPresent ? 'bg-rose-500 text-white shadow-md' : 'text-secondary-500 hover:bg-white dark:hover:bg-white/10'}`}
                                    >Absent</button>
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>
        </motion.div>
    );
}
