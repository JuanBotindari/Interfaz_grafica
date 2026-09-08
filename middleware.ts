import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const basicAuth = request.headers.get('authorization');

  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1];
    const [user, pwd] = atob(authValue).split(':');

    if (user === 'admin' && pwd === 'Seguros2026') {
      return NextResponse.next();
    }
  }

  return new NextResponse('Acceso No Autorizado', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Acceso Privado al Diagrama"',
    },
  });
}

// Configuración para NO bloquear el código React, CSS e imágenes
export const config = {
  matcher: [
    /*
     * Intercepta todas las rutas EXCEPTO:
     * - _next/static (JavaScript y CSS compilado)
     * - _next/image (optimización de imágenes)
     * - favicon.ico
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.json$).*)',
  ],
};