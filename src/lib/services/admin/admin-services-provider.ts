import { createAdminRepository } from "@/lib/repositories";
import type { IAdminRepository } from "@/lib/repositories/contracts/admin-repository";
import { AuditAdminService } from "@/lib/services/admin/audit-admin-service";
import { CertificationAdminService } from "@/lib/services/admin/certification-admin-service";
import { ContentAdminService } from "@/lib/services/admin/content-admin-service";
import { ProjectAdminService } from "@/lib/services/admin/project-admin-service";
import { SubmissionAdminService } from "@/lib/services/admin/submission-admin-service";

export type AdminServicesContext = {
  repository: IAdminRepository;
  projectAdminService: ProjectAdminService;
  submissionAdminService: SubmissionAdminService;
  certificationAdminService: CertificationAdminService;
  contentAdminService: ContentAdminService;
  auditAdminService: AuditAdminService;
};

export function createAdminServicesContext(
  repository: IAdminRepository = createAdminRepository(),
): AdminServicesContext {
  return {
    repository,
    projectAdminService: new ProjectAdminService(repository),
    submissionAdminService: new SubmissionAdminService(repository),
    certificationAdminService: new CertificationAdminService(repository),
    contentAdminService: new ContentAdminService(repository),
    auditAdminService: new AuditAdminService(repository),
  };
}
