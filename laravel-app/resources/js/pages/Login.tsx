import { useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    <div dir={dir} className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="flex w-full max-w-sm flex-col gap-6 p-6">
        <div className="flex flex-col items-center gap-1 text-center">
          <div className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <span className="text-sm font-bold">POS</span>
          </div>
          <h1 className="mt-2 text-xl font-semibold tracking-tight">{s.title}</h1>
          <p className="text-sm text-muted-foreground">{s.subtitle}</p>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="login-email">{s.emailLabel}</Label>
            <Input
              id="login-email"
              type="email"
              dir="ltr"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={s.emailPlaceholder}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="login-password">{s.passwordLabel}</Label>
            <Input
              id="login-password"
              type="password"
              dir="ltr"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={s.passwordPlaceholder}
              required
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" disabled={submitting} className="mt-1">
            {submitting && <Loader2 className="size-4 animate-spin" />}
            {submitting ? s.signingIn : s.signIn}
          </Button>
        </form>
      </Card>
    </div>
  );
}
