function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

/** fetch() wrapper that attaches Laravel's XSRF-TOKEN cookie as a header
 * (Laravel's VerifyCsrfToken middleware accepts X-XSRF-TOKEN automatically),
 * since these JSON endpoints are called with plain fetch(), not Inertia's
 * own request helpers which do this for Inertia visits already. */
export async function apiFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const method = (init.method ?? "GET").toUpperCase();
  const headers = new Headers(init.headers);
  if (method !== "GET" && method !== "HEAD") {
    const token = getCookie("XSRF-TOKEN");
    if (token) headers.set("X-XSRF-TOKEN", token);
  }
  headers.set("Accept", "application/json");
  return fetch(input, { ...init, headers, credentials: "same-origin" });
}
