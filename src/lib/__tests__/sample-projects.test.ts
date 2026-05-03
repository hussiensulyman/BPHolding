import { describe, expect, it } from "vitest";

import { SAMPLE_PROJECTS } from "@/lib/data/sample-projects";

describe("sample projects seed", () => {
  it("contains valid bilingual sample records", () => {
    expect(SAMPLE_PROJECTS.length).toBeGreaterThan(0);

    for (const project of SAMPLE_PROJECTS) {
      expect(project.id.length).toBeGreaterThan(0);
      expect(project.slug.length).toBeGreaterThan(0);
      expect(["ongoing", "completed"]).toContain(project.status);
      expect(["commercial", "residential", "infrastructure"]).toContain(project.sector);
      expect(project.title.en.length).toBeGreaterThan(0);
      expect(project.title.ar.length).toBeGreaterThan(0);
      expect(project.summary.en.length).toBeGreaterThan(0);
      expect(project.summary.ar.length).toBeGreaterThan(0);
    }
  });
});
