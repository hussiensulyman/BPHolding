"use client";

import { motion } from "framer-motion";
import { ArrowDown, ChevronRight } from "lucide-react";

import { LocalizedLink } from "@/components/layout/LocalizedLink";
import { useLocale } from "@/lib/hooks/use-locale";

export function HeroSection() {
  const { t } = useLocale("home");

  return (
    <section
      className="relative flex min-h-screen items-center overflow-hidden"
      aria-label="Hero"
    >
      {/* Background with geometric overlay */}
      <div className="hero-section-bg absolute inset-0">
        {/* Diagonal grid pattern */}
        <div className="hero-overlay-pattern absolute inset-0 opacity-15" />
        {/* Gold accent shape top-right */}
        <div
          className="hero-glow-gold absolute -top-24 -end-24 h-96 w-96 rounded-full opacity-10"
          aria-hidden="true"
        />
        {/* Gold diagonal bar */}
        <div
          className="hero-gold-base absolute bottom-0 start-0 h-2 w-full opacity-60"
          aria-hidden="true"
        />
      </div>

      {/* Wave bottom shape */}
      <div
        className="hero-bottom-wave absolute inset-x-0 bottom-0 h-20"
        aria-hidden="true"
      />

      {/* Content */}
      <div className="section-container relative z-10 py-24 pt-28 sm:py-32 sm:pt-36">
        <div className="max-w-2xl">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#df9a13]/40 bg-[#df9a13]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#df9a13]">
              {t("badge")}
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            className="text-start mb-6 text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            {t("headline")}
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            className="text-start mb-10 max-w-xl text-base leading-8 text-white/75 sm:text-lg"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {t("subheadline")}
          </motion.p>

          {/* CTAs */}
          <motion.div
            className="flex flex-wrap gap-4"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <LocalizedLink
              href="/portfolio"
              className="inline-flex items-center gap-2 rounded-xl bg-[#df9a13] px-7 py-3.5 text-sm font-bold text-[#052a42] transition hover:bg-[#f0b030] hover:shadow-lg active:scale-95"
            >
              {t("heroCta1")}
              <ChevronRight size={16} aria-hidden="true" className="icon-flip" />
            </LocalizedLink>
            <LocalizedLink
              href="/rfq"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-white/50 px-7 py-3.5 text-sm font-bold text-white transition hover:border-white hover:bg-white/10 active:scale-95"
            >
              {t("heroCta2")}
            </LocalizedLink>
          </motion.div>
        </div>

        {/* Stats row */}
        <motion.div
          className="mt-10 grid grid-cols-2 gap-3 sm:mt-16 sm:grid-cols-4 sm:gap-4"
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          {[
            { value: t("stat1Value"), label: t("stat1Label") },
            { value: t("stat2Value"), label: t("stat2Label") },
            { value: t("stat3Value"), label: t("stat3Label") },
            { value: t("stat4Value"), label: t("stat4Label") },
          ].map(({ value, label }) => (
            <div
              key={label}
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-4 text-center backdrop-blur-sm"
            >
              <span className="block text-2xl font-extrabold text-[#df9a13] sm:text-3xl">
                {value}
              </span>
              <span className="mt-1 block text-xs font-medium text-white/65">
                {label}
              </span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator — hidden on short mobile viewports to avoid overlap with stats */}
      <motion.div
        className="absolute bottom-8 inset-x-0 z-10 hidden flex-col items-center gap-1 sm:flex sm:bottom-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        aria-hidden="true"
      >
        <span className="text-xs font-medium tracking-widest text-white/50 uppercase">
          {t("scrollIndicator")}
        </span>
        <ArrowDown size={16} className="scroll-bounce text-white/50" />
      </motion.div>
    </section>
  );
}
