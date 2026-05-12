import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Boxes, CheckCircle2, Wrench, Calendar, ClipboardList, AlertTriangle, TrendingUp, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDateTime } from "@/lib/format";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export const Route = createFileRoute("/_authenticated/")({ component: Dashboard });

function Dashboard() {
  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const [eqs, wos, mvs] = await Promise.all([
        supabase.from("equipments").select("id,status,quantity"),
        supabase.from("work_orders").select("id,status"),
        supabase.from("equipment_movements").select("id,type,created_at").order("created_at", { ascending: false }).limit(50),
      ]);
      const e = eqs.data ?? [];
      const total = e.reduce((s, x) => s + (x.quantity ?? 0), 0);
      const by = (st: string) => e.filter((x) => x.status === st).length;
      return {
        total,
        disponivel: by("disponivel"),
        em_uso: by("em_uso"),
        manutencao: by("manutencao"),
        reservado: by("reservado"),
        os_abertas: (wos.data ?? []).filter((x) => x.status === "aberta" || x.status === "em_andamento").length,
        movements: mvs.data ?? [],
      };
    },
  });

  const { data: recent } = useQuery({
    queryKey: ["dashboard-recent"],
    queryFn: async () => {
      const { data } = await supabase
        .from("equipment_movements")
        .select("id,type,quantity,created_at,notes,equipments(name)")
        .order("created_at", { ascending: false })
        .limit(8);
      return data ?? [];
    },
  });

  const chartData = (() => {
    const days: { day: string; saidas: number; retornos: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString("pt-BR", { weekday: "short" });
      days.push({ day: key, saidas: 0, retornos: 0 });
    }
    (stats?.movements ?? []).forEach((m) => {
      const diff = Math.floor((Date.now() - new Date(m.created_at).getTime()) / 86400000);
      const idx = 6 - diff;
      if (idx >= 0 && idx < 7) {
        if (m.type === "saida") days[idx].saidas++;
        if (m.type === "retorno") days[idx].retornos++;
      }
    });
    return days;
  })();

  const cards = [
    { label: "Equipamentos totais", value: stats?.total ?? 0, icon: Boxes, tone: "from-primary/30 to-primary/5", iconColor: "text-primary" },
    { label: "Disponíveis", value: stats?.disponivel ?? 0, icon: CheckCircle2, tone: "from-success/30 to-success/5", iconColor: "text-success" },
    { label: "Em uso", value: stats?.em_uso ?? 0, icon: TrendingUp, tone: "from-info/30 to-info/5", iconColor: "text-info" },
    { label: "Em manutenção", value: stats?.manutencao ?? 0, icon: Wrench, tone: "from-warning/30 to-warning/5", iconColor: "text-warning" },
    { label: "Reservados", value: stats?.reservado ?? 0, icon: Calendar, tone: "from-primary/30 to-primary/5", iconColor: "text-primary" },
    { label: "OS abertas", value: stats?.os_abertas ?? 0, icon: ClipboardList, tone: "from-accent/40 to-accent/5", iconColor: "text-accent-foreground" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Visão geral em tempo real do seu inventário e operação" />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {cards.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            className={`relative overflow-hidden rounded-xl border border-border bg-gradient-to-br ${c.tone} p-4 shadow-card`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">{c.label}</p>
                <p className="mt-2 text-2xl font-bold tracking-tight">{c.value}</p>
              </div>
              <c.icon className={`h-5 w-5 ${c.iconColor}`} />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Movimentações (últimos 7 dias)</h3>
              <p className="text-xs text-muted-foreground">Saídas e retornos diários</p>
            </div>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.7 0.18 250)" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="oklch(0.7 0.18 250)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.74 0.18 155)" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="oklch(0.74 0.18 155)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.5 0.02 258 / 20%)" />
                <XAxis dataKey="day" stroke="oklch(0.68 0.02 258)" fontSize={11} />
                <YAxis stroke="oklch(0.68 0.02 258)" fontSize={11} />
                <Tooltip contentStyle={{ background: "oklch(0.21 0.025 262)", border: "1px solid oklch(0.28 0.02 262)", borderRadius: 8 }} />
                <Area type="monotone" dataKey="saidas" stroke="oklch(0.7 0.18 250)" fill="url(#g1)" strokeWidth={2} />
                <Area type="monotone" dataKey="retornos" stroke="oklch(0.74 0.18 155)" fill="url(#g2)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold">Atividade recente</h3>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </div>
          <ul className="space-y-3">
            {(recent ?? []).length === 0 && <li className="text-sm text-muted-foreground">Sem movimentações ainda.</li>}
            {(recent ?? []).map((m: any) => (
              <li key={m.id} className="flex items-start justify-between gap-3 border-b border-border/50 pb-3 last:border-0">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{m.equipments?.name ?? "Equipamento"}</p>
                  <p className="text-xs text-muted-foreground">{formatDateTime(m.created_at)}</p>
                </div>
                <StatusBadge status={m.type} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
