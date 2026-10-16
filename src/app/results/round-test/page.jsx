"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import axios from "@/utils/axios";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import Link from "next/link";
import {
    MdClass,
    MdEditDocument,
    MdScore,
    MdLibraryBooks,
    MdSave,
    MdGroup,
    MdCalendarMonth,
    MdPerson,
    MdAdd,
    MdClose,
    MdDelete,
    MdDownload,
    MdSearch,
    MdCheck,
    MdTune,
    MdFilterList,
    MdBlock
} from "react-icons/md";
import { FaWhatsapp, FaFilePdf } from "react-icons/fa";
import Popup from "@/components/Popup";

/* ==========================================================
   DEFAULT SUBJECT OPTIONS
========================================================== */
const DEFAULT_SUBJECTS = [
    "Maths", "Science", "English", "Gujarati", "Hindi", 
    "Social Science", "Computer", "Sanskrit", "Paryavaran", 
    "Economics", "Statistics", "B.A.", "Account", 
    "Physics", "Chemistry", "Biology"
];

const ROUND_PRESETS = [
    "Round Test 1",
    "Round Test 2",
    "Round Test 3",
    "Round Test 4",
    "Round Test 5",
    "Round Test - Term 1",
    "Round Test - Term 2",
    "Custom"
];

/* Helper for grade calculation (handles AB as Absent) */
function getGrade(pct, isAllAbsent = false) {
    if (isAllAbsent) {
        return { label: "AB", color: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20" };
    }
    if (pct >= 90) return { label: "A+", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" };
    if (pct >= 80) return { label: "A", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" };
    if (pct >= 70) return { label: "B+", color: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20" };
    if (pct >= 60) return { label: "B", color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20" };
    if (pct >= 50) return { label: "C", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" };
    if (pct >= 35) return { label: "D", color: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20" };
    return { label: "F", color: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20" };
}

export default function RoundTestPage() {
    const router = useRouter();

    // ACTIVE TAB: 'create' | 'manage'
    const [activeTab, setActiveTab] = useState("create");

    // CONFIG STATE
    const [standard, setStandard] = useState("");
    const [section, setSection] = useState("");
    const [roundPreset, setRoundPreset] = useState("Round Test 1");
    const [customExamName, setCustomExamName] = useState("");
    const [totalMaximum, setTotalMaximum] = useState(25);

    // SUBJECT STATE
    const [availableSubjects, setAvailableSubjects] = useState(DEFAULT_SUBJECTS);
    const [selectedSubjects, setSelectedSubjects] = useState(["Maths", "Science"]);
    const [newSubjectInput, setNewSubjectInput] = useState("");
    const [customSubjects, setCustomSubjects] = useState([]);

    // STUDENTS & MARKS STATE
    const [students, setStudents] = useState([]);
    const [marks, setMarks] = useState({});
    const [searchStudent, setSearchStudent] = useState("");

    // LOADING & PROCESS STATES
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [saving, setSaving] = useState(false);
    const [sendWhatsApp, setSendWhatsApp] = useState(true);
    const [whatsappStatus, setWhatsappStatus] = useState("checking");

    // MANAGE TAB STATES
    const [manageStandard, setManageStandard] = useState("");
    const [manageSection, setManageSection] = useState("");
    const [manageRoundName, setManageRoundName] = useState("");
    const [manageSearch, setManageSearch] = useState("");
    const [publishedResults, setPublishedResults] = useState([]);
    const [loadingResults, setLoadingResults] = useState(false);
    const [sendingWhatsAppId, setSendingWhatsAppId] = useState(null);
    const [downloadingId, setDownloadingId] = useState(null);

    // POPUP CONFIRMATION
    const [popup, setPopup] = useState(null);

    // Resolve final exam name
    const effectiveExamName = roundPreset === "Custom" 
        ? (customExamName.trim() || "Round Test") 
        : roundPreset;

    /* Check WhatsApp connection status on mount */
    useEffect(() => {
        const checkStatus = async () => {
            try {
                const res = await axios.get("/results/whatsapp-status");
                if (res.data?.connected) {
                    setWhatsappStatus("connected");
                } else {
                    setWhatsappStatus("disconnected");
                }
            } catch {
                setWhatsappStatus("disconnected");
            }
        };
        checkStatus();
    }, []);

    /* Initialize / update marks matrix whenever students or selected subjects change */
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

    /* Toggle subject selection */
    const toggleSubject = (sub) => {
        setSelectedSubjects((prev) =>
            prev.includes(sub) ? prev.filter((s) => s !== sub) : [...prev, sub]
        );
    };

    /* Add custom subject */
    const handleAddCustomSubject = (e) => {
        if (e) e.preventDefault();
        const trimmed = newSubjectInput.trim();
        if (!trimmed) {
            return toast.error("Please enter a subject name");
        }
        if (availableSubjects.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
            return toast.error(`Subject "${trimmed}" is already in the list!`);
        }

        const updatedAvailable = [...availableSubjects, trimmed];
        setAvailableSubjects(updatedAvailable);
        setCustomSubjects((prev) => [...prev, trimmed]);
        setSelectedSubjects((prev) => [...prev, trimmed]);
        setNewSubjectInput("");
        toast.success(`Custom subject "${trimmed}" added & selected!`);
    };

    /* Remove custom subject */
    const handleRemoveCustomSubject = (sub, e) => {
        e.stopPropagation();
        setAvailableSubjects((prev) => prev.filter((s) => s !== sub));
        setCustomSubjects((prev) => prev.filter((s) => s !== sub));
        setSelectedSubjects((prev) => prev.filter((s) => s !== sub));
        toast.success(`Removed "${sub}"`);
    };

    /* Select All / Clear All subjects */
    const selectAllSubjects = () => setSelectedSubjects([...availableSubjects]);
    const clearSelectedSubjects = () => setSelectedSubjects([]);

    /* Fetch students */
    const loadStudents = async () => {
        if (!standard) return toast.error("Select Standard first.");
        if (!selectedSubjects.length) return toast.error("Select at least one subject.");

        setLoadingStudents(true);
        try {
            const res = await axios.get(`/students/by-standard/${standard}?section=${section}`);
            const list = res.data?.students || res.data || [];
            if (!list.length) {
                toast.error(`No students found in Standard ${standard} ${section ? `(${section})` : ""}`);
                setStudents([]);
            } else {
                setStudents(list);
                toast.success(`Loaded ${list.length} student records`);
            }
        } catch (err) {
            toast.error("Failed to load students.");
        } finally {
            setLoadingStudents(false);
        }
    };

    /* Handle mark input changes - supports numeric marks or "AB" (Absent) */
    const handleMarkInput = (studentId, subIndex, val) => {
        const raw = val.trim().toUpperCase();
        let finalVal = val;
        if (raw === "AB" || raw === "A") {
            finalVal = "AB";
        } else if (raw !== "" && !isNaN(Number(raw))) {
            if (+raw > totalMaximum || +raw < 0) {
                return toast.error(`Marks must be between 0 and ${totalMaximum}`);
            }
            finalVal = raw;
        } else if (raw !== "") {
            return;
        }
        setMarks((prev) => ({
            ...prev,
            [studentId]: (prev[studentId] || []).map((m, idx) =>
                idx === subIndex ? { ...m, marksObtained: finalVal } : m
            ),
        }));
    };

    /* Mark single subject as AB */
    const toggleCellAB = (studentId, subIndex) => {
        setMarks((prev) => {
            const current = prev[studentId]?.[subIndex]?.marksObtained;
            const nextVal = current === "AB" ? "" : "AB";
            return {
                ...prev,
                [studentId]: (prev[studentId] || []).map((m, idx) =>
                    idx === subIndex ? { ...m, marksObtained: nextVal } : m
                ),
            };
        });
    };

    /* Mark entire student absent (all subjects AB) */
    const markStudentAbsent = (studentId) => {
        setMarks((prev) => {
            const currentAllAB = (prev[studentId] || []).every((m) => m.marksObtained === "AB");
            const nextVal = currentAllAB ? "" : "AB";
            return {
                ...prev,
                [studentId]: (prev[studentId] || []).map((m) => ({
                    ...m,
                    marksObtained: nextVal,
                })),
            };
        });
        toast("Updated student absent status", { icon: "ℹ️" });
    };

    /* Quick Fill helper */
    const handleQuickFill = (type) => {
        if (!students.length) return;
        setMarks((prev) => {
            const next = {};
            students.forEach((stu) => {
                next[stu._id] = (prev[stu._id] || []).map((m) => {
                    if (type === "ab-blank") {
                        return {
                            ...m,
                            marksObtained: (m.marksObtained === "" || m.marksObtained === null || m.marksObtained === undefined) ? "AB" : m.marksObtained,
                        };
                    }
                    return {
                        ...m,
                        marksObtained: 
                            type === "full" 
                                ? totalMaximum 
                                : type === "zero" 
                                ? 0 
                                : type === "ab" 
                                ? "AB" 
                                : "",
                    };
                });
            });
            return next;
        });

        toast.success(
            type === "full" 
                ? `Set all marks to ${totalMaximum}` 
                : type === "zero" 
                ? "Set all marks to 0" 
                : type === "ab" 
                ? "Marked all students as AB (Absent)" 
                : type === "ab-blank"
                ? "Filled empty entries with AB"
                : "Cleared all marks"
        );
    };

    /* Save & Publish Round Test Results */
    const publishRoundResults = async () => {
        if (!students.length) return toast.error("No student records loaded.");
        if (!effectiveExamName) return toast.error("Exam name is required.");

        // Build array of result payloads (marksObtained can be number or "AB")
        const payloadResults = students.map((stu) => ({
            studentId: stu._id,
            examName: effectiveExamName,
            standard: stu.standard || standard,
            subjects: marks[stu._id] || [],
        }));

        setSaving(true);
        try {
            // First attempt optimized batch endpoint
            try {
                await axios.post("/results/batch", {
                    results: payloadResults,
                    sendWhatsApp,
                });
            } catch (batchErr) {
                console.warn("Batch endpoint fallback, saving individually:", batchErr);
                const savePromises = payloadResults.map((item) =>
                    axios.post("/results", {
                        ...item,
                        sendWhatsApp,
                    })
                );
                await Promise.all(savePromises);
            }

            toast.success(
                sendWhatsApp
                    ? `Results published & WhatsApp scorecard queued for ${students.length} students!`
                    : `Published Round Test results for ${students.length} students!`
            );

            // Automatically switch to view results tab
            setManageStandard(standard);
            setManageSection(section);
            setManageRoundName(effectiveExamName);
            setActiveTab("manage");
            loadManageResults(standard, effectiveExamName, section);
        } catch (err) {
            console.error("Save error:", err);
            toast.error(err.response?.data?.error || err.response?.data?.message || "Failed to publish results.");
        } finally {
            setSaving(false);
        }
    };

    /* Load Results for Manage Tab */
    const loadManageResults = async (std = manageStandard, exam = manageRoundName, sec = manageSection) => {
        if (!std) return toast.error("Select Standard to view results.");
        setLoadingResults(true);
        try {
            let res;
            try {
                res = await axios.get(`/results/by-class?standard=${std}&examName=${encodeURIComponent(exam || "Round")}&section=${sec}`);
            } catch {
                // Fallback: load students for class and query their results
                const studentRes = await axios.get(`/students/by-standard/${std}?section=${sec}`);
                const stuList = studentRes.data?.students || studentRes.data || [];
                const allRes = [];
                for (const s of stuList.slice(0, 50)) {
                    try {
                        const r = await axios.get(`/results/student/${s._id}`);
                        if (Array.isArray(r.data)) {
                            allRes.push(...r.data);
                        }
                    } catch {}
                }
                res = { data: allRes };
            }

            let list = res.data || [];
            if (exam) {
                list = list.filter((r) => r.examName && r.examName.toLowerCase().includes(exam.toLowerCase()));
            }
            setPublishedResults(list);
            if (!list.length) {
                toast("No round test results found for this selection.", { icon: "ℹ️" });
            }
        } catch (err) {
            toast.error("Failed to load round test results.");
        } finally {
            setLoadingResults(false);
        }
    };

    /* Download PDF for a specific result */
    const downloadPdf = async (student, result) => {
        setDownloadingId(result._id);
        try {
            const stuId = result.studentId?._id || result.studentId || student?._id;
            const res = await axios.get(`/results/pdf/${stuId}/${result._id}`, { responseType: "blob" });
            const url = window.URL.createObjectURL(res.data);
            const a = document.createElement("a");
            const studentName = (result.studentId?.name || student?.name || "Student").replace(/\s+/g, "_");
            const examClean = (result.examName || "Round_Test").replace(/\s+/g, "_");
            a.href = url;
            a.download = `${studentName}_${examClean}_Result.pdf`;
            a.click();
            window.URL.revokeObjectURL(url);
            toast.success("PDF downloaded!");
        } catch (err) {
            toast.error("Failed to download PDF scorecard.");
        } finally {
            setDownloadingId(null);
        }
    };

    /* Send WhatsApp for a specific result */
    const sendSingleWhatsApp = async (student, result) => {
        setSendingWhatsAppId(result._id);
        try {
            const stuId = result.studentId?._id || result.studentId || student?._id;
            const res = await axios.post(`/results/send-whatsapp/${stuId}/${result._id}`);
            if (res.data?.success) {
                toast.success(`WhatsApp scorecard sent to ${result.studentId?.name || "student"}!`);
            } else {
                toast.error(res.data?.error || "WhatsApp sending failed.");
            }
        } catch (err) {
            toast.error(err.response?.data?.error || "Error sending WhatsApp message.");
        } finally {
            setSendingWhatsAppId(null);
        }
    };

    /* Delete result */
    const handleDeleteResult = (resultId) => {
        setPopup({
            title: "Delete Round Test Result",
            message: "Are you sure you want to permanently delete this round test result?",
            type: "danger",
            confirmText: "Delete",
            cancelText: "Cancel",
            onConfirm: async () => {
                try {
                    await axios.delete(`/results/${resultId}`);
                    setPublishedResults((prev) => prev.filter((r) => r._id !== resultId));
                    toast.success("Result deleted successfully.");
                } catch {
                    toast.error("Failed to delete result.");
                }
                setPopup(null);
            },
            onCancel: () => setPopup(null),
        });
    };

    /* Filter students in create grid */
    const filteredStudents = useMemo(() => {
        if (!searchStudent.trim()) return students;
        const q = searchStudent.toLowerCase();
        return students.filter(
            (s) =>
                s.name?.toLowerCase().includes(q) ||
                String(s.rollNumber).toLowerCase().includes(q)
        );
    }, [students, searchStudent]);

    /* Filter published results in manage view */
    const filteredPublishedResults = useMemo(() => {
        if (!manageSearch.trim()) return publishedResults;
        const q = manageSearch.toLowerCase();
        return publishedResults.filter(
            (r) =>
                r.studentId?.name?.toLowerCase().includes(q) ||
                String(r.studentId?.rollNumber).toLowerCase().includes(q) ||
                r.examName?.toLowerCase().includes(q)
        );
    }, [publishedResults, manageSearch]);

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto space-y-6 pb-24 px-4 sm:px-6">
            {/* ========================================================
               HEADER & NAVIGATION BAR
            ======================================================== */}
            <div className="glass-card p-6 sm:p-8 bg-white dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 shadow-xl rounded-3xl">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    {/* Left Branding */}
                    <div className="flex items-center gap-4 sm:gap-5">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/25 shrink-0">
                            <MdScore size={32} />
                        </div>
                        <div>
                            <div className="flex flex-wrap items-center gap-3">
                                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                                    Round Test Exam
                                </h1>
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                                    No Date Required
                                </span>
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                                    AB (Absent) Supported
                                </span>
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">
                                Assessment Matrix • Custom Subjects • WhatsApp & PDF Reports
                            </p>
                        </div>
                    </div>

                    {/* Right Action Links */}
                    <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full lg:w-auto">
                        <Link href="/results">
                            <button className="px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs uppercase tracking-wider hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center gap-2">
                                <MdEditDocument size={16} /> Results Hub
                            </button>
                        </Link>
                        <Link href="/results/whatsapp">
                            <button className="px-4 py-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider hover:bg-emerald-600 hover:text-white transition-all flex items-center gap-2 border border-emerald-500/20">
                                <FaWhatsapp size={16} />
                                <span>WhatsApp</span>
                                <span className={`w-2 h-2 rounded-full ${whatsappStatus === "connected" ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
                            </button>
                        </Link>
                        <Link href="/results/monthly">
                            <button className="px-4 py-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-wider hover:bg-blue-600 hover:text-white transition-all flex items-center gap-2 border border-blue-500/10">
                                <MdCalendarMonth size={16} /> Monthly
                            </button>
                        </Link>
                        <Link href="/results/view">
                            <button className="px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs uppercase tracking-wider hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center gap-2">
                                <MdLibraryBooks size={16} /> View All
                            </button>
                        </Link>
                    </div>
                </div>

                {/* Sub-tab Navigation */}
                <div className="flex items-center gap-2 mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                    <button
                        onClick={() => setActiveTab("create")}
                        className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2.5 ${
                            activeTab === "create"
                                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                                : "text-slate-500 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800/60"
                        }`}
                    >
                        <MdEditDocument size={18} /> Create Round Result
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab("manage");
                            if (standard) {
                                setManageStandard(standard);
                                loadManageResults(standard, effectiveExamName, section);
                            }
                        }}
                        className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2.5 ${
                            activeTab === "manage"
                                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                                : "text-slate-500 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800/60"
                        }`}
                    >
                        <FaFilePdf size={16} /> View & WhatsApp Send ({publishedResults.length})
                    </button>
                </div>
            </div>

            {/* ========================================================
               TAB 1: CREATE ROUND RESULT
            ======================================================== */}
            {activeTab === "create" && (
                <div className="space-y-6">
                    {/* CONFIG CARD */}
                    <div className="glass-card p-6 sm:p-8 bg-white dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 shadow-xl rounded-3xl space-y-6">
                        <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                            <MdTune className="text-blue-600" size={22} />
                            <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider">
                                1. Exam Configuration
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                            {/* Standard */}
                            <InputWrapper label="Standard / Class *" icon={<MdClass size={18} />}>
                                <select
                                    value={standard}
                                    onChange={(e) => setStandard(e.target.value)}
                                    className="input-premium input-with-icon appearance-none cursor-pointer"
                                >
                                    <option value="">Select Level</option>
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((s) => (
                                        <option key={s} value={s}>
                                            Standard {s}
                                        </option>
                                    ))}
                                </select>
                            </InputWrapper>

                            {/* Section */}
                            <InputWrapper label="Section (Optional)" icon={<MdClass size={18} />}>
                                <select
                                    value={section}
                                    onChange={(e) => setSection(e.target.value)}
                                    className="input-premium input-with-icon appearance-none cursor-pointer"
                                >
                                    <option value="">All Sections</option>
                                    <option value="Morning">Morning</option>
                                    <option value="Afternoon">Afternoon</option>
                                </select>
                            </InputWrapper>

                            {/* Round Exam Name Preset */}
                            <InputWrapper label="Round Test Name *" icon={<MdEditDocument size={18} />}>
                                <select
                                    value={roundPreset}
                                    onChange={(e) => setRoundPreset(e.target.value)}
                                    className="input-premium input-with-icon appearance-none cursor-pointer"
                                >
                                    {ROUND_PRESETS.map((p) => (
                                        <option key={p} value={p}>
                                            {p}
                                        </option>
                                    ))}
                                </select>
                            </InputWrapper>

                            {/* Max Marks */}
                            <InputWrapper label="Max Marks (Per Subject) *" icon={<MdScore size={18} />}>
                                <input
                                    type="number"
                                    min="1"
                                    max="500"
                                    value={totalMaximum}
                                    onChange={(e) => setTotalMaximum(Math.max(1, +e.target.value))}
                                    className="input-premium input-with-icon"
                                    placeholder="e.g. 25"
                                />
                            </InputWrapper>
                        </div>

                        {/* Custom Round Name if 'Custom' selected */}
                        {roundPreset === "Custom" && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                                <InputWrapper label="Custom Round Name *" icon={<MdEditDocument size={18} />}>
                                    <input
                                        type="text"
                                        value={customExamName}
                                        onChange={(e) => setCustomExamName(e.target.value)}
                                        placeholder="e.g. Round Test - Unit 1 Evaluation"
                                        className="input-premium input-with-icon"
                                    />
                                </InputWrapper>
                            </motion.div>
                        )}

                        {/* SUBJECT SELECTION & CUSTOM SUBJECT SECTION */}
                        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                                <div>
                                    <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest flex items-center gap-2">
                                        <span>2. Select Subjects</span>
                                        <span className="px-2 py-0.5 rounded-full bg-blue-600/10 text-blue-600 font-bold text-[10px]">
                                            {selectedSubjects.length} Selected
                                        </span>
                                    </h3>
                                    <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
                                        Click any subject to toggle, or type below to add custom subjects
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={selectAllSubjects}
                                        className="text-[11px] font-bold text-blue-600 hover:underline px-2 py-1"
                                    >
                                        Select All
                                    </button>
                                    <span className="text-slate-300 dark:text-slate-700">•</span>
                                    <button
                                        type="button"
                                        onClick={clearSelectedSubjects}
                                        className="text-[11px] font-bold text-slate-500 hover:text-rose-500 px-2 py-1"
                                    >
                                        Clear All
                                    </button>
                                </div>
                            </div>

                            {/* Subject Pills */}
                            <div className="flex flex-wrap gap-2">
                                {availableSubjects.map((sub) => {
                                    const isSelected = selectedSubjects.includes(sub);
                                    const isCustom = customSubjects.includes(sub);
                                    return (
                                        <button
                                            key={sub}
                                            type="button"
                                            onClick={() => toggleSubject(sub)}
                                            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border select-none ${
                                                isSelected
                                                    ? isCustom
                                                        ? "bg-purple-600 border-purple-600 text-white shadow-md shadow-purple-600/20"
                                                        : "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-600/20"
                                                    : "bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-slate-300 hover:border-blue-500"
                                            }`}
                                        >
                                            {isSelected && <MdCheck size={14} className="stroke-2" />}
                                            <span>{sub}</span>
                                            {isCustom && (
                                                <span
                                                    onClick={(e) => handleRemoveCustomSubject(sub, e)}
                                                    className="ml-1 p-0.5 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
                                                    title="Remove custom subject"
                                                >
                                                    <MdClose size={12} />
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* ADD CUSTOM SUBJECT INPUT */}
                            <form
                                onSubmit={handleAddCustomSubject}
                                className="mt-4 p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-700/60 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center"
                            >
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        value={newSubjectInput}
                                        onChange={(e) => setNewSubjectInput(e.target.value)}
                                        placeholder="Add custom subject name (e.g. Drawing, Sanskrit Grammar, GK, Physics Ch-1...)"
                                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 outline-none focus:border-blue-600 transition-all placeholder:font-normal placeholder:text-slate-400"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shrink-0 shadow-md shadow-purple-600/20"
                                >
                                    <MdAdd size={18} /> Add Subject
                                </button>
                            </form>
                        </div>

                        {/* BOTTOM ACTIONS: WHATSAPP TOGGLE & LOAD BUTTON */}
                        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
                            {/* WhatsApp toggle */}
                            <label className="flex items-center gap-3 cursor-pointer group select-none">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        checked={sendWhatsApp}
                                        onChange={(e) => setSendWhatsApp(e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-200 dark:bg-slate-800 rounded-full peer peer-focus:ring-2 peer-focus:ring-emerald-500/30 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                                </div>
                                <div>
                                    <span className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                                        <FaWhatsapp className="text-emerald-500 text-base" /> Send WhatsApp Scorecard + PDF
                                    </span>
                                    <span className="text-[10px] text-slate-400 block font-medium">
                                        Dispatches detailed scorecard PDF to parents upon publishing
                                    </span>
                                </div>
                            </label>

                            {/* Load Student Grid Button */}
                            <button
                                type="button"
                                onClick={loadStudents}
                                disabled={loadingStudents}
                                className="px-7 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-600/25 transition-all flex items-center justify-center gap-2.5 disabled:opacity-50"
                            >
                                {loadingStudents ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <MdGroup size={20} /> Load Student Grid
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* ASSESSMENT MATRIX (STUDENT TABLE) */}
                    <AnimatePresence>
                        {students.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                className="glass-card overflow-hidden bg-white dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 shadow-2xl rounded-3xl"
                            >
                                {/* Matrix Topbar */}
                                <div className="p-5 sm:p-6 bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center font-black">
                                            <MdScore size={20} />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">
                                                Assessment Matrix: {effectiveExamName}
                                            </h3>
                                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                                Std {standard} {section ? `(${section})` : ""} • Max Marks: {totalMaximum} / subject
                                            </p>
                                        </div>
                                    </div>

                                    {/* Quick Fill & Filter Tools */}
                                    <div className="flex flex-wrap items-center gap-2">
                                        <div className="relative">
                                            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                            <input
                                                type="text"
                                                value={searchStudent}
                                                onChange={(e) => setSearchStudent(e.target.value)}
                                                placeholder="Filter student..."
                                                className="pl-9 pr-3 py-1.5 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:border-blue-600 w-36 sm:w-44"
                                            />
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => handleQuickFill("full")}
                                            className="px-2.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-600 hover:text-white transition-all"
                                            title={`Set all marks to ${totalMaximum}`}
                                        >
                                            Max All
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleQuickFill("ab")}
                                            className="px-2.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-300 dark:border-rose-800/60 hover:bg-rose-600 hover:text-white transition-all"
                                            title="Mark all as AB (Absent)"
                                        >
                                            All AB
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleQuickFill("ab-blank")}
                                            className="px-2.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800/60 hover:bg-amber-600 hover:text-white transition-all"
                                            title="Fill unentered marks with AB"
                                        >
                                            AB for Blank
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleQuickFill("clear")}
                                            className="px-2.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                                            title="Clear all fields"
                                        >
                                            Clear
                                        </button>
                                    </div>
                                </div>

                                {/* Dynamic Table */}
                                <div className="overflow-x-auto custom-scrollbar max-h-[600px]">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="sticky top-0 z-20 bg-slate-100 dark:bg-slate-800/90 backdrop-blur-md">
                                            <tr className="border-b border-slate-200 dark:border-slate-700">
                                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest sticky left-0 bg-slate-100 dark:bg-slate-800 z-30 min-w-[220px]">
                                                    Student Identity
                                                </th>
                                                {selectedSubjects.map((sub) => (
                                                    <th
                                                        key={sub}
                                                        className="px-4 py-4 text-center text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest border-l border-slate-200 dark:border-slate-700 min-w-[120px]"
                                                    >
                                                        <div>{sub}</div>
                                                        <div className="text-[9px] text-slate-400 font-bold mt-0.5">
                                                            / {totalMaximum}
                                                        </div>
                                                    </th>
                                                ))}
                                                <th className="px-4 py-4 text-center text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest border-l border-slate-200 dark:border-slate-700 min-w-[110px]">
                                                    Total
                                                </th>
                                                <th className="px-4 py-4 text-center text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest border-l border-slate-200 dark:border-slate-700 min-w-[90px]">
                                                    Percentage
                                                </th>
                                                <th className="px-4 py-4 text-center text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest border-l border-slate-200 dark:border-slate-700 min-w-[90px]">
                                                    Grade
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {filteredStudents.map((stu) => {
                                                const studentMarks = marks[stu._id] || [];
                                                let totalObtained = 0;
                                                const totalMax = selectedSubjects.length * totalMaximum;
                                                let abCount = 0;

                                                studentMarks.forEach((m) => {
                                                    if (m.marksObtained === "AB") {
                                                        abCount++;
                                                    } else {
                                                        totalObtained += Number(m.marksObtained || 0);
                                                    }
                                                });

                                                const isAllAbsent = studentMarks.length > 0 && abCount === studentMarks.length;
                                                const pct = totalMax > 0 ? ((totalObtained / totalMax) * 100).toFixed(1) : 0;
                                                const grade = getGrade(pct, isAllAbsent);

                                                return (
                                                    <tr
                                                        key={stu._id}
                                                        className="hover:bg-blue-600/[0.03] dark:hover:bg-blue-500/[0.05] transition-colors group"
                                                    >
                                                        {/* Sticky Student Identity */}
                                                        <td className="px-6 py-3.5 sticky left-0 bg-white dark:bg-slate-900 group-hover:bg-slate-50 dark:group-hover:bg-slate-800/80 transition-colors z-10 border-r border-slate-100 dark:border-slate-800">
                                                            <div className="flex justify-between items-start gap-2">
                                                                <div>
                                                                    <p className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                                                                        {stu.name}
                                                                    </p>
                                                                    <div className="flex items-center gap-2 mt-1">
                                                                        <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                                                                            UID: {stu.rollNumber}
                                                                        </span>
                                                                        {stu.section && (
                                                                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold uppercase">
                                                                                {stu.section}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {/* Quick Student-Level Absent Button */}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => markStudentAbsent(stu._id)}
                                                                    className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border ${
                                                                        isAllAbsent
                                                                            ? "bg-rose-600 border-rose-600 text-white shadow-sm"
                                                                            : "bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-500 hover:text-rose-600 hover:border-rose-300"
                                                                    }`}
                                                                    title={isAllAbsent ? "Student is marked Absent" : "Mark Student Absent (All AB)"}
                                                                >
                                                                    {isAllAbsent ? "ABSENT" : "Mark AB"}
                                                                </button>
                                                            </div>
                                                        </td>

                                                        {/* Subject Input Cells */}
                                                        {selectedSubjects.map((sub, idx) => {
                                                            const cellMark = studentMarks[idx]?.marksObtained ?? "";
                                                            const isAB = cellMark === "AB";
                                                            return (
                                                                <td
                                                                    key={sub}
                                                                    className="px-3 py-3 border-l border-slate-100 dark:border-slate-800 text-center"
                                                                >
                                                                    <div className="flex items-center justify-center gap-1.5">
                                                                        <input
                                                                            type="text"
                                                                            value={cellMark}
                                                                            onChange={(e) =>
                                                                                handleMarkInput(stu._id, idx, e.target.value)
                                                                            }
                                                                            placeholder="—"
                                                                            className={`w-16 sm:w-20 text-center py-2 rounded-xl font-black text-sm border transition-all outline-none ${
                                                                                isAB
                                                                                    ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-300 dark:border-rose-800 font-extrabold"
                                                                                    : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 text-slate-900 dark:text-white"
                                                                            }`}
                                                                        />
                                                                        {/* Quick toggle AB for this subject */}
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => toggleCellAB(stu._id, idx)}
                                                                            className={`w-6 h-6 rounded-md text-[9px] font-black transition-all flex items-center justify-center border ${
                                                                                isAB
                                                                                    ? "bg-rose-500 text-white border-rose-500"
                                                                                    : "bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-rose-500 border-slate-200 dark:border-slate-700"
                                                                            }`}
                                                                            title={isAB ? "Clear AB" : "Set AB (Absent)"}
                                                                        >
                                                                            AB
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            );
                                                        })}

                                                        {/* Total Score */}
                                                        <td className="px-4 py-3 border-l border-slate-100 dark:border-slate-800 text-center font-black text-sm text-slate-900 dark:text-white">
                                                            {isAllAbsent ? (
                                                                <span className="text-rose-500 font-bold text-xs uppercase">AB (Absent)</span>
                                                            ) : (
                                                                <>
                                                                    {totalObtained} <span className="text-[10px] text-slate-400 font-bold">/ {totalMax}</span>
                                                                </>
                                                            )}
                                                        </td>

                                                        {/* Percentage */}
                                                        <td className="px-4 py-3 border-l border-slate-100 dark:border-slate-800 text-center font-bold text-xs text-blue-600 dark:text-blue-400">
                                                            {isAllAbsent ? "—" : `${pct}%`}
                                                        </td>

                                                        {/* Grade */}
                                                        <td className="px-4 py-3 border-l border-slate-100 dark:border-slate-800 text-center">
                                                            <span className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-black border ${grade.color}`}>
                                                                {grade.label}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Matrix Footer: Summary & Publish Button */}
                                <div className="p-6 bg-slate-50/70 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
                                    <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                                        <span>Total Students: <strong className="text-slate-900 dark:text-white">{students.length}</strong></span>
                                        <span>•</span>
                                        <span>Subjects: <strong className="text-slate-900 dark:text-white">{selectedSubjects.length}</strong></span>
                                        <span>•</span>
                                        <span>Max Marks: <strong className="text-slate-900 dark:text-white">{selectedSubjects.length * totalMaximum}</strong></span>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={publishRoundResults}
                                        disabled={saving}
                                        className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                    >
                                        {saving ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <MdSave size={20} /> Publish {effectiveExamName}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}

            {/* ========================================================
               TAB 2: VIEW & WHATSAPP SEND
            ======================================================== */}
            {activeTab === "manage" && (
                <div className="space-y-6">
                    {/* FILTER PANEL */}
                    <div className="glass-card p-6 bg-white dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 shadow-xl rounded-3xl">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Standard */}
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">
                                    Standard
                                </label>
                                <select
                                    value={manageStandard}
                                    onChange={(e) => setManageStandard(e.target.value)}
                                    className="input-premium appearance-none cursor-pointer"
                                >
                                    <option value="">Select Level</option>
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((s) => (
                                        <option key={s} value={s}>
                                            Standard {s}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Section */}
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">
                                    Section
                                </label>
                                <select
                                    value={manageSection}
                                    onChange={(e) => setManageSection(e.target.value)}
                                    className="input-premium appearance-none cursor-pointer"
                                >
                                    <option value="">All Sections</option>
                                    <option value="Morning">Morning</option>
                                    <option value="Afternoon">Afternoon</option>
                                </select>
                            </div>

                            {/* Round Test Filter */}
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">
                                    Exam Name Filter
                                </label>
                                <input
                                    type="text"
                                    value={manageRoundName}
                                    onChange={(e) => setManageRoundName(e.target.value)}
                                    placeholder="e.g. Round Test"
                                    className="input-premium"
                                />
                            </div>

                            {/* Search Button */}
                            <div className="flex items-end">
                                <button
                                    type="button"
                                    onClick={() => loadManageResults(manageStandard, manageRoundName, manageSection)}
                                    disabled={loadingResults}
                                    className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 disabled:opacity-50"
                                >
                                    {loadingResults ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <MdFilterList size={18} /> Filter Results
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* RESULTS LIST / TABLE */}
                    <div className="glass-card overflow-hidden bg-white dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 shadow-2xl rounded-3xl">
                        <div className="p-5 sm:p-6 bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">
                                    Published Round Tests ({filteredPublishedResults.length})
                                </h3>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                    Click PDF to download official scorecard or Send to WhatsApp
                                </p>
                            </div>

                            {/* Filter input */}
                            <div className="relative w-full sm:w-64">
                                <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                    type="text"
                                    value={manageSearch}
                                    onChange={(e) => setManageSearch(e.target.value)}
                                    placeholder="Search by student or exam..."
                                    className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:border-blue-600"
                                />
                            </div>
                        </div>

                        {loadingResults ? (
                            <div className="py-20 flex flex-col items-center justify-center gap-3">
                                <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                    Fetching Round Test records...
                                </span>
                            </div>
                        ) : filteredPublishedResults.length === 0 ? (
                            <div className="py-20 text-center space-y-3">
                                <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                    <MdScore size={30} />
                                </div>
                                <h4 className="text-base font-bold text-slate-700 dark:text-slate-300">
                                    No Round Test Results Found
                                </h4>
                                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                                    Select Standard above and click &quot;Filter Results&quot;, or switch to &quot;Create Round Result&quot; to publish new exams.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto custom-scrollbar">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-slate-50 dark:bg-slate-800/80">
                                        <tr className="border-b border-slate-100 dark:border-slate-800">
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                                Student
                                            </th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                                Exam Name
                                            </th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                                Subjects & Marks
                                            </th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">
                                                Total Score
                                            </th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">
                                                Grade
                                            </th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {filteredPublishedResults.map((item) => {
                                            const stu = item.studentId || {};
                                            const isAllAbsent = item.grade === "AB" || (Array.isArray(item.subjects) && item.subjects.length > 0 && item.subjects.every(s => s.marksObtained === "AB"));
                                            const gradeInfo = getGrade(item.percentage || 0, isAllAbsent);
                                            const isSendingThis = sendingWhatsAppId === item._id;
                                            const isDownloadingThis = downloadingId === item._id;

                                            return (
                                                <tr
                                                    key={item._id}
                                                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                                                >
                                                    {/* Student Info */}
                                                    <td className="px-6 py-4">
                                                        <p className="font-bold text-sm text-slate-900 dark:text-white">
                                                            {stu.name || "Student"}
                                                        </p>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                                                            Roll: {stu.rollNumber || "—"} • Std {item.standard || stu.standard} {stu.section ? `(${stu.section})` : ""}
                                                        </p>
                                                    </td>

                                                    {/* Exam Name */}
                                                    <td className="px-6 py-4">
                                                        <span className="inline-block px-3 py-1 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 font-black text-xs">
                                                            {item.examName}
                                                        </span>
                                                    </td>

                                                    {/* Subjects Breakdown */}
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-wrap gap-1.5 max-w-md">
                                                            {item.subjects?.map((s, idx) => (
                                                                <span
                                                                    key={idx}
                                                                    className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                                                                        s.marksObtained === "AB"
                                                                            ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800"
                                                                            : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                                                                    }`}
                                                                >
                                                                    {s.name}: <strong className={s.marksObtained === "AB" ? "text-rose-600 dark:text-rose-400 font-black" : "text-blue-600 dark:text-blue-400"}>{s.marksObtained === "AB" ? "AB" : s.marksObtained}</strong>/{s.totalMarks}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </td>

                                                    {/* Total Score */}
                                                    <td className="px-6 py-4 text-center">
                                                        {isAllAbsent ? (
                                                            <span className="text-rose-500 font-extrabold text-xs uppercase">AB (Absent)</span>
                                                        ) : (
                                                            <>
                                                                <p className="font-black text-sm text-slate-900 dark:text-white">
                                                                    {item.totalObtained} <span className="text-slate-400 text-xs">/ {item.totalMaximum}</span>
                                                                </p>
                                                                <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400">
                                                                    {item.percentage}%
                                                                </p>
                                                            </>
                                                        )}
                                                    </td>

                                                    {/* Grade */}
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-black border ${gradeInfo.color}`}>
                                                            {isAllAbsent ? "AB" : (item.grade || gradeInfo.label)}
                                                        </span>
                                                    </td>

                                                    {/* Actions */}
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            {/* Download PDF */}
                                                            <button
                                                                type="button"
                                                                onClick={() => downloadPdf(stu, item)}
                                                                disabled={isDownloadingThis}
                                                                className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white transition-all border border-blue-500/20 disabled:opacity-50"
                                                                title="Download PDF Scorecard"
                                                            >
                                                                {isDownloadingThis ? (
                                                                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                                                ) : (
                                                                    <MdDownload size={18} />
                                                                )}
                                                            </button>

                                                            {/* Send WhatsApp */}
                                                            <button
                                                                type="button"
                                                                onClick={() => sendSingleWhatsApp(stu, item)}
                                                                disabled={isSendingThis}
                                                                className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all border border-emerald-500/20 disabled:opacity-50"
                                                                title="Send WhatsApp PDF to Parent"
                                                            >
                                                                {isSendingThis ? (
                                                                    <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                                                                ) : (
                                                                    <FaWhatsapp size={18} />
                                                                )}
                                                            </button>

                                                            {/* Delete */}
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDeleteResult(item._id)}
                                                                className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white transition-all border border-rose-500/20"
                                                                title="Delete Result"
                                                            >
                                                                <MdDelete size={18} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* CONFIRMATION POPUP */}
            {popup && (
                <Popup
                    title={popup.title}
                    message={popup.message}
                    type={popup.type}
                    confirmText={popup.confirmText}
                    cancelText={popup.cancelText}
                    onConfirm={popup.onConfirm}
                    onCancel={popup.onCancel}
                />
            )}
        </motion.div>
    );
}

/* Helper wrapper for input fields with icon */
function InputWrapper({ label, icon, children }) {
    return (
        <div className="group">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">
                {label}
            </label>
            <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors pointer-events-none">
                    {icon}
                </div>
                {children}
            </div>
        </div>
    );
}
