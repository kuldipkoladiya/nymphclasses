"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "@/utils/axios";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
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
        "Maths",
        "Science",
        "English",
        "Gujarati",
        "Hindi",
        "Social Science",
        "Computer",
        "Sanskrit"
    ];

    /* =============================
       Sync marks when subjects change
    ============================= */
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

    /* =============================
       Load students
    ============================= */
    const loadStudents = async () => {
        if (!standard) {
            toast.error("Standard parameter missing.");
            return;
        }
        if (!selectedSubjects.length) {
            toast.error("Select at least one syllabus node.");
            return;
        }

        setLoading(true);
        try {
            const res = await axios.get(`/students/by-standard/${standard}`);
            const list = res.data?.students || res.data || [];

            if (!list.length) {
                toast.error(`No entities found in Class ${standard}`);
                setStudents([]);
                setMarks({});
            } else {
                setStudents(list);
                toast.success(`Connected ${list.length} units`);

                const init = {};
                list.forEach((stu) => {
                    init[stu._id] = selectedSubjects.map((s) => ({
                        name: s,
                        marksObtained: "",
                        totalMarks: totalMaximum,
                    }));
                });
                setMarks(init);
            }
        } catch {
            toast.error("Telemetry failed. Retry sequence.");
            setStudents([]);
        }
        setLoading(false);
    };

    /* =============================
       Save results
    ============================= */
    const saveAllResults = async () => {
        if (!examName || !examDate) {
            toast.error("Missing Exam ID or Timestamp.");
            return;
        }

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
            toast.success("Metrics published successfully!");
            setTimeout(() => router.push("/results/view"), 1500);
        } catch {
            toast.error("Upload error. Verify grid inputs.");
        }
        setSaving(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-[1200px] mx-auto space-y-6"
        >
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cyber-panel p-6 shadow-sm">
                <div>
                    <h1 className="text-2xl font-display font-bold text-secondary-900 dark:text-white tracking-tight uppercase">
                        Metrics Ingestion
                    </h1>
                    <p className="font-sans text-sm font-semibold text-secondary-500 mt-1 uppercase tracking-widest">
                        Batch process performance data streams.
                    </p>
                </div>
                <button
                    onClick={() => router.push("/results/view")}
                    className="
                        px-5 py-2.5 rounded-xl font-bold font-display text-sm tracking-wide uppercase
                        bg-secondary-100 dark:bg-darkCard text-secondary-700 dark:text-secondary-300
                        hover:bg-primary-500 hover:text-white border border-secondary-200 dark:border-darkBorder hover:border-primary-500 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]
                        flex items-center gap-2 group
                    "
                >
                    <MdLibraryBooks size={18} className="group-hover:animate-pulse" /> Access Registry
                </button>
            </div>

            {/* FORM CONFIG */}
            <div className="cyber-panel p-6 md:p-8 space-y-8 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-secondary-200 dark:border-darkBorder">
                {/* BASIC INFO */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <InputWrapper label="Level Config" icon={<MdClass />}>
                        <div className="relative">
                            <select
                                value={standard}
                                onChange={(e) => setStandard(e.target.value)}
                                className="styled-input appearance-none cursor-pointer pr-8 uppercase"
                            >
                                <option value="">Target Level</option>
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((s) => (
                                    <option key={s} value={s}>Class {s}</option>
                                ))}
                            </select>
                        </div>
                    </InputWrapper>

                    <InputWrapper label="Evaluation ID" icon={<MdEditDocument />}>
                        <input
                            placeholder="e.g. ALPHA-TEST-1"
                            value={examName}
                            onChange={(e) => setExamName(e.target.value)}
                            className="styled-input"
                        />
                    </InputWrapper>

                    <InputWrapper label="Timestamp" icon={<MdDateRange />}>
                        <input
                            type="date"
                            value={examDate}
                            onChange={(e) => setExamDate(e.target.value)}
                            className="styled-input uppercase"
                        />
                    </InputWrapper>

                    <InputWrapper label="Max Value Threshold" icon={<MdScore />}>
                        <input
                            type="number"
                            min="1"
                            value={totalMaximum}
                            onChange={(e) => setTotalMaximum(+e.target.value)}
                            className="styled-input font-bold text-primary-500 bg-primary-50/10 focus:ring-primary-500"
                        />
                    </InputWrapper>
                </div>

                {/* SUBJECTS */}
                <div className="pt-4 border-t border-secondary-100 dark:border-darkBorder">
                    <div className="flex items-center gap-2 mb-4">
                        <MdLibraryBooks className="text-primary-500" size={20} />
                        <h3 className="text-[10px] font-bold text-secondary-800 dark:text-secondary-200 uppercase tracking-[0.2em]">
                            Syllabus Nodes
                        </h3>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        {SUBJECT_OPTIONS.map((sub) => {
                            const isSelected = selectedSubjects.includes(sub);
                            return (
                                <button
                                    key={sub}
                                    onClick={() => setSelectedSubjects((p) => p.includes(sub) ? p.filter((x) => x !== sub) : [...p, sub])}
                                    className={`
                                        relative px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2 border
                                        ${isSelected
                                            ? "bg-primary-500/10 border-primary-500 text-primary-500 shadow-[0_0_15px_rgba(6,182,212,0.3)] scale-[1.02]"
                                            : "bg-white dark:bg-[#131C31] border-secondary-200 dark:border-darkBorder text-secondary-500 dark:text-secondary-400 hover:border-primary-500/50"}
                                    `}
                                >
                                    {isSelected && <MdCheckCircle size={14} className="animate-pulse" />}
                                    {sub}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* LOAD ACTION */}
                <div className="flex justify-end pt-5 border-t border-secondary-100 dark:border-darkBorder">
                    <button
                        onClick={loadStudents}
                        disabled={loading}
                        className="
                            px-8 py-3 rounded-xl font-bold font-display tracking-wide text-sm flex items-center gap-2
                            bg-primary-500 hover:bg-primary-400 text-white uppercase
                            shadow-neon hover:shadow-neon-intense hover:-translate-y-0.5
                            transition-all disabled:opacity-50 disabled:shadow-none disabled:hover:translate-y-0 disabled:cursor-not-allowed
                        "
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <><MdGroup size={20} /> Connect Class {standard || "?"} Grid</>
                        )}
                    </button>
                </div>
            </div>

            {/* MARKS ENTRY GRID */}
            <AnimatePresence>
                {students.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        className="cyber-panel overflow-hidden border border-secondary-200 dark:border-darkBorder p-0 shadow-none"
                    >
                        <div className="p-4 sm:p-6 bg-secondary-50 dark:bg-darkBg border-b border-secondary-200 dark:border-darkBorder flex justify-between items-center">
                            <h3 className="text-sm font-bold text-secondary-800 dark:text-white flex items-center gap-2 uppercase tracking-widest">
                                <MdScore className="text-primary-500" size={20} /> Data Matrix
                            </h3>
                            <span className="text-[10px] font-black tracking-[0.2em] px-3 py-1 bg-primary-500/10 text-primary-500 rounded-md border border-primary-500/30 uppercase">
                                {students.length} Units Active
                            </span>
                        </div>

                        <div className="overflow-x-auto p-0">
                            <table className="w-full text-sm border-collapse">
                                <thead>
                                    <tr>
                                        <th className="p-4 text-left font-bold text-[10px] text-secondary-500 dark:text-secondary-400 tracking-[0.2em] uppercase sticky left-0 bg-secondary-50 dark:bg-darkBg z-10 border-b border-secondary-200 dark:border-darkBorder min-w-[150px]">
                                            Identity
                                        </th>
                                        {selectedSubjects.map((sub) => (
                                            <th key={sub} className="p-4 text-center font-bold text-[10px] text-primary-600 dark:text-primary-400 uppercase tracking-[0.2em] bg-primary-50/30 dark:bg-primary-900/10 border-b border-secondary-200 dark:border-darkBorder border-l border-secondary-100 dark:border-darkBorder min-w-[120px]">
                                                {sub} <br /> <span className="text-[9px] font-medium text-secondary-400 tracking-wider">MAX: {totalMaximum}</span>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.map((stu, i) => (
                                        <motion.tr
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            key={stu._id}
                                            className="group border-b border-secondary-100 dark:border-darkBorder hover:bg-primary-500/5 dark:hover:bg-primary-900/10 transition-colors"
                                        >
                                            <td className="p-4 font-bold text-secondary-800 dark:text-secondary-200 sticky left-0 bg-white dark:bg-[#131C31] group-hover:bg-secondary-50 dark:group-hover:bg-darkBg transition-colors">
                                                {stu.name}
                                                <div className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest mt-1">UID: {stu.rollNumber}</div>
                                            </td>

                                            {marks[stu._id]?.map((m, idx) => (
                                                <td key={idx} className="p-3 border-l border-secondary-50 dark:border-white/5">
                                                    <div className="flex justify-center">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max={totalMaximum}
                                                            value={m.marksObtained}
                                                            onChange={(e) => {
                                                                const val = e.target.value;
                                                                if (val > totalMaximum) {
                                                                    toast.error(`Value exceeds threshold (${totalMaximum})`);
                                                                    return;
                                                                }
                                                                setMarks((p) => ({
                                                                    ...p,
                                                                    [stu._id]: p[stu._id].map((x, subIdx) =>
                                                                        subIdx === idx ? { ...x, marksObtained: val } : x
                                                                    ),
                                                                }))
                                                            }}
                                                            className="
                                                                w-24 text-center py-2 px-1 rounded-md font-bold font-display bg-white dark:bg-darkCard 
                                                                border border-secondary-300 dark:border-darkBorder focus:border-primary-500 focus:shadow-[inset_0_0_10px_rgba(6,182,212,0.1)]
                                                                text-secondary-900 dark:text-white transition-all outline-none shadow-sm
                                                            "
                                                            placeholder="000"
                                                        />
                                                    </div>
                                                </td>
                                            ))}
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="p-6 bg-secondary-50 dark:bg-darkBg border-t border-secondary-200 dark:border-darkBorder flex justify-end">
                            <button
                                disabled={saving}
                                onClick={saveAllResults}
                                className="
                                    px-10 py-3.5 rounded-xl font-bold font-display uppercase tracking-wide text-sm flex items-center justify-center gap-3 w-full sm:w-auto
                                    bg-primary-500 hover:bg-primary-400 text-white
                                    shadow-neon hover:shadow-neon-intense hover:-translate-y-0.5
                                    transition-all disabled:opacity-50 disabled:shadow-none disabled:hover:translate-y-0 disabled:cursor-not-allowed
                                "
                            >
                                {saving ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <><MdSave size={20} /> Publish Matrix</>
                                )}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* INLINE STYLES FOR INPUTS */}
            <style jsx global>{`
                .styled-input {
                    @apply w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-darkCard border border-secondary-200 dark:border-darkBorder text-secondary-800 dark:text-secondary-100 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-all font-bold tracking-wide shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)];
                }
            `}</style>
        </motion.div>
    );
}

/* =============================
   INPUT WRAPPER
============================= */
function InputWrapper({ label, icon, children }) {
    return (
        <div className="flex flex-col space-y-2 relative group">
            <label className="text-[10px] font-bold text-secondary-500 dark:text-secondary-400 uppercase tracking-[0.2em] pl-1">
                {label}
            </label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-secondary-400 group-focus-within:text-primary-500 transition-colors z-10">
                    {icon}
                </div>
                {children}
            </div>
        </div>
    );
}
