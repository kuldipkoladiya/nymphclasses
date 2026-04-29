"use client";

import { useRouter } from "next/navigation";
import axios from "axios";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    MdAccountBalance,
    MdPayments,
    MdPendingActions,
    MdInsights,
    MdPeopleAlt,
    MdMonetizationOn,
    MdCheckCircle,
    MdWarning
} from "react-icons/md";

const API = axios.create({
    baseURL: "https://nymph-be.vercel.app/api",
});

API.interceptors.request.use((config) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export default function FeesDashboard() {
    const router = useRouter();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        API.get("/fees/analytics")
            .then((res) => {
                setData(res.data);
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
            });
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-[1200px] mx-auto space-y-8"
        >
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 cyber-panel p-6 shadow-sm">
                <div>
                    <h1 className="text-3xl font-display font-bold text-secondary-900 dark:text-white tracking-tight uppercase">
                        Financial Command
                    </h1>
                    <p className="font-sans text-sm font-semibold text-secondary-500 mt-1 uppercase tracking-widest">
                        Oversight of allocations, credits, and deficits.
                    </p>
                </div>
            </div>

            {/* ACTIONS */}
            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5"
            >
                <ActionCard
                    variants={itemVariants}
                    icon={<MdAccountBalance size={28} />}
                    title="Structure Config"
                    subtitle="Define baseline fees"
                    color="primary"
                    bgAcc="bg-primary-500/10 text-primary-500"
                    onClick={() => router.push("/fees/structure")}
                />
                <ActionCard
                    variants={itemVariants}
                    icon={<MdPayments size={28} />}
                    title="Credit Registry"
                    subtitle="Process transactions"
                    color="primary"
                    bgAcc="bg-primary-500/10 text-primary-500"
                    onClick={() => router.push("/fees/payments")}
                />
                <ActionCard
                    variants={itemVariants}
                    icon={<MdPendingActions size={28} />}
                    title="Deficit Tracking"
                    subtitle="Monitor unpaid units"
                    color="pink"
                    bgAcc="bg-pink-500/10 text-pink-500"
                    onClick={() => router.push("/fees/pending")}
                />
                <ActionCard
                    variants={itemVariants}
                    icon={<MdInsights size={28} />}
                    title="Data Telemetry"
                    subtitle="Advanced revenue metrics"
                    color="purple"
                    bgAcc="bg-purple-500/10 text-purple-500"
                    onClick={() => {}}
                />
            </motion.div>

            {/* STATS SECTION TITLE */}
            <div className="pt-4">
                <h2 className="text-xl font-display font-bold text-secondary-900 dark:text-white mb-6 flex items-center gap-2 uppercase tracking-wide">
                    <MdMonetizationOn className="text-primary-500" size={24} /> 
                    Current Cycle Telemetry
                </h2>
                
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="cyber-panel p-6 h-[140px] animate-pulse">
                                <div className="h-4 w-24 bg-secondary-200 dark:bg-darkBorder rounded mb-4"></div>
                                <div className="h-8 w-32 bg-secondary-200 dark:bg-darkBorder rounded"></div>
                            </div>
                        ))}
                    </div>
                ) : data ? (
                    <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
                    >
                        <StatCard 
                            variants={itemVariants}
                            title="Active Units" 
                            val={data.totalStudents} 
                            icon={<MdPeopleAlt />} 
                            trend="Active" 
                        />
                        <StatCard 
                            variants={itemVariants}
                            title="Target Revenue" 
                            val={`₹${data.totalYearlyFees?.toLocaleString() || 0}`} 
                            icon={<MdMonetizationOn />} 
                            trend="Yearly" 
                            color="cyan"
                        />
                        <StatCard 
                            variants={itemVariants}
                            title="Secured Funds" 
                            val={`₹${data.totalCollected?.toLocaleString() || 0}`} 
                            icon={<MdCheckCircle />} 
                            trend="Safe" 
                            color="green"
                        />
                        <StatCard 
                            variants={itemVariants}
                            title="Deficit Volume" 
                            val={`₹${data.totalPending?.toLocaleString() || 0}`} 
                            icon={<MdWarning />} 
                            trend="At Risk" 
                            color="rose"
                        />
                    </motion.div>
                ) : (
                    <div className="cyber-panel p-12 text-center flex flex-col items-center justify-center border-dashed border-secondary-300 dark:border-secondary-700">
                        <MdWarning className="text-orange-500 mb-2 drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]" size={32} />
                        <p className="text-secondary-500 dark:text-secondary-400 font-bold uppercase tracking-wider text-sm">Target telemetry unreachable</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
}

/* ================= COMPONENTS ================= */

const ActionCard = ({ icon, title, subtitle, color, bgAcc, onClick, variants }) => {
    const colorClasses = {
        primary: "from-primary-500 to-primary-600 shadow-[0_0_15px_rgba(6,182,212,0.5)]",
        pink: "from-pink-500 to-rose-600 shadow-[0_0_15px_rgba(236,72,153,0.5)]",
        purple: "from-purple-500 to-indigo-600 shadow-[0_0_15px_rgba(168,85,247,0.5)]"
    };

    return (
        <motion.button
            variants={variants}
            whileHover={{ y: -6, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className="
                relative group w-full text-left rounded-xl p-6
                cyber-panel
                hover:border-transparent transition-all duration-300 overflow-hidden
            "
        >
            {/* Glow effect on hover */}
            <div className={`absolute inset-0 bg-gradient-to-br ${colorClasses[color]?.split(' ')[0]} opacity-0 group-hover:opacity-[0.05] dark:group-hover:opacity-[0.15] transition-opacity duration-500`}></div>
            
            {/* Top accent line */}
            <div className={`absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r ${colorClasses[color]?.split(' ')[0]} opacity-0 group-hover:opacity-100 group-hover:${colorClasses[color]?.split(' ')[1]} transition-all duration-300`}></div>

            <div className="relative z-10 flex flex-col h-full">
                <div className={`
                    w-12 h-12 rounded-lg flex items-center justify-center mb-5
                    ${bgAcc} shadow-sm group-hover:shadow-[0_0_10px_currentColor] transition-all border border-current
                `}>
                    {icon}
                </div>
                <h3 className="text-lg font-display font-bold text-secondary-900 dark:text-white tracking-tight leading-tight mb-1">
                    {title}
                </h3>
                <p className="text-[10px] uppercase tracking-widest font-bold text-secondary-500 dark:text-secondary-400">
                    {subtitle}
                </p>
            </div>
        </motion.button>
    );
};

const StatCard = ({ title, val, icon, color = "gray", variants }) => {
    const colorMap = {
        cyan: "text-primary-500 bg-primary-500/10 border-primary-500/30",
        green: "text-green-500 bg-green-500/10 border-green-500/30",
        rose: "text-rose-500 bg-rose-500/10 border-rose-500/30",
        gray: "text-secondary-500 bg-secondary-100 dark:bg-secondary-800 border-secondary-300 dark:border-secondary-700"
    };

    return (
        <motion.div
            variants={variants}
            className="
                relative rounded-xl p-6 overflow-hidden
                cyber-panel
            "
        >
            <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-bold text-secondary-500 dark:text-secondary-400 tracking-[0.2em] uppercase">
                    {title}
                </p>
                <div className={`p-2 rounded-lg border ${colorMap[color]}`}>
                    {icon}
                </div>
            </div>
            <div className="relative z-10">
                <p className="text-3xl font-display font-bold text-secondary-900 dark:text-white tracking-tighter">
                    {val}
                </p>
            </div>
        </motion.div>
    );
};
