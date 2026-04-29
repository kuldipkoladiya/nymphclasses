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
            transition={{ delay, duration: 0.8, type: 'spring' }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ 
                perspective: 1000,
                rotateX,
                rotateY,
                transformStyle: "preserve-3d"
            }}
            className="glass-card p-10 group relative overflow-hidden border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl hover:shadow-premium transition-all duration-500"
        >
            <div style={{ transform: "translateZ(60px)" }} className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-blue-600/10 dark:bg-blue-600/20 border border-blue-600/20 flex items-center justify-center mb-8 group-hover:shadow-[0_0_25px_rgba(37,99,235,0.3)] transition-all duration-500">
                    <Icon size={32} className="text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
                    {title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                    {description}
                </p>
            </div>
            
            {/* Subtle Gradient Glow */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-600/5 blur-3xl rounded-full group-hover:bg-blue-600/10 transition-colors"></div>
        </motion.div>
    );
};

export default function LandingPage() {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll();
    const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -60]);
    const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

    return (
        <div ref={containerRef} className="min-h-screen selection:bg-blue-600/30 font-sans overflow-hidden relative">
            
            <div className="purple-blobs-bg" />

            {/* NAVBAR */}
            <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-8">
                <div className="max-w-7xl mx-auto flex items-center justify-between bg-white/80 dark:bg-slate-950/80 backdrop-blur-2xl px-8 py-5 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-premium">
                    <div className="flex items-center gap-4 group cursor-pointer">
                        <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/40 transform group-hover:rotate-6 transition-transform">
                            <Image src={Logo} alt="Logo" width={28} height={28} className="invert brightness-0" priority />
                        </div>
                        <span className="text-2xl font-black tracking-tightest text-slate-900 dark:text-white">
                            Nymph<span className="text-blue-600">Classes</span>
                        </span>
                    </div>
                    
                    <div className="hidden lg:flex items-center gap-12">
                        {["Features", "Dashboard", "Analytics"].map((item) => (
                            <a key={item} href={item === "Dashboard" ? "/dashboard" : `#${item.toLowerCase()}`} className="text-xs font-black text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-white transition-colors uppercase tracking-[0.25em]">
                                {item}
                            </a>
                        ))}
                    </div>

                    <Link href="/login">
                        <motion.button 
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-8 py-3.5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-sm shadow-2xl flex items-center gap-3"
                        >
                            <MdLogin size={20} /> Portal Login
                        </motion.button>
                    </Link>
                </div>
            </nav>

            <main className="relative z-10">
                
                {/* HERO SECTION */}
                <motion.section style={{ y: heroY }} className="max-w-7xl mx-auto px-6 pt-48 pb-24 md:pt-64 md:pb-40 flex flex-col items-center text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full border border-blue-600/20 bg-blue-600/5 text-blue-600 dark:text-blue-400 font-black text-[11px] mb-12 tracking-[0.3em] uppercase shadow-sm"
                    >
                        <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                        Next-Generation Academic OS
                    </motion.div>

                    <motion.h1 
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, cubicBezier: [0.16, 1, 0.3, 1] }}
                        className="text-7xl md:text-9xl font-black text-slate-900 dark:text-white tracking-tightest leading-[0.85] max-w-6xl mb-12"
                    >
                        Manage with <br className="hidden md:block"/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-emerald-500 to-blue-500 animate-gradient-x">
                            Total Clarity.
                        </span>
                    </motion.h1>

                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-xl md:text-3xl text-slate-500 dark:text-slate-400 max-w-4xl font-medium leading-relaxed mb-16"
                    >
                        An industrial-grade administrative ecosystem designed for high-performance student records and financial tracking.
                    </motion.p>

                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="flex flex-col sm:flex-row items-center gap-6"
                    >
                        <Link href="/login">
                            <button className="px-12 py-6 rounded-[2rem] bg-blue-600 hover:bg-blue-500 text-white font-black text-xl shadow-[0_20px_50px_rgba(37,99,235,0.3)] hover:-translate-y-2 transition-all flex items-center gap-4 group">
                                Initialize System 
                                <MdArrowForward className="group-hover:translate-x-3 transition-transform duration-500" />
                            </button>
                        </Link>
                        <a href="#features" className="px-12 py-6 rounded-[2rem] bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-black text-xl hover:border-blue-600 transition-all border border-slate-200 dark:border-slate-800 shadow-premium">
                            Explore Core
                        </a>
                    </motion.div>
                </motion.section>

                {/* FEATURE SHOWCASE */}
                <section id="features" className="max-w-7xl mx-auto px-6 py-32 md:py-48 border-t border-slate-100 dark:border-slate-900">
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-24 gap-12">
                        <div className="max-w-3xl">
                            <h2 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tightest mb-8">
                                Engineering the <br/> <span className="text-blue-600">Administrative Future.</span>
                            </h2>
                            <p className="text-xl text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                                Our integrated modules provide a seamless data flow, ensuring every record is precise and every action is immediate.
                            </p>
                        </div>
                        <div className="hidden lg:block pb-4">
                            <div className="flex gap-4">
                                <div className="w-12 h-1 bg-blue-600 rounded-full" />
                                <div className="w-4 h-1 bg-slate-200 dark:bg-slate-800 rounded-full" />
                                <div className="w-4 h-1 bg-slate-200 dark:bg-slate-800 rounded-full" />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-12">
                        <FeatureCard 
                            icon={MdAutoGraph}
                            title="Analytics Matrix"
                            description="Deep-dive into performance metrics and financial trends with our real-time visualization engine."
                            delay={0.1}
                        />
                        <FeatureCard 
                            icon={MdSecurity}
                            title="Enterprise Shield"
                            description="Military-grade session management ensuring your administrative data remains strictly confidential."
                            delay={0.2}
                        />
                        <FeatureCard 
                            icon={MdSpeed}
                            title="Instant Core"
                            description="Sub-second API response times powered by our optimized MongoDB aggregation layer."
                            delay={0.3}
                        />
                        <FeatureCard 
                            icon={MdGroups}
                            title="Roster Control"
                            description="Advanced student management with high-speed filtering and batch operational capabilities."
                            delay={0.4}
                        />
                        <FeatureCard 
                            icon={MdCheckCircle}
                            title="Smart Attendance"
                            description="Precision roll-call with automated historical tracking and identifying attendance patterns."
                            delay={0.5}
                        />
                        <FeatureCard 
                            icon={MdAssuredWorkload}
                            title="Financial Hub"
                            description="Streamlined fee processing, automated billing cycles, and precise balance reconciliations."
                            delay={0.6}
                        />
                    </div>
                </section>
            </main>

            {/* FOOTER */}
            <footer className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-100 dark:border-slate-900 flex flex-col md:flex-row justify-between items-center gap-12">
                <div className="flex items-center gap-4 opacity-50 grayscale hover:grayscale-0 transition-all cursor-crosshair">
                     <Image src={Logo} alt="Logo" width={24} height={24} className="dark:invert" />
                     <span className="font-black tracking-widest text-[10px] uppercase">Operational Excellence v2.1.0</span>
                </div>
                <div className="flex gap-12">
                    {["Protocol", "Infrastructure", "Compliance"].map(item => (
                        <span key={item} className="text-slate-400 dark:text-slate-600 font-black text-[10px] uppercase tracking-[0.3em] hover:text-blue-600 cursor-pointer transition-colors">
                            {item}
                        </span>
                    ))}
                </div>
            </footer>
        </div>
    );
}


