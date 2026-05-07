"use client";

import { useEffect, useMemo, useState } from "react";

type SubmissionType = "RFQ" | "JOB" | "CONTRACTOR";
type SubmissionStatus = "NEW" | "REVIEWED" | "CONTACTED" | "ARCHIVED";

type SubmissionItem = {
  id: string;
  type: SubmissionType;
  title: string;
  email: string;
  phone: string;
  status: SubmissionStatus;
  submittedAt: string;
  reviewedAt: string | null;
  contactedAt: string | null;
  internalNotes: string | null;
  payload: Record<string, unknown>;
};

const TABS: SubmissionType[] = ["RFQ", "JOB", "CONTRACTOR"];

function getPayloadFileUrls(payload: Record<string, unknown>): string[] {
  const fileUrls: string[] = [];

  for (const [key, value] of Object.entries(payload)) {
    if (key.toLowerCase().includes("file") || key.toLowerCase().includes("resume")) {
      if (typeof value === "string" && /^https?:\/\//i.test(value)) {
        fileUrls.push(value);
      }

      if (Array.isArray(value)) {
        for (const item of value) {
          if (typeof item === "string" && /^https?:\/\//i.test(item)) {
            fileUrls.push(item);
          }
        }
      }
    }
  }

  return [...new Set(fileUrls)];
}

