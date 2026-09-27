'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function LiveHeartbeatProvider() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let sessionId = sessionStorage.getItem('autoloc_live_session');
    if (!sessionId) {
      sessionId = `sess_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;
      sessionStorage.setItem('autoloc_live_session', sessionId);
    }

    const sendHeartbeat = () => {
      if (document.visibilityState === 'hidden') return;

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.autoloc.sn';
      const payload = JSON.stringify({
        sessionId,
        pageUrl: pathname || '/',
        city: 'Dakar',
      });

      try {
        if (navigator.sendBeacon) {
          const blob = new Blob([payload], { type: 'application/json' });
          navigator.sendBeacon(`${apiUrl}/analytics/public/heartbeat`, blob);
        } else {
          fetch(`${apiUrl}/analytics/public/heartbeat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: payload,
            keepalive: true,
          }).catch(() => {});
        }
      } catch (err) {
        // silent fallback
      }
    };

    // Immediate ping on mount / path change
    sendHeartbeat();

    // Periodic ping every 20 seconds
    const interval = setInterval(sendHeartbeat, 20000);

    return () => clearInterval(interval);
  }, [pathname]);

  return null;
}
