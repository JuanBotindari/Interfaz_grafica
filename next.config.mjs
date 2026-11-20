/** @type {import('next').NextConfig} */
const repoName = 'Interfaz_grafica';

// Detecta si estamos en GitHub Actions (para no romper el dev local)
const isGitHubPages = process.env.GITHUB_ACTIONS === 'true';

const nextConfig = {
  // Solo activo en dev (headers no existen en export estático)
  ...(!isGitHubPages && {
    allowedDevOrigins: [
      '192.168.1.12',
      'localhost',
      '*.serveousercontent.com',
      'serveo.net',
    ],
    async headers() {
      return [
        {
          source: '/:path*',
          headers: [
            { key: 'Access-Control-Allow-Origin', value: '*' },
            { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
            { key: 'Access-Control-Allow-Headers', value: '*' },
          ],
        },
      ];
    },
  }),

  // Configuración de GitHub Pages: SIEMPRE activa al compilar
  ...(isGitHubPages && {
    output: 'export',
    basePath: `/${repoName}`,
    assetPrefix: `/${repoName}/`,   // 👈 La pieza que faltaba
    images: { unoptimized: true },
  }),
};

export default nextConfig;