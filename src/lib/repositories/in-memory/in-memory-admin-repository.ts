import { InMemoryProjectRepository } from "@/lib/repositories/in-memory/in-memory-project-repository";
import { getInMemoryRfqSubmissions } from "@/lib/repositories/in-memory/in-memory-rfq-repository";
import type {
  AdminAuditLogRecord,
  AdminCertificationRecord,
  AdminContentSectionRecord,
  AdminDashboardStats,
  AdminProjectImageInput,
  AdminProjectImageRecord,
  AdminSubmissionRecord,
  ContentSectionKey,
  CreateAdminAuditLogInput,
  CreateAdminCertificationInput,
  IAdminRepository,
  ListAdminAuditLogInput,
  ListAdminSubmissionsInput,
  SubmissionStatusValue,
  SubmissionType,
  UpdateAdminCertificationInput,
  UpdateAdminSubmissionInput,
  UpsertAdminContentInput,
} from "@/lib/repositories/contracts/admin-repository";
import type {
  ProjectCategoryValue,
  PublishStatusValue,
} from "@/lib/repositories/contracts/project-repository";

const DEFAULT_CONTENT_KEYS: ContentSectionKey[] = [
  "hero",
  "mission",
  "vision",
  "services",
];
const DEFAULT_PROJECT_CATEGORIES: ProjectCategoryValue[] = [
  "RESIDENTIAL",
  "COMMERCIAL",
  "INTERIOR",
  "ENGINEERING",
  "MEP",
  "RENOVATION",
];
const DEFAULT_PROJECT_STATUSES: PublishStatusValue[] = ["DRAFT", "PUBLISHED", "ARCHIVED"];
const DEFAULT_SUBMISSION_STATUSES: SubmissionStatusValue[] = [
  "NEW",
  "REVIEWED",
  "CONTACTED",
  "ARCHIVED",
];

const now = () => new Date();

const inMemorySubmissions: AdminSubmissionRecord[] = [
  {
    id: "rfq-seed-1",
    type: "RFQ",
    title: "RFQ from Abdulrahman Al-Qahtani",
    email: "abdulrahman@example.com",
    phone: "+966500000111",
    status: "NEW",
    submittedAt: new Date("2026-05-03T08:20:00.000Z"),
    reviewedAt: null,
    contactedAt: null,
    internalNotes: null,
    payload: {
      projectType: "Commercial",
      location: "Olaya",
      city: "Riyadh",
      budgetRange: "2M-5M SAR",
      timeline: "3-6mo",
      message: "Need full design-build for office tower floors.",
    },
  },
  {
    id: "job-seed-1",
    type: "JOB",
    title: "Job Application: Site Engineer",
    email: "hr.candidate@example.com",
    phone: "+966511000222",
    status: "REVIEWED",
    submittedAt: new Date("2026-05-01T10:15:00.000Z"),
    reviewedAt: new Date("2026-05-02T12:00:00.000Z"),
    contactedAt: null,
    internalNotes: "Strong profile with GCC project exposure.",
    payload: {
      fullName: "Huda Al-Salem",
      positionApplied: "Site Engineer",
      resumeUrl: "https://ik.imagekit.io/demo/resume-huda.pdf",
    },
  },
  {
    id: "contractor-seed-1",
    type: "CONTRACTOR",
    title: "Contractor Registration: Al Wadi Contracting",
    email: "contact@alwadi-contracting.sa",
    phone: "+966533000333",
    status: "CONTACTED",
    submittedAt: new Date("2026-04-28T09:30:00.000Z"),
    reviewedAt: new Date("2026-04-28T15:00:00.000Z"),
    contactedAt: new Date("2026-04-29T10:00:00.000Z"),
    internalNotes: "Requested additional compliance documents.",
    payload: {
      companyName: "Al Wadi Contracting",
      servicesEn: ["Civil Works", "MEP"],
      website: "https://alwadi.example.com",
    },
  },
];

