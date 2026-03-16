'use client';

import { useEffect, useState, useCallback } from 'react';
import type { AdminNotificationsCount } from '@/lib/nestjs/admin';

const POLL_INTERVAL_MS = 30_000;

export function useAdminBadges(): AdminNotificationsCount | null {
    const [counts, setCounts] = useState<AdminNotificationsCount | null>(null);

    const fetchCounts = useCallback(async () => {
        try {
            const res = await fetch('/api/nest/admin/notifications/count', {
                credentials: 'include',
            });
            if (!res.ok) return;
            const data: AdminNotificationsCount = await res.json();
            setCounts(data);
        } catch {
            // silently ignore — badge is best-effort
        }
    }, []);

    useEffect(() => {
        fetchCounts();
        const id = setInterval(fetchCounts, POLL_INTERVAL_MS);
        return () => clearInterval(id);
    }, [fetchCounts]);

    return counts;
}
