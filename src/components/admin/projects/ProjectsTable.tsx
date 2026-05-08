"use client";

import Image from "next/image";
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
  coverImageUrl?: string | null;
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
    image: "Image",
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
    image: "الصورة",
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
    <div className="grid gap-4">
      {/* Table toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-extrabold text-[#052a42]">{text.title}</h2>

        <div className="flex items-center gap-2">
          <label
            className="text-sm font-medium text-slate-600"
            htmlFor="projects-bulk-action"
          >
            {text.bulk}
          </label>
          <select
            id="projects-bulk-action"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-[#df9a13] focus:outline-none focus:ring-2 focus:ring-[#df9a13]/30"
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
            className="rounded-lg bg-[#052a42] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0a3a5c] disabled:opacity-50"
            disabled={selectedIds.length === 0}
            onClick={() => void runBulkAction()}
          >
            {text.apply}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="px-4 py-3 text-start">
                <input
                  aria-label={text.selectAll}
                  type="checkbox"
                  className="accent-[#052a42]"
                  checked={items.length > 0 && selectedIds.length === items.length}
                  onChange={toggleAll}
                />
              </th>
              <th className="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-slate-500">
                {text.image}
              </th>
              <th className="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-slate-500">
                {text.titleHeader}
              </th>
              <th className="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-slate-500">
                {text.category}
              </th>
              <th className="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-slate-500">
                {text.city}
              </th>
              <th className="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-slate-500">
                {text.year}
              </th>
              <th className="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-slate-500">
                {text.status}
              </th>
              <th className="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-slate-500">
                {text.featured}
              </th>
              <th className="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-slate-500">
                {text.actions}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => (
              <tr key={item.id} className="transition hover:bg-[#df9a13]/5">
                <td className="px-4 py-3">
                  <input
                    aria-label={`${text.selectAll}-${item.id}`}
                    type="checkbox"
                    className="accent-[#052a42]"
                    checked={selectedSet.has(item.id)}
                    onChange={() => toggleSelect(item.id)}
                  />
                </td>
                <td className="px-4 py-3">
                  {item.coverImageUrl ? (
                    <div className="relative h-12 w-16 overflow-hidden rounded-md ring-1 ring-slate-200">
                      <Image
                        src={item.coverImageUrl}
                        alt={locale === "ar" ? item.titleAr : item.titleEn}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                  ) : (
                    <div className="flex h-12 w-16 items-center justify-center rounded-md bg-slate-100 text-[10px] font-semibold text-slate-400 ring-1 ring-slate-200">
                      N/A
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <p className="font-semibold text-[#052a42]">
                    {locale === "ar" ? item.titleAr : item.titleEn}
                  </p>
                  <p className="text-xs text-slate-400">{item.slug}</p>
                </td>
                <td className="px-4 py-3 text-slate-600">{item.category}</td>
                <td className="px-4 py-3 text-slate-600">{item.city}</td>
                <td className="px-4 py-3 text-slate-600">{item.year ?? "—"}</td>
                <td className="px-4 py-3">
                  <select
                    aria-label={`${text.status}-${item.id}`}
                    value={item.status}
                    onChange={(event) =>
                      void onInlineUpdate(item.id, {
                        status: event.target.value as ProjectStatus,
                      })
                    }
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs focus:border-[#df9a13] focus:outline-none"
                  >
                    <option value="DRAFT">DRAFT</option>
                    <option value="PUBLISHED">PUBLISHED</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                  </select>
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                      item.featured
                        ? "bg-[#df9a13]/15 text-[#a07010] hover:bg-[#df9a13]/25"
                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                    }`}
                    onClick={() =>
                      void onInlineUpdate(item.id, { featured: !item.featured })
                    }
                  >
                    {item.featured ? text.featuredYes : text.featuredNo}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    className="rounded-lg border border-[#052a42]/20 px-3 py-1.5 text-xs font-semibold text-[#052a42] transition hover:bg-[#052a42] hover:text-white"
                    onClick={() => onEdit(item)}
                  >
                    {text.edit}
                  </button>
                </td>
              </tr>
            ))}
            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-slate-400">
                  No projects found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