export function SubmissionsInbox({ locale }: { locale: "ar" | "en" }) {
  const [activeTab, setActiveTab] = useState<SubmissionType>("RFQ");
  const [statusFilter, setStatusFilter] = useState<SubmissionStatus | "">("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [items, setItems] = useState<SubmissionItem[]>([]);
  const [selected, setSelected] = useState<SubmissionItem | null>(null);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const copy = {
    title: locale === "ar" ? "صندوق الوارد" : "Submissions Inbox",
    exportCsv: locale === "ar" ? "تصدير CSV" : "Export CSV",
    details: locale === "ar" ? "تفاصيل" : "Details",
    markContacted: locale === "ar" ? "تم التواصل" : "Mark Contacted",
    close: locale === "ar" ? "إغلاق" : "Close",
    save: locale === "ar" ? "حفظ" : "Save",
    notes: locale === "ar" ? "ملاحظات داخلية" : "Internal notes",
  };

  async function loadItems() {
    const params = new URLSearchParams({ type: activeTab });

    if (statusFilter) {
      params.set("status", statusFilter);
    }

    if (fromDate) {
      params.set("fromDate", fromDate);
    }

    if (toDate) {
      params.set("toDate", toDate);
    }

    const response = await fetch(`/api/admin/submissions?${params.toString()}`, {
      cache: "no-store",
    });
    const payload = (await response.json()) as {
      success: boolean;
      data: { items: SubmissionItem[] };
    };

    if (payload.success) {
      setItems(payload.data.items);
    }
  }

  useEffect(() => {
    void loadItems();
  }, [activeTab, statusFilter, fromDate, toDate]);

  const summary = useMemo(() => {
    return {
      total: items.length,
      pending: items.filter((item) => item.status === "NEW").length,
    };
  }, [items]);

  async function updateSubmission(status: SubmissionStatus) {
    if (!selected) {
      return;
    }

    setSaving(true);

    await fetch(`/api/admin/submissions/${selected.type.toLowerCase()}/${selected.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        status,
        internalNotes: notes,
      }),
    });

    setSaving(false);
    await loadItems();
  }

  async function markContacted() {
    if (!selected) {
      return;
    }

    setSaving(true);

    await fetch(`/api/admin/submissions/${selected.type.toLowerCase()}/${selected.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ markContacted: true, internalNotes: notes }),
    });

    setSaving(false);
    await loadItems();
  }

  function openCsvExport() {
    const params = new URLSearchParams({ type: activeTab });

    if (statusFilter) {
      params.set("status", statusFilter);
    }

    window.open(`/api/admin/submissions/export?${params.toString()}`, "_blank");
  }

  return (
    <section className="grid gap-4">
      <header className="rounded-xl border border-primary/15 bg-white px-4 py-4">
        <h1 className="text-2xl font-bold text-primary">{copy.title}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-600">
          <span>
            {locale === "ar" ? `الإجمالي: ${summary.total}` : `Total: ${summary.total}`}
          </span>
          <span>
            {locale === "ar" ? `الجديد: ${summary.pending}` : `New: ${summary.pending}`}
          </span>
        </div>
      </header>

      <div className="rounded-xl border border-primary/15 bg-white px-4 py-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`rounded-lg px-3 py-1 text-sm font-semibold ${
                  activeTab === tab
                    ? "bg-primary text-white"
                    : "border border-primary/20 text-primary"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={openCsvExport}
            className="rounded-lg border border-primary/20 px-3 py-1 text-sm font-semibold text-primary"
          >
            {copy.exportCsv}
          </button>
        </div>

        <div className="mt-3 grid gap-2 md:grid-cols-4">
          <input
            type="date"
            aria-label={locale === "ar" ? "من تاريخ" : "From date"}
            value={fromDate}
            onChange={(event) => setFromDate(event.target.value)}
            className="rounded-lg border border-primary/20 px-3 py-2"
          />
          <input
            type="date"
            aria-label={locale === "ar" ? "إلى تاريخ" : "To date"}
            value={toDate}
            onChange={(event) => setToDate(event.target.value)}
            className="rounded-lg border border-primary/20 px-3 py-2"
          />
          <select
            aria-label={locale === "ar" ? "تصفية الحالة" : "Status filter"}
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as SubmissionStatus | "")
            }
            className="rounded-lg border border-primary/20 px-3 py-2"
          >
            <option value="">{locale === "ar" ? "كل الحالات" : "All statuses"}</option>
            <option value="NEW">NEW</option>
            <option value="REVIEWED">REVIEWED</option>
            <option value="CONTACTED">CONTACTED</option>
            <option value="ARCHIVED">ARCHIVED</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-primary/15 bg-white">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-slate-50 text-primary/80">
            <tr>
              <th className="px-3 py-2 text-start">Title</th>
              <th className="px-3 py-2 text-start">Email</th>
              <th className="px-3 py-2 text-start">Status</th>
              <th className="px-3 py-2 text-start">Submitted</th>
              <th className="px-3 py-2 text-start">Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t border-primary/10">
                <td className="px-3 py-2 font-semibold text-primary">{item.title}</td>
                <td className="px-3 py-2">{item.email}</td>
                <td className="px-3 py-2">{item.status}</td>
                <td className="px-3 py-2">
                  {new Date(item.submittedAt).toLocaleString()}
                </td>
                <td className="px-3 py-2">
                  <button
                    type="button"
                    className="rounded-lg border border-primary/20 px-2 py-1 text-xs font-semibold text-primary"
                    onClick={() => {
                      setSelected(item);
                      setNotes(item.internalNotes ?? "");
                    }}
                  >
                    {copy.details}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected ? (
        <div className="fixed inset-0 z-40 bg-black/30 p-4">
          <div className="mx-auto mt-8 grid max-h-[80vh] w-full max-w-3xl gap-3 overflow-auto rounded-2xl border border-primary/20 bg-white p-4">
            {(() => {
              const fileUrls = getPayloadFileUrls(selected.payload);

              return fileUrls.length > 0 ? (
                <div className="rounded-lg border border-primary/10 bg-slate-50 p-3">
                  <p className="mb-2 text-xs font-semibold text-slate-700">
                    {locale === "ar" ? "الملفات المرفوعة" : "Uploaded files"}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {fileUrls.map((fileUrl, index) => (
                      <a
                        key={`${fileUrl}-${index}`}
                        href={fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg border border-primary/20 px-2 py-1 text-xs font-semibold text-primary"
                      >
                        {locale === "ar"
                          ? `فتح ملف ${index + 1}`
                          : `Open file ${index + 1}`}
                      </a>
                    ))}
                  </div>
                </div>
              ) : null;
            })()}

            <h3 className="text-lg font-bold text-primary">{selected.title}</h3>
            <p className="text-sm text-slate-600">{selected.email}</p>
            <p className="text-sm text-slate-600">{selected.phone}</p>

            <label className="grid gap-1 text-sm font-semibold text-primary">
              <span>Status</span>
              <select
                value={selected.status}
                onChange={async (event) => {
                  const status = event.target.value as SubmissionStatus;
                  await updateSubmission(status);
                  setSelected((current) => (current ? { ...current, status } : current));
                }}
                className="rounded-lg border border-primary/20 px-3 py-2"
              >
                <option value="NEW">NEW</option>
                <option value="REVIEWED">REVIEWED</option>
                <option value="CONTACTED">CONTACTED</option>
                <option value="ARCHIVED">ARCHIVED</option>
              </select>
            </label>

            <label className="grid gap-1 text-sm font-semibold text-primary">
              <span>{copy.notes}</span>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                className="rounded-lg border border-primary/20 px-3 py-2"
                rows={4}
              />
            </label>

            <div className="rounded-lg border border-primary/10 bg-slate-50 p-3 text-xs text-slate-700">
              <pre className="overflow-x-auto whitespace-pre-wrap">
                {JSON.stringify(selected.payload, null, 2)}
              </pre>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={saving}
                onClick={() => void updateSubmission(selected.status)}
                className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white"
              >
                {copy.save}
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => void markContacted()}
                className="rounded-lg border border-primary/20 px-3 py-2 text-sm font-semibold text-primary"
              >
                {copy.markContacted}
              </button>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-lg border border-primary/20 px-3 py-2 text-sm font-semibold text-primary"
              >
                {copy.close}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
