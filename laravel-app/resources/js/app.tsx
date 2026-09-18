import "../css/app.css";
import { createRoot } from "react-dom/client";
import { StrictMode, useEffect, useState } from "react";
import { BrowserRouter } from "react-router-dom";

import { DictionaryProvider } from "@/i18n/dictionary-context";
import { setCurrencyFormat, DEFAULT_CURRENCY_FORMAT, type CurrencyFormat } from "@/lib/utils";
import { LOCALE_COOKIE, DEFAULT_LOCALE, dirFor, isLocale, type Locale } from "@/i18n/config";
import { api } from "@/lib/api";
import { AppRoutes } from "@/AppRoutes";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import LoginPage from "@/pages/Login";

function readLocaleCookie(): Locale {
  const match = document.cookie.match(new RegExp(`(?:^|; )${LOCALE_COOKIE}=([^;]*)`));
  const value = match ? decodeURIComponent(match[1]) : null;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

/** Pure client SPA (no server-rendered props) — locale comes from a cookie
 * read once at boot, and the system currency format is fetched from the
 * API once at boot, mirroring the Next.js app's request-scoped hydration
 * but on the client since there's no per-navigation server round trip. */
function Root() {
  const [locale] = useState<Locale>(readLocaleCookie);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = dirFor(locale);
  }, [locale]);

  useEffect(() => {
    api
      .get<{ data: CurrencyFormat }>("/settings/currency")
      .then((res) => setCurrencyFormat(res.data.data))
      .catch(() => setCurrencyFormat(DEFAULT_CURRENCY_FORMAT))
      .finally(() => setReady(true));
  }, []);

  if (!ready) return null;

  return (
    <BrowserRouter>
      <DictionaryProvider locale={locale}>
        <AuthProvider>
          <Gate />
        </AuthProvider>
      </DictionaryProvider>
    </BrowserRouter>
  );
}

/** Everything under /admin requires a signed-in session — the SPA shows
 * the login screen instead of the app shell until one exists, and the
 * unauthenticated fallback flips back automatically on a session-expiry
 * 401 (see api.ts's response interceptor). */
function Gate() {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <LoginPage />;

  return <AppRoutes />;
}

const el = document.getElementById("app");
if (el) {
  createRoot(el).render(
    <StrictMode>
      <Root />
    </StrictMode>,
  );
}
