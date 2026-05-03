import { getTranslations } from "next-intl/server";

import { LanguageToggle } from "@/components/layout/language-toggle";

export default async function HomePage() {
  const t = await getTranslations("home");

  return (
    <main className="inline-pad mx-inline-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 py-10">
      <header className="surface-card px-inline-4 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <span className="rounded-full bg-secondary/20 px-3 py-1 text-sm font-semibold text-primary">
            {t("badge")}
          </span>
          <LanguageToggle />
        </div>
      </header>

      <section className="surface-card px-inline-4 py-10">
        <h1 className="text-start text-4xl font-extrabold text-primary md:text-5xl">
          {t("headline")}
        </h1>
        <p className="text-start mt-5 max-w-3xl text-lg leading-8 text-slate-700">
          {t("subheadline")}
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <article className="surface-card px-inline-4 py-6">
          <h2 className="text-start text-2xl font-bold text-primary">{t("missionTitle")}</h2>
          <p className="text-start mt-3 leading-7 text-slate-700">{t("mission")}</p>
        </article>
        <article className="surface-card px-inline-4 py-6">
          <h2 className="text-start text-2xl font-bold text-primary">{t("visionTitle")}</h2>
          <p className="text-start mt-3 leading-7 text-slate-700">{t("vision")}</p>
        </article>
      </section>

      <section className="surface-card px-inline-4 py-6">
        <h2 className="text-start text-2xl font-bold text-primary">{t("servicesTitle")}</h2>
        <ul className="mt-4 grid gap-3 md:grid-cols-2">
          <li className="rounded-xl bg-white/90 px-4 py-3 text-start text-slate-700">
            {t("service1")}
          </li>
          <li className="rounded-xl bg-white/90 px-4 py-3 text-start text-slate-700">
            {t("service2")}
          </li>
          <li className="rounded-xl bg-white/90 px-4 py-3 text-start text-slate-700">
            {t("service3")}
          </li>
          <li className="rounded-xl bg-white/90 px-4 py-3 text-start text-slate-700">
            {t("service4")}
          </li>
        </ul>
      </section>
    </main>
  );
}