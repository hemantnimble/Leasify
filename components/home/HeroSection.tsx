"use client";

// components/home/HeroSection.tsx

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useGsap } from "@/hooks/useGsap";
import { useMagnetic } from "@/hooks/useMagnetic";
import {
    Dancing_Script
} from 'next/font/google';

const dancingScript
    = Dancing_Script
({
          subsets: ['latin'],
        //   displ0y: 'swap',
        weight: ['700'], // required for non-variable fonts
    });


export function HeroSection() {
    const gsapReady = useGsap();
    const heroRef = useRef<HTMLElement>(null);
    const heroImgRef = useRef<HTMLDivElement>(null);
    const heroCardRef = useRef<HTMLDivElement>(null);
    const [heroVis, setHeroVis] = useState(false);

    const magBtn1 = useMagnetic(0.3);
    const magBtn2 = useMagnetic(0.3);

    // Fade in on mount
    useEffect(() => {
        const t = setTimeout(() => setHeroVis(true), 80);
        return () => clearTimeout(t);
    }, []);

    // GSAP animations
    useEffect(() => {
        if (!gsapReady) return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const gsap = (window as any).gsap;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ST = (window as any).ScrollTrigger;

        // Hero headline — char by char
        gsap.fromTo(
            ".hero-char",
            { y: 70, opacity: 0, rotateX: -45 },
            {
                y: 0,
                opacity: 1,
                rotateX: 0,
                duration: 0.9,
                stagger: 0.035,
                ease: "back.out(1.5)",
                delay: 0.15,
            }
        );

        // Sub lines stagger
        gsap.fromTo(
            ".hero-sub-anim",
            { y: 28, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.75, stagger: 0.12, delay: 0.9, ease: "power3.out" }
        );

        // Buttons
        gsap.fromTo(
            ".hero-btns-anim",
            { y: 18, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.65, delay: 1.3, ease: "power3.out" }
        );

        // Hero image parallax on scroll
        if (heroImgRef.current) {
            gsap.to(heroImgRef.current, {
                yPercent: -20,
                ease: "none",
                scrollTrigger: {
                    trigger: heroRef.current,
                    start: "top top",
                    end: "bottom top",
                    scrub: 1.4,
                },
            });
        }

        // Hero card slight rotate on scroll
        if (heroCardRef.current) {
            gsap.to(heroCardRef.current, {
                rotateX: 10,
                y: -24,
                ease: "none",
                scrollTrigger: {
                    trigger: heroRef.current,
                    start: "top top",
                    end: "bottom top",
                    scrub: 1.8,
                },
            });
        }

        // Floating badges parallax
        // ...existing code...
        const badges = gsap.utils.toArray(".float-badge") as HTMLElement[];
        badges.forEach((el, i) => {
            gsap.to(el, {
                y: i % 2 === 0 ? -28 : 28,
                ease: "none",
                scrollTrigger: {
                    trigger: heroRef.current,
                    start: "top top",
                    end: "bottom top",
                    scrub: 2 + i,
                },
            });
        });
        // ...existing code...

        return () => {
            ST.getAll().forEach((t: { kill: () => void }) => t.kill());
        };
    }, [gsapReady]);

    const headline1 = "Rent homes.";
    const headline2 = "On-chain.";

    return (
        <section
            ref={heroRef}
            style={{
                minHeight: "100vh",
                // background: "#F8F8F6",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                alignItems: "center",
                gap: "60px",
                padding: "80px 48px 60px",
                maxWidth: 1280,
                margin: "0 auto",
                perspective: 1200,
                overflow: "hidden",
            }}
        >
            {/* ── LEFT ── */}
            <div>
                {/* Live tag */}
                <div
                    className="hero-sub-anim"
                    style={{ marginBottom: 24, opacity: 0 }}
                >
                    <span
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            background: "#F0F0F8",
                            color: "#4B5563",
                            padding: "6px 14px",
                            borderRadius: 100,
                            fontSize: 11,
                            fontWeight: 500,
                            letterSpacing: "0.04em",
                            // //: "'DM Mono', monospace",
                        }}
                    >
                        <span
                            style={{
                                width: 6,
                                height: 6,
                                background: "#059669",
                                borderRadius: "50%",
                                display: "inline-block",
                                animation: "blink 2s infinite",
                            }}
                        />
                        Live on Ethereum Sepolia
                    </span>
                </div>

                {/* Headline — split chars */}
                <h1 className={dancingScript.className}
                    style={{
                        fontSize: "clamp(44px, 5.5vw, 76px)",
                        fontWeight: 800,
                        lineHeight: 1.02,
                        letterSpacing: "-0.045em",
                        marginBottom: 22,
                        // //: "'Sora', sans-serif",
                    }}
                >
                    {headline1.split("").map((c, i) => (
                        <span
                            key={`h1-${i}`}
                            className="hero-char"
                            style={{
                                display: "inline-block",
                                opacity: 0,
                                color: "#1A1A2E",
                                transformOrigin: "bottom center",
                            }}
                        >
                            {c === " " ? "\u00A0" : c}
                        </span>
                    ))}
                    <br />
                    {headline2.split("").map((c, i) => (
                        <span
                            key={`h2-${i}`}
                            className="hero-char"
                            style={{
                                display: "inline-block",
                                opacity: 0,
                                color: "#2D5BE3",
                                transformOrigin: "bottom center",
                            }}
                        >
                            {c === " " ? "\u00A0" : c}
                        </span>
                    ))}
                </h1>

                {/* Subtext */}
                <p
                    className="hero-sub-anim"
                    style={{
                        fontSize: 15,
                        fontWeight: 300,
                        color: "#6B7280",
                        lineHeight: 1.75,
                        maxWidth: 420,
                        marginBottom: 38,
                        opacity: 0,
                        // //: "'Sora', sans-serif",
                    }}
                >
                    Leasify replaces paper lease agreements with Ethereum smart
                    contracts. Deposits secured. Payments enforced. No lawyers, no
                    banks, no middlemen.
                </p>

                {/* Buttons */}
                <div
                    className="hero-btns-anim"
                    style={{
                        display: "flex",
                        gap: 14,
                        alignItems: "center",
                        marginBottom: 52,
                        opacity: 0,
                    }}
                >
                    <div
                        ref={magBtn1.ref}
                        onMouseMove={magBtn1.onMouseMove}
                        onMouseLeave={magBtn1.onMouseLeave}
                    >
                        <Link
                            href="/properties"
                            style={{
                                display: "inline-block",
                                background: "#1A1A2E",
                                color: "#fff",
                                padding: "14px 32px",
                                borderRadius: 14,
                                // //: "'Sora', sans-serif",
                                fontSize: 13,
                                fontWeight: 600,
                                textDecoration: "none",
                                letterSpacing: "0.01em",
                                transition: "background 0.2s, box-shadow 0.3s",
                                whiteSpace: "nowrap",
                            }}
                            onMouseEnter={(e) => {
                                (e.currentTarget as HTMLElement).style.boxShadow =
                                    "0 8px 32px rgba(26,26,46,0.28)";
                            }}
                            onMouseLeave={(e) => {
                                (e.currentTarget as HTMLElement).style.boxShadow = "none";
                            }}
                        >
                            Browse Properties
                        </Link>
                    </div>

                    <div
                        ref={magBtn2.ref}
                        onMouseMove={magBtn2.onMouseMove}
                        onMouseLeave={magBtn2.onMouseLeave}
                    >
                        <Link
                            href="/login"
                            style={{
                                display: "inline-block",
                                background: "transparent",
                                color: "#1A1A2E",
                                border: "1.5px solid #E5E7EB",
                                padding: "13px 32px",
                                borderRadius: 14,
                                // //: "'Sora', sans-serif",
                                fontSize: 13,
                                fontWeight: 500,
                                textDecoration: "none",
                                transition: "border-color 0.2s, background 0.2s",
                                whiteSpace: "nowrap",
                            }}
                            onMouseEnter={(e) => {
                                const el = e.currentTarget as HTMLElement;
                                el.style.borderColor = "#1A1A2E";
                                el.style.background = "#F3F4F6";
                            }}
                            onMouseLeave={(e) => {
                                const el = e.currentTarget as HTMLElement;
                                el.style.borderColor = "#E5E7EB";
                                el.style.background = "transparent";
                            }}
                        >
                            Connect Wallet
                        </Link>
                    </div>
                </div>

                {/* Mini stats */}
                <div
                    className="hero-sub-anim"
                    style={{ display: "flex", gap: 36, opacity: 0 }}
                >
                    {[
                        { val: "1,240+", label: "Leases Created" },
                        { val: "48 ETH", label: "Deposits Secured" },
                        { val: "3,600+", label: "Happy Renters" },
                    ].map((s) => (
                        <div key={s.label}>
                            <div
                                style={{
                                    fontWeight: 800,
                                    fontSize: 22,
                                    letterSpacing: "-0.03em",
                                    color: "#1A1A2E",
                                    //: "'Sora', sans-serif",
                                }}
                            >
                                {s.val}
                            </div>
                            <div
                                style={{
                                    fontSize: 11,
                                    color: "#9CA3AF",
                                    marginTop: 2,
                                    //: "'Sora', sans-serif",
                                }}
                            >
                                {s.label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── RIGHT — floating card ── */}
            <div
                ref={heroCardRef}
                style={{
                    position: "relative",
                    transformStyle: "preserve-3d",
                    opacity: heroVis ? 1 : 0,
                    transform: heroVis ? "translateX(0)" : "translateX(40px)",
                    transition: "opacity 0.9s ease 0.35s, transform 0.9s ease 0.35s",
                }}
            >
                {/* Main card */}
                <div
                    className="animate-float"
                    style={{
                        background: "#fff",
                        borderRadius: 28,
                        overflow: "hidden",
                        boxShadow: "0 24px 80px rgba(0,0,0,0.13)",
                    }}
                >
                    {/* Image with parallax */}
                    <div
                        style={{ height: 300, overflow: "hidden", position: "relative" }}
                    >
                        <div ref={heroImgRef} style={{ height: "115%", overflow: "hidden" }}>
                            <img
                                src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=900&q=85"
                                alt="hero property"
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                        </div>
                        {/* Gradient overlay */}
                        <div
                            style={{
                                position: "absolute",
                                inset: 0,
                                background:
                                    "linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.5))",
                                pointerEvents: "none",
                            }}
                        />
                        {/* Title overlay */}
                        <div
                            style={{
                                position: "absolute",
                                bottom: 20,
                                left: 20,
                                color: "#fff",
                            }}
                        >
                            <div
                                style={{
                                    fontSize: 20,
                                    fontWeight: 800,
                                    letterSpacing: "-0.02em",
                                    //: "'Sora', sans-serif",
                                }}
                            >
                                Skyline Penthouse
                            </div>
                            <div style={{ fontSize: 12, opacity: 0.8, marginTop: 2 }}>
                                📍 Mumbai, Bandra West
                            </div>
                        </div>
                        {/* Price badge */}
                        <div
                            style={{
                                position: "absolute",
                                top: 20,
                                right: 20,
                                background: "#1A1A2E",
                                color: "#fff",
                                padding: "8px 16px",
                                borderRadius: 100,
                                fontSize: 13,
                                fontWeight: 700,
                                //: "'Sora', sans-serif",
                            }}
                        >
                            0.008 ETH/mo
                        </div>
                    </div>

                    {/* Card body */}
                    <div style={{ padding: "18px 22px 22px" }}>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: 14,
                            }}
                        >
                            <div style={{ display: "flex", gap: 24 }}>
                                {[
                                    ["3", "Beds"],
                                    ["2", "Baths"],
                                    ["2,100", "sqft"],
                                ].map(([v, l]) => (
                                    <div key={l} style={{ textAlign: "center" }}>
                                        <div
                                            style={{
                                                fontWeight: 700,
                                                fontSize: 15,
                                                color: "#1A1A2E",
                                                //: "'Sora', sans-serif",
                                            }}
                                        >
                                            {v}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: 10,
                                                color: "#9CA3AF",
                                                //: "'Sora', sans-serif",
                                            }}
                                        >
                                            {l}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Link
                                href="/login"
                                style={{
                                    background: "#1A1A2E",
                                    color: "#fff",
                                    padding: "10px 20px",
                                    borderRadius: 12,
                                    fontSize: 12,
                                    fontWeight: 600,
                                    textDecoration: "none",
                                    //: "'Sora', sans-serif",
                                    transition: "background 0.2s",
                                }}
                            >
                                Request Lease
                            </Link>
                        </div>

                        {/* Contract badge */}
                        <div
                            style={{
                                background: "#F0FDF4",
                                border: "1px solid #BBF7D0",
                                borderRadius: 10,
                                padding: "10px 14px",
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                            }}
                        >
                            <span
                                style={{
                                    width: 6,
                                    height: 6,
                                    background: "#059669",
                                    borderRadius: "50%",
                                    display: "inline-block",
                                    animation: "blink 2s infinite",
                                }}
                            />
                            <span
                                style={{
                                    fontSize: 11,
                                    color: "#059669",
                                    //: "'DM Mono', monospace",
                                }}
                            >
                                Smart contract verified · 0x6379...ED12
                            </span>
                        </div>
                    </div>
                </div>

                {/* Floating badge — deposit */}
                <div
                    className="float-badge"
                    style={{
                        position: "absolute",
                        top: -28,
                        left: -44,
                        background: "#fff",
                        borderRadius: 18,
                        padding: "12px 18px",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                        opacity: heroVis ? 1 : 0,
                        transition: "opacity 0.6s ease 0.9s",
                    }}
                >
                    <div
                        style={{
                            fontSize: 10,
                            color: "#9CA3AF",
                            marginBottom: 2,
                            //: "'Sora', sans-serif",
                        }}
                    >
                        Deposit secured
                    </div>
                    <div
                        style={{
                            fontWeight: 700,
                            fontSize: 18,
                            letterSpacing: "-0.03em",
                            color: "#059669",
                            //: "'Sora', sans-serif",
                        }}
                    >
                        0.008 ETH 🔒
                    </div>
                </div>

            </div>

            <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
        </section>
    );
}