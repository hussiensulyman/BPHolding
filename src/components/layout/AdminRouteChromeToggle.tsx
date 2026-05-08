"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

function isAdminPath(pathname: string): boolean {
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return false;
  }

  if (segments[0] === "admin") {
    return true;
  }

  return segments[1] === "admin";
}

export function AdminRouteChromeToggle() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    const adminRoute = isAdminPath(pathname);

    root.dataset.adminRoute = adminRoute ? "1" : "0";

    return () => {
      root.dataset.adminRoute = "0";
    };
  }, [pathname]);

  return null;
}
