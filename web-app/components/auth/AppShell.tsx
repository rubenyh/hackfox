"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const isLogin = pathname === "/login";
  const { user } = useAuth();

  if (isLogin) {
    return (
      <main className="flex min-h-screen w-full items-center justify-center px-4 py-12 sm:px-6">
        {children}
      </main>
    );
  }

  return (
    <>
      {user && <Navbar />}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pb-8 pt-20 lg:pt-8 pl-4 sm:pl-6 md:pl-[calc(var(--sidebar-width)+2rem)]">
        {children}
      </main>
    </>
  );
}
