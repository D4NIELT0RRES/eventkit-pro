import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Search, Boxes } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/equipments")({ component: EquipmentsPage });

function EquipmentsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [category, setCategory] = useState<string>("all");
  const [open, setOpen] = useState(false);

  const { data: cats } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await supabase.from("categories").select("*").order("name")).data ?? [],
  });
  const { data: items, isLoading } = useQuery({
    queryKey: ["equipments", search, status, category],
    queryFn: async () => {
      let q = supabase.from("equipments").select("*, categories(name,color)").order("name");
      if (status !== "all") q = q.eq("status", status as any);
      if (category !== "all") q = q.eq("category_id", category);
      if (search) q = q.ilike("name", `%${search}%`);
      const { data } = await q;
      return data ?? [];
    },
  });

  const onCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const payload: any = {
      name: f.get("name"),
      brand: f.get("brand") || null,
      model: f.get("model") || null,
      patrimony_no: f.get("patrimony_no") || null,
      category_id: (f.get("category_id") as string) || null,
      quantity: Number(f.get("quantity") || 1),
      available_qty: Number(f.get("quantity") || 1),
      location: f.get("location") || null,
    };
    const { error } = await supabase.from("equipments").insert(payload);
    if (error) toast.error(error.message);
    else { toast.success("Equipamento cadastrado"); setOpen(false); qc.invalidateQueries({ queryKey: ["equipments"] }); }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Equipamentos"
        description="Catálogo completo do inventário"
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary text-primary-foreground hover:opacity-90"><Plus className="mr-2 h-4 w-4" /> Novo</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Novo equipamento</DialogTitle></DialogHeader>
              <form onSubmit={onCreate} className="grid gap-4">
                <div className="grid gap-2"><Label>Nome *</Label><Input name="name" required /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2"><Label>Marca</Label><Input name="brand" /></div>
                  <div className="grid gap-2"><Label>Modelo</Label><Input name="model" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2"><Label>Patrimônio</Label><Input name="patrimony_no" /></div>
                  <div className="grid gap-2"><Label>Quantidade</Label><Input name="quantity" type="number" defaultValue={1} min={1} /></div>
                </div>
                <div className="grid gap-2">
                  <Label>Categoria</Label>
                  <select name="category_id" className="h-9 rounded-md border border-input bg-background px-3 text-sm">
                    <option value="">—</option>
                    {(cats ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="grid gap-2"><Label>Localização</Label><Input name="location" placeholder="Galpão A · Prateleira 3" /></div>
                <DialogFooter><Button type="submit" className="bg-gradient-primary text-primary-foreground">Cadastrar</Button></DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar por nome..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos status</SelectItem>
            <SelectItem value="disponivel">Disponível</SelectItem>
            <SelectItem value="em_uso">Em uso</SelectItem>
            <SelectItem value="manutencao">Manutenção</SelectItem>
            <SelectItem value="reservado">Reservado</SelectItem>
            <SelectItem value="danificado">Danificado</SelectItem>
          </SelectContent>
        </Select>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-52"><SelectValue placeholder="Categoria" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas categorias</SelectItem>
            {(cats ?? []).map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
        {isLoading ? (
          <div className="p-10 text-center text-sm text-muted-foreground">Carregando…</div>
        ) : (items?.length ?? 0) === 0 ? (
          <EmptyState icon={Boxes} title="Nenhum equipamento" description="Cadastre o primeiro equipamento do seu inventário." />
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">Equipamento</th>
                <th className="px-4 py-3 text-left">Categoria</th>
                <th className="px-4 py-3 text-left">Patrimônio</th>
                <th className="px-4 py-3 text-left">Qtd.</th>
                <th className="px-4 py-3 text-left">Localização</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {items?.map((e: any) => (
                <tr key={e.id} className="border-t border-border/60 hover:bg-muted/20">
                  <td className="px-4 py-3">
                    <p className="font-medium">{e.name}</p>
                    <p className="text-xs text-muted-foreground">{[e.brand, e.model].filter(Boolean).join(" · ")}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{e.categories?.name ?? "—"}</td>
                  <td className="px-4 py-3 font-mono text-xs">{e.patrimony_no ?? "—"}</td>
                  <td className="px-4 py-3">{e.available_qty}/{e.quantity}</td>
                  <td className="px-4 py-3 text-muted-foreground">{e.location ?? "—"}</td>
                  <td className="px-4 py-3"><StatusBadge status={e.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
