import { useId, useState } from "react";
import { Eye, EyeOff, Loader2, Lock, Mail, ReceiptText } from "lucide-react";

import loginCashier from "@/assets/login-cashier.png";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { useDictionary } from "@/i18n/dictionary-context";
import { apiErrorMessage } from "@/lib/api";

export default function LoginPage() {
  const { login } = useAuth();
  const { t, locale } = useDictionary();
  const s = t.auth;
  const dir = locale === "ar" ? "rtl" : "ltr";

  const emailId = useId();
  const passwordId = useId();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await login(email, password);
    } catch (err) {
      setError(apiErrorMessage(err, s.signInFailed));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div dir={dir} className="flex min-h-screen items-center justify-center bg-muted p-4 md:p-8">
      <div className="flex w-full max-w-4xl flex-col overflow-hidden rounded-3xl border bg-card shadow-xl md:flex-row">
        {/* Brand / illustration panel — desktop */}
        <div className="relative hidden w-[380px] shrink-0 flex-col justify-between gap-8 overflow-hidden bg-sidebar-accent p-10 md:flex">
          <div className="absolute start-10 top-10 grid grid-cols-3 gap-3.5">
            {[0.85, 0.85, 0.85, 0.5, 0.5, 0.5].map((opacity, i) => (
              <span
                key={i}
                className="size-2.5 rounded-full bg-primary"
                style={{ opacity }}
              />
            ))}
          </div>

          <div className="relative z-10 flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ReceiptText className="size-[18px]" />
            </div>
            <span className="text-[15px] font-bold tracking-tight text-foreground">HYPER POS</span>
          </div>

          <div className="flex flex-1 items-center justify-center">
            <img src={loginCashier} alt="" className="w-full max-w-[280px]" />
          </div>

          <div className="relative z-10">
            <p className="text-lg font-semibold leading-snug text-foreground">{s.taglineTitle}</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.taglineSubtitle}</p>
          </div>
        </div>

        {/* Brand strip — mobile */}
        <div className="relative overflow-hidden bg-sidebar-accent px-6 pb-8 pt-7 md:hidden">
          <div className="absolute end-5 top-5 grid grid-cols-2 gap-2">
            {[0.85, 0.85, 0.5, 0.5].map((opacity, i) => (
              <span key={i} className="size-1.5 rounded-full bg-primary" style={{ opacity }} />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <ReceiptText className="size-4" />
            </div>
            <span className="text-sm font-bold tracking-tight text-foreground">HYPER POS</span>
          </div>
          <p className="mt-4 text-xl font-bold text-foreground">{s.welcomeBack}</p>
          <p className="mt-1 text-sm text-muted-foreground">{s.subtitle}</p>
        </div>

        {/* Form panel */}
        <div className="flex flex-1 flex-col justify-center gap-6 px-6 py-8 md:px-16 md:py-14">
          <div className="hidden md:block">
            <h1 className="text-[28px] font-bold tracking-tight text-foreground">{s.welcomeBack}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{s.subtitle}</p>
          </div>

          <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={emailId}>{s.emailLabel}</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id={emailId}
                  type="email"
                  dir="ltr"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={s.emailPlaceholder}
                  aria-invalid={error ? true : undefined}
                  disabled={submitting}
                  className="ps-9"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor={passwordId}>{s.passwordLabel}</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id={passwordId}
                  type={showPassword ? "text" : "password"}
                  dir="ltr"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={s.passwordPlaceholder}
                  aria-invalid={error ? true : undefined}
                  disabled={submitting}
                  className="ps-9 pe-9"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? s.hidePassword : s.showPassword}
                  disabled={submitting}
                  className="absolute end-2 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
                <Checkbox
                  checked={remember}
                  onCheckedChange={(v) => setRemember(v === true)}
                  disabled={submitting}
                />
                {s.rememberMe}
              </label>
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="text-sm font-medium text-primary hover:underline"
              >
                {s.forgotPassword}
              </a>
            </div>

            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}

            <Button type="submit" disabled={submitting} size="lg" className="mt-1">
              {submitting && <Loader2 className="size-4 animate-spin" />}
              {submitting ? s.signingIn : s.signIn}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            {s.noAccount}{" "}
            <a href="#" onClick={(e) => e.preventDefault()} className="font-medium text-primary hover:underline">
              {s.createAccount}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
