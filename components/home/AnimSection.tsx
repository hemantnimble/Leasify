// components/home/AnimSection.tsx
"use client";

import { useEffect, useRef, useState } from "react";

interface AnimSectionProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  from?: "bottom" | "left" | "right" | "scale";
}

export function AnimSection({
  children,
  delay = 0,
  className = "",
  from = "bottom",
}: AnimSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const transforms = {
    bottom: { hidden: "translateY(40px)",  visible: "translateY(0)" },
    left:   { hidden: "translateX(-50px)", visible: "translateX(0)" },
    right:  { hidden: "translateX(50px)",  visible: "translateX(0)" },
    scale:  { hidden: "scale(0.9)",        visible: "scale(1)" },
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible
          ? transforms[from].visible
          : transforms[from].hidden,
        transition: `opacity 0.75s cubic-bezier(.16,1,.3,1) ${delay}s, transform 0.75s cubic-bezier(.16,1,.3,1) ${delay}s`,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}