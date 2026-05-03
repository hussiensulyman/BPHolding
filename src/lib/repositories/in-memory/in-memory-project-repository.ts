import type {
  CreateProjectInput,
  IProjectRepository,
  ListPublishedProjectsInput,
  ListPublishedProjectsResult,
  ProjectCategoryValue,
  ProjectRecord,
} from "@/lib/repositories/contracts/project-repository";

const FALLBACK_PROJECTS: ProjectRecord[] = [
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

function getProjectYear(project: ProjectRecord): number {
  return (project.completedAt ?? project.createdAt).getUTCFullYear();
}

function matchesSearch(project: ProjectRecord, search?: string): boolean {
  const normalized = search?.trim().toLowerCase();

  if (!normalized) {
    return true;
  }

  return [
    project.titleEn,
    project.titleAr,
    project.descriptionEn,
    project.descriptionAr,
    project.location,
    project.city,
  ].some((value) => value.toLowerCase().includes(normalized));
}

export class InMemoryProjectRepository implements IProjectRepository {
  private projects: ProjectRecord[] = sortProjects(FALLBACK_PROJECTS);

  async findById(id: string): Promise<ProjectRecord | null> {
    return this.projects.find((project) => project.id === id) ?? null;
  }

  async findBySlug(slug: string): Promise<ProjectRecord | null> {
    return this.projects.find((project) => project.slug === slug) ?? null;
  }

  async listPublished(category?: ProjectCategoryValue): Promise<ProjectRecord[]> {
    return this.projects.filter(
      (project) =>
        project.status === "PUBLISHED" && (!category || project.category === category),
    );
  }

  async listPublishedFiltered(
    input: ListPublishedProjectsInput = {},
  ): Promise<ListPublishedProjectsResult> {
    const page = Math.max(1, input.page ?? 1);
    const pageSize = Math.max(1, input.pageSize ?? 12);

    const filtered = this.projects.filter((project) => {
      if (project.status !== "PUBLISHED") {
        return false;
      }

      if (input.category && project.category !== input.category) {
        return false;
      }

      if (input.city && project.city !== input.city) {
        return false;
      }

      if (input.year && getProjectYear(project) !== input.year) {
        return false;
      }

      return matchesSearch(project, input.search);
    });

    const sorted = sortProjects(filtered);
    const start = (page - 1) * pageSize;

    return {
      items: sorted.slice(start, start + pageSize),
      total: sorted.length,
    };
  }

  async listRelatedByCategory(
    category: ProjectCategoryValue,
    excludedSlug: string,
    limit = 3,
  ): Promise<ProjectRecord[]> {
    return sortProjects(
      this.projects.filter(
        (project) =>
          project.status === "PUBLISHED" &&
          project.category === category &&
          project.slug !== excludedSlug,
      ),
    ).slice(0, limit);
  }

  async create(input: CreateProjectInput): Promise<ProjectRecord> {
    const created: ProjectRecord = {
      id: `in-memory-${Date.now()}`,
      slug: input.slug,
      titleEn: input.titleEn,
      titleAr: input.titleAr,
      descriptionEn: input.descriptionEn,
      descriptionAr: input.descriptionAr,
      location: input.location,
      city: input.city,
      category: input.category,
      status: input.status ?? "DRAFT",
      featured: input.featured ?? false,
      completedAt: input.completedAt ?? null,
      sortOrder: input.sortOrder ?? 0,
      ownerId: input.ownerId ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.projects = sortProjects([created, ...this.projects]);

    return created;
  }
}
