import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { Wrench, AlertTriangle } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/maintenance")({ component: MaintenancePage });

function MaintenancePage() {
  const { data: maintenanceRecords, isLoading: loadingRecords } = useQuery({
    queryKey: ["maintenance"],
    queryFn: async () =>
      (await supabase.from("maintenance").select("*, equipments(name)").order("opened_at", { ascending: false })).data ?? [],
  });

  const { data: equipInMaintenance, isLoading: loadingEquip } = useQuery({
    queryKey: ["equipment-in-maintenance"],
    queryFn: async () =>
      (
        await supabase
          .from("equipments")
          .select("id, name, status, location, brand, model, categories(name)")
          .eq("status", "manutencao")
          .order("name")
      ).data ?? [],
    refetchInterval: 15_000,
  });

  const isLoading = loadingRecords || loadingEquip;

  const maintenanceIds = new Set(
    (maintenanceRecords ?? []).map((m: any) => m.equipment_id)
  );
  const withoutRecord = (equipInMaintenance ?? []).filter(
    (e: any) => !maintenanceIds.has(e.id)
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manutenção de Equipamento"
        description="Registros técnicos, custos e laudos de equipamentos"
      />

      {/* Equipamentos em manutenção sem registro formal */}
      {!isLoading && withoutRecord.length > 0 && (
        <div className="rounded-xl border border-warning/40 bg-warning/5 overflow-hidden">
          <div className="px-4 py-3 border-b border-warning/30 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <p className="text-sm font-semibold text-warning">
              Em manutenção agora — {withoutRecord.length} equipamento{withoutRecord.length !== 1 ? "s" : ""}
            </p>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-warning/10 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5 text-left">Equipamento</th>
                <th className="px-4 py-2.5 text-left">Categoria</th>
                <th className="px-4 py-2.5 text-left">Localização</th>
                <th className="px-4 py-2.5 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {withoutRecord.map((e: any) => (
                <tr key={e.id} className="border-t border-warning/20 hover:bg-warning/10 transition-colors">
                  <td className="px-4 py-3 font-medium">
                    {e.name}
                    {(e.brand || e.model) && (
                      <p className="text-xs text-muted-foreground">{[e.brand, e.model].filter(Boolean).join(" · ")}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{e.categories?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{e.location ?? "—"}</td>
                  <td className="px-4 py-3"><StatusBadge status={e.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Registros formais de manutenção */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
        <div className="px-4 py-3 border-b border-border">
          <p className="text-sm font-semibold">Registros de manutenção</p>
        </div>
        {isLoading ? (
          <div className="p-10 text-center text-sm text-muted-foreground">Carregando…</div>
        ) : (maintenanceRecords?.length ?? 0) === 0 ? (
          <EmptyState icon={Wrench} title="Sem registros de manutenção" description="Equipamentos marcados como 'em manutenção' aparecem aqui automaticamente." />
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">Equipamento</th>
                <th className="px-4 py-3 text-left">Aberto em</th>
                <th className="px-4 py-3 text-left">Custo</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {maintenanceRecords?.map((m: any) => (
                <tr key={m.id} className="border-t border-border/60 hover:bg-muted/20">
                  <td className="px-4 py-3 font-medium">{m.equipments?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(m.opened_at)}</td>
                  <td className="px-4 py-3">{formatCurrency(m.cost)}</td>
                  <td className="px-4 py-3"><StatusBadge status={m.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
