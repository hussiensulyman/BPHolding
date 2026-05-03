import type { AppLocale } from "@/lib/config/app-config";
import { createProjectRepository } from "@/lib/repositories";
import type {
  IProjectRepository,
  ProjectCategoryValue,
  ProjectRecord,
} from "@/lib/repositories/contracts/project-repository";

const DEFAULT_PAGE_SIZE = 12;
const DEFAULT_RELATED_LIMIT = 3;

const FALLBACK_PROJECT_RECORDS: ProjectRecord[] = [
  {
    id: "fallback-al-fursan",
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
    status: "PUBLISHED",
    featured: true,
    completedAt: new Date("2024-03-10T00:00:00.000Z"),
    sortOrder: 1,
    ownerId: null,
    createdAt: new Date("2024-03-10T00:00:00.000Z"),
    updatedAt: new Date("2024-03-10T00:00:00.000Z"),
  },
  {
    id: "fallback-al-malqa",
    slug: "al-malqa-mixed-use-development-riyadh",
    titleEn: "Al-Malqa Mixed-Use Development - Riyadh",
    titleAr: "تطوير متعدد الاستخدامات في الملقا - الرياض",
    descriptionEn:
      "Full design-and-build package for mixed-use assets with structural optimization, MEP coordination, and phased handover management.",
    descriptionAr:
      "حزمة تصميم وتنفيذ كاملة لأصول متعددة الاستخدامات مع تحسينات إنشائية وتنسيق كهروميكانيكي وإدارة التسليم المرحلي.",
    location: "Al-Malqa District",
    city: "Riyadh",
    category: "COMMERCIAL",
    status: "PUBLISHED",
    featured: true,
    completedAt: new Date("2023-11-18T00:00:00.000Z"),
    sortOrder: 2,
    ownerId: null,
    createdAt: new Date("2023-11-18T00:00:00.000Z"),
    updatedAt: new Date("2023-11-18T00:00:00.000Z"),
  },
  {
    id: "fallback-prince-fawaz",
    slug: "prince-fawaz-community-facilities-jeddah",
    titleEn: "Prince Fawaz Community Facilities - Jeddah",
    titleAr: "مرافق مجتمعية في حي الأمير فواز - جدة",
    descriptionEn:
      "Construction and rehabilitation of community facilities with upgraded electrical infrastructure and resilient plumbing systems.",
    descriptionAr:
      "إنشاء وإعادة تأهيل مرافق مجتمعية مع ترقية البنية الكهربائية وأنظمة السباكة عالية الاعتمادية.",
    location: "Prince Fawaz District",
    city: "Jeddah",
    category: "RENOVATION",
    status: "PUBLISHED",
    featured: false,
    completedAt: new Date("2022-06-05T00:00:00.000Z"),
    sortOrder: 3,
    ownerId: null,
    createdAt: new Date("2022-06-05T00:00:00.000Z"),
    updatedAt: new Date("2022-06-05T00:00:00.000Z"),
  },
  {
    id: "fallback-al-janaderiyah",
    slug: "al-janaderiyah-urban-housing-riyadh",
    titleEn: "Al-Janaderiyah Urban Housing - Riyadh",
    titleAr: "إسكان حضري في الجنادرية - الرياض",
    descriptionEn:
      "Residential engineering package covering site grading, utility routing, and smart home-ready MEP integration.",
    descriptionAr:
      "حزمة هندسية سكنية تشمل تسوية الموقع ومسارات المرافق ودمج أنظمة كهروميكانيكية جاهزة للمنازل الذكية.",
    location: "Al-Janaderiyah District",
    city: "Riyadh",
    category: "ENGINEERING",
    status: "PUBLISHED",
    featured: false,
    completedAt: new Date("2024-08-22T00:00:00.000Z"),
    sortOrder: 4,
    ownerId: null,
    createdAt: new Date("2024-08-22T00:00:00.000Z"),
    updatedAt: new Date("2024-08-22T00:00:00.000Z"),
  },
  {
    id: "fallback-al-yasmin",
    slug: "al-yasmin-premium-villas-riyadh",
    titleEn: "Al-Yasmin Premium Villas - Riyadh",
    titleAr: "فلل الياسمين الفاخرة - الرياض",
    descriptionEn:
      "Turnkey construction for premium villas, including energy-efficient HVAC, bespoke interiors, and quality-led execution controls.",
    descriptionAr:
      "تنفيذ متكامل لفلل فاخرة يشمل أنظمة تكييف عالية الكفاءة وتصاميم داخلية خاصة وضوابط تنفيذ قائمة على الجودة.",
    location: "Al-Yasmin District",
    city: "Riyadh",
    category: "INTERIOR",
    status: "PUBLISHED",
    featured: true,
    completedAt: new Date("2025-01-16T00:00:00.000Z"),
    sortOrder: 5,
    ownerId: null,
    createdAt: new Date("2025-01-16T00:00:00.000Z"),
    updatedAt: new Date("2025-01-16T00:00:00.000Z"),
  },
  {
    id: "fallback-al-shatea",
    slug: "al-shatea-commercial-offices-jeddah",
    titleEn: "Al-Shatea Commercial Offices - Jeddah",
    titleAr: "مكاتب تجارية في الشاطئ - جدة",
    descriptionEn:
      "Commercial fit-out and MEP modernization for office assets with fire protection upgrades and occupancy-readiness milestones.",
    descriptionAr:
      "أعمال تشطيب تجارية وتحديث أنظمة كهروميكانيكية لمبانٍ مكتبية مع تطوير أنظمة الحماية من الحريق ومراحل جاهزية التشغيل.",
    location: "Al-Shatea District",
    city: "Jeddah",
    category: "MEP",
    status: "PUBLISHED",
    featured: false,
    completedAt: new Date("2023-04-30T00:00:00.000Z"),
    sortOrder: 6,
    ownerId: null,
    createdAt: new Date("2023-04-30T00:00:00.000Z"),
    updatedAt: new Date("2023-04-30T00:00:00.000Z"),
  },
  {
    id: "fallback-al-arid",
    slug: "al-arid-residential-expansion-riyadh",
    titleEn: "Al-Arid Residential Expansion - Riyadh",
    titleAr: "توسعة سكنية في العارض - الرياض",
    descriptionEn:
      "Expansion works for residential blocks with integrated structural reinforcement and end-to-end contractor coordination.",
    descriptionAr:
      "أعمال توسعة لمجمعات سكنية مع تدعيم إنشائي متكامل وتنسيق شامل بين المقاولين.",
    location: "Al-Arid District",
    city: "Riyadh",
    category: "RESIDENTIAL",
    status: "PUBLISHED",
    featured: false,
    completedAt: new Date("2024-12-01T00:00:00.000Z"),
    sortOrder: 7,
    ownerId: null,
    createdAt: new Date("2024-12-01T00:00:00.000Z"),
    updatedAt: new Date("2024-12-01T00:00:00.000Z"),
  },
];

