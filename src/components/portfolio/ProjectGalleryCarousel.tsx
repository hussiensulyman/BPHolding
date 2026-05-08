"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

import type { AppLocale } from "@/lib/config/app-config";

type ProjectGalleryCarouselProps = {
  images: string[];
  locale: AppLocale;
  description: string;
};

export function ProjectGalleryCarousel({
  images,
  locale,
  description,
}: ProjectGalleryCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const isRtl = locale === "ar";

  const labels = useMemo(
    () => ({
      gallery: isRtl ? "معرض المشروع" : "Project gallery",
      previous: isRtl ? "الصورة السابقة" : "Previous image",
      next: isRtl ? "الصورة التالية" : "Next image",
    }),
    [isRtl],
  );

  if (images.length === 0) {
    return null;
  }

  const goNext = () => {
    setActiveIndex((current) => (current + 1) % images.length);
  };

  const goPrevious = () => {
    setActiveIndex((current) => (current - 1 + images.length) % images.length);
  };

  const activeImage = images[activeIndex] ?? images[0];

  return (
    <section
      className="surface-card overflow-hidden px-4 py-4"
      aria-label={labels.gallery}
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") {
          event.preventDefault();
          goNext();
        }

        if (event.key === "ArrowLeft") {
          event.preventDefault();
          goPrevious();
        }
      }}
    >
      <div className="relative h-[260px] overflow-hidden rounded-2xl bg-slate-100 md:h-[500px]">
        <Image
          src={activeImage}
          alt={description}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 1200px"
          className="object-cover"
        />

        <button
          type="button"
          onClick={goPrevious}
          aria-label={labels.previous}
          className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-md transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
        >
          <ChevronLeft size={22} className="text-[var(--color-primary)]" />
        </button>
        <button
          type="button"
          onClick={goNext}
          aria-label={labels.next}
          className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-md transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
        >
          <ChevronRight size={22} className="text-[var(--color-primary)]" />
        </button>
      </div>

      <div
        className="mt-4 grid grid-cols-4 gap-2 md:grid-cols-6"
        role="tablist"
        aria-label={labels.gallery}
      >
        {images.map((image, index) => {
          const isActive = index === activeIndex;

          return (
            <button
              key={`${image}-${index}`}
              type="button"
              role="tab"
              aria-label={`${labels.gallery} ${index + 1}`}
              onClick={() => setActiveIndex(index)}
              className={`relative h-16 overflow-hidden rounded-lg border transition ${
                isActive ? "border-primary" : "border-primary/20"
              }`}
            >
              <Image
                src={image}
                alt={description}
                fill
                sizes="240px"
                loading="lazy"
                className="object-cover"
              />
            </button>
          );
        })}
      </div>
    </section>
  );
}
