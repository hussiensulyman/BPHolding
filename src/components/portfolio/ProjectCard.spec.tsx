import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ProjectCard } from "@/components/portfolio/ProjectCard";
import type { PortfolioProject } from "@/lib/data/portfolio-service";

const imageSpy = vi.fn();

vi.mock("@imagekit/next", () => ({
  Image: (props: Record<string, unknown>) => {
    imageSpy(props);

    return <div data-testid="ik-image" role="img" aria-label={String(props.alt ?? "")} />;
  },
}));

vi.mock("@/components/layout/LocalizedLink", () => ({
  LocalizedLink: ({ href, children, ...props }: Record<string, unknown>) => (
    <a href={String(href)} {...props}>
      {children as string}
    </a>
  ),
}));

const project: PortfolioProject = {
  id: "project-1",
  slug: "al-fursan-residential-compound-riyadh",
  titleEn: "Al-Fursan Residential Compound - Riyadh",
  titleAr: "مجمع الفرسان السكني - الرياض",
  descriptionEn:
    "Integrated residential delivery including civil works, MEP systems, and high-end interior finishing for villa clusters in Al-Fursan district.",
  descriptionAr:
    "تسليم سكني متكامل يشمل الأعمال المدنية، أنظمة الميكانيكا والكهرباء والسباكة، وتشطيبات داخلية راقية لمجمعات الفلل في حي الفرسان.",
  location: "Al-Fursan District",
  city: "Riyadh",
  category: "RESIDENTIAL",
  year: 2024,
  coverImagePath: "/portfolio/al-fursan/cover.jpg",
  gallery: ["/portfolio/al-fursan/cover.jpg"],
  specs: {
    area: "32,400 m2",
    timelineEn: "Q1 2023 - Q1 2024",
    timelineAr: "الربع الأول 2023 - الربع الأول 2024",
    servicesEn: ["Civil Works", "Mechanical, Electrical, Plumbing"],
    servicesAr: ["الأعمال المدنية", "أنظمة الميكانيكا والكهرباء والسباكة"],
  },
};

describe("ProjectCard", () => {
  it("renders bilingual content from seeded project values", () => {
    const { rerender } = render(<ProjectCard project={project} locale="en" />);

    expect(
      screen.getByText("Al-Fursan Residential Compound - Riyadh"),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View Project" })).toBeInTheDocument();

    rerender(<ProjectCard project={project} locale="ar" />);

    expect(screen.getByText("مجمع الفرسان السكني - الرياض")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "عرض المشروع" })).toBeInTheDocument();
  });

  it("shows hover CTA overlay on interaction", () => {
    const { container } = render(<ProjectCard project={project} locale="en" />);

    const card = screen.getByTestId("portfolio-project-item");
    const overlay = container.querySelector('div[aria-hidden="true"]');

    expect(overlay).toHaveClass("opacity-0");

    fireEvent.mouseEnter(card);

    expect(overlay).toHaveClass("opacity-100");
  });

  it("applies RTL layout in Arabic mode", () => {
    render(<ProjectCard project={project} locale="ar" />);

    expect(screen.getByTestId("portfolio-project-item")).toHaveAttribute("dir", "rtl");
  });

  it("passes ImageKit responsive transformations", () => {
    render(<ProjectCard project={project} locale="en" />);

    const props = imageSpy.mock.calls[0]?.[0] as {
      transformation: Array<{ width: number; quality: number; format: string }>;
      src: string;
    };

    expect(props.src).toBe("/portfolio/al-fursan/cover.jpg");
    expect(props.transformation[0]).toEqual({
      width: 800,
      quality: 85,
      format: "webp",
    });
  });
});
