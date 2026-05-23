import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, ChevronDown, ChevronUp, Printer } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { ClipboardList } from "lucide-react";
import { formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EquipmentSelection } from "@/components/work-orders/EquipmentSelection";
import { runEquipmentSeed } from "@/lib/equipment-seed";

export const Route = createFileRoute("/_authenticated/work-orders")({ component: WOPage });

// ─── tipos locais ───────────────────────────────────────────
interface WOItem {
  itemId: string;
  qty: number;
  checked: boolean;
  confOut: boolean;
  confIn: boolean;
  returnCondition?: string;
}

// ─── geração do HTML para impressão ────────────────────────
function buildPrintHTML(wo: any, items: WOItem[], allEquipment: any[]): string {
  const selectedEquipment = items.filter((i) => i.checked);

  // Agrupa por categoria
  const grouped: Record<string, { name: string; qty: number; confOut: boolean; confIn: boolean }[]> = {};
  for (const item of selectedEquipment) {
    const eq = allEquipment.find((e) => e.id === item.itemId);
    if (!eq) continue;
    const cat = eq.categories?.name ?? "Outros";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push({ name: eq.name, qty: item.qty, confOut: item.confOut, confIn: item.confIn });
  }

  const rows = Object.entries(grouped)
    .map(([cat, equips]) => {
      const catRow = `<tr style="background:#f0f0f0"><td colspan="4" style="padding:6px 8px;font-weight:700;font-size:11px;text-transform:uppercase;letter-spacing:.05em">${cat}</td></tr>`;
      const equipRows = equips
        .map(
          (e) =>
            `<tr style="border-bottom:1px solid #ddd">
               <td style="padding:5px 8px">${e.name}</td>
               <td style="padding:5px 8px;text-align:center">${e.qty}</td>
               <td style="padding:5px 8px;text-align:center">${e.confOut ? "✓" : "□"}</td>
               <td style="padding:5px 8px;text-align:center">${e.confIn ? "✓" : "□"}</td>
             </tr>`
        )
        .join("");
      return catRow + equipRows;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8"/>
  <title>OS ${wo.code || wo.id?.slice(0, 8)} — ${wo.event_name}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; font-size: 12px; color: #111; padding: 20px; }
    h1 { font-size: 16px; margin-bottom: 4px; }
    .meta { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 16px; border: 1px solid #ccc; padding: 10px; border-radius: 4px; }
    .meta-item label { font-size: 9px; font-weight: 700; text-transform: uppercase; color: #666; display: block; margin-bottom: 2px; }
    .meta-item span { font-size: 12px; border-bottom: 1px solid #999; display: block; min-height: 18px; padding-bottom: 2px; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    thead tr { background: #222; color: #fff; }
    thead th { padding: 6px 8px; text-align: left; font-size: 11px; text-transform: uppercase; }
    @media print {
      button, .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px">
    <div>
      <h1>Ordem de Serviço — Sonorização</h1>
      <div style="font-size:11px;color:#666">OS: <strong>${wo.code || ("OS-" + wo.id?.slice(0, 8).toUpperCase())}</strong></div>
    </div>
    <button class="no-print" onclick="window.print()" style="padding:6px 14px;background:#111;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:12px">🖨 Imprimir</button>
  </div>

  <div class="meta">
    <div class="meta-item"><label>Evento</label><span>${wo.event_name || ""}</span></div>
    <div class="meta-item"><label>Cliente</label><span>${wo.producer || ""}</span></div>
    <div class="meta-item"><label>Orçamento</label><span>${wo.budget_no || ""}</span></div>
    <div class="meta-item"><label>Vendedor</label><span>${wo.seller || ""}</span></div>
    <div class="meta-item"><label>Produtor</label><span>${wo.producer || ""}</span></div>
    <div class="meta-item"><label>Téc. Responsável</label><span>${wo.tech_responsible || ""}</span></div>
    <div class="meta-item"><label>Local</label><span>${wo.location || ""}</span></div>
    <div class="meta-item"><label>Transporte</label><span>${wo.transport || ""}</span></div>
    <div class="meta-item"><label>Data Montagem</label><span>${wo.setup_date || ""}</span></div>
    <div class="meta-item"><label>Data Evento</label><span>${wo.event_date || ""}</span></div>
    <div class="meta-item"><label>Equipe Técnica</label><span>${wo.tech_team || ""}</span></div>
    <div class="meta-item"><label>Conferido por</label><span>${wo.reviewed_by || ""}</span></div>
  </div>
  ${wo.notes ? `<div style="margin-bottom:12px;padding:8px;border:1px solid #ccc;border-radius:4px"><label style="font-size:9px;font-weight:700;text-transform:uppercase;color:#666;display:block;margin-bottom:4px">Observações</label>${wo.notes}</div>` : ""}

  <table>
    <thead>
      <tr>
        <th>Equipamento</th>
        <th style="width:60px;text-align:center">Qtd</th>
        <th style="width:70px;text-align:center">OK Saída</th>
        <th style="width:70px;text-align:center">OK Retorno</th>
      </tr>
    </thead>
    <tbody>
      ${rows || '<tr><td colspan="4" style="padding:12px;text-align:center;color:#999">Nenhum equipamento selecionado</td></tr>'}
    </tbody>
  </table>

  <div style="margin-top:32px;display:grid;grid-template-columns:1fr 1fr;gap:40px">
    <div>
      <div style="border-top:1px solid #333;padding-top:4px;font-size:10px;text-align:center">Assinatura Saída</div>
    </div>
    <div>
      <div style="border-top:1px solid #333;padding-top:4px;font-size:10px;text-align:center">Assinatura Retorno</div>
    </div>
  </div>
</body>
</html>`;
}

function printWorkOrder(wo: any, items: WOItem[], allEquipment: any[]) {
  const html = buildPrintHTML(wo, items, allEquipment);
  const win = window.open("", "_blank", "width=900,height=700");
  if (!win) { toast.error("Popup bloqueado. Permita popups para este site."); return; }
  win.document.open();
  win.document.write(html);
  win.document.close();
  win.focus();
  // Aguarda assets carregarem e abre o diálogo de impressão
  setTimeout(() => win.print(), 400);
}

// ────────────────────────────────────────────────────────────

function WOPage() {
  const qc = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<Record<string, WOItem[]>>({});
  const [seeding, setSeeding] = useState(false);

  const { data: workOrders = [], isLoading: woLoading } = useQuery({
    queryKey: ["work_orders"],
    queryFn: async () => {
      const { data } = await supabase
        .from("work_orders")
        .select("*, work_order_items(*), clients(name)")
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  const { data: equipment = [] } = useQuery({
    queryKey: ["equipment-all"],
    queryFn: async () => {
      const { data } = await supabase
        .from("equipments")
        .select("id, name, brand, model, category_id, quantity, available_qty, categories(name, slug)");
      return data || [];
    },
  });

  // ── criar OS ─────────────────────────────────────────────
  const onCreate = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const payload: any = {
      event_name: f.get("event_name"),
      notes: f.get("notes") || null,
      status: "aberta",
      priority: f.get("priority") || "media",
      location: f.get("location") || null,
      event_date: f.get("event_date") || null,
    };
    const { error } = await supabase.from("work_orders").insert(payload);
    if (error) { toast.error(error.message); return; }
    toast.success("Ordem de serviço criada");
    setCreateOpen(false);
    qc.invalidateQueries({ queryKey: ["work_orders"] });
    (e.target as HTMLFormElement).reset();
  };

  // ── itens de equipamento ──────────────────────────────────
  const handleItemToggle = (woId: string, equipmentId: string, checked: boolean) => {
    setSelectedItems((prev) => {
      const items = [...(prev[woId] || [])];
      if (checked) {
        if (!items.find((i) => i.itemId === equipmentId)) {
          items.push({ itemId: equipmentId, qty: 1, checked: true, confOut: false, confIn: false });
        }
      } else {
        const idx = items.findIndex((i) => i.itemId === equipmentId);
        if (idx > -1) items.splice(idx, 1);
      }
      return { ...prev, [woId]: items };
    });
  };

  const handleQtyChange = (woId: string, equipmentId: string, qty: number) => {
    setSelectedItems((prev) => {
      const items = (prev[woId] || []).map((i) =>
        i.itemId === equipmentId ? { ...i, qty: Math.max(0, qty) } : i
      );
      return { ...prev, [woId]: items };
    });
  };

  const handleConfirmToggle = (woId: string, equipmentId: string, type: "out" | "in", checked: boolean) => {
    setSelectedItems((prev) => {
      const items = (prev[woId] || []).map((i) => {
        if (i.itemId !== equipmentId) return i;
        if (type === "out") return { ...i, confOut: checked, confIn: checked ? i.confIn : false };
        return { ...i, confIn: checked, returnCondition: checked ? (i.returnCondition ?? "ok") : undefined };
      });
      return { ...prev, [woId]: items };
    });
  };

  const handleReturnConditionChange = async (
    woId: string,
    equipmentId: string,
    condition: string,
  ) => {
    setSelectedItems((prev) => {
      const items = (prev[woId] || []).map((i) =>
        i.itemId === equipmentId ? { ...i, returnCondition: condition } : i
      );
      return { ...prev, [woId]: items };
    });

    await (supabase as any)
      .from("work_order_items")
      .update({ return_condition: condition, checked_in: true })
      .eq("work_order_id", woId)
      .eq("equipment_id", equipmentId);

    if (condition === "precisa_reparo" || condition === "danificado") {
      toast.success("Enviado para manutenção automaticamente");
      qc.invalidateQueries({ queryKey: ["equipment-all"] });
    } else if (condition === "extraviado") {
      toast.warning("Item registrado como extraviado");
    } else {
      toast.success("Retorno OK");
    }
  };

  // ── importar equipamentos ─────────────────────────────────
  const handleSeed = async () => {
    setSeeding(true);
    const { inserted, errors } = await runEquipmentSeed();
    setSeeding(false);
    if (errors.length) {
      toast.error("Erros: " + errors.join("; "));
      return;
    }
    if (inserted === 0) {
      toast.info("Equipamentos já estavam cadastrados. Nenhum novo item inserido.");
    } else {
      toast.success(`${inserted} equipamentos importados com sucesso!`);
      qc.invalidateQueries({ queryKey: ["equipment-all"] });
      qc.invalidateQueries({ queryKey: ["equipment-selection"] });
    }
  };

  const stats = {
    total: workOrders.length,
    aberta: workOrders.filter((w: any) => w.status === "aberta").length,
    em_andamento: workOrders.filter((w: any) => w.status === "em_andamento").length,
    finalizada: workOrders.filter((w: any) => w.status === "finalizada").length,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ordens de Serviço"
        description="Gestão de equipamentos com saída, conferência e retorno"
        actions={
          <div className="flex gap-2">
            {/* Importar equipamentos padrão */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleSeed}
              disabled={seeding}
              title="Importa todos os equipamentos padrão para o sistema"
            >
              {seeding ? "Importando…" : "↓ Importar Equipamentos"}
            </Button>

            {/* Nova OS */}
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-primary text-primary-foreground hover:opacity-90">
                  <Plus className="mr-2 h-4 w-4" /> Nova OS
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Nova Ordem de Serviço</DialogTitle>
                </DialogHeader>
                <form onSubmit={onCreate} className="grid gap-4 py-2">
                  {/* Linha 1 */}
                  <div className="grid gap-2">
                    <Label>Nome do Evento *</Label>
                    <Input name="event_name" required placeholder="Ex: Show Luan Santana — Allianz Parque" />
                  </div>
                  {/* Linha 2 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Local</Label>
                      <Input name="location" placeholder="Ibirapuera / MAM" />
                    </div>
                    <div className="grid gap-2">
                      <Label>Data do Evento</Label>
                      <Input type="date" name="event_date" />
                    </div>
                  </div>
                  {/* Linha 3 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Prioridade</Label>
                      <select name="priority" className="h-9 rounded-md border border-input bg-background px-3 text-sm" defaultValue="media">
                        <option value="baixa">🟢 Baixa</option>
                        <option value="media">🔵 Média</option>
                        <option value="alta">🟠 Alta</option>
                        <option value="urgente">🔴 Urgente</option>
                      </select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Status inicial</Label>
                      <select name="status" className="h-9 rounded-md border border-input bg-background px-3 text-sm" defaultValue="aberta">
                        <option value="aberta">Aberta</option>
                        <option value="em_andamento">Em andamento</option>
                      </select>
                    </div>
                  </div>
                  {/* Observações */}
                  <div className="grid gap-2">
                    <Label>Observações</Label>
                    <Textarea name="notes" rows={3} placeholder="Detalhes do evento, equipe, notas gerais…" />
                  </div>
                  <DialogFooter>
                    <Button variant="outline" type="button" onClick={() => setCreateOpen(false)}>Cancelar</Button>
                    <Button type="submit" className="bg-gradient-primary text-primary-foreground">Criar OS</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total", value: stats.total, color: "bg-blue-50 text-blue-700" },
          { label: "Abertas", value: stats.aberta, color: "bg-yellow-50 text-yellow-700" },
          { label: "Em Andamento", value: stats.em_andamento, color: "bg-purple-50 text-purple-700" },
          { label: "Finalizadas", value: stats.finalizada, color: "bg-green-50 text-green-700" },
        ].map((stat, i) => (
          <div key={i} className={`${stat.color} rounded-lg p-3 text-center`}>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-xs font-medium">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Lista de OS */}
      <div className="space-y-3">
        {woLoading ? (
          <div className="p-12 text-center text-muted-foreground">Carregando…</div>
        ) : workOrders.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="Nenhuma Ordem de Serviço"
            description="Crie uma nova OS para começar a gerenciar equipamentos"
          />
        ) : (
          workOrders.map((wo: any) => {
            const woItems = selectedItems[wo.id] || [];
            const selectedCount = woItems.filter((i) => i.checked).length;

            return (
              <div key={wo.id} className="border rounded-lg bg-card shadow-sm overflow-hidden hover:border-accent/60 transition-colors">
                {/* Cabeçalho colapsável */}
                <button
                  onClick={() => setExpandedId(expandedId === wo.id ? null : wo.id)}
                  className="w-full p-4 hover:bg-muted/40 transition-colors flex items-center justify-between"
                >
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <span className="font-mono text-xs font-semibold text-muted-foreground">
                        {wo.code || `OS-${wo.id.slice(0, 8).toUpperCase()}`}
                      </span>
                      <h3 className="font-semibold">{wo.event_name}</h3>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        wo.priority === "urgente" ? "bg-red-100 text-red-800"
                        : wo.priority === "alta" ? "bg-orange-100 text-orange-800"
                        : wo.priority === "media" ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                      }`}>{wo.priority}</span>
                      <StatusBadge status={wo.status} />
                      {selectedCount > 0 && (
                        <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          {selectedCount} equipamentos
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground space-x-4">
                      <span>📅 {formatDate(wo.event_date || wo.created_at)}</span>
                      {wo.location && <span>📍 {wo.location}</span>}
                    </div>
                  </div>
                  <div className="ml-4 flex items-center gap-2">
                    {/* Botões Print/PDF ficam visíveis mesmo com o card fechado */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1.5 no-print"
                      onClick={(e) => {
                        e.stopPropagation();
                        printWorkOrder(wo, woItems, equipment);
                      }}
                      title="Imprimir OS com equipamentos selecionados"
                    >
                      <Printer className="h-3.5 w-3.5" />
                      Imprimir
                    </Button>
                    {expandedId === wo.id ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </button>

                {/* Conteúdo expandido */}
                {expandedId === wo.id && (
                  <div className="border-t p-5 bg-muted/20 space-y-4">
                    <Tabs defaultValue="equipments">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="equipments">
                          Equipamentos
                          {selectedCount > 0 && (
                            <span className="ml-2 rounded-full bg-primary/20 px-2 text-xs font-semibold">
                              {selectedCount}
                            </span>
                          )}
                        </TabsTrigger>
                        <TabsTrigger value="checkout">Saída</TabsTrigger>
                        <TabsTrigger value="checkin">Retorno</TabsTrigger>
                      </TabsList>

                      {/* Aba Equipamentos */}
                      <TabsContent value="equipments" className="pt-4">
                        <EquipmentSelection
                          workOrderId={wo.id}
                          selectedItems={woItems}
                          onItemToggle={(eqId, checked) => handleItemToggle(wo.id, eqId, checked)}
                          onQtyChange={(eqId, qty) => handleQtyChange(wo.id, eqId, qty)}
                          onConfirmToggle={(eqId, type, checked) => handleConfirmToggle(wo.id, eqId, type, checked)}
                          onItemRemove={(eqId) => handleItemToggle(wo.id, eqId, false)}
                        />
                      </TabsContent>

                      {/* Aba Saída */}
                      <TabsContent value="checkout" className="pt-4 space-y-3">
                        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
                          Marque os equipamentos que confirmou a saída. O botão <strong>Imprimir</strong> gera a OS completa.
                        </div>
                        {woItems.filter((i) => i.checked).length === 0 ? (
                          <p className="text-sm text-muted-foreground py-4 text-center">Nenhum equipamento selecionado ainda.</p>
                        ) : (
                          woItems.filter((i) => i.checked).map((item) => {
                            const eq = equipment.find((e: any) => e.id === item.itemId);
                            return (
                              <div key={item.itemId} className="flex items-center justify-between rounded border bg-background p-3">
                                <div>
                                  <div className="font-medium text-sm">{eq?.name}</div>
                                  <div className="text-xs text-muted-foreground">Qtd: {item.qty}</div>
                                </div>
                                <label className="flex items-center gap-2 text-sm cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={item.confOut}
                                    onChange={(e) => handleConfirmToggle(wo.id, item.itemId, "out", e.target.checked)}
                                    className="h-4 w-4 rounded"
                                  />
                                  Saiu
                                </label>
                              </div>
                            );
                          })
                        )}
                      </TabsContent>

                      {/* Aba Retorno */}
                      <TabsContent value="checkin" className="pt-4 space-y-3">
                        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
                          Confirme o retorno e marque a condição. Itens com problema abrem manutenção automaticamente.
                        </div>
                        {woItems.filter((i) => i.confOut).length === 0 ? (
                          <p className="text-sm text-muted-foreground py-4 text-center">Nenhum equipamento marcado como saído.</p>
                        ) : (
                          woItems.filter((i) => i.confOut).map((item) => {
                            const eq = equipment.find((e: any) => e.id === item.itemId);
                            return (
                              <div key={item.itemId} className="flex items-center gap-3 rounded border bg-background p-3">
                                <input
                                  type="checkbox"
                                  checked={item.confIn}
                                  onChange={(e) => handleConfirmToggle(wo.id, item.itemId, "in", e.target.checked)}
                                  className="h-4 w-4 rounded"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-sm truncate">{eq?.name}</div>
                                  <div className="text-xs text-muted-foreground">Qtd: {item.qty}</div>
                                </div>
                                <select
                                  value={item.returnCondition ?? ""}
                                  disabled={!item.confIn}
                                  onChange={(e) => handleReturnConditionChange(wo.id, item.itemId, e.target.value)}
                                  className="h-8 rounded-md border border-input bg-background px-2 text-xs disabled:opacity-40"
                                >
                                  <option value="">Condição…</option>
                                  <option value="ok">✅ OK</option>
                                  <option value="precisa_reparo">🔧 Precisa Reparo</option>
                                  <option value="danificado">⚠️ Danificado</option>
                                  <option value="extraviado">❌ Extraviado</option>
                                </select>
                              </div>
                            );
                          })
                        )}
                      </TabsContent>
                    </Tabs>

                    {/* Rodapé */}
                    <div className="flex gap-2 justify-end pt-2 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => printWorkOrder(wo, woItems, equipment)}
                      >
                        <Printer className="mr-1.5 h-3.5 w-3.5" />
                        Imprimir / PDF
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setExpandedId(null)}>
                        Fechar
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
