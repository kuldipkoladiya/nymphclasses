"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { MdArrowBack } from "react-icons/md";

const API = axios.create({ baseURL: "https://nymph-be.vercel.app/api" });
API.interceptors.request.use((c) => {
    const t = localStorage.getItem("token");
    if (t) c.headers.Authorization = `Bearer ${t}`;
    return c;
});

export default function PendingFeesPage() {
    const router = useRouter();

    const [standard, setStandard] = useState("");
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(false);

    const load = async () => {
        if (!standard) return;

        setLoading(true);
        try {
            const res = await API.get(`/fees/pending?standard=${standard}`);
            setList(res.data || []);
        } catch {
            setList([]);
        }
        setLoading(false);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">

            {/* HEADER */}
            <div className="flex items-center gap-3">
                <button
                    onClick={() => router.back()}
                    className="icon-btn"
                >
                    <MdArrowBack size={22} />
                </button>

                <div>
                    <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Pending Fees
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        View students with pending payments
                    </p>
                </div>
            </div>

            {/* FILTER */}
            <div className="card flex gap-3 items-center">
                <input
                    className="input"
                    placeholder="Enter Standard (e.g. 5)"
                    value={standard}
                    onChange={(e) => setStandard(e.target.value)}
                />
                <button onClick={load} className="btn-primary w-40">
                    {loading ? "Loading..." : "Load"}
                </button>
            </div>

            {/* LIST */}
            <div className="card">
                {loading && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Loading pending fees...
                    </p>
                )}

                {!loading && list.length === 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        No pending fees found.
                    </p>
                )}

                {list.length > 0 && (
                    <table className="w-full text-sm">
                        <thead>
                        <tr className="text-left border-b dark:border-slate-700">
                            <th className="py-2">Student</th>
                            <th className="py-2 text-center">Standard</th>
                            <th className="py-2 text-right">Remaining</th>
                        </tr>
                        </thead>
                        <tbody>
                        {list.map((p) => (
                            <tr
                                key={p.student._id}
                                className="border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800"
                            >
                                <td className="py-2">
                                    <p className="font-medium">
                                        {p.student.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        Roll: {p.student.rollNumber || "-"}
                                    </p>
                                </td>
                                <td className="py-2 text-center">
                                    {p.student.standard}
                                </td>
                                <td className="py-2 text-right font-semibold text-red-500">
                                    ₹ {p.remaining}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* STYLES */}
            <style jsx>{`
                .card {
                    background: white;
                    border: 1px solid #e5e7eb;
                    border-radius: 1rem;
                    padding: 1.25rem;
                }
                :global(.dark) .card {
                    background: #0f172a;
                    border-color: #334155;
                }

                .input {
                    width: 100%;
                    padding: 0.75rem;
                    border-radius: 0.75rem;
                    border: 1px solid #e5e7eb;
                    background: transparent;
                    color: inherit;
                }
                .input:focus {
                    outline: none;
                    border-color: #6366f1;
                    box-shadow: 0 0 0 1px #6366f1;
                }

                .btn-primary {
                    padding: 0.75rem;
                    border-radius: 0.75rem;
                    color: white;
                    font-weight: 600;
                    background: linear-gradient(to right, #6366f1, #7c3aed);
                }

                .icon-btn {
                    padding: 0.5rem;
                    border-radius: 0.5rem;
                    background: #f1f5f9;
                }
                :global(.dark) .icon-btn {
                    background: #1e293b;
                    color: #e5e7eb;
                }
            `}</style>
        </div>
    );
}
