"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { MdArrowBack } from "react-icons/md";

const API = axios.create({ baseURL: "nymph-be.vercel.app/api" });
API.interceptors.request.use((c) => {
    const t = localStorage.getItem("token");
    if (t) c.headers.Authorization = `Bearer ${t}`;
    return c;
});

export default function FeeStructurePage() {
    const router = useRouter();
    const [standard, setStandard] = useState("");
    const [fee, setFee] = useState("");
    const [loading, setLoading] = useState(false);

    const submit = async () => {
        if (!standard || !fee) return;

        setLoading(true);
        try {
            await API.post("/fees/structure", {
                standard,
                yearlyFee: fee,
            });
            router.push("/fees"); // back to fees dashboard
        } catch {
            // silent fail (you already handle globally)
        }
        setLoading(false);
    };

    return (
        <div className="max-w-xl mx-auto space-y-6">

            {/* HEADER */}
            <div className="flex items-center gap-3">
                <button
                    onClick={() => router.back()}
                    className="
                        p-2 rounded-lg
                        bg-gray-100 dark:bg-slate-800
                        text-gray-700 dark:text-gray-300
                        hover:bg-gray-200 dark:hover:bg-slate-700
                        transition
                    "
                >
                    <MdArrowBack size={22} />
                </button>

                <div>
                    <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Set Fees Structure
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Define yearly fees standard-wise
                    </p>
                </div>
            </div>

            {/* CARD */}
            <div
                className="
                    bg-white dark:bg-slate-900
                    border border-gray-200 dark:border-slate-700
                    rounded-2xl p-6 space-y-4
                "
            >
                {/* STANDARD */}
                <div>
                    <label className="label">Standard</label>
                    <input
                        type="number"
                        placeholder="e.g. 5"
                        value={standard}
                        onChange={(e) => setStandard(e.target.value)}
                        className="input"
                    />
                </div>

                {/* YEARLY FEE */}
                <div>
                    <label className="label">Yearly Fee (₹)</label>
                    <input
                        type="number"
                        placeholder="e.g. 12000"
                        value={fee}
                        onChange={(e) => setFee(e.target.value)}
                        className="input"
                    />
                </div>

                {/* SAVE */}
                <button
                    disabled={loading}
                    onClick={submit}
                    className="
                        w-full py-3 rounded-xl font-semibold text-white
                        bg-gradient-to-r from-indigo-600 to-purple-600
                        hover:opacity-90 transition
                    "
                >
                    {loading ? "Saving..." : "Save Fees Structure"}
                </button>
            </div>

            {/* STYLES */}
            <style jsx>{`
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
                .label {
                    display: block;
                    margin-bottom: 0.3rem;
                    font-size: 0.875rem;
                    color: #6b7280;
                }
                :global(.dark) .label {
                    color: #9ca3af;
                }
            `}</style>
        </div>
    );
}
