import type { Metadata } from "next";
import { AuthProvider } from "@/context/AuthContext";
import { AppShell } from "@/components/auth/AppShell";
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
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
