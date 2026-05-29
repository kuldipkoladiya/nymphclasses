"use client";

import { useState } from "react";
import axios from "@/utils/axios";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MdArrowBack, MdSearch, MdSchool, MdAssignment, MdDelete, MdDownload, MdGrade, MdPercent, MdPerson, MdNumbers, MdClass, MdEdit, MdSave, MdCancel } from "react-icons/md";
import toast from "react-hot-toast";
import Popup from "@/components/Popup";
import { FaWhatsapp } from "react-icons/fa";
import Link from "next/link";

export default function ViewResultsPage() {
    const router = useRouter();

    const [standard, setStandard] = useState("");
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [results, setResults] = useState([]);
    const [selectedResult, setSelectedResult] = useState(null);

    const [loadingStudents, setLoadingStudents] = useState(false);
    const [loadingResults, setLoadingResults] = useState(false);
    const [loadingDetail, setLoadingDetail] = useState(false);

    const [popup, setPopup] = useState(null);
    const [deleteId, setDeleteId] = useState(null);

    // EDIT STATE
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState(null);
    const [saving, setSaving] = useState(false);
    const [sendingWhatsApp, setSendingWhatsApp] = useState(false);

    const loadStudents = async () => {
        if (!standard) return toast.error("Enter standard first.");
        setLoadingStudents(true);
        try {
            const res = await axios.get(`/students/by-standard/${standard}`);
            const list = res.data?.students || res.data || [];
            setStudents(list);
            setSelectedStudent(null);
            setResults([]);
            setSelectedResult(null);
            if (!list.length) toast.error("No students found.");
        } catch {
            toast.error("Failed to load students.");
        } finally {
            setLoadingStudents(false);
        }
    };

    const loadResultsByStudent = async (student) => {
        setSelectedStudent(student);
        setLoadingResults(true);
        try {
            const res = await axios.get(`/results/student/${student._id}`);
            setResults(Array.isArray(res.data) ? res.data : []);
            setSelectedResult(null);
            setIsEditing(false);
        } catch {
            toast.error("Failed to load results.");
        } finally {
            setLoadingResults(false);
        }
    };

    const loadResultDetail = async (id) => {
        setLoadingDetail(true);
        setIsEditing(false);
        try {
            const res = await axios.get(`/results/id/${id}`);
            const data = res.data?.data || res.data;
            setSelectedResult(data);
        } catch {
            toast.error("Failed to load result detail.");
        } finally {
            setLoadingDetail(false);
        }
    };

    const handleEditStart = () => {
        setEditData({ ...selectedResult });
        setIsEditing(true);
    };

    const handleMarkChange = (index, value) => {
        const newSubjects = [...editData.subjects];
        newSubjects[index].marksObtained = value;
        setEditData({ ...editData, subjects: newSubjects });
    };

    const saveEdit = async () => {
        setSaving(true);
        try {
            await axios.put(`/results/${editData._id}`, {
                subjects: editData.subjects,
                examName: editData.examName
            });
            toast.success("Result updated!");
            setIsEditing(false);
            loadResultDetail(editData._id);
            loadResultsByStudent(selectedStudent);
        } catch {
            toast.error("Update failed.");
        } finally {
            setSaving(false);
        }
    };

    const downloadPdf = async () => {
        try {
            const res = await axios.get(`/results/pdf/${selectedStudent._id}/${selectedResult._id}`, { responseType: "blob" });
            const url = window.URL.createObjectURL(res.data);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${selectedStudent.name}_${selectedResult.examName}.pdf`;
            a.click();
            window.URL.revokeObjectURL(url);
            toast.success("Downloading...");
        } catch {
            toast.error("Download failed.");
        }
    };

    const sendWhatsAppResult = async () => {
        if (!selectedStudent || !selectedResult) return;
        setSendingWhatsApp(true);
        try {
            const res = await axios.post(`/results/send-whatsapp/${selectedStudent._id}/${selectedResult._id}`);
            if (res.data?.success || res.status === 200) {
                toast.success("Result PDF sent via WhatsApp!");
            } else {
                toast.error(res.data?.error || "Failed to send WhatsApp.");
            }
        } catch (error) {
            console.error("WhatsApp sending failed:", error);
            const errMsg = error.response?.data?.error || "Failed to send WhatsApp.";
            toast.error(errMsg);
        } finally {
            setSendingWhatsApp(false);
        }
    };

    const confirmDelete = async () => {
        try {
            await axios.delete(`/results/${deleteId}`);
            setResults(p => p.filter(r => r._id !== deleteId));
            setSelectedResult(null);
            toast.success("Result deleted.");
        } catch {
            toast.error("Delete failed.");
        } finally {
            setPopup(null);
            setDeleteId(null);
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-7xl mx-auto space-y-6 pb-20">
            {/* HEADER */}
            <div className="glass-card p-8 flex flex-col md:flex-row justify-between items-center bg-white dark:bg-slate-900/60">
                <div className="flex items-center gap-6">
                    <button onClick={() => router.back()} className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                        <MdArrowBack size={20} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Performance Explorer</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">Class → Student → Exam Lifecycle</p>
                    </div>
                </div>
                <Link href="/results/whatsapp" className="mt-4 md:mt-0">
                    <button className="px-6 py-4 rounded-2xl bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 font-bold text-sm uppercase tracking-widest hover:bg-green-600 hover:text-white transition-all flex items-center gap-3 border border-green-500/10 hover:border-green-600">
                        <FaWhatsapp size={20} /> Link Device
                    </button>
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* STEP 1: SELECT CLASS & STUDENT */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="glass-card p-6 bg-white dark:bg-slate-900/60">
                        <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-4">Step 1: Identity Selection</h3>
                        <div className="flex gap-2">
                            <div className="relative flex-1 group">
                                <MdClass className="input-icon top-1/2 -translate-y-1/2" />
                                <input className="input-premium input-with-icon" placeholder="Std (e.g. 10)" value={standard} onChange={(e) => setStandard(e.target.value)} />
                            </div>
                            <button onClick={loadStudents} disabled={loadingStudents} className="px-4 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20">
                                {loadingStudents ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <MdSearch size={20} />}
                            </button>
                        </div>

                        <div className="mt-6 space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {students.map(s => (
                                <button 
                                    key={s._id} 
                                    onClick={() => loadResultsByStudent(s)}
                                    className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${selectedStudent?._id === s._id ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-600/20' : 'bg-slate-50/50 dark:bg-white/[0.02] border-slate-100 dark:border-white/5 text-slate-700 dark:text-slate-300 hover:border-blue-600/30'}`}
                                >
                                    <div className="text-left">
                                        <p className="text-xs font-black tracking-tight">{s.name}</p>
                                        <p className={`text-[9px] font-bold uppercase tracking-widest mt-0.5 ${selectedStudent?._id === s._id ? 'text-white/70' : 'text-slate-400'}`}>Roll: {s.rollNumber}</p>
                                    </div>
                                    <MdPerson className={selectedStudent?._id === s._id ? 'text-white/40' : 'text-slate-300'} />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* STEP 2: EXAM LIST */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="glass-card p-6 bg-white dark:bg-slate-900/60 min-h-[500px]">
                        <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-4">Step 2: Exam Timeline</h3>
                        {loadingResults ? (
                            <div className="space-y-4">
                                {[1,2,3].map(i => <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />)}
                            </div>
                        ) : results.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                                <MdAssignment size={40} className="mb-2 opacity-20" />
                                <p className="text-[10px] font-black uppercase tracking-widest">No Exams Found</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {results.map(r => (
                                    <button 
                                        key={r._id} 
                                        onClick={() => loadResultDetail(r._id)}
                                        className={`w-full p-4 rounded-2xl border transition-all text-left ${selectedResult?._id === r._id ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-600/20' : 'bg-slate-50/50 dark:bg-white/[0.02] border-slate-100 dark:border-white/5 text-slate-700 dark:text-slate-300 hover:border-blue-600/30'}`}
                                    >
                                        <p className="text-xs font-black tracking-tight">{r.examName}</p>
                                        <div className="flex justify-between items-center mt-2">
                                            <span className={`text-[9px] font-bold uppercase ${selectedResult?._id === r._id ? 'text-white/70' : 'text-slate-400'}`}>
                                                {new Date(r.examDate).toLocaleDateString()}
                                            </span>
                                            <span className={`px-2 py-0.5 rounded-md font-black text-[9px] ${selectedResult?._id === r._id ? 'bg-white/20 text-white' : 'bg-blue-600/10 text-blue-600'}`}>
                                                {r.grade}
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* STEP 3: SCORECARD DETAIL / EDIT */}
                <div className="lg:col-span-5">
                    <AnimatePresence mode="wait">
                        {loadingDetail ? (
                            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="glass-card p-12 bg-white dark:bg-slate-900/60 flex items-center justify-center">
                                <div className="w-8 h-8 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
                            </motion.div>
                        ) : isEditing ? (
                            <motion.div 
                                key="edit"
                                initial={{ opacity: 0, scale: 0.95 }} 
                                animate={{ opacity: 1, scale: 1 }} 
                                className="glass-card overflow-hidden bg-white dark:bg-slate-900/60 p-8 border-2 border-blue-600/20"
                            >
                                <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-6">Edit Result Details</h3>
                                <div className="space-y-6">
                                    <div className="relative group">
                                        <MdAssignment className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input 
                                            className="input-premium pl-11" 
                                            value={editData.examName} 
                                            onChange={(e) => setEditData({...editData, examName: e.target.value})} 
                                            placeholder="Exam Name"
                                        />
                                    </div>

                                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                        {editData.subjects.map((s, i) => (
                                            <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
                                                <span className="flex-1 text-xs font-black text-slate-700 dark:text-slate-300">{s.name}</span>
                                                <input 
                                                    type="number"
                                                    className="w-20 text-center py-2 bg-white dark:bg-slate-800 border rounded-xl text-sm font-black text-blue-600 focus:ring-2 ring-blue-600/20 outline-none"
                                                    value={s.marksObtained}
                                                    onChange={(e) => handleMarkChange(i, e.target.value)}
                                                />
                                                <span className="text-[10px] font-bold text-slate-400">/ {s.totalMarks}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-white/5">
                                        <button onClick={() => setIsEditing(false)} className="px-6 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
                                            <MdCancel size={18} /> Cancel
                                        </button>
                                        <button onClick={saveEdit} disabled={saving} className="btn-primary py-4">
                                            {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><MdSave size={20} /> Save Changes</>}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ) : selectedResult ? (
                            <motion.div 
                                key="detail"
                                initial={{ opacity: 0, x: 20 }} 
                                animate={{ opacity: 1, x: 0 }} 
                                exit={{ opacity: 0, x: -20 }}
                                className="glass-card overflow-hidden bg-white dark:bg-slate-900/60"
                            >
                                <div className="p-8 bg-gradient-to-br from-blue-600 to-indigo-700 text-white relative">
                                    <div className="relative z-10">
                                        <h2 className="text-2xl font-black tracking-tightest leading-none mb-2">{selectedResult.examName}</h2>
                                        <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest">{selectedStudent?.name} • Std {selectedResult.standard}</p>
                                        
                                        <div className="grid grid-cols-2 gap-4 mt-8">
                                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                                                <p className="text-[9px] font-black uppercase tracking-widest text-white/60 mb-1">Percentage</p>
                                                <div className="flex items-center gap-2">
                                                    <MdPercent size={18} />
                                                    <span className="text-xl font-black">{selectedResult.percentage}%</span>
                                                </div>
                                            </div>
                                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                                                <p className="text-[9px] font-black uppercase tracking-widest text-white/60 mb-1">Final Grade</p>
                                                <div className="flex items-center gap-2">
                                                    <MdGrade size={18} />
                                                    <span className="text-xl font-black">{selectedResult.grade}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <MdSchool size={120} className="absolute bottom-0 right-0 -mb-8 -mr-8 text-white/10" />
                                </div>

                                <div className="p-8">
                                    <div className="flex justify-between items-center mb-6">
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Subject Breakdown</h4>
                                        <button onClick={handleEditStart} className="p-2 rounded-lg bg-blue-600/10 text-blue-600 hover:bg-blue-600 hover:text-white transition-all">
                                            <MdEdit size={16} />
                                        </button>
                                    </div>
                                    <div className="space-y-4">
                                        {selectedResult.subjects.map(s => (
                                            <div key={s._id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
                                                <span className="text-xs font-black text-slate-700 dark:text-slate-300">{s.name}</span>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-sm font-black text-blue-600">{s.marksObtained}</span>
                                                    <span className="text-[10px] font-bold text-slate-400">/ {s.totalMarks}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <button onClick={downloadPdf} className="btn-primary py-4 flex items-center justify-center gap-2">
                                            <MdDownload size={20} /> Download PDF
                                        </button>
                                        <button 
                                            onClick={sendWhatsAppResult} 
                                            disabled={sendingWhatsApp}
                                            className="px-6 py-4 rounded-2xl bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/10 hover:bg-green-600 hover:text-white hover:border-green-600 disabled:opacity-50 transition-all font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"
                                        >
                                            {sendingWhatsApp ? (
                                                <div className="w-5 h-5 border-2 border-green-600/30 border-t-green-600 dark:border-white/30 dark:border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <FaWhatsapp size={20} />
                                            )}
                                            Send WhatsApp
                                        </button>
                                        <button 
                                            onClick={() => {
                                                setDeleteId(selectedResult._id);
                                                setPopup({
                                                    type: "confirm",
                                                    title: "Remove Exam Result",
                                                    message: "This will permanently delete this exam entry from the student's records."
                                                });
                                            }}
                                            className="px-6 py-4 rounded-2xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/10 hover:bg-rose-500 hover:text-white transition-all font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"
                                        >
                                            <MdDelete size={20} /> Delete Result
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="glass-card p-12 bg-white dark:bg-slate-900/60 border-dashed border-2 flex flex-col items-center justify-center text-slate-400">
                                <MdAssignment size={60} className="mb-4 opacity-10" />
                                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-center">Select an exam to view detailed assessment matrix</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {popup && <Popup open={true} {...popup} onClose={() => setPopup(null)} onConfirm={confirmDelete} />}
        </motion.div>
    );
}