type ProjectEnhancement = {
  area: string;
  timelineEn: string;
  timelineAr: string;
  servicesEn: string[];
  servicesAr: string[];
  coverImagePath: string;
  gallery: string[];
};

const DEFAULT_PROJECT_ENHANCEMENT: ProjectEnhancement = {
  area: "18,000 m2",
  timelineEn: "18 months",
  timelineAr: "18 شهراً",
  servicesEn: ["Civil Works", "MEP Systems", "Interior Fit-Out"],
  servicesAr: [
    "الأعمال المدنية",
    "أنظمة الميكانيكا والكهرباء والسباكة",
    "التشطيبات الداخلية",
  ],
  coverImagePath: "/portfolio/default-cover.jpg",
  gallery: [
    "/portfolio/default-cover.jpg",
    "/portfolio/default-gallery-1.jpg",
    "/portfolio/default-gallery-2.jpg",
  ],
};

const PROJECT_ENHANCEMENTS: Partial<Record<string, ProjectEnhancement>> = {
  "al-fursan-residential-compound-riyadh": {
    area: "32,400 m2",
    timelineEn: "Q1 2023 - Q1 2024",
    timelineAr: "الربع الأول 2023 - الربع الأول 2024",
    servicesEn: [
      "Civil Works",
      "Mechanical, Electrical, Plumbing",
      "Premium Interior Finishing",
    ],
    servicesAr: [
      "الأعمال المدنية",
      "أنظمة الميكانيكا والكهرباء والسباكة",
      "تشطيبات داخلية فاخرة",
    ],
    coverImagePath: "/portfolio/al-fursan/cover.jpg",
    gallery: [
      "/portfolio/al-fursan/cover.jpg",
      "/portfolio/al-fursan/gallery-1.jpg",
      "/portfolio/al-fursan/gallery-2.jpg",
      "/portfolio/al-fursan/gallery-3.jpg",
    ],
  },
  "al-malqa-mixed-use-development-riyadh": {
    area: "26,700 m2",
    timelineEn: "Q2 2022 - Q4 2023",
    timelineAr: "الربع الثاني 2022 - الربع الرابع 2023",
    servicesEn: ["Design & Build", "Structural Optimization", "MEP Coordination"],
    servicesAr: [
      "التصميم والتنفيذ",
      "التحسينات الإنشائية",
      "تنسيق أنظمة الميكانيكا والكهرباء والسباكة",
    ],
    coverImagePath: "/portfolio/al-malqa/cover.jpg",
    gallery: [
      "/portfolio/al-malqa/cover.jpg",
      "/portfolio/al-malqa/gallery-1.jpg",
      "/portfolio/al-malqa/gallery-2.jpg",
    ],
  },
  "prince-fawaz-community-facilities-jeddah": {
    area: "14,900 m2",
    timelineEn: "Q3 2021 - Q2 2022",
    timelineAr: "الربع الثالث 2021 - الربع الثاني 2022",
    servicesEn: [
      "Community Facility Construction",
      "Electrical Infrastructure Upgrade",
      "Plumbing Rehabilitation",
    ],
    servicesAr: [
      "إنشاء مرافق مجتمعية",
      "ترقية البنية الكهربائية",
      "إعادة تأهيل أنظمة السباكة",
    ],
    coverImagePath: "/portfolio/prince-fawaz/cover.jpg",
    gallery: [
      "/portfolio/prince-fawaz/cover.jpg",
      "/portfolio/prince-fawaz/gallery-1.jpg",
      "/portfolio/prince-fawaz/gallery-2.jpg",
    ],
  },
};

