"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Logo from "../assets/logo.png";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
    MdArrowForward,
    MdPeopleAlt,
    MdList,
    MdMonetizationOn,
    MdSchool,
    MdCampaign,
    MdSecurity,
    MdKeyboardArrowRight,
    MdSettings,
    MdAddCircleOutline,
    MdChatBubbleOutline
} from "react-icons/md";

export default function LandingPage() {
    const mainRef = useRef(null);
    const cursorRef = useRef(null);
    const cursorTextRef = useRef(null);
    const timelineSectionRef = useRef(null);
    const timelineTrackRef = useRef(null);
    const timelineProgressRef = useRef(null);
    const [cursorHoverText, setCursorHoverText] = useState("");
    const [isHovering, setIsHovering] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined") return;
        gsap.registerPlugin(ScrollTrigger);

        const cursor = cursorRef.current;
        
        let ctx = gsap.context(() => {
            // --- 1. Custom Pointer Cursor Logic ---
            if (window.innerWidth > 768 && cursor) {
                gsap.set(cursor, { xPercent: -50, yPercent: -50, opacity: 0 });
                
                const xTo = gsap.quickTo(cursor, "x", { duration: 0.15, ease: "power2.out" });
                const yTo = gsap.quickTo(cursor, "y", { duration: 0.15, ease: "power2.out" });
                
                const onMouseMove = (e) => {
                    xTo(e.clientX);
                    yTo(e.clientY);
                    gsap.to(cursor, { opacity: 1, duration: 0.3 });
                };

                const onMouseLeaveWindow = () => {
                    gsap.to(cursor, { opacity: 0, duration: 0.3 });
                };

                window.addEventListener("mousemove", onMouseMove);
                document.addEventListener("mouseleave", onMouseLeaveWindow);

                // Attach custom hover attributes
                const hoverElements = document.querySelectorAll("[data-cursor]");
                hoverElements.forEach(el => {
                    const hoverText = el.getAttribute("data-cursor");
                    
                    const handleMouseEnter = () => {
                        setCursorHoverText(hoverText);
                        setIsHovering(true);
                        cursor.classList.add("hovering");
                        gsap.to(cursor, {
                            scale: 1,
                            duration: 0.3,
                            ease: "power2.out"
                        });
                    };

                    const handleMouseLeave = () => {
                        setIsHovering(false);
                        setCursorHoverText("");
                        cursor.classList.remove("hovering");
                        gsap.to(cursor, {
                            scale: 1,
                            duration: 0.3,
                            ease: "power2.out"
                        });
                    };

                    el.addEventListener("mouseenter", handleMouseEnter);
                    el.addEventListener("mouseleave", handleMouseLeave);
                });
            }

            // --- 2. Initial Page Entrance Timeline (3D Title Split & Fade) ---
            const entranceTl = gsap.timeline({ defaults: { ease: "power4.out" } });
            entranceTl
                .fromTo(".nav-bar", { opacity: 0, y: -30 }, { opacity: 1, y: 0, duration: 1.2 })
                .fromTo(".hero-badge", { opacity: 0, scale: 0.8, y: 20 }, { opacity: 1, scale: 1, y: 0, duration: 0.8 }, "-=0.8")
                .fromTo(".split-word", { opacity: 0, y: 40, rotateX: -45, scale: 0.9 }, { opacity: 1, y: 0, rotateX: 0, scale: 1, stagger: 0.1, duration: 1.2 }, "-=0.6")
                .fromTo(".hero-desc", { opacity: 0, y: 25 }, { opacity: 1, y: 0, duration: 1 }, "-=0.8")
                .fromTo(".hero-action-btn", { opacity: 0, y: 20 }, { opacity: 1, y: 0, stagger: 0.1, duration: 0.8 }, "-=0.8");

            // --- 3. Interactive Bento Grid Cards Mouse tracking shine & Entrance Animations ---
            const bentoCards = gsap.utils.toArray(".bento-card-glow");
            bentoCards.forEach(card => {
                const handleMouseMove = (e) => {
                    const rect = card.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    card.style.setProperty("--mouse-x", `${x}px`);
                    card.style.setProperty("--mouse-y", `${y}px`);
                };
                card.addEventListener("mousemove", handleMouseMove);
                
                // ScrollTrigger entrance for card
                gsap.fromTo(card, 
                    { opacity: 0, y: 40, scale: 0.95 },
                    {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        scrollTrigger: {
                            trigger: card,
                            start: "top 90%",
                            end: "top 70%",
                            scrub: 1
                        }
                    }
                );
            });

            // --- 4. Magnetic Header Items ---
            const magneticElements = document.querySelectorAll(".magnetic-item");
            magneticElements.forEach(el => {
                const handleMouseMove = (e) => {
                    const rect = el.getBoundingClientRect();
                    const x = e.clientX - rect.left - rect.width / 2;
                    const y = e.clientY - rect.top - rect.height / 2;
                    gsap.to(el, { x: x * 0.3, y: y * 0.3, duration: 0.2 });
                };
                const handleMouseLeave = () => {
                    gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" });
                };
                el.addEventListener("mousemove", handleMouseMove);
                el.addEventListener("mouseleave", handleMouseLeave);
            });

            // --- 5. Horizontal Scroll Timeline Section ---
            const track = timelineTrackRef.current;
            if (track) {
                const getScrollAmount = () => {
                    return track.scrollWidth - window.innerWidth;
                };

                gsap.fromTo(track, 
                    { x: 0 },
                    {
                        x: () => -getScrollAmount(),
                        ease: "none",
                        scrollTrigger: {
                            trigger: timelineSectionRef.current,
                            pin: true,
                            scrub: 1.2,
                            start: "top top",
                            end: () => `+=${getScrollAmount()}`,
                            invalidateOnRefresh: true,
                            onUpdate: (self) => {
                                // Update timeline fill bar
                                if (timelineProgressRef.current) {
                                    gsap.to(timelineProgressRef.current, {
                                        scaleX: self.progress,
                                        transformOrigin: "left center",
                                        duration: 0.1
                                    });
                                }
                            }
                        }
                    }
                );
            }
        });

        return () => {
            ctx.revert();
        };
    }, []);

    return (
        <div ref={mainRef} className="min-h-screen bg-[#fafaf9] text-slate-900 font-sans selection:bg-indigo-600/10 overflow-x-hidden relative">
            
            {/* Custom Follower Cursor */}
            <div 
                ref={cursorRef} 
                className="custom-cursor hidden md:flex items-center justify-center pointer-events-none"
            >
                {isHovering && (
                    <span ref={cursorTextRef} className="text-[10px] font-black uppercase text-white tracking-widest leading-none scale-100 transition-all duration-300">
                        {cursorHoverText}
                    </span>
                )}
            </div>

            {/* LIGHT DOT-MATRIX BACKGROUND GRID */}
            <div className="absolute inset-0 light-dot-grid pointer-events-none z-0 opacity-80" />

            {/* GENTLE PASTEL BLUR BLOBS */}
            <div className="absolute top-[8%] left-[5%] w-[450px] h-[450px] rounded-full bg-gradient-to-tr from-indigo-500/5 to-purple-500/5 blur-[100px] pointer-events-none" />
            <div className="absolute top-[45%] right-[10%] w-[550px] h-[550px] rounded-full bg-gradient-to-br from-blue-500/5 to-emerald-500/5 blur-[120px] pointer-events-none" />

            {/* FLOATING GLASS NAV BAR */}
            <nav className="nav-bar fixed top-0 left-0 right-0 z-50 px-4 py-4 md:py-6">
                <div className="max-w-6xl mx-auto flex items-center justify-between bg-white/70 backdrop-blur-md px-6 py-3.5 rounded-2xl border border-slate-200/50 shadow-sm">
                    <div className="flex items-center gap-3 group cursor-pointer" data-cursor="NYMPH">
                        <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center border border-blue-600/20 transition-transform group-hover:rotate-12 duration-300">
                            <Image src={Logo} alt="Logo" width={24} height={24} className="object-contain" priority />
                        </div>
                        <span className="text-sm font-black tracking-[0.2em] text-slate-900 uppercase">
                            Nymph
                        </span>
                    </div>

                    <div className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-wider text-slate-500">
                        <a href="#features" className="hover:text-indigo-600 transition-colors duration-200 magnetic-item py-1">Features</a>
                        <a href="#workflow" className="hover:text-indigo-600 transition-colors duration-200 magnetic-item py-1">Workflow</a>
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600/30"></span>
                        <span className="text-slate-400">Portal Ready</span>
                    </div>

                    <Link href="/login" data-cursor="GO">
                        <button className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-extrabold text-xs tracking-wider uppercase shadow-lg shadow-indigo-600/25 transition-all hover:scale-[1.05] active:scale-[0.98]">
                            Login
                        </button>
                    </Link>
                </div>
            </nav>

            <main className="relative z-10">
                
                {/* HERO HERO HERO */}
                <section className="max-w-5xl mx-auto px-6 pt-32 pb-24 md:pt-48 md:pb-36 flex flex-col items-center text-center relative z-10 [perspective:1200px]">
                    
                    <div className="hero-badge inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-600/5 border border-indigo-600/10 text-indigo-600 font-extrabold text-[10px] uppercase tracking-widest mb-8">
                        <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-500 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-indigo-600"></span>
                        </span>
                        Administrative Portal System
                    </div>

                    {/* Word-split Title Entrance */}
                    <h1 className="text-4xl sm:text-6xl md:text-8xl font-black text-slate-900 tracking-tightest leading-[1.05] mb-8">
                        {["Master", "Your", "Class", "Administration."].map((word, idx) => (
                            <span 
                                key={idx} 
                                className={`split-word inline-block mr-3 md:mr-5 ${idx === 3 ? 'bg-gradient-to-r from-indigo-600 to-indigo-800 bg-clip-text text-transparent' : ''}`}
                            >
                                {word}
                            </span>
                        ))}
                    </h1>

                    <p className="hero-desc text-base sm:text-lg text-slate-500 max-w-2xl font-medium leading-relaxed mb-10">
                        An integrated, premium dashboard ecosystem designed to manage student registries, record daily class attendance, publish results, and collect Term fee reports.
                    </p>

                    <div className="hero-actions flex flex-col sm:flex-row items-center gap-4">
                        <Link href="/login" className="hero-action-btn" data-cursor="ENTER">
                            <button className="px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/25 transition-all flex items-center gap-2.5 group">
                                Access Portal
                                <MdArrowForward className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </Link>
                        <a href="#features" className="hero-action-btn px-8 py-4 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-black text-xs uppercase tracking-widest border border-slate-200 shadow-sm transition-all magnetic-item">
                            Learn More
                        </a>
                    </div>
                </section>

                {/* HORIZONTAL TIMELINE WORKFLOW SECTION */}
                <section id="workflow" ref={timelineSectionRef} className="bg-white border-y border-slate-200/60 overflow-hidden relative min-h-screen flex flex-col justify-center">
                    
                    {/* Header */}
                    <div className="max-w-6xl mx-auto w-full px-6 pt-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div className="space-y-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">The Journey</span>
                            <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">Administrative Pipeline</h2>
                        </div>
                        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider max-w-xs md:text-right">
                            Scroll down to navigate the workflow stages.
                        </p>
                    </div>

                    {/* Progress tracking line */}
                    <div className="w-full h-1 bg-slate-100 mt-8 relative">
                        <div ref={timelineProgressRef} className="absolute left-0 top-0 h-full w-full bg-indigo-600 scale-x-0 origin-left" />
                    </div>

                    {/* Horizontal scroll track */}
                    <div ref={timelineTrackRef} className="flex gap-8 px-8 py-20 w-max items-center">
                        
                        {/* Step 1 */}
                        <div className="w-[320px] sm:w-[400px] shrink-0 p-8 rounded-3xl bg-slate-50 border border-slate-200/50 shadow-sm space-y-6" data-cursor="STEP 1">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center font-black text-lg">
                                01
                            </div>
                            <h3 className="text-xl font-extrabold text-slate-900">Setup Standards</h3>
                            <p className="text-slate-500 text-sm leading-relaxed">
                                Define the classroom levels, set appropriate fee structures for standard schedules, and coordinate subjects under a unified schema.
                            </p>
                            <div className="flex items-center gap-2 text-indigo-600 font-extrabold text-xs uppercase tracking-wider">
                                <MdSettings size={16} /> Configuration Panel
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="w-[320px] sm:w-[400px] shrink-0 p-8 rounded-3xl bg-slate-50 border border-slate-200/50 shadow-sm space-y-6" data-cursor="STEP 2">
                            <div className="w-12 h-12 rounded-2xl bg-blue-600/10 text-blue-600 flex items-center justify-center font-black text-lg">
                                02
                            </div>
                            <h3 className="text-xl font-extrabold text-slate-900">Enroll Students</h3>
                            <p className="text-slate-500 text-sm leading-relaxed">
                                Populate standard profiles, register essential parent communication numbers, and query records inside a rapid student register database.
                            </p>
                            <div className="flex items-center gap-2 text-blue-600 font-extrabold text-xs uppercase tracking-wider">
                                <MdAddCircleOutline size={16} /> Registry Access
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="w-[320px] sm:w-[400px] shrink-0 p-8 rounded-3xl bg-slate-50 border border-slate-200/50 shadow-sm space-y-6" data-cursor="STEP 3">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-600/10 text-emerald-600 flex items-center justify-center font-black text-lg">
                                03
                            </div>
                            <h3 className="text-xl font-extrabold text-slate-900">Mark Attendance</h3>
                            <p className="text-slate-500 text-sm leading-relaxed">
                                Keep track of daily attendances on a matrix board. Instantly trigger automated parent notifications if absentees are marked.
                            </p>
                            <div className="flex items-center gap-2 text-emerald-600 font-extrabold text-xs uppercase tracking-wider">
                                <MdList size={16} /> Attendance Matrix
                            </div>
                        </div>

                        {/* Step 4 */}
                        <div className="w-[320px] sm:w-[400px] shrink-0 p-8 rounded-3xl bg-slate-50 border border-slate-200/50 shadow-sm space-y-6" data-cursor="STEP 4">
                            <div className="w-12 h-12 rounded-2xl bg-rose-600/10 text-rose-600 flex items-center justify-center font-black text-lg">
                                04
                            </div>
                            <h3 className="text-xl font-extrabold text-slate-900">Deliver Scorecards</h3>
                            <p className="text-slate-500 text-sm leading-relaxed">
                                Issue premium monthly PDF scorecards and deliver parent progress report cards directly via integrated WhatsApp broadcasts.
                            </p>
                            <div className="flex items-center gap-2 text-rose-600 font-extrabold text-xs uppercase tracking-wider">
                                <MdChatBubbleOutline size={16} /> Broadcast Gateway
                            </div>
                        </div>

                    </div>
                </section>

                {/* ASYMMETRIC BENTO GRID FEATURE SHOWCASE */}
                <section id="features" className="max-w-6xl mx-auto px-6 py-24 md:py-32 relative">
                    
                    {/* Header */}
                    <div className="flex flex-col items-center text-center mb-16 max-w-xl mx-auto space-y-3">
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Unified Portal</span>
                        <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
                            Built for Administrative Precision
                        </h2>
                        <p className="text-slate-500 text-sm font-medium leading-relaxed">
                            Organize standard academic routines with interactive features engineered for high usability.
                        </p>
                    </div>

                    {/* Bento Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        
                        {/* 1. Student Registry (Col-span 2) */}
                        <div className="bento-card-glow p-8 rounded-3xl bg-white border border-slate-200/60 shadow-sm md:col-span-2 flex flex-col justify-between min-h-[260px] group" data-cursor="ROSTER">
                            <div className="w-10 h-10 rounded-2xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center mb-6">
                                <MdPeopleAlt size={20} />
                            </div>
                            <div>
                                <h3 className="text-xl font-extrabold text-slate-900 mb-2">Student Registry</h3>
                                <p className="text-slate-500 text-sm leading-relaxed max-w-xl">
                                    A structured enrollment list. Search, filter, and modify profiles including standard specifications, roll configurations, and emergency parent details seamlessly.
                                </p>
                            </div>
                        </div>

                        {/* 2. Attendance Logger */}
                        <div className="bento-card-glow p-8 rounded-3xl bg-white border border-slate-200/60 shadow-sm flex flex-col justify-between min-h-[260px] group" data-cursor="LOG">
                            <div className="w-10 h-10 rounded-2xl bg-blue-600/10 text-blue-600 flex items-center justify-center mb-6">
                                <MdList size={20} />
                            </div>
                            <div>
                                <h3 className="text-xl font-extrabold text-slate-900 mb-2">Attendance Matrix</h3>
                                <p className="text-slate-500 text-sm leading-relaxed">
                                    Log attendances standard-wise. Features instantaneous trigger actions for absentee communications to parents.
                                </p>
                            </div>
                        </div>

                        {/* 3. Results & Broadcast */}
                        <div className="bento-card-glow p-8 rounded-3xl bg-white border border-slate-200/60 shadow-sm flex flex-col justify-between min-h-[260px] group" data-cursor="SCORE">
                            <div className="w-10 h-10 rounded-2xl bg-rose-600/10 text-rose-600 flex items-center justify-center mb-6">
                                <MdSchool size={20} />
                            </div>
                            <div>
                                <h3 className="text-xl font-extrabold text-slate-900 mb-2">Scorecard Generation</h3>
                                <p className="text-slate-500 text-sm leading-relaxed">
                                    Generate beautiful PDF marks sheets, review subject metrics, and automatically dispatch records via WhatsApp.
                                </p>
                            </div>
                        </div>

                        {/* 4. Term Fee Controller (Col-span 2) */}
                        <div className="bento-card-glow p-8 rounded-3xl bg-white border border-slate-200/60 shadow-sm md:col-span-2 flex flex-col justify-between min-h-[260px] group" data-cursor="FEES">
                            <div className="w-10 h-10 rounded-2xl bg-emerald-600/10 text-emerald-600 flex items-center justify-center mb-6">
                                <MdMonetizationOn size={20} />
                            </div>
                            <div>
                                <h3 className="text-xl font-extrabold text-slate-900 mb-2">Term Fee Controller</h3>
                                <p className="text-slate-500 text-sm leading-relaxed max-w-xl">
                                    An elegant accounting module to capture recorded transactions, identify standard dues, track outstanding deficits, and print professional receipt ledger sheets.
                                </p>
                            </div>
                        </div>

                        {/* 5. Security & Auth */}
                        <div className="bento-card-glow p-8 rounded-3xl bg-white border border-slate-200/60 shadow-sm flex flex-col justify-between min-h-[260px] group" data-cursor="GUARD">
                            <div className="w-10 h-10 rounded-2xl bg-amber-600/10 text-amber-600 flex items-center justify-center mb-6">
                                <MdSecurity size={20} />
                            </div>
                            <div>
                                <h3 className="text-xl font-extrabold text-slate-900 mb-2">Access Security</h3>
                                <p className="text-slate-500 text-sm leading-relaxed">
                                    Enterprise-level JWT validation controls safeguard registry endpoints from unauthorized alterations.
                                </p>
                            </div>
                        </div>

                        {/* 6. Live Notices Dropdown (Col-span 2) */}
                        <div className="bento-card-glow p-8 rounded-3xl bg-white border border-slate-200/60 shadow-sm md:col-span-2 flex flex-col justify-between min-h-[260px] group" data-cursor="NOTICES">
                            <div className="w-10 h-10 rounded-2xl bg-purple-600/10 text-purple-600 flex items-center justify-center mb-6">
                                <MdCampaign size={20} />
                            </div>
                            <div>
                                <h3 className="text-xl font-extrabold text-slate-900 mb-2">Notice Feeds</h3>
                                <p className="text-slate-500 text-sm leading-relaxed max-w-xl">
                                    Instant alerts system configured directly within the portal workspace header notifications panel, updating logs and status dynamically.
                                </p>
                            </div>
                        </div>

                    </div>
                </section>

                {/* UPGRADED CALL TO ACTION */}
                <section className="max-w-6xl mx-auto px-6 pb-24 md:pb-36">
                    <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 text-white p-12 md:p-20 text-center shadow-xl">
                        
                        {/* Decorative items */}
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-600/20 rounded-full blur-[80px] pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-600/10 rounded-full blur-[60px] pointer-events-none" />

                        <div className="relative z-10 max-w-2xl mx-auto space-y-6">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Launch Portal</span>
                            <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                                Ready to Orchestrate Your Classroom Operations?
                            </h2>
                            <p className="text-slate-400 text-xs sm:text-sm font-semibold max-w-md mx-auto leading-relaxed">
                                Enter the secure management portal to configure class modules, generate scorecards, and register active student databases today.
                            </p>
                            <div className="pt-4" data-cursor="GO NOW">
                                <Link href="/login">
                                    <button className="px-8 py-4 rounded-xl bg-white hover:bg-slate-50 text-slate-950 font-black text-xs uppercase tracking-widest shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98] inline-flex items-center gap-2">
                                        Enter Management Portal <MdKeyboardArrowRight size={18} />
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

            </main>

            {/* UPGRADED FOOTER */}
            <footer className="max-w-6xl mx-auto px-6 py-12 border-t border-slate-200/60 flex flex-col md:flex-row justify-between items-center gap-6 text-slate-400">
                <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-lg bg-slate-900 flex items-center justify-center p-1 shadow-inner">
                        <Image src={Logo} alt="Logo" width={14} height={14} className="object-contain" />
                    </div>
                    <span className="font-extrabold tracking-widest text-[9px] uppercase text-slate-950">Nymph Classes © 2026</span>
                </div>
                <div className="flex gap-8 text-[9px] font-black uppercase tracking-widest">
                    <span className="hover:text-indigo-600 transition-colors cursor-pointer">Secure Gateway</span>
                    <span className="hover:text-indigo-600 transition-colors cursor-pointer">Admin Guard</span>
                </div>
            </footer>
        </div>
    );
}
