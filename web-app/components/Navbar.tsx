"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Activity,
  TrendingUp,
  AlertTriangle,
  Users,
  Bus,
  UserCheck,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  UserCircle,
  Sparkles,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: Activity },
  { href: "/routes", label: "Rutas", icon: TrendingUp },
  { href: "/analytics", label: "Optimizacion", icon: Sparkles },
  { href: "/buses", label: "Buses", icon: Bus },
  { href: "/drivers", label: "Conductores", icon: UserCheck },
  { href: "/potholes", label: "Reportes", icon: AlertTriangle },
  { href: "/occupancy", label: "Ocupación", icon: Users },
];

export function Navbar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const userName = user?.displayName || "Usuario";
  const userEmail = user?.email || "";

  const sidebarState = useMemo(
    () => (isCollapsed ? "collapsed" : "expanded"),
    [isCollapsed]
  );

  useEffect(() => {
    document.documentElement.dataset.sidebar = sidebarState;
  }, [sidebarState]);

  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
      return;
    }
    document.body.style.overflow = "";
  }, [isMobileOpen]);

  const closeMobile = () => setIsMobileOpen(false);

  return (
    <>
      <div className="gov-topbar fixed left-0 top-0 z-40 flex h-14 w-full items-center justify-between px-4 sm:px-6 lg:hidden">
        <button
          type="button"
          onClick={() => setIsMobileOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white md:hidden"
          aria-label="Abrir menu"
        >
          <PanelLeftOpen size={20} />
        </button>
        <div className="flex items-center gap-2 text-sm font-semibold text-white/80">
          <Activity size={16} />
          <span>Transporte Publico</span>
        </div>
        <button
          type="button"
          onClick={() => setIsCollapsed((prev) => !prev)}
          className="hidden h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 md:flex"
          aria-label={isCollapsed ? "Expandir" : "Colapsar"}
        >
          {isCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>

      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={closeMobile}
        />
      )}

      <aside
        className={`gov-sidebar fixed left-0 top-0 z-50 flex h-screen flex-col border-r gov-border-strong gov-shadow-soft transition-all duration-300 md:translate-x-0 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 pb-4 pt-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-white">
              <Activity size={20} />
            </div>
            <div className={`${isCollapsed ? "hidden" : "block"}`}>
              <p className="text-sm uppercase tracking-wide text-white/60">
                Transporte
              </p>
              <h1 className="text-lg font-semibold text-white">
                Dashboard
              </h1>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsCollapsed((prev) => !prev)}
            className="hidden h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 md:flex"
            aria-label={isCollapsed ? "Expandir" : "Colapsar"}
          >
            {isCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
        </div>

        <nav className="flex-1 px-4">
          <p
            className={`mb-3 text-xs font-semibold uppercase tracking-wide text-white/50 ${
              isCollapsed ? "sr-only" : "block"
            }`}
          >
            Navegacion
          </p>
          <div className="flex flex-col gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={isCollapsed ? item.label : undefined}
                  onClick={closeMobile}
                  className={`gov-sidebar-link flex items-center gap-3 px-3 py-3 text-sm font-medium transition ${
                    isActive ? "gov-sidebar-link-active" : ""
                  } ${isCollapsed ? "justify-center" : ""}`}
                >
                  <Icon size={18} />
                  <span className={isCollapsed ? "sr-only" : "block"}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-white/10 px-4 py-4">
          <div className="flex items-center gap-3 rounded-2xl bg-white/5 px-3 py-2">
            <UserCircle size={20} className="text-white/70" />
            <div className={`${isCollapsed ? "sr-only" : "block"}`}>
              {/* <p className="text-sm font-semibold text-white">{userName}</p> */}
              <p className="text-xs text-white/60">{userEmail}</p>
            </div>
          </div>
          <button
            type="button"
            className={`mt-3 flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10 ${
              isCollapsed ? "justify-center" : ""}
            `}
          >
            <LogOut size={16} />
            <span className={isCollapsed ? "sr-only" : "block"}>Cerrar sesion</span>
          </button>
        </div>
      </aside>
    </>
  );
}
