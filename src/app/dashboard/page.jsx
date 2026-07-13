"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "../../utils/axios";
import { motion, AnimatePresence } from "framer-motion";
import * as MdIcons from "react-icons/md";
import { FaGraduationCap, FaUserSlash, FaPercent } from "react-icons/fa";
import ChartComponent from "./ChartComponent";

const colorMap = {
    blue: {
        bg: "bg-blue-600 dark:bg-blue-500",
        borderAccent: "border-l-4 border-l-blue-600 dark:border-l-blue-500",
        lightBg: "bg-blue-50 dark:bg-blue-950/20",
        text: "text-blue-600 dark:text-blue-400",
        gradient: "from-blue-500/10 to-transparent"
    },
    emerald: {
        bg: "bg-emerald-600 dark:bg-emerald-500",
        borderAccent: "border-l-4 border-l-emerald-600 dark:border-l-emerald-500",
        lightBg: "bg-emerald-50 dark:bg-emerald-950/20",
        text: "text-emerald-600 dark:text-emerald-400",
        gradient: "from-emerald-500/10 to-transparent"
    },
    amber: {
        bg: "bg-amber-600 dark:bg-amber-500",
        borderAccent: "border-l-4 border-l-amber-600 dark:border-l-amber-500",
        lightBg: "bg-amber-50 dark:bg-amber-950/20",
        text: "text-amber-600 dark:text-amber-400",
        gradient: "from-amber-500/10 to-transparent"
    },
    purple: {
        bg: "bg-purple-600 dark:bg-purple-500",
        borderAccent: "border-l-4 border-l-purple-600 dark:border-l-purple-500",
        lightBg: "bg-purple-50 dark:bg-purple-950/20",
        text: "text-purple-600 dark:text-purple-400",
        gradient: "from-purple-500/10 to-transparent"
    }
};

