"use client";

import { useState, useEffect } from "react";
import axios from "@/utils/axios";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MdArrowBack, MdWarning, MdSchool, MdPeople, MdCheckCircle, MdArrowForward } from "react-icons/md";
import toast from "react-hot-toast";
import Popup from "@/components/Popup";
import { STANDARDS, getNextStandard } from "@/utils/standards";

export default function PromoteStudentsPage() {
    const router = useRouter();
    const [sourceStd, setSourceStd] = useState("");
    const [sourceSection, setSourceSection] = useState("");
    const [targetStd, setTargetStd] = useState("");
    const [targetSection, setTargetSection] = useState("");
    const [targetYear, setTargetYear] = useState("");

    const [students, setStudents] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [loading, setLoading] = useState(false);
    const [promoting, setPromoting] = useState(false);

    // Safety verification states
    const [checkboxConfirmed, setCheckboxConfirmed] = useState(false);
    const [typedPhrase, setTypedPhrase] = useState("");
    const [popup, setPopup] = useState(null);

    // Fetch students when source standard/section changes
    useEffect(() => {
        if (!sourceStd) {
            setStudents([]);
            setSelectedIds([]);
            return;
        }

        async function fetchStudents() {
            setLoading(true);
            try {
                const res = await axios.get(
                    `/students?standard=${sourceStd}&section=${sourceSection}`
                );
                const list = res.data || [];
                setStudents(list);
                // Pre-select all by default for convenience, but they can uncheck
                setSelectedIds(list.map(s => s._id));
            } catch (err) {
                toast.error("Failed to load students for selection.");
            } finally {
                setLoading(false);
            }
        }
        fetchStudents();
    }, [sourceStd, sourceSection]);

    // Handle select/deselect individual student
    const toggleSelect = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    // Handle select/deselect all
    const toggleSelectAll = () => {
        if (selectedIds.length === students.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(students.map(s => s._id));
        }
    };

    const expectedPhrase = `PROMOTE ${sourceStd} TO ${targetStd}`.toUpperCase();
    const isPhraseMatching = typedPhrase.trim().toUpperCase() === expectedPhrase;
    const isReadyToPromote = 
        sourceStd && 
        targetStd && 
        selectedIds.length > 0 && 
        checkboxConfirmed && 
        isPhraseMatching;

    const handlePromoteClick = () => {
        if (!isReadyToPromote) return;
        setPopup({
            type: "confirm",
            title: "Confirm Bulk Promotion",
            message: `Are you sure you want to promote ${selectedIds.length} students from Standard ${sourceStd} to Standard ${targetStd}? This will update their class profile and assign next year's fees. This cannot be easily undone.`
        });
    };

    const executePromotion = async () => {
        setPopup(null);
        setPromoting(true);
        try {
            await axios.post("/students/bulk-promote", {
                studentIds: selectedIds,
                targetStandard: targetStd,
                targetSection: targetSection || undefined,
                targetAcademicYear: targetYear || undefined
            });
            toast.success(`Successfully promoted ${selectedIds.length} students!`);
            // Reset page state
            setSourceStd("");
            setTargetStd("");
            setSourceSection("");
            setTargetSection("");
            setTargetYear("");
            setTypedPhrase("");
            setCheckboxConfirmed(false);
            setStudents([]);
            setSelectedIds([]);
        } catch (err) {
            const msg = err.response?.data?.message || "Promotion failed.";
            toast.custom((t) => (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-xl max-w-sm w-full text-center">
                    <MdWarning className="text-red-500 mx-auto mb-4" size={40} />
                    <p className="text-sm font-black text-slate-900 dark:text-white uppercase">Promotion Error</p>
                    <p className="text-xs text-slate-400 font-semibold mt-2">{msg}</p>
                    <button onClick={() => toast.dismiss(t.id)} className="btn-primary w-full mt-4 py-2 text-xs">Dismiss</button>
                </div>
            ), { duration: 6000 });
        } finally {
            setPromoting(false);
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="max-w-6xl mx-auto space-y-6 px-4 sm:px-6 pb-20"
        >
            {/* HEADER */}
            <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm">
                <button
                    onClick={() => router.back()}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600 transition-all shadow-sm"
                    title="Go Back"
                >
                    <MdArrowBack size={20} />
                </button>
                <div>
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                        Promote Standard / Classes
                    </h1>
                    <p className="text-slate-400 dark:text-slate-500 font-bold text-[9px] uppercase tracking-widest mt-2">
                        Bulk roll-over students to their next grade level
                    </p>
                </div>
            </div>

            {/* SELECTION CONFIGURATION */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* SOURCE SELECT */}
                <div className="glass-card p-6 bg-white dark:bg-slate-900/60 border-l-[6px] border-l-blue-600">
                    <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                        <MdSchool size={16} /> 1. Select Source Class
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label-premium">Current Standard</label>
                            <select
                                className="input-premium cursor-pointer"
                                value={sourceStd}
                                onChange={(e) => {
                                    setSourceStd(e.target.value);
                                    setTargetStd(getNextStandard(e.target.value));
                                }}
                            >
                                <option value="">Select Standard</option>
                                {STANDARDS.filter(s => s !== "Graduated").map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="label-premium">Section Filter</label>
                            <select
                                className="input-premium cursor-pointer"
                                value={sourceSection}
                                onChange={(e) => setSourceSection(e.target.value)}
                            >
                                <option value="">All Sections</option>
                                <option value="Morning">Morning</option>
                                <option value="Afternoon">Afternoon</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* TARGET SELECT */}
                <div className="glass-card p-6 bg-white dark:bg-slate-900/60 border-l-[6px] border-l-indigo-600">
                    <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                        <MdArrowForward size={16} /> 2. Select Target Class
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="label-premium">Next Standard</label>
                            <select
                                className="input-premium cursor-pointer"
                                value={targetStd}
                                onChange={(e) => setTargetStd(e.target.value)}
                            >
                                <option value="">Select Standard</option>
                                {STANDARDS.map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="label-premium">Target Section</label>
                            <select
                                className="input-premium cursor-pointer"
                                value={targetSection}
                                onChange={(e) => setTargetSection(e.target.value)}
                            >
                                <option value="">Keep Same Section</option>
                                <option value="Morning">Morning</option>
                                <option value="Afternoon">Afternoon</option>
                            </select>
                        </div>
                        <div>
                            <label className="label-premium">Target Session / Year</label>
                            <input
                                type="text"
                                className="input-premium"
                                placeholder="e.g. 2026-27"
                                value={targetYear}
                                onChange={(e) => setTargetYear(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

            </div>

            {/* STUDENTS LIST CHECKLIST */}
            {sourceStd && (
                <div className="glass-card overflow-hidden bg-white dark:bg-slate-900/60">
                    <div className="p-6 border-b border-slate-150 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-white/[0.01]">
                        <div>
                            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                                <MdPeople className="text-indigo-600" /> Select Students to Promote
                            </h3>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">
                                Uncheck any student who failed or is leaving classes
                            </p>
                        </div>
                        <button
                            onClick={toggleSelectAll}
                            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-[10px] font-black uppercase text-slate-600 dark:text-slate-350 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                        >
                            {selectedIds.length === students.length ? "Deselect All" : "Select All"}
                        </button>
                    </div>

                    {loading ? (
                        <div className="p-20 text-center flex flex-col items-center justify-center">
                            <div className="w-10 h-10 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin mb-4" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading student roster...</p>
                        </div>
                    ) : students.length === 0 ? (
                        <div className="p-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                            No students registered in Standard {sourceStd} {sourceSection ? `(${sourceSection})` : ""}
                        </div>
                    ) : (
                        <div className="max-h-[350px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80">
                            {students.map((student) => {
                                const isSelected = selectedIds.includes(student._id);
                                return (
                                    <div 
                                        key={student._id} 
                                        onClick={() => toggleSelect(student._id)}
                                        className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${
                                            isSelected ? "bg-indigo-50/20 dark:bg-indigo-900/5 hover:bg-indigo-50/30" : "hover:bg-slate-50/50"
                                        }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => {}} // Handled by outer container click
                                                className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer pointer-events-none"
                                            />
                                            <div>
                                                <p className="text-sm font-extrabold text-slate-900 dark:text-white">{student.name}</p>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase">Roll No: {student.rollNumber} {student.section ? `| Section: ${student.section}` : ""}</p>
                                            </div>
                                        </div>
                                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[9px] font-black text-slate-500 uppercase">Std {student.standard}</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* SAFETY BOX */}
            {sourceStd && targetStd && selectedIds.length > 0 && (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-6 bg-rose-500/5 border border-rose-500/20 rounded-3xl space-y-6"
                >
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-2xl flex-shrink-0">
                            <MdWarning size={24} />
                        </div>
                        <div>
                            <h4 className="text-sm font-black text-rose-600 dark:text-rose-400 uppercase tracking-wide">Accidental promotion prevention system</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1 leading-relaxed">
                                You are about to promote **{selectedIds.length} students** from **Standard {sourceStd}** to **Standard {targetStd}**. 
                                This operation will update the standard stored on these students&apos; active profiles. 
                                Their past payments, exam marks, and attendance will remain securely locked to Standard {sourceStd} to preserve history.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-rose-500/10">
                        {/* Checkbox Acknowledgment */}
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={checkboxConfirmed}
                                onChange={(e) => setCheckboxConfirmed(e.target.checked)}
                                className="w-5 h-5 rounded text-rose-600 border-rose-350 focus:ring-rose-500 cursor-pointer"
                            />
                            <span className="text-xs font-black text-slate-700 dark:text-slate-350 uppercase select-none">
                                I confirm I have double-checked the selected student roster and target standard.
                            </span>
                        </label>

                        {/* Typed Phrase Challenge */}
                        <div className="flex flex-col space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                Type the challenge phrase below in UPPERCASE:
                            </label>
                            <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-2xl font-mono text-center text-xs font-black text-slate-800 dark:text-slate-200 tracking-wider">
                                {expectedPhrase}
                            </div>
                            <input
                                type="text"
                                className="w-full px-5 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none font-extrabold text-center text-sm text-slate-900 dark:text-white tracking-widest placeholder:font-normal placeholder:tracking-normal focus:ring-4 focus:ring-rose-500/5 focus:border-rose-500/40 transition-all uppercase"
                                placeholder={`Type "${expectedPhrase}" to unlock promotion`}
                                value={typedPhrase}
                                onChange={(e) => setTypedPhrase(e.target.value)}
                            />
                        </div>

                        {/* SUBMIT BUTTON */}
                        <button
                            onClick={handlePromoteClick}
                            disabled={!isReadyToPromote || promoting}
                            className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg ${
                                isReadyToPromote 
                                    ? "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20 active:scale-[0.99] hover:scale-[1.01]" 
                                    : "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed shadow-none border border-slate-200 dark:border-slate-750"
                            }`}
                        >
                            {promoting ? (
                                <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    <MdCheckCircle size={18} /> Promote {selectedIds.length} Students
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>
            )}

            {/* CONFIRMATION POPUP */}
            {popup && (
                <Popup
                    open={true}
                    {...popup}
                    onClose={() => setPopup(null)}
                    onConfirm={executePromotion}
                />
            )}
        </motion.div>
    );
}
