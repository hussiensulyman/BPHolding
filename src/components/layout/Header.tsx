"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { usePathname } from "@/i18n/navigation";
import { LocalizedLink } from "@/components/layout/LocalizedLink";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { useLocale } from "@/lib/hooks/use-locale";

const NAV_LINKS = [
  { href: "/", labelKey: "home" },
  { href: "/#about", labelKey: "about" },
  { href: "/#services", labelKey: "services" },
  { href: "/portfolio", labelKey: "portfolio" },
  { href: "/#contact", labelKey: "contact" },
] as const;

export function Header() {
  const { t } = useLocale("nav");
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // Close on outside click
  useEffect(() => {
    if (!menuOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && menuOpen) setMenuOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    if (menuOpen) setMenuOpen(false); // eslint-disable-line react-hooks/set-state-in-effect
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  function isNavActive(href: string) {
    if (href === "/") return pathname === "/";
    const cleanHref = href.split("#")[0];
    return cleanHref !== "/" && pathname.startsWith(cleanHref);
  }

  return (
    <header
      ref={headerRef}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "header-scrolled bg-[var(--color-surface)]/95 backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <div className="section-container">
        <div className="flex h-16 items-center justify-between gap-4 md:h-20">
          {/* Logo */}
          <LocalizedLink
            href="/"
            className="flex items-center gap-2.5 shrink-0"
            aria-label="BP Holding – Home"
          >
            <span className="bp-logo-navy flex h-9 w-9 items-center justify-center rounded-lg font-extrabold text-sm tracking-tight">
              BP
            </span>
            <span
              className={`hidden sm:block font-bold text-base leading-tight transition-colors duration-300 ${
                scrolled ? "text-[var(--color-primary)]" : "text-white"
              }`}
            >
              BP Holding
            </span>
          </LocalizedLink>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {NAV_LINKS.map(({ href, labelKey }) => (
              <LocalizedLink
                key={labelKey}
                href={href}
                className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors duration-200 ${
                  isNavActive(href)
                    ? scrolled
                      ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                      : "bg-white/15 text-white"
                    : scrolled
                      ? "text-[var(--color-primary)]/75 hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/8"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
              >
                {t(labelKey)}
              </LocalizedLink>
            ))}
          </nav>

          {/* Desktop Right */}
          <div className="hidden md:flex items-center gap-3">
            <LanguageSwitcher compact />
            <LocalizedLink href="/rfq" className="btn-primary text-sm">
              {t("requestQuote")}
            </LocalizedLink>
          </div>

          {/* Mobile Toggle */}
          <button
            className={`md:hidden rounded-lg p-2 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center ${
              scrolled
                ? "text-[var(--color-primary)] hover:bg-[var(--color-primary)]/8"
                : "text-white hover:bg-white/10"
            }`}
            aria-label={menuOpen ? t("closeMenu") : t("openMenu")}
            aria-expanded={menuOpen ? "true" : "false"}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((p) => !p)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-menu"
            key="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-[var(--color-border)] bg-[var(--color-surface)]/98 backdrop-blur-md md:hidden"
          >
            <div className="section-container py-4 flex flex-col gap-1">
              {NAV_LINKS.map(({ href, labelKey }) => (
                <LocalizedLink
                  key={labelKey}
                  href={href}
                  className={`px-4 py-3 rounded-lg text-sm font-semibold transition-colors min-h-[44px] flex items-center ${
                    isNavActive(href)
                      ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-bold"
                      : "text-[var(--color-primary)]/75 hover:bg-[var(--color-primary)]/6 hover:text-[var(--color-primary)]"
                  }`}
                >
                  {t(labelKey)}
                </LocalizedLink>
              ))}
              <div className="mt-3 flex items-center justify-between pt-3 border-t border-[var(--color-border)]">
                <LanguageSwitcher compact />
                <LocalizedLink href="/rfq" className="btn-primary text-sm">
                  {t("requestQuote")}
                </LocalizedLink>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
