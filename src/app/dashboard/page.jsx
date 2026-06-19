"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "../../utils/axios";
import { IconContext } from "react-icons";
import * as MdIcons from "react-icons/md";

const colorMap = {
    blue: {
        bg: "bg-blue-600 dark:bg-blue-500",
        borderAccent: "border-l-4 border-l-blue-600 dark:border-l-blue-500",
        lightBg: "bg-blue-50 dark:bg-blue-950/20",
        text: "text-blue-600 dark:text-blue-400",
        gradient: "from-blue-500/5 to-transparent dark:from-blue-500/10"
    },
    emerald: {
        bg: "bg-emerald-600 dark:bg-emerald-500",
        borderAccent: "border-l-4 border-l-emerald-600 dark:border-l-emerald-500",
        lightBg: "bg-emerald-50 dark:bg-emerald-950/20",
        text: "text-emerald-600 dark:text-emerald-400",
        gradient: "from-emerald-500/5 to-transparent dark:from-emerald-500/10"
    },
    amber: {
        bg: "bg-amber-600 dark:bg-amber-500",
        borderAccent: "border-l-4 border-l-amber-600 dark:border-l-amber-500",
        lightBg: "bg-amber-50 dark:bg-amber-950/20",
        text: "text-amber-600 dark:text-amber-400",
        gradient: "from-amber-500/5 to-transparent dark:from-amber-500/10"
    },
    purple: {
        bg: "bg-purple-600 dark:bg-purple-500",
        borderAccent: "border-l-4 border-l-purple-600 dark:border-l-purple-500",
        lightBg: "bg-purple-50 dark:bg-purple-950/20",
        text: "text-purple-600 dark:text-purple-400",
        gradient: "from-purple-500/5 to-transparent dark:from-purple-500/10"
    }
};

const PremiumStatCard = ({ title, value, icon: Icon, color = "blue", suffix = "", trend = "" }) => {
    const c = colorMap[color] || colorMap.blue;

    return (
        <div
            className={`glass-card p-6 bg-gradient-to-br ${c.gradient} bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 ${c.borderAccent} shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl flex justify-between items-center relative overflow-hidden`}
        >
            <div className="space-y-3 z-10">
                <div>
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{title}</p>
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">
                        {value ?? "0"}<span className="text-lg font-bold text-slate-400 dark:text-slate-500 ml-1">{suffix}</span>
                    </h3>
                </div>
                {trend && (
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${c.lightBg} ${c.text}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                        {trend}
                    </div>
                )}
            </div>
            <div className={`w-12 h-12 rounded-xl ${c.bg} text-white flex items-center justify-center flex-shrink-0 shadow-sm z-10`}>
                <Icon size={22} />
            </div>
        </div>
    );
};

