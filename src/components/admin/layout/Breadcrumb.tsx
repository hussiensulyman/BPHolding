"use client";

import { useMemo } from "react";

import { usePathname } from "@/i18n/navigation";

const LABELS: Record<string, { en: string; ar: string }> = {
  admin: { en: "Admin", ar: "الإدارة" },
  projects: { en: "Projects", ar: "المشاريع" },
  submissions: { en: "Submissions", ar: "الوارد" },
  content: { en: "Content", ar: "المحتوى" },
  certifications: { en: "Certifications", ar: "الشهادات" },
  audit: { en: "Audit Log", ar: "سجل التدقيق" },
  login: { en: "Login", ar: "تسجيل الدخول" },
};

type BreadcrumbProps = {
  locale: "ar" | "en";
};

export function Breadcrumb({ locale }: BreadcrumbProps) {
  const pathname = usePathname();

  const items = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean).slice(1);

    return segments.map((segment) => {
      const label = LABELS[segment]?.[locale] ?? segment;

      return { key: segment, label };
    });
  }, [locale, pathname]);

  return (
    <nav aria-label="Breadcrumb" className="text-sm text-slate-600">
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => (
          <li key={`${item.key}-${index}`} className="flex items-center gap-2">
            {index > 0 ? <span className="text-slate-400">/</span> : null}
            <span
              className={index === items.length - 1 ? "font-semibold text-primary" : ""}
            >
              {item.label}
            </span>
          </li>
        ))}
      </ol>
    </nav>
  );
}