const inMemoryContent = new Map<ContentSectionKey, AdminContentSectionRecord>([
  [
    "hero",
    {
      id: "content-hero",
      sectionKey: "hero",
      titleEn: "We Build the Future with Integrated Solutions",
      titleAr: "نبني المستقبل بحلول متكاملة",
      bodyEn: "Business Pioneers delivers consultancy, contracting, and MEP excellence.",
      bodyAr:
        "تقدم بزنس بايونيرز الاستشارات والمقاولات والتميز في الأنظمة الكهروميكانيكية.",
      status: "PUBLISHED",
      updatedBy: null,
      updatedAt: now(),
    },
  ],
  [
    "mission",
    {
      id: "content-mission",
      sectionKey: "mission",
      titleEn: "Our Mission",
      titleAr: "رسالتنا",
      bodyEn: "Transform ambitious ideas into tangible realities.",
      bodyAr: "تحويل الأفكار الطموحة إلى واقع ملموس.",
      status: "PUBLISHED",
      updatedBy: null,
      updatedAt: now(),
    },
  ],
  [
    "vision",
    {
      id: "content-vision",
      sectionKey: "vision",
      titleEn: "Our Vision",
      titleAr: "رؤيتنا",
      bodyEn: "Lead engineering through innovation, sustainability, and quality.",
      bodyAr: "قيادة الهندسة بالابتكار والاستدامة والجودة.",
      status: "PUBLISHED",
      updatedBy: null,
      updatedAt: now(),
    },
  ],
  [
    "services",
    {
      id: "content-services",
      sectionKey: "services",
      titleEn: "Core Services",
      titleAr: "الخدمات الأساسية",
      bodyEn: "Engineering consultancy, contracting, MEP, and renovation.",
      bodyAr: "الاستشارات الهندسية والمقاولات والأنظمة الكهروميكانيكية والتجديد.",
      status: "DRAFT",
      updatedBy: null,
      updatedAt: now(),
    },
  ],
]);

const inMemoryCertifications: AdminCertificationRecord[] = [
  {
    id: "cert-seed-gosi",
    title: "GOSI Compliance",
    titleAr: "شهادة التأمينات الاجتماعية",
    documentType: "GOSI",
    issueDate: new Date("2025-07-01T00:00:00.000Z"),
    expiryDate: new Date("2026-05-20T00:00:00.000Z"),
    fileUrl: "https://ik.imagekit.io/demo/certs/gosi.pdf",
    showOnPublicGrid: true,
    createdAt: new Date("2025-07-01T00:00:00.000Z"),
  },
];

const inMemoryAuditLogs: AdminAuditLogRecord[] = [];
const inMemoryProjectImages = new Map<string, AdminProjectImageRecord[]>();
const inMemorySubmissionOverrides = new Map<string, Partial<AdminSubmissionRecord>>();

function matchesDateRange(date: Date, fromDate?: Date, toDate?: Date): boolean {
  if (fromDate && date < fromDate) {
    return false;
  }

  if (toDate && date > toDate) {
    return false;
  }

  return true;
}

