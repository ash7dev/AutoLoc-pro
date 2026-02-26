'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AdminAutoRefreshProps {
  intervalMs?: number;
  enabled?: boolean;
}

export function AdminAutoRefresh({
  intervalMs = 15000,
  enabled = true,
}: AdminAutoRefreshProps) {
  const router = useRouter();

  useEffect(() => {
    if (!enabled) return undefined;
    const id = setInterval(() => {
      router.refresh();
    }, intervalMs);
    return () => clearInterval(id);
  }, [enabled, intervalMs, router]);

  return null;
}
