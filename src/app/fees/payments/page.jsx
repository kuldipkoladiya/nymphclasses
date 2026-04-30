"use client";

import { useState, useEffect, useRef } from "react";
import axios from "@/utils/axios";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
    MdArrowBack, MdPayments, MdHistory, MdDelete, 
    MdCheckCircle, MdReceipt, MdSearch, MdPerson, 
    MdPrint, MdDownload, MdClose, MdSchool, MdWarning
} from "react-icons/md";
import toast from "react-hot-toast";
import Popup from "@/components/Popup";
import { useReactToPrint } from "react-to-print";

/* =====================
   PRINTABLE RECEIPT
   ===================== */
const PrintableReceipt = ({ student, payment, status }) => {
    return (
        <div className="p-10 bg-white text-slate-900 font-serif w-[800px] mx-auto border-8 border-double border-slate-200">
            {/* HEADER */}
            <div className="text-center border-b-2 border-slate-900 pb-6 mb-6">
                <h1 className="text-4xl font-black uppercase tracking-tighter text-blue-600">Nymph Classes</h1>
                <p className="text-xs font-bold uppercase tracking-widest mt-1">Excellence in Education & Career Building</p>
                <div className="mt-4 flex justify-between items-end text-[10px] font-bold uppercase">
                    <p>Address: Near City Center, Main Road</p>
                    <p>Contact: +91 98765 43210</p>
                </div>
            </div>

            {/* INFO GRID */}
            <div className="grid grid-cols-2 gap-8 mb-8">
                <div className="space-y-2">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Student Details</p>
                    <p className="text-xl font-black uppercase">{student?.name}</p>
                    <p className="text-sm font-bold">Standard: {student?.standard} | Roll: {student?.rollNumber}</p>
                </div>
                <div className="text-right space-y-2">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Receipt Details</p>
                    <p className="text-lg font-black uppercase">#{payment?.receiptNo}</p>
                    <p className="text-sm font-bold">Date: {new Date(payment?.createdAt || Date.now()).toLocaleDateString()}</p>
                </div>
            </div>

            {/* TABLE */}
            <div className="border-t-2 border-b-2 border-slate-900 py-6 mb-8">
                <table className="w-full">
                    <thead>
                        <tr className="text-[10px] font-black uppercase border-b border-slate-200">
                            <th className="text-left pb-2">Description</th>
                            <th className="text-center pb-2">Mode</th>
                            <th className="text-right pb-2">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="text-sm">
                            <td className="py-4 font-bold">Academic Tuition Fee Installment</td>
                            <td className="text-center py-4">{payment?.paymentMode}</td>
                            <td className="text-right py-4 font-black">₹{payment?.amount?.toLocaleString()}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* SUMMARY */}
            <div className="flex justify-end mb-10">
                <div className="w-64 space-y-2">
                    <div className="flex justify-between text-xs">
                        <span className="font-bold">Total Commitment:</span>
                        <span>₹{status?.totalYearlyFee?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="font-bold">Amount Paid (Till Date):</span>
                        <span>₹{status?.totalPaid?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-lg font-black border-t-2 border-slate-900 pt-2 mt-2">
                        <span>Due Balance:</span>
                        <span className="text-rose-600">₹{status?.remaining?.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {/* FOOTER */}
            <div className="flex justify-between items-end mt-20">
                <div className="text-[9px] italic text-slate-400 max-w-[300px]">
                    Note: This is a computer-generated receipt and does not require a physical signature. Fees once paid are non-refundable.
                </div>
                <div className="text-center">
                    <div className="w-40 h-[1px] bg-slate-900 mb-2"></div>
                    <p className="text-[10px] font-black uppercase">Authorized Signatory</p>
                </div>
            </div>
        </div>
    );
};

export default function FeePaymentsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialId = searchParams.get("id");

    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [showResults, setShowResults] = useState(false);

    const [status, setStatus] = useState(null);
    const [selectedStudent, setSelectedStudent] = useState(null);

    const [amount, setAmount] = useState("");
    const [mode, setMode] = useState("Cash");
    const [note, setNote] = useState("");

    const [loadingSearch, setLoadingSearch] = useState(false);
    const [loadingStatus, setLoadingStatus] = useState(false);
    const [paying, setPaying] = useState(false);
    const [popup, setPopup] = useState(null);
    const [actionId, setActionId] = useState(null);

    const [receiptData, setReceiptData] = useState(null);
    const [receiptPdfUrl, setReceiptPdfUrl] = useState(null);
    const [downloading, setDownloading] = useState(false);
    const printRef = useRef();

    useEffect(() => {
        if (initialId) {
            loadStatus(initialId);
        }
    }, [initialId]);

    const handleSearch = async (val) => {
        setSearchQuery(val);
        if (val.length < 2) {
            setSearchResults([]);
            return;
        }
        setLoadingSearch(true);
        try {
            const res = await axios.get(`/students?search=${val}`);
            setSearchResults(res.data || []);
            setShowResults(true);
        } catch {
            setSearchResults([]);
        } finally {
            setLoadingSearch(false);
        }
    };

    const loadStatus = async (id) => {
        setLoadingStatus(true);
        setShowResults(false);
        try {
            const res = await axios.get(`/fees/status/${id}`);
            setStatus(res.data);
            setSelectedStudent(res.data.student);
            setSearchQuery(res.data.student.name);
        } catch {
            setStatus(null);
            setSelectedStudent(null);
            toast.error("Student fees profile not found.");
        } finally {
            setLoadingStatus(false);
        }
    };

    const payFee = async () => {
        if (!selectedStudent || !amount) return toast.error("Amount is required.");
        setPaying(true);
        try {
            const res = await axios.post("/fees/pay", {
                studentId: selectedStudent._id,
                amount,
                paymentMode: mode,
                note,
            });
            toast.success("Payment recorded!");
            setReceiptData(res.data.payment);
            setReceiptPdfUrl(res.data.receiptPdf);
            setAmount("");
            setNote("");
            loadStatus(selectedStudent._id);
        } catch {
            toast.error("Payment failed.");
        } finally {
            setPaying(false);
        }
    };

    const deletePayment = async () => {
        try {
            await axios.delete(`/fees/pay/${actionId}`);
            toast.success("Payment deleted.");
            loadStatus(selectedStudent._id);
        } catch {
            toast.error("Delete failed.");
        } finally {
            setPopup(null);
            setActionId(null);
        }
    };

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `Receipt_${receiptData?.receiptNo}`,
    });

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-7xl mx-auto space-y-6 pb-20 px-4 md:px-0">
            {/* HEADER */}
            <div className="glass-card p-8 flex flex-col md:flex-row justify-between items-center bg-white dark:bg-slate-900/60 border-l-[12px] border-l-blue-600">
                <div className="flex items-center gap-6">
                    <button onClick={() => router.back()} className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                        <MdArrowBack size={20} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Fee Collection</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">Record Payments & Issue Receipts</p>
                    </div>
                </div>
                {selectedStudent && (
                    <div className="hidden md:flex items-center gap-4 text-right">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Profile</p>
                            <p className="text-xl font-black text-slate-900 dark:text-white">{selectedStudent.name}</p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-blue-600/10 text-blue-600 flex items-center justify-center border border-blue-600/20">
                            <MdSchool size={24} />
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* LEFT: SEARCH & PAYMENT */}
                <div className="lg:col-span-4 space-y-6">
                    {/* SEARCH BOX */}
                    <div className="glass-card p-6 bg-white dark:bg-slate-900/60 relative">
                        <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-4">Find Student</h3>
                        <div className="relative group">
                            <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600" size={20} />
                            <input 
                                className="input-premium pl-12 py-3 text-sm" 
                                placeholder="Name or Roll Number..." 
                                value={searchQuery} 
                                onChange={(e) => handleSearch(e.target.value)}
                                onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
                            />
                            {loadingSearch && <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />}
                        </div>

                        {/* SEARCH RESULTS DROPDOWN */}
                        <AnimatePresence>
                            {showResults && searchResults.length > 0 && (
                                <motion.div 
                                    initial={{ opacity: 0, y: -10 }} 
                                    animate={{ opacity: 1, y: 0 }} 
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute left-6 right-6 top-[100%] mt-2 z-50 glass-card bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
                                >
                                    <div className="max-h-60 overflow-y-auto">
                                        {searchResults.map((s) => (
                                            <button 
                                                key={s._id} 
                                                onClick={() => loadStatus(s._id)}
                                                className="w-full p-4 flex items-center gap-4 hover:bg-blue-600/5 transition-colors border-b border-slate-50 dark:border-slate-800 last:border-none"
                                            >
                                                <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center font-black text-xs uppercase">
                                                    {s.name.substring(0, 2)}
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-sm font-black text-slate-900 dark:text-white">{s.name}</p>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase">Roll: {s.rollNumber} | Std: {s.standard}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* STATUS CARD */}
                    <AnimatePresence>
                        {status && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                                {/* QUICK STATS */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="glass-card p-5 bg-emerald-500/5 border-emerald-500/20">
                                        <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1 flex items-center gap-2"><MdCheckCircle /> Paid</p>
                                        <p className="text-2xl font-black text-emerald-600 tracking-tight">₹{status.totalPaid.toLocaleString()}</p>
                                    </div>
                                    <div className="glass-card p-5 bg-rose-500/5 border-rose-500/20">
                                        <p className="text-[9px] font-black text-rose-600 uppercase tracking-widest mb-1 flex items-center gap-2"><MdWarning /> Arrears</p>
                                        <p className="text-2xl font-black text-rose-600 tracking-tightest">₹{status.remaining.toLocaleString()}</p>
                                    </div>
                                </div>

                                {/* RECORD NEW */}
                                <div className="glass-card p-6 bg-white dark:bg-slate-900/60 border-l-4 border-l-blue-600">
                                    <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-4">Post New Entry</h3>
                                    <div className="space-y-4">
                                        <div className="relative group">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black">₹</span>
                                            <input type="number" className="input-premium pl-10" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <select className="input-premium cursor-pointer text-xs" value={mode} onChange={(e) => setMode(e.target.value)}>
                                                <option>Cash</option>
                                                <option>Online</option>
                                                <option>Cheque</option>
                                                <option>Bank Transfer</option>
                                            </select>
                                            <input className="input-premium text-xs" placeholder="Note (Ref ID, etc)" value={note} onChange={(e) => setNote(e.target.value)} />
                                        </div>
                                        <button onClick={payFee} disabled={paying} className="btn-primary w-full py-4 mt-2 shadow-blue-600/30">
                                            {paying ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><MdPayments size={20} /> Complete Payment</>}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* RIGHT: HISTORY & RECEIPT PREVIEW */}
                <div className="lg:col-span-8 space-y-6">
                    {/* SUCCESS RECEIPT PREVIEW */}
                    <AnimatePresence>
                        {receiptData && (
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="glass-card p-6 bg-emerald-600 text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12"><MdCheckCircle size={150} /></div>
                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h3 className="text-2xl font-black tracking-tight">Payment Successful!</h3>
                                            <p className="text-emerald-100 text-xs font-bold uppercase tracking-widest mt-1">Receipt #{receiptData.receiptNo} Issued</p>
                                        </div>
                                        <button onClick={() => setReceiptData(null)} className="p-2 hover:bg-white/10 rounded-lg transition-colors"><MdClose size={24} /></button>
                                    </div>
                                    <div className="flex flex-wrap gap-4">
                                        <button onClick={handlePrint} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-emerald-600 font-black text-xs uppercase tracking-widest hover:bg-emerald-50 transition-all shadow-xl">
                                            <MdPrint size={18} /> Print Receipt
                                        </button>
                                        <button 
                                            disabled={downloading}
                                            onClick={async () => {
                                                if (receiptPdfUrl) {
                                                    window.open(receiptPdfUrl, "_blank");
                                                } else if (receiptData) {
                                                    setDownloading(true);
                                                    try {
                                                        const res = await axios.get(`/fees/receipt/${receiptData._id}`);
                                                        window.open(res.data.pdfUrl, "_blank");
                                                        setReceiptPdfUrl(res.data.pdfUrl);
                                                    } catch {
                                                        toast.error("Could not generate PDF");
                                                    } finally {
                                                        setDownloading(false);
                                                    }
                                                }
                                            }}
                                            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-700/50 text-white font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all border border-emerald-500/30"
                                        >
                                            {downloading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <MdDownload size={18} />} 
                                            Download PDF
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* HISTORY TABLE */}
                    <div className="glass-card overflow-hidden bg-white dark:bg-slate-900/60 min-h-[500px]">
                        <div className="p-6 bg-slate-50/50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-3">
                                <MdHistory className="text-blue-600" /> Transaction Ledger
                            </h3>
                        </div>

                        {!status ? (
                            <div className="flex flex-col items-center justify-center py-40 text-slate-400">
                                <div className="w-20 h-20 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-6"><MdSearch size={40} className="opacity-20" /></div>
                                <p className="text-[11px] font-black uppercase tracking-[0.2em]">Search student to view financial history</p>
                            </div>
                        ) : status.paymentHistory?.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-40 text-slate-400">
                                <p className="text-[11px] font-black uppercase tracking-[0.2em]">No payments recorded yet</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-50/30 dark:bg-white/[0.01]">
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Receipt</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Mode</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                        {status.paymentHistory.slice().reverse().map((p) => (
                                            <tr key={p._id} className="hover:bg-blue-600/[0.02] transition-colors group">
                                                <td className="px-8 py-5">
                                                    <p className="text-xs font-black text-slate-700 dark:text-slate-300">{new Date(p.createdAt || p.date).toLocaleDateString()}</p>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{p.note || "Standard Installment"}</p>
                                                </td>
                                                <td className="px-8 py-5 text-center">
                                                    <span className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-black text-slate-500 uppercase tracking-widest border border-slate-200 dark:border-slate-700">#{p.receiptNo || 'N/A'}</span>
                                                </td>
                                                <td className="px-8 py-5 text-center">
                                                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${p.paymentMode === 'Cash' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>{p.paymentMode}</span>
                                                </td>
                                                <td className="px-8 py-5 text-right font-black text-slate-900 dark:text-white">₹{p.amount.toLocaleString()}</td>
                                                <td className="px-8 py-5">
                                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                        <button 
                                                            onClick={() => {
                                                                setReceiptData(p);
                                                                setReceiptPdfUrl(p.receiptPdf);
                                                            }}
                                                            className="p-2 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                                        >
                                                            <MdReceipt size={18} />
                                                        </button>
                                                        {p.receiptPdf && (
                                                            <a 
                                                                href={p.receiptPdf} 
                                                                target="_blank" 
                                                                rel="noopener noreferrer"
                                                                className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                                                            >
                                                                <MdDownload size={18} />
                                                            </a>
                                                        )}
                                                        <button 
                                                            onClick={() => {
                                                                setActionId(p._id);
                                                                setPopup({
                                                                    type: "confirm",
                                                                    title: "Remove Payment Entry",
                                                                    message: "Warning: This will void the payment and increase the student's remaining balance."
                                                                });
                                                            }}
                                                            className="p-2 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                                                        >
                                                            <MdDelete size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* HIDDEN PRINTABLE COMPONENT */}
            <div className="hidden">
                <div ref={printRef}>
                    {receiptData && (
                        <PrintableReceipt 
                            student={selectedStudent} 
                            payment={receiptData} 
                            status={status} 
                        />
                    )}
                </div>
            </div>

            {popup && <Popup open={true} {...popup} onClose={() => setPopup(null)} onConfirm={deletePayment} />}
        </motion.div>
    );
}
