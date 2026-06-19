"use client";

import { useEffect, useState } from "react";
import axios from "@/utils/axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { MdEdit, MdDelete, MdArrowBack, MdPerson, MdPhone, MdLocationOn, MdFamilyRestroom, MdClass, MdNumbers, MdAssignmentInd } from "react-icons/md";
import toast from "react-hot-toast";
import Popup from "@/components/Popup";

export default function StudentDetails({ params }) {
    const { id } = params;
    const router = useRouter();

    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [popup, setPopup] = useState(null);

    async function confirmDelete() {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
        const authHeader = { headers: { Authorization: `Bearer ${token}` } };
        try {
            await axios.delete(`/students/${id}`, authHeader);
            toast.success("Student deleted successfully");
            router.push("/students");
        } catch (err) {
            toast.error("Error deleting student.");
        } finally {
            setPopup(null);
        }
    }

    const openDeletePopup = () => {
        setPopup({
            type: "confirm",
            title: "Delete Student Profile",
            message: "Warning: This action is irreversible. All records (attendance, results, fee logs) for this student will be lost.",
        });
    };

    useEffect(() => {
        async function loadData() {
            const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
            const authHeader = { headers: { Authorization: `Bearer ${token}` } };
            try {
                const res = await axios.get(`/students/${id}`, authHeader);
                setStudent(res.data);
            } catch (err) {
                toast.error("Failed to load student data.");
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [id]);

    if (loading) {
        return (
            <div className="max-w-5xl mx-auto space-y-6 animate-pulse px-4">
                <div className="h-16 bg-gray-200 dark:bg-slate-800 rounded-2xl w-full"></div>
                <div className="h-96 bg-gray-200 dark:bg-slate-800 rounded-3xl w-full mt-6"></div>
            </div>
        );
    }

    if (!student) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] px-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-400 mb-4">
                    <MdPerson size={36} />
                </div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Student Profile Not Found</h2>
                <p className="text-sm text-slate-500 mt-2 mb-6 text-center max-w-sm">The student record you are looking for does not exist or has been removed from the registry.</p>
                <button
                    onClick={() => router.push("/students")}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-755 text-white rounded-2xl shadow-md transition-all font-extrabold text-xs uppercase tracking-widest"
                >
                    Return to Registry
                </button>
            </div>
        );
    }

    const initialLetter = student.name ? student.name.charAt(0).toUpperCase() : "?";

    const getStandardBadgeStyle = (std) => {
        const num = parseInt(std);
        if (num <= 4) return "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 border-blue-100 dark:border-blue-500/20";
        if (num <= 8) return "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20";
        if (num <= 10) return "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 border-indigo-100 dark:border-indigo-500/20";
        return "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 border-rose-100 dark:border-rose-500/20";
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-5xl mx-auto space-y-6 px-4 sm:px-6"
        >
            
            {/* UNIFIED DOSSIER DOSSIER SHEET */}
            <div className="rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 shadow-sm p-6 md:p-8 space-y-8 relative overflow-hidden">
                <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />
                
                {/* 1. TOP DOSSIER HEADER PROFILE ROW */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800 relative z-10">
                    <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
                        <div className="h-16 w-16 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white rounded-2xl flex items-center justify-center font-black text-2xl border border-slate-150 dark:border-slate-700 shadow-inner flex-shrink-0">
                            {initialLetter}
                        </div>
                        <div>
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                                <span className={`px-2 py-0.5 rounded-lg border font-black text-[9px] uppercase tracking-wider ${getStandardBadgeStyle(student.standard)}`}>
                                    Std {student.standard}
                                </span>
                                <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-850 text-slate-500 font-extrabold text-[9px] uppercase tracking-wider">
                                    Roll No: {student.rollNumber}
                                </span>
                            </div>
                            <h1 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white tracking-tight">{student.name}</h1>
                        </div>
                    </div>

                    {/* Quick action bar */}
                    <div className="flex gap-2 items-center w-full sm:w-auto justify-center">
                        <button
                            onClick={() => router.push("/students")}
                            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-850 transition-all shadow-sm"
                            title="Back to Registry"
                        >
                            <MdArrowBack size={18} />
                        </button>
                        <Link href={`/students/${id}/edit`} className="flex-1 sm:flex-initial">
                            <button className="w-full px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs uppercase tracking-widest shadow-md transition-all flex items-center justify-center gap-1.5">
                                <MdEdit size={16} /> Edit Profile
                            </button>
                        </Link>
                        <button
                            onClick={openDeletePopup}
                            className="p-2.5 rounded-xl bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white dark:bg-rose-500/10 dark:text-rose-400 transition-colors flex items-center justify-center"
                            title="Delete Profile"
                        >
                            <MdDelete size={18} />
                        </button>
                    </div>
                </div>

                {/* 2. TWO COLUMN DETAILS DECK */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 relative z-10">
                    
                    {/* LEFT COLUMN: ACADEMIC CREDENTIALS */}
                    <div className="space-y-6">
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <MdAssignmentInd size={16} className="text-indigo-500" /> Academic Dossier
                        </h3>
                        
                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-2.5 border-b border-slate-50 dark:border-slate-800/40">
                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Class standard</span>
                                <span className="font-extrabold text-slate-800 dark:text-slate-200 text-sm">Standard {student.standard}</span>
                            </div>
                            <div className="flex justify-between items-center py-2.5 border-b border-slate-50 dark:border-slate-800/40">
                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Roll Assignment</span>
                                <span className="font-extrabold text-slate-800 dark:text-slate-200 text-sm">{student.rollNumber}</span>
                            </div>
                            <div className="flex justify-between items-center py-2.5 border-b border-slate-50 dark:border-slate-800/40">
                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Class Section</span>
                                <span className="font-extrabold text-slate-800 dark:text-slate-200 text-sm">{student.section || "Section A"}</span>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: PERSONAL & PARENT LEDGER */}
                    <div className="space-y-6 md:border-l md:border-slate-100 md:dark:border-slate-800 md:pl-12">
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <MdPerson size={16} className="text-emerald-500" /> Parents & Contacts
                        </h3>
                        
                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-2.5 border-b border-slate-50 dark:border-slate-800/40">
                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1"><MdFamilyRestroom size={12} /> {"Father's Name"}</span>
                                <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{student.fatherName || "—"}</span>
                            </div>
                            <div className="flex justify-between items-center py-2.5 border-b border-slate-50 dark:border-slate-800/40">
                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1"><MdFamilyRestroom size={12} /> {"Mother's Name"}</span>
                                <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{student.motherName || "—"}</span>
                            </div>
                            <div className="flex justify-between items-center py-2.5 border-b border-slate-50 dark:border-slate-800/40">
                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1"><MdPhone size={12} /> Contact Number</span>
                                <span className="font-extrabold text-indigo-600 dark:text-indigo-400 text-sm">{student.phone || "—"}</span>
                            </div>
                            <div className="flex flex-col py-2.5 gap-1.5">
                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1"><MdLocationOn size={12} /> Address details</span>
                                <span className="font-semibold text-slate-650 dark:text-slate-350 text-xs leading-relaxed">{student.address || "—"}</span>
                            </div>
                        </div>
                    </div>

                </div>

            </div>

            {/* CONFIRMATION POPUP */}
            {popup && (
                <Popup
                    open={true}
                    {...popup}
                    onClose={() => setPopup(null)}
                    onConfirm={confirmDelete}
                />
            )}
        </motion.div>
    );
}
