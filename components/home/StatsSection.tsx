"use client";

// components/home/StatsSection.tsx

import { useEffect, useRef, useState } from "react";

const STATS = [
  {
    target: 1240,
    suffix: "+",
    label: "Leases Created",
    sub: "On Ethereum",
  },
  {
    target: 48,
    suffix: " ETH",
    label: "Deposits Secured",
    sub: "Locked in contracts",
  },
  {
    target: 3600,
    suffix: "+",
    label: "Users",
    sub: "Landlords & Tenants",
  },
  {
    target: 99,
    suffix: "%",
    label: "Dispute Free",
    sub: "Smart contract enforced",
  },
];

function useCountUp(target: number, triggered: boolean, duration = 2000) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!triggered) return;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [triggered, target, duration]);

  return value;
}

function StatItem({
  stat,
  triggered,
  index,
  isLast,
}: {
  stat: (typeof STATS)[0];
  triggered: boolean;
  index: number;
  isLast: boolean;
}) {
  const count = useCountUp(stat.target, triggered, 1800 + index * 200);

  return (
    <div
      style={{
        flex: 1,
        textAlign: "center",
        padding: "40px 32px",
        borderRight: !isLast ? "1px solid rgba(255,255,255,0.07)" : "none",
        opacity: triggered ? 1 : 0,
        transform: triggered ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 0.7s ease ${index * 0.12}s, transform 0.7s ease ${index * 0.12}s`,
      }}
    >
      <div
        style={{
          fontSize: "clamp(36px, 4vw, 60px)",
          fontWeight: 800,
          letterSpacing: "-0.04em",
          color: "#fff",
          lineHeight: 1,
          marginBottom: 10,
          //: "'Sora', sans-serif",
        }}
      >
        {count.toLocaleString()}
        {stat.suffix}
      </div>
      <div
        style={{
          fontWeight: 600,
          fontSize: 14,
          color: "#E5E7EB",
          marginBottom: 4,
          //: "'Sora', sans-serif",
        }}
      >
        {stat.label}
      </div>
      <div
        style={{
          fontSize: 11,
          color: "#4B5563",
          //: "'DM Mono', monospace",
          letterSpacing: "0.04em",
        }}
      >
        {stat.sub}
      </div>
    </div>
  );
}

export function StatsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [triggered, setTriggered] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTriggered(true);
          obs.disconnect();
        }
      },
      { threshold: 0.35 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      style={{
        background: "#1A1A2E",
        borderTop: "1px solid rgba(255,255,255,0.04)",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
      }}
    >
      <div
        ref={ref}
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          display: "flex",
          flexWrap: "wrap",
        }}
      >
        {STATS.map((stat, i) => (
          <StatItem
            key={i}
            stat={stat}
            triggered={triggered}
            index={i}
            isLast={i === STATS.length - 1}
          />
        ))}
      </div>
    </section>
  );
}