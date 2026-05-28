import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dashboard de Transporte Público",
  description: "Sistema de monitoreo de rutas de transporte público",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="gov-page">
        <Navbar />
        <main
          className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pb-8 pt-20 lg:pt-8 pl-4 sm:pl-6 md:pl-[calc(var(--sidebar-width)+2rem)]"
        >
          {children}
        </main>
      </body>
    </html>
  );
}
