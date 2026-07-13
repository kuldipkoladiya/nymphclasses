"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "../../utils/axios";
import { motion } from "framer-motion";
import { 
    MdPeopleAlt, 
    MdCheckCircle, 
    MdTrendingUp, 
    MdArrowForward,
    MdSchool,
    MdList,
    MdClass,
    MdAccountBalanceWallet,
    MdCalendarToday,
    MdAdminPanelSettings
} from "react-icons/md";
import { FaWhatsapp } from "react-icons/fa";

// Entry Animation Variants
const dashboardContainerVariants = {
    hidden: { opacity: 0, scale: 0.98 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.6,
            ease: [0.16, 1, 0.3, 1],
            staggerChildren: 0.05
        }
    }
};

const cellFadeInVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { 
        opacity: 1, 
        y: 0, 
        transition: { type: "spring", stiffness: 100, damping: 15 } 
    }
};

// Premium hover animation variants for the Operations Hub cards
const operationCardHover = {
    rest: { scale: 1, y: 0, boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)" },
    hover: { 
        scale: 1.04, 
        y: -6, 
        boxShadow: "0 12px 24px -6px rgba(59, 130, 246, 0.15)",
        transition: { type: "spring", stiffness: 400, damping: 20 }
    }
};

export default function PremiumGlassConsoleDashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [main, setMain] = useState({});
    const [feesAnalytics, setFeesAnalytics] = useState({});
    const [whatsappStatus, setWhatsappStatus] = useState("checking");

    useEffect(() => {
        async function load() {
            try {
                const [d1, d2, d3] = await Promise.all([
                    axios.get("/dashboard"),
                    axios.get("/fees/analytics"),
                    axios.get("/results/whatsapp-status").catch(() => ({ data: { status: "offline" } }))
                ]);
                setMain(d1.data);
                setFeesAnalytics(d2.data || {});
                setWhatsappStatus(d3.data?.status || "offline");
            } catch (err) {
                console.error("Dashboard error:", err);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    // Action button lists with custom hover border glows
    const actions = [
        { label: "Register Student", path: "/students", icon: MdPeopleAlt, desc: "Add and manage student registry", color: "text-blue-500", glow: "hover:border-blue-500/50 hover:shadow-blue-500/10", iconBg: "bg-blue-500/10", borderL: "border-l-4 border-l-blue-500", cardBg: "bg-blue-50/20 dark:bg-blue-950/10" },
        { label: "Mark Attendance", path: "/attendance", icon: MdList, desc: "Record daily student presence", color: "text-emerald-500", glow: "hover:border-emerald-500/50 hover:shadow-emerald-500/10", iconBg: "bg-emerald-500/10", borderL: "border-l-4 border-l-emerald-500", cardBg: "bg-emerald-50/20 dark:bg-emerald-950/10" },
        { label: "Record Fees", path: "/fees", icon: MdAccountBalanceWallet, desc: "Collect payments & track dues", color: "text-amber-500", glow: "hover:border-amber-500/50 hover:shadow-amber-500/10", iconBg: "bg-amber-500/10", borderL: "border-l-4 border-l-amber-500", cardBg: "bg-amber-50/20 dark:bg-amber-950/10" },
        { label: "Publish Results", path: "/results", icon: MdSchool, desc: "Upload and broadcast mark sheets", color: "text-purple-500", glow: "hover:border-purple-500/50 hover:shadow-purple-500/10", iconBg: "bg-purple-500/10", borderL: "border-l-4 border-l-purple-500", cardBg: "bg-purple-50/20 dark:bg-purple-950/10" },
    ];

    // WhatsApp configuration mapping
    const waConfig = {
        authenticated: { text: "Connected", style: "border-emerald-500/10 text-emerald-500 bg-emerald-500/5", glow: "shadow-emerald-500/5" },
        scan_required: { text: "Scan QR", style: "border-amber-500/10 text-amber-500 bg-amber-500/5", glow: "shadow-amber-500/5" },
        initializing: { text: "Connecting...", style: "border-blue-500/10 text-blue-500 bg-blue-500/5", glow: "shadow-blue-500/5" },
        offline: { text: "Offline", style: "border-rose-500/10 text-rose-600 dark:text-rose-455 border-rose-500/25", glow: "shadow-rose-500/5" }
    };
    const wa = waConfig[whatsappStatus] || { text: "Offline", style: "border-slate-850 text-slate-500 bg-slate-900/10" };

    return (
        <motion.div 
            variants={dashboardContainerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-[1400px] mx-auto pb-16 px-4 md:px-0 text-slate-800 dark:text-slate-100 space-y-10"
        >
            
            {/* PREMIUM TYPOGRAPHY-DRIVEN HEADER */}
            <motion.div 
                variants={cellFadeInVariants}
                className="flex flex-row justify-between items-center gap-6 pt-6"
            >
                <div className="space-y-1">
                    <span className="text-[9px] font-black tracking-widest uppercase text-blue-600 dark:text-blue-400 block leading-none">System Panel</span>
                    <h1 className="text-2xl md:text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 dark:from-white dark:to-indigo-200">
                        Nymph Classes Console
                    </h1>
                </div>

                <div className="flex items-center flex-shrink-0">
                    {/* Calendar Badge */}
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-300 border border-slate-200/20">
                        <MdCalendarToday className="text-blue-500" />
                        <span>
                            {new Date().toLocaleDateString("en-IN", { weekday: 'short', day: 'numeric', month: 'short' })}
                        </span>
                    </div>
                </div>
            </motion.div>

            {/* KEY METRICS DOCK (4 GLOWING CARDS) - INCLUDES WHATSAPP CLIENT */}
            <motion.div 
                variants={dashboardContainerVariants}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
                {loading ? (
                    Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)
                ) : (
                    <>
                        <GlassStatCard title="Enrolled Students" value={main.totalStudents} icon={MdPeopleAlt} color="blue" subtitle="Active roster profiles" />
                        <GlassStatCard title="Daily Attendance" value={main.presentToday} icon={MdCheckCircle} color="emerald" suffix={` / ${main.totalStudents}`} subtitle={`${main.attendancePercent || 0}% marked present`} />
                        <GlassStatCard title="Today Collected" value={feesAnalytics.todayCollected || 0} icon={MdTrendingUp} color="amber" prefix="₹" subtitle="Collected fee registers" />
                        <GlassStatCard title="WhatsApp Client" value={wa.text} icon={FaWhatsapp} color={whatsappStatus === "authenticated" ? "green" : "red"} subtitle="Automated messages Gateway" isWa onClick={() => router.push("/results/whatsapp")} statusBadgeStyle={wa.style} />
                    </>
                )}
            </motion.div>

            {/* OPERATIONS HUB - DISPLAYED IMMEDIATELY AFTER STATS WITH ADVANCED HOVER ANIMATION */}
            <motion.div 
                variants={cellFadeInVariants}
                className="bg-white/75 dark:bg-slate-900/50 backdrop-blur-xl p-6 md:p-8 rounded-[2rem] shadow-premium space-y-6"
            >
                <div>
                    <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Operations Hub</h2>
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Quick actions console</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {actions.map((act, i) => {
                        const Icon = act.icon;
                        return (
                            <motion.div
                                key={i}
                                variants={operationCardHover}
                                initial="rest"
                                whileHover="hover"
                                onClick={() => router.push(act.path)}
                                className={`p-5 ${act.cardBg} rounded-2xl flex flex-col justify-between items-start cursor-pointer min-h-[140px] text-left ${act.glow} ${act.borderL}`}
                            >
                                <div className={`w-10 h-10 rounded-xl ${act.iconBg} ${act.color} flex items-center justify-center shadow-inner`}>
                                    <Icon size={20} />
                                </div>
                                <div className="w-full flex justify-between items-end mt-4">
                                    <div>
                                        <span className="font-black text-xs text-slate-900 dark:text-white tracking-tight block">{act.label}</span>
                                        <span className="text-[9px] text-slate-400 dark:text-slate-500 font-medium block mt-0.5">{act.desc}</span>
                                    </div>
                                    <MdArrowForward className={`text-slate-400 ${act.color}`} size={16} />
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </motion.div>

            {/* CLASS DENSITY LIST - NOW DISPLAYED AT THE BOTTOM IN A CLEAN MINIMAL PILLS LIST */}
            <motion.div 
                variants={cellFadeInVariants}
                className="bg-white/75 dark:bg-slate-900/50 backdrop-blur-xl p-6 md:p-8 rounded-[2rem] shadow-premium space-y-6"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <MdClass className="text-blue-500" /> Class Density
                        </h2>
                        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Headcount logs sorted per standard</p>
                    </div>
                    <span className="text-[9px] font-black tracking-widest uppercase bg-blue-500/10 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full border border-blue-500/20">
                        Standards
                    </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {!loading && main.classWise && main.classWise.length > 0 ? (
                        main.classWise.map((c, i) => (
                            <motion.div 
                                whileHover={{ y: -2, scale: 1.02 }}
                                key={i} 
                                className="p-3 bg-blue-50/20 dark:bg-blue-950/10 rounded-2xl flex items-center justify-between gap-3 transition-colors duration-300"
                            >
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-xs">
                                        {c._id}
                                    </div>
                                    <span className="font-bold text-[10px] text-slate-400 uppercase tracking-wider">Std</span>
                                </div>
                                <span className="font-black text-xs text-slate-900 dark:text-white">
                                    {c.count} Students
                                </span>
                            </motion.div>
                        ))
                    ) : (
                        <div className="col-span-6 text-center text-xs text-slate-400 py-10 font-bold uppercase tracking-widest">No standard profiles found</div>
                    )}
                </div>
            </motion.div>

        </motion.div>
    );
}

// Glass Stat Card Component with no light mode border
function GlassStatCard({ title, value, icon: Icon, color, prefix = "", suffix = "", subtitle = "", isWa = false, onClick, statusBadgeStyle = "" }) {
    const cardColors = {
        blue: { text: "text-blue-500 dark:text-blue-400", bg: "bg-blue-500/10", border: "border-l-4 border-l-blue-500", cardBg: "bg-blue-50/20 dark:bg-blue-950/10" },
        emerald: { text: "text-emerald-500 dark:text-emerald-400", bg: "bg-emerald-500/10", border: "border-l-4 border-l-emerald-500", cardBg: "bg-emerald-50/20 dark:bg-emerald-950/10" },
        amber: { text: "text-amber-500 dark:text-amber-400", bg: "bg-amber-500/10", border: "border-l-4 border-l-amber-600", cardBg: "bg-amber-50/20 dark:bg-amber-950/10" },
        purple: { text: "text-purple-500 dark:text-purple-400", bg: "bg-purple-500/10", border: "border-l-4 border-l-purple-500", cardBg: "bg-purple-50/20 dark:bg-purple-950/10" },
        green: { text: "text-green-500 dark:text-green-400", bg: "bg-green-500/10", border: "border-l-4 border-l-green-500", cardBg: "bg-green-50/20 dark:bg-green-950/10" },
        red: { text: "text-rose-500 dark:text-rose-455", bg: "bg-rose-500/10", border: "border-l-4 border-l-rose-500", cardBg: "bg-rose-50/20 dark:bg-rose-955/10" },
    };

    const c = cardColors[color] || cardColors.blue;

    return (
        <motion.div 
            whileHover={{ y: -4, scale: 1.02 }}
            onClick={onClick}
            className={`p-6 ${c.cardBg} backdrop-blur-xl rounded-3xl flex justify-between items-center transition-all duration-300 shadow-sm hover:shadow-md ${c.border} ${isWa ? 'cursor-pointer hover:border-green-500/50' : ''}`}
        >
            <div className="space-y-1">
                <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block leading-none">{title}</span>
                <h3 className={`text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none mt-1.5 ${isWa ? 'text-sm' : ''}`}>
                    {prefix}{value ?? 0}{suffix}
                </h3>
                {isWa ? (
                    <span className={`inline-block text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border mt-1.5 ${statusBadgeStyle}`}>
                        Configured
                    </span>
                ) : (
                    <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 block leading-none mt-1">{subtitle}</span>
                )}
            </div>
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${c.bg} ${c.text} shadow-sm`}>
                <Icon size={20} className={isWa ? 'animate-pulse' : ''} />
            </div>
        </motion.div>
    );
}

function StatSkeleton() {
    return (
        <div className="p-6 h-[106px] bg-white dark:bg-slate-900/50 animate-pulse dark:border dark:border-slate-800 rounded-3xl flex justify-between items-center shadow-sm">
            <div className="space-y-2 flex-1">
                <div className="h-2 w-14 bg-slate-200 dark:bg-slate-850 rounded-full" />
                <div className="h-6 w-20 bg-slate-200 dark:bg-slate-850 rounded-xl" />
            </div>
            <div className="w-11 h-11 bg-slate-200 dark:bg-slate-850 rounded-2xl animate-pulse" />
        </div>
    );
}
