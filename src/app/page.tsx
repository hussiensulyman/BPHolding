import { redirect } from "next/navigation";

import { APP_CONFIG } from "@/lib/config/app-config";

export default function RootPage() {
  redirect(`/${APP_CONFIG.defaultLocale}`);
}
