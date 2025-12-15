"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

/* =============================
   API INSTANCE (TOKEN SUPPORT)
============================= */
const API = axios.create({
    baseURL: "nymph-be.vercel.app/api",
});

API.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export default function ViewResultByStandardPage() {
    const router = useRouter();

    const [standard, setStandard] = useState("");
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);

    const [results, setResults] = useState([]);
    const [selectedResult, setSelectedResult] = useState(null);

    const [loadingStudents, setLoadingStudents] = useState(false);
    const [loadingResults, setLoadingResults] = useState(false);
    const [loadingDetail, setLoadingDetail] = useState(false);

    const [popup, setPopup] = useState(null);

    /* =============================
       HELPERS
    ============================= */
    const showPopup = (title, message, action = null) => {
        setPopup({ title, message, action });
    };

    /* =============================
       LOAD STUDENTS
    ============================= */
    const loadStudents = async () => {
        if (!standard) {
            return showPopup("Error", "Please enter standard");
        }

        setLoadingStudents(true);
        try {
            const res = await API.get(`/students/by-standard/${standard}`);
            const list = res.data?.students || res.data || [];

            setStudents(list);
            setSelectedStudent(null);
            setResults([]);
            setSelectedResult(null);

            if (!list.length) {
                showPopup("Info", "No students found for this standard");
            }
        } catch {
            showPopup("Error", "Failed to load students");
        }
        setLoadingStudents(false);
    };

    /* =============================
       LOAD RESULTS
    ============================= */
    const loadResultsByStudent = async (student) => {
        setSelectedStudent(student);
        setLoadingResults(true);

        try {
            const res = await API.get(`/results/student/${student._id}`);
            setResults(Array.isArray(res.data) ? res.data : []);
            setSelectedResult(null);

            if (!res.data?.length) {
                showPopup("Info", "No results found for this student");
            }
        } catch {
            showPopup("Error", "Failed to load results");
        }
        setLoadingResults(false);
    };

    /* =============================
       LOAD RESULT DETAIL
    ============================= */
    const loadResultDetail = async (id) => {
        setLoadingDetail(true);
        try {
            const res = await API.get(`/results/id/${id}`);
            setSelectedResult(res.data?.data || res.data);
        } catch {
            showPopup("Error", "Failed to load result detail");
        }
        setLoadingDetail(false);
    };

    /* =============================
       DOWNLOAD PDF
    ============================= */
    const downloadPdf = async () => {
        try {
            const res = await API.get(
                `/results/pdf/${selectedStudent._id}/${selectedResult._id}`,
                { responseType: "blob" }
            );

            const url = window.URL.createObjectURL(res.data);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${selectedStudent.name}_result.pdf`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch {
            showPopup("Error", "Failed to download PDF");
        }
    };

    /* =============================
       DELETE RESULT
    ============================= */
    const deleteResult = async () => {
        try {
            await API.delete(`/results/${selectedResult._id}`);
            setResults((p) => p.filter((r) => r._id !== selectedResult._id));
            setSelectedResult(null);
            showPopup("Success", "Result deleted successfully");
        } catch {
            showPopup("Error", "Failed to delete result");
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">

            {/* HEADER */}
            <div className="bg-white dark:bg-slate-900 border rounded-2xl p-5 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
                        View Results
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Standard → Student → Exam → Result
                    </p>
                </div>

                {/* BACK BUTTON */}
                <button
                    onClick={() => router.back()}
                    className="px-4 py-2 rounded-lg border hover:bg-gray-100 dark:hover:bg-slate-800"
                >
                    ← Back
                </button>
            </div>

            {/* MAIN GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* STUDENTS */}
                <div className="card">
                    <input
                        className="input"
                        placeholder="Enter Standard"
                        value={standard}
                        onChange={(e) => setStandard(e.target.value)}
                    />
                    <button onClick={loadStudents} className="btn mt-3">
                        Load Students
                    </button>

                    {loadingStudents && <p className="muted">Loading students...</p>}

                    {students.map((s) => (
                        <div
                            key={s._id}
                            onClick={() => loadResultsByStudent(s)}
                            className={`list-item ${
                                selectedStudent?._id === s._id ? "active" : ""
                            }`}
                        >
                            <p className="font-medium">{s.name}</p>
                            <p className="text-xs opacity-70">Roll: {s.rollNumber || "-"}</p>
                        </div>
                    ))}
                </div>

                {/* RESULTS */}
                <div className="card">
                    {loadingResults && <p className="muted">Loading results...</p>}

                    {!loadingResults && results.length === 0 && (
                        <p className="muted">No exams found</p>
                    )}

                    {results.map((r) => (
                        <div
                            key={r._id}
                            onClick={() => loadResultDetail(r._id)}
                            className={`list-item ${
                                selectedResult?._id === r._id ? "active" : ""
                            }`}
                        >
                            <div className="flex justify-between items-center">
                                <p className="font-medium">{r.examName}</p>
                                <span className="text-xs opacity-70">
                    {new Date(r.examDate).toLocaleDateString()}
                </span>
                            </div>

                            <div className="flex justify-between text-xs opacity-70 mt-1">
                                <span>Grade: {r.grade}</span>
                                <span>{r.percentage}%</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* DETAIL */}
                <div className="card">
                    {loadingDetail && <p className="muted">Loading result...</p>}

                    {selectedResult && (
                        <>
                            <div className="mb-3">
                                <p><b>Exam:</b> {selectedResult.examName}</p>
                                <p><b>Percentage:</b> {selectedResult.percentage}%</p>
                                <p><b>Grade:</b> {selectedResult.grade}</p>
                            </div>

                            <table className="w-full text-sm mb-4">
                                <tbody>
                                {selectedResult.subjects.map((s) => (
                                    <tr key={s._id} className="border-t">
                                        <td className="p-2">{s.name}</td>
                                        <td className="p-2 text-center">{s.marksObtained}</td>
                                        <td className="p-2 text-center">{s.totalMarks}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>

                            <button onClick={downloadPdf} className="btn">
                                Download PDF
                            </button>

                            <button
                                onClick={() =>
                                    showPopup(
                                        "Delete Result",
                                        "Are you sure you want to delete?",
                                        deleteResult
                                    )
                                }
                                className="w-full mt-2 py-2 rounded-lg bg-red-600 text-white"
                            >
                                Delete Result
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* POPUP */}
            {popup && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 w-[90%] max-w-sm">
                        <h3 className="font-semibold text-lg">{popup.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                            {popup.message}
                        </p>

                        <div className="mt-4 flex justify-end gap-3">
                            <button
                                onClick={() => setPopup(null)}
                                className="px-4 py-2 rounded-lg border"
                            >
                                Cancel
                            </button>
                            {popup.action && (
                                <button
                                    onClick={() => {
                                        popup.action();
                                        setPopup(null);
                                    }}
                                    className="px-4 py-2 rounded-lg bg-red-600 text-white"
                                >
                                    Confirm
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* STYLES */}
            <style jsx>{`
        .input {
          border: 1px solid #e5e7eb;
          padding: 0.6rem;
          border-radius: 8px;
          width: 100%;
        }
        .btn {
          background: linear-gradient(to right, #7c3aed, #2563eb);
          color: white;
          padding: 0.6rem;
          border-radius: 8px;
          width: 100%;
        }
        .card {
          background: white;
          border-radius: 16px;
          padding: 16px;
          border: 1px solid #e5e7eb;
        }
        .list-item {
          margin-top: 8px;
          padding: 10px;
          border-radius: 10px;
          border: 1px solid #e5e7eb;
          cursor: pointer;
        }
        .active {
          background: linear-gradient(to right, #7c3aed, #2563eb);
          color: white;
        }
        .muted {
          font-size: 13px;
          color: #6b7280;
          margin-top: 8px;
        }
      `}</style>
        </div>
    );
}
