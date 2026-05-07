"use client";

import { useEffect, useState } from "react";

type AuditLogItem = {
  id: string;
  adminId: string | null;
  action: string;
  entityType: string;
  entityId: string;
  metadata: Record<string, unknown> | null;
  timestamp: string;
};

export function AuditLogViewer({ locale }: { locale: "ar" | "en" }) {
  const [items, setItems] = useState<AuditLogItem[]>([]);
  const [action, setAction] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [adminId, setAdminId] = useState("");

  async function load() {
    const params = new URLSearchParams();

    if (adminId) {
      params.set("adminId", adminId);
    }

    if (action) {
      params.set("action", action);
    }

    if (fromDate) {
      params.set("fromDate", fromDate);
    }

    if (toDate) {
      params.set("toDate", toDate);
    }

    const response = await fetch(`/api/admin/audit?${params.toString()}`, {
      cache: "no-store",
    });
    const payload = (await response.json()) as { success: boolean; data: AuditLogItem[] };

    if (payload.success) {
      setItems(payload.data);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <section className="grid gap-4">
      <header className="rounded-xl border border-primary/15 bg-white px-4 py-4">
        <h1 className="text-2xl font-bold text-primary">
          {locale === "ar" ? "سجل التدقيق" : "Audit Log"}
        </h1>
      </header>

      <div className="grid gap-2 rounded-xl border border-primary/15 bg-white p-4 md:grid-cols-5">
        <input
          aria-label={locale === "ar" ? "معرف المدير" : "Admin ID"}
          value={adminId}
          onChange={(event) => setAdminId(event.target.value)}
          placeholder={locale === "ar" ? "معرف المدير" : "Admin ID"}
          className="rounded-lg border border-primary/20 px-3 py-2"
        />
        <input
          value={action}
          onChange={(event) => setAction(event.target.value)}
          placeholder={locale === "ar" ? "نوع الإجراء" : "Action type"}
          className="rounded-lg border border-primary/20 px-3 py-2"
        />
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
        <button
          type="button"
          onClick={() => void load()}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white"
        >
          {locale === "ar" ? "تصفية" : "Filter"}
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-primary/15 bg-white">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-slate-50 text-primary/80">
            <tr>
              <th className="px-3 py-2 text-start">Action</th>
              <th className="px-3 py-2 text-start">Entity</th>
              <th className="px-3 py-2 text-start">Admin</th>
              <th className="px-3 py-2 text-start">Timestamp</th>
              <th className="px-3 py-2 text-start">Metadata</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t border-primary/10">
                <td className="px-3 py-2 font-semibold text-primary">{item.action}</td>
                <td className="px-3 py-2">
                  {item.entityType} / {item.entityId}
                </td>
                <td className="px-3 py-2">{item.adminId ?? "-"}</td>
                <td className="px-3 py-2">{new Date(item.timestamp).toLocaleString()}</td>
                <td className="px-3 py-2">
                  <pre className="max-w-xs overflow-x-auto whitespace-pre-wrap text-xs text-slate-600">
                    {JSON.stringify(item.metadata ?? {}, null, 2)}
                  </pre>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
