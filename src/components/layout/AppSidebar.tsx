import { Link, useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Boxes,
  Package,
  ArrowLeftRight,
  ClipboardList,
  CalendarRange,
  Wrench,
  Users,
  Settings,
  Radio,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

type NavItem = { to: string; label: string; icon: React.ComponentType<{ className?: string }> };

const GROUPS: { label: string; items: NavItem[]; adminOnly?: boolean }[] = [
  {
    label: "Operação",
    items: [
      { to: "/", label: "Dashboard", icon: LayoutDashboard },
      { to: "/equipments", label: "Equipamentos", icon: Boxes },
      { to: "/kits", label: "Kits", icon: Package },
      { to: "/movements", label: "Movimentações", icon: ArrowLeftRight },
    ],
  },
  {
    label: "Eventos",
    items: [
      { to: "/work-orders", label: "Ordens de Serviço", icon: ClipboardList },
      { to: "/schedule", label: "Agenda & Logística", icon: CalendarRange },
      { to: "/maintenance", label: "Manutenção", icon: Wrench },
    ],
  },
  {
    label: "Administração",
    items: [
      { to: "/users", label: "Usuários", icon: Users },
      { to: "/settings", label: "Configurações", icon: Settings },
    ],
  },
];

export function AppSidebar() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { isAdmin } = useAuth();

  return (
    <aside className="hidden w-64 shrink-0 border-r border-sidebar-border bg-sidebar lg:flex lg:flex-col">
      <div className="flex h-16 items-center gap-2.5 border-b border-sidebar-border px-5">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-primary shadow-elegant">
          <Radio className="h-5 w-5 text-primary-foreground" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-sidebar-foreground">EventOS</p>
          <p className="text-[11px] text-muted-foreground">Equipment OS</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {GROUPS.map((g) => (
          <div key={g.label} className="mb-5">
            <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {g.label}
            </p>
            <ul className="space-y-0.5">
              {g.items.map((item) => {
                if (item.to === "/users" && !isAdmin) return null;
                const active = item.to === "/" ? path === "/" : path.startsWith(item.to);
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className={cn(
                        "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        active
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                      )}
                    >
                      {active && (
                        <motion.span
                          layoutId="activeNav"
                          className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r-full bg-primary"
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                      )}
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-4 text-[11px] text-muted-foreground">
        v1.0 · EventOS Enterprise
      </div>
    </aside>
  );
}
