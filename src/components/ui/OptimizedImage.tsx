"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

interface OptimizedImageProps extends Omit<ImageProps, "onError"> {
  fallbackSrc?: string;
  blurPlaceholder?: string;
}

export default function OptimizedImage({
  src,
  fallbackSrc = "/images/placeholders/project-placeholder.svg",
  blurPlaceholder,
  alt,
  priority = false,
  className = "",
  ...props
}: OptimizedImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);

  const placeholderProps = blurPlaceholder
    ? { placeholder: "blur" as const, blurDataURL: blurPlaceholder }
    : {};

  return (
    <div className="relative overflow-hidden bg-[var(--color-surface-alt)]">
      {isLoading && (
        <div className="absolute inset-0 animate-pulse bg-[var(--color-surface-alt)]" />
      )}
      <Image
        {...props}
        {...placeholderProps}
        src={imgSrc}
        alt={alt}
        priority={priority}
        fetchPriority={priority ? "high" : "auto"}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setImgSrc(fallbackSrc);
          setIsLoading(false);
        }}
        className={`transition-opacity duration-500 ${isLoading ? "opacity-0" : "opacity-100"} ${className}`}
      />
    </div>
  );
}
