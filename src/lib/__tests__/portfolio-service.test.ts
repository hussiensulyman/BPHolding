import { beforeEach, describe, expect, it, vi } from "vitest";

import { PortfolioService, getPortfolioProjects } from "@/lib/data/portfolio-service";
import type {
  IProjectRepository,
  ProjectCategoryValue,
  ProjectRecord,
  PublishStatusValue,
} from "@/lib/repositories/contracts/project-repository";

function createProjectRecord(
  overrides: Partial<ProjectRecord> & Pick<ProjectRecord, "id" | "slug">,
): ProjectRecord {
  return {
    id: overrides.id,
    slug: overrides.slug,
    titleEn: overrides.titleEn ?? "Project EN",
    titleAr: overrides.titleAr ?? "مشروع",
    descriptionEn: overrides.descriptionEn ?? "English description",
    descriptionAr: overrides.descriptionAr ?? "وصف عربي",
    location: overrides.location ?? "District",
    city: overrides.city ?? "Riyadh",
    category: overrides.category ?? "RESIDENTIAL",
    status: overrides.status ?? "PUBLISHED",
    featured: overrides.featured ?? false,
    completedAt:
      "completedAt" in overrides
        ? (overrides.completedAt ?? null)
        : new Date("2024-01-01T00:00:00.000Z"),
    sortOrder: overrides.sortOrder ?? 1,
    ownerId: overrides.ownerId ?? null,
    createdAt: overrides.createdAt ?? new Date("2024-01-01T00:00:00.000Z"),
    updatedAt: overrides.updatedAt ?? new Date("2024-01-01T00:00:00.000Z"),
  };
}

function createRepository(
  seed: {
    source?: ProjectRecord[];
    filtered?: ProjectRecord[];
    related?: ProjectRecord[];
    findBySlug?: ProjectRecord | null;
  } = {},
): IProjectRepository {
  return {
    findById: vi.fn(async () => seed.source?.[0] ?? null),
    findBySlug: vi.fn(async () => seed.findBySlug ?? seed.source?.[0] ?? null),
    listPublished: vi.fn(async () => seed.source ?? []),
    listPublishedFiltered: vi.fn(async () => ({
      items: seed.filtered ?? seed.source ?? [],
      total: (seed.filtered ?? seed.source ?? []).length,
    })),
    listRelatedByCategory: vi.fn(async () => seed.related ?? []),
    listAdmin: vi.fn(async () => ({
      items: seed.filtered ?? seed.source ?? [],
      total: (seed.filtered ?? seed.source ?? []).length,
    })),
    create: vi.fn(async () =>
      createProjectRecord({
        id: "created",
        slug: "created",
        category: "COMMERCIAL",
        status: "DRAFT",
      }),
    ),
    update: vi.fn(async () => seed.findBySlug ?? seed.source?.[0] ?? null),
    delete: vi.fn(async () => true),
  };
}

