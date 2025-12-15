"use client";

import { useEffect, useState } from "react";
import axios from "@/utils/axios";
import { Bar, Doughnut } from "react-chartjs-2";
import {
    Chart as ChartJS,
    BarElement,
    CategoryScale,
    LinearScale,
    ArcElement,
    Tooltip,
    Legend,
} from "chart.js";

ChartJS.register(
    BarElement,
    CategoryScale,
    LinearScale,
    ArcElement,
    Tooltip,
    Legend
);

export default function Dashboard() {
    const [loading, setLoading] = useState(true);
    const [main, setMain] = useState({});
    const [feesStdWise, setFeesStdWise] = useState([]);
    const [feesAnalytics, setFeesAnalytics] = useState({});

    useEffect(() => {
        async function load() {
            try {
                const [d1, d2, d3] = await Promise.all([
                    axios.get("/dashboard"),
                    axios.get("/dashboard/fees/standard-wise"),
                    axios.get("/fees/analytics"),
                ]);

                setMain(d1.data);
                setFeesStdWise(d2.data.data || []);
                setFeesAnalytics(d3.data || {});
            } catch (err) {
                console.error("Dashboard error:", err);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    if (loading) {
        return (
            <div className="text-center mt-20 text-gray-500 dark:text-gray-400">
                Loading dashboard…
            </div>
        );
    }

    /* ======================
       CHART DATA
    ====================== */

    const classWiseData = {
        labels: main.classWise?.map((c) => `Std ${c._id}`),
        datasets: [
            {
                label: "Students",
                data: main.classWise?.map((c) => c.count),
                backgroundColor: "#6366f1",
                borderRadius: 8,
                maxBarThickness: 40,
            },
        ],
    };

    const feesDonut = {
        labels: feesStdWise.map((i) => `Std ${i.standard}`),
        datasets: [
            {
                data: feesStdWise.map((i) => i.totalFee),
                backgroundColor: ["#6366f1", "#8b5cf6", "#60a5fa"],
                borderWidth: 2,
            },
        ],
    };

    return (
        <div className="min-h-screen">

            {/* PAGE HEADER */}
            <div className="mb-8">
                <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 dark:text-white">
                    Dashboard
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Overview of students, fees & performance
                </p>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <Stat title="Students" value={main.totalStudents} />
                <Stat title="Present Today" value={main.presentToday} />
                <Stat title="Pending Fees" value={`₹ ${feesAnalytics.totalPending}`} />
                <Stat title="Collected Today" value={`₹ ${feesAnalytics.todayCollected}`} />
                <Stat title="Yearly Fees" value={`₹ ${feesAnalytics.totalYearlyFees}`} />
                <Stat title="Collected" value={`₹ ${feesAnalytics.totalCollected}`} />
            </div>

            {/* CHARTS */}
            <div className="grid md:grid-cols-2 gap-6 mt-8">
                <Card title="Class Wise Students">
                    <Bar data={classWiseData} height={140} />
                </Card>

                <Card title="Fees Distribution">
                    <Doughnut data={feesDonut} />
                </Card>
            </div>

            {/* TOP STUDENTS */}
            <Card title="Top Performing Students" className="mt-8">
                {main.topStudents?.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        No topper data available
                    </p>
                ) : (
                    <div className="space-y-3">
                        {main.topStudents?.map((s, i) => (
                            <div
                                key={i}
                                className="
                  flex justify-between items-center
                  border rounded-lg p-3
                  dark:border-slate-700
                "
                            >
                                <div>
                                    <p className="font-medium text-gray-800 dark:text-white">
                                        {s.studentId.name}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Std {s.studentId.standard}
                                    </p>
                                </div>
                                <p className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">
                                    {s.percentage}%
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
}

/* ======================
   UI COMPONENTS
====================== */

const Card = ({ title, children, className = "" }) => (
    <div
        className={`
      bg-white dark:bg-slate-900
      border border-gray-200 dark:border-slate-700
      rounded-xl p-5 shadow-sm
      ${className}
    `}
    >
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">
            {title}
        </h2>
        {children}
    </div>
);

const Stat = ({ title, value }) => (
    <div
        className="
      bg-white dark:bg-slate-900
      border border-gray-200 dark:border-slate-700
      rounded-xl p-4 shadow-sm
    "
    >
        <p className="text-xs text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-xl font-semibold text-gray-800 dark:text-white mt-1">
            {value ?? "-"}
        </p>
    </div>
);
