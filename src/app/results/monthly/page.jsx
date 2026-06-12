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
    MdList,
    MdClose,
    MdPrint,
    MdInfo,
    MdDownload
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
    const [downloadingPdf, setDownloadingPdf] = useState(false);

    // Detailed Modal state
    const [selectedReport, setSelectedReport] = useState(null);

    const downloadMonthlyPdf = async (record) => {
        setDownloadingPdf(true);
        try {
            const res = await axios.get(
                `/results/monthly/pdf/${record.student._id}/${month}/${year}`,
                { responseType: "blob" }
            );
            const url = window.URL.createObjectURL(res.data);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${record.student.name}_Monthly_Report_${month}_${year}.pdf`;
            a.click();
            window.URL.revokeObjectURL(url);
            toast.success("Downloading PDF scorecard...");
        } catch (error) {
            console.error("PDF download error:", error);
            toast.error("Failed to download PDF scorecard.");
        } finally {
            setDownloadingPdf(false);
        }
    };

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
        <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-7xl mx-auto space-y-6 pb-20 print:hidden">
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
                                        <tr key={record.student._id} className="hover:bg-blue-600/[0.01] transition-colors group cursor-pointer">
                                            {/* Clicking student info or scores opens the modal */}
                                            <td onClick={() => setSelectedReport(record)} className="px-8 py-5">
                                                <p className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">{record.student.name}</p>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Roll No: {record.student.rollNumber}</p>
                                            </td>
                                            <td onClick={() => setSelectedReport(record)} className="px-8 py-5 text-center font-bold text-slate-700 dark:text-slate-300">{record.examCount} tests</td>
                                            <td onClick={() => setSelectedReport(record)} className="px-8 py-5 text-center">
                                                <span className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-black text-slate-600 dark:text-slate-400">
                                                    {record.totalObtained} / {record.totalMaximum}
                                                </span>
                                            </td>
                                            <td onClick={() => setSelectedReport(record)} className="px-8 py-5 text-center font-black text-green-600">{record.percentage}%</td>
                                            <td onClick={() => setSelectedReport(record)} className="px-8 py-5 text-center">
                                                <span className={`px-2 py-0.5 rounded-md font-black text-[9px] ${record.grade === 'N/A' ? 'bg-slate-100 text-slate-500' : 'bg-green-600/10 text-green-600'}`}>
                                                    {record.grade}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedReport(record);
                                                        }}
                                                        className="p-2 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                                        title="View Details"
                                                    >
                                                        <MdInfo size={18} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            sendSingleWhatsApp(record);
                                                        }}
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

            {/* SCREEN-ONLY DETAILED MODAL */}
            <AnimatePresence>
                {selectedReport && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="glass-card w-full max-w-3xl bg-white dark:bg-slate-900 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
                        >
                            {/* Modal Header */}
                            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white">{selectedReport.student.name}</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                        Roll No: {selectedReport.student.rollNumber} | Std: {standard}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSelectedReport(null)}
                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 dark:text-slate-500 transition-colors"
                                >
                                    <MdClose size={24} />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
                                {/* Summary Card */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-800/20">
                                        <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1">Percentage</p>
                                        <p className="text-xl font-black text-blue-600">{selectedReport.percentage}%</p>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-800/20">
                                        <p className="text-[9px] font-black text-green-600 uppercase tracking-widest mb-1">Grade</p>
                                        <p className="text-xl font-black text-green-600">{selectedReport.grade}</p>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-800/20">
                                        <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest mb-1">Total Marks</p>
                                        <p className="text-xl font-black text-amber-600">{selectedReport.totalObtained}/{selectedReport.totalMaximum}</p>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-800/20">
                                        <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest mb-1">Tests Taken</p>
                                        <p className="text-xl font-black text-indigo-600">{selectedReport.examCount}</p>
                                    </div>
                                </div>

                                {/* Exam List */}
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Exam Breakdown</h4>
                                    {selectedReport.results.map((r) => (
                                        <div key={r._id} className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 space-y-3">
                                            <div className="flex justify-between items-center">
                                                <p className="text-xs font-black text-slate-800 dark:text-slate-200">{r.examName}</p>
                                                <span className="text-[9px] font-bold text-slate-400">{new Date(r.examDate).toLocaleDateString()}</span>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                                {r.subjects.map(s => (
                                                    <div key={s._id} className="flex justify-between items-center p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-[11px]">
                                                        <span className="font-bold text-slate-500">{s.name}</span>
                                                        <span className="font-black text-blue-600">{s.marksObtained}/{s.totalMarks}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/20">
                                <button
                                    onClick={() => setSelectedReport(null)}
                                    className="px-5 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-xs uppercase tracking-wider hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                                >
                                    Close
                                </button>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => sendSingleWhatsApp(selectedReport)}
                                        disabled={sendingWhatsAppId === selectedReport.student._id}
                                        className="px-5 py-3 rounded-xl bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 font-bold text-xs uppercase tracking-wider hover:bg-green-600 hover:text-white transition-all flex items-center gap-2 border border-green-500/10"
                                    >
                                        {sendingWhatsAppId === selectedReport.student._id ? (
                                            <div className="w-4 h-4 border-2 border-green-600/30 border-t-green-600 rounded-full animate-spin" />
                                        ) : (
                                            <FaWhatsapp size={16} />
                                        )}
                                        Send WhatsApp
                                    </button>
                                    <button
                                        onClick={() => downloadMonthlyPdf(selectedReport)}
                                        disabled={downloadingPdf}
                                        className="px-5 py-3 rounded-xl bg-blue-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-blue-700 transition-all flex items-center gap-2 shadow-md shadow-blue-600/15 disabled:opacity-50"
                                    >
                                        {downloadingPdf ? (
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <MdDownload size={16} />
                                        )}
                                        Download PDF
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* PRINT-ONLY SCORECARD (Visible only when print is triggered) */}
            {selectedReport && (
                <div className="hidden print:block p-10 bg-white text-slate-900 font-serif w-full max-w-[800px] mx-auto border-8 border-double border-slate-200">
                    <div className="text-center border-b-2 border-slate-900 pb-6 mb-6">
                        <h1 className="text-4xl font-black uppercase tracking-tighter text-blue-600">Nymph Classes</h1>
                        <p className="text-xs font-bold uppercase tracking-widest mt-1">Monthly Performance Report</p>
                        <div className="mt-4 flex justify-between items-end text-[10px] font-bold uppercase">
                            <p>Month: {MONTHS.find(m => m.value === month)?.label} {year}</p>
                            <p>Standard: Std {standard}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 mb-8 border-b pb-6">
                        <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">Student Details</p>
                            <p className="text-xl font-black uppercase">{selectedReport.student.name}</p>
                            <p className="text-sm font-bold">Roll No: {selectedReport.student.rollNumber}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-slate-400 font-bold uppercase">Monthly Summary</p>
                            <p className="text-lg font-black uppercase text-blue-600">Percentage: {selectedReport.percentage}%</p>
                            <p className="text-sm font-bold">Grade: {selectedReport.grade} | Total Tests: {selectedReport.examCount}</p>
                            <p className="text-xs font-bold text-slate-500">Cumulative Score: {selectedReport.totalObtained} / {selectedReport.totalMaximum}</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-sm font-black uppercase tracking-widest border-b pb-2">Academic Assessment Breakdown</h3>
                        {selectedReport.results.map((r) => (
                            <div key={r._id} className="pb-4 border-b last:border-none">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="text-xs font-black text-slate-800">{r.examName}</h4>
                                    <span className="text-[10px] font-bold text-slate-400">{new Date(r.examDate).toLocaleDateString()}</span>
                                </div>
                                <table className="w-full text-left text-xs">
                                    <thead>
                                        <tr className="border-b text-[9px] uppercase tracking-wider text-slate-400">
                                            <th className="pb-1">Subject</th>
                                            <th className="pb-1 text-center">Marks Obtained</th>
                                            <th className="pb-1 text-right">Max Marks</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {r.subjects.map(s => (
                                            <tr key={s._id} className="border-b border-dashed border-slate-100 last:border-none">
                                                <td className="py-1 font-bold">{s.name}</td>
                                                <td className="py-1 text-center font-bold text-blue-600">{s.marksObtained}</td>
                                                <td className="py-1 text-right">{s.totalMarks}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-between items-end mt-20">
                        <div className="text-[9px] italic text-slate-400">
                            Note: This is a computer-generated scorecard and does not require a physical signature.
                        </div>
                        <div className="text-center font-bold">
                            <div className="w-40 h-[1px] bg-slate-900 mb-2"></div>
                            <p className="text-[10px] font-black uppercase">Authorized Signatory</p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
