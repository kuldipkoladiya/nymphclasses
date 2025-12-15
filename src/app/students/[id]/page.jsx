"use client";

import { useEffect, useState } from "react";
import axios from "@/utils/axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MdEdit, MdDelete } from "react-icons/md";

export default function StudentDetails({ params }) {
    const { id } = params;
    const router = useRouter();

    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);

    const token =
        typeof window !== "undefined"
            ? localStorage.getItem("token")
            : "";

    const authHeader = {
        headers: { Authorization: `Bearer ${token}` },
    };

    async function loadData() {
        try {
            const res = await axios.get(`/students/${id}`, authHeader);
            setStudent(res.data);
        } catch (err) {
            console.log("Fetch error:", err);
        }
        setLoading(false);
    }

    async function deleteStudent() {
        if (!confirm("Are you sure you want to delete?")) return;

        try {
            await axios.delete(`/students/${id}`, authHeader);
            alert("Student deleted successfully");
            router.push("/students");
        } catch (err) {
            console.log(err);
            alert("Error deleting student");
        }
    }

    useEffect(() => {
        loadData();
    }, []);

    if (loading) return <p className="pt-24 text-white">Loading...</p>;

    if (!student)
        return <p className="pt-24 text-red-400">No student found</p>;

    return (
        <div className="pt-24 max-w-3xl mx-auto text-white">
            <h1 className="text-3xl font-bold mb-6">Student Details</h1>

            <div className="glass-light p-6 rounded-3xl space-y-4">

                {/* Displaying All Student Fields */}
                {[
                    ["Name", student.name],
                    ["Roll Number", student.rollNumber],
                    ["Standard", student.standard],
                    ["Section", student.section],
                    ["Father Name", student.fatherName],
                    ["Mother Name", student.motherName],
                    ["Phone", student.phone],
                    ["Address", student.address],
                ].map(([label, value], index) => (
                    <div key={index} className="flex justify-between border-b border-white/20 pb-3">
                        <span className="opacity-80">{label}</span>
                        <span className="font-semibold text-yellow-300">{value}</span>
                    </div>
                ))}

                {/* Buttons */}
                <div className="flex justify-end gap-4 pt-4">
                    <Link
                        href={`/students/${id}/edit`}
                        className="bg-purple-600 px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg"
                    >
                        <MdEdit /> Edit
                    </Link>

                    <button
                        onClick={deleteStudent}
                        className="bg-red-600 px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg"
                    >
                        <MdDelete /> Delete
                    </button>
                </div>
            </div>
        </div>
    );
}
