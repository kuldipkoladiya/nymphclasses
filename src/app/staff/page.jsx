"use client";

import { useEffect, useState } from "react";
import axios from "../../utils/axios";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
    MdPersonAdd,
    MdEdit,
    MdDelete,
    MdSecurity,
    MdDashboard,
    MdPeople,
    MdSchool,
    MdMoney,
    MdList,
    MdClose
} from "react-icons/md";

const permissionsList = [
    { key: "dashboard", label: "Dashboard", icon: MdDashboard, desc: "Access standard dashboard analytics" },
    { key: "students", label: "Student Roster", icon: MdPeople, desc: "Add, edit, or remove student profiles" },
    { key: "results", label: "Results", icon: MdSchool, desc: "Manage marks and publish WhatsApp results" },
    { key: "fees", label: "Fee Config", icon: MdMoney, desc: "Set yearly fees and record payments" },
    { key: "attendance", label: "Attendance", icon: MdList, desc: "Mark daily attendance and send alerts" },
    { key: "expenses", label: "Expenses", icon: MdMoney, desc: "View, log, and analyze class expenses" }
];

export default function StaffManagement() {
    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Modal states
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState(null);

    // Form states
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [permissions, setPermissions] = useState({
        dashboard: false,
        students: false,
        results: false,
        fees: false,
        attendance: false,
        expenses: false
    });

    const fetchStaff = async () => {
        try {
            setLoading(true);
            const response = await axios.get("/auth/staff");
            setStaffList(response.data);
        } catch (error) {
            console.error("Failed to load staff accounts:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStaff();
    }, []);

    const openCreateModal = () => {
        setName("");
        setEmail("");
        setPassword("");
        setPermissions({
            dashboard: false,
            students: false,
            results: false,
            fees: false,
            attendance: false,
            expenses: false
        });
        setIsCreateOpen(true);
    };

    const openEditModal = (staff) => {
        setSelectedStaff(staff);
        setName(staff.name);
        setEmail(staff.email);
        setPassword(""); // Blank unless changing
        setPermissions(staff.permissions || {
            dashboard: false,
            students: false,
            results: false,
            fees: false,
            attendance: false,
            expenses: false
        });
        setIsEditOpen(true);
    };

    const handleCreateStaff = async (e) => {
        e.preventDefault();
        if (!name || !email || !password) {
            toast.error("Please fill in all required fields.");
            return;
        }

        try {
            const response = await axios.post("/auth/staff", {
                name,
                email,
                password,
                permissions
            });
            toast.success(response.data.message || "Staff account created successfully!");
            setIsCreateOpen(false);
            fetchStaff();
        } catch (error) {
            console.error("Create staff error:", error);
        }
    };

    const handleEditStaff = async (e) => {
        e.preventDefault();
        if (!name || !email) {
            toast.error("Name and Email are required.");
            return;
        }

        try {
            const response = await axios.put(`/auth/staff/${selectedStaff._id}`, {
                name,
                email,
                password: password || undefined, // Only send if changed
                permissions
            });
            toast.success(response.data.message || "Staff account updated successfully!");
            setIsEditOpen(false);
            fetchStaff();
        } catch (error) {
            console.error("Edit staff error:", error);
        }
    };

    const handleDeleteStaff = async (staffId) => {
        if (!confirm("Are you sure you want to delete this staff account? They will lose access immediately.")) {
            return;
        }

        try {
            const response = await axios.delete(`/auth/staff/${staffId}`);
            toast.success(response.data.message || "Staff account deleted successfully!");
            fetchStaff();
        } catch (error) {
            console.error("Delete staff error:", error);
        }
    };

    const togglePermission = (key) => {
        setPermissions(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10 max-w-[1400px] mx-auto">
            
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tightest">Staff Accounts</h1>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                        <p className="text-blue-600 dark:text-blue-400 font-black uppercase tracking-[0.2em] text-[10px]">Access Control & Roles</p>
                    </div>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-4 rounded-2xl transition-all shadow-xl shadow-blue-500/20 w-fit"
                >
                    <MdPersonAdd size={20} />
                    Add Staff Member
                </button>
            </div>

            {/* STAFF LIST */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="glass-card h-[250px] bg-white dark:bg-slate-900/40 animate-pulse rounded-3xl" />
                    ))}
                </div>
            ) : staffList.length === 0 ? (
                <div className="glass-card p-12 bg-white dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/50 flex flex-col items-center justify-center text-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                        <MdSecurity size={32} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">No Staff Accounts</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">You haven&apos;t created any staff accounts yet. Create one to delegate access.</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {staffList.map((staff) => (
                        <div
                            key={staff._id}
                            className="glass-card bg-white dark:bg-slate-900/40 border border-white/20 dark:border-white/5 shadow-xl hover:shadow-2xl transition-all duration-300 p-8 flex flex-col justify-between group rounded-3xl relative overflow-hidden"
                        >
                            {/* Card Header info */}
                            <div>
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-lg">
                                            {staff.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 dark:text-white text-base leading-snug">{staff.name}</h3>
                                            <p className="text-slate-400 dark:text-slate-500 text-xs mt-0.5 font-medium">{staff.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => openEditModal(staff)}
                                            className="p-2 rounded-xl bg-slate-50 hover:bg-blue-600/10 dark:bg-slate-800/50 dark:hover:bg-blue-600/20 text-slate-500 hover:text-blue-600 transition-all"
                                            title="Edit Permissions"
                                        >
                                            <MdEdit size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteStaff(staff._id)}
                                            className="p-2 rounded-xl bg-slate-50 hover:bg-rose-600/10 dark:bg-slate-800/50 dark:hover:bg-rose-600/20 text-slate-500 hover:text-rose-600 transition-all"
                                            title="Delete Staff"
                                        >
                                            <MdDelete size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div className="border-t border-slate-100 dark:border-slate-800/80 my-6"></div>

                                {/* Permissions List */}
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Active Permissions</p>
                                    <div className="flex flex-wrap gap-2">
                                        {permissionsList.map((p) => {
                                            const active = staff.permissions?.[p.key] === true;
                                            return (
                                                <span
                                                    key={p.key}
                                                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all duration-300 border ${
                                                        active
                                                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                                                            : "bg-slate-50/50 border-slate-200/40 dark:bg-slate-800/30 dark:border-slate-800/60 text-slate-400 dark:text-slate-600"
                                                    }`}
                                                >
                                                    {p.label}
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* CREATE STAFF MODAL */}
            <AnimatePresence>
                {isCreateOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsCreateOpen(false)}
                            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl relative z-10 overflow-hidden"
                        >
                            <div className="p-6 md:p-8 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Create Staff Account</h2>
                                    <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">Register a new staff member and assign accesses.</p>
                                </div>
                                <button
                                    onClick={() => setIsCreateOpen(false)}
                                    className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-all"
                                >
                                    <MdClose size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleCreateStaff} className="p-6 md:p-8 space-y-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Full Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Enter staff name"
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:border-blue-600 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Email Address</label>
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="Enter staff email"
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:border-blue-600 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Login Password</label>
                                        <input
                                            type="password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Set secure password"
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:border-blue-600 transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Module Permissions</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        {permissionsList.map((p) => {
                                            const active = permissions[p.key];
                                            const Icon = p.icon;
                                            return (
                                                <button
                                                    type="button"
                                                    key={p.key}
                                                    onClick={() => togglePermission(p.key)}
                                                    className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                                                        active
                                                            ? "border-blue-600/30 bg-blue-600/5 text-blue-600 dark:text-blue-400"
                                                            : "border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10 text-slate-500 dark:text-slate-400"
                                                    }`}
                                                >
                                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${active ? "bg-blue-600 text-white" : "bg-slate-200/50 dark:bg-slate-800 text-slate-500"}`}>
                                                        <Icon size={16} />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold leading-tight">{p.label}</p>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <button
                                        type="button"
                                        onClick={() => setIsCreateOpen(false)}
                                        className="flex-1 px-6 py-3.5 rounded-xl border border-slate-200 dark:border-slate-800 font-bold text-xs uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all"
                                    >
                                        Create Account
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* EDIT STAFF MODAL */}
            <AnimatePresence>
                {isEditOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsEditOpen(false)}
                            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl relative z-10 overflow-hidden"
                        >
                            <div className="p-6 md:p-8 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Modify Staff Profile</h2>
                                    <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">Update profile details and access rules.</p>
                                </div>
                                <button
                                    onClick={() => setIsEditOpen(false)}
                                    className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-all"
                                >
                                    <MdClose size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleEditStaff} className="p-6 md:p-8 space-y-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Full Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Enter staff name"
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:border-blue-600 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Email Address</label>
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="Enter staff email"
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:border-blue-600 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Change Password (Optional)</label>
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Leave blank to keep current"
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:outline-none focus:border-blue-600 transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Module Permissions</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        {permissionsList.map((p) => {
                                            const active = permissions[p.key];
                                            const Icon = p.icon;
                                            return (
                                                <button
                                                    type="button"
                                                    key={p.key}
                                                    onClick={() => togglePermission(p.key)}
                                                    className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                                                        active
                                                            ? "border-blue-600/30 bg-blue-600/5 text-blue-600 dark:text-blue-400"
                                                            : "border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10 text-slate-500 dark:text-slate-400"
                                                    }`}
                                                >
                                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${active ? "bg-blue-600 text-white" : "bg-slate-200/50 dark:bg-slate-800 text-slate-500"}`}>
                                                        <Icon size={16} />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold leading-tight">{p.label}</p>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditOpen(false)}
                                        className="flex-1 px-6 py-3.5 rounded-xl border border-slate-200 dark:border-slate-800 font-bold text-xs uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
