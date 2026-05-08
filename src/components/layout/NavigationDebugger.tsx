"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function NavigationDebugger() {
  const pathname = usePathname();

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("[Nav] →", pathname);
    }
    return () => {
      if (process.env.NODE_ENV === "development") {
        console.log("[Nav] ←", pathname);
      }
    };
  }, [pathname]);

  return null;
}
