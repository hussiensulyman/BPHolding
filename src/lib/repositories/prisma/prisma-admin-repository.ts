import { Prisma, type PrismaClient } from "@prisma/client";

import { prisma } from "@/lib/db";
import { PrismaProjectRepository } from "@/lib/repositories/prisma/prisma-project-repository";
import type {
  AdminAuditLogRecord,
  AdminCertificationRecord,
  AdminContentSectionRecord,
  AdminDashboardStats,
  AdminProjectImageInput,
  AdminProjectImageRecord,
  AdminSubmissionRecord,
  CreateAdminAuditLogInput,
  CreateAdminCertificationInput,
  IAdminRepository,
  ListAdminAuditLogInput,
  ListAdminSubmissionsInput,
  SubmissionType,
  UpdateAdminCertificationInput,
  UpdateAdminSubmissionInput,
  UpsertAdminContentInput,
} from "@/lib/repositories/contracts/admin-repository";
import type {
  ProjectCategoryValue,
  PublishStatusValue,
} from "@/lib/repositories/contracts/project-repository";

type SubmissionStatusValue = "NEW" | "REVIEWED" | "CONTACTED" | "ARCHIVED";

type PrismaAdminClient = Pick<
  PrismaClient,
  | "project"
  | "projectImage"
  | "rFQSubmission"
  | "jobApplication"
  | "contractorRegistration"
  | "contentSection"
  | "certification"
  | "auditLog"
>;

function mapRfqSubmission(record: {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  status: SubmissionStatusValue;
  submittedAt: Date;
  reviewedAt: Date | null;
  contactedAt: Date | null;
  internalNotes: string | null;
  companyName: string | null;
  serviceType: string | null;
  projectLocation: string | null;
  estimatedBudget: string | null;
  message: string;
}): AdminSubmissionRecord {
  return {
    id: record.id,
    type: "RFQ",
    title: `RFQ from ${record.fullName}`,
    email: record.email,
    phone: record.phone,
    status: record.status,
    submittedAt: record.submittedAt,
    reviewedAt: record.reviewedAt,
    contactedAt: record.contactedAt,
    internalNotes: record.internalNotes,
    payload: {
      fullName: record.fullName,
      companyName: record.companyName,
      serviceType: record.serviceType,
      projectLocation: record.projectLocation,
      estimatedBudget: record.estimatedBudget,
      message: record.message,
    },
  };
}

function mapJobSubmission(record: {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  status: SubmissionStatusValue;
  submittedAt: Date;
  reviewedAt: Date | null;
  contactedAt: Date | null;
  internalNotes: string | null;
  positionApplied: string;
  coverLetterEn: string | null;
  coverLetterAr: string | null;
  resumeUrl: string | null;
}): AdminSubmissionRecord {
  return {
    id: record.id,
    type: "JOB",
    title: `Job Application: ${record.positionApplied}`,
    email: record.email,
    phone: record.phone,
    status: record.status,
    submittedAt: record.submittedAt,
    reviewedAt: record.reviewedAt,
    contactedAt: record.contactedAt,
    internalNotes: record.internalNotes,
    payload: {
      fullName: record.fullName,
      positionApplied: record.positionApplied,
      coverLetterEn: record.coverLetterEn,
      coverLetterAr: record.coverLetterAr,
      resumeUrl: record.resumeUrl,
    },
  };
}

function mapContractorSubmission(record: {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  status: SubmissionStatusValue;
  submittedAt: Date;
  reviewedAt: Date | null;
  contactedAt: Date | null;
  internalNotes: string | null;
  website: string | null;
  servicesEn: string[];
  servicesAr: string[];
  notes: string | null;
}): AdminSubmissionRecord {
  return {
    id: record.id,
    type: "CONTRACTOR",
    title: `Contractor Registration: ${record.companyName}`,
    email: record.email,
    phone: record.phone,
    status: record.status,
    submittedAt: record.submittedAt,
    reviewedAt: record.reviewedAt,
    contactedAt: record.contactedAt,
    internalNotes: record.internalNotes,
    payload: {
      companyName: record.companyName,
      contactName: record.contactName,
      website: record.website,
      servicesEn: record.servicesEn,
      servicesAr: record.servicesAr,
      notes: record.notes,
    },
  };
}

