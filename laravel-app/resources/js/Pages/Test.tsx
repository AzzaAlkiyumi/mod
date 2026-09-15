import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDictionary } from "@/i18n/dictionary-context";
import { formatCurrency } from "@/lib/utils";

export default function Test() {
  const { t, locale } = useDictionary();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Laravel + Inertia + React ✓</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            locale: {locale} · nav.items.products: {t.nav.items.products}
          </p>
          <p className="text-sm font-medium">{formatCurrency(1234.5, locale)}</p>
          <Button>{t.products.list.newProduct}</Button>
        </CardContent>
      </Card>
    </div>
  );
}
