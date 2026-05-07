"use client";

import { useEffect, useMemo, useState } from "react";

import { ProjectsTable } from "@/components/admin/projects/ProjectsTable";

type ProjectStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
type ProjectCategory =
  | "RESIDENTIAL"
  | "COMMERCIAL"
  | "INTERIOR"
  | "ENGINEERING"
  | "MEP"
  | "RENOVATION";

type ProjectItem = {
  id: string;
  slug: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  category: ProjectCategory;
  city: string;
  location: string;
  year?: number | null;
  status: ProjectStatus;
  featured: boolean;
};

type FormState = {
  id?: string;
  slug: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  category: ProjectCategory;
  city: string;
  location: string;
  year: string;
  status: ProjectStatus;
  featured: boolean;
  imageUrls: string;
};

const EMPTY_FORM: FormState = {
  slug: "",
  titleEn: "",
  titleAr: "",
  descriptionEn: "",
  descriptionAr: "",
  category: "RESIDENTIAL",
  city: "",
  location: "",
  year: "",
  status: "DRAFT",
  featured: false,
  imageUrls: "",
};

const COPY = {
  en: {
    create: "Create Project",
    update: "Update Project",
    reset: "Reset",
    imageKitLabel: "ImageKit URLs (one URL per line)",
    sectionTitle: "Project Editor",
  },
  ar: {
    create: "إضافة مشروع",
    update: "تحديث المشروع",
    reset: "مسح",
    imageKitLabel: "روابط ImageKit (رابط في كل سطر)",
    sectionTitle: "محرر المشاريع",
  },
} as const;

