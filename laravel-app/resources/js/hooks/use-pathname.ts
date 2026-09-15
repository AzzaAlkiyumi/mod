import { usePage } from "@inertiajs/react";

/** Inertia's usePage().url is the path+query (no origin) — this strips the
 * query string to mirror Next.js's usePathname(). */
export function usePathname(): string {
  const { url } = usePage();
  return url.split("?")[0] ?? url;
}
