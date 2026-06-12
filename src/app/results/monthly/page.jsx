"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "@/utils/axios";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import Link from "next/link";
import {
    MdArrowBack,
    MdClass,
    MdCalendarMonth,
    MdPercent,
    MdGrade,
    MdSearch,
    MdPeople,
    MdList
} from "react-icons/md";
import { FaWhatsapp } from "react-icons/fa";

export default function MonthlyReportPage() {
    const router = useRouter();

    const [standard, setStandard] = useState("");
    const [month, setMonth] = useState("");
    const [year, setYear] = useState("");
    const [reportData, setReportData] = useState([]);
    const [search, setSearch] = useState("");

    const [loading, setLoading] = useState(false);
    const [sendingWhatsAppId, setSendingWhatsAppId] = useState(null);
    const [sendingBulk, setSendingBulk] = useState(false);

    // Default to current month/year
    useEffect(() => {
        const d = new Date();
        setMonth(String(d.getMonth() + 1));
        setYear(String(d.getFullYear()));
    }, []);

    const MONTHS = [
        { value: "1", label: "January" },
        { value: "2", label: "February" },
        { value: "3", label: "March" },
        { value: "4", label: "April" },
        { value: "5", label: "May" },
        { value: "6", label: "June" },
        { value: "7", label: "July" },
        { value: "8", label: "August" },
        { value: "9", label: "September" },
        { value: "10", label: "October" },
        { value: "11", label: "November" },
        { value: "12", label: "December" }
    ];

    const YEARS = ["2025", "2026", "2027", "2028"];

    const loadReport = async () => {
        if (!standard || !month || !year) {
            return toast.error("Please select Standard, Month, and Year.");
        }
        setLoading(true);
        try {
            const res = await axios.get(
                `/results/monthly?standard=${standard}&month=${month}&year=${year}`
            );
            setReportData(res.data?.report || []);
            toast.success("Loaded monthly performance report!");
        } catch {
            toast.error("Failed to load monthly reports.");
        } finally {
            setLoading(false);
        }
    };

    const sendSingleWhatsApp = async (record) => {
        setSendingWhatsAppId(record.student._id);
        try {
            const res = await axios.post("/results/monthly/send-whatsapp", {
                studentId: record.student._id,
                month,
                year,
                totalObtained: record.totalObtained,
                totalMaximum: record.totalMaximum,
                percentage: record.percentage,
                grade: record.grade,
                examCount: record.examCount
            });
            if (res.data?.success) {
                toast.success(`Report sent to ${record.student.name}'s parent!`);
            }
        } catch (error) {
            const msg = error.response?.data?.error || "Failed to send WhatsApp.";
            toast.error(msg);
        } finally {
            setSendingWhatsAppId(null);
        }
    };

    const sendBulkWhatsApp = async () => {
        if (!reportData.length) return;
        setSendingBulk(true);
        try {
            const res = await axios.post("/results/monthly/send-whatsapp-bulk", {
                standard,
                month,
                year
            });
            if (res.data?.success) {
                const succeeded = res.data.report.filter(r => r.success).length;
                toast.success(`Successfully sent ${succeeded} / ${res.data.report.length} WhatsApp reports!`);
            }
        } catch (error) {
            const msg = error.response?.data?.error || "Failed to send bulk WhatsApp reports.";
            toast.error(msg);
        } finally {
            setSendingBulk(false);
        }
    };

    const filtered = reportData.filter((r) =>
        r.student?.name?.toLowerCase().includes(search.toLowerCase()) ||
        String(r.student?.rollNumber || "").includes(search)
    );

    const classAverage = reportData.length
        ? Number(
              (
                  reportData.reduce((acc, curr) => acc + curr.percentage, 0) /
                  reportData.length
              ).toFixed(2)
          )
        : 0;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-7xl mx-auto space-y-6 pb-20">
            {/* HEADER */}
            <div className="glass-card p-8 flex flex-col md:flex-row justify-between items-center bg-white dark:bg-slate-900/60 border-l-[12px] border-l-green-600">
                <div className="flex items-center gap-6">
                    <button onClick={() => router.back()} className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-green-600 hover:text-white transition-all shadow-sm">
                        <MdArrowBack size={20} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Monthly Performance</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">Aggregated Student Results & Alerts</p>
                    </div>
                </div>
                {reportData.length > 0 && (
                    <div className="flex items-center gap-4 mt-4 md:mt-0">
                        <button
                            onClick={sendBulkWhatsApp}
                            disabled={sendingBulk}
                            className="px-6 py-4 rounded-2xl bg-green-600 text-white font-bold text-sm uppercase tracking-widest hover:bg-green-700 transition-all flex items-center gap-3 shadow-lg shadow-green-600/20 disabled:opacity-50"
                        >
                            {sendingBulk ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <FaWhatsapp size={20} />
                            )}
                            {sendingBulk ? "SENDING BULK..." : "SEND BULK WHATSAPP"}
                        </button>
                    </div>
                )}
            </div>

            {/* SELECTION PANELS */}
            <div className="glass-card p-8 bg-white dark:bg-slate-900/60 grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                <div className="group">
                    <label className="label-premium ml-1">Standard</label>
                    <div className="relative">
                        <MdClass className="input-icon top-1/2 -translate-y-1/2" size={18} />
                        <select value={standard} onChange={(e) => setStandard(e.target.value)} className="input-premium input-with-icon appearance-none cursor-pointer">
                            <option value="">Select Standard</option>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(s => <option key={s} value={s}>Standard {s}</option>)}
                        </select>
                    </div>
                </div>

                <div className="group">
                    <label className="label-premium ml-1">Month</label>
                    <div className="relative">
                        <MdCalendarMonth className="input-icon top-1/2 -translate-y-1/2" size={18} />
                        <select value={month} onChange={(e) => setMonth(e.target.value)} className="input-premium input-with-icon appearance-none cursor-pointer">
                            {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                        </select>
                    </div>
                </div>

                <div className="group">
                    <label className="label-premium ml-1">Year</label>
                    <div className="relative">
                        <MdCalendarMonth className="input-icon top-1/2 -translate-y-1/2" size={18} />
                        <select value={year} onChange={(e) => setYear(e.target.value)} className="input-premium input-with-icon appearance-none cursor-pointer">
                            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                </div>

                <button onClick={loadReport} disabled={loading || !standard} className="btn-primary py-4 w-full">
                    {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "GENERATE REPORT"}
                </button>
            </div>

            {/* QUICK STATS */}
            {reportData.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="glass-card p-6 bg-white dark:bg-slate-900/60 border-l-4 border-l-blue-600">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Students</p>
                        <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{reportData.length}</p>
                    </div>
                    <div className="glass-card p-6 bg-white dark:bg-slate-900/60 border-l-4 border-l-green-600">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Class Average</p>
                        <p className="text-3xl font-black text-green-600 tracking-tight">{classAverage}%</p>
                    </div>
                    <div className="glass-card p-6 bg-white dark:bg-slate-900/60 border-l-4 border-l-amber-500">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Exams Conducted</p>
                        <p className="text-3xl font-black text-amber-500 tracking-tight">
                            {reportData.reduce((acc, curr) => Math.max(acc, curr.examCount), 0)}
                        </p>
                    </div>
                </div>
            )}

            {/* STUDENT MATRIX */}
            {reportData.length > 0 && (
                <div className="glass-card overflow-hidden bg-white dark:bg-slate-900/60">
                    <div className="p-6 bg-slate-50/50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
                        <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-3">
                            <MdPeople className="text-green-600" /> Monthly Report Ledger
                        </h3>
                        <div className="relative group w-full md:w-72">
                            <MdSearch className="input-icon top-1/2 -translate-y-1/2" size={18} />
                            <input
                                className="input-premium input-with-icon"
                                placeholder="Search student..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/30 dark:bg-white/[0.01]">
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">Student Info</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center border-b border-slate-100 dark:border-slate-800">Tests Written</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center border-b border-slate-100 dark:border-slate-800">Score Summary</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center border-b border-slate-100 dark:border-slate-800">Percentage</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center border-b border-slate-100 dark:border-slate-800">Grade</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right border-b border-slate-100 dark:border-slate-800">Alert Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                {filtered.map((record) => (
                                    <tr key={record.student._id} className="hover:bg-green-600/[0.01] transition-colors group">
                                        <td className="px-8 py-5">
                                            <p className="font-bold text-slate-900 dark:text-white">{record.student.name}</p>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Roll No: {record.student.rollNumber}</p>
                                        </td>
                                        <td className="px-8 py-5 text-center font-bold text-slate-700 dark:text-slate-300">{record.examCount} tests</td>
                                        <td className="px-8 py-5 text-center">
                                            <span className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-black text-slate-600 dark:text-slate-400">
                                                {record.totalObtained} / {record.totalMaximum}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-center font-black text-green-600">{record.percentage}%</td>
                                        <td className="px-8 py-5 text-center">
                                            <span className={`px-2 py-0.5 rounded-md font-black text-[9px] ${record.grade === 'N/A' ? 'bg-slate-100 text-slate-500' : 'bg-green-600/10 text-green-600'}`}>
                                                {record.grade}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                <button
                                                    onClick={() => sendSingleWhatsApp(record)}
                                                    disabled={sendingWhatsAppId === record.student._id}
                                                    className="p-2 rounded-xl bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-600 hover:text-white transition-all shadow-sm"
                                                    title="Send WhatsApp Report"
                                                >
                                                    {sendingWhatsAppId === record.student._id ? (
                                                        <div className="w-5 h-5 border-2 border-green-600/30 border-t-green-600 rounded-full animate-spin" />
                                                    ) : (
                                                        <FaWhatsapp size={18} />
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {reportData.length === 0 && !loading && (
                <div className="glass-card p-20 text-center bg-white dark:bg-slate-900/40">
                    <MdList className="mx-auto text-slate-300 mb-4" size={48} />
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Monthly Results Ledger</h3>
                    <p className="text-slate-400 mt-2 font-bold text-[10px] uppercase tracking-widest">Select a Standard & Month, then generate the report</p>
                </div>
            )}
        </motion.div>
    );
}
