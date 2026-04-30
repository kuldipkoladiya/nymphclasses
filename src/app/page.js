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

        setRotateY((mouseX - centerX) / 25);
        setRotateX((centerY - mouseY) / 25);
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
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                perspective: 1000,
                rotateX,
                rotateY,
                transformStyle: "preserve-3d"
            }}
            className="glass-card p-10 group relative overflow-hidden border border-slate-200/50 dark:border-slate-800/50 bg-white dark:bg-slate-900/60 hover:shadow-xl transition-all duration-500"
        >
            <div style={{ transform: "translateZ(40px)" }} className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800/50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                    <Icon size={28} className="text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                    {title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm font-medium">
                    {description}
                </p>
            </div>
        </motion.div>
    );
};

export default function LandingPage() {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll();
    const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -40]);

    return (
        <div ref={containerRef} className="min-h-screen selection:bg-blue-600/10 font-sans overflow-hidden relative">

            <div className="purple-blobs-bg" />

            {/* NAVBAR */}
            <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-6">
                <div className="max-w-7xl mx-auto flex items-center justify-between bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl px-6 py-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-3 group cursor-pointer">
                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center shadow-sm border border-slate-200 dark:border-slate-800 transform group-hover:rotate-3 transition-transform">
                            <Image src={Logo} alt="Logo" width={24} height={24} className="object-contain" priority />
                        </div>
                        <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                            Nymph<span className="text-blue-600">Classes</span>
                        </span>
                    </div>

                    <div className="hidden md:flex items-center gap-10">
                        {["Features", "Pricing", "About"].map((item) => (
                            <a key={item} href={`#${item.toLowerCase()}`} className="text-[11px] font-bold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-white transition-colors uppercase tracking-widest">
                                {item}
                            </a>
                        ))}
                    </div>

                    <Link href="/login">
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            className="px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs shadow-lg transition-all"
                        >
                            Portal Login
                        </motion.button>
                    </Link>
                </div>
            </nav>

            <main className="relative z-10">

                {/* HERO SECTION */}
                <motion.section style={{ y: heroY }} className="max-w-7xl mx-auto px-6 pt-32 pb-20 md:pt-48 md:pb-32 flex flex-col items-center text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-600/20 bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 font-bold text-[10px] mb-10 tracking-wider uppercase"
                    >
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        Enterprise Grade Solution
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-5xl md:text-8xl font-black text-slate-900 dark:text-white tracking-tightest leading-none max-w-5xl mb-8"
                    >
                        Master Your <br className="hidden md:block" />
                        <span className="text-blue-600">Academic Workflow.</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl font-medium leading-relaxed mb-12"
                    >
                        A professional management ecosystem built for scale. Streamline student records, attendance, and finances with surgical precision.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="flex flex-col sm:flex-row items-center gap-4"
                    >
                        <Link href="/login">
                            <button className="px-10 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-xl shadow-blue-600/20 transition-all flex items-center gap-3 group">
                                Get Started
                                <MdArrowForward className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </Link>
                        <a href="#features" className="px-10 py-4 rounded-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold text-lg hover:border-blue-600/30 transition-all border border-slate-200 dark:border-slate-800">
                            Learn More
                        </a>
                    </motion.div>
                </motion.section>

                {/* FEATURE SHOWCASE */}
                <section id="features" className="max-w-7xl mx-auto px-6 py-24 md:py-32 border-t border-slate-100 dark:border-slate-900">
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-8">
                        <div className="max-w-2xl text-center lg:text-left mx-auto lg:mx-0">
                            <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tightest mb-6 leading-tight">
                                Built for the <br /> <span className="text-blue-600">Modern Classroom.</span>
                            </h2>
                            <p className="text-lg text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                                Our integrated suite provides a unified command center for academic excellence. Every module is optimized for speed and clarity.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={MdAutoGraph}
                            title="Visual Analytics"
                            description="Real-time data visualization of academic performance and institutional growth metrics."
                        />
                        <FeatureCard
                            icon={MdSecurity}
                            title="Zero Trust Auth"
                            description="Industrial-grade security keeping student data protected with military precision."
                        />
                        <FeatureCard
                            icon={MdSpeed}
                            title="High Velocity"
                            description="Optimized architecture ensuring sub-millisecond response times across the entire platform."
                        />
                        <FeatureCard
                            icon={MdGroups}
                            title="Roster Control"
                            description="Comprehensive student lifecycle management with advanced filtering and batch operations."
                        />
                        <FeatureCard
                            icon={MdCheckCircle}
                            title="Smart Records"
                            description="Automated record keeping for attendance and academic milestones with cloud sync."
                        />
                        <FeatureCard
                            icon={MdAssuredWorkload}
                            title="Financial Core"
                            description="Robust fee management and financial tracking with automated reconciliation."
                        />
                    </div>
                </section>
            </main>

            {/* FOOTER */}
            <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-slate-100 dark:border-slate-900 flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="flex items-center gap-4 transition-all">
                    <Image src={Logo} alt="Logo" width={24} height={24} className="object-contain" />
                    <span className="font-black tracking-widest text-[10px] uppercase text-slate-400 dark:text-slate-600">Nymph Classes © 2024</span>
                </div>
                <div className="flex gap-8 md:gap-12">
                    {["Protocol", "Privacy", "Terms"].map(item => (
                        <span key={item} className="text-slate-400 dark:text-slate-600 font-black text-[10px] uppercase tracking-[0.3em] hover:text-blue-600 cursor-pointer transition-colors">
                            {item}
                        </span>
                    ))}
                </div>
            </footer>
        </div>
    );
}


