// hooks/useGsap.ts
"use client";

import { useEffect, useState } from "react";

function loadScript(src: string): Promise<void> {
  return new Promise((resolve) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const s = document.createElement("script");
    s.src = src;
    s.onload = () => resolve();
    document.head.appendChild(s);
  });
}

export function useGsap() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      await loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"
      );
      await loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).gsap.registerPlugin((window as any).ScrollTrigger);
      setReady(true);
    })();
  }, []);

  return ready;
}