export class PrismaAdminRepository
  extends PrismaProjectRepository
  implements IAdminRepository
{
  private readonly adminPrismaClient: PrismaAdminClient;

  constructor(
    prismaOverride: PrismaAdminClient = prisma as unknown as PrismaAdminClient,
  ) {
    super(prismaOverride as unknown as PrismaClient);
    this.adminPrismaClient = prismaOverride;
  }

  async listDashboardStats(): Promise<AdminDashboardStats> {
    const [totalProjects, pendingRfqs, activeJobs] = await Promise.all([
      this.adminPrismaClient.project.count(),
      this.adminPrismaClient.rFQSubmission.count({ where: { status: "NEW" } }),
      this.adminPrismaClient.jobApplication.count({
        where: { status: { not: "ARCHIVED" } },
      }),
    ]);

    return {
      totalProjects,
      pendingRfqs,
      activeJobs,
    };
  }

  async listProjectImages(projectId: string): Promise<AdminProjectImageRecord[]> {
    const records = await this.adminPrismaClient.projectImage.findMany({
      where: { projectId },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });

    return records.map((record) => ({
      id: record.id,
      projectId: record.projectId,
      imageUrl: record.imageUrl,
      altEn: record.altEn,
      altAr: record.altAr,
      sortOrder: record.sortOrder,
    }));
  }

  async replaceProjectImages(
    projectId: string,
    images: AdminProjectImageInput[],
  ): Promise<void> {
    await this.adminPrismaClient.projectImage.deleteMany({ where: { projectId } });

    if (images.length === 0) {
      return;
    }

    await this.adminPrismaClient.projectImage.createMany({
      data: images.map((image, index) => ({
        projectId,
        imageUrl: image.imageUrl,
        altEn: image.altEn ?? null,
        altAr: image.altAr ?? null,
        sortOrder: image.sortOrder ?? index,
      })),
    });
  }

  async listSubmissions(
    input: ListAdminSubmissionsInput = {},
  ): Promise<AdminSubmissionRecord[]> {
    const dateFilter = {
      ...(input.fromDate || input.toDate
        ? {
            submittedAt: {
              ...(input.fromDate ? { gte: input.fromDate } : {}),
              ...(input.toDate ? { lte: input.toDate } : {}),
            },
          }
        : {}),
      ...(input.status ? { status: input.status } : {}),
    };

    const includeRfq = !input.type || input.type === "RFQ";
    const includeJobs = !input.type || input.type === "JOB";
    const includeContractors = !input.type || input.type === "CONTRACTOR";

    const [rfqs, jobs, contractors] = await Promise.all([
      includeRfq
        ? this.adminPrismaClient.rFQSubmission.findMany({ where: dateFilter })
        : Promise.resolve([]),
      includeJobs
        ? this.adminPrismaClient.jobApplication.findMany({ where: dateFilter })
        : Promise.resolve([]),
      includeContractors
        ? this.adminPrismaClient.contractorRegistration.findMany({ where: dateFilter })
        : Promise.resolve([]),
    ]);

    return [
      ...rfqs.map(mapRfqSubmission),
      ...jobs.map(mapJobSubmission),
      ...contractors.map(mapContractorSubmission),
    ].sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
  }

  async updateSubmission(
    type: SubmissionType,
    id: string,
    input: UpdateAdminSubmissionInput,
  ): Promise<AdminSubmissionRecord | null> {
    if (type === "RFQ") {
      const record = await this.adminPrismaClient.rFQSubmission
        .update({
          where: { id },
          data: {
            status: input.status,
            internalNotes: input.internalNotes,
            contactedAt: input.contactedAt,
            reviewedAt: input.reviewedAt,
            handledById: input.handledById,
          },
        })
        .catch(() => null);

      return record ? mapRfqSubmission(record) : null;
    }

    if (type === "JOB") {
      const record = await this.adminPrismaClient.jobApplication
        .update({
          where: { id },
          data: {
            status: input.status,
            internalNotes: input.internalNotes,
            contactedAt: input.contactedAt,
            reviewedAt: input.reviewedAt,
            handledById: input.handledById,
          },
        })
        .catch(() => null);

      return record ? mapJobSubmission(record) : null;
    }

    const record = await this.adminPrismaClient.contractorRegistration
      .update({
        where: { id },
        data: {
          status: input.status,
          internalNotes: input.internalNotes,
          contactedAt: input.contactedAt,
          reviewedAt: input.reviewedAt,
          handledById: input.handledById,
        },
      })
      .catch(() => null);

    return record ? mapContractorSubmission(record) : null;
  }

  async listContentSections(): Promise<AdminContentSectionRecord[]> {
    const sections = await this.adminPrismaClient.contentSection.findMany({
      orderBy: { sectionKey: "asc" },
    });

    return sections.map((section) => ({
      id: section.id,
      sectionKey: section.sectionKey as AdminContentSectionRecord["sectionKey"],
      titleEn: section.titleEn,
      titleAr: section.titleAr,
      bodyEn: section.bodyEn,
      bodyAr: section.bodyAr,
      status: section.status,
      updatedBy: section.updatedBy,
      updatedAt: section.updatedAt,
    }));
  }

  async upsertContentSection(
    input: UpsertAdminContentInput,
  ): Promise<AdminContentSectionRecord> {
    const section = await this.adminPrismaClient.contentSection.upsert({
      where: { sectionKey: input.sectionKey },
      update: {
        titleEn: input.titleEn,
        titleAr: input.titleAr,
        bodyEn: input.bodyEn,
        bodyAr: input.bodyAr,
        status: input.status,
        updatedBy: input.updatedBy ?? null,
      },
      create: {
        sectionKey: input.sectionKey,
        titleEn: input.titleEn,
        titleAr: input.titleAr,
        bodyEn: input.bodyEn,
        bodyAr: input.bodyAr,
        status: input.status,
        updatedBy: input.updatedBy ?? null,
      },
    });

    return {
      id: section.id,
      sectionKey: section.sectionKey as AdminContentSectionRecord["sectionKey"],
      titleEn: section.titleEn,
      titleAr: section.titleAr,
      bodyEn: section.bodyEn,
      bodyAr: section.bodyAr,
      status: section.status,
      updatedBy: section.updatedBy,
      updatedAt: section.updatedAt,
    };
  }

  async listCertifications(): Promise<AdminCertificationRecord[]> {
    const records = await this.adminPrismaClient.certification.findMany({
      orderBy: { createdAt: "desc" },
    });

    return records.map((record) => ({
      id: record.id,
      title: record.title,
      titleAr: record.titleAr,
      documentType: record.documentType,
      issueDate: record.issueDate ?? record.issuedAt,
      expiryDate: record.expiryDate ?? record.expiresAt,
      fileUrl: record.certificateUrl,
      showOnPublicGrid: record.showOnPublicGrid,
      createdAt: record.createdAt,
    }));
  }

  async createCertification(
    input: CreateAdminCertificationInput,
  ): Promise<AdminCertificationRecord> {
    const created = await this.adminPrismaClient.certification.create({
      data: {
        title: input.title,
        titleAr: input.titleAr ?? null,
        documentType: input.documentType,
        issuingAuthority: "BP Holding",
        issuedAt: input.issueDate,
        issueDate: input.issueDate,
        expiresAt: input.expiryDate ?? null,
        expiryDate: input.expiryDate ?? null,
        certificateUrl: input.fileUrl ?? null,
        showOnPublicGrid: input.showOnPublicGrid ?? true,
        issuedById: input.issuedById ?? null,
      },
    });

    return {
      id: created.id,
      title: created.title,
      titleAr: created.titleAr,
      documentType: created.documentType,
      issueDate: created.issueDate ?? created.issuedAt,
      expiryDate: created.expiryDate ?? created.expiresAt,
      fileUrl: created.certificateUrl,
      showOnPublicGrid: created.showOnPublicGrid,
      createdAt: created.createdAt,
    };
  }

  async updateCertification(
    id: string,
    input: UpdateAdminCertificationInput,
  ): Promise<AdminCertificationRecord | null> {
    const updated = await this.adminPrismaClient.certification
      .update({
        where: { id },
        data: {
          title: input.title,
          titleAr: input.titleAr,
          documentType: input.documentType,
          issueDate: input.issueDate,
          issuedAt: input.issueDate,
          expiryDate: input.expiryDate,
          expiresAt: input.expiryDate,
          certificateUrl: input.fileUrl,
          showOnPublicGrid: input.showOnPublicGrid,
          issuedById: input.issuedById,
        },
      })
      .catch(() => null);

    if (!updated) {
      return null;
    }

    return {
      id: updated.id,
      title: updated.title,
      titleAr: updated.titleAr,
      documentType: updated.documentType,
      issueDate: updated.issueDate ?? updated.issuedAt,
      expiryDate: updated.expiryDate ?? updated.expiresAt,
      fileUrl: updated.certificateUrl,
      showOnPublicGrid: updated.showOnPublicGrid,
      createdAt: updated.createdAt,
    };
  }

  async listAuditLogs(
    input: ListAdminAuditLogInput = {},
  ): Promise<AdminAuditLogRecord[]> {
    const records = await this.adminPrismaClient.auditLog.findMany({
      where: {
        ...(input.adminId ? { adminId: input.adminId } : {}),
        ...(input.action ? { action: input.action } : {}),
        ...(input.fromDate || input.toDate
          ? {
              timestamp: {
                ...(input.fromDate ? { gte: input.fromDate } : {}),
                ...(input.toDate ? { lte: input.toDate } : {}),
              },
            }
          : {}),
      },
      orderBy: { timestamp: "desc" },
    });

    return records.map((record) => ({
      id: record.id,
      adminId: record.adminId,
      action: record.action,
      entityType: record.entityType,
      entityId: record.entityId,
      metadata: (record.metadata as Record<string, unknown> | null) ?? null,
      timestamp: record.timestamp,
    }));
  }

  async createAuditLog(input: CreateAdminAuditLogInput): Promise<AdminAuditLogRecord> {
    const created = await this.adminPrismaClient.auditLog.create({
      data: {
        adminId: input.adminId ?? null,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        metadata:
          input.metadata === null
            ? Prisma.JsonNull
            : input.metadata
              ? (input.metadata as Prisma.InputJsonValue)
              : undefined,
      },
    });

    return {
      id: created.id,
      adminId: created.adminId,
      action: created.action,
      entityType: created.entityType,
      entityId: created.entityId,
      metadata: (created.metadata as Record<string, unknown> | null) ?? null,
      timestamp: created.timestamp,
    };
  }

  countNewRfqSubmissionsSince(since: Date): Promise<number> {
    return this.adminPrismaClient.rFQSubmission.count({
      where: {
        submittedAt: {
          gt: since,
        },
      },
    });
  }

  async listProjectCategories(): Promise<ProjectCategoryValue[]> {
    return ["RESIDENTIAL", "COMMERCIAL", "INTERIOR", "ENGINEERING", "MEP", "RENOVATION"];
  }

  async listProjectStatuses(): Promise<PublishStatusValue[]> {
    return ["DRAFT", "PUBLISHED", "ARCHIVED"];
  }

  async listSubmissionStatuses(): Promise<SubmissionStatusValue[]> {
    return ["NEW", "REVIEWED", "CONTACTED", "ARCHIVED"];
  }
}
