"use client";

import { useState } from "react";
import axios from "@/utils/axios";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Popup from "@/components/Popup";
import { MdArrowBack } from "react-icons/md";

export default function AddStudent() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [popup, setPopup] = useState(null);

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

            setPopup({
                type: "success",
                title: "Student Added",
                message: "Student has been added successfully",
            });

            setTimeout(() => router.push("/students"), 1200);
        } catch (err) {
            setPopup({
                type: "error",
                title: "Error",
                message: "Failed to add student",
            });
        }

        setLoading(false);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* HEADER */}
            <div className="flex items-center gap-3">
                <button
                    onClick={() => router.back()}
                    className="
            flex items-center gap-1
            px-3 py-2 rounded-lg
            border border-gray-300 dark:border-slate-700
            text-gray-700 dark:text-gray-300
            hover:bg-gray-100 dark:hover:bg-slate-800
            transition
          "
                >
                    <MdArrowBack size={18} /> Back
                </button>

                <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
                    Add Student
                </h1>
            </div>

            {/* FORM CARD */}
            <motion.form
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleSubmit}
                className="
          bg-white dark:bg-slate-900
          border border-gray-200 dark:border-slate-700
          rounded-2xl p-6
          grid grid-cols-1 md:grid-cols-2 gap-5
        "
            >
                {[
                    { name: "name", label: "Student Name" },
                    { name: "rollNumber", label: "Roll Number" },
                    { name: "standard", label: "Standard" },
                    { name: "section", label: "Section" },
                    { name: "fatherName", label: "Father Name" },
                    { name: "motherName", label: "Mother Name" },
                    { name: "phone", label: "Phone Number" },
                ].map((field) => (
                    <div key={field.name} className="flex flex-col">
                        <label className="text-sm mb-1 text-gray-600 dark:text-gray-400">
                            {field.label}
                        </label>
                        <input
                            type="text"
                            name={field.name}
                            value={form[field.name]}
                            onChange={handleChange}
                            required
                            className="
                px-3 py-2 rounded-lg
                bg-white dark:bg-slate-800
                border border-gray-300 dark:border-slate-600
                text-gray-800 dark:text-gray-100
                focus:outline-none focus:ring-2 focus:ring-indigo-500
              "
                        />
                    </div>
                ))}

                {/* ADDRESS */}
                <div className="md:col-span-2">
                    <label className="text-sm mb-1 text-gray-600 dark:text-gray-400">
                        Address
                    </label>
                    <textarea
                        name="address"
                        rows={3}
                        value={form.address}
                        onChange={handleChange}
                        className="
              w-full px-3 py-2 rounded-lg
              bg-white dark:bg-slate-800
              border border-gray-300 dark:border-slate-600
              text-gray-800 dark:text-gray-100
              focus:outline-none focus:ring-2 focus:ring-indigo-500
            "
                    />
                </div>

                {/* ACTIONS */}
                <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="
              px-5 py-2 rounded-lg
              border border-gray-300 dark:border-slate-700
              text-gray-700 dark:text-gray-300
              hover:bg-gray-100 dark:hover:bg-slate-800
            "
                    >
                        Cancel
                    </button>

                    <button
                        disabled={loading}
                        className="
              px-6 py-2 rounded-lg
              bg-gradient-to-r from-indigo-600 to-blue-600
              text-white font-medium
              shadow hover:opacity-90
              disabled:opacity-60
            "
                    >
                        {loading ? "Saving..." : "Save Student"}
                    </button>
                </div>
            </motion.form>

            {/* POPUP */}
            {popup && (
                <Popup
                    open={true}
                    {...popup}
                    onClose={() => setPopup(null)}
                />
            )}
        </div>
    );
}
