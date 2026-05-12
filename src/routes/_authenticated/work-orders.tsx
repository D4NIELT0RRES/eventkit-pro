import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { ClipboardList } from "lucide-react";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/work-orders")({ component: WOPage });

function WOPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["work_orders"],
    queryFn: async () => (await supabase.from("work_orders").select("*, clients(name)").order("created_at", { ascending: false })).data ?? [],
  });
  return (
    <div className="space-y-6">
      <PageHeader title="Ordens de Serviço" description="Gerencie eventos, clientes e equipes técnicas" />
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
        {isLoading ? <div className="p-10 text-center text-sm text-muted-foreground">Carregando…</div>
          : (data?.length ?? 0) === 0 ? <EmptyState icon={ClipboardList} title="Nenhuma OS" description="Crie a primeira ordem de serviço." />
          : <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr><th className="px-4 py-3 text-left">Código</th><th className="px-4 py-3 text-left">Evento</th><th className="px-4 py-3 text-left">Cliente</th><th className="px-4 py-3 text-left">Data</th><th className="px-4 py-3 text-left">Prioridade</th><th className="px-4 py-3 text-left">Status</th></tr>
            </thead>
            <tbody>
              {data?.map((w: any) => (
                <tr key={w.id} className="border-t border-border/60 hover:bg-muted/20">
                  <td className="px-4 py-3 font-mono text-xs">{w.code}</td>
                  <td className="px-4 py-3 font-medium">{w.event_name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{w.clients?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(w.event_date)}</td>
                  <td className="px-4 py-3"><StatusBadge status={w.priority} /></td>
                  <td className="px-4 py-3"><StatusBadge status={w.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>}
      </div>
    </div>
  );
}
