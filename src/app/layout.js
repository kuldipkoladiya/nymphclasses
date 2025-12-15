"use client";

import "./globals.css";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";

export default function RootLayout({ children }) {

    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <html lang="en">
        <body className="purple-soft-bg purple-blobs min-h-screen flex">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <div className="flex-1 md:ml-64">
            <Navbar setSidebarOpen={setSidebarOpen} />
            <main className="pt-20 px-4 md:px-10">{children}</main>
        </div>
        </body>
        </html>
    );
}
