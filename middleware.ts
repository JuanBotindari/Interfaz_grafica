import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Permitir todo el tráfico a través de túneles externos (Serveo, Ngrok, Localtunnel)
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.json$).*)',
  ],
};