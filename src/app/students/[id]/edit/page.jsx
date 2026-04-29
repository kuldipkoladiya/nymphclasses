"use client";

import { useEffect, useState } from "react";
import axios from "@/utils/axios";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { MdArrowBack, MdPerson, MdPhone, MdLocationOn, MdFamilyRestroom, MdClass, MdNumbers, MdSave } from "react-icons/md";
import toast from "react-hot-toast";

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
            const data = new FormData();
            Object.keys(form).forEach((key) => data.append(key, form[key]));

            await axios.put(`/students/${id}`, data, authHeader);
            toast.success("Student updated successfully!");
            setTimeout(() => router.push(`/students/${id}`), 1200);
        } catch (err) {
            toast.error("Error updating student. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const formFields = [
        { name: "name", label: "Full Name", icon: MdPerson, type: "text" },
        { name: "rollNumber", label: "Roll Number", icon: MdNumbers, type: "text" },
        { name: "standard", label: "Standard/Class", icon: MdClass, type: "text" },
        { name: "section", label: "Section", icon: MdClass, type: "text" },
        { name: "fatherName", label: "Father's Name", icon: MdFamilyRestroom, type: "text" },
        { name: "motherName", label: "Mother's Name", icon: MdFamilyRestroom, type: "text" },
        { name: "phone", label: "Contact Number", icon: MdPhone, type: "text" },
    ];

    if (fetching) {
        return (
            <div className="max-w-[1000px] mx-auto space-y-6 animate-pulse">
                <div className="h-24 bg-gray-200 dark:bg-slate-800 rounded-3xl w-full"></div>
                <div className="h-[500px] bg-gray-200 dark:bg-slate-800 rounded-3xl w-full mt-6"></div>
            </div>
        );
    }

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-[1000px] mx-auto space-y-6"
        >
            {/* HEADER */}
            <div className="flex items-center gap-4 bg-white dark:bg-[#131C31] p-6 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm">
                <button
                    onClick={() => router.back()}
                    className="p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all shadow-sm"
                    title="Go Back"
                >
                    <MdArrowBack size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
                        Update Student Profile
                    </h1>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-0.5">
                        Modify existing records and save changes securely.
                    </p>
                </div>
            </div>

            {/* FORM CARD */}
            <div className="glass-card p-6 sm:p-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        {formFields.map((field) => (
                            <div key={field.name} className="flex flex-col space-y-1.5 relative group">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                    {field.label}
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                                        <field.icon size={18} />
                                    </div>
                                    <input
                                        type={field.type}
                                        name={field.name}
                                        value={form[field.name]}
                                        onChange={handleChange}
                                        required
                                        className="
                                            w-full pl-11 pr-4 py-3 rounded-xl
                                            bg-gray-50/50 dark:bg-slate-800/50
                                            border border-gray-200 dark:border-slate-700/60
                                            text-gray-800 dark:text-gray-100 placeholder-gray-400
                                            focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50
                                            transition-all shadow-sm
                                        "
                                    />
                                </div>
                            </div>
                        ))}

                        {/* ADDRESS */}
                        <div className="md:col-span-2 flex flex-col space-y-1.5 relative group">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                Current Address
                            </label>
                            <div className="relative border border-gray-200 dark:border-slate-700/60 rounded-xl bg-gray-50/50 dark:bg-slate-800/50 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500/50 transition-all">
                                <div className="absolute top-3.5 left-0 pl-4 flex items-start pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                                    <MdLocationOn size={18} />
                                </div>
                                <textarea
                                    name="address"
                                    rows={3}
                                    value={form.address}
                                    onChange={handleChange}
                                    className="
                                        w-full pl-11 pr-4 py-3 rounded-xl bg-transparent
                                        text-gray-800 dark:text-gray-100 placeholder-gray-400
                                        focus:outline-none resize-y min-h-[100px]
                                    "
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100 dark:border-slate-800/80 flex flex-col-reverse sm:flex-row justify-end gap-4">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="
                                px-6 py-3 rounded-xl font-semibold text-sm
                                bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700
                                text-gray-700 dark:text-gray-300
                                hover:bg-gray-50 dark:hover:bg-slate-700/80 transition-all shadow-sm
                            "
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="
                                px-8 py-3 rounded-xl font-bold text-sm inline-flex items-center justify-center gap-2
                                bg-gradient-to-r from-purple-600 to-indigo-600 text-white
                                shadow-lg shadow-purple-500/30 hover:shadow-purple-500/40 hover:-translate-y-0.5
                                transition-all disabled:opacity-70 disabled:hover:translate-y-0 disabled:cursor-not-allowed
                            "
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <MdSave size={18} /> Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </motion.div>
    );
}
