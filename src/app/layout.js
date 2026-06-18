"use client";

import "./globals.css";
import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import AccessDenied from "../components/AccessDenied";
import { Toaster } from "react-hot-toast";
import { usePathname } from "next/navigation";


export default function RootLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [authorized, setAuthorized] = useState(false);
    const [hasPermission, setHasPermission] = useState(true);
    const pathname = usePathname();

    // Define routes that shouldn't have the dashboard shell 
    const isPublicRoute = pathname === "/" || pathname === "/login" || pathname === "/setup";

    useEffect(() => {
        if (isPublicRoute) {
            setAuthorized(true);
            setHasPermission(true);
            return;
        }

        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const adminRaw = typeof window !== "undefined" ? localStorage.getItem("admin") : null;

        if (!token || !adminRaw) {
            window.location.href = "/login";
            return;
        }

        try {
            const admin = JSON.parse(adminRaw);
            
            // Define route permission requirements
            const routePermissions = {
                "/students": "students",
                "/results": "results",
                "/fees": "fees",
                "/attendance": "attendance",
                "/expenses": "expenses",
                "/dashboard": "dashboard",
                "/staff": "superadmin", // Staff dashboard is superadmin only
            };

            const matchedRoute = Object.keys(routePermissions).find(route => pathname.startsWith(route));
            
            if (matchedRoute) {
                const requiredPermission = routePermissions[matchedRoute];
                
                if (requiredPermission === "superadmin") {
                    if (admin.role !== "superadmin") {
                        setHasPermission(false);
                        setAuthorized(true);
                        return;
                    }
                } else {
                    if (admin.role !== "superadmin" && !admin.permissions?.[requiredPermission]) {
                        setHasPermission(false);
                        setAuthorized(true);
                        return;
                    }
                }
            }
            setHasPermission(true);
            setAuthorized(true);
        } catch (e) {
            console.error("Auth routing validation error:", e);
            window.location.href = "/login";
        }
    }, [pathname, isPublicRoute]);

    return (
        <html lang="en">
        <body className="min-h-screen flex text-slate-800 dark:text-slate-100 font-sans selection:bg-blue-500/30 overflow-x-hidden">
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
                            {authorized && (
                                hasPermission ? children : <AccessDenied moduleName={pathname} />
                            )}
                        </main>
                    </div>
                </>
            )}
        </body>
        </html>
    );
}
