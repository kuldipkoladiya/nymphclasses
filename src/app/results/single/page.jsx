"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "@/utils/axios";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import Link from "next/link";
import { 
    MdClass, 
    MdEditDocument, 
    MdDateRange, 
    MdScore, 
    MdLibraryBooks, 
    MdSave, 
    MdPerson, 
    MdArrowBack 
} from "react-icons/md";
import { FaWhatsapp } from "react-icons/fa";

export default function CreateSingleResultPage() {
    const router = useRouter();

    const [standard, setStandard] = useState("");
    const [section, setSection] = useState("");
    const [students, setStudents] = useState([]);
    const [selectedStudentId, setSelectedStudentId] = useState("");

    const [examName, setExamName] = useState("");
    const [examDate, setExamDate] = useState("");
    const [totalMaximum, setTotalMaximum] = useState(100);

    const [selectedSubjects, setSelectedSubjects] = useState([]);
    const [subjectMarks, setSubjectMarks] = useState({});

    const [loadingStudents, setLoadingStudents] = useState(false);
    const [saving, setSaving] = useState(false);
    const [sendWhatsApp, setSendWhatsApp] = useState(false);

    const SUBJECT_OPTIONS = [
        "Maths", "Science", "English", "Gujarati", "Hindi", "Social Science", "Computer", "Sanskrit",
        "Paryavaran", "Economics", "Statistics", "B.A.", "Account"
    ];

    // Load students when standard or section changes
    useEffect(() => {
        if (!standard) {
            setStudents([]);
            setSelectedStudentId("");
            return;
        }

        const fetchStudents = async () => {
            setLoadingStudents(true);
            try {
                const res = await axios.get(`/students/by-standard/${standard}?section=${section}`);
                const list = res.data?.students || res.data || [];
                setStudents(list);
                if (list.length === 0) {
                    toast.error(`No students found in Standard ${standard} ${section}`);
                }
            } catch (err) {
                toast.error("Failed to load students for this class.");
            } finally {
                setLoadingStudents(false);
            }
        };

        fetchStudents();
    }, [standard, section]);

    // Handle subject selection/deselection
    const toggleSubject = (sub) => {
        setSelectedSubjects((prev) => {
            if (prev.includes(sub)) {
                const updated = prev.filter((x) => x !== sub);
                setSubjectMarks((marks) => {
                    const next = { ...marks };
                    delete next[sub];
                    return next;
                });
                return updated;
            } else {
                setSubjectMarks((marks) => ({
                    ...marks,
                    [sub]: ""
                }));
                return [...prev, sub];
            }
        });
    };

    const handleMarkChange = (sub, value) => {
        if (+value > totalMaximum) {
            return toast.error(`Marks cannot exceed total maximum (${totalMaximum})`);
        }
        setSubjectMarks((prev) => ({
            ...prev,
            [sub]: value
        }));
    };

    const saveResult = async () => {
        if (!selectedStudentId) return toast.error("Please select a student.");
        if (!examName) return toast.error("Please select or enter the exam name.");
        if (!examDate) return toast.error("Please select the exam date.");
        if (selectedSubjects.length === 0) return toast.error("Please select at least one subject.");

        // Check if any selected subject has empty marks
        for (const sub of selectedSubjects) {
            if (subjectMarks[sub] === "" || subjectMarks[sub] === undefined) {
                return toast.error(`Please enter marks for ${sub}.`);
            }
        }

        setSaving(true);
        try {
            const formattedSubjects = selectedSubjects.map((sub) => ({
                name: sub,
                marksObtained: Number(subjectMarks[sub]),
                totalMarks: totalMaximum
            }));

            await axios.post("/results", {
                studentId: selectedStudentId,
                examName,
                standard,
                examDate,
                subjects: formattedSubjects,
                sendWhatsApp,
            });

            toast.success(sendWhatsApp ? "Result published & WhatsApp alert queued!" : "Result published successfully!");
            router.push("/results/view");
        } catch (err) {
            const errMsg = err.response?.data?.message || "Failed to publish result.";
            toast.error(errMsg);
        } finally {
            setSaving(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto space-y-6 pb-20">
            {/* HEADER */}
            <div className="glass-card p-8 flex flex-col md:flex-row justify-between items-center bg-white dark:bg-slate-900/60">
                <div className="flex items-center gap-6">
                    <Link href="/results">
                        <button className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
                            <MdArrowBack size={24} />
                        </button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Single Student Result</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">Publish Individual Scorecard</p>
                    </div>
                </div>
                <div className="mt-4 md:mt-0">
                    <Link href="/results/view">
                        <button className="px-6 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-sm uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center gap-3">
                            <MdLibraryBooks size={20} /> View Results
                        </button>
                    </Link>
                </div>
            </div>

            {/* SELECTION PANEL */}
            <div className="glass-card p-8 bg-white dark:bg-slate-900/60 space-y-6">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Student & Class Selection</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <InputWrapper label="Standard" icon={<MdClass size={18} />}>
                        <select value={standard} onChange={(e) => setStandard(e.target.value)} className="input-premium input-with-icon appearance-none cursor-pointer">
                            <option value="">Select Level</option>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(s => <option key={s} value={s}>Standard {s}</option>)}
                        </select>
                    </InputWrapper>

                    <InputWrapper label="Section" icon={<MdClass size={18} />}>
                        <select value={section} onChange={(e) => setSection(e.target.value)} className="input-premium input-with-icon appearance-none cursor-pointer">
                            <option value="">Select Section</option>
                            <option value="Morning">Morning</option>
                            <option value="Afternoon">Afternoon</option>
                        </select>
                    </InputWrapper>

                    <InputWrapper label="Select Student" icon={<MdPerson size={18} />}>
                        <select 
                            value={selectedStudentId} 
                            onChange={(e) => setSelectedStudentId(e.target.value)} 
                            disabled={loadingStudents || !standard}
                            className="input-premium input-with-icon appearance-none cursor-pointer disabled:opacity-50"
                        >
                            <option value="">
                                {loadingStudents ? "Loading..." : !standard ? "Select Class First" : "Choose Student"}
                            </option>
                            {students.map(stu => (
                                <option key={stu._id} value={stu._id}>
                                    {stu.name} (Roll: {stu.rollNumber})
                                </option>
                            ))}
                        </select>
                    </InputWrapper>
                </div>
            </div>

            {/* EXAM DETAILS PANEL */}
            <div className="glass-card p-8 bg-white dark:bg-slate-900/60 space-y-6">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Exam Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <InputWrapper label="Exam Name" icon={<MdEditDocument size={18} />}>
                        <select value={examName} onChange={(e) => setExamName(e.target.value)} className="input-premium input-with-icon appearance-none cursor-pointer">
                            <option value="">Select Exam</option>
                            <option value="Weekly Test">Weekly Test</option>
                            <option value="Round Test">Round Test</option>
                        </select>
                    </InputWrapper>

                    <InputWrapper label="Exam Date" icon={<MdDateRange size={18} />}>
                        <input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} className="input-premium input-with-icon" />
                    </InputWrapper>

                    <InputWrapper label="Max Marks (per subject)" icon={<MdScore size={18} />}>
                        <input type="number" value={totalMaximum} onChange={(e) => setTotalMaximum(+e.target.value)} className="input-premium input-with-icon" />
                    </InputWrapper>
                </div>
            </div>

            {/* SUBJECTS & MARKS PANEL */}
            <div className="glass-card p-8 bg-white dark:bg-slate-900/60 space-y-6">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Subjects Selection</h3>
                <div className="flex flex-wrap gap-2">
                    {SUBJECT_OPTIONS.map(sub => {
                        const active = selectedSubjects.includes(sub);
                        return (
                            <button 
                                type="button"
                                key={sub} 
                                onClick={() => toggleSubject(sub)} 
                                className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border ${
                                    active 
                                        ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20' 
                                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-blue-600'
                                }`}
                            >
                                {sub}
                            </button>
                        );
                    })}
                </div>

                {selectedSubjects.length > 0 && (
                    <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 space-y-4">
                        <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Enter Subject Marks</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                            {selectedSubjects.map(sub => (
                                <div key={sub} className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                    <span className="font-bold text-sm text-slate-700 dark:text-slate-300">{sub}</span>
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="number" 
                                            value={subjectMarks[sub] || ""} 
                                            onChange={(e) => handleMarkChange(sub, e.target.value)}
                                            placeholder="Score"
                                            className="w-20 text-center py-2 px-3 rounded-xl font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-blue-600 transition-all outline-none text-slate-900 dark:text-white"
                                        />
                                        <span className="text-xs font-bold text-slate-400">/ {totalMaximum}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* ACTION FOOTER */}
            <div className="glass-card p-6 bg-white dark:bg-slate-900/60 flex flex-col sm:flex-row justify-between items-center gap-4">
                <label className="flex items-center gap-3 cursor-pointer group select-none">
                    <div className="relative">
                        <input 
                            type="checkbox" 
                            checked={sendWhatsApp} 
                            onChange={(e) => setSendWhatsApp(e.target.checked)} 
                            className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-slate-200 dark:bg-slate-800 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-600/30 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </div>
                    <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                        <FaWhatsapp className="text-green-500 text-lg" /> Send WhatsApp Alert
                    </span>
                </label>

                <button onClick={saveResult} disabled={saving} className="btn-primary w-full sm:w-auto">
                    {saving ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>
                            <MdSave size={20} /> Publish Result
                        </>
                    )}
                </button>
            </div>
        </motion.div>
    );
}

function InputWrapper({ label, icon, children }) {
    return (
        <div className="group">
            <label className="label-premium ml-1">{label}</label>
            <div className="relative">
                <div className="input-icon top-1/2 -translate-y-1/2">{icon}</div>
                {children}
            </div>
        </div>
    );
}
