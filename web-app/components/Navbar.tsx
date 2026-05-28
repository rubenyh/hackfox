"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, TrendingUp, AlertTriangle, Users } from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: Activity },
  { href: "/routes", label: "Rutas", icon: TrendingUp },
  { href: "/potholes", label: "Baches", icon: AlertTriangle },
  { href: "/occupancy", label: "Ocupación", icon: Users },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="gov-navbar border-b gov-border-strong gov-shadow-soft">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Transporte Público</h1>
          <p className="text-sm text-white/80">Dashboard Gubernamental</p>
        </div>
        <div className="flex gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors gov-nav-link ${
                  isActive
                    ? "gov-nav-link-active"
                    : ""
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
