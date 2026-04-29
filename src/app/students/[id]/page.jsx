"use client";

import { useEffect, useState } from "react";
import axios from "@/utils/axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { MdEdit, MdDelete, MdArrowBack, MdPerson, MdPhone, MdLocationOn, MdFamilyRestroom, MdClass, MdNumbers } from "react-icons/md";
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
            message: "This action is irreversible. All data associated with this student will be permanently deleted.",
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
            <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
                <div className="h-40 bg-gray-200 dark:bg-slate-800 rounded-3xl w-full"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="h-64 bg-gray-200 dark:bg-slate-800 rounded-3xl"></div>
                    <div className="h-64 bg-gray-200 dark:bg-slate-800 rounded-3xl"></div>
                </div>
            </div>
        );
    }

    if (!student) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <MdPerson size={64} className="text-gray-300 dark:text-gray-600 mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Profile Not Found</h2>
                <p className="text-gray-500 mt-2 mb-6">The student record you are looking for does not exist or was deleted.</p>
                <button
                    onClick={() => router.back()}
                    className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40 transition-all font-semibold"
                >
                    Go Back
                </button>
            </div>
        );
    }

    const initialLetter = student.name ? student.name.charAt(0).toUpperCase() : "?";

    const detailSections = [
        {
            title: "Academic Information",
            icon: MdClass,
            color: "text-indigo-500 flex items-center gap-2",
            fields: [
                { label: "Roll Number", value: student.rollNumber, icon: MdNumbers },
                { label: "Standard", value: `Std ${student.standard}`, icon: MdClass },
                { label: "Section", value: student.section || "N/A", icon: MdClass },
            ],
        },
        {
            title: "Personal Information",
            icon: MdPerson,
            color: "text-emerald-500 flex items-center gap-2",
            fields: [
                { label: "Father's Name", value: student.fatherName, icon: MdFamilyRestroom },
                { label: "Mother's Name", value: student.motherName, icon: MdFamilyRestroom },
                { label: "Contact No.", value: student.phone, icon: MdPhone },
                { label: "Address", value: student.address, icon: MdLocationOn },
            ],
        },
    ];

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-[1100px] mx-auto space-y-6"
        >
            {/* HEADER & PROFILE OVERVIEW */}
            <div className="glass-card relative overflow-hidden bg-gradient-to-br from-white to-gray-50 dark:from-[#131C31] dark:to-slate-900 border border-gray-100 dark:border-white/5">
                {/* Decorative Background Blur */}
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-500/10 dark:bg-indigo-500/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                
                <div className="p-6 md:p-8 relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
                    <div className="flex-shrink-0 relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full blur opacity-40 group-hover:opacity-60 transition-opacity duration-300"></div>
                        <div className="h-32 w-32 md:h-40 md:w-40 relative bg-gradient-to-br from-white to-indigo-50 dark:from-slate-800 dark:to-indigo-900/40 rounded-full flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-xl z-10">
                            <span className="text-5xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-br from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                                {initialLetter}
                            </span>
                        </div>
                    </div>
                    
                    <div className="flex-1 text-center md:text-left flex flex-col justify-center h-full pt-2">
                        <div className="inline-flex items-center gap-2 mb-2 font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1 rounded-full text-sm">
                            <MdPerson size={16} /> Student Profile
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
                            {student.name}
                        </h1>
                        <p className="text-lg text-gray-500 dark:text-gray-400 flex items-center justify-center md:justify-start gap-2">
                            <MdNumbers className="text-gray-400" />
                            Roll No: <span className="font-semibold text-gray-700 dark:text-gray-200">{student.rollNumber}</span> • Standard <span className="font-semibold text-gray-700 dark:text-gray-200">{student.standard}</span>
                        </p>
                        
                        <div className="flex items-center justify-center md:justify-start gap-3 mt-6">
                            <button
                                onClick={() => router.back()}
                                className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 font-semibold text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all shadow-sm flex items-center gap-2"
                            >
                                <MdArrowBack size={18} /> Back
                            </button>
                            <Link
                                href={`/students/${id}/edit`}
                                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40 transition-all flex items-center gap-2"
                            >
                                <MdEdit size={18} /> Edit Profile
                            </Link>
                            <button
                                onClick={openDeletePopup}
                                className="px-5 py-2.5 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 font-semibold text-sm hover:bg-red-100 dark:hover:bg-red-500/20 transition-all flex items-center gap-2 border border-transparent dark:border-red-500/20"
                            >
                                <MdDelete size={18} /> Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* DETAILS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {detailSections.map((section, idx) => (
                    <div key={idx} className="glass-card p-6 md:p-8">
                        <h2 className={`text-lg font-bold mb-6 tracking-tight ${section.color}`}>
                            <section.icon size={22} />
                            {section.title}
                        </h2>
                        
                        <div className="space-y-4">
                            {section.fields.map((field, fIdx) => (
                                <div key={fIdx} className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 dark:border-white/5 pb-4 last:border-0 last:pb-0">
                                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm font-medium mb-1 sm:mb-0">
                                        <field.icon size={16} />
                                        {field.label}
                                    </div>
                                    <div className="text-gray-800 dark:text-gray-100 font-semibold text-right max-w-xs break-words">
                                        {field.value || "-"}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* POPUP CONFIRMATION */}
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
