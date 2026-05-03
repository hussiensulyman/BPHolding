import type { PrismaClient } from "@prisma/client";

import type {
  CreateProjectInput,
  IProjectRepository,
  ProjectCategoryValue,
  ProjectRecord,
} from "@/lib/repositories/contracts/project-repository";
import { prisma } from "@/lib/db";

type ProjectDelegate = {
  findUnique(args: unknown): Promise<ProjectRecord | null>;
  findMany(args: unknown): Promise<ProjectRecord[]>;
  create(args: unknown): Promise<ProjectRecord>;
};

type ProjectPrismaClient = Pick<PrismaClient, never> & {
  project: ProjectDelegate;
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
        category: input.category,
        status: input.status,
        featured: input.featured,
        sortOrder: input.sortOrder,
        ownerId: input.ownerId,
      },
    });
  }
}
