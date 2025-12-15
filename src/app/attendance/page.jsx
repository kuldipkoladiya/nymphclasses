"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "@/utils/axios";
import { motion } from "framer-motion";

export default function AttendancePage() {
    const [standard, setStandard] = useState("");
    const [date, setDate] = useState("");
    const [students, setStudents] = useState([]);
    const [attendance, setAttendance] = useState({});
    const [attendanceExists, setAttendanceExists] = useState(false);

    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    /* =============================
       DATE DEFAULT
    ============================= */
    useEffect(() => {
        if (!date) {
            const d = new Date();
            setDate(d.toISOString().slice(0, 10));
        }
    }, [date]);

    /* =============================
       LOAD STUDENTS + ATTENDANCE
    ============================= */
    const loadData = async () => {
        if (!standard || !date) return;

        setLoading(true);
        try {
            const sRes = await axios.get(`/students/by-standard/${standard}`);
            const list = sRes.data?.students || sRes.data || [];
            setStudents(list);

            try {
                const aRes = await axios.get(
                    `/attendance/by-standard/${standard}?date=${date}`
                );
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
        }
        setLoading(false);
    };

    useEffect(() => {
        loadData();
        // eslint-disable-next-line
    }, [standard, date]);

    /* =============================
       FILTER
    ============================= */
    const filtered = useMemo(() => {
        if (!search) return students;
        return students.filter(
            (s) =>
                s.name?.toLowerCase().includes(search.toLowerCase()) ||
                String(s.rollNumber || "").includes(search)
        );
    }, [students, search]);

    /* =============================
       HANDLERS
    ============================= */
    const setStatus = (id, status) =>
        setAttendance((p) => ({ ...p, [id]: status }));

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
                students.map((s) =>
                    axios.post("/attendance", {
                        studentId: s._id,
                        date,
                        status: attendance[s._id] || "Absent",
                    })
                )
            );
            setAttendanceExists(true);
        } catch {}
        setSaving(false);
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6">

            {/* HEADER */}
            <div>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    Attendance
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Mark daily attendance (Present / Absent)
                </p>
            </div>

            {/* CONTROLS */}
            <div className="card flex flex-wrap gap-3">
                <select
                    value={standard}
                    onChange={(e) => setStandard(e.target.value)}
                    className="input w-40"
                >
                    <option value="">Standard</option>
                    {[1,2,3,4,5,6,7,8,9,10].map((s) => (
                        <option key={s}>{s}</option>
                    ))}
                </select>

                <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="input w-44"
                />

                <input
                    placeholder="Search student..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="input flex-1"
                />

                <button onClick={() => bulk("Present")} className="btn-outline">
                    All Present
                </button>
                <button onClick={() => bulk("Absent")} className="btn-outline">
                    All Absent
                </button>
            </div>

            {/* EXISTING INFO */}
            {attendanceExists && (
                <div className="card bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
                    Attendance already exists for this date. You can update it.
                </div>
            )}

            {/* LIST */}
            <div className="card divide-y">
                {loading && (
                    <p className="text-center py-6 text-gray-500">
                        Loading students…
                    </p>
                )}

                {!loading && filtered.length === 0 && (
                    <p className="text-center py-6 text-gray-500">
                        No students found
                    </p>
                )}

                {filtered.map((s) => (
                    <motion.div
                        key={s._id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between py-3"
                    >
                        <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                                {s.name}
                            </p>
                            <p className="text-xs text-gray-500">
                                Roll: {s.rollNumber || "-"}
                            </p>
                        </div>

                        <div className="flex gap-2">
                            {["Present", "Absent"].map((st) => (
                                <button
                                    key={st}
                                    onClick={() => setStatus(s._id, st)}
                                    className={`status-btn ${
                                        attendance[s._id] === st ? "active" : ""
                                    }`}
                                >
                                    {st}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* FOOTER */}
            <div className="flex justify-end">
                <button
                    onClick={save}
                    disabled={saving}
                    className="btn-primary px-6"
                >
                    {saving
                        ? "Saving..."
                        : attendanceExists
                            ? "Update Attendance"
                            : "Save Attendance"}
                </button>
            </div>

            {/* STYLES */}
            <style jsx>{`
              .card {
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 1rem;
                padding: 1rem;
              }

              :global(.dark) .card {
                background: #020617; /* slate-950 */
                border-color: #334155;
                color: #e5e7eb;
              }

              .input {
                padding: 0.6rem;
                border-radius: 0.6rem;
                border: 1px solid #e5e7eb;
                background: white;
                color: #111827;
              }

              :global(.dark) .input {
                background: #020617;
                color: #e5e7eb;
                border-color: #334155;
              }

              .btn-primary {
                background: linear-gradient(to right, #6366f1, #7c3aed);
                color: white;
                padding: 0.6rem 1rem;
                border-radius: 0.6rem;
              }

              .btn-outline {
                padding: 0.5rem 0.8rem;
                border-radius: 0.6rem;
                border: 1px solid #e5e7eb;
                background: white;
                color: #111827;
              }

              :global(.dark) .btn-outline {
                background: #020617;
                color: #e5e7eb;
                border-color: #334155;
              }

              .status-btn {
                padding: 0.4rem 0.8rem;
                border-radius: 999px;
                border: 1px solid #e5e7eb;
                font-size: 0.85rem;
                background: white;
                color: #111827;
              }

              :global(.dark) .status-btn {
                background: #020617;
                color: #e5e7eb;
                border-color: #334155;
              }

              .status-btn.active {
                background: #4f46e5;
                color: white;
                border-color: #4f46e5;
              }
            `}</style>
        </div>
    );
}
