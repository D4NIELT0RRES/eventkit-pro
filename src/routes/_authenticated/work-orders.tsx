import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useRef } from "react";
import {
  Plus, ChevronDown, ChevronUp, Printer,
  Wand2, Loader2, ClipboardList, CalendarDays, MapPin, FileText,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { EquipmentSelection } from "@/components/work-orders/EquipmentSelection";
import { parseWorkOrderDescription } from "@/lib/ai-agent.server";
import { runEquipmentSeed } from "@/lib/equipment-seed";

export const Route = createFileRoute("/_authenticated/work-orders")({ component: WOPage });

// ─── Local types ──────────────────────────────────────────────────────────────

interface WOItem {
  itemId: string;
  qty: number;
  checked: boolean;
  confOut: boolean;
  confIn: boolean;
  returnCondition?: string;
}

type WOPriority = "baixa" | "media" | "alta" | "urgente";

interface NewWOForm {
  event_name: string;
  location: string;
  event_date: string;
  priority: WOPriority;
  notes: string;
}

const EMPTY_FORM: NewWOForm = {
  event_name: "",
  location: "",
  event_date: "",
  priority: "media",
  notes: "",
};

// ─── Print ────────────────────────────────────────────────────────────────────

function buildPrintHTML(wo: any, items: WOItem[], allEquipment: any[]): string {
  const selected = items.filter((i) => i.checked);
  const grouped: Record<string, { name: string; qty: number; confOut: boolean; confIn: boolean }[]> = {};

  for (const item of selected) {
    const eq = allEquipment.find((e) => e.id === item.itemId);
    if (!eq) continue;
    const cat = eq.categories?.name ?? "Outros";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push({ name: eq.name, qty: item.qty, confOut: item.confOut, confIn: item.confIn });
  }

  const rows = Object.entries(grouped).map(([cat, equips]) => {
    const catRow = `<tr style="background:#f0f0f0"><td colspan="4" style="padding:6px 8px;font-weight:700;font-size:11px;text-transform:uppercase;letter-spacing:.05em">${cat}</td></tr>`;
    const equipRows = equips.map((e) =>
      `<tr style="border-bottom:1px solid #ddd">
         <td style="padding:5px 8px">${e.name}</td>
         <td style="padding:5px 8px;text-align:center">${e.qty}</td>
         <td style="padding:5px 8px;text-align:center">${e.confOut ? "✓" : "□"}</td>
         <td style="padding:5px 8px;text-align:center">${e.confIn ? "✓" : "□"}</td>
       </tr>`
    ).join("");
    return catRow + equipRows;
  }).join("");

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8"/>
  <title>OS ${wo.code || wo.id?.slice(0, 8)} — ${wo.event_name}</title>
  <style>
    * { box-sizing:border-box; margin:0; padding:0; }
    body { font-family:Arial,sans-serif; font-size:12px; color:#111; padding:20px; }
    h1 { font-size:16px; margin-bottom:4px; }
    .meta { display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; margin-bottom:16px; border:1px solid #ccc; padding:10px; border-radius:4px; }
    .meta-item label { font-size:9px; font-weight:700; text-transform:uppercase; color:#666; display:block; margin-bottom:2px; }
    .meta-item span { font-size:12px; border-bottom:1px solid #999; display:block; min-height:18px; padding-bottom:2px; }
    table { width:100%; border-collapse:collapse; margin-top:12px; }
    thead tr { background:#222; color:#fff; }
    thead th { padding:6px 8px; text-align:left; font-size:11px; text-transform:uppercase; }
    @media print { button,.no-print { display:none !important; } }
  </style>
</head>
<body>
  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px">
    <div>
      <h1>Ordem de Serviço</h1>
      <div style="font-size:11px;color:#666">OS: <strong>${wo.code || "OS-" + wo.id?.slice(0, 8).toUpperCase()}</strong></div>
    </div>
    <button class="no-print" onclick="window.print()" style="padding:6px 14px;background:#111;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:12px">Imprimir</button>
  </div>
  <div class="meta">
    <div class="meta-item"><label>Evento</label><span>${wo.event_name || ""}</span></div>
    <div class="meta-item"><label>Local</label><span>${wo.location || ""}</span></div>
    <div class="meta-item"><label>Data</label><span>${wo.event_date || ""}</span></div>
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
    <div><div style="border-top:1px solid #333;padding-top:4px;font-size:10px;text-align:center">Assinatura Saída</div></div>
    <div><div style="border-top:1px solid #333;padding-top:4px;font-size:10px;text-align:center">Assinatura Retorno</div></div>
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
  setTimeout(() => win.print(), 400);
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function WOPage() {
  const qc = useQueryClient();

  // Sheet state
  const [sheetOpen, setSheetOpen] = useState(false);
  const [form, setForm] = useState<NewWOForm>(EMPTY_FORM);
  const [newItems, setNewItems] = useState<WOItem[]>([]);
  const [saving, setSaving] = useState(false);

  // AI quick-fill state
  const [aiDesc, setAiDesc] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // Existing OS list state
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<Record<string, WOItem[]>>({});
  const [seeding, setSeeding] = useState(false);

  const formRef = useRef<HTMLDivElement>(null);

  // ── Queries ──────────────────────────────────────────────────────────────────

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

  // ── AI quick-fill ─────────────────────────────────────────────────────────────

  const handleAIFill = async () => {
    if (!aiDesc.trim() || aiLoading) return;
    setAiLoading(true);
    try {
      const result = await parseWorkOrderDescription({ data: { description: aiDesc } });
      setForm((prev) => ({
        event_name: result.event_name || prev.event_name,
        location: result.location || prev.location,
        event_date: result.event_date || prev.event_date,
        priority: (result.priority as WOPriority) || prev.priority,
        notes: result.notes || prev.notes,
      }));
      // Scroll to the form after filling
      setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch {
      toast.error("Não foi possível interpretar a descrição.");
    } finally {
      setAiLoading(false);
    }
  };

  // ── Create OS ────────────────────────────────────────────────────────────────

  const handleCreate = async (print: boolean) => {
    if (!form.event_name.trim()) {
      toast.error("Informe o nome do evento.");
      return;
    }
    setSaving(true);

    const { data: wo, error } = await supabase
      .from("work_orders")
      .insert({
        event_name: form.event_name,
        location: form.location || null,
        event_date: form.event_date || null,
        priority: form.priority,
        notes: form.notes || null,
        status: "aberta",
      })
      .select()
      .single();

    if (error || !wo) {
      toast.error(error?.message ?? "Erro ao criar OS.");
      setSaving(false);
      return;
    }

    // Save selected equipment
    const checked = newItems.filter((i) => i.checked && i.qty > 0);
    if (checked.length > 0) {
      await supabase.from("work_order_items").insert(
        checked.map((i) => ({
          work_order_id: wo.id,
          equipment_id: i.itemId,
          quantity: i.qty,
          checked_out: false,
          checked_in: false,
        }))
      );
    }

    toast.success(`OS criada${checked.length > 0 ? ` com ${checked.length} equipamento(s)` : ""}!`);

    if (print) printWorkOrder(wo, newItems, equipment);

    setSheetOpen(false);
    setForm(EMPTY_FORM);
    setNewItems([]);
    setAiDesc("");
    setSaving(false);
    qc.invalidateQueries({ queryKey: ["work_orders"] });
  };

  function openSheet() {
    setForm(EMPTY_FORM);
    setNewItems([]);
    setAiDesc("");
    setSheetOpen(true);
  }

  // ── Item handlers (new OS) ────────────────────────────────────────────────────

  const newItemToggle = (equipmentId: string, checked: boolean) => {
    setNewItems((prev) => {
      const items = [...prev];
      if (checked) {
        if (!items.find((i) => i.itemId === equipmentId))
          items.push({ itemId: equipmentId, qty: 1, checked: true, confOut: false, confIn: false });
      } else {
        const idx = items.findIndex((i) => i.itemId === equipmentId);
        if (idx > -1) items.splice(idx, 1);
      }
      return items;
    });
  };

  const newItemQty = (equipmentId: string, qty: number) => {
    setNewItems((prev) =>
      prev.map((i) => (i.itemId === equipmentId ? { ...i, qty: Math.max(0, qty) } : i))
    );
  };

  // ── Item handlers (existing OS) ───────────────────────────────────────────────

  const handleItemToggle = (woId: string, equipmentId: string, checked: boolean) => {
    setSelectedItems((prev) => {
      const items = [...(prev[woId] || [])];
      if (checked) {
        if (!items.find((i) => i.itemId === equipmentId))
          items.push({ itemId: equipmentId, qty: 1, checked: true, confOut: false, confIn: false });
      } else {
        const idx = items.findIndex((i) => i.itemId === equipmentId);
        if (idx > -1) items.splice(idx, 1);
      }
      return { ...prev, [woId]: items };
    });
  };

  const handleQtyChange = (woId: string, equipmentId: string, qty: number) => {
    setSelectedItems((prev) => ({
      ...prev,
      [woId]: (prev[woId] || []).map((i) =>
        i.itemId === equipmentId ? { ...i, qty: Math.max(0, qty) } : i
      ),
    }));
  };

  const handleConfirmToggle = (woId: string, equipmentId: string, type: "out" | "in", checked: boolean) => {
    setSelectedItems((prev) => ({
      ...prev,
      [woId]: (prev[woId] || []).map((i) => {
        if (i.itemId !== equipmentId) return i;
        if (type === "out") return { ...i, confOut: checked, confIn: checked ? i.confIn : false };
        return { ...i, confIn: checked, returnCondition: checked ? (i.returnCondition ?? "ok") : undefined };
      }),
    }));
  };

  const handleReturnConditionChange = async (woId: string, equipmentId: string, condition: string) => {
    setSelectedItems((prev) => ({
      ...prev,
      [woId]: (prev[woId] || []).map((i) =>
        i.itemId === equipmentId ? { ...i, returnCondition: condition } : i
      ),
    }));
    await (supabase as any)
      .from("work_order_items")
      .update({ return_condition: condition, checked_in: true })
      .eq("work_order_id", woId)
      .eq("equipment_id", equipmentId);
    if (condition === "precisa_reparo" || condition === "danificado") {
      toast.success("Enviado para manutenção automaticamente");
    } else if (condition === "extraviado") {
      toast.warning("Item registrado como extraviado");
    } else {
      toast.success("Retorno OK");
    }
    qc.invalidateQueries({ queryKey: ["equipment-all"] });
  };

  // ── Seed ─────────────────────────────────────────────────────────────────────

  const handleSeed = async () => {
    setSeeding(true);
    const { inserted, errors } = await runEquipmentSeed();
    setSeeding(false);
    if (errors.length) { toast.error("Erros: " + errors.join("; ")); return; }
    if (inserted === 0) {
      toast.info("Equipamentos já estavam cadastrados.");
    } else {
      toast.success(`${inserted} equipamentos importados!`);
      qc.invalidateQueries({ queryKey: ["equipment-all"] });
      qc.invalidateQueries({ queryKey: ["equipment-selection"] });
    }
  };

  // ── Stats ─────────────────────────────────────────────────────────────────────

  const stats = {
    total: workOrders.length,
    aberta: workOrders.filter((w: any) => w.status === "aberta").length,
    em_andamento: workOrders.filter((w: any) => w.status === "em_andamento").length,
    finalizada: workOrders.filter((w: any) => w.status === "finalizada").length,
  };

  const newSelectedCount = newItems.filter((i) => i.checked).length;

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ordens de Serviço"
        description="Gestão de equipamentos com saída, conferência e retorno"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleSeed} disabled={seeding}>
              {seeding ? "Importando…" : "↓ Importar Equipamentos"}
            </Button>
            <Button className="bg-gradient-primary text-primary-foreground hover:opacity-90" onClick={openSheet}>
              <Plus className="mr-2 h-4 w-4" /> Nova OS
            </Button>
          </div>
        }
      />

      {/* ── Stats ── */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total", value: stats.total, color: "bg-blue-50 text-blue-700" },
          { label: "Abertas", value: stats.aberta, color: "bg-yellow-50 text-yellow-700" },
          { label: "Em Andamento", value: stats.em_andamento, color: "bg-purple-50 text-purple-700" },
          { label: "Finalizadas", value: stats.finalizada, color: "bg-green-50 text-green-700" },
        ].map((s, i) => (
          <div key={i} className={`${s.color} rounded-lg p-3 text-center`}>
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-xs font-medium">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── OS list ── */}
      <div className="space-y-3">
        {woLoading ? (
          <div className="p-12 text-center text-muted-foreground">Carregando…</div>
        ) : workOrders.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="Nenhuma Ordem de Serviço"
            description="Clique em Nova OS para criar a primeira"
          />
        ) : (
          workOrders.map((wo: any) => {
            const woItems = selectedItems[wo.id] || [];
            const selectedCount = woItems.filter((i) => i.checked).length;

            return (
              <div key={wo.id} className="border rounded-lg bg-card shadow-sm overflow-hidden hover:border-accent/60 transition-colors">
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
                    <Button
                      variant="outline" size="sm" className="h-8 gap-1.5 no-print"
                      onClick={(e) => { e.stopPropagation(); printWorkOrder(wo, woItems, equipment); }}
                    >
                      <Printer className="h-3.5 w-3.5" /> Imprimir
                    </Button>
                    {expandedId === wo.id
                      ? <ChevronUp className="h-5 w-5 text-muted-foreground" />
                      : <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    }
                  </div>
                </button>

                {expandedId === wo.id && (
                  <div className="border-t p-5 bg-muted/20 space-y-4">
                    <Tabs defaultValue="equipments">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="equipments">
                          Equipamentos
                          {selectedCount > 0 && (
                            <span className="ml-2 rounded-full bg-primary/20 px-2 text-xs font-semibold">{selectedCount}</span>
                          )}
                        </TabsTrigger>
                        <TabsTrigger value="checkout">Saída</TabsTrigger>
                        <TabsTrigger value="checkin">Retorno</TabsTrigger>
                      </TabsList>

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

                      <TabsContent value="checkout" className="pt-4 space-y-3">
                        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
                          Marque os equipamentos que confirmou a saída.
                        </div>
                        {woItems.filter((i) => i.checked).length === 0 ? (
                          <p className="text-sm text-muted-foreground py-4 text-center">Nenhum equipamento selecionado.</p>
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
                                  <input type="checkbox" checked={item.confOut}
                                    onChange={(e) => handleConfirmToggle(wo.id, item.itemId, "out", e.target.checked)}
                                    className="h-4 w-4 rounded" />
                                  Saiu
                                </label>
                              </div>
                            );
                          })
                        )}
                      </TabsContent>

                      <TabsContent value="checkin" className="pt-4 space-y-3">
                        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
                          Confirme o retorno e a condição. Itens com problema abrem manutenção automaticamente.
                        </div>
                        {woItems.filter((i) => i.confOut).length === 0 ? (
                          <p className="text-sm text-muted-foreground py-4 text-center">Nenhum equipamento marcado como saído.</p>
                        ) : (
                          woItems.filter((i) => i.confOut).map((item) => {
                            const eq = equipment.find((e: any) => e.id === item.itemId);
                            return (
                              <div key={item.itemId} className="flex items-center gap-3 rounded border bg-background p-3">
                                <input type="checkbox" checked={item.confIn}
                                  onChange={(e) => handleConfirmToggle(wo.id, item.itemId, "in", e.target.checked)}
                                  className="h-4 w-4 rounded" />
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-sm truncate">{eq?.name}</div>
                                  <div className="text-xs text-muted-foreground">Qtd: {item.qty}</div>
                                </div>
                                <select value={item.returnCondition ?? ""} disabled={!item.confIn}
                                  onChange={(e) => handleReturnConditionChange(wo.id, item.itemId, e.target.value)}
                                  className="h-8 rounded-md border border-input bg-background px-2 text-xs disabled:opacity-40">
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

                    <div className="flex gap-2 justify-end pt-2 border-t">
                      <Button variant="outline" size="sm" onClick={() => printWorkOrder(wo, woItems, equipment)}>
                        <Printer className="mr-1.5 h-3.5 w-3.5" /> Imprimir / PDF
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setExpandedId(null)}>Fechar</Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ── New OS Sheet ─────────────────────────────────────────────────────────── */}

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="right"
          className="w-full sm:w-[680px] sm:max-w-[680px] flex flex-col p-0 overflow-hidden"
        >
          <SheetHeader className="px-6 py-4 border-b shrink-0">
            <SheetTitle className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              Nova Ordem de Serviço
            </SheetTitle>
          </SheetHeader>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto">

            {/* AI Quick-fill */}
            <div className="px-6 py-4 bg-primary/5 border-b">
              <p className="text-xs font-semibold text-primary mb-2 flex items-center gap-1.5">
                <Wand2 className="h-3.5 w-3.5" />
                Preenchimento automático com IA
              </p>
              <p className="text-xs text-muted-foreground mb-3">
                Descreva o evento e a IA preenche os campos abaixo automaticamente.
              </p>
              <div className="flex gap-2">
                <Input
                  value={aiDesc}
                  onChange={(e) => setAiDesc(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAIFill()}
                  placeholder='Ex: "Show de rock no Ibirapuera dia 15/07, prioridade alta"'
                  className="text-sm"
                  disabled={aiLoading}
                />
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  className="shrink-0 gap-1.5"
                  onClick={handleAIFill}
                  disabled={!aiDesc.trim() || aiLoading}
                >
                  {aiLoading
                    ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    : <Wand2 className="h-3.5 w-3.5" />
                  }
                  Preencher
                </Button>
              </div>
            </div>

            {/* Event data form */}
            <div className="px-6 py-5 space-y-4" ref={formRef}>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" /> Dados do Serviço
              </p>

              <div className="grid gap-2">
                <Label>Nome do Evento *</Label>
                <Input
                  value={form.event_name}
                  onChange={(e) => setForm((f) => ({ ...f, event_name: e.target.value }))}
                  placeholder="Ex: Show Luan Santana — Allianz Parque"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label className="flex items-center gap-1.5">
                    <MapPin className="h-3 w-3" /> Local
                  </Label>
                  <Input
                    value={form.location}
                    onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                    placeholder="Ibirapuera / MAM"
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="flex items-center gap-1.5">
                    <CalendarDays className="h-3 w-3" /> Data do Evento
                  </Label>
                  <Input
                    type="date"
                    value={form.event_date}
                    onChange={(e) => setForm((f) => ({ ...f, event_date: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Prioridade</Label>
                <select
                  value={form.priority}
                  onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as WOPriority }))}
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="baixa">🟢 Baixa</option>
                  <option value="media">🔵 Média</option>
                  <option value="alta">🟠 Alta</option>
                  <option value="urgente">🔴 Urgente</option>
                </select>
              </div>

              <div className="grid gap-2">
                <Label>Observações</Label>
                <Textarea
                  rows={2}
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="Detalhes do evento, equipe, notas gerais…"
                  className="resize-none"
                />
              </div>
            </div>

            <Separator />

            {/* Equipment selection */}
            <div className="px-6 py-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5" /> Equipamentos
                </span>
                {newSelectedCount > 0 && (
                  <span className="rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-xs font-semibold normal-case">
                    {newSelectedCount} selecionado{newSelectedCount !== 1 ? "s" : ""}
                  </span>
                )}
              </p>
              <EquipmentSelection
                workOrderId=""
                selectedItems={newItems}
                onItemToggle={newItemToggle}
                onQtyChange={newItemQty}
                onConfirmToggle={() => {}}
                onItemRemove={(eqId) => newItemToggle(eqId, false)}
              />
            </div>
          </div>

          {/* Footer */}
          <SheetFooter className="px-6 py-4 border-t shrink-0 flex-row justify-between gap-2">
            <Button variant="outline" onClick={() => setSheetOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => handleCreate(false)}
                disabled={saving || !form.event_name.trim()}
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Salvar
              </Button>
              <Button
                className="bg-gradient-primary text-primary-foreground hover:opacity-90 gap-2"
                onClick={() => handleCreate(true)}
                disabled={saving || !form.event_name.trim()}
              >
                <Printer className="h-4 w-4" />
                Salvar + Imprimir
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
