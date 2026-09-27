'use client';

export interface AttributionData {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  fbclid?: string;
  fbc?: string;
  fbp?: string;
}

const STORAGE_KEY = 'autoloc_attribution';

/**
 * Captures UTM parameters and Facebook click IDs from URL and stores in localStorage/cookies.
 */
export function initAttributionTracking(): AttributionData {
  if (typeof window === 'undefined') return {};

  try {
    const params = new URLSearchParams(window.location.search);
    const existing = getStoredAttribution();

    const utmSource = params.get('utm_source') || existing.utmSource;
    const utmMedium = params.get('utm_medium') || existing.utmMedium;
    const utmCampaign = params.get('utm_campaign') || existing.utmCampaign;
    const utmContent = params.get('utm_content') || existing.utmContent;
    const fbclid = params.get('fbclid') || existing.fbclid;

    // Extract Facebook cookies if available
    const cookies = document.cookie.split('; ').reduce((acc, current) => {
      const [name, value] = current.split('=');
      acc[name] = value;
      return acc;
    }, {} as Record<string, string>);

    const fbc = cookies['_fbc'] || (fbclid ? `fb.1.${Date.now()}.${fbclid}` : existing.fbc);
    const fbp = cookies['_fbp'] || existing.fbp;

    const data: AttributionData = {
      utmSource,
      utmMedium,
      utmCampaign,
      utmContent,
      fbclid,
      fbc,
      fbp,
    };

    // Store in localStorage
    if (utmSource || utmCampaign || fbclid) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    return data;
  } catch (err) {
    console.warn('[Attribution] Failed to init tracking:', err);
    return {};
  }
}

/**
 * Returns stored attribution data to pass to API payloads.
 */
export function getStoredAttribution(): AttributionData {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}