export default function Dashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [main, setMain] = useState({});
    const [feesAnalytics, setFeesAnalytics] = useState({});
    const [greeting, setGreeting] = useState("Welcome");

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting("Good Morning");
        else if (hour < 17) setGreeting("Good Afternoon");
        else setGreeting("Good Evening");

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

    const maxEnrollment = main.classWise ? Math.max(...main.classWise.map(c => c.count), 1) : 1;

    return (
        <div className="space-y-8 max-w-[1400px] mx-auto pb-16 px-4 md:px-0 text-slate-800 dark:text-slate-100">
            
            {/* DYNAMIC WELCOME HERO BANNER */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-950 text-white p-8 md:p-10 shadow-xl border border-slate-200/10 dark:border-slate-800/80">
                <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-[70px] -z-10" />
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 font-semibold text-[10px] uppercase tracking-wider">
                            <MdIcons.MdFlashOn className="text-yellow-400" size={12} /> Management Portal
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black tracking-tight flex items-center gap-2">
                            {greeting}, Admin <MdIcons.MdWavingHand className="text-amber-400 text-3xl md:text-4xl inline animate-pulse" />
                        </h1>
                        <p className="text-slate-300 text-sm max-w-xl">
                            Overview and control console for Nymph Classes. Manage student records, mark daily attendance, configure fee structure, and review assessments.
                        </p>
                    </div>
                    
                    <div className="flex flex-col text-left md:text-right font-medium text-xs text-slate-400 gap-1.5 md:border-l md:border-slate-800 md:pl-8">
                        <p className="uppercase tracking-widest font-bold text-blue-400 text-[10px]">Academic Calendar</p>
                        <p className="text-white text-base font-bold tracking-tight">
                            {new Date().toLocaleDateString("en-IN", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                        <p className="text-emerald-400 font-semibold flex items-center gap-1.5 md:justify-end">
                            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" /> Connection active
                        </p>
                    </div>
                </div>
            </div>

            {/* KEY METRICS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {loading ? (
                    Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)
                ) : (
                    <>
                        <PremiumStatCard title="Total Students" value={main.totalStudents} icon={MdIcons.MdPeopleAlt} color="blue" trend="Active Profiles" />
                        <PremiumStatCard title="Present Today" value={main.presentToday} icon={MdIcons.MdCheckCircle} color="emerald" trend="Daily Attendance" />
                        <PremiumStatCard title="Collected Today" value={`${feesAnalytics.todayCollected || 0}`} icon={MdIcons.MdTrendingUp} color="amber" suffix=" INR" trend="Daily Earnings" />
                        <PremiumStatCard title="Total Collected" value={`${feesAnalytics.totalCollected || 0}`} icon={MdIcons.MdAccountBalanceWallet} color="purple" suffix=" INR" trend="Overall Fees" />
                    </>
                )}
            </div>

            {/* CORE LAYOUT */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* LEFT WORKSPACE: CLASS ENROLLMENT */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="glass-card p-6 md:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-3xl">
                        <div className="flex items-center justify-between mb-6 border-b border-slate-100 dark:border-slate-800 pb-5">
                            <div>
                                <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                                    <MdIcons.MdOutlineClass className="text-blue-500" /> Class Enrollment Details
                                </h2>
                                <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Student roster density and registration metrics</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {loading ? (
                                Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="h-20 bg-slate-100 dark:bg-white/5 rounded-2xl animate-pulse" />
                                ))
                            ) : main.classWise && main.classWise.length > 0 ? (
                                main.classWise.map((c, i) => {
                                    const percent = Math.round((c.count / maxEnrollment) * 100);
                                    return (
                                        <div key={i} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 space-y-3">
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                                                        Std {c._id}
                                                    </span>
                                                    <p className="text-xs font-bold text-slate-900 dark:text-white">Standard {c._id}</p>
                                                </div>
                                                <span className="text-xs font-black text-slate-900 dark:text-white">{c.count} Registered</span>
                                            </div>
                                            <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                                <div 
                                                    style={{ width: `${percent}%` }}
                                                    className="h-full bg-blue-600 dark:bg-blue-500 rounded-full"
                                                />
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="col-span-2 text-center py-10 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest">
                                    No enrollment data available.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    
                    <div className="glass-card p-6 md:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-3xl">
                        <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2 mb-1">
                            <MdIcons.MdFlashOn className="text-amber-500" /> Direct Actions
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-6">Instantly access specific management operations</p>
                        
                        <div className="space-y-3">
                            <button
                                onClick={() => router.push("/students")}
                                className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30 hover:bg-slate-100 dark:hover:bg-slate-800/80 flex items-center justify-between transition-all duration-200 text-slate-800 dark:text-slate-200"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                                        <MdIcons.MdPeopleAlt size={20} />
                                    </div>
                                    <div className="text-left">
                                        <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white block">Register Student</span>
                                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Add and manage student profiles</span>
                                    </div>
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Open →</span>
                            </button>

                            <button
                                onClick={() => router.push("/attendance")}
                                className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30 hover:bg-slate-100 dark:hover:bg-slate-800/80 flex items-center justify-between transition-all duration-200 text-slate-800 dark:text-slate-200"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                                        <MdIcons.MdList size={20} />
                                    </div>
                                    <div className="text-left">
                                        <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white block">Mark Attendance</span>
                                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Record daily student attendance</span>
                                    </div>
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Open →</span>
                            </button>

                            <button
                                onClick={() => router.push("/fees")}
                                className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30 hover:bg-slate-100 dark:hover:bg-slate-800/80 flex items-center justify-between transition-all duration-200 text-slate-800 dark:text-slate-200"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
                                        <MdIcons.MdMonetizationOn size={20} />
                                    </div>
                                    <div className="text-left">
                                        <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white block">Record Fees</span>
                                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Collect payments and view dues</span>
                                    </div>
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Open →</span>
                            </button>

                            <button
                                onClick={() => router.push("/results")}
                                className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30 hover:bg-slate-100 dark:hover:bg-slate-800/80 flex items-center justify-between transition-all duration-200 text-slate-800 dark:text-slate-200"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0">
                                        <MdIcons.MdSchool size={20} />
                                    </div>
                                    <div className="text-left">
                                        <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white block">Publish Results</span>
                                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Upload and share academic marks</span>
                                    </div>
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Open →</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatSkeleton() {
    return (
        <div className="glass-card p-6 h-[120px] bg-white dark:bg-slate-900 animate-pulse border border-slate-200 dark:border-slate-800 rounded-2xl flex justify-between items-center">
            <div className="space-y-3 flex-1">
                <div className="h-2 w-16 bg-slate-200 dark:bg-slate-800 rounded-full" />
                <div className="h-8 w-24 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            </div>
            <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        </div>
    );
}
