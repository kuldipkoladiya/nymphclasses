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

export default function FeePaymentsPage() {
    const router = useRouter();

    const [studentId, setStudentId] = useState("");
    const [status, setStatus] = useState(null);

    const [amount, setAmount] = useState("");
    const [mode, setMode] = useState("Cash");
    const [note, setNote] = useState("");

    const [loadingStatus, setLoadingStatus] = useState(false);
    const [paying, setPaying] = useState(false);

    /* =============================
       LOAD FEE STATUS
    ============================= */
    const loadStatus = async () => {
        if (!studentId) return;

        setLoadingStatus(true);
        try {
            const res = await API.get(`/fees/status/${studentId}`);
            setStatus(res.data);
        } catch {
            setStatus(null);
        }
        setLoadingStatus(false);
    };

    /* =============================
       PAY FEE
    ============================= */
    const payFee = async () => {
        if (!studentId || !amount) return;

        setPaying(true);
        try {
            await API.post("/fees/pay", {
                studentId,
                amount,
                paymentMode: mode,
                note,
            });

            setAmount("");
            setNote("");
            loadStatus();
        } catch {}
        setPaying(false);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">

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
                        Fee Payment
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Check fee status & record payments
                    </p>
                </div>
            </div>

            {/* STUDENT ID */}
            <div className="card">
                <label className="label">Student ID</label>
                <input
                    className="input"
                    placeholder="Enter Student ID"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                />

                <button
                    onClick={loadStatus}
                    className="btn-primary mt-3"
                >
                    {loadingStatus ? "Checking..." : "Check Fee Status"}
                </button>
            </div>

            {/* STATUS */}
            {status && (
                <div className="card grid grid-cols-3 gap-4 text-center">
                    <Stat label="Total Fee" value={`₹ ${status.totalFee}`} />
                    <Stat label="Paid" value={`₹ ${status.totalPaid}`} />
                    <Stat
                        label="Remaining"
                        value={`₹ ${status.remaining}`}
                        danger={status.remaining > 0}
                    />
                </div>
            )}

            {/* PAYMENT */}
            {status && (
                <div className="card space-y-4">
                    <h2 className="font-semibold text-gray-800 dark:text-gray-200">
                        Add Payment
                    </h2>

                    <input
                        className="input"
                        type="number"
                        placeholder="Amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                    />

                    <select
                        className="input"
                        value={mode}
                        onChange={(e) => setMode(e.target.value)}
                    >
                        <option>Cash</option>
                        <option>Online</option>
                        <option>Cheque</option>
                    </select>

                    <input
                        className="input"
                        placeholder="Note (optional)"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                    />

                    <button
                        onClick={payFee}
                        disabled={paying}
                        className="btn-primary"
                    >
                        {paying ? "Processing..." : "Pay Fee"}
                    </button>
                </div>
            )}

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
                    width: 100%;
                    padding: 0.75rem;
                    border-radius: 0.75rem;
                    color: white;
                    font-weight: 600;
                    background: linear-gradient(to right, #6366f1, #7c3aed);
                }

                .label {
                    font-size: 0.85rem;
                    color: #6b7280;
                    margin-bottom: 0.3rem;
                    display: block;
                }
                :global(.dark) .label {
                    color: #9ca3af;
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

/* =============================
   SMALL COMPONENT
============================= */
function Stat({ label, value, danger }) {
    return (
        <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
            <p
                className={`text-lg font-semibold ${
                    danger ? "text-red-500" : "text-gray-900 dark:text-white"
                }`}
            >
                {value}
            </p>
        </div>
    );
}
