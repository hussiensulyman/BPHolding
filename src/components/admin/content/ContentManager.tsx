"use client";

import { useEffect, useMemo, useState } from "react";

type ContentStatus = "DRAFT" | "PUBLISHED";
type SectionKey = "hero" | "mission" | "vision" | "services";

type ContentSection = {
  id: string;
  sectionKey: SectionKey;
  titleEn: string;
  titleAr: string;
  bodyEn: string;
  bodyAr: string;
  status: ContentStatus;
};

const SECTION_KEYS: SectionKey[] = ["hero", "mission", "vision", "services"];

const SECTION_LABELS: Record<SectionKey, { en: string; ar: string }> = {
  hero: { en: "Hero", ar: "البطاقة الرئيسية" },
  mission: { en: "Mission", ar: "الرسالة" },
  vision: { en: "Vision", ar: "الرؤية" },
  services: { en: "Services", ar: "الخدمات" },
};

export function ContentManager({ locale }: { locale: "ar" | "en" }) {
  const [sections, setSections] = useState<ContentSection[]>([]);
  const [activeSection, setActiveSection] = useState<SectionKey>("hero");
  const [previewLocale, setPreviewLocale] = useState<"en" | "ar">("en");
  const [saving, setSaving] = useState(false);

  async function loadSections() {
    const response = await fetch("/api/admin/content", { cache: "no-store" });
    const payload = (await response.json()) as {
      success: boolean;
      data: ContentSection[];
    };

    if (payload.success) {
      setSections(payload.data);
    }
  }

  useEffect(() => {
    void loadSections();
  }, []);

  const section = useMemo(() => {
    return (
      sections.find((item) => item.sectionKey === activeSection) ?? {
        id: `new-${activeSection}`,
        sectionKey: activeSection,
        titleEn: "",
        titleAr: "",
        bodyEn: "",
        bodyAr: "",
        status: "DRAFT" as const,
      }
    );
  }, [activeSection, sections]);

  function updateSection(data: Partial<ContentSection>) {
    setSections((current) => {
      const hasExisting = current.some((item) => item.sectionKey === activeSection);

      if (!hasExisting) {
        return [...current, { ...section, ...data }];
      }

      return current.map((item) =>
        item.sectionKey === activeSection ? { ...item, ...data } : item,
      );
    });
  }

  async function save(status: ContentStatus) {
    setSaving(true);

    await fetch("/api/admin/content", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        sectionKey: activeSection,
        titleEn: section.titleEn,
        titleAr: section.titleAr,
        bodyEn: section.bodyEn,
        bodyAr: section.bodyAr,
        status,
      }),
    });

    setSaving(false);
    await loadSections();
  }

  return (
    <section className="grid gap-4">
      <header className="rounded-xl border border-primary/15 bg-white px-4 py-4">
        <h1 className="text-2xl font-bold text-primary">
          {locale === "ar" ? "إدارة المحتوى" : "Content Manager"}
        </h1>
      </header>

      <div className="grid gap-4 lg:grid-cols-[240px,1fr]">
        <aside className="rounded-xl border border-primary/15 bg-white p-3">
          <div className="grid gap-2">
            {SECTION_KEYS.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveSection(key)}
                className={`rounded-lg px-3 py-2 text-start text-sm font-semibold ${
                  activeSection === key
                    ? "bg-primary text-white"
                    : "border border-primary/20 text-primary"
                }`}
              >
                {SECTION_LABELS[key][locale]}
              </button>
            ))}
          </div>
        </aside>

        <div className="grid gap-4">
          <section className="rounded-xl border border-primary/15 bg-white p-4">
            <div className="grid gap-3 md:grid-cols-2">
              <input
                value={section.titleEn}
                onChange={(event) => updateSection({ titleEn: event.target.value })}
                placeholder="Title (EN)"
                className="rounded-lg border border-primary/20 px-3 py-2"
              />
              <input
                value={section.titleAr}
                onChange={(event) => updateSection({ titleAr: event.target.value })}
                placeholder="Title (AR)"
                className="rounded-lg border border-primary/20 px-3 py-2"
              />
              <textarea
                value={section.bodyEn}
                onChange={(event) => updateSection({ bodyEn: event.target.value })}
                placeholder="Body (EN)"
                className="rounded-lg border border-primary/20 px-3 py-2"
                rows={6}
              />
              <textarea
                value={section.bodyAr}
                onChange={(event) => updateSection({ bodyAr: event.target.value })}
                placeholder="Body (AR)"
                className="rounded-lg border border-primary/20 px-3 py-2"
                rows={6}
              />
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={saving}
                onClick={() => void save("DRAFT")}
                className="rounded-lg border border-primary/20 px-3 py-2 text-sm font-semibold text-primary"
              >
                {locale === "ar" ? "حفظ كمسودة" : "Save as Draft"}
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => void save("PUBLISHED")}
                className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white"
              >
                {locale === "ar" ? "نشر" : "Publish"}
              </button>
            </div>
          </section>

          <section className="rounded-xl border border-primary/15 bg-white p-4">
            <div className="mb-3 flex items-center gap-2">
              <button
                type="button"
                className={`rounded-lg px-3 py-1 text-sm font-semibold ${
                  previewLocale === "en"
                    ? "bg-primary text-white"
                    : "border border-primary/20 text-primary"
                }`}
                onClick={() => setPreviewLocale("en")}
              >
                EN
              </button>
              <button
                type="button"
                className={`rounded-lg px-3 py-1 text-sm font-semibold ${
                  previewLocale === "ar"
                    ? "bg-primary text-white"
                    : "border border-primary/20 text-primary"
                }`}
                onClick={() => setPreviewLocale("ar")}
              >
                AR
              </button>
            </div>
            <h3 className="text-lg font-bold text-primary">
              {previewLocale === "ar" ? section.titleAr : section.titleEn}
            </h3>
            <p className="mt-2 whitespace-pre-wrap text-slate-700">
              {previewLocale === "ar" ? section.bodyAr : section.bodyEn}
            </p>
          </section>
        </div>
      </div>
    </section>
  );
}
