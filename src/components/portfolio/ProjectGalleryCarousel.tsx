"use client";

import { Image as IKImage } from "@imagekit/next";
import { useMemo, useState } from "react";

import type { AppLocale } from "@/lib/config/app-config";
import { IMAGEKIT_PUBLIC_URL } from "@/lib/imagekit";

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
          if (isRtl) {
            goPrevious();
          } else {
            goNext();
          }
        }

        if (event.key === "ArrowLeft") {
          event.preventDefault();
          if (isRtl) {
            goNext();
          } else {
            goPrevious();
          }
        }
      }}
    >
      <div className="relative h-[260px] overflow-hidden rounded-2xl bg-slate-100 md:h-[500px]">
        <IKImage
          urlEndpoint={IMAGEKIT_PUBLIC_URL}
          src={activeImage}
          alt={description}
          width={1200}
          height={800}
          fetchPriority="high"
          transformation={[{ width: 1200, quality: 85, format: "webp" }]}
          className="h-full w-full object-cover"
        />

        <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-3">
          <button
            type="button"
            onClick={goPrevious}
            aria-label={labels.previous}
            className="pointer-events-auto rounded-full bg-white/95 px-3 py-2 text-lg font-bold text-primary shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <span className="carousel-flip">◀</span>
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label={labels.next}
            className="pointer-events-auto rounded-full bg-white/95 px-3 py-2 text-lg font-bold text-primary shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <span className="carousel-flip">▶</span>
          </button>
        </div>
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
              <IKImage
                urlEndpoint={IMAGEKIT_PUBLIC_URL}
                src={image}
                alt={description}
                width={240}
                height={160}
                loading="lazy"
                transformation={[{ width: 240, quality: 70, format: "webp" }]}
                className="h-full w-full object-cover"
              />
            </button>
          );
        })}
      </div>
    </section>
  );
}
