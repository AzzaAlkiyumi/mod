"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useDictionary } from "@/i18n/dictionary-context";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useDictionary();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="size-5 text-destructive" />
      </div>
      <p className="font-medium">{t.errorBoundary.title}</p>
      <p className="max-w-sm text-sm text-muted-foreground">
        {error.message || t.errorBoundary.fallbackMessage}
      </p>
      <Button className="mt-2" onClick={reset}>
        {t.errorBoundary.tryAgain}
      </Button>
    </div>
  );
}
