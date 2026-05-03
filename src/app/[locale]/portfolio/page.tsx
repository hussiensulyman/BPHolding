import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { APP_CONFIG, type AppLocale } from "@/lib/config/app-config";
import { getPortfolioProjects } from "@/lib/data/portfolio-service";

export default async function PortfolioPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const activeLocale = locale as AppLocale;
  const t = await getTranslations({ locale: activeLocale, namespace: "portfolio" });
  const projects = await getPortfolioProjects(activeLocale);

  return (
    <main className="inline-pad mx-inline-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 py-10">
      <header className="surface-card px-inline-4 py-8">
        <h1 className="text-start text-4xl font-extrabold text-primary md:text-5xl">
          {t("title")}
        </h1>
        <p className="text-start mt-4 max-w-3xl text-lg leading-8 text-slate-700">
          {t("description")}
        </p>
        <Link
          href={`/${activeLocale}`}
          className="mt-6 inline-flex items-center rounded-full border border-primary/30 px-5 py-2 font-semibold text-primary transition hover:bg-primary hover:text-white"
        >
          {t("backToHome")}
        </Link>
      </header>

      <section className="grid gap-6 md:grid-cols-2">
        {projects.map((project) => (
          <article
            key={project.id}
            data-testid={APP_CONFIG.testIds.portfolioProjectItem}
            className="surface-card px-inline-4 py-6"
          >
            <h2 className="text-start text-2xl font-bold text-primary">{project.title}</h2>
            <p className="text-start mt-3 leading-7 text-slate-700">{project.summary}</p>
            <dl className="mt-4 grid gap-2 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <dt className="font-semibold">{t("statusLabel")}:</dt>
                <dd>{t(`statusValues.${project.status}`)}</dd>
              </div>
              <div className="flex items-center gap-2">
                <dt className="font-semibold">{t("sectorLabel")}:</dt>
                <dd>{t(`sectorValues.${project.sector}`)}</dd>
              </div>
            </dl>
          </article>
        ))}
      </section>
    </main>
  );
}