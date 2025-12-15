"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Popup from "@/components/Popup";

/* =============================
   API INSTANCE (TOKEN SUPPORT)
============================= */
const API = axios.create({
    baseURL: "nymph-be.vercel.app/api",
});

API.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default function CreateResultPage() {
    const router = useRouter();

    const [standard, setStandard] = useState("");
    const [examName, setExamName] = useState("");
    const [examDate, setExamDate] = useState("");
    const [totalMaximum, setTotalMaximum] = useState(100);

    const [students, setStudents] = useState([]);
    const [selectedSubjects, setSelectedSubjects] = useState([]);
    const [marks, setMarks] = useState({});

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [popup, setPopup] = useState(null);

    const SUBJECT_OPTIONS = [
        "Maths",
        "Science",
        "English",
        "Gujarati",
        "Hindi",
        "Social Science",
    ];

    /* =============================
       Sync marks when subjects change
    ============================= */
    useEffect(() => {
        if (!students.length) return;

        setMarks((prev) => {
            const updated = {};
            students.forEach((stu) => {
                updated[stu._id] = selectedSubjects.map((sub) => {
                    const old = prev[stu._id]?.find((m) => m.name === sub);
                    return old
                        ? { ...old, totalMarks: totalMaximum }
                        : { name: sub, marksObtained: "", totalMarks: totalMaximum };
                });
            });
            return updated;
        });
    }, [selectedSubjects, students, totalMaximum]);

    /* =============================
       Load students
    ============================= */
    const loadStudents = async () => {
        if (!standard || !selectedSubjects.length) {
            setPopup({
                type: "error",
                title: "Missing Data",
                message: "Please enter standard and select subjects",
            });
            return;
        }

        setLoading(true);
        try {
            const res = await API.get(`/students/by-standard/${standard}`);
            const list = res.data?.students || res.data || [];

            if (!list.length) {
                setPopup({
                    type: "info",
                    title: "No Students",
                    message: "No students found for this standard",
                });
            }

            setStudents(list);

            const init = {};
            list.forEach((stu) => {
                init[stu._id] = selectedSubjects.map((s) => ({
                    name: s,
                    marksObtained: "",
                    totalMarks: totalMaximum,
                }));
            });
            setMarks(init);
        } catch {
            setPopup({
                type: "error",
                title: "Error",
                message: "Failed to load students",
            });
        }
        setLoading(false);
    };

    /* =============================
       Save results
    ============================= */
    const saveAllResults = async () => {
        if (!examName || !examDate) {
            setPopup({
                type: "error",
                title: "Missing Details",
                message: "Please fill exam name and date",
            });
            return;
        }

        setSaving(true);
        try {
            for (const stu of students) {
                await API.post("/results", {
                    studentId: stu._id,
                    examName,
                    standard,
                    examDate,
                    subjects: marks[stu._id],
                });
            }

            setPopup({
                type: "success",
                title: "Success",
                message: "Results saved successfully",
            });

            setTimeout(() => router.push("/results/view"), 1200);
        } catch {
            setPopup({
                type: "error",
                title: "Error",
                message: "Failed to save results",
            });
        }
        setSaving(false);
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">

            {/* HEADER */}
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
                        Create Result
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Standard wise result entry
                    </p>
                </div>

                <button
                    onClick={() => router.push("/results/view")}
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800"
                >
                    View Results
                </button>
            </div>

            {/* FORM */}
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl p-6 space-y-6">

                {/* BASIC INFO */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Input label="Standard" value={standard} onChange={setStandard} />
                    <Input label="Exam Name" value={examName} onChange={setExamName} />
                    <Input type="date" label="Exam Date" value={examDate} onChange={setExamDate} />
                    <Input type="number" label="Total Marks" value={totalMaximum} onChange={(v) => setTotalMaximum(+v)} />
                </div>

                {/* SUBJECTS */}
                <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                        Subjects
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {SUBJECT_OPTIONS.map((s) => (
                            <button
                                key={s}
                                onClick={() =>
                                    setSelectedSubjects((p) =>
                                        p.includes(s) ? p.filter((x) => x !== s) : [...p, s]
                                    )
                                }
                                className={`px-3 py-1 rounded-full text-sm border ${
                                    selectedSubjects.includes(s)
                                        ? "bg-indigo-600 text-white border-indigo-600"
                                        : "bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-slate-600"
                                }`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    onClick={loadStudents}
                    className="px-6 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-medium hover:opacity-90"
                >
                    Load Students
                </button>

                {loading && <p className="text-sm text-gray-500">Loading students...</p>}

                {/* STUDENT TABLE */}
                {students.length > 0 && (
                    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl p-4 space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                            Enter Marks
                        </h3>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-100 dark:bg-slate-800">
                                <tr>
                                    <th className="p-3 text-left text-gray-800 dark:text-white">Student</th>
                                    {selectedSubjects.map((s) => (
                                        <th key={s} className="p-3 text-center text-gray-800 dark:text-white">
                                            {s} / {totalMaximum}
                                        </th>
                                    ))}
                                </tr>
                                </thead>
                                <tbody>
                                {students.map((stu) => (
                                    <tr key={stu._id} className="border-t border-gray-200 dark:border-slate-700">
                                        <td className="p-3 font-medium text-gray-800 dark:text-white">{stu.name}</td>
                                        {marks[stu._id]?.map((m, i) => (
                                            <td key={i} className="p-3 text-center text-gray-800 dark:text-white">
                                                <input
                                                    type="number"
                                                    max={totalMaximum}
                                                    value={m.marksObtained}
                                                    onChange={(e) =>
                                                        setMarks((p) => ({
                                                            ...p,
                                                            [stu._id]: p[stu._id].map((x, idx) =>
                                                                idx === i ? { ...x, marksObtained: e.target.value } : x
                                                            ),
                                                        }))
                                                    }
                                                    className="w-24 h-11 text-center rounded-lg bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500"
                                                />
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {students.length > 0 && (
                    <button
                        disabled={saving}
                        onClick={saveAllResults}
                        className="w-full md:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold hover:opacity-90"
                    >
                        {saving ? "Saving..." : "Save Results"}
                    </button>
                )}
            </div>

            {/* POPUP */}
            {popup && (
                <Popup open={true} {...popup} onClose={() => setPopup(null)} />
            )}
        </div>
    );
}

/* =============================
   INPUT COMPONENT
============================= */
function Input({ label, value, onChange, type = "text" }) {
    return (
        <div className="flex flex-col">
            <label className="text-sm mb-1 text-gray-600 dark:text-gray-400">
                {label}
            </label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
        </div>
    );
}