const PremiumStatCard = ({ title, value, icon: Icon, color = "blue", suffix = "", trend = "" }) => {
    const c = colorMap[color] || colorMap.blue;

    return (
        <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={`glass-card p-6 bg-gradient-to-br ${c.gradient} bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 ${c.borderAccent} shadow-md hover:shadow-xl transition-all duration-300 rounded-2xl flex justify-between items-center relative overflow-hidden`}
        >
            <div className="space-y-3 z-10">
                <div>
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{title}</p>
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">
                        {value ?? "0"}<span className="text-sm font-bold text-slate-400 dark:text-slate-500 ml-1">{suffix}</span>
                    </h3>
                </div>
                {trend && (
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${c.lightBg} ${c.text}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {trend}
                    </div>
                )}
            </div>
            <div className={`w-12 h-12 rounded-2xl ${c.bg} text-white flex items-center justify-center flex-shrink-0 shadow-lg shadow-black/10 z-10`}>
                <Icon size={22} />
            </div>
        </motion.div>
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
                const [d1, d2] = await Promise.all([
                    axios.get("/dashboard"),
                    axios.get("/fees/analytics"),
                ]);
                setMain(d1.data);
                setFeesAnalytics(d2.data || {});
            } catch (err) {
                console.error("Dashboard error:", err);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    // Chart configs
    const barChartData = {
        labels: main.classWise ? main.classWise.map(c => `Std ${c._id}`) : [],
        datasets: [
            {
                label: "Students",
                data: main.classWise ? main.classWise.map(c => c.count) : [],
                backgroundColor: "rgba(59, 130, 246, 0.75)",
                borderColor: "rgb(59, 130, 246)",
                borderWidth: 1.5,
                borderRadius: 6,
            }
        ]
    };

    const attendanceDoughnutData = {
        labels: ["Present", "Absent"],
        datasets: [
            {
                data: [main.presentToday || 0, main.absentToday || 0],
                backgroundColor: [
                    "rgba(16, 185, 129, 0.8)",
                    "rgba(239, 68, 68, 0.8)",
                ],
                borderColor: [
                    "rgb(16, 185, 129)",
                    "rgb(239, 68, 68)",
                ],
                borderWidth: 1,
            }
        ]
    };

    return (
        <div className="space-y-8 max-w-[1450px] mx-auto pb-16 px-4 md:px-0 text-slate-800 dark:text-slate-100">
            
            {/* DYNAMIC WELCOME HERO BANNER */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-950 text-white p-8 md:p-10 shadow-xl border border-slate-200/10 dark:border-slate-800/80">
                <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-[70px] -z-10" />
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 font-semibold text-[10px] uppercase tracking-wider">
                            <MdIcons.MdFlashOn className="text-yellow-400" size={12} /> Management Portal
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black tracking-tight flex items-center gap-2">
                            {greeting}, Admin <MdIcons.MdWavingHand className="text-amber-400 text-3xl md:text-4xl inline" />
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
                        <PremiumStatCard title="Present Today" value={main.presentToday} icon={MdIcons.MdCheckCircle} color="emerald" trend={`${main.attendancePercent || 0}% present today`} />
                        <PremiumStatCard title="Collected Today" value={`${feesAnalytics.todayCollected || 0}`} icon={MdIcons.MdTrendingUp} color="amber" suffix=" INR" trend="Daily Earnings" />
                        <PremiumStatCard title="Total Collected" value={`${feesAnalytics.totalCollected || 0}`} icon={MdIcons.MdAccountBalanceWallet} color="purple" suffix=" INR" trend="Overall Fees" />
                    </>
                )}
            </div>

            {/* VISUAL DATA & METRICS ROW */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* ENROLLMENT CHART CARD */}
                <div className="lg:col-span-2 glass-card p-6 md:p-8 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-md rounded-3xl flex flex-col justify-between">
                    <div>
                        <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2 mb-1">
                            <MdIcons.MdOutlineClass className="text-blue-500" /> Class Roster Density
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-6">Student roster density across standard tiers</p>
                    </div>
                    <div className="h-64 flex items-end justify-center w-full">
                        {!loading && main.classWise && main.classWise.length > 0 ? (
                            <div className="w-full h-full relative">
                                <ChartComponent type="bar" data={barChartData} />
                            </div>
                        ) : (
                            <div className="text-slate-400 text-xs font-bold uppercase py-10">No Class Data Loaded</div>
                        )}
                    </div>
                </div>

                {/* TODAY'S ATTENDANCE SUMMARY CARD */}
                <div className="glass-card p-6 md:p-8 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-md rounded-3xl flex flex-col justify-between">
                    <div>
                        <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2 mb-1">
                            <MdIcons.MdCheckCircle className="text-emerald-500" /> Attendance Overview
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-6">Today&apos;s present vs absent tracking</p>
                    </div>
                    <div className="h-48 flex items-center justify-center relative">
                        {!loading && (main.presentToday || main.absentToday) ? (
                            <div className="w-40 h-40">
                                <ChartComponent type="doughnut" data={attendanceDoughnutData} />
                            </div>
                        ) : (
                            <div className="text-slate-400 text-xs font-bold uppercase py-10">Attendance not logged today</div>
                        )}
                    </div>
                    <div className="mt-4 flex justify-around text-center border-t border-slate-100 dark:border-slate-800/80 pt-4">
                        <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Present</span>
                            <p className="text-lg font-black text-emerald-500">{main.presentToday || 0}</p>
                        </div>
                        <div className="w-px bg-slate-200 dark:bg-slate-800" />
                        <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Absent</span>
                            <p className="text-lg font-black text-rose-500">{main.absentToday || 0}</p>
                        </div>
                    </div>
                </div>

            </div>

            {/* PERFORMANCE & QUICK ACTIONS CONTAINER */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* TOP ACADEMIC PERFORMERS */}
                <div className="lg:col-span-2 glass-card p-6 md:p-8 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-md rounded-3xl">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                                <FaGraduationCap className="text-yellow-500 text-xl" /> Top Performers
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Leading exam scorers by percentage</p>
                        </div>
                        <span className="text-[10px] font-bold px-3 py-1 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 rounded-full border border-yellow-500/20 uppercase">
                            Academic Stars
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-800 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                    <th className="py-3 px-2">Rank</th>
                                    <th className="py-3 px-2">Student Name</th>
                                    <th className="py-3 px-2">Standard</th>
                                    <th className="py-3 px-2 text-right">Percentage</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/60">
                                {!loading && main.topStudents && main.topStudents.length > 0 ? (
                                    main.topStudents.map((item, idx) => {
                                        const rankColors = ["text-yellow-500", "text-slate-400", "text-amber-600"];
                                        return (
                                            <tr key={item._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-colors">
                                                <td className="py-3.5 px-2 font-black text-sm">
                                                    <span className={idx < 3 ? rankColors[idx] : "text-slate-400"}>
                                                        #{idx + 1}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-2">
                                                    <div className="font-bold text-slate-900 dark:text-white text-sm">
                                                        {item.studentId?.name || "Unknown Student"}
                                                    </div>
                                                    <div className="text-[9px] text-slate-400 font-medium">Roll No: {item.studentId?.rollNumber || "N/A"}</div>
                                                </td>
                                                <td className="py-3.5 px-2">
                                                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                                                        Std {item.studentId?.standard || "N/A"}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-2 text-right">
                                                    <div className="font-black text-sm text-blue-600 dark:text-blue-400 flex items-center justify-end gap-1">
                                                        {item.percentage}% <FaPercent className="text-[10px]" />
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="text-center py-8 text-slate-400 text-xs font-bold uppercase tracking-widest">
                                            No assessment results published yet
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* DOCK OF SHORTCUT ACTIONS */}
                <div className="glass-card p-6 md:p-8 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-md rounded-3xl flex flex-col justify-between">
                    <div>
                        <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2 mb-1">
                            <MdIcons.MdFlashOn className="text-amber-500 animate-pulse" /> Direct Actions
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-6">Access key operations instantly</p>
                    </div>
                    
                    <div className="space-y-3.5">
                        <ActionButton 
                            title="Register Student" 
                            desc="Add and manage student profiles" 
                            color="blue" 
                            icon={MdIcons.MdPeopleAlt} 
                            onClick={() => router.push("/students")} 
                        />
                        <ActionButton 
                            title="Mark Attendance" 
                            desc="Record daily student attendance" 
                            color="emerald" 
                            icon={MdIcons.MdList} 
                            onClick={() => router.push("/attendance")} 
                        />
                        <ActionButton 
                            title="Record Fees" 
                            desc="Collect payments and view dues" 
                            color="amber" 
                            icon={MdIcons.MdMonetizationOn} 
                            onClick={() => router.push("/fees")} 
                        />
                        <ActionButton 
                            title="Publish Results" 
                            desc="Upload and share academic marks" 
                            color="purple" 
                            icon={MdIcons.MdSchool} 
                            onClick={() => router.push("/results")} 
                        />
                    </div>
                </div>

            </div>

        </div>
    );
}

function ActionButton({ title, desc, icon: Icon, color, onClick }) {
    const c = colorMap[color] || colorMap.blue;
    return (
        <motion.button
            whileHover={{ scale: 1.01, x: 3 }}
            onClick={onClick}
            className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between transition-all duration-200 text-slate-800 dark:text-slate-200"
        >
            <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl ${c.lightBg} ${c.text} flex items-center justify-center flex-shrink-0`}>
                    <Icon size={20} />
                </div>
                <div className="text-left">
                    <span className="font-bold text-sm tracking-tight text-slate-950 dark:text-white block">{title}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block mt-0.5">{desc}</span>
                </div>
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Open →</span>
        </motion.button>
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