export type PortfolioProject = {
  id: string;
  slug: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  location: string;
  city: string;
  category: ProjectCategoryValue;
  year: number;
  coverImagePath: string;
  gallery: string[];
  specs: {
    area: string;
    timelineEn: string;
    timelineAr: string;
    servicesEn: string[];
    servicesAr: string[];
  };
};

export type PortfolioListFilters = {
  category?: ProjectCategoryValue;
  location?: string;
  year?: number;
  search?: string;
  page?: number;
  pageSize?: number;
};

export type PortfolioListResult = {
  items: PortfolioProject[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  availableYears: number[];
};

export type LocalizedPortfolioProject = {
  id: string;
  slug: string;
  status: "completed";
  sector: "commercial" | "residential" | "infrastructure";
  title: string;
  summary: string;
};

export interface IPortfolioService {
  listProjects(filters?: PortfolioListFilters): Promise<PortfolioListResult>;
  getProjectBySlug(slug: string): Promise<PortfolioProject | null>;
  getRelatedProjects(slug: string, limit?: number): Promise<PortfolioProject[]>;
}

function mapSectorFromCategory(
  category: ProjectCategoryValue,
): "commercial" | "residential" | "infrastructure" {
  if (category === "RESIDENTIAL") {
    return "residential";
  }

  if (category === "COMMERCIAL" || category === "INTERIOR") {
    return "commercial";
  }

  return "infrastructure";
}

function getProjectYear(project: ProjectRecord): number {
  return (project.completedAt ?? project.createdAt).getUTCFullYear();
}

function sortProjects(projects: ProjectRecord[]): ProjectRecord[] {
  return [...projects].sort((a, b) => {
    if (a.featured !== b.featured) {
      return a.featured ? -1 : 1;
    }

    if (a.sortOrder !== b.sortOrder) {
      return a.sortOrder - b.sortOrder;
    }

    return b.createdAt.getTime() - a.createdAt.getTime();
  });
}

function matchesSearch(project: ProjectRecord, search: string): boolean {
  if (!search) {
    return true;
  }

  const normalizedSearch = search.toLowerCase();

  return [
    project.titleEn,
    project.titleAr,
    project.descriptionEn,
    project.descriptionAr,
    project.location,
    project.city,
  ].some((value) => value.toLowerCase().includes(normalizedSearch));
}

function filterFallbackProjects(
  projects: ProjectRecord[],
  filters: PortfolioListFilters,
): ProjectRecord[] {
  return projects.filter((project) => {
    if (project.status !== "PUBLISHED") {
      return false;
    }

    if (filters.category && project.category !== filters.category) {
      return false;
    }

    if (filters.location && project.city !== filters.location) {
      return false;
    }

    if (filters.year && getProjectYear(project) !== filters.year) {
      return false;
    }

    if (filters.search && !matchesSearch(project, filters.search)) {
      return false;
    }

    return true;
  });
}

function shouldUseFallback(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();
  const name = error.name.toLowerCase();

  return (
    name.includes("prisma") ||
    message.includes("database_url") ||
    message.includes("prisma") ||
    message.includes("environment variable not found")
  );
}

function mapProject(project: ProjectRecord): PortfolioProject {
  const enhancement = PROJECT_ENHANCEMENTS[project.slug] ?? DEFAULT_PROJECT_ENHANCEMENT;

  return {
    id: project.id,
    slug: project.slug,
    titleEn: project.titleEn,
    titleAr: project.titleAr,
    descriptionEn: project.descriptionEn,
    descriptionAr: project.descriptionAr,
    location: project.location,
    city: project.city,
    category: project.category,
    year: getProjectYear(project),
    coverImagePath: enhancement.coverImagePath,
    gallery: enhancement.gallery,
    specs: {
      area: enhancement.area,
      timelineEn: enhancement.timelineEn,
      timelineAr: enhancement.timelineAr,
      servicesEn: enhancement.servicesEn,
      servicesAr: enhancement.servicesAr,
    },
  };
}

export class PortfolioService implements IPortfolioService {
  constructor(
    private readonly repository: IProjectRepository,
    private readonly defaultPageSize = DEFAULT_PAGE_SIZE,
  ) {}

  async listProjects(filters: PortfolioListFilters = {}): Promise<PortfolioListResult> {
    const page = Math.max(1, filters.page ?? 1);
    const pageSize = Math.max(1, filters.pageSize ?? this.defaultPageSize);

    const { paginatedItems, total, allPublished } = await this.listPublishedWithFallback({
      ...filters,
      page,
      pageSize,
    });

    const availableYears = Array.from(
      new Set(allPublished.map((project) => getProjectYear(project))),
    ).sort((a, b) => b - a);

    return {
      items: paginatedItems.map((project) => mapProject(project)),
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
      availableYears,
    };
  }

  async getProjectBySlug(slug: string): Promise<PortfolioProject | null> {
    const project = await this.findBySlugWithFallback(slug);

    if (!project || project.status !== "PUBLISHED") {
      return null;
    }

    return mapProject(project);
  }

  async getRelatedProjects(
    slug: string,
    limit = DEFAULT_RELATED_LIMIT,
  ): Promise<PortfolioProject[]> {
    const project = await this.findBySlugWithFallback(slug);

    if (!project || project.status !== "PUBLISHED") {
      return [];
    }

    const relatedProjects = await this.listRelatedWithFallback(project, limit);

    return relatedProjects.map((item) => mapProject(item));
  }

  private async listPublishedWithFallback(
    filters: Required<Pick<PortfolioListFilters, "page" | "pageSize">> &
      PortfolioListFilters,
  ): Promise<{
    paginatedItems: ProjectRecord[];
    total: number;
    allPublished: ProjectRecord[];
  }> {
    try {
      const [paginated, allPublished] = await Promise.all([
        this.repository.listPublishedFiltered({
          category: filters.category,
          city: filters.location,
          year: filters.year,
          search: filters.search,
          page: filters.page,
          pageSize: filters.pageSize,
        }),
        this.repository.listPublished(),
      ]);

      return {
        paginatedItems: paginated.items,
        total: paginated.total,
        allPublished,
      };
    } catch (error) {
      if (!shouldUseFallback(error)) {
        throw error;
      }

      const allPublished = sortProjects(
        FALLBACK_PROJECT_RECORDS.filter((project) => project.status === "PUBLISHED"),
      );
      const filtered = sortProjects(filterFallbackProjects(allPublished, filters));
      const startIndex = (filters.page - 1) * filters.pageSize;
      const paginatedItems = filtered.slice(startIndex, startIndex + filters.pageSize);

      return {
        paginatedItems,
        total: filtered.length,
        allPublished,
      };
    }
  }

  private async findBySlugWithFallback(slug: string): Promise<ProjectRecord | null> {
    try {
      return await this.repository.findBySlug(slug);
    } catch (error) {
      if (!shouldUseFallback(error)) {
        throw error;
      }

      return FALLBACK_PROJECT_RECORDS.find((project) => project.slug === slug) ?? null;
    }
  }

  private async listRelatedWithFallback(
    project: ProjectRecord,
    limit: number,
  ): Promise<ProjectRecord[]> {
    try {
      return await this.repository.listRelatedByCategory(
        project.category,
        project.slug,
        limit,
      );
    } catch (error) {
      if (!shouldUseFallback(error)) {
        throw error;
      }

      return sortProjects(
        FALLBACK_PROJECT_RECORDS.filter(
          (candidate) =>
            candidate.status === "PUBLISHED" &&
            candidate.category === project.category &&
            candidate.slug !== project.slug,
        ),
      ).slice(0, limit);
    }
  }
}

export function createPortfolioService(
  repository: IProjectRepository = createProjectRepository(),
): IPortfolioService {
  return new PortfolioService(repository);
}

export async function getPortfolioProjects(
  locale: AppLocale,
): Promise<LocalizedPortfolioProject[]> {
  const service = createPortfolioService();
  const result = await service.listProjects({ page: 1, pageSize: 50 });

  return result.items.map((project) => ({
    id: project.id,
    slug: project.slug,
    status: "completed",
    sector: mapSectorFromCategory(project.category),
    title: locale === "ar" ? project.titleAr : project.titleEn,
    summary: locale === "ar" ? project.descriptionAr : project.descriptionEn,
  }));
}
