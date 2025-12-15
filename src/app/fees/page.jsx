"use client";

import { useRouter } from "next/navigation";
import axios from "axios";
import { useEffect, useState } from "react";
import {
    MdAccountBalance,
    MdPayments,
    MdPendingActions,
    MdInsights,
} from "react-icons/md";

const API = axios.create({
    baseURL: "http://localhost:5000/api",
});

API.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export default function FeesDashboard() {
    const router = useRouter();
    const [data, setData] = useState(null);

    useEffect(() => {
        API.get("/fees/analytics")
            .then((res) => setData(res.data))
            .catch(() => {});
    }, []);

    return (
        <div className="space-y-8">

            {/* HEADER */}
            <div>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    Fees Management
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Manage fee structure, payments & pending fees
                </p>
            </div>

            {/* ACTIONS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <ActionCard
                    icon={<MdAccountBalance />}
                    title="Set Fees"
                    subtitle="Standard-wise fees"
                    onClick={() => router.push("/fees/structure")}
                />
                <ActionCard
                    icon={<MdPayments />}
                    title="Add Payment"
                    subtitle="Record student payment"
                    onClick={() => router.push("/fees/payments")}
                />
                <ActionCard
                    icon={<MdPendingActions />}
                    title="Pending Fees"
                    subtitle="View due payments"
                    onClick={() => router.push("/fees/pending")}
                />
                <ActionCard
                    icon={<MdInsights />}
                    title="Analytics"
                    subtitle="Collection overview"
                    onClick={() => {}}
                />
            </div>

            {/* STATS */}
            {data && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Stat title="Students" value={data.totalStudents} />
                    <Stat title="Total Fees" value={`₹ ${data.totalYearlyFees}`} />
                    <Stat title="Collected" value={`₹ ${data.totalCollected}`} />
                    <Stat title="Pending" value={`₹ ${data.totalPending}`} />
                </div>
            )}
        </div>
    );
}

/* ================= COMPONENTS ================= */

const ActionCard = ({ icon, title, subtitle, onClick }) => (
    <button
        onClick={onClick}
        className="
            group w-full text-left rounded-2xl p-5
            bg-white dark:bg-slate-900
            border border-gray-200 dark:border-slate-700
            hover:border-indigo-400 dark:hover:border-indigo-500
            hover:shadow-lg transition
        "
    >
        <div className="flex items-center gap-3 mb-3">
            <div
                className="
                    text-2xl p-2 rounded-xl
                    bg-indigo-50 dark:bg-indigo-900/30
                    text-indigo-600 dark:text-indigo-400
                    group-hover:scale-110 transition
                "
            >
                {icon}
            </div>
            <p className="font-semibold text-gray-900 dark:text-white">
                {title}
            </p>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
            {subtitle}
        </p>
    </button>
);

const Stat = ({ title, value }) => (
    <div
        className="
            rounded-2xl p-5
            bg-white dark:bg-slate-900
            border border-gray-200 dark:border-slate-700
        "
    >
        <p className="text-sm text-gray-500 dark:text-gray-400">
            {title}
        </p>
        <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">
            {value}
        </p>
    </div>
);
