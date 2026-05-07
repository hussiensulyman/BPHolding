"use client";

import { useEffect, useMemo, useState } from "react";

type DocumentType =
  | "GOSI"
  | "VAT"
  | "ZAKAT"
  | "TRADE_LICENSE"
  | "SAUDIZATION"
  | "SAFETY_CERTIFICATE";

type CertificationItem = {
  id: string;
  title: string;
  titleAr: string | null;
  documentType: DocumentType;
  issueDate: string;
  expiryDate: string | null;
  fileUrl: string | null;
  showOnPublicGrid: boolean;
  isExpiringSoon?: boolean;
  daysToExpiry?: number;
};

const DOCUMENT_TYPES: DocumentType[] = [
  "GOSI",
  "VAT",
  "ZAKAT",
  "TRADE_LICENSE",
  "SAUDIZATION",
  "SAFETY_CERTIFICATE",
];

export function CertificationsManager({ locale }: { locale: "ar" | "en" }) {
  const [items, setItems] = useState<CertificationItem[]>([]);
  const [title, setTitle] = useState("");
  const [titleAr, setTitleAr] = useState("");
  const [documentType, setDocumentType] = useState<DocumentType>("GOSI");
  const [issueDate, setIssueDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [showOnPublicGrid, setShowOnPublicGrid] = useState(true);

  async function loadData() {
    const response = await fetch("/api/admin/certifications", { cache: "no-store" });
    const payload = (await response.json()) as {
      success: boolean;
      data: CertificationItem[];
    };

    if (payload.success) {
      setItems(payload.data);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  const expiringSoonCount = useMemo(
    () =>
      items.filter((item) => {
        if (!item.expiryDate) {
          return false;
        }

        const diff =
          (new Date(item.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24);

        return diff <= 30;
      }).length,
    [items],
  );

  async function createCertification(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await fetch("/api/admin/certifications", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        title,
        titleAr,
        documentType,
        issueDate,
        expiryDate: expiryDate || null,
        fileUrl: fileUrl || undefined,
        showOnPublicGrid,
      }),
    });

    setTitle("");
    setTitleAr("");
    setIssueDate("");
    setExpiryDate("");
    setFileUrl("");
    setShowOnPublicGrid(true);

    await loadData();
  }

  async function togglePublic(id: string, value: boolean) {
    await fetch(`/api/admin/certifications/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ showOnPublicGrid: value }),
    });

    await loadData();
  }

  return (
    <section className="grid gap-4">
      <header className="rounded-xl border border-primary/15 bg-white px-4 py-4">
        <h1 className="text-2xl font-bold text-primary">
          {locale === "ar" ? "إدارة الشهادات" : "Certifications Manager"}
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          {locale === "ar"
            ? `الشهادات القريبة من الانتهاء خلال 30 يوماً: ${expiringSoonCount}`
            : `Documents expiring in less than 30 days: ${expiringSoonCount}`}
        </p>
      </header>

      <form
        onSubmit={createCertification}
        className="grid gap-3 rounded-xl border border-primary/15 bg-white p-4 md:grid-cols-2"
      >
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder={locale === "ar" ? "العنوان (EN)" : "Title (EN)"}
          className="rounded-lg border border-primary/20 px-3 py-2"
          required
        />
        <input
          value={titleAr}
          onChange={(event) => setTitleAr(event.target.value)}
          placeholder={locale === "ar" ? "العنوان (AR)" : "Title (AR)"}
          className="rounded-lg border border-primary/20 px-3 py-2"
        />
        <select
          aria-label={locale === "ar" ? "نوع الوثيقة" : "Document type"}
          value={documentType}
          onChange={(event) => setDocumentType(event.target.value as DocumentType)}
          className="rounded-lg border border-primary/20 px-3 py-2"
        >
          {DOCUMENT_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <input
          type="date"
          aria-label={locale === "ar" ? "تاريخ الإصدار" : "Issue date"}
          value={issueDate}
          onChange={(event) => setIssueDate(event.target.value)}
          className="rounded-lg border border-primary/20 px-3 py-2"
          required
        />
        <input
          type="date"
          aria-label={locale === "ar" ? "تاريخ الانتهاء" : "Expiry date"}
          value={expiryDate}
          onChange={(event) => setExpiryDate(event.target.value)}
          className="rounded-lg border border-primary/20 px-3 py-2"
        />
        <label className="grid gap-1 text-sm font-semibold text-primary">
          <span>{locale === "ar" ? "رابط ملف PDF" : "PDF URL"}</span>
          <input
            type="url"
            value={fileUrl}
            onChange={(event) => setFileUrl(event.target.value)}
            className="rounded-lg border border-primary/20 px-3 py-2"
            placeholder="https://ik.imagekit.io/...pdf"
          />
        </label>

        <label className="flex items-center gap-2 text-sm font-semibold text-primary">
          <input
            type="checkbox"
            checked={showOnPublicGrid}
            onChange={(event) => setShowOnPublicGrid(event.target.checked)}
          />
          {locale === "ar" ? "إظهار في الشبكة العامة" : "Show in public grid"}
        </label>

        <div className="md:col-span-2">
          <button
            type="submit"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white"
          >
            {locale === "ar" ? "إضافة شهادة" : "Add Certification"}
          </button>
        </div>
      </form>

      <div className="overflow-x-auto rounded-xl border border-primary/15 bg-white">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-slate-50 text-primary/80">
            <tr>
              <th className="px-3 py-2 text-start">Title</th>
              <th className="px-3 py-2 text-start">Type</th>
              <th className="px-3 py-2 text-start">Issue</th>
              <th className="px-3 py-2 text-start">Expiry</th>
              <th className="px-3 py-2 text-start">Public</th>
              <th className="px-3 py-2 text-start">Download</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const daysToExpiry = item.expiryDate
                ? Math.ceil(
                    (new Date(item.expiryDate).getTime() - Date.now()) /
                      (1000 * 60 * 60 * 24),
                  )
                : Number.POSITIVE_INFINITY;
              const expiringSoon = Number.isFinite(daysToExpiry) && daysToExpiry <= 30;

              return (
                <tr
                  key={item.id}
                  className={`border-t border-primary/10 ${expiringSoon ? "bg-amber-50" : ""}`}
                >
                  <td className="px-3 py-2 font-semibold text-primary">
                    {locale === "ar" ? item.titleAr || item.title : item.title}
                  </td>
                  <td className="px-3 py-2">{item.documentType}</td>
                  <td className="px-3 py-2">
                    {new Date(item.issueDate).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-2">
                    {item.expiryDate
                      ? new Date(item.expiryDate).toLocaleDateString()
                      : "-"}
                    {expiringSoon ? (
                      <span className="ms-2 rounded bg-amber-200 px-2 py-0.5 text-xs font-semibold text-amber-900">
                        {locale === "ar" ? "قريب الانتهاء" : "Expiring Soon"}
                      </span>
                    ) : null}
                  </td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      className="rounded-lg border border-primary/20 px-2 py-1 text-xs font-semibold text-primary"
                      onClick={() => void togglePublic(item.id, !item.showOnPublicGrid)}
                    >
                      {item.showOnPublicGrid
                        ? locale === "ar"
                          ? "إظهار"
                          : "Visible"
                        : locale === "ar"
                          ? "مخفي"
                          : "Hidden"}
                    </button>
                  </td>
                  <td className="px-3 py-2">
                    {item.fileUrl ? (
                      <a
                        href={item.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg border border-primary/20 px-2 py-1 text-xs font-semibold text-primary"
                      >
                        {locale === "ar" ? "تحميل" : "Download"}
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
