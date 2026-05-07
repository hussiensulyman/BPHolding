"use client";

import { useMemo, useState } from "react";

type ProjectStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

type ProjectItem = {
  id: string;
  slug: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  location: string;
  category:
    | "RESIDENTIAL"
    | "COMMERCIAL"
    | "INTERIOR"
    | "ENGINEERING"
    | "MEP"
    | "RENOVATION";
  city: string;
  year?: number | null;
  status: ProjectStatus;
  featured: boolean;
};

type BulkAction = "PUBLISH" | "ARCHIVE" | "DRAFT" | "DELETE";

type ProjectsTableProps = {
  locale: "ar" | "en";
  items: ProjectItem[];
  loading?: boolean;
  onInlineUpdate: (
    id: string,
    data: Partial<Pick<ProjectItem, "status" | "featured">>,
  ) => Promise<void>;
  onBulkAction: (ids: string[], action: BulkAction) => Promise<void>;
  onEdit: (project: ProjectItem) => void;
};

const TABLE_COPY = {
  en: {
    title: "Projects",
    selectAll: "Select all",
    status: "Status",
    featured: "Featured",
    actions: "Actions",
    edit: "Edit",
    bulk: "Bulk Action",
    apply: "Apply",
    publish: "Publish",
    archive: "Archive",
    draft: "Move to Draft",
    remove: "Delete",
    titleHeader: "Title",
    category: "Category",
    city: "City",
    year: "Year",
    featuredYes: "Yes",
    featuredNo: "No",
  },
  ar: {
    title: "المشاريع",
    selectAll: "تحديد الكل",
    status: "الحالة",
    featured: "مميز",
    actions: "الإجراءات",
    edit: "تعديل",
    bulk: "إجراء جماعي",
    apply: "تنفيذ",
    publish: "نشر",
    archive: "أرشفة",
    draft: "تحويل لمسودة",
    remove: "حذف",
    titleHeader: "العنوان",
    category: "الفئة",
    city: "المدينة",
    year: "السنة",
    featuredYes: "نعم",
    featuredNo: "لا",
  },
} as const;

export function ProjectsTable({
  locale,
  items,
  loading,
  onInlineUpdate,
  onBulkAction,
  onEdit,
}: ProjectsTableProps) {
  const text = TABLE_COPY[locale];
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<BulkAction>("PUBLISH");

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  function toggleSelect(id: string) {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  function toggleAll() {
    setSelectedIds((current) =>
      current.length === items.length ? [] : items.map((item) => item.id),
    );
  }

  async function runBulkAction() {
    if (selectedIds.length === 0) {
      return;
    }

    await onBulkAction(selectedIds, bulkAction);
    setSelectedIds([]);
  }

  return (
    <section className="grid gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-bold text-primary">{text.title}</h2>

        <div className="flex items-center gap-2">
          <label
            className="text-sm font-semibold text-primary"
            htmlFor="projects-bulk-action"
          >
            {text.bulk}
          </label>
          <select
            id="projects-bulk-action"
            className="rounded-lg border border-primary/25 bg-white px-3 py-1 text-sm"
            value={bulkAction}
            onChange={(event) => setBulkAction(event.target.value as BulkAction)}
          >
            <option value="PUBLISH">{text.publish}</option>
            <option value="ARCHIVE">{text.archive}</option>
            <option value="DRAFT">{text.draft}</option>
            <option value="DELETE">{text.remove}</option>
          </select>
          <button
            type="button"
            className="rounded-lg bg-primary px-3 py-1 text-sm font-semibold text-white"
            onClick={() => void runBulkAction()}
          >
            {text.apply}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-primary/15 bg-white">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-slate-50 text-primary/80">
            <tr>
              <th className="px-3 py-2 text-start">
                <input
                  aria-label={text.selectAll}
                  type="checkbox"
                  checked={items.length > 0 && selectedIds.length === items.length}
                  onChange={toggleAll}
                />
              </th>
              <th className="px-3 py-2 text-start">{text.titleHeader}</th>
              <th className="px-3 py-2 text-start">{text.category}</th>
              <th className="px-3 py-2 text-start">{text.city}</th>
              <th className="px-3 py-2 text-start">{text.year}</th>
              <th className="px-3 py-2 text-start">{text.status}</th>
              <th className="px-3 py-2 text-start">{text.featured}</th>
              <th className="px-3 py-2 text-start">{text.actions}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t border-primary/10">
                <td className="px-3 py-2">
                  <input
                    aria-label={`${text.selectAll}-${item.id}`}
                    type="checkbox"
                    checked={selectedSet.has(item.id)}
                    onChange={() => toggleSelect(item.id)}
                  />
                </td>
                <td className="px-3 py-2">
                  <p className="font-semibold text-primary">
                    {locale === "ar" ? item.titleAr : item.titleEn}
                  </p>
                  <p className="text-xs text-slate-500">{item.slug}</p>
                </td>
                <td className="px-3 py-2">{item.category}</td>
                <td className="px-3 py-2">{item.city}</td>
                <td className="px-3 py-2">{item.year ?? "-"}</td>
                <td className="px-3 py-2">
                  <select
                    aria-label={`${text.status}-${item.id}`}
                    value={item.status}
                    onChange={(event) =>
                      void onInlineUpdate(item.id, {
                        status: event.target.value as ProjectStatus,
                      })
                    }
                    className="rounded-lg border border-primary/20 bg-white px-2 py-1"
                  >
                    <option value="DRAFT">DRAFT</option>
                    <option value="PUBLISHED">PUBLISHED</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                  </select>
                </td>
                <td className="px-3 py-2">
                  <button
                    type="button"
                    className="rounded-lg border border-primary/20 px-2 py-1 text-xs font-semibold"
                    onClick={() =>
                      void onInlineUpdate(item.id, { featured: !item.featured })
                    }
                  >
                    {item.featured ? text.featuredYes : text.featuredNo}
                  </button>
                </td>
                <td className="px-3 py-2">
                  <button
                    type="button"
                    className="rounded-lg border border-primary/20 px-2 py-1 text-xs font-semibold text-primary"
                    onClick={() => onEdit(item)}
                  >
                    {text.edit}
                  </button>
                </td>
              </tr>
            ))}
            {!loading && items.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-3 py-8 text-center text-slate-500">
                  No projects found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
