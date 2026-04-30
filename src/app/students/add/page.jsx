"use client";

import { useState } from "react";
import axios from "@/utils/axios";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { MdArrowBack, MdPerson, MdPhone, MdLocationOn, MdFamilyRestroom, MdClass, MdNumbers, MdCheckCircle } from "react-icons/md";
import toast from "react-hot-toast";

export default function AddStudent() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

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

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = new FormData();
            Object.keys(form).forEach((key) => data.append(key, form[key]));

            await axios.post("/students", data);
            toast.success("Student added successfully!");
            setTimeout(() => router.push("/students"), 1200);
        } catch (err) {
            toast.error("Failed to add student. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const formFields = [
        { name: "name", label: "Full Name", icon: MdPerson, placeholder: "John Doe", type: "text" },
        { name: "rollNumber", label: "Roll Number", icon: MdNumbers, placeholder: "101", type: "text" },
        { name: "standard", label: "Standard/Class", icon: MdClass, placeholder: "10", type: "text" },
        { name: "section", label: "Section", icon: MdClass, placeholder: "A", type: "text" },
        { name: "fatherName", label: "Father's Name", icon: MdFamilyRestroom, placeholder: "Richard Doe", type: "text" },
        { name: "motherName", label: "Mother's Name", icon: MdFamilyRestroom, placeholder: "Jane Doe", type: "text" },
        { name: "phone", label: "Contact Number", icon: MdPhone, placeholder: "+91 9876543210", type: "text" },
    ];

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
                        Enroll New Student
                    </h1>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-0.5">
                        Fill in the academic and personal details to create a new profile.
                    </p>
                </div>
            </div>

            {/* FORM CARD */}
            <div className="glass-card p-6 sm:p-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        {formFields.map((field) => (
                            <div key={field.name} className="relative group">
                                <label className="label-premium ml-1">
                                    {field.label}
                                </label>
                                <div className="relative">
                                    <field.icon className="input-icon top-1/2 -translate-y-1/2" size={18} />
                                    <input
                                        type={field.type}
                                        name={field.name}
                                        value={form[field.name]}
                                        onChange={handleChange}
                                        required
                                        placeholder={field.placeholder}
                                        className="input-premium input-with-icon"
                                    />
                                </div>
                            </div>
                        ))}

                        {/* ADDRESS */}
                        <div className="md:col-span-2 relative group">
                            <label className="label-premium ml-1">
                                Current Address
                            </label>
                            <div className="relative">
                                <MdLocationOn className="input-icon top-5" size={18} />
                                <textarea
                                    name="address"
                                    rows={3}
                                    value={form.address}
                                    onChange={handleChange}
                                    placeholder="123 Education Street, Learning City..."
                                    className="input-premium input-with-icon resize-y min-h-[100px]"
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
                                bg-gradient-to-r from-indigo-600 to-purple-600 text-white
                                shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40 hover:-translate-y-0.5
                                transition-all disabled:opacity-70 disabled:hover:translate-y-0 disabled:cursor-not-allowed
                            "
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <MdCheckCircle size={18} /> Confirm Enrollment
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </motion.div>
    );
}
