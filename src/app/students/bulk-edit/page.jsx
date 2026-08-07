"use client";

import { useState, useEffect } from "react";
import axios from "@/utils/axios";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { MdArrowBack, MdSave, MdPeople, MdSchool, MdFilterList, MdWarning, MdPhone, MdPerson, MdNumbers } from "react-icons/md";
import toast from "react-hot-toast";
import { STANDARDS } from "@/utils/standards";

export default function BulkEditStudentsPage() {
    const router = useRouter();
    const [selectedStd, setSelectedStd] = useState("");
    const [selectedSection, setSelectedSection] = useState("");
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    
    // Maintain a local copy of edited fields
    const [editData, setEditData] = useState({});

    // Fetch students when standard or section changes
    useEffect(() => {
        if (!selectedStd) {
            setStudents([]);
            setEditData({});
            return;
        }

        async function fetchStudents() {
            setLoading(true);
            try {
                // Fetch non-paginated list of students in the class standard
                const res = await axios.get(
                    `/students?standard=${selectedStd}&section=${selectedSection}`
                );
                const list = res.data || [];
                
                // Sort students numerically by roll number
                list.sort((a, b) => {
                    const rollA = parseInt(a.rollNumber) || 0;
                    const rollB = parseInt(b.rollNumber) || 0;
                    return rollA - rollB;
                });

                setStudents(list);
                
                // Initialize local edit state
                const initialEditData = {};
                list.forEach((s) => {
                    initialEditData[s._id] = {
                        name: s.name || "",
                        rollNumber: s.rollNumber || "",
                        phone: s.phone || "",
                        secondPhone: s.secondPhone || "",
                        fatherName: s.fatherName || "",
                        motherName: s.motherName || "",
                    };
                });
                setEditData(initialEditData);
            } catch (err) {
                toast.error("Failed to load students roster.");
            } finally {
                setLoading(false);
            }
        }
        fetchStudents();
    }, [selectedStd, selectedSection]);

    const handleInputChange = (studentId, field, value) => {
        setEditData((prev) => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                [field]: value,
            },
        }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        
        // Prepare list of payload objects
        const updatedStudents = Object.keys(editData).map((id) => ({
            _id: id,
            ...editData[id],
        }));

        if (updatedStudents.length === 0) {
            toast.error("No student data to save.");
            return;
        }

        // Quick validation for required fields locally
        for (const item of updatedStudents) {
            if (!item.name.trim()) {
                toast.error(`Student name cannot be empty.`);
                return;
            }
            if (!item.rollNumber.trim()) {
                toast.error(`Roll number for student "${item.name}" cannot be empty.`);
                return;
            }
            if (!item.phone.trim()) {
                toast.error(`Primary phone number for student "${item.name}" is required.`);
                return;
            }
            if (item.phone && !/^[0-9]{10}$/.test(item.phone)) {
                toast.error(`Primary contact for "${item.name}" must be exactly 10 digits.`);
                return;
            }
            if (item.secondPhone && !/^[0-9]{10}$/.test(item.secondPhone)) {
                toast.error(`Secondary contact for "${item.name}" must be exactly 10 digits.`);
                return;
            }
        }

        setSaving(true);
        try {
            const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
            const authHeader = { headers: { Authorization: `Bearer ${token}` } };
            
            await axios.put("/students/bulk-update", { students: updatedStudents }, authHeader);
            toast.success("All student records updated successfully!");
            
            // Re-fetch current data to refresh table
            const res = await axios.get(
                `/students?standard=${selectedStd}&section=${selectedSection}`
            );
            const list = res.data || [];
            list.sort((a, b) => (parseInt(a.rollNumber) || 0) - (parseInt(b.rollNumber) || 0));
            setStudents(list);
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Failed to update students.";
            toast.error(errorMsg);
        } finally {
            setSaving(false);
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="max-w-7xl mx-auto space-y-6 px-4 sm:px-6 pb-20"
        >
            {/* HEADER */}
            <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2.5 rounded-xl border border-slate-205 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600 transition-all shadow-sm"
                        title="Go Back"
                    >
                        <MdArrowBack size={20} />
                    </button>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                            Bulk Edit Student Data
                        </h1>
                        <p className="text-slate-400 dark:text-slate-505 font-bold text-[9px] uppercase tracking-widest mt-2">
                            Update details of an entire class on a single page
                        </p>
                    </div>
                </div>
                {students.length > 0 && (
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs uppercase tracking-widest shadow-md rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 disabled:opacity-50"
                    >
                        {saving ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <MdSave size={18} />
                        )}
                        Save Roster
                    </button>
                )}
            </div>

            {/* FILTERS CARD */}
            <div className="glass-card p-6 bg-white dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 shadow-sm rounded-3xl">
                <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                    <MdSchool size={16} /> Select Class & Section
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="label-premium">Standard / Grade Level</label>
                        <select
                            className="input-premium cursor-pointer text-slate-805 dark:text-slate-200"
                            value={selectedStd}
                            onChange={(e) => setSelectedStd(e.target.value)}
                        >
                            <option value="">Select Standard</option>
                            {STANDARDS.filter(s => s !== "Graduated").map(s => (
                                <option key={s} value={s}>Standard {s}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="label-premium">Section / Batch</label>
                        <select
                            className="input-premium cursor-pointer text-slate-805 dark:text-slate-200"
                            value={selectedSection}
                            onChange={(e) => setSelectedSection(e.target.value)}
                        >
                            <option value="">All Sections</option>
                            <option value="Morning">Morning</option>
                            <option value="Afternoon">Afternoon</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* EDITABLE TABLE */}
            {selectedStd && (
                <div className="glass-card overflow-hidden bg-white dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl shadow-sm">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/55 dark:bg-white/[0.01]">
                        <div>
                            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                                <MdPeople className="text-indigo-600" /> Student Roster Grid
                            </h3>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">
                                Direct input editing. Change values in columns and click &apos;Save Roster&apos;.
                            </p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="p-20 text-center flex flex-col items-center justify-center">
                            <div className="w-10 h-10 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin mb-4" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading students...</p>
                        </div>
                    ) : students.length === 0 ? (
                        <div className="p-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                            No students registered in Standard {selectedStd} {selectedSection ? `(${selectedSection})` : ""}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left table-auto">
                                <thead>
                                    <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 w-[100px]">Roll No</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 min-w-[200px]">Student Name</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 min-w-[150px]">Primary Contact</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 min-w-[150px]">Secondary Contact</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 min-w-[150px]">Father&apos;s Name</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 min-w-[150px]">Mother&apos;s Name</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                    {students.map((student) => {
                                        const values = editData[student._id] || {};
                                        return (
                                            <tr key={student._id} className="hover:bg-slate-50/30 dark:hover:bg-white/[0.01] transition-colors">
                                                {/* Roll No */}
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="text"
                                                        value={values.rollNumber || ""}
                                                        onChange={(e) => handleInputChange(student._id, "rollNumber", e.target.value)}
                                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-xs font-bold text-slate-800 dark:text-slate-200 text-center"
                                                        placeholder="Roll No"
                                                        required
                                                    />
                                                </td>

                                                {/* Name */}
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="text"
                                                        value={values.name || ""}
                                                        onChange={(e) => handleInputChange(student._id, "name", e.target.value)}
                                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-xs font-bold text-slate-800 dark:text-slate-200"
                                                        placeholder="Full Name"
                                                        required
                                                    />
                                                </td>

                                                {/* Primary Phone */}
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="text"
                                                        value={values.phone || ""}
                                                        onChange={(e) => handleInputChange(student._id, "phone", e.target.value)}
                                                        maxLength={10}
                                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-xs font-semibold text-slate-800 dark:text-slate-200"
                                                        placeholder="Primary Phone"
                                                        required
                                                    />
                                                </td>

                                                {/* Secondary Phone */}
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="text"
                                                        value={values.secondPhone || ""}
                                                        onChange={(e) => handleInputChange(student._id, "secondPhone", e.target.value)}
                                                        maxLength={10}
                                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-xs font-semibold text-slate-800 dark:text-slate-200"
                                                        placeholder="Second Phone (Optional)"
                                                    />
                                                </td>

                                                {/* Father's Name */}
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="text"
                                                        value={values.fatherName || ""}
                                                        onChange={(e) => handleInputChange(student._id, "fatherName", e.target.value)}
                                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-xs font-semibold text-slate-800 dark:text-slate-200"
                                                        placeholder="Father's Name"
                                                    />
                                                </td>

                                                {/* Mother's Name */}
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="text"
                                                        value={values.motherName || ""}
                                                        onChange={(e) => handleInputChange(student._id, "motherName", e.target.value)}
                                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-xs font-semibold text-slate-800 dark:text-slate-200"
                                                        placeholder="Mother's Name"
                                                    />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </motion.div>
    );
}
