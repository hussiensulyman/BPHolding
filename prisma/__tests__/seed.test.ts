// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  ADMIN_EMAIL,
  COMPANY_PROFILE_CONTENT,
  CORE_SERVICES,
  PREVIOUS_PROJECTS,
  seedBpHoldingContent,
} from "../seed";

describe("seedBpHoldingContent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("upserts admin profile and all sample projects with bilingual content", async () => {
    const userUpsert = vi.fn().mockResolvedValue({ id: "admin-user-id" });
    const profileUpsert = vi.fn().mockResolvedValue({ id: "profile-id" });
    const projectUpsert = vi.fn().mockResolvedValue({ id: "project-id" });
    const auditLogCreate = vi.fn().mockResolvedValue({ id: "log-id" });

    const prismaMock = {
      user: { upsert: userUpsert },
      profile: { upsert: profileUpsert },
      project: { upsert: projectUpsert },
      auditLog: { create: auditLogCreate },
    } as const;

    await seedBpHoldingContent(prismaMock as never);

    expect(userUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { email: ADMIN_EMAIL },
      }),
    );

    expect(profileUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({
          companyMissionEn: COMPANY_PROFILE_CONTENT.mission.en,
          companyMissionAr: COMPANY_PROFILE_CONTENT.mission.ar,
          companyVisionEn: COMPANY_PROFILE_CONTENT.vision.en,
          companyVisionAr: COMPANY_PROFILE_CONTENT.vision.ar,
          coreServicesEn: [...CORE_SERVICES.en],
          coreServicesAr: [...CORE_SERVICES.ar],
        }),
      }),
    );

    expect(projectUpsert).toHaveBeenCalledTimes(PREVIOUS_PROJECTS.length);

    const firstProjectCall = projectUpsert.mock.calls[0]?.[0];
    expect(firstProjectCall.create.titleEn).toBe(PREVIOUS_PROJECTS[0].titleEn);
    expect(firstProjectCall.create.titleAr).toBe(PREVIOUS_PROJECTS[0].titleAr);
    expect(firstProjectCall.create.descriptionEn).toBe(
      PREVIOUS_PROJECTS[0].descriptionEn,
    );
    expect(firstProjectCall.create.descriptionAr).toBe(
      PREVIOUS_PROJECTS[0].descriptionAr,
    );

    expect(auditLogCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: "SEED_BP_HOLDING_CONTENT",
          metadata: {
            projectsSeeded: PREVIOUS_PROJECTS.length,
            servicesSeeded: CORE_SERVICES.en.length,
          },
        }),
      }),
    );
  });
});
