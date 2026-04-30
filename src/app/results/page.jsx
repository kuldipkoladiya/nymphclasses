"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "@/utils/axios";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import Link from "next/link";
import { MdClass, MdEditDocument, MdDateRange, MdScore, MdCheckCircle, MdLibraryBooks, MdSave, MdGroup } from "react-icons/md";

/* =============================
   API INSTANCE (Token supported via interceptor in @/utils/axios)
============================= */

export default function CreateResultPage() {
    const router = useRouter();

    const [standard, setStandard] = useState("");
    const [examName, setExamName] = useState("");
    const [examDate, setExamDate] = useState("");
    const [totalMaximum, setTotalMaximum] = useState(100);

    const [students, setStudents] = useState([]);
    const [selectedSubjects, setSelectedSubjects] = useState([]);
    const [marks, setMarks] = useState({});

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const SUBJECT_OPTIONS = [
        "Maths", "Science", "English", "Gujarati", "Hindi", "Social Science", "Computer", "Sanskrit"
    ];

    useEffect(() => {
        if (!students.length) return;
        setMarks((prev) => {
            const updated = {};
            students.forEach((stu) => {
                updated[stu._id] = selectedSubjects.map((sub) => {
                    const old = prev[stu._id]?.find((m) => m.name === sub);
                    return old
                        ? { ...old, totalMarks: totalMaximum }
                        : { name: sub, marksObtained: "", totalMarks: totalMaximum };
                });
            });
            return updated;
        });
    }, [selectedSubjects, students, totalMaximum]);

    const loadStudents = async () => {
        if (!standard) return toast.error("Select Class first.");
        if (!selectedSubjects.length) return toast.error("Select at least one subject.");

        setLoading(true);
        try {
            const res = await axios.get(`/students/by-standard/${standard}`);
            const list = res.data?.students || res.data || [];
            if (!list.length) {
                toast.error(`No students found in Class ${standard}`);
                setStudents([]);
            } else {
                setStudents(list);
                toast.success(`Loaded ${list.length} student records`);
            }
        } catch {
            toast.error("Failed to load students.");
        } finally {
            setLoading(false);
        }
    };

    const saveAllResults = async () => {
        if (!examName || !examDate) return toast.error("Missing exam details.");
        setSaving(true);
        try {
            const savePromises = students.map((stu) =>
                axios.post("/results", {
                    studentId: stu._id,
                    examName,
                    standard,
                    examDate,
                    subjects: marks[stu._id],
                })
            );
            await Promise.all(savePromises);
            toast.success("All results published!");
            router.push("/results/view");
        } catch {
            toast.error("Error saving results.");
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
                        <MdEditDocument size={28} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Results</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">Student Scores</p>
                    </div>
                </div>
                <Link href="/results/view">
                    <button className="px-6 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-sm uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center gap-3">
                        <MdLibraryBooks size={20} /> View Results
                    </button>
                </Link>
            </div>

            {/* CONFIG PANEL */}
            <div className="glass-card p-8 bg-white dark:bg-slate-900/60">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <InputWrapper label="Standard" icon={<MdClass />}>
                        <select value={standard} onChange={(e) => setStandard(e.target.value)} className="input-premium pl-12 appearance-none cursor-pointer">
                            <option value="">Select Level</option>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(s => <option key={s} value={s}>Standard {s}</option>)}
                        </select>
                    </InputWrapper>

                    <InputWrapper label="Exam Name" icon={<MdEditDocument />}>
                        <input placeholder="e.g. First Terminal" value={examName} onChange={(e) => setExamName(e.target.value)} className="input-premium pl-12" />
                    </InputWrapper>

                    <InputWrapper label="Exam Date" icon={<MdDateRange />}>
                        <input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} className="input-premium pl-12" />
                    </InputWrapper>

                    <InputWrapper label="Max Marks" icon={<MdScore />}>
                        <input type="number" value={totalMaximum} onChange={(e) => setTotalMaximum(+e.target.value)} className="input-premium pl-12" />
                    </InputWrapper>
                </div>

                <div className="mt-10 pt-10 border-t border-slate-100 dark:border-slate-800">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Subject Selection</h3>
                    <div className="flex flex-wrap gap-2">
                        {SUBJECT_OPTIONS.map(sub => {
                            const active = selectedSubjects.includes(sub);
                            return (
                                <button key={sub} onClick={() => setSelectedSubjects(p => active ? p.filter(x => x !== sub) : [...p, sub])} className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border ${active ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-blue-600'}`}>
                                    {sub}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="mt-8 flex justify-end">
                    <button onClick={loadStudents} disabled={loading} className="btn-primary">
                        {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><MdGroup size={20} /> Load Student Grid</>}
                    </button>
                </div>
            </div>

            {/* MARKS GRID */}
            <AnimatePresence>
                {students.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card overflow-hidden bg-white dark:bg-slate-900/60">
                        <div className="p-6 bg-slate-50/50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-3">
                                <MdScore className="text-blue-600" /> Assessment Matrix
                            </h3>
                            <span className="text-[10px] font-bold px-4 py-1 bg-blue-600/10 text-blue-600 rounded-full border border-blue-600/20 uppercase">
                                {students.length} Records
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50/30 dark:bg-white/[0.01]">
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 sticky left-0 bg-slate-50 dark:bg-slate-900 z-10">Student Identity</th>
                                        {selectedSubjects.map(sub => (
                                            <th key={sub} className="px-8 py-5 text-center text-[10px] font-black text-blue-600 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 border-l border-slate-100 dark:border-slate-800 min-w-[120px]">
                                                {sub} <div className="text-[9px] text-slate-400 font-bold mt-1">/ {totalMaximum}</div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                    {students.map((stu, i) => (
                                        <tr key={stu._id} className="hover:bg-blue-600/[0.02] transition-colors group">
                                            <td className="px-8 py-5 sticky left-0 bg-white dark:bg-slate-900 group-hover:bg-slate-50 dark:group-hover:bg-slate-800 transition-colors">
                                                <p className="font-bold text-slate-900 dark:text-white">{stu.name}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">UID: {stu.rollNumber}</p>
                                            </td>
                                            {marks[stu._id]?.map((m, idx) => (
                                                <td key={idx} className="px-4 py-4 border-l border-slate-50 dark:border-slate-800">
                                                    <div className="flex justify-center">
                                                        <input type="number" max={totalMaximum} value={m.marksObtained} onChange={(e) => {
                                                            const val = e.target.value;
                                                            if (+val > totalMaximum) return toast.error(`Max is ${totalMaximum}`);
                                                            setMarks(p => ({
                                                                ...p,
                                                                [stu._id]: p[stu._id].map((x, subIdx) => subIdx === idx ? { ...x, marksObtained: val } : x)
                                                            }));
                                                        }} className="w-20 text-center py-2 rounded-xl font-bold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-blue-600 transition-all outline-none text-slate-900 dark:text-white" placeholder="---" />
                                                    </div>
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="p-8 bg-slate-50/50 dark:bg-white/[0.02] border-t border-slate-100 dark:border-slate-800 flex justify-end">
                            <button onClick={saveAllResults} disabled={saving} className="btn-primary">
                                {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><MdSave size={20} /> Publish Results</>}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

function InputWrapper({ label, icon, children }) {
    return (
        <div className="space-y-2 group">
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] pl-1">{label}</label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors z-10">{icon}</div>
                {children}
            </div>
        </div>
    );
}
