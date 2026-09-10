import "./globals.css";

export const metadata = {
  title: "JUAN BOTINDARI // OPTIMAL ENGINE",
  description: "AI Agent Command Center",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* Script para limpiar atributos inyectados por extensiones antes de la hidratación */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined') {
                const observer = new MutationObserver((mutations) => {
                  mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'bis_skin_checked') {
                      mutation.target.removeAttribute('bis_skin_checked');
                    }
                  });
                });
                observer.observe(document.documentElement, {
                  attributes: true,
                  subtree: true,
                  attributeFilter: ['bis_skin_checked']
                });
              }
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning className="bg-[#05070c] text-zinc-300 antialiased select-none">
        {children}
      </body>
    </html>
  );
}