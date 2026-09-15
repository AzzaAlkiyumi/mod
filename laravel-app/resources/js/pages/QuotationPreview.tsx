import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { QuotationPrintPreview } from "@/components/quotation/preview/quotation-print-preview";
import { toPreviewQuotation, type PreviewQuotation } from "@/components/quotation/preview/to-preview-quotation";
import { useDictionary } from "@/i18n/dictionary-context";
import { api } from "@/lib/api";

/** The real print/PDF destination for a quotation (linked from the Print
 * button on /admin/quotations/:id and the list's row actions). Deliberately
 * outside /admin so it renders with no sidebar/header chrome. */
export default function QuotationPreviewPage() {
  const { id } = useParams<{ id: string }>();
  const { locale } = useDictionary();
  const [quotation, setQuotation] = useState<PreviewQuotation | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    api
      .get(`/quotations/${id}`)
      .then((res) => setQuotation(toPreviewQuotation(res.data.data)))
      .catch(() => setNotFound(true));
  }, [id]);

  if (notFound) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 text-center">
        <p className="text-sm font-medium">No quotation found for id &quot;{id}&quot;.</p>
      </div>
    );
  }

  if (!quotation) return null;

  return <QuotationPrintPreview quotation={quotation} initialLang={locale} />;
}
