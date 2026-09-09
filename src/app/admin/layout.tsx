import type { ReactNode } from "react";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";
import { Toaster } from "@/components/ui/sonner";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-dvh w-full overflow-hidden bg-background">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-6xl px-4 py-6 md:px-6">{children}</div>
          <footer className="no-print border-t border-border py-6 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} Hyper POS. All rights reserved.
          </footer>
        </main>
      </div>
      <Toaster position="top-right" />
    </div>
  );
}
