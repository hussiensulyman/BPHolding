import type { PrismaClient } from "@prisma/client";

import type {
  CreateProjectInput,
  IProjectRepository,
  ListAdminProjectsInput,
  ListAdminProjectsResult,
  ListPublishedProjectsInput,
  ListPublishedProjectsResult,
  ProjectCategoryValue,
  ProjectRecord,
  UpdateProjectInput,
} from "@/lib/repositories/contracts/project-repository";
import { prisma } from "@/lib/db";

type ProjectDelegate = {
  findUnique(args: unknown): Promise<ProjectRecord | null>;
  findMany(args: unknown): Promise<ProjectRecord[]>;
  count(args: unknown): Promise<number>;
  create(args: unknown): Promise<ProjectRecord>;
  update(args: unknown): Promise<ProjectRecord>;
  delete(args: unknown): Promise<ProjectRecord>;
};

type ProjectImageDelegate = {
  findMany(args: unknown): Promise<
    Array<{
      projectId: string;
      imageUrl: string;
      sortOrder: number;
    }>
  >;
};

type ProjectPrismaClient = Pick<PrismaClient, never> & {
  project: ProjectDelegate;
  projectImage?: ProjectImageDelegate;
};

export class PrismaProjectRepository implements IProjectRepository {
  constructor(
    private readonly prismaClient: ProjectPrismaClient = prisma as unknown as ProjectPrismaClient,
  ) {}

  findById(id: string): Promise<ProjectRecord | null> {
    return this.prismaClient.project.findUnique({ where: { id } });
  }

  findBySlug(slug: string): Promise<ProjectRecord | null> {
    return this.prismaClient.project.findUnique({ where: { slug } });
  }

  listPublished(category?: ProjectCategoryValue): Promise<ProjectRecord[]> {
    return this.prismaClient.project.findMany({
      where: {
        status: "PUBLISHED",
        ...(category ? { category } : {}),
      },
      orderBy: [{ featured: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
    });
  }

  async listPublishedFiltered(
    input: ListPublishedProjectsInput = {},
  ): Promise<ListPublishedProjectsResult> {
    const page = Math.max(1, input.page ?? 1);
    const pageSize = Math.max(1, input.pageSize ?? 12);
    const searchValue = input.search?.trim();
    const yearRange =
      typeof input.year === "number"
        ? {
            gte: new Date(Date.UTC(input.year, 0, 1)),
            lt: new Date(Date.UTC(input.year + 1, 0, 1)),
          }
        : undefined;

    const where = {
      status: "PUBLISHED",
      ...(input.category ? { category: input.category } : {}),
      ...(input.city ? { city: input.city } : {}),
      ...(yearRange ? { completedAt: yearRange } : {}),
      ...(searchValue
        ? {
            OR: [
              { titleEn: { contains: searchValue, mode: "insensitive" } },
              { titleAr: { contains: searchValue, mode: "insensitive" } },
              { descriptionEn: { contains: searchValue, mode: "insensitive" } },
              { descriptionAr: { contains: searchValue, mode: "insensitive" } },
              { location: { contains: searchValue, mode: "insensitive" } },
              { city: { contains: searchValue, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prismaClient.project.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: [{ featured: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
      }),
      this.prismaClient.project.count({ where }),
    ]);

    return {
      items,
      total,
    };
  }

  listRelatedByCategory(
    category: ProjectCategoryValue,
    excludedSlug: string,
    limit = 3,
  ): Promise<ProjectRecord[]> {
    return this.prismaClient.project.findMany({
      where: {
        status: "PUBLISHED",
        category,
        slug: {
          not: excludedSlug,
        },
      },
      take: limit,
      orderBy: [{ featured: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
    });
  }

  async listAdmin(input: ListAdminProjectsInput = {}): Promise<ListAdminProjectsResult> {
    const page = Math.max(1, input.page ?? 1);
    const pageSize = Math.max(1, input.pageSize ?? 20);
    const searchValue = input.search?.trim();

    const where = {
      ...(input.status ? { status: input.status } : {}),
      ...(input.category ? { category: input.category } : {}),
      ...(searchValue
        ? {
            OR: [
              { titleEn: { contains: searchValue, mode: "insensitive" } },
              { titleAr: { contains: searchValue, mode: "insensitive" } },
              { descriptionEn: { contains: searchValue, mode: "insensitive" } },
              { descriptionAr: { contains: searchValue, mode: "insensitive" } },
              { slug: { contains: searchValue, mode: "insensitive" } },
              { city: { contains: searchValue, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prismaClient.project.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      }),
      this.prismaClient.project.count({ where }),
    ]);

    const projectIds = items.map((item) => item.id);
    const coverImageMap = new Map<string, string>();

    if (projectIds.length > 0 && this.prismaClient.projectImage) {
      const imageRows = await this.prismaClient.projectImage.findMany({
        where: { projectId: { in: projectIds } },
        orderBy: [{ sortOrder: "asc" }],
        select: { projectId: true, imageUrl: true, sortOrder: true },
      });

      for (const row of imageRows) {
        if (!coverImageMap.has(row.projectId)) {
          coverImageMap.set(row.projectId, row.imageUrl);
        }
      }
    }

    const itemsWithCover = items.map((item) => ({
      ...item,
      coverImageUrl: coverImageMap.get(item.id) ?? null,
    }));

    return {
      items: itemsWithCover,
      total,
    };
  }

  create(input: CreateProjectInput): Promise<ProjectRecord> {
    return this.prismaClient.project.create({
      data: {
        slug: input.slug,
        titleEn: input.titleEn,
        titleAr: input.titleAr,
        descriptionEn: input.descriptionEn,
        descriptionAr: input.descriptionAr,
        location: input.location,
        city: input.city,
        year: input.year,
        category: input.category,
        status: input.status,
        featured: input.featured,
        completedAt: input.completedAt,
        sortOrder: input.sortOrder,
        ownerId: input.ownerId,
      },
    });
  }

  update(id: string, input: UpdateProjectInput): Promise<ProjectRecord | null> {
    return this.prismaClient.project
      .update({
        where: { id },
        data: {
          slug: input.slug,
          titleEn: input.titleEn,
          titleAr: input.titleAr,
          descriptionEn: input.descriptionEn,
          descriptionAr: input.descriptionAr,
          location: input.location,
          city: input.city,
          year: input.year,
          category: input.category,
          status: input.status,
          featured: input.featured,
          completedAt: input.completedAt,
          sortOrder: input.sortOrder,
          ownerId: input.ownerId,
        },
      })
      .catch(() => null);
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await this.prismaClient.project
      .delete({ where: { id } })
      .then(() => true)
      .catch(() => false);

    return deleted;
  }
}
