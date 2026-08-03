"use client";

import { ReactLenis } from "lenis/react";

// Smooth scrolling via Lenis (darkroomengineering/lenis).
export default function SmoothScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ReactLenis root options={{ lerp: 0.1, smoothWheel: true }}>
      {children}
    </ReactLenis>
  );
}
