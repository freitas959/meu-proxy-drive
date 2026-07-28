import "./globals.css";

// As fontes entram por <link> em vez de next/font porque o renderizador em
// canvas precisa delas registradas em document.fonts sob o nome da família.
const FONTES =
  "https://fonts.googleapis.com/css2?family=Anton&family=Archivo+Black&family=Bebas+Neue&family=Familjen+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&family=Lato:wght@400;700&family=Playfair+Display:wght@400;700;900&family=Roboto:wght@400;700&display=swap";

export const metadata = {
  title: "CarrosseIA · carrosséis de Instagram com IA",
  description:
    "Escolha um template, descreva o tema e a IA escreve e desenha o carrossel inteiro. Baixe em PNG ou .zip.",
};

export const viewport = {
  themeColor: "#f2ede4",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href={FONTES} />
      </head>
      <body>{children}</body>
    </html>
  );
}
