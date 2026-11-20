/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';
const repoName = 'interfaz_grafica'; // 👈 nombre exacto de tu repo en GitHub

const nextConfig = {
  // Siempre activo (solo afecta al dev server)
  allowedDevOrigins: [
    '192.168.1.12',
    'localhost',
    '*.serveousercontent.com',
    'serveo.net',
  ],

  // ---- Solo en PRODUCCIÓN (build para GitHub Pages) ----
  ...(isProd && {
    output: 'export',
    basePath: `/${repoName}`,
    images: { unoptimized: true },
  }),

  // ---- Solo en DESARROLLO (headers no existen en export estático) ----
  ...(!isProd && {
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
};

export default nextConfig;