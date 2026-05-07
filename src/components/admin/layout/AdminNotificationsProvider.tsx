"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Toaster, toast } from "sonner";

type AdminNotificationsContextValue = {
  submissionBadgeCount: number;
  isPolling: boolean;
};

const AdminNotificationsContext = createContext<AdminNotificationsContextValue | null>(
  null,
);

type NotificationsPayload = {
  success: boolean;
  data: {
    newCount: number;
    totalPending: number;
    checkedAt: string;
  };
};

type AdminNotificationsProviderProps = {
  locale: "ar" | "en";
  children: ReactNode;
};

const POLLING_MS = 30_000;

export function AdminNotificationsProvider({
  locale,
  children,
}: AdminNotificationsProviderProps) {
  const [submissionBadgeCount, setSubmissionBadgeCount] = useState(0);
  const [isPolling, setIsPolling] = useState(false);
  const previousCheckedAtRef = useRef<string | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    let disposed = false;

    const poll = async () => {
      setIsPolling(true);

      try {
        const previousCheckedAt = previousCheckedAtRef.current;
        const query = previousCheckedAt
          ? `?since=${encodeURIComponent(previousCheckedAt)}`
          : "";
        const response = await fetch(`/api/admin/notifications${query}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as NotificationsPayload;

        if (!payload.success) {
          return;
        }

        setSubmissionBadgeCount(payload.data.totalPending);

        if (payload.data.newCount > 0 && previousCheckedAtRef.current) {
          if (locale === "ar") {
            toast.success(`تم استلام ${payload.data.newCount} طلب RFQ جديد`);
          } else {
            toast.success(`${payload.data.newCount} new RFQ submissions received`);
          }
        }

        previousCheckedAtRef.current = payload.data.checkedAt;
      } finally {
        setIsPolling(false);

        if (!disposed) {
          timer = setTimeout(poll, POLLING_MS);
        }
      }
    };

    void poll();

    return () => {
      disposed = true;

      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [locale]);

  const value = useMemo<AdminNotificationsContextValue>(
    () => ({
      submissionBadgeCount,
      isPolling,
    }),
    [submissionBadgeCount, isPolling],
  );

  return (
    <AdminNotificationsContext.Provider value={value}>
      {children}
      <Toaster richColors position={locale === "ar" ? "top-left" : "top-right"} />
    </AdminNotificationsContext.Provider>
  );
}

export function useAdminNotifications() {
  const context = useContext(AdminNotificationsContext);

  if (!context) {
    throw new Error(
      "useAdminNotifications must be used within AdminNotificationsProvider",
    );
  }

  return context;
}
