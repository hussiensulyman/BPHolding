import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ProjectsTable } from "@/components/admin/projects/ProjectsTable";

type ProjectsTableItems = Parameters<typeof ProjectsTable>[0]["items"];

const items: ProjectsTableItems = [
  {
    id: "p1",
    slug: "riyadh-office-fitout",
    titleEn: "Riyadh Office Fitout",
    titleAr: "تشطيبات مكتب الرياض",
    descriptionEn: "Office fitout in Riyadh",
    descriptionAr: "تشطيبات مكتبية في الرياض",
    location: "Olaya",
    category: "COMMERCIAL",
    city: "Riyadh",
    year: 2026,
    status: "DRAFT" as const,
    featured: false,
  },
  {
    id: "p2",
    slug: "jeddah-villa",
    titleEn: "Jeddah Villa",
    titleAr: "فيلا جدة",
    descriptionEn: "Residential villa delivery",
    descriptionAr: "تنفيذ فيلا سكنية",
    location: "Al Nahda",
    category: "RESIDENTIAL",
    city: "Jeddah",
    year: 2025,
    status: "PUBLISHED" as const,
    featured: true,
  },
];

describe("ProjectsTable", () => {
  it("supports inline status update and featured toggle", async () => {
    const onInlineUpdate = vi.fn().mockResolvedValue(undefined);

    render(
      <ProjectsTable
        locale="en"
        items={items}
        onInlineUpdate={onInlineUpdate}
        onBulkAction={vi.fn().mockResolvedValue(undefined)}
        onEdit={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByLabelText("Status-p1"), {
      target: { value: "PUBLISHED" },
    });

    fireEvent.click(screen.getAllByRole("button", { name: "No" })[0]!);

    await waitFor(() => {
      expect(onInlineUpdate).toHaveBeenCalledWith("p1", { status: "PUBLISHED" });
      expect(onInlineUpdate).toHaveBeenCalledWith("p1", { featured: true });
    });
  });

  it("runs bulk action for selected rows and renders bilingual labels", async () => {
    const onBulkAction = vi.fn().mockResolvedValue(undefined);

    render(
      <ProjectsTable
        locale="ar"
        items={items}
        onInlineUpdate={vi.fn().mockResolvedValue(undefined)}
        onBulkAction={onBulkAction}
        onEdit={vi.fn()}
      />,
    );

    expect(screen.getByText("المشاريع")).toBeInTheDocument();

    const checkboxes = screen.getAllByRole("checkbox");
    fireEvent.click(checkboxes[1]!);
    fireEvent.change(screen.getByLabelText("إجراء جماعي"), {
      target: { value: "ARCHIVE" },
    });
    fireEvent.click(screen.getByRole("button", { name: "تنفيذ" }));

    await waitFor(() => {
      expect(onBulkAction).toHaveBeenCalledWith(["p1"], "ARCHIVE");
    });
  });
});
