"use client";

import { useEffect, useState } from "react";
import axios from "@/utils/axios";
import Link from "next/link";
import {
    MdDelete,
    MdEdit,
    MdAdd,
    MdSearch,
} from "react-icons/md";
import Popup from "@/components/Popup";

export default function StudentsPage() {
    const [students, setStudents] = useState([]);
    const [search, setSearch] = useState("");
    const [filterStd, setFilterStd] = useState("");
    const [popup, setPopup] = useState(null);
    const [deleteId, setDeleteId] = useState(null);

    useEffect(() => {
        axios.get("/students").then((res) => {
            setStudents(res.data || []);
        });
    }, []);

    const filtered = students.filter((s) => {
        const matchStd = filterStd ? s.standard === filterStd : true;
        const matchSearch =
            s.name.toLowerCase().includes(search.toLowerCase()) ||
            s.rollNumber?.includes(search);
        return matchStd && matchSearch;
    });

    const openDeletePopup = (id) => {
        setDeleteId(id);
        setPopup({
            type: "confirm",
            title: "Delete Student",
            message: "Are you sure you want to delete this student?",
        });
    };

    const confirmDelete = async () => {
        await axios.delete(`/students/${deleteId}`);
        setStudents((prev) => prev.filter((s) => s._id !== deleteId));
        setPopup({
            type: "success",
            title: "Deleted",
            message: "Student deleted successfully",
        });
        setDeleteId(null);
    };

    return (
        <div className="space-y-6">
            {/* HEADER */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
                    Students
                </h1>

                <Link
                    href="/students/add"
                    className="
            inline-flex items-center gap-2
            px-4 py-2 rounded-lg
            bg-gradient-to-r from-indigo-600 to-blue-600
            text-white shadow hover:opacity-90
          "
                >
                    <MdAdd size={20} /> Add Student
                </Link>
            </div>

            {/* FILTERS */}
            <div className="
        bg-white dark:bg-slate-900
        border border-gray-200 dark:border-slate-700
        rounded-xl p-4
        flex flex-wrap gap-4
      ">
                {/* SEARCH */}
                <div className="
          flex items-center gap-2
          w-full md:w-1/2
          px-3 py-2 rounded-lg
          border border-gray-300 dark:border-slate-600
          bg-white dark:bg-slate-800
        ">
                    <MdSearch className="text-gray-400" size={20} />
                    <input
                        className="
              w-full bg-transparent outline-none
              text-gray-800 dark:text-gray-100
              placeholder-gray-400
            "
                        placeholder="Search name or roll number"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* STANDARD SELECT */}
                <select
                    className="
            px-3 py-2 rounded-lg
            border border-gray-300 dark:border-slate-600
            bg-white dark:bg-slate-800
            text-gray-800 dark:text-gray-100
            focus:outline-none focus:ring-2 focus:ring-indigo-500
          "
                    value={filterStd}
                    onChange={(e) => setFilterStd(e.target.value)}
                >
                    <option value="">All Standards</option>
                    {["1","2","3","4","5","6","7","8","9","10","11","12"].map((s) => (
                        <option key={s} value={s}>
                            Standard {s}
                        </option>
                    ))}
                </select>
            </div>

            {/* TABLE */}
            <div className="
        bg-white dark:bg-slate-900
        border border-gray-200 dark:border-slate-700
        rounded-xl overflow-x-auto
      ">
                <table className="w-full text-sm">
                    <thead className="bg-gray-100 dark:bg-slate-800">
                    <tr className="text-gray-600 dark:text-gray-300">
                        <th className="p-3 text-left">Name</th>
                        <th className="p-3 text-center">Roll</th>
                        <th className="p-3 text-center">Std</th>
                        <th className="p-3 text-center">Phone</th>
                        <th className="p-3 text-center">Actions</th>
                    </tr>
                    </thead>

                    <tbody>
                    {filtered.map((s) => (
                        <tr
                            key={s._id}
                            className="
                  border-t border-gray-200 dark:border-slate-700
                  hover:bg-gray-50 dark:hover:bg-slate-800
                "
                        >
                            <td className="p-3 text-gray-800 dark:text-gray-100">
                                {s.name}
                            </td>
                            <td className="p-3 text-gray-800 dark:text-gray-100">{s.rollNumber}</td>
                            <td className="p-3 text-gray-800 dark:text-gray-100">{s.standard}</td>
                            <td className="p-3 text-gray-800 dark:text-gray-100">{s.phone}</td>
                            <td className="p-3 text-gray-800 dark:text-gray-100">
                                <Link
                                    href={`/students/${s._id}`}
                                    className="
                      flex items-center gap-1
                      text-indigo-600 dark:text-indigo-400
                      hover:underline
                    "
                                >
                                    <MdEdit size={18} /> Edit
                                </Link>

                                <button
                                    onClick={() => openDeletePopup(s._id)}
                                    className="
                      flex items-center gap-1
                      text-red-500 hover:text-red-600
                    "
                                >
                                    <MdDelete size={18} /> Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>

                {filtered.length === 0 && (
                    <p className="text-center py-6 text-gray-500 dark:text-gray-400">
                        No students found
                    </p>
                )}
            </div>

            {/* POPUP */}
            {popup && (
                <Popup
                    open={true}
                    {...popup}
                    onClose={() => setPopup(null)}
                    onConfirm={confirmDelete}
                />
            )}
        </div>
    );
}
