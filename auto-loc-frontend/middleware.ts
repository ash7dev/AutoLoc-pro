import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Middleware désactivé temporairement - les layouts géreront l'authentification
// car le backend NestJS n'est pas accessible en production
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
