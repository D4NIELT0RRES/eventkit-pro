import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { ArrowLeftRight } from "lucide-react";
import { formatDateTime } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/movements")({ component: MovementsPage });

function MovementsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["movements"],
    queryFn: async () => {
      const { data } = await supabase.from("equipment_movements")
        .select("*, equipments(name)").order("created_at", { ascending: false }).limit(100);
      return data ?? [];
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Movimentações" description="Histórico de saídas, retornos e transferências" />
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
        {isLoading ? <div className="p-10 text-center text-sm text-muted-foreground">Carregando…</div>
          : (data?.length ?? 0) === 0 ? <EmptyState icon={ArrowLeftRight} title="Nenhuma movimentação" />
          : <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr><th className="px-4 py-3 text-left">Equipamento</th><th className="px-4 py-3 text-left">Tipo</th><th className="px-4 py-3 text-left">Qtd.</th><th className="px-4 py-3 text-left">Data</th><th className="px-4 py-3 text-left">Notas</th></tr>
            </thead>
            <tbody>
              {data?.map((m: any) => (
                <tr key={m.id} className="border-t border-border/60 hover:bg-muted/20">
                  <td className="px-4 py-3 font-medium">{m.equipments?.name ?? "—"}</td>
                  <td className="px-4 py-3"><StatusBadge status={m.type} /></td>
                  <td className="px-4 py-3">{m.quantity}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDateTime(m.created_at)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{m.notes ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>}
      </div>
    </div>
  );
}
