import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { Wrench } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/maintenance")({ component: MaintenancePage });

function MaintenancePage() {
  const { data, isLoading } = useQuery({
    queryKey: ["maintenance"],
    queryFn: async () => (await supabase.from("maintenance").select("*, equipments(name)").order("opened_at", { ascending: false })).data ?? [],
  });
  return (
    <div className="space-y-6">
      <PageHeader title="Manutenção" description="Registros técnicos, custos e laudos" />
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
        {isLoading ? <div className="p-10 text-center text-sm text-muted-foreground">Carregando…</div>
          : (data?.length ?? 0) === 0 ? <EmptyState icon={Wrench} title="Sem registros de manutenção" />
          : <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr><th className="px-4 py-3 text-left">Equipamento</th><th className="px-4 py-3 text-left">Aberto em</th><th className="px-4 py-3 text-left">Custo</th><th className="px-4 py-3 text-left">Status</th></tr>
            </thead>
            <tbody>
              {data?.map((m: any) => (
                <tr key={m.id} className="border-t border-border/60 hover:bg-muted/20">
                  <td className="px-4 py-3 font-medium">{m.equipments?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(m.opened_at)}</td>
                  <td className="px-4 py-3">{formatCurrency(m.cost)}</td>
                  <td className="px-4 py-3"><StatusBadge status={m.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>}
      </div>
    </div>
  );
}
