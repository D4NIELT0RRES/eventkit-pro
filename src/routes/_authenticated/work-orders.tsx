import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { ClipboardList } from "lucide-react";
import { formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/work-orders")({ component: WOPage });

function WOPage() {
  const qc = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["work_orders"],
    queryFn: async () => (await supabase.from("work_orders").select("*, clients(name)").order("created_at", { ascending: false })).data ?? [],
  });

  const { data: equipments } = useQuery({
    queryKey: ["equipments-for-wo"],
    queryFn: async () => (await supabase.from("equipments").select("id, name, brand, model, available_qty").order("name")).data ?? [],
  });

  const onCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const payload = {
      event_name: f.get("event_name"),
      notes: f.get("notes") || null,
      status: "aberta",
      priority: f.get("priority") || "media",
    };

    const { error } = await supabase.from("work_orders").insert(payload);
    if (error) toast.error(error.message);
    else {
      toast.success("Ordem de serviço criada");
      setCreateOpen(false);
      qc.invalidateQueries({ queryKey: ["work_orders"] });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ordens de Serviço"
        description="Gerencie eventos, clientes e equipes técnicas"
        actions={
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary text-primary-foreground hover:opacity-90">
                <Plus className="mr-2 h-4 w-4" /> Nova OS
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova Ordem de Serviço</DialogTitle>
              </DialogHeader>
              <form onSubmit={onCreate} className="grid gap-4">
                <div className="grid gap-2">
                  <Label>Nome do Evento *</Label>
                  <Input name="event_name" required placeholder="Ex: Show Johnny Maracujá" />
                </div>
                <div className="grid gap-2">
                  <Label>Notas</Label>
                  <textarea
                    name="notes"
                    className="h-24 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="Detalhes do evento, locação, cliente..."
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Prioridade</Label>
                  <select
                    name="priority"
                    className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                    defaultValue="media"
                  >
                    <option value="baixa">Baixa</option>
                    <option value="media">Média</option>
                    <option value="alta">Alta</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </div>
                <DialogFooter>
                  <Button type="submit" className="bg-gradient-primary text-primary-foreground">
                    Criar
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
        {isLoading ? (
          <div className="p-10 text-center text-sm text-muted-foreground">Carregando…</div>
        ) : (data?.length ?? 0) === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="Nenhuma OS"
            description="Crie a primeira ordem de serviço para começar."
          />
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">Código</th>
                <th className="px-4 py-3 text-left">Evento</th>
                <th className="px-4 py-3 text-left">Cliente</th>
                <th className="px-4 py-3 text-left">Data</th>
                <th className="px-4 py-3 text-left">Prioridade</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {data?.map((w: any) => (
                <tr key={w.id} className="border-t border-border/60 hover:bg-muted/20">
                  <td className="px-4 py-3 font-mono text-xs">{w.code || w.id.slice(0, 8)}</td>
                  <td className="px-4 py-3 font-medium">{w.event_name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{w.clients?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{w.event_date ? formatDate(w.event_date) : formatDate(w.created_at)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                      w.priority === "urgente"
                        ? "bg-red-100 text-red-800"
                        : w.priority === "alta"
                          ? "bg-orange-100 text-orange-800"
                          : w.priority === "media"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                    }`}>
                      {w.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={w.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
