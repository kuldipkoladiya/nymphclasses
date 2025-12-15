"use client";

import { useEffect, useState } from "react";
import axios from "@/utils/axios";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function EditStudent({ params }) {
    const { id } = params;
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

    const token =
        typeof window !== "undefined"
            ? localStorage.getItem("token")
            : "";

    const authHeader = {
        headers: { Authorization: `Bearer ${token}` },
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    async function loadStudent() {
        try {
            const res = await axios.get(`/students/${id}`, authHeader);
            setForm(res.data);
        } catch (err) {
            console.log(err);
        }
    }

    useEffect(() => {
        loadStudent();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = new FormData();
            Object.keys(form).forEach((key) => data.append(key, form[key]));

            await axios.put(`/students/${id}`, data, authHeader);

            alert("Student updated successfully!");
            router.push(`/students/${id}`);
        } catch (err) {
            console.log(err);
            alert("Error updating student");
        }

        setLoading(false);
    };

    return (
        <div className="pt-24 max-w-3xl mx-auto text-white">
            <h1 className="text-3xl font-bold mb-6">Edit Student</h1>

            <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleSubmit}
                className="glass-light p-6 rounded-3xl grid grid-cols-1 md:grid-cols-2 gap-6"
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
                        <label className="mb-1 text-sm opacity-90">{field.label}</label>
                        <input
                            type="text"
                            name={field.name}
                            value={form[field.name]}
                            onChange={handleChange}
                            className="glass p-3 rounded-xl text-black bg-white/80"
                        />
                    </div>
                ))}

                <div className="md:col-span-2">
                    <label className="mb-1 text-sm opacity-90">Address</label>
                    <textarea
                        name="address"
                        value={form.address}
                        rows={3}
                        onChange={handleChange}
                        className="glass w-full p-3 rounded-xl text-black bg-white/80"
                    />
                </div>

                {/* Submit Button */}
                <div className="md:col-span-2 text-right">
                    <button
                        disabled={loading}
                        className="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl text-white font-bold shadow-lg"
                    >
                        {loading ? "Updating..." : "Save Changes"}
                    </button>
                </div>
            </motion.form>
        </div>
    );
}
