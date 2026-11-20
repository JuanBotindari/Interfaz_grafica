/** @type {import('next').NextConfig} */
const repoName = 'Interfaz_grafica'; // 👈 Con I mayúscula, como tu repo

const nextConfig = {
  // Configuración de GitHub Pages: SIEMPRE activa al compilar
  output: 'export',
  basePath: `/${repoName}`,
  assetPrefix: `/${repoName}/`,
  images: { unoptimized: true },

  // Solo para desarrollo (headers no existen en export estático)
  ...(process.env.NODE_ENV === 'development' && {
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
};

export default nextConfig;