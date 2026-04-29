"use client";

import Link from "next/link";
import Image from "next/image";
import Logo from "../assets/logo.png";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { 
    MdArrowForward, 
    MdAutoGraph, 
    MdSecurity, 
    MdSpeed, 
    MdGroups, 
    MdCheckCircle,
    MdAssuredWorkload,
    MdLogin
} from "react-icons/md";

const FeatureCard = ({ icon: Icon, title, description, delay }) => {
    const cardRef = useRef(null);
    const [rotateX, setRotateX] = useState(0);
    const [rotateY, setRotateY] = useState(0);

    const handleMouseMove = (e) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        
        setRotateY((mouseX - centerX) / 20);
        setRotateX((centerY - mouseY) / 20);
    };

    const handleMouseLeave = () => {
        setRotateX(0);
        setRotateY(0);
    };

    return (
        <motion.div
            ref={cardRef}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay, duration: 0.8, type: 'spring' }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ 
                perspective: 1000,
                rotateX,
                rotateY,
                transformStyle: "preserve-3d"
            }}
            className="glass-card p-8 group relative overflow-hidden border border-white/10 dark:border-white/5 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl"
        >
            <div style={{ transform: "translateZ(50px)" }} className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/20 flex items-center justify-center mb-6 group-hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all duration-500">
                    <Icon size={28} className="text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">
                    {title}
                </h3>
                <p className="text-gray-600 dark:text-slate-400 leading-relaxed text-sm font-medium">
                    {description}
                </p>
            </div>
            
            {/* Decorative background element */}
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-indigo-600/5 blur-3xl rounded-full group-hover:bg-indigo-600/10 transition-colors"></div>
        </motion.div>
    );
};

