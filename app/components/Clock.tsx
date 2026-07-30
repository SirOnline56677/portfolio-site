"use client";

import { useEffect, useState } from "react";

// Live EST clock, matches the "00:00:00 EST" element in the design.
export default function Clock() {
  const [time, setTime] = useState<string>("00:00:00");

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <span suppressHydrationWarning>
      {time} EST
    </span>
  );
}
