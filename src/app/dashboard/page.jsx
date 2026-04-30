"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, useRef } from "react";
import axios from "../../utils/axios";
import { motion } from "framer-motion";
import {
    MdPeopleAlt,
    MdCheckCircle,
    MdAccountBalanceWallet,
    MdTrendingUp,
} from "react-icons/md";
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

const ChartComponent = dynamic(
    () => import("./ChartComponent"),
    { ssr: false }
);

const TiltCard = ({ title, value, icon: Icon, color = "indigo" }) => {
    const cardRef = useRef(null);
    const [rotateX, setRotateX] = useState(0);
    const [rotateY, setRotateY] = useState(0);

    const handleMouseMove = (e) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        
        setRotateY((mouseX - centerX) / 15);
        setRotateX((centerY - mouseY) / 15);
    };

    const handleMouseLeave = () => {
        setRotateX(0);
        setRotateY(0);
    };

    return (
        <motion.div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ 
                perspective: 1000,
                rotateX,
                rotateY,
                transformStyle: "preserve-3d"
            }}
            className="glass-card p-8 bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-white/20 dark:border-white/5 shadow-xl transition-shadow hover:shadow-2xl group"
        >
            <div style={{ transform: "translateZ(40px)" }}>
                <div className={`w-14 h-14 rounded-2xl bg-${color}-500 flex items-center justify-center mb-6 shadow-lg shadow-${color}-500/30 group-hover:scale-110 transition-transform duration-500`}>
                    <Icon size={28} className="text-white" />
                </div>
                <p className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em]">{title}</p>
                <p className="text-4xl font-black text-gray-900 dark:text-white mt-2 tracking-tightest">{value ?? "0"}</p>
            </div>
        </motion.div>
    );
};

export default function Dashboard() {
    const [loading, setLoading] = useState(true);
    const [main, setMain] = useState({});
    const [feesAnalytics, setFeesAnalytics] = useState({});

    useEffect(() => {
        async function load() {
            try {
                const [d1, d3] = await Promise.all([
                    axios.get("/dashboard"),
                    axios.get("/fees/analytics"),
                ]);
                setMain(d1.data);
                setFeesAnalytics(d3.data || {});
            } catch (err) {
                console.error("Dashboard error:", err);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    const classWiseData = {
        labels: main.classWise?.map((c) => `Std ${c._id}`) || [],
        datasets: [{
            label: "Students",
            data: main.classWise?.map((c) => c.count) || [],
            backgroundColor: "rgba(37, 99, 235, 0.8)",
            hoverBackgroundColor: "rgba(37, 99, 235, 1)",
            borderRadius: 12,
            borderWidth: 0,
        }],
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10 max-w-[1400px] mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tightest">Dashboard</h1>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <p className="text-blue-600 dark:text-blue-400 font-black uppercase tracking-[0.2em] text-[10px]">Academic Overview</p>
                    </div>
                </div>
                <div className="text-right hidden md:block">
                    <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest">{new Date().toDateString()}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                {loading ? Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />) : (
                    <>
                        <TiltCard title="Total Students" value={main.totalStudents} icon={MdPeopleAlt} color="blue" />
                        <TiltCard title="Present Today" value={main.presentToday} icon={MdCheckCircle} color="emerald" />
                        <TiltCard title="Collected Today" value={`₹${feesAnalytics.todayCollected || 0}`} icon={MdTrendingUp} color="blue" />
                        <TiltCard title="Total Fees" value={`₹${feesAnalytics.totalCollected || 0}`} icon={MdAccountBalanceWallet} color="slate" />
                    </>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 glass-card p-8 md:p-10 bg-white dark:bg-slate-900/40">
                    <div className="flex items-center justify-between mb-10">
                        <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tightest">Student Distribution</h2>
                        <div className="px-3 py-1 bg-blue-600/10 border border-blue-600/20 rounded-full text-blue-600 text-[10px] font-black uppercase tracking-widest">By Standard</div>
                    </div>
                    <div className="h-[350px] w-full">
                        {!loading && <ChartComponent type="bar" data={classWiseData} />}
                    </div>
                </div>

                <div className="glass-card p-8 md:p-10 bg-white dark:bg-slate-900/40 flex flex-col">
                    <div className="flex items-center justify-between mb-10">
                        <h2 className="text-xl font-black text-blue-600 dark:text-blue-400 uppercase tracking-tightest">Elite Performers</h2>
                    </div>
                    <div className="space-y-4 flex-1">
                        {loading ? Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-20 bg-slate-100 dark:bg-white/5 rounded-3xl animate-pulse" />) : main.topStudents?.map((s, i) => (
                            <motion.div 
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                key={i} 
                                className="flex items-center justify-between p-5 border border-slate-100 dark:border-white/5 rounded-3xl bg-slate-50/50 dark:bg-white/[0.02] hover:bg-white dark:hover:bg-white/[0.05] transition-all cursor-pointer group"
                            >
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-900 dark:bg-blue-600 text-white flex items-center justify-center font-black shadow-lg shadow-blue-500/30 group-hover:rotate-12 transition-transform duration-500">{i+1}</div>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-slate-900 dark:text-white text-sm tracking-tight">{s.studentId?.name}</span>
                                        <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-0.5">Std {s.studentId?.standard} • {s.studentId?.rollNumber}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-blue-600 dark:text-blue-400 font-black text-lg">{Math.min(s.percentage, 100)}%</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function StatSkeleton() {
    return (
        <div className="glass-card p-8 h-[200px] bg-white dark:bg-slate-900/40 animate-pulse">
            <div className="w-14 h-14 bg-gray-100 dark:bg-white/5 rounded-2xl mb-8"></div>
            <div className="h-3 w-20 bg-gray-100 dark:bg-white/5 rounded-full mb-3"></div>
            <div className="h-10 w-28 bg-gray-100 dark:bg-white/5 rounded-xl"></div>
        </div>
    );
}

