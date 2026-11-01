"use client";

import type { ReactNode } from "react";
import { useStore } from "@/lib/store";
import { Skeleton } from "@/components/ui";
import { tr } from "@/i18n";

/** Shows a calm skeleton until saved progress has loaded, so nothing flashes with empty data. */
export function AppReady({ children }: { children: ReactNode }) {
  const { ready } = useStore();
  if (!ready) {
    return (
      <div aria-busy="true" aria-label={tr("common.loading")} className="space-y-6">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-5 w-96 max-w-full" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-72" />
      </div>
    );
  }
  return <div className="animate-fade-up">{children}</div>;
}
