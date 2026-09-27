'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { initAttributionTracking } from '../../utils/attribution';

const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || '1576915253582646';

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
  }
}

export function MetaPixel() {
  const pathname = usePathname();
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Save URL attribution params (fbclid, utm_*) for CAPI backend matching
    initAttributionTracking();

    // Skip first render PageView because the synchronous script in <head> already fires PageView on initial load
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      window.fbq('track', 'PageView');
    }
  }, [pathname]);

  return null;
}

