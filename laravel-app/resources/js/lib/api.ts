import axios from "axios";

/** Every request the SPA makes goes through this client and nothing else —
 * React never talks to the database or duplicates backend logic, it only
 * calls Laravel's JSON API (see AGENTS/plan: "لا تكرر منطق الـ Backend
 * داخل React"). Same-origin + `withCredentials` so Sanctum's SPA (cookie)
 * authentication applies automatically once logged in. */
export const api = axios.create({
  baseURL: "/api/v1",
  withCredentials: true,
  headers: { Accept: "application/json" },
});

let csrfReady: Promise<void> | null = null;

/** Sanctum's SPA auth requires a CSRF cookie before the first
 * state-changing request; this fetches it once and caches the promise. */
function ensureCsrfCookie(): Promise<void> {
  if (!csrfReady) {
    csrfReady = axios
      .get("/sanctum/csrf-cookie", { withCredentials: true })
      .then(() => undefined);
  }
  return csrfReady;
}

api.interceptors.request.use(async (config) => {
  const method = (config.method ?? "get").toUpperCase();
  if (method !== "GET" && method !== "HEAD") {
    await ensureCsrfCookie();
  }
  return config;
});

/** Shape returned by every Laravel controller in this app for a failed
 * request — mirrors the Next.js API's Zod `.flatten()` error contract so
 * ported components' error-handling code didn't need to change. */
export interface ApiErrorPayload {
  error: {
    formErrors?: string[];
    fieldErrors?: Record<string, string[]>;
  };
}

export function apiErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as ApiErrorPayload | undefined;
    const fieldErrorList = Object.values(data?.error?.fieldErrors ?? {})[0];
    return data?.error?.formErrors?.[0] ?? fieldErrorList?.[0] ?? fallback;
  }
  return fallback;
}
