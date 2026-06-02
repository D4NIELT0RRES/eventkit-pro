import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Boxes,
  CheckCircle2,
  Wrench,
  Package,
  MapPin,
  Tag,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AIChat } from "@/components/ai/AIChat";
import { StatusBadge } from "@/components/StatusBadge";

export const Route = createFileRoute("/_authenticated/")({
  component: Dashboard,
});

// ─── Stats ────────────────────────────────────────────────────────────────────

function useStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const { data: e } = await supabase
        .from("equipments")
        .select("id,status,quantity");
      const eq = e ?? [];
      const total = eq.reduce((s, x) => s + (x.quantity ?? 0), 0);
      const by = (st: string) => eq.filter((x) => x.status === st).length;
      return {
        total,
        disponivel: by("disponivel"),
        em_uso: by("em_uso"),
        manutencao: by("manutencao"),
        reservado: by("reservado"),
      };
    },
    refetchInterval: 30_000,
  });
}

// ─── Equipment list (right panel) ─────────────────────────────────────────────

function useEquipments() {
  return useQuery({
    queryKey: ["equipments"],
    queryFn: async () => {
      const { data } = await supabase
        .from("equipments")
        .select("id, name, quantity, status, location, brand, categories(name, color, slug)")
        .order("created_at", { ascending: false })
        .limit(50);
      return data ?? [];
    },
    refetchInterval: 8_000,
  });
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

type StatCardProps = {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  delay: number;
};

function StatCard({ label, value, icon: Icon, color, delay }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-sm"
    >
      <Icon className={`h-5 w-5 shrink-0 ${color}`} />
      <div className="min-w-0">
        <p className="text-[11px] text-muted-foreground truncate">{label}</p>
        <p className="text-xl font-bold leading-none mt-0.5 tabular-nums">{value}</p>
      </div>
    </motion.div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { data: stats } = useStats();
  const { data: equipments } = useEquipments();

  const statCards: Omit<StatCardProps, "delay">[] = [
    {
      label: "Total unidades",
      value: stats?.total ?? 0,
      icon: Boxes,
      color: "text-primary",
    },
    {
      label: "Disponíveis",
      value: stats?.disponivel ?? 0,
      icon: CheckCircle2,
      color: "text-success",
    },
    {
      label: "Em uso",
      value: stats?.em_uso ?? 0,
      icon: Package,
      color: "text-info",
    },
    {
      label: "Manutenção",
      value: stats?.manutencao ?? 0,
      icon: Wrench,
      color: "text-warning",
    },
  ];

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 shrink-0">
        {statCards.map((c, i) => (
          <StatCard key={c.label} {...c} delay={i * 0.05} />
        ))}
      </div>

      {/* ── Main content: AI Chat + Equipment Panel ── */}
      <div className="flex flex-1 gap-4 min-h-0 overflow-hidden" style={{ minHeight: 480 }}>
        {/* AI Chat – hero / primary interaction */}
        <div className="flex-1 min-w-0 overflow-hidden">
          <AIChat />
        </div>

        {/* Equipment list – auto-updates after AI actions */}
        <div
          className="w-72 xl:w-80 shrink-0 flex flex-col rounded-xl border border-border bg-card shadow-sm overflow-hidden"
        >
          {/* Panel header */}
          <div className="px-4 py-3 border-b border-border shrink-0">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Inventário</h3>
              <span className="text-xs text-muted-foreground tabular-nums">
                {(equipments ?? []).length} itens
              </span>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto divide-y divide-border/50 min-h-0">
            {(equipments ?? []).length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 p-8 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <Package className="h-6 w-6 text-muted-foreground/50" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Nenhum equipamento
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    Use o assistente ao lado para adicionar o primeiro item.
                  </p>
                </div>
              </div>
            ) : (
              (equipments ?? []).map((eq: any, i) => {
                const cat = eq.categories as { name: string } | null;
                return (
                  <motion.div
                    key={eq.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: Math.min(i * 0.02, 0.3) }}
                    className="flex items-start gap-3 px-4 py-2.5 hover:bg-muted/30 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate leading-snug">
                        {eq.name}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        {cat?.name && (
                          <span className="flex items-center gap-0.5 text-[11px] text-muted-foreground">
                            <Tag className="h-2.5 w-2.5" />
                            {cat.name}
                          </span>
                        )}
                        {eq.location && (
                          <span className="flex items-center gap-0.5 text-[11px] text-muted-foreground">
                            <MapPin className="h-2.5 w-2.5" />
                            <span className="truncate max-w-[80px]">{eq.location}</span>
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-xs font-semibold tabular-nums">{eq.quantity} un.</p>
                      <StatusBadge status={eq.status} className="mt-0.5 text-[10px]" />
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
