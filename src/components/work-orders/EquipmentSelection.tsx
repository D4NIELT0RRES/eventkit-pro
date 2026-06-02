import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Search, Minus, X, Plus, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

interface WorkOrderItem {
  itemId: string;
  qty: number;
  checked: boolean;
  confOut: boolean;
  confIn: boolean;
}

interface EquipmentSelectionProps {
  workOrderId: string;
  selectedItems: WorkOrderItem[];
  onItemToggle: (equipmentId: string, checked: boolean) => void;
  onQtyChange: (equipmentId: string, qty: number) => void;
  onConfirmToggle: (equipmentId: string, type: 'out' | 'in', checked: boolean) => void;
  onItemRemove: (equipmentId: string) => void;
}

interface EquipmentRow {
  id: string;
  name: string;
  brand: string | null;
  model: string | null;
  category: string;
  categoryId: string;
  categorySlug: string;
  stock: number;
  available: number;
  reserved: number;
}

interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  color: string | null;
}

const ALL_FILTER = 'all';

export function EquipmentSelection({
  workOrderId,
  selectedItems,
  onItemToggle,
  onQtyChange,
  onConfirmToggle,
  onItemRemove,
}: EquipmentSelectionProps) {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>(ALL_FILTER);
  const [quickAddCategory, setQuickAddCategory] = useState<CategoryRow | null>(null);

  // Categorias em ordem alfabética
  const { data: categories = [] } = useQuery<CategoryRow[]>({
    queryKey: ['categories-ordered'],
    queryFn: async () => {
      const { data } = await supabase
        .from('categories')
        .select('id, name, slug, color')
        .order('name');
      return (data ?? []) as CategoryRow[];
    },
  });

  const { data: equipment = [] } = useQuery<EquipmentRow[]>({
    queryKey: ['equipment-selection'],
    queryFn: async () => {
      const { data: eqs } = await supabase
        .from('equipments')
        .select('id, name, brand, model, category_id, quantity, available_qty, categories(name, slug)')
        .order('name');
      const { data: stocks } = await (supabase as any)
        .from('stock_levels')
        .select('equipment_id, total_stock, available_stock, reserved_stock');
      const stockMap = new Map((stocks ?? []).map((s: any) => [s.equipment_id, s]));
      return (eqs ?? []).map((eq: any) => {
        const stock = stockMap.get(eq.id);
        return {
          id: eq.id,
          name: eq.name,
          brand: eq.brand,
          model: eq.model,
          category: eq.categories?.name ?? 'Sem categoria',
          categoryId: eq.category_id,
          categorySlug: eq.categories?.slug ?? '',
          stock: (stock as any)?.total_stock ?? eq.quantity ?? 0,
          available: (stock as any)?.available_stock ?? eq.available_qty ?? 0,
          reserved: (stock as any)?.reserved_stock ?? 0,
        } as EquipmentRow;
      });
    },
  });

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return equipment.filter((eq) => {
      if (filter !== ALL_FILTER && eq.categorySlug !== filter) return false;
      if (!term) return true;
      return (
        eq.name.toLowerCase().includes(term) ||
        (eq.brand ?? '').toLowerCase().includes(term) ||
        (eq.model ?? '').toLowerCase().includes(term)
      );
    });
  }, [equipment, filter, search]);

  // Agrupado por categoria em ordem alfabética
  const grouped = useMemo(() => {
    const groups = new Map<string, { category: CategoryRow; items: EquipmentRow[] }>();
    for (const eq of filtered) {
      const cat = categories.find((c) => c.id === eq.categoryId);
      if (!cat) continue;
      if (!groups.has(cat.id)) groups.set(cat.id, { category: cat, items: [] });
      groups.get(cat.id)!.items.push(eq);
    }
    return Array.from(groups.values()).sort((a, b) =>
      a.category.name.localeCompare(b.category.name, 'pt-BR')
    );
  }, [filtered, categories]);

  const selectedCount = selectedItems.filter((i) => i.checked).length;

  const clearSelection = () => {
    selectedItems
      .filter((i) => i.checked)
      .forEach((i) => onItemToggle(i.itemId, false));
  };

  const handleQuickAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!quickAddCategory) return;
    const f = new FormData(e.currentTarget);
    const name = String(f.get('name') ?? '').trim();
    const qty = Math.max(0, Number(f.get('quantity') ?? 0));
    if (!name) {
      toast.error('Informe o nome do equipamento');
      return;
    }
    const { data, error } = await supabase
      .from('equipments')
      .insert({
        name,
        brand: (f.get('brand') as string) || null,
        model: (f.get('model') as string) || null,
        category_id: quickAddCategory.id,
        quantity: qty,
        available_qty: qty,
        status: 'disponivel',
      })
      .select('id')
      .single();
    if (error) {
      toast.error(error.message);
      return;
    }
    if (data?.id) {
      await (supabase as any).from('stock_levels').upsert(
        { equipment_id: data.id, total_stock: qty, available_stock: qty },
        { onConflict: 'equipment_id' },
      );
    }
    toast.success(`${name} adicionado em ${quickAddCategory.name}`);
    setQuickAddCategory(null);
    qc.invalidateQueries({ queryKey: ['equipment-selection'] });
    qc.invalidateQueries({ queryKey: ['equipment-all'] });
  };

  const handleDeleteEquipment = async (eq: EquipmentRow) => {
    if (!window.confirm(`Remover "${eq.name}" do catálogo?`)) return;
    const { error } = await supabase.from('equipments').delete().eq('id', eq.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success('Equipamento removido');
    qc.invalidateQueries({ queryKey: ['equipment-selection'] });
    qc.invalidateQueries({ queryKey: ['equipment-all'] });
  };

  return (
    <div className="space-y-4">
      {/* Header: contador + limpar seleção */}
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Equipamentos
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-muted-foreground">{selectedCount} selecionados</span>
          <Button
            variant="outline"
            size="sm"
            onClick={clearSelection}
            disabled={selectedCount === 0}
          >
            Limpar seleção
          </Button>
        </div>
      </div>

      {/* Pills de categoria — ordem alfabética */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFilter(ALL_FILTER)}
          className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
            filter === ALL_FILTER
              ? 'bg-primary text-primary-foreground'
              : 'border border-border bg-background hover:bg-muted'
          }`}
        >
          Todos
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setFilter(c.slug)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
              filter === c.slug
                ? 'bg-primary text-primary-foreground'
                : 'border border-border bg-background hover:bg-muted'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Busca livre */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar equipamento por nome, marca ou modelo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Tabela agrupada */}
      <div className="overflow-hidden rounded-lg border">
        <div className="grid grid-cols-[40px_1fr_110px_70px_130px_90px] bg-muted/40 px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          <div>OS</div>
          <div>Equipamento</div>
          <div className="text-center">Estoque</div>
          <div className="text-center">Qtd.</div>
          <div className="text-center">Status</div>
          <div className="text-center">Saída / Retorno</div>
        </div>

        {grouped.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-muted-foreground">
            Nenhum equipamento encontrado nesse filtro.
          </div>
        ) : (
          grouped.map(({ category, items }) => (
            <div key={category.id}>
              {/* Header da categoria com botão +Item */}
              <div className="flex items-center gap-2 border-y bg-muted/20 px-4 py-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {category.name}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 px-2 text-[11px]"
                  onClick={() => setQuickAddCategory(category)}
                >
                  <Plus className="mr-1 h-3 w-3" />
                  Item
                </Button>
              </div>

              {items.map((eq) => {
                const item = selectedItems.find((i) => i.itemId === eq.id);
                const isSelected = item?.checked ?? false;
                const qty = item?.qty ?? 0;
                const maxQty = eq.available;
                const isOverLimit = qty > maxQty;
                const isEmpty = eq.stock === 0;
                const statusLabel = isEmpty
                  ? 'Sem estoque'
                  : eq.available > 0
                  ? 'Disponível'
                  : 'Reservado';
                const statusClass = isEmpty
                  ? 'bg-muted text-muted-foreground border-border'
                  : eq.available > 0
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : 'bg-orange-50 text-orange-700 border-orange-200';

                return (
                  <div
                    key={eq.id}
                    className={`grid grid-cols-[40px_1fr_110px_70px_130px_90px] items-center border-t px-4 py-2.5 text-sm transition-colors hover:bg-muted/10 ${
                      isEmpty && !isSelected ? 'opacity-60' : ''
                    }`}
                  >
                    <div>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(c) => onItemToggle(eq.id, c as boolean)}
                        disabled={isEmpty}
                      />
                    </div>
                    <div>
                      <div className={`font-medium ${isSelected ? '' : 'text-foreground'}`}>
                        {eq.name}
                      </div>
                      {eq.brand || eq.model ? (
                        <div className="text-xs text-muted-foreground">
                          {[eq.brand, eq.model].filter(Boolean).join(' · ')}
                        </div>
                      ) : null}
                    </div>
                    <div className="text-center">
                      <div className={`font-mono ${isEmpty ? 'text-muted-foreground' : ''}`}>
                        {eq.stock}
                      </div>
                      <div
                        className={`text-[10px] font-semibold ${
                          eq.available === 0 ? 'text-destructive' : 'text-green-600'
                        }`}
                      >
                        livre: {eq.available}
                      </div>
                    </div>
                    <div className="text-center">
                      <input
                        type="number"
                        min={0}
                        max={maxQty}
                        value={qty}
                        onChange={(e) => onQtyChange(eq.id, parseInt(e.target.value) || 0)}
                        disabled={!isSelected}
                        className={`h-7 w-14 rounded border px-1 text-center text-sm ${
                          isOverLimit
                            ? 'border-destructive bg-destructive/10'
                            : 'border-input'
                        } disabled:opacity-50`}
                      />
                    </div>
                    <div className="text-center">
                      <span
                        className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${statusClass}`}
                      >
                        {statusLabel}
                      </span>
                    </div>
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        title="Diminuir quantidade"
                        onClick={() => {
                          if (!isSelected) return;
                          const next = Math.max(0, qty - 1);
                          onQtyChange(eq.id, next);
                          if (next === 0) onItemToggle(eq.id, false);
                        }}
                        disabled={!isSelected}
                        className="rounded p-1 text-muted-foreground hover:bg-muted disabled:opacity-30"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        title="Remover do catálogo"
                        onClick={() => handleDeleteEquipment(eq)}
                        className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>

      {/* Alerta de quantidade acima do disponível */}
      {selectedItems.some((i) => {
        const eq = equipment.find((e) => e.id === i.itemId);
        return eq && i.qty > eq.available;
      }) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Há equipamentos com quantidade acima do disponível em estoque. Ajuste antes de
            confirmar a saída.
          </AlertDescription>
        </Alert>
      )}

      {/* Dialog de quick add por categoria */}
      <Dialog
        open={!!quickAddCategory}
        onOpenChange={(o) => !o && setQuickAddCategory(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Novo item em {quickAddCategory?.name}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleQuickAdd} className="grid gap-3">
            <div className="grid gap-1.5">
              <Label>Nome *</Label>
              <Input name="name" required placeholder="Ex: Yamaha CL5" autoFocus />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>Marca</Label>
                <Input name="brand" placeholder="Yamaha" />
              </div>
              <div className="grid gap-1.5">
                <Label>Modelo</Label>
                <Input name="model" placeholder="CL5" />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label>Quantidade em estoque</Label>
              <Input name="quantity" type="number" defaultValue={1} min={0} />
            </div>
            <DialogFooter className="mt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setQuickAddCategory(null)}
              >
                Cancelar
              </Button>
              <Button type="submit" className="bg-gradient-primary text-primary-foreground">
                Adicionar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
