import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * ✅ NEW: Refresh token rotation endpoint
 *
 * Automatically called when access token expires (401).
 * Uses the refresh token cookie to get a new access + refresh token pair.
 *
 * Security: Implements refresh token rotation (new refresh token on each renewal)
 */

const NEST_API = process.env.NEXT_PUBLIC_API_URL ?? '';
const IS_PROD = process.env.NODE_ENV === 'production';

const NEST_COOKIE_BASE = {
  httpOnly: true,
  secure: IS_PROD,
  sameSite: 'lax' as const,
  path: '/',
};

export async function POST(request: NextRequest) {
  try {
    // Get refresh token from httpOnly cookie
    const refreshToken = request.cookies.get('nest_refresh')?.value;

    if (!refreshToken) {
      console.warn('[Auth Refresh] No refresh token found');
      return NextResponse.json({ error: 'No refresh token' }, { status: 401 });
    }

    if (!NEST_API) {
      console.error('[Auth Refresh] Backend API not configured');
      return NextResponse.json({ error: 'Backend not configured' }, { status: 500 });
    }

    // Call backend refresh endpoint
    const nestRes = await fetch(`${NEST_API}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${refreshToken}`, // Send refresh token
      },
    });

    if (!nestRes.ok) {
      const err = await nestRes.text();
      console.error('[Auth Refresh] Backend refresh failed:', {
        status: nestRes.status,
        error: err,
      });

      // If refresh token expired or invalid, clear cookies
      if (nestRes.status === 401) {
        const response = NextResponse.json(
          { error: 'Refresh token expired', expired: true },
          { status: 401 }
        );

        // Clear cookies
        response.cookies.set('nest_access', '', { ...NEST_COOKIE_BASE, maxAge: 0 });
        response.cookies.set('nest_refresh', '', { ...NEST_COOKIE_BASE, maxAge: 0 });

        return response;
      }

      return NextResponse.json(
        { error: 'Backend refresh failed', details: err },
        { status: 502 }
      );
    }

    // ✅ NEW TOKENS: Access token + NEW refresh token (rotation)
    const session = await nestRes.json() as {
      accessToken: string;
      refreshToken: string; // New refresh token
      activeRole: string;
      profile?: any;
    };

    const response = NextResponse.json({
      success: true,
      activeRole: session.activeRole,
      profile: session.profile,
    });

    // Set new access token (24h)
    response.cookies.set('nest_access', session.accessToken, {
      ...NEST_COOKIE_BASE,
      maxAge: 60 * 60 * 24,
    });

    // ✅ ROTATION: Set NEW refresh token (30d)
    response.cookies.set('nest_refresh', session.refreshToken, {
      ...NEST_COOKIE_BASE,
      maxAge: 60 * 60 * 24 * 30,
    });

    console.log('[Auth Refresh] Tokens refreshed successfully with rotation');
    return response;
  } catch (error) {
    console.error('[Auth Refresh] Server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
