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
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Transporte Público</h1>
          <p className="text-sm text-gray-600">Dashboard Gubernamental</p>
        </div>
        <div className="flex gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
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
