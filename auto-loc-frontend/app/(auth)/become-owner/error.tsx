"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function BecomeOwnerError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error("[become-owner:error]", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="max-w-md w-full rounded-2xl border border-[hsl(var(--border))] bg-card p-6 text-center space-y-3">
        <h1 className="text-xl font-semibold">Une erreur est survenue</h1>
        <p className="text-sm text-muted-foreground">
          Le service est momentanément indisponible. Réessayez dans un instant.
        </p>
        <Button onClick={reset} className="w-full h-11 bg-black text-white hover:bg-black/90">
          Réessayer
        </Button>
      </div>
    </div>
  );
}
