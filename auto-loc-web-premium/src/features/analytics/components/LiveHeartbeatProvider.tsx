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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.autoloc.sn';
      const payload = JSON.stringify({
        sessionId,
        pageUrl: pathname || '/',
        city: 'Dakar',
      });

      try {
        fetch(`${apiUrl}/analytics/public/heartbeat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: payload,
          keepalive: true,
          mode: 'cors',
        }).catch(() => {});
      } catch (err) {
        // silent fallback
      }
    };

    // Immediate ping on mount / path change
    sendHeartbeat();

    // Periodic ping every 15 seconds
    const interval = setInterval(sendHeartbeat, 15000);

    // Also ping on first user interaction (touch/scroll)
    const handleTouch = () => {
      sendHeartbeat();
      window.removeEventListener('touchstart', handleTouch);
    };
    window.addEventListener('touchstart', handleTouch, { passive: true });

    return () => {
      clearInterval(interval);
      window.removeEventListener('touchstart', handleTouch);
    };
  }, [pathname]);

  return null;
}
