"use client";

import { MdMenu } from "react-icons/md";

export default function Navbar({ setSidebarOpen }) {
    return (
        <header
            className="
        fixed top-0 left-0 md:left-64 right-0
        h-16 z-30
        bg-white dark:bg-slate-900
        border-b border-gray-200 dark:border-slate-700
        flex items-center px-6
      "
        >
            {/* MOBILE MENU BUTTON */}
            <button
                className="md:hidden text-gray-700 dark:text-gray-200 mr-4"
                onClick={() => setSidebarOpen(true)}
            >
                <MdMenu size={26} />
            </button>
        </header>
    );
}