describe("PortfolioService", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it("lists projects using repository filters and maps available years", async () => {
    const first = createProjectRecord({
      id: "p1",
      slug: "al-fursan-residential-compound-riyadh",
      category: "RESIDENTIAL",
      city: "Riyadh",
      completedAt: new Date("2024-03-10T00:00:00.000Z"),
      featured: true,
      sortOrder: 1,
    });

    const second = createProjectRecord({
      id: "p2",
      slug: "al-malqa-mixed-use-development-riyadh",
      category: "COMMERCIAL",
      city: "Riyadh",
      completedAt: new Date("2023-11-18T00:00:00.000Z"),
      featured: false,
      sortOrder: 2,
    });

    const repository = createRepository({
      source: [first, second],
      filtered: [first],
    });

    const service = new PortfolioService(repository);
    const result = await service.listProjects({
      category: "RESIDENTIAL",
      location: "Riyadh",
      year: 2024,
      search: "fursan",
      page: 1,
      pageSize: 12,
    });

    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.slug).toBe("al-fursan-residential-compound-riyadh");
    expect(result.items[0]?.coverImagePath).toBe("/portfolio/al-fursan/cover.jpg");
    expect(result.availableYears).toEqual([2024, 2023]);
    expect(result.totalPages).toBe(1);

    expect(repository.listPublishedFiltered).toHaveBeenCalledWith({
      category: "RESIDENTIAL",
      city: "Riyadh",
      year: 2024,
      search: "fursan",
      page: 1,
      pageSize: 12,
    });
  });

  it("returns null when project is not published", async () => {
    const draft = createProjectRecord({
      id: "draft-1",
      slug: "draft-project",
      status: "DRAFT",
    });

    const service = new PortfolioService(createRepository({ findBySlug: draft }));

    await expect(service.getProjectBySlug("draft-project")).resolves.toBeNull();
  });

  it("returns related projects from repository for a published project", async () => {
    const source = createProjectRecord({
      id: "p1",
      slug: "source-project",
      category: "RESIDENTIAL",
      status: "PUBLISHED",
    });
    const related = createProjectRecord({
      id: "p2",
      slug: "related-project",
      category: "RESIDENTIAL",
      status: "PUBLISHED",
    });

    const repository = createRepository({
      findBySlug: source,
      related: [related],
    });

    const service = new PortfolioService(repository);
    const items = await service.getRelatedProjects("source-project", 2);

    expect(items).toHaveLength(1);
    expect(items[0]?.slug).toBe("related-project");
    expect(repository.listRelatedByCategory).toHaveBeenCalledWith(
      "RESIDENTIAL",
      "source-project",
      2,
    );
  });

  it("falls back to in-memory projects when repository throws prisma env errors", async () => {
    const repository = createRepository();
    const fallbackError = new Error("Environment variable not found: DATABASE_URL");

    vi.mocked(repository.listPublishedFiltered).mockRejectedValue(fallbackError);
    vi.mocked(repository.listPublished).mockRejectedValue(fallbackError);

    const service = new PortfolioService(repository);
    const result = await service.listProjects({
      category: "RESIDENTIAL",
      location: "Riyadh",
      page: 1,
      pageSize: 10,
    });

    expect(result.total).toBeGreaterThan(0);
    expect(result.items.every((item) => item.category === "RESIDENTIAL")).toBe(true);
    expect(result.items.every((item) => item.city === "Riyadh")).toBe(true);
  });

  it("falls back for slug and related queries on prisma errors", async () => {
    const repository = createRepository();
    vi.mocked(repository.findBySlug).mockRejectedValue(
      new Error("prisma request failed"),
    );
    vi.mocked(repository.listRelatedByCategory).mockRejectedValue(
      new Error("prisma query failed"),
    );

    const service = new PortfolioService(repository);
    const project = await service.getProjectBySlug(
      "al-fursan-residential-compound-riyadh",
    );
    const related = await service.getRelatedProjects(
      "al-fursan-residential-compound-riyadh",
      3,
    );

    expect(project?.slug).toBe("al-fursan-residential-compound-riyadh");
    expect(
      related.some((item) => item.slug === "al-arid-residential-expansion-riyadh"),
    ).toBe(true);
  });

  it("rethrows non-fallback repository errors", async () => {
    const repository = createRepository();
    vi.mocked(repository.listPublishedFiltered).mockRejectedValue(
      new Error("service unavailable"),
    );
    vi.mocked(repository.listPublished).mockResolvedValue([]);

    const service = new PortfolioService(repository);

    await expect(service.listProjects({ page: 1, pageSize: 10 })).rejects.toThrow(
      "service unavailable",
    );
  });

  it("returns localized portfolio projects through factory path", async () => {
    vi.stubEnv("DATABASE_URL", "");

    const english = await getPortfolioProjects("en");
    const arabic = await getPortfolioProjects("ar");

    expect(english.length).toBeGreaterThan(0);
    expect(arabic.length).toBeGreaterThan(0);

    const firstEn = english[0];
    const firstAr = arabic[0];

    expect(firstEn?.title).not.toBe(firstAr?.title);
    expect(english.some((item) => item.sector === "infrastructure")).toBe(true);
    expect(english.every((item) => item.status === "completed")).toBe(true);
  });

  it("returns empty related list when source project is missing", async () => {
    const repository = createRepository({ findBySlug: null });
    const service = new PortfolioService(repository);

    await expect(service.getRelatedProjects("missing-project")).resolves.toEqual([]);
  });

  it("applies default page size and minimum page guards", async () => {
    const record = createProjectRecord({ id: "g1", slug: "guard-project" });
    const repository = createRepository({ source: [record], filtered: [record] });

    const service = new PortfolioService(repository, 5);
    const result = await service.listProjects({ page: 0, pageSize: 0 });

    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(1);
  });

  it("maps non-residential categories to expected sectors via getPortfolioProjects", async () => {
    vi.stubEnv("DATABASE_URL", "");

    const projects = await getPortfolioProjects("en");
    const sectors = new Set(projects.map((project) => project.sector));

    expect(sectors.has("commercial")).toBe(true);
    expect(sectors.has("residential")).toBe(true);
    expect(sectors.has("infrastructure")).toBe(true);
  });

  it("respects published status in related fallback filtering", async () => {
    const repository = createRepository();
    const source = createProjectRecord({
      id: "source",
      slug: "al-fursan-residential-compound-riyadh",
      category: "RESIDENTIAL",
      status: "PUBLISHED",
    });
    vi.mocked(repository.findBySlug).mockResolvedValue(source);
    vi.mocked(repository.listRelatedByCategory).mockRejectedValue(
      new Error("prisma fallback expected"),
    );

    const service = new PortfolioService(repository);
    const related = await service.getRelatedProjects(source.slug, 10);

    expect(related.length).toBeGreaterThan(0);
    expect(related.every((project) => project.slug !== source.slug)).toBe(true);
    expect(related.every((project) => project.category === source.category)).toBe(true);
  });

  it("keeps order stable in fallback sorting by featured then sortOrder", async () => {
    const repository = createRepository();
    vi.mocked(repository.listPublishedFiltered).mockRejectedValue(
      new Error("prisma: fail"),
    );
    vi.mocked(repository.listPublished).mockRejectedValue(new Error("prisma: fail"));

    const service = new PortfolioService(repository);
    const result = await service.listProjects({ page: 1, pageSize: 5 });

    expect(result.items[0]?.slug).toBe("al-fursan-residential-compound-riyadh");
  });

  it("rejects non-prisma errors in findBySlug fallback path", async () => {
    const repository = createRepository();
    vi.mocked(repository.findBySlug).mockRejectedValue(
      new Error("unexpected upstream error"),
    );

    const service = new PortfolioService(repository);

    await expect(service.getProjectBySlug("any-slug")).rejects.toThrow(
      "unexpected upstream error",
    );
  });

  it("returns null when fallback slug does not exist", async () => {
    const repository = createRepository();
    vi.mocked(repository.findBySlug).mockRejectedValue(new Error("prisma failed"));

    const service = new PortfolioService(repository);
    const project = await service.getProjectBySlug("missing-fallback-slug");

    expect(project).toBeNull();
  });

  it("can map records that rely on default image enhancements", async () => {
    const record = createProjectRecord({
      id: "x1",
      slug: "custom-slug-without-enhancement",
      category: "ENGINEERING",
      status: "PUBLISHED",
    });
    const repository = createRepository({ source: [record], filtered: [record] });

    const service = new PortfolioService(repository);
    const result = await service.listProjects({ page: 1, pageSize: 1 });

    expect(result.items[0]?.coverImagePath).toBe("/portfolio/default-cover.jpg");
    expect(result.items[0]?.specs.servicesEn.length).toBeGreaterThan(0);
  });

  it("handles repository records with null completedAt by using createdAt year", async () => {
    const record = createProjectRecord({
      id: "c1",
      slug: "created-at-year",
      completedAt: null,
      createdAt: new Date("2021-07-01T00:00:00.000Z"),
      status: "PUBLISHED",
      category: "COMMERCIAL",
    });
    const repository = createRepository({ source: [record], filtered: [record] });

    const service = new PortfolioService(repository);
    const result = await service.listProjects({ page: 1, pageSize: 1 });

    expect(result.items[0]?.year).toBe(2021);
    expect(result.availableYears).toContain(2021);
  });

  it("passes through requested related limit to repository", async () => {
    const source = createProjectRecord({ id: "z1", slug: "src", category: "MEP" });
    const related = createProjectRecord({ id: "z2", slug: "rel", category: "MEP" });
    const repository = createRepository({ findBySlug: source, related: [related] });

    const service = new PortfolioService(repository);
    await service.getRelatedProjects(source.slug, 7);

    expect(repository.listRelatedByCategory).toHaveBeenCalledWith("MEP", "src", 7);
  });

  it("supports every project category in list filtering path", async () => {
    const categories: ProjectCategoryValue[] = [
      "RESIDENTIAL",
      "COMMERCIAL",
      "INTERIOR",
      "ENGINEERING",
      "MEP",
      "RENOVATION",
    ];

    const records = categories.map((category, index) =>
      createProjectRecord({
        id: `cat-${category}`,
        slug: `slug-${index}`,
        category,
        status: "PUBLISHED" as PublishStatusValue,
        sortOrder: index,
      }),
    );

    const repository = createRepository({ source: records, filtered: records });
    const service = new PortfolioService(repository);

    const result = await service.listProjects({ page: 1, pageSize: 20 });

    expect(result.items).toHaveLength(categories.length);
  });
});
