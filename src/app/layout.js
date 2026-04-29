"use client";

import "./globals.css";
import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { Toaster } from "react-hot-toast";
import { usePathname } from "next/navigation";

export default function RootLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const pathname = usePathname();

    // Define routes that shouldn't have the dashboard shell 
    const isPublicRoute = pathname === "/" || pathname === "/login";

    return (
        <html lang="en">
        <body className="min-h-screen flex text-gray-800 transition-colors duration-300 relative">
            <Toaster position="top-center" />
            
            {/* AMBIENT BACKGROUND */}
            <div className="purple-blobs-bg" />
            
            {isPublicRoute ? (
                <div className="flex-1 w-full flex flex-col min-h-screen">
                    {children}
                </div>
            ) : (
                <>
                    <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                    <div className="flex-1 md:ml-[280px] flex flex-col min-h-screen w-full transition-all duration-300">
                        <Navbar setSidebarOpen={setSidebarOpen} />
                        <main className="flex-1 pt-24 px-4 md:px-8 pb-8 w-full max-w-7xl mx-auto">
                            {children}
                        </main>
                    </div>
                </>
            )}
        </body>
        </html>
    );
}
