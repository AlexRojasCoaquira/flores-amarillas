import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Universo de Flores Amarillas ✨ | Para Ti",
  description: "Un viaje cósmico tridimensional lleno de flores amarillas flotantes y estrellas, dedicado a la persona que ilumina mi universo.",
  icons: {
    icon: "/default-woman.jpg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="h-full">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>
      <body className="h-full w-full overflow-hidden bg-[#030108] text-amber-100 antialiased selection:bg-amber-500/30 selection:text-amber-200">
        {children}
      </body>
    </html>
  );
}
