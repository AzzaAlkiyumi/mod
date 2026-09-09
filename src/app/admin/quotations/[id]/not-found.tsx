import Link from "next/link";
import { FileQuestion } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
        <FileQuestion className="size-5 text-muted-foreground" />
      </div>
      <p className="font-medium">Quotation not found</p>
      <p className="text-sm text-muted-foreground">
        It may have been deleted, or the link is incorrect.
      </p>
      <Button asChild className="mt-2">
        <Link href="/admin/quotations">Back to quotations</Link>
      </Button>
    </div>
  );
}
