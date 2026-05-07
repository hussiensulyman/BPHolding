import type {
  IProjectRepository,
  ProjectCategoryValue,
  ProjectRecord,
  PublishStatusValue,
} from "@/lib/repositories/contracts/project-repository";

export type SubmissionStatusValue = "NEW" | "REVIEWED" | "CONTACTED" | "ARCHIVED";
export type SubmissionType = "RFQ" | "JOB" | "CONTRACTOR";

export type AdminDashboardStats = {
  totalProjects: number;
  pendingRfqs: number;
  activeJobs: number;
};

export type AdminProjectImageRecord = {
  id: string;
  projectId: string;
  imageUrl: string;
  altEn: string | null;
  altAr: string | null;
  sortOrder: number;
};

export type AdminProjectImageInput = {
  imageUrl: string;
  altEn?: string;
  altAr?: string;
  sortOrder?: number;
};

export type AdminSubmissionRecord = {
  id: string;
  type: SubmissionType;
  title: string;
  email: string;
  phone: string;
  status: SubmissionStatusValue;
  submittedAt: Date;
  reviewedAt: Date | null;
  contactedAt: Date | null;
  internalNotes: string | null;
  payload: Record<string, unknown>;
};

export type ListAdminSubmissionsInput = {
  type?: SubmissionType;
  status?: SubmissionStatusValue;
  fromDate?: Date;
  toDate?: Date;
};

export type UpdateAdminSubmissionInput = {
  status?: SubmissionStatusValue;
  internalNotes?: string;
  contactedAt?: Date | null;
  reviewedAt?: Date | null;
  handledById?: string | null;
};

export type ContentSectionKey = "hero" | "mission" | "vision" | "services";
export type ContentStatusValue = "DRAFT" | "PUBLISHED";

export type AdminContentSectionRecord = {
  id: string;
  sectionKey: ContentSectionKey;
  titleEn: string;
  titleAr: string;
  bodyEn: string;
  bodyAr: string;
  status: ContentStatusValue;
  updatedBy: string | null;
  updatedAt: Date;
};

export type UpsertAdminContentInput = {
  sectionKey: ContentSectionKey;
  titleEn: string;
  titleAr: string;
  bodyEn: string;
  bodyAr: string;
  status: ContentStatusValue;
  updatedBy?: string | null;
};

export type CertificationDocumentTypeValue =
  | "GOSI"
  | "VAT"
  | "ZAKAT"
  | "TRADE_LICENSE"
  | "SAUDIZATION"
  | "SAFETY_CERTIFICATE";

export type AdminCertificationRecord = {
  id: string;
  title: string;
  titleAr: string | null;
  documentType: CertificationDocumentTypeValue;
  issueDate: Date;
  expiryDate: Date | null;
  fileUrl: string | null;
  showOnPublicGrid: boolean;
  createdAt: Date;
};

export type CreateAdminCertificationInput = {
  title: string;
  titleAr?: string;
  documentType: CertificationDocumentTypeValue;
  issueDate: Date;
  expiryDate?: Date | null;
  fileUrl?: string;
  showOnPublicGrid?: boolean;
  issuedById?: string | null;
};

export type UpdateAdminCertificationInput = Partial<CreateAdminCertificationInput>;

export type AdminAuditLogRecord = {
  id: string;
  adminId: string | null;
  action: string;
  entityType: string;
  entityId: string;
  metadata: Record<string, unknown> | null;
  timestamp: Date;
};

export type CreateAdminAuditLogInput = {
  adminId?: string | null;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown> | null;
};

export type ListAdminAuditLogInput = {
  adminId?: string;
  action?: string;
  fromDate?: Date;
  toDate?: Date;
};

export interface IAdminRepository extends IProjectRepository {
  listDashboardStats(): Promise<AdminDashboardStats>;
  listProjectImages(projectId: string): Promise<AdminProjectImageRecord[]>;
  replaceProjectImages(
    projectId: string,
    images: AdminProjectImageInput[],
  ): Promise<void>;
  listSubmissions(input?: ListAdminSubmissionsInput): Promise<AdminSubmissionRecord[]>;
  updateSubmission(
    type: SubmissionType,
    id: string,
    input: UpdateAdminSubmissionInput,
  ): Promise<AdminSubmissionRecord | null>;
  listContentSections(): Promise<AdminContentSectionRecord[]>;
  upsertContentSection(
    input: UpsertAdminContentInput,
  ): Promise<AdminContentSectionRecord>;
  listCertifications(): Promise<AdminCertificationRecord[]>;
  createCertification(
    input: CreateAdminCertificationInput,
  ): Promise<AdminCertificationRecord>;
  updateCertification(
    id: string,
    input: UpdateAdminCertificationInput,
  ): Promise<AdminCertificationRecord | null>;
  listAuditLogs(input?: ListAdminAuditLogInput): Promise<AdminAuditLogRecord[]>;
  createAuditLog(input: CreateAdminAuditLogInput): Promise<AdminAuditLogRecord>;
  countNewRfqSubmissionsSince(since: Date): Promise<number>;
  listProjectCategories(): Promise<ProjectCategoryValue[]>;
  listProjectStatuses(): Promise<PublishStatusValue[]>;
  listSubmissionStatuses(): Promise<SubmissionStatusValue[]>;
}
