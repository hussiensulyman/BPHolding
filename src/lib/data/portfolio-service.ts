import type { AppLocale } from "@/lib/config/app-config";
import { SAMPLE_PROJECTS } from "@/lib/data/sample-projects";

export type LocalizedPortfolioProject = {
  id: string;
  slug: string;
  status: "ongoing" | "completed";
  sector: "commercial" | "residential" | "infrastructure";
  title: string;
  summary: string;
};

export async function getPortfolioProjects(
  locale: AppLocale,
): Promise<LocalizedPortfolioProject[]> {
  return SAMPLE_PROJECTS.map((project) => ({
    id: project.id,
    slug: project.slug,
    status: project.status,
    sector: project.sector,
    title: project.title[locale],
    summary: project.summary[locale],
  }));
}