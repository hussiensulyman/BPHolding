"use client";

import { useLocaleDirectionContext } from "@/lib/contexts/locale-direction-context";

export function useLocaleDirection() {
  return useLocaleDirectionContext();
}