export default function LandingPage() {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll();
    const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -50]);

    return (
        <div ref={containerRef} className="min-h-screen selection:bg-indigo-500/30 font-sans overflow-hidden relative bg-[#fdfdff] dark:bg-[#030712]">
            
            {/* AMBIENT BACKGROUND ELEMENTS */}
            <div className="fixed top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-500/10 dark:bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none"></div>
            <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 dark:bg-purple-600/5 blur-[120px] rounded-full pointer-events-none"></div>

            {/* GRID OVERLAY */}
            <div className="fixed inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] dark:opacity-[0.05] pointer-events-none"></div>

            {/* NAVBAR */}
            <nav className="fixed top-0 left-0 right-0 z-50 px-4 md:px-6 py-6">
                <div className="max-w-7xl mx-auto flex items-center justify-between bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl px-6 py-4 rounded-3xl border border-white/20 dark:border-white/5 shadow-2xl">
                    <div className="flex items-center gap-3 group cursor-pointer">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                            <Image src={Logo} alt="Logo" width={24} height={24} className="invert brightness-0" priority />
                        </div>
                        <span className="text-xl font-bold tracking-tighter text-gray-900 dark:text-white">
                            Nymph<span className="text-indigo-600">Classes</span>
                        </span>
                    </div>
                    
                    <div className="hidden md:flex items-center gap-8">
                        {["Features", "Dashboard"].map((item) => (
                            <a key={item} href={item === "Dashboard" ? "/dashboard" : `#${item.toLowerCase()}`} className="text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-white transition-colors uppercase tracking-widest">
                                {item}
                            </a>
                        ))}
                    </div>

                    <Link href="/login">
                        <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-6 py-2.5 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold text-sm shadow-xl flex items-center gap-2"
                        >
                            <MdLogin size={18} /> Admin Access
                        </motion.button>
                    </Link>
                </div>
            </nav>

            <main className="relative z-10">
                
                {/* HERO SECTION */}
                <motion.section style={{ y: heroY }} className="max-w-7xl mx-auto px-6 pt-40 pb-20 md:pt-56 md:pb-32 flex flex-col items-center text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, type: 'spring' }}
                        className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-indigo-600 dark:text-indigo-400 font-bold text-xs mb-10 tracking-[0.2em] uppercase"
                    >
                        <span className="relative flex h-2 w-2 mr-1">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                        </span>
                        Enterprise School Engine V2.0
                    </motion.div>

                    <motion.h1 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                        className="text-6xl md:text-8xl lg:text-9xl font-black text-gray-900 dark:text-white tracking-tightest leading-[0.9] max-w-6xl"
                    >
                        Precision <br className="hidden md:block"/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 animate-gradient-x">
                            Management.
                        </span>
                    </motion.h1>

                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="mt-10 text-lg md:text-2xl text-gray-500 dark:text-slate-400 max-w-3xl font-medium leading-relaxed"
                    >
                        A high-velocity administrative dashboard built for clarity, speed, and precision record-keeping.
                    </motion.p>

                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="mt-14 flex flex-col sm:flex-row items-center gap-5"
                    >
                        <Link href="/login">
                            <button className="px-10 py-5 rounded-3xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xl shadow-2xl shadow-indigo-500/40 hover:-translate-y-1.5 transition-all flex items-center gap-3 group">
                                Open Workspace 
                                <MdArrowForward className="group-hover:translate-x-2 transition-transform duration-300" />
                            </button>
                        </Link>
                        <a href="#features" className="px-10 py-5 rounded-3xl bg-white dark:bg-slate-900 text-gray-900 dark:text-white font-bold text-xl hover:border-indigo-500 transition-all border border-gray-200 dark:border-white/10 shadow-sm">
                            System Features
                        </a>
                    </motion.div>
                </motion.section>

                {/* 3D FLOATING ELEMENTS (Optional decorative) */}
                <div className="absolute top-1/2 left-0 w-full h-full pointer-events-none overflow-hidden hidden lg:block">
                     <motion.div 
                        animate={{ y: [0, -30, 0], rotate: [0, 10, 0] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-20 left-20 w-40 h-40 bg-indigo-500/5 border border-indigo-500/10 rounded-[40px] backdrop-blur-3xl"
                     />
                     <motion.div 
                        animate={{ y: [0, 40, 0], rotate: [0, -15, 0] }}
                        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-80 right-40 w-32 h-32 bg-purple-500/5 border border-purple-500/10 rounded-full backdrop-blur-3xl"
                     />
                </div>

                {/* FEATURE SHOWCASE */}
                <section id="features" className="max-w-7xl mx-auto px-6 py-24 md:py-40">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
                        <div className="max-w-2xl">
                            <h2 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white tracking-tighter mb-6">
                                Integrated <span className="text-indigo-600">Core Modules.</span>
                            </h2>
                            <p className="text-lg md:text-xl text-gray-500 dark:text-slate-400 font-medium leading-relaxed">
                                Experience a unified architecture designed to eliminate friction in academic administration.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <FeatureCard 
                            icon={MdAutoGraph}
                            title="Analytics Dashboard"
                            description="Real-time data visualization of attendance trends, fee collections, and student performance metrics."
                            delay={0.1}
                        />
                        <FeatureCard 
                            icon={MdSecurity}
                            title="Secure Access"
                            description="Role-based authentication ensures administrative data remains private and protected at all times."
                            delay={0.2}
                        />
                        <FeatureCard 
                            icon={MdSpeed}
                            title="Rapid Engine"
                            description="Built with Next.js 14 and optimized backend queries for sub-second response times across the app."
                            delay={0.3}
                        />
                        <FeatureCard 
                            icon={MdGroups}
                            title="Student Roster"
                            description="Efficiently manage thousands of records with advanced filtering, searching, and batch operations."
                            delay={0.4}
                        />
                        <FeatureCard 
                            icon={MdCheckCircle}
                            title="Smart Attendance"
                            description="One-tap attendance marking with historical tracking and automated summary generation."
                            delay={0.5}
                        />
                        <FeatureCard 
                            icon={MdAssuredWorkload}
                            title="Fee Management"
                            description="Streamlined payment tracking, standard-wise billing, and automated balance calculations."
                            delay={0.6}
                        />
                    </div>
                </section>
            </main>

            {/* FOOTER */}
            <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-gray-100 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                <p className="text-gray-400 dark:text-slate-500 font-medium text-sm italic">
                    Designed for high-performance academic management.
                </p>
                <div className="flex gap-8">
                    <span className="text-gray-400 dark:text-slate-500 font-bold text-xs uppercase tracking-widest">Privacy</span>
                    <span className="text-gray-400 dark:text-slate-500 font-bold text-xs uppercase tracking-widest">Security</span>
                    <span className="text-gray-400 dark:text-slate-500 font-bold text-xs uppercase tracking-widest">v2.0.4</span>
                </div>
            </footer>
        </div>
    );
}

