"use client";

import { useRouter } from "next/navigation";
import axios from "@/utils/axios";
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

export default function FeesDashboard() {
    const router = useRouter();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get("/fees/analytics")
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-[1400px] mx-auto space-y-10 pb-20 px-4 md:px-0"
        >
            {/* HEADER */}
            <div className="glass-card p-10 flex flex-col md:flex-row justify-between items-center bg-white dark:bg-slate-900/40 border-l-[12px] border-l-blue-600">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tightest uppercase">Financial Hub</h1>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                        <p className="text-blue-600 dark:text-blue-400 font-black uppercase tracking-[0.2em] text-[10px]">Real-time Capital Management</p>
                    </div>
                </div>
                <div className="hidden md:block text-right">
                    <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Authorized Access Only</p>
                </div>
            </div>

            {/* ACTIONS */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6"
            >
                <ActionCard
                    variants={itemVariants}
                    icon={<MdPayments size={28} />}
                    title="Collection"
                    subtitle="Global Registry"
                    color="emerald"
                    onClick={() => router.push("/fees/collection")}
                />
                <ActionCard
                    variants={itemVariants}
                    icon={<MdAccountBalance size={28} />}
                    title="Payments"
                    subtitle="New Entry"
                    color="blue"
                    onClick={() => router.push("/fees/payments")}
                />
                <ActionCard
                    variants={itemVariants}
                    icon={<MdPendingActions size={28} />}
                    title="Deficits"
                    subtitle="Pending Fees"
                    color="rose"
                    onClick={() => router.push("/fees/pending")}
                />
                <ActionCard
                    variants={itemVariants}
                    icon={<MdPeopleAlt size={28} />}
                    title="Fee Config"
                    subtitle="Edit Prices"
                    color="blue"
                    onClick={() => router.push("/fees/structure")}
                />
                <ActionCard
                    variants={itemVariants}
                    icon={<MdInsights size={28} />}
                    title="Reports"
                    subtitle="Fee Stats"
                    color="slate"
                    onClick={() => router.push("/fees/reports")}
                />
            </motion.div>

            {/* STATS SECTION */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tightest flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white"><MdMonetizationOn size={18} /></div>
                        Fee Summary
                    </h2>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="glass-card p-8 h-[160px] animate-pulse bg-white dark:bg-white/5" />
                        ))}
                    </div>
                ) : data ? (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                    >
                        <StatCard
                            variants={itemVariants}
                            title="Total Students"
                            val={data.totalStudents}
                            icon={<MdPeopleAlt />}
                            color="blue"
                        />
                        <StatCard
                            variants={itemVariants}
                            title="Expected Fees"
                            val={`₹${data.totalYearlyFees?.toLocaleString() || 0}`}
                            icon={<MdMonetizationOn />}
                            color="blue"
                        />
                        <StatCard
                            variants={itemVariants}
                            title="Collected Fees"
                            val={`₹${data.totalCollected?.toLocaleString() || 0}`}
                            icon={<MdCheckCircle />}
                            color="emerald"
                        />
                        <StatCard
                            variants={itemVariants}
                            title="Pending Amount"
                            val={`₹${data.totalPending?.toLocaleString() || 0}`}
                            icon={<MdWarning />}
                            color="rose"
                        />
                    </motion.div>
                ) : (
                    <div className="glass-card p-20 text-center flex flex-col items-center justify-center border-dashed bg-white dark:bg-white/5">
                        <MdWarning className="text-rose-500 mb-4" size={48} />
                        <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No Data Found</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
}

const ActionCard = ({ icon, title, subtitle, color, onClick, variants }) => {
    const colorStyles = {
        blue: "bg-blue-600 text-white shadow-blue-600/30 hover:bg-blue-500",
        emerald: "bg-emerald-500 text-white shadow-emerald-500/30 hover:bg-emerald-400",
        rose: "bg-rose-500 text-white shadow-rose-500/30 hover:bg-rose-400",
        slate: "bg-slate-900 text-white shadow-slate-900/30 hover:bg-slate-800",
    };

    return (
        <motion.button
            variants={variants}
            whileHover={{ y: -8, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className="group relative glass-card p-8 bg-white dark:bg-slate-900/40 text-left border-transparent hover:border-blue-600/20"
        >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-xl transition-all ${colorStyles[color]}`}>
                {icon}
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tightest leading-tight mb-2">
                {title}
            </h3>
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
                {subtitle}
            </p>
            <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-slate-100 dark:bg-white/5 group-hover:bg-blue-600 transition-colors" />
        </motion.button>
    );
};

const StatCard = ({ title, val, icon, color, variants }) => {
    const colorStyles = {
        blue: "text-blue-600 bg-blue-600/10",
        emerald: "text-emerald-500 bg-emerald-500/10",
        rose: "text-rose-500 bg-rose-500/10",
    };

    return (
        <motion.div variants={variants} className="glass-card p-8 bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-white/5 group hover:border-blue-600/10 transition-all">
            <div className="flex items-center justify-between mb-6">
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-[0.2em] uppercase">
                    {title}
                </p>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorStyles[color] || 'bg-slate-100 dark:bg-white/5'}`}>
                    {icon}
                </div>
            </div>
            <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tightest">
                {val}
            </p>
        </motion.div>
    );
};
