"use client";

import NextLink from "next/link";
import type { ComponentProps } from "react";
import type { UrlObject } from "url";

import { APP_CONFIG, type AppLocale } from "@/lib/config/app-config";
import { useLocale } from "@/lib/hooks/use-locale";

type NextLinkHref = ComponentProps<typeof NextLink>["href"];

type LocalizedLinkProps = Omit<ComponentProps<typeof NextLink>, "href"> & {
  href: string | UrlObject;
  locale?: AppLocale;
};

const EXTERNAL_OR_ANCHOR_PATH = /^(#|https?:\/\/|mailto:|tel:)/i;

function stripLocalePrefix(pathname: string) {
  const localePattern = APP_CONFIG.locales.join("|");
  const localePrefix = new RegExp(`^/(?:${localePattern})(?=/|$)`);

  return pathname.replace(localePrefix, "") || "/";
}

function injectLocale(pathname: string, locale: AppLocale) {
  if (EXTERNAL_OR_ANCHOR_PATH.test(pathname)) {
    return pathname;
  }

  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const pathWithoutLocale = stripLocalePrefix(normalized);

  return pathWithoutLocale === "/" ? `/${locale}` : `/${locale}${pathWithoutLocale}`;
}

function localizeStringHref(href: string, locale: AppLocale) {
  if (EXTERNAL_OR_ANCHOR_PATH.test(href)) {
    return href;
  }

  const match = href.match(/^([^?#]*)(\?[^#]*)?(#.*)?$/);

  if (!match) {
    return injectLocale(href, locale);
  }

  const [, pathname, query = "", hash = ""] = match;

  return `${injectLocale(pathname || "/", locale)}${query}${hash}`;
}

function localizeUrlObject(href: UrlObject, locale: AppLocale) {
  if (typeof href.pathname !== "string") {
    return href;
  }

  return {
    ...href,
    pathname: injectLocale(href.pathname, locale),
  };
}

function localizeHref(href: string | UrlObject, locale: AppLocale): string | UrlObject {
  if (typeof href === "string") {
    return localizeStringHref(href, locale);
  }

  return localizeUrlObject(href, locale);
}

export function LocalizedLink({ href, locale, ...props }: LocalizedLinkProps) {
  const { locale: currentLocale } = useLocale();
  const localizedHref = localizeHref(href, locale ?? currentLocale) as NextLinkHref;

  return <NextLink href={localizedHref} {...props} />;
}
