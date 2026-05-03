import { PrismaClient, Role } from "@prisma/client";
import { fileURLToPath } from "node:url";

const prisma = new PrismaClient();

type ProjectCategoryValue =
  | "RESIDENTIAL"
  | "COMMERCIAL"
  | "INTERIOR"
  | "ENGINEERING"
  | "MEP"
  | "RENOVATION";

type PublishStatusValue = "DRAFT" | "PUBLISHED" | "ARCHIVED";

type SeedProjectRecord = {
  slug: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  location: string;
  city: string;
  category: ProjectCategoryValue;
  status: PublishStatusValue;
  featured: boolean;
  sortOrder: number;
};

type SeedClient = {
  user: {
    upsert(args: unknown): Promise<{ id: string }>;
  };
  profile: {
    upsert(args: unknown): Promise<unknown>;
  };
  project: {
    upsert(args: unknown): Promise<unknown>;
  };
  auditLog: {
    create(args: unknown): Promise<unknown>;
  };
};

export const ADMIN_EMAIL = "admin@bpholding.net";

export const CORE_SERVICES = {
  en: [
    "MEP Services (Mechanical, Electrical, Plumbing)",
    "Engineering Consultancy",
    "Renovation & Retrofitting",
    "General Construction & Contracting",
  ],
  ar: [
    "خدمات الأنظمة الكهروميكانيكية (الميكانيكية والكهربائية والسباكة)",
    "الاستشارات الهندسية",
    "التجديد وإعادة التأهيل",
    "الإنشاءات والمقاولات العامة",
  ],
} as const;

export const COMPANY_PROFILE_CONTENT = {
  mission: {
    en: "Transform ambitious architectural ideas into tangible realities through high-end technical services and precision-led execution.",
    ar: "تحويل الأفكار المعمارية الطموحة إلى واقع ملموس من خلال خدمات تقنية عالية وتنفيذ دقيق.",
  },
  vision: {
    en: "Lead the engineering landscape through innovation, sustainability, and unparalleled quality.",
    ar: "قيادة المشهد الهندسي بالابتكار والاستدامة وجودة لا تضاهى.",
  },
} as const;

export const PREVIOUS_PROJECTS: SeedProjectRecord[] = [
  {
    slug: "al-fursan-riyadh",
    titleEn: "Al-Fursan Residential Compound - Riyadh",
    titleAr: "مجمع الفرسان السكني - الرياض",
    descriptionEn:
      "Integrated residential delivery including civil works, MEP systems, and high-end interior finishing for villa clusters in Al-Fursan district.",
    descriptionAr:
      "تنفيذ سكني متكامل يشمل الأعمال المدنية وأنظمة الكهروميكانيكا والتشطيبات الداخلية الراقية لمجموعة فلل في حي الفرسان.",
    location: "Al-Fursan District",
    city: "Riyadh",
    category: "RESIDENTIAL",
    status: "PUBLISHED",
    featured: true,
    sortOrder: 1,
  },
  {
    slug: "al-malqa-riyadh",
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
    sortOrder: 2,
  },
  {
    slug: "prince-fawaz-jeddah",
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
    sortOrder: 3,
  },
  {
    slug: "al-janaderiyah-riyadh",
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
    sortOrder: 4,
  },
  {
    slug: "al-yasmin-riyadh",
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
    sortOrder: 5,
  },
  {
    slug: "al-shatea-jeddah",
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
    sortOrder: 6,
  },
  {
    slug: "al-arid-riyadh",
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
    sortOrder: 7,
  },
] as const;

export async function seedBpHoldingContent(client: SeedClient): Promise<void> {
  const adminUser = await client.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {
      name: "BP Holding Admin",
      role: Role.ADMIN,
      isActive: true,
    },
    create: {
      email: ADMIN_EMAIL,
      name: "BP Holding Admin",
      passwordHash: "CHANGE_ME_WITH_SECURE_HASH",
      role: Role.ADMIN,
      isActive: true,
    },
  });

  await client.profile.upsert({
    where: { userId: adminUser.id },
    update: {
      position: "Group Administrator",
      companyMissionEn: COMPANY_PROFILE_CONTENT.mission.en,
      companyMissionAr: COMPANY_PROFILE_CONTENT.mission.ar,
      companyVisionEn: COMPANY_PROFILE_CONTENT.vision.en,
      companyVisionAr: COMPANY_PROFILE_CONTENT.vision.ar,
      coreServicesEn: [...CORE_SERVICES.en],
      coreServicesAr: [...CORE_SERVICES.ar],
    },
    create: {
      userId: adminUser.id,
      position: "Group Administrator",
      companyMissionEn: COMPANY_PROFILE_CONTENT.mission.en,
      companyMissionAr: COMPANY_PROFILE_CONTENT.mission.ar,
      companyVisionEn: COMPANY_PROFILE_CONTENT.vision.en,
      companyVisionAr: COMPANY_PROFILE_CONTENT.vision.ar,
      coreServicesEn: [...CORE_SERVICES.en],
      coreServicesAr: [...CORE_SERVICES.ar],
    },
  });

  for (const project of PREVIOUS_PROJECTS) {
    await client.project.upsert({
      where: { slug: project.slug },
      update: {
        titleEn: project.titleEn,
        titleAr: project.titleAr,
        descriptionEn: project.descriptionEn,
        descriptionAr: project.descriptionAr,
        location: project.location,
        city: project.city,
        category: project.category,
        status: project.status,
        featured: project.featured,
        sortOrder: project.sortOrder,
        ownerId: adminUser.id,
      },
      create: {
        slug: project.slug,
        titleEn: project.titleEn,
        titleAr: project.titleAr,
        descriptionEn: project.descriptionEn,
        descriptionAr: project.descriptionAr,
        location: project.location,
        city: project.city,
        category: project.category,
        status: project.status,
        featured: project.featured,
        sortOrder: project.sortOrder,
        ownerId: adminUser.id,
      },
    });
  }

  await client.auditLog.create({
    data: {
      actorId: adminUser.id,
      action: "SEED_BP_HOLDING_CONTENT",
      entityType: "SYSTEM",
      entityId: "bootstrap",
      metadata: {
        projectsSeeded: PREVIOUS_PROJECTS.length,
        servicesSeeded: CORE_SERVICES.en.length,
      },
    },
  });
}

async function main(): Promise<void> {
  await seedBpHoldingContent(prisma as unknown as SeedClient);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main()
    .then(async () => {
      await prisma.$disconnect();
    })
    .catch(async (error: unknown) => {
      console.error("Failed to seed BP Holding content", error);
      await prisma.$disconnect();
      process.exit(1);
    });
}