function parseImageUrls(raw: string): string[] {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function ProjectsManager({ locale }: { locale: "ar" | "en" }) {
  const text = COPY[locale];
  const [items, setItems] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  async function loadProjects() {
    setLoading(true);
    const response = await fetch("/api/admin/projects", { cache: "no-store" });
    const payload = (await response.json()) as {
      success: boolean;
      data: { items: ProjectItem[] };
    };

    if (payload.success) {
      setItems(payload.data.items);
    }

    setLoading(false);
  }

  useEffect(() => {
    void loadProjects();
  }, []);

  const isEditing = useMemo(() => Boolean(form.id), [form.id]);

  function updateForm<Key extends keyof FormState>(key: Key, value: FormState[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submitForm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);

    const method = form.id ? "PATCH" : "POST";
    const url = form.id ? `/api/admin/projects/${form.id}` : "/api/admin/projects";

    await fetch(url, {
      method,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        slug: form.slug,
        titleEn: form.titleEn,
        titleAr: form.titleAr,
        descriptionEn: form.descriptionEn,
        descriptionAr: form.descriptionAr,
        city: form.city,
        location: form.location,
        year: form.year ? Number.parseInt(form.year, 10) : undefined,
        category: form.category,
        status: form.status,
        featured: form.featured,
        imageUrls: parseImageUrls(form.imageUrls),
      }),
    });

    setSubmitting(false);
    setForm(EMPTY_FORM);
    await loadProjects();
  }

  async function handleInlineUpdate(
    id: string,
    data: Partial<Pick<ProjectItem, "status" | "featured">>,
  ) {
    await fetch(`/api/admin/projects/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(data),
    });

    await loadProjects();
  }

  async function handleBulkAction(
    ids: string[],
    action: "PUBLISH" | "ARCHIVE" | "DRAFT" | "DELETE",
  ) {
    await Promise.all(
      ids.map(async (id) => {
        if (action === "DELETE") {
          return fetch(`/api/admin/projects/${id}`, { method: "DELETE" });
        }

        const status =
          action === "PUBLISH"
            ? "PUBLISHED"
            : action === "ARCHIVE"
              ? "ARCHIVED"
              : "DRAFT";

        return fetch(`/api/admin/projects/${id}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ status }),
        });
      }),
    );

    await loadProjects();
  }

  return (
    <section className="grid gap-6">
      {/* Form */}
      <form
        onSubmit={submitForm}
        className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100"
      >
        <h2 className="mb-5 text-lg font-extrabold text-[#052a42]">
          {text.sectionTitle}
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          <input
            value={form.slug}
            onChange={(event) => updateForm("slug", event.target.value)}
            placeholder="slug"
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:border-[#df9a13] focus:outline-none focus:ring-2 focus:ring-[#df9a13]/30"
            required
          />
          <input
            value={form.category}
            onChange={(event) =>
              updateForm("category", event.target.value as ProjectCategory)
            }
            placeholder="Category"
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:border-[#df9a13] focus:outline-none focus:ring-2 focus:ring-[#df9a13]/30"
            list="project-categories"
            required
          />
          <input
            value={form.titleEn}
            onChange={(event) => updateForm("titleEn", event.target.value)}
            placeholder="Title (EN)"
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:border-[#df9a13] focus:outline-none focus:ring-2 focus:ring-[#df9a13]/30"
            required
          />
          <input
            value={form.titleAr}
            onChange={(event) => updateForm("titleAr", event.target.value)}
            placeholder="Title (AR)"
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:border-[#df9a13] focus:outline-none focus:ring-2 focus:ring-[#df9a13]/30"
            required
          />
          <textarea
            value={form.descriptionEn}
            onChange={(event) => updateForm("descriptionEn", event.target.value)}
            placeholder="Description (EN)"
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:border-[#df9a13] focus:outline-none focus:ring-2 focus:ring-[#df9a13]/30"
            rows={3}
            required
          />
          <textarea
            value={form.descriptionAr}
            onChange={(event) => updateForm("descriptionAr", event.target.value)}
            placeholder="Description (AR)"
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:border-[#df9a13] focus:outline-none focus:ring-2 focus:ring-[#df9a13]/30"
            rows={3}
            required
          />
          <input
            value={form.location}
            onChange={(event) => updateForm("location", event.target.value)}
            placeholder={locale === "ar" ? "الموقع" : "Location"}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:border-[#df9a13] focus:outline-none focus:ring-2 focus:ring-[#df9a13]/30"
            required
          />
          <input
            value={form.city}
            onChange={(event) => updateForm("city", event.target.value)}
            placeholder={locale === "ar" ? "المدينة" : "City"}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:border-[#df9a13] focus:outline-none focus:ring-2 focus:ring-[#df9a13]/30"
            required
          />
          <input
            value={form.year}
            onChange={(event) => updateForm("year", event.target.value)}
            placeholder={locale === "ar" ? "السنة" : "Year"}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:border-[#df9a13] focus:outline-none focus:ring-2 focus:ring-[#df9a13]/30"
            inputMode="numeric"
          />
          <select
            aria-label={locale === "ar" ? "حالة المشروع" : "Project status"}
            value={form.status}
            onChange={(event) =>
              updateForm("status", event.target.value as ProjectStatus)
            }
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 focus:border-[#df9a13] focus:outline-none focus:ring-2 focus:ring-[#df9a13]/30"
          >
            <option value="DRAFT">DRAFT</option>
            <option value="PUBLISHED">PUBLISHED</option>
            <option value="ARCHIVED">ARCHIVED</option>
          </select>
        </div>

        <label className="mt-4 flex items-center gap-2 text-sm font-medium text-[#052a42]">
          <input
            type="checkbox"
            className="accent-[#df9a13]"
            checked={form.featured}
            onChange={(event) => updateForm("featured", event.target.checked)}
          />
          {locale === "ar" ? "مشروع مميز" : "Featured project"}
        </label>

        <label className="mt-4 grid gap-1.5 text-sm font-semibold text-[#052a42]">
          <span>{text.imageKitLabel}</span>
          <textarea
            value={form.imageUrls}
            onChange={(event) => updateForm("imageUrls", event.target.value)}
            placeholder="https://ik.imagekit.io/..."
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:border-[#df9a13] focus:outline-none focus:ring-2 focus:ring-[#df9a13]/30"
            rows={3}
          />
        </label>

        <div className="mt-5 flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-[#052a42] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0a3a5c] disabled:opacity-60"
          >
            {isEditing ? text.update : text.create}
          </button>
          <button
            type="button"
            className="rounded-xl border border-slate-200 px-6 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            onClick={() => setForm(EMPTY_FORM)}
          >
            {text.reset}
          </button>
        </div>
      </form>

      <ProjectsTable
        locale={locale}
        items={items}
        loading={loading}
        onInlineUpdate={handleInlineUpdate}
        onBulkAction={handleBulkAction}
        onEdit={(project) =>
          setForm({
            id: project.id,
            slug: project.slug,
            titleEn: project.titleEn,
            titleAr: project.titleAr,
            descriptionEn: project.descriptionEn,
            descriptionAr: project.descriptionAr,
            category: project.category,
            city: project.city,
            location: project.location,
            year: project.year ? String(project.year) : "",
            status: project.status,
            featured: project.featured,
            imageUrls: "",
          })
        }
      />

      <datalist id="project-categories">
        <option value="RESIDENTIAL" />
        <option value="COMMERCIAL" />
        <option value="INTERIOR" />
        <option value="ENGINEERING" />
        <option value="MEP" />
        <option value="RENOVATION" />
      </datalist>
    </section>
  );
}
