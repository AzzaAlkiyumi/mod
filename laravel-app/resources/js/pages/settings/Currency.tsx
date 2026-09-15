import { useEffect, useState } from "react";

import { CurrencySettingsForm } from "@/components/settings/currency-settings-form";
import { api } from "@/lib/api";
import { DEFAULT_CURRENCY_FORMAT, type CurrencyFormat } from "@/lib/utils";

export default function CurrencySettingsPage() {
  const [initial, setInitial] = useState<CurrencyFormat | null>(null);

  useEffect(() => {
    api
      .get("/settings/currency")
      .then((res) => setInitial(res.data.data))
      .catch(() => setInitial(DEFAULT_CURRENCY_FORMAT));
  }, []);

  if (!initial) return null;

  return <CurrencySettingsForm initial={initial} />;
}
