// hooks/useTilt.ts
"use client";

import { useRef, useCallback } from "react";

export function useTilt(strength = 12) {
  const ref = useRef<HTMLDivElement>(null);

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(900px) rotateY(${x * strength}deg) rotateX(${-y * strength}deg) scale3d(1.03,1.03,1.03)`;
      el.style.transition = "transform 0.1s ease";
    },
    [strength]
  );

  const onMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform =
      "perspective(900px) rotateY(0deg) rotateX(0deg) scale3d(1,1,1)";
    el.style.transition = "transform 0.5s cubic-bezier(.16,1,.3,1)";
  }, []);

  return { ref, onMouseMove, onMouseLeave };
}