export class InMemoryAdminRepository
  extends InMemoryProjectRepository
  implements IAdminRepository
{
  private getAllSubmissionRecords(): AdminSubmissionRecord[] {
    const dynamicRfqs: AdminSubmissionRecord[] = getInMemoryRfqSubmissions().map(
      (submission) => ({
        id: submission.id,
        type: "RFQ",
        title: `RFQ from ${submission.payload.contactName}`,
        email: submission.payload.contactEmail,
        phone: submission.payload.contactPhone,
        status: "NEW",
        submittedAt: submission.submittedAt,
        reviewedAt: null,
        contactedAt: null,
        internalNotes: null,
        payload: {
          projectType: submission.payload.projectType,
          location: submission.payload.location,
          city: submission.payload.city,
          budgetRange: submission.payload.budgetRange,
          timeline: submission.payload.timeline,
          description: submission.payload.description,
          files: submission.payload.files,
          referenceNumber: submission.referenceNumber,
        },
      }),
    );

    const merged = [...dynamicRfqs, ...inMemorySubmissions].map((submission) => {
      const override = inMemorySubmissionOverrides.get(submission.id);

      if (!override) {
        return submission;
      }

      return {
        ...submission,
        ...override,
      };
    });

    return merged;
  }

  async listDashboardStats(): Promise<AdminDashboardStats> {
    const projectSummary = await this.listAdmin({ page: 1, pageSize: 1_000 });
    const submissions = this.getAllSubmissionRecords();

    return {
      totalProjects: projectSummary.total,
      pendingRfqs: submissions.filter(
        (submission) => submission.type === "RFQ" && submission.status === "NEW",
      ).length,
      activeJobs: submissions.filter(
        (submission) => submission.type === "JOB" && submission.status !== "ARCHIVED",
      ).length,
    };
  }

  async listProjectImages(projectId: string): Promise<AdminProjectImageRecord[]> {
    return [...(inMemoryProjectImages.get(projectId) ?? [])].sort(
      (a, b) => a.sortOrder - b.sortOrder,
    );
  }

  async replaceProjectImages(
    projectId: string,
    images: AdminProjectImageInput[],
  ): Promise<void> {
    const normalized = images.map((image, index) => ({
      id: `project-image-${projectId}-${index}-${Date.now()}`,
      projectId,
      imageUrl: image.imageUrl,
      altEn: image.altEn ?? null,
      altAr: image.altAr ?? null,
      sortOrder: image.sortOrder ?? index,
    }));

    inMemoryProjectImages.set(projectId, normalized);
  }

  async listSubmissions(
    input: ListAdminSubmissionsInput = {},
  ): Promise<AdminSubmissionRecord[]> {
    return this.getAllSubmissionRecords()
      .filter((submission) => {
        if (input.type && submission.type !== input.type) {
          return false;
        }

        if (input.status && submission.status !== input.status) {
          return false;
        }

        return matchesDateRange(submission.submittedAt, input.fromDate, input.toDate);
      })
      .sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
  }

  async updateSubmission(
    type: SubmissionType,
    id: string,
    input: UpdateAdminSubmissionInput,
  ): Promise<AdminSubmissionRecord | null> {
    const index = inMemorySubmissions.findIndex(
      (submission) => submission.type === type && submission.id === id,
    );

    if (index >= 0) {
      const existing = inMemorySubmissions[index]!;
      const updated: AdminSubmissionRecord = {
        ...existing,
        status: input.status ?? existing.status,
        internalNotes:
          typeof input.internalNotes === "string"
            ? input.internalNotes
            : existing.internalNotes,
        contactedAt:
          input.contactedAt === undefined ? existing.contactedAt : input.contactedAt,
        reviewedAt:
          input.reviewedAt === undefined ? existing.reviewedAt : input.reviewedAt,
      };

      inMemorySubmissions[index] = updated;

      return updated;
    }

    const dynamic = this.getAllSubmissionRecords().find(
      (submission) => submission.type === type && submission.id === id,
    );

    if (!dynamic) {
      return null;
    }

    const override: Partial<AdminSubmissionRecord> = {
      status: input.status ?? dynamic.status,
      internalNotes:
        typeof input.internalNotes === "string"
          ? input.internalNotes
          : dynamic.internalNotes,
      contactedAt:
        input.contactedAt === undefined ? dynamic.contactedAt : input.contactedAt,
      reviewedAt: input.reviewedAt === undefined ? dynamic.reviewedAt : input.reviewedAt,
    };

    inMemorySubmissionOverrides.set(id, override);

    return {
      ...dynamic,
      ...override,
    };
  }

  async listContentSections(): Promise<AdminContentSectionRecord[]> {
    return DEFAULT_CONTENT_KEYS.map((key) => inMemoryContent.get(key)!).filter(Boolean);
  }

  async upsertContentSection(
    input: UpsertAdminContentInput,
  ): Promise<AdminContentSectionRecord> {
    const existing = inMemoryContent.get(input.sectionKey);
    const record: AdminContentSectionRecord = {
      id: existing?.id ?? `content-${input.sectionKey}`,
      sectionKey: input.sectionKey,
      titleEn: input.titleEn,
      titleAr: input.titleAr,
      bodyEn: input.bodyEn,
      bodyAr: input.bodyAr,
      status: input.status,
      updatedBy: input.updatedBy ?? null,
      updatedAt: now(),
    };

    inMemoryContent.set(input.sectionKey, record);

    return record;
  }

  async listCertifications(): Promise<AdminCertificationRecord[]> {
    return [...inMemoryCertifications].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
  }

  async createCertification(
    input: CreateAdminCertificationInput,
  ): Promise<AdminCertificationRecord> {
    const created: AdminCertificationRecord = {
      id: `cert-memory-${Date.now()}`,
      title: input.title,
      titleAr: input.titleAr ?? null,
      documentType: input.documentType,
      issueDate: input.issueDate,
      expiryDate: input.expiryDate ?? null,
      fileUrl: input.fileUrl ?? null,
      showOnPublicGrid: input.showOnPublicGrid ?? true,
      createdAt: now(),
    };

    inMemoryCertifications.unshift(created);

    return created;
  }

  async updateCertification(
    id: string,
    input: UpdateAdminCertificationInput,
  ): Promise<AdminCertificationRecord | null> {
    const index = inMemoryCertifications.findIndex((record) => record.id === id);

    if (index < 0) {
      return null;
    }

    const existing = inMemoryCertifications[index]!;
    const updated: AdminCertificationRecord = {
      ...existing,
      title: input.title ?? existing.title,
      titleAr: input.titleAr ?? existing.titleAr,
      documentType: input.documentType ?? existing.documentType,
      issueDate: input.issueDate ?? existing.issueDate,
      expiryDate:
        input.expiryDate === undefined ? existing.expiryDate : (input.expiryDate ?? null),
      fileUrl: input.fileUrl ?? existing.fileUrl,
      showOnPublicGrid: input.showOnPublicGrid ?? existing.showOnPublicGrid,
    };

    inMemoryCertifications[index] = updated;

    return updated;
  }

  async listAuditLogs(
    input: ListAdminAuditLogInput = {},
  ): Promise<AdminAuditLogRecord[]> {
    return inMemoryAuditLogs
      .filter((log) => {
        if (input.adminId && log.adminId !== input.adminId) {
          return false;
        }

        if (input.action && log.action !== input.action) {
          return false;
        }

        return matchesDateRange(log.timestamp, input.fromDate, input.toDate);
      })
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async createAuditLog(input: CreateAdminAuditLogInput): Promise<AdminAuditLogRecord> {
    const record: AdminAuditLogRecord = {
      id: `audit-memory-${Date.now()}`,
      adminId: input.adminId ?? null,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      metadata: input.metadata ?? null,
      timestamp: now(),
    };

    inMemoryAuditLogs.unshift(record);

    return record;
  }

  async countNewRfqSubmissionsSince(since: Date): Promise<number> {
    return this.getAllSubmissionRecords().filter(
      (submission) => submission.type === "RFQ" && submission.submittedAt > since,
    ).length;
  }

  async listProjectCategories(): Promise<ProjectCategoryValue[]> {
    return [...DEFAULT_PROJECT_CATEGORIES];
  }

  async listProjectStatuses(): Promise<PublishStatusValue[]> {
    return [...DEFAULT_PROJECT_STATUSES];
  }

  async listSubmissionStatuses(): Promise<SubmissionStatusValue[]> {
    return [...DEFAULT_SUBMISSION_STATUSES];
  }
}
