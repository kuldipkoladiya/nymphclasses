"use client";

import { useState } from "react";
import axios from "@/utils/axios";

export default function AttendanceFilter() {
    const [date, setDate] = useState("");
    const [standard, setStandard] = useState("");
    const [data, setData] = useState([]);

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
    const authHeader = { headers: { Authorization: `Bearer ${token}` } };

    const fetchData = async () => {
        if (!date || !standard) return alert("Select filters!");

        const res = await axios.get(
            `/attendance/filter?date=${date}&standard=${standard}`,
            authHeader
        );
        setData(res.data || []);
    };

    return (
        <div className="pt-24 text-white">
            <h1 className="text-3xl font-bold mb-6">Filter Attendance</h1>

            <div className="glass-light p-5 rounded-xl flex gap-4 flex-wrap mb-6">
                <input
                    type="date"
                    className="glass-light p-2 rounded-xl text-black bg-white/80"
                    onChange={(e) => setDate(e.target.value)}
                />

                <select
                    className="glass-light p-2 rounded-xl text-black bg-white/80"
                    onChange={(e) => setStandard(e.target.value)}
                >
                    <option value="">Standard</option>
                    {["1","2","3","4","5","6","7","8","9","10"].map((s) => (
                        <option key={s}>{s}</option>
                    ))}
                </select>

                <button
                    onClick={fetchData}
                    className="bg-purple-600 px-4 py-2 rounded-xl"
                >
                    Search
                </button>
            </div>

            {/* Results */}
            {data.length > 0 ? (
                <div className="glass p-5 rounded-xl">
                    {data.map((item) => (
                        <div
                            key={item._id}
                            className="border-b border-white/20 py-3 flex justify-between"
                        >
                            <span>{item.student?.name}</span>
                            <span className="font-bold text-yellow-300">
                                {item.status}
                            </span>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="opacity-70">No records.</p>
            )}
        </div>
    );
}
