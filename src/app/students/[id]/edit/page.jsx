"use client";

import { useEffect, useState } from "react";
import axios from "@/utils/axios";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { MdArrowBack, MdPerson, MdPhone, MdLocationOn, MdFamilyRestroom, MdClass, MdNumbers, MdSave } from "react-icons/md";
import toast from "react-hot-toast";
import { STANDARDS } from "@/utils/standards";

export default function EditStudent({ params }) {
    const { id } = params;
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const [form, setForm] = useState({
        name: "",
        rollNumber: "",
        standard: "",
        section: "",
        fatherName: "",
        motherName: "",
        phone: "",
        address: "",
    });

    useEffect(() => {
        async function loadStudent() {
            const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
            const authHeader = { headers: { Authorization: `Bearer ${token}` } };
            try {
                const res = await axios.get(`/students/${id}`, authHeader);
                setForm(res.data);
            } catch (err) {
                toast.error("Failed to load student details.");
            } finally {
                setFetching(false);
            }
        }
        loadStudent();
    }, [id]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
        const authHeader = { headers: { Authorization: `Bearer ${token}` } };

        try {
            await axios.put(`/students/${id}`, form, authHeader);
            toast.success("Student profile updated successfully!");
            setTimeout(() => router.push(`/students/${id}`), 1200);
        } catch (err) {
            toast.error("Error updating student. Please verify parameters.");
        } finally {
            setLoading(false);
        }
    };

    const formFields = [
        { name: "name", label: "Full Name", icon: MdPerson, type: "text", placeholder: "e.g. Rahul Sharma", required: true },
        { name: "rollNumber", label: "Roll Number", icon: MdNumbers, type: "text", placeholder: "e.g. 101", required: true },
        { name: "standard", label: "Standard/Class", icon: MdClass, type: "text", placeholder: "e.g. 10", required: true },
        { name: "section", label: "Section", icon: MdClass, type: "text", placeholder: "e.g. A", required: true },
        { name: "fatherName", label: "Father's Name", icon: MdFamilyRestroom, type: "text", placeholder: "e.g. Amit Sharma" },
        { name: "motherName", label: "Mother's Name", icon: MdFamilyRestroom, type: "text", placeholder: "e.g. Seema Sharma" },
        { name: "phone", label: "Parent Contact Number", icon: MdPhone, type: "text", placeholder: "e.g. 9876543210", required: true, pattern: "[0-9]{10}", maxLength: 10 },
    ];

    if (fetching) {
        return (
            <div className="max-w-6xl mx-auto space-y-6 animate-pulse px-4 sm:px-6">
                <div className="h-24 bg-gray-200 dark:bg-slate-800 rounded-3xl w-full"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="h-64 bg-gray-200 dark:bg-slate-800 rounded-3xl md:col-span-1"></div>
                    <div className="h-[400px] bg-gray-200 dark:bg-slate-800 rounded-3xl md:col-span-2"></div>
                </div>
            </div>
        );
    }

    const initialLetter = form.name ? form.name.charAt(0).toUpperCase() : "?";

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
            className="max-w-6xl mx-auto space-y-6 px-4 sm:px-6"
        >
            {/* HEADER */}
            <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm">
                <button
                    onClick={() => router.back()}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-850 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600 transition-all shadow-sm"
                    title="Go Back"
                >
                    <MdArrowBack size={20} />
                </button>
                <div>
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                        Update Student Profile
                    </h1>
                    <p className="text-slate-400 dark:text-slate-500 font-bold text-[9px] uppercase tracking-widest mt-2">
                        Modify existing credentials and parental contact entries
                    </p>
                </div>
            </div>

            {/* SPLIT GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* LEFT PROFILE PREVIEW */}
                <div className="md:col-span-1 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 p-6 flex flex-col items-center text-center shadow-sm relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
                    
                    <div className="relative mb-6">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full blur opacity-25"></div>
                        <div className="h-28 w-28 relative bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-md z-10">
                            <span className="text-4xl font-black bg-gradient-to-br from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                                {initialLetter}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <h2 className="text-lg font-black text-slate-950 dark:text-white tracking-tight truncate max-w-full">
                            {form.name || "Student Name"}
                        </h2>
                        <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Active Preview</p>
                    </div>

                    <div className="w-full border-t border-slate-100 dark:border-slate-800 my-6" />

                    <div className="w-full space-y-4 text-left">
                        <div className="flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/60">
                            <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                                <MdNumbers size={14} /> Roll Number
                            </span>
                            <span className="font-extrabold text-slate-800 dark:text-slate-200 text-xs">
                                {form.rollNumber || "—"}
                            </span>
                        </div>

                        <div className="flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/60">
                            <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                                <MdClass size={14} /> Standard
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-lg border font-extrabold text-[9px] uppercase tracking-wider ${getStandardBadgeStyle(form.standard)}`}>
                                Std {form.standard || "—"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* RIGHT EDIT FORM CARD */}
                <div className="md:col-span-2 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 p-6 md:p-8 shadow-sm">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                            {formFields.map((field) => (
                                <div key={field.name} className="flex flex-col space-y-1 relative group">
                                    <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                                        <field.icon size={12} className="text-slate-400 group-focus-within:text-indigo-600 transition-colors" /> {field.label}
                                    </label>
                                    {field.name === "standard" ? (
                                        <select
                                            name="standard"
                                            value={form.standard}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-indigo-650/5 focus:border-indigo-600/45 transition-all outline-none font-medium text-slate-900 dark:text-white placeholder:text-slate-400 text-sm appearance-none cursor-pointer"
                                        >
                                            <option value="">Select Standard</option>
                                            {STANDARDS.filter(s => s !== "Graduated").map(s => (
                                                <option key={s} value={s}>
                                                    {isNaN(Number(s)) ? s : `Standard ${s}`}
                                                </option>
                                            ))}
                                        </select>
                                    ) : field.name === "section" ? (
                                        <select
                                            name="section"
                                            value={form.section}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-indigo-650/5 focus:border-indigo-600/45 transition-all outline-none font-medium text-slate-900 dark:text-white placeholder:text-slate-400 text-sm appearance-none cursor-pointer"
                                        >
                                            <option value="">Select Section</option>
                                            <option value="Morning">Morning</option>
                                            <option value="Afternoon">Afternoon</option>
                                        </select>
                                    ) : (
                                        <input
                                            type={field.type}
                                            name={field.name}
                                            value={form[field.name]}
                                            onChange={handleChange}
                                            placeholder={field.placeholder}
                                            required={field.required}
                                            pattern={field.pattern}
                                            maxLength={field.maxLength}
                                            className="w-full px-4 py-3 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-indigo-650/5 focus:border-indigo-600/45 transition-all outline-none font-medium text-slate-900 dark:text-white placeholder:text-slate-400 text-sm"
                                        />
                                    )}
                                </div>
                            ))}

                            {/* ADDRESS (Spans full) */}
                            <div className="sm:col-span-2 flex flex-col space-y-1 relative group">
                                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                                    <MdLocationOn size={12} className="text-slate-400 group-focus-within:text-indigo-600 transition-colors" /> Address Details
                                </label>
                                <textarea
                                    name="address"
                                    rows={3}
                                    value={form.address}
                                    onChange={handleChange}
                                    placeholder="Enter current address..."
                                    className="w-full px-4 py-3 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-indigo-650/5 focus:border-indigo-600/45 transition-all outline-none font-medium text-slate-900 dark:text-white placeholder:text-slate-400 text-sm resize-none min-h-[90px]"
                                />
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-100 dark:border-slate-800/80 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-extrabold text-xs uppercase tracking-wider hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs uppercase tracking-widest shadow-md shadow-indigo-600/15 hover:shadow-indigo-600/25 transition-transform hover:scale-[1.02] active:scale-[0.98] inline-flex items-center gap-1.5 disabled:opacity-50"
                            >
                                {loading ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <MdSave size={16} /> Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

            </div>
        </motion.div>
    );
}
