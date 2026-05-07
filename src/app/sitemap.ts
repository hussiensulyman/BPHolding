import type { MetadataRoute } from "next";

import { routing } from "@/i18n/routing";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://bpholding.sa";

const ROUTES: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "", changeFrequency: "daily", priority: 1.0 },
  { path: "/portfolio", changeFrequency: "weekly", priority: 0.9 },
  { path: "/rfq", changeFrequency: "monthly", priority: 0.8 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of routing.locales) {
    for (const { path, changeFrequency, priority } of ROUTES) {
      entries.push({
        url: `${SITE_URL}/${locale}${path}`,
        lastModified: new Date(),
        changeFrequency,
        priority,
        alternates: {
          languages: Object.fromEntries(
            routing.locales.map((l) => [l, `${SITE_URL}/${l}${path}`]),
          ),
        },
      });
    }
  }

  return entries;
}
