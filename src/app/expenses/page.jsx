"use client";

import { useEffect, useState } from "react";
import axios from "@/utils/axios";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
    MdMoney,
    MdAdd,
    MdEdit,
    MdDelete,
    MdSearch,
    MdCalendarMonth,
    MdAttachMoney,
    MdCategory,
    MdNotes,
    MdTitle,
    MdClose,
    MdSave
} from "react-icons/md";
import Popup from "@/components/Popup";

export default function ExpensesPage() {
    const [expenses, setExpenses] = useState([]);
    const [month, setMonth] = useState("");
    const [year, setYear] = useState("");
    const [summary, setSummary] = useState([]);
    const [totalExpenses, setTotalExpenses] = useState(0);

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState("");

    // Form modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);
    const [form, setForm] = useState({
        title: "",
        category: "Maintenance",
        amount: "",
        date: "",
        notes: ""
    });

    // Delete Popup state
    const [popup, setPopup] = useState(null);
    const [deleteId, setDeleteId] = useState(null);

    const CATEGORIES = ["Rent", "Salaries", "Maintenance", "Electricity", "Internet", "Marketing", "Stationery", "Other"];

    useEffect(() => {
        const d = new Date();
        setMonth(String(d.getMonth() + 1));
        setYear(String(d.getFullYear()));
    }, []);

    useEffect(() => {
        if (month && year) {
            loadExpenses();
            loadSummary();
        }
    }, [month, year]);

    const loadExpenses = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`/expenses/all?month=${month}&year=${year}`);
            setExpenses(res.data?.expenses || []);
        } catch {
            toast.error("Failed to load expenses.");
        } finally {
            setLoading(false);
        }
    };

    const loadSummary = async () => {
        try {
            const res = await axios.get("/expenses/summary");
            setSummary(res.data?.summary || []);
            setTotalExpenses(res.data?.totalExpenses || 0);
        } catch {
            console.error("Failed to load expenses summary.");
        }
    };

    const handleOpenAdd = () => {
        setEditingExpense(null);
        setForm({
            title: "",
            category: "Maintenance",
            amount: "",
            date: new Date().toISOString().split("T")[0],
            notes: ""
        });
        setModalOpen(true);
    };

    const handleOpenEdit = (expense) => {
        setEditingExpense(expense);
        setForm({
            title: expense.title,
            category: expense.category || "Maintenance",
            amount: String(expense.amount),
            date: new Date(expense.date).toISOString().split("T")[0],
            notes: expense.notes || expense.description || ""
        });
        setModalOpen(true);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editingExpense) {
                await axios.put(`/expenses/update/${editingExpense._id}`, {
                    ...form,
                    amount: Number(form.amount)
                });
                toast.success("Expense updated successfully!");
            } else {
                await axios.post("/expenses/add", {
                    ...form,
                    amount: Number(form.amount)
                });
                toast.success("Expense added successfully!");
            }
            setModalOpen(false);
            loadExpenses();
            loadSummary();
        } catch {
            toast.error("Failed to save expense.");
        } finally {
            setSaving(false);
        }
    };

    const openDeletePopup = (id) => {
        setDeleteId(id);
        setPopup({
            type: "confirm",
            title: "Delete Expense",
            message: "Are you sure you want to delete this expense record permanently?"
        });
    };

    const confirmDelete = async () => {
        try {
            await axios.delete(`/expenses/delete/${deleteId}`);
            toast.success("Expense record deleted.");
            loadExpenses();
            loadSummary();
        } catch {
            toast.error("Delete failed.");
        } finally {
            setPopup(null);
            setDeleteId(null);
        }
    };

    const filteredExpenses = expenses.filter(
        (exp) =>
            exp.title.toLowerCase().includes(search.toLowerCase()) ||
            exp.category.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-7xl mx-auto space-y-6 pb-20 px-4 md:px-0">
            {/* HEADER */}
            <div className="glass-card p-8 flex flex-col md:flex-row justify-between items-center bg-white dark:bg-slate-900/60 border-l-[12px] border-l-rose-500">
                <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center border border-rose-500/20">
                        <MdMoney size={28} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Expenses Ledger</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">Manage & Track Business Expenditures</p>
                    </div>
                </div>
                <button onClick={handleOpenAdd} className="btn-primary mt-4 md:mt-0 bg-rose-600 hover:bg-rose-700 shadow-rose-600/15">
                    <MdAdd size={20} /> Add Expense
                </button>
            </div>

            {/* QUICK STATS & SUMMARY SUMMARY */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="glass-card p-6 bg-white dark:bg-slate-900/60 border-l-4 border-l-rose-500 flex flex-col justify-between">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Expenses (All Time)</p>
                        <p className="text-3xl font-black text-rose-500 tracking-tight">Rs. {totalExpenses.toLocaleString()}</p>
                    </div>
                </div>

                <div className="glass-card p-6 bg-white dark:bg-slate-900/60 border-l-4 border-l-blue-600 flex flex-col justify-between">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Selected Month Spending</p>
                        <p className="text-3xl font-black text-blue-600 tracking-tight">
                            Rs. {expenses.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}
                        </p>
                    </div>
                </div>

                <div className="glass-card p-6 bg-white dark:bg-slate-900/60 border-l-4 border-l-amber-500">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Top Categories</p>
                    <div className="space-y-1.5 max-h-[80px] overflow-y-auto custom-scrollbar">
                        {summary.slice(0, 3).map((item) => (
                            <div key={item._id} className="flex justify-between text-[11px] font-bold text-slate-600 dark:text-slate-400">
                                <span>{item._id}</span>
                                <span>Rs. {item.totalSpent.toLocaleString()}</span>
                            </div>
                        ))}
                        {summary.length === 0 && <p className="text-[11px] text-slate-400">No category breakdown available</p>}
                    </div>
                </div>
            </div>

            {/* CONTROLS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative group md:col-span-2">
                    <MdSearch className="input-icon top-1/2 -translate-y-1/2" size={20} />
                    <input
                        className="input-premium input-with-icon"
                        placeholder="Search by title or category..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="relative group">
                    <MdCalendarMonth className="input-icon top-1/2 -translate-y-1/2" size={20} />
                    <select
                        className="input-premium input-with-icon appearance-none cursor-pointer"
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                    >
                        {["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"].map((m) => (
                            <option key={m} value={m}>
                                {new Date(2025, parseInt(m) - 1, 1).toLocaleString("en-US", { month: "long" })}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="relative group">
                    <MdCalendarMonth className="input-icon top-1/2 -translate-y-1/2" size={20} />
                    <select
                        className="input-premium input-with-icon appearance-none cursor-pointer"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                    >
                        {["2025", "2026", "2027", "2028"].map((y) => (
                            <option key={y} value={y}>
                                {y}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* EXPENSES GRID/TABLE */}
            <div className="glass-card overflow-hidden bg-white dark:bg-slate-900/60">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-100 dark:border-slate-800">
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Expense Title</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Category</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Date</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Amount</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                            {loading ? (
                                Array.from({ length: 4 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-8 py-6"><div className="h-4 w-40 bg-slate-100 dark:bg-slate-800 rounded-lg" /></td>
                                        <td className="px-8 py-6"><div className="h-4 w-16 bg-slate-100 dark:bg-slate-800 rounded-lg mx-auto" /></td>
                                        <td className="px-8 py-6"><div className="h-4 w-16 bg-slate-100 dark:bg-slate-800 rounded-lg mx-auto" /></td>
                                        <td className="px-8 py-6"><div className="h-4 w-12 bg-slate-100 dark:bg-slate-800 rounded-lg ml-auto" /></td>
                                        <td className="px-8 py-6"><div className="h-4 w-16 bg-slate-100 dark:bg-slate-800 rounded-lg ml-auto" /></td>
                                    </tr>
                                ))
                            ) : filteredExpenses.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-8 py-20 text-center font-bold text-slate-400 uppercase tracking-widest text-xs">
                                        No expenses recorded for this month.
                                    </td>
                                </tr>
                            ) : (
                                filteredExpenses.map((exp) => (
                                    <tr key={exp._id} className="hover:bg-slate-50 dark:hover:bg-white/[0.01] transition-colors group">
                                        <td className="px-8 py-5">
                                            <p className="font-bold text-slate-900 dark:text-white">{exp.title}</p>
                                            {exp.notes && <p className="text-[9px] font-medium text-slate-400 uppercase mt-0.5">{exp.notes}</p>}
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            <span className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 font-bold text-[10px] text-slate-600 dark:text-slate-400">
                                                {exp.category}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-center font-medium text-xs text-slate-600 dark:text-slate-400">
                                            {new Date(exp.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-8 py-5 text-right font-black text-rose-600">
                                            Rs. {exp.amount.toLocaleString()}
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-all">
                                                <button
                                                    onClick={() => handleOpenEdit(exp)}
                                                    className="p-2 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                                >
                                                    <MdEdit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => openDeletePopup(exp._id)}
                                                    className="p-2 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                                                >
                                                    <MdDelete size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ADD / EDIT MODAL */}
            <AnimatePresence>
                {modalOpen && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="glass-card w-full max-w-lg bg-white dark:bg-slate-900 overflow-hidden shadow-2xl flex flex-col"
                        >
                            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                                    {editingExpense ? "Edit Expense Entry" : "Record Expense Entry"}
                                </h3>
                                <button onClick={() => setModalOpen(false)} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                    <MdClose size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleFormSubmit} className="p-6 space-y-6">
                                <div>
                                    <label className="label-premium ml-1">Expense Title</label>
                                    <div className="relative group">
                                        <MdTitle className="input-icon top-1/2 -translate-y-1/2" size={18} />
                                        <input
                                            required
                                            type="text"
                                            value={form.title}
                                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                                            placeholder="e.g. Electricity Bill"
                                            className="input-premium input-with-icon"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="label-premium ml-1">Category</label>
                                        <div className="relative group">
                                            <MdCategory className="input-icon top-1/2 -translate-y-1/2" size={18} />
                                            <select
                                                value={form.category}
                                                onChange={(e) => setForm({ ...form, category: e.target.value })}
                                                className="input-premium input-with-icon appearance-none cursor-pointer"
                                            >
                                                {CATEGORIES.map((cat) => (
                                                    <option key={cat} value={cat}>{cat}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="label-premium ml-1">Amount</label>
                                        <div className="relative group">
                                            <span className="input-icon top-1/2 -translate-y-1/2 font-black text-[10px]">Rs.</span>
                                            <input
                                                required
                                                type="number"
                                                value={form.amount}
                                                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                                                placeholder="0.00"
                                                className="input-premium input-with-icon"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="label-premium ml-1">Date</label>
                                    <div className="relative group">
                                        <MdCalendarMonth className="input-icon top-1/2 -translate-y-1/2" size={18} />
                                        <input
                                            required
                                            type="date"
                                            value={form.date}
                                            onChange={(e) => setForm({ ...form, date: e.target.value })}
                                            className="input-premium input-with-icon"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="label-premium ml-1">Notes / Description</label>
                                    <div className="relative group">
                                        <MdNotes className="input-icon top-5" size={18} />
                                        <textarea
                                            value={form.notes}
                                            onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                            rows={3}
                                            placeholder="Optional description of the expense..."
                                            className="input-premium input-with-icon resize-y min-h-[80px]"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setModalOpen(false)}
                                        className="px-5 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-xs uppercase tracking-wider hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="px-6 py-3 rounded-xl bg-rose-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-rose-700 disabled:opacity-50 transition-all flex items-center gap-2"
                                    >
                                        {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><MdSave size={16} /> Save</>}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {popup && <Popup open={true} {...popup} onClose={() => setPopup(null)} onConfirm={confirmDelete} />}
        </motion.div>
    );
}
