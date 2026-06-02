import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, parseISO,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, Plus, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/_authenticated/schedule")({ component: SchedulePage });

// ─── Types ────────────────────────────────────────────────────────────────────

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  color: string;
  type: "work_order" | "custom";
  priority?: string;
}

const PRIORITY_COLOR: Record<string, string> = {
  urgente: "#ef4444",
  alta:    "#f97316",
  media:   "#3b82f6",
  baixa:   "#6b7280",
};

// ─── Component ────────────────────────────────────────────────────────────────

function SchedulePage() {
  const qc = useQueryClient();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverDay, setDragOverDay] = useState<string | null>(null);
  const [customEvents, setCustomEvents] = useState<CalendarEvent[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("");

  // ── Ordens de serviço como eventos — atualiza automaticamente ──────────────

  const { data: workOrders = [] } = useQuery({
    queryKey: ["schedule-work-orders"],
    queryFn: async () => {
      const { data } = await supabase
        .from("work_orders")
        .select("id, event_name, event_date, priority, status")
        .not("event_date", "is", null);
      return data ?? [];
    },
    // Refetch sempre que a aba estiver em foco, para pegar novas OSs criadas
    refetchOnWindowFocus: true,
  });

  const woEvents: CalendarEvent[] = (workOrders as any[]).map((wo) => ({
    id: wo.id,
    title: wo.event_name,
    date: wo.event_date,
    color: PRIORITY_COLOR[wo.priority] ?? PRIORITY_COLOR.baixa,
    type: "work_order" as const,
    priority: wo.priority,
  }));

  const allEvents = [...woEvents, ...customEvents];

  // ── Grade do calendário ────────────────────────────────────────────────────

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  function eventsForDay(day: Date): CalendarEvent[] {
    return allEvents.filter((e) => {
      try { return isSameDay(parseISO(e.date), day); } catch { return false; }
    });
  }

  // ── Drag & Drop — reordena eventos entre dias ─────────────────────────────

  async function handleDrop(day: Date) {
    if (!draggingId) return;
    const newDateStr = format(day, "yyyy-MM-dd");

    const isWO = woEvents.some((e) => e.id === draggingId);
    if (isWO) {
      const { error } = await supabase
        .from("work_orders")
        .update({ event_date: newDateStr })
        .eq("id", draggingId);
      if (error) {
        toast.error("Erro ao mover evento");
      } else {
        toast.success("OS movida para " + format(day, "dd/MM/yyyy"));
        qc.invalidateQueries({ queryKey: ["schedule-work-orders"] });
        qc.invalidateQueries({ queryKey: ["work_orders"] });
      }
    } else {
      setCustomEvents((prev) =>
        prev.map((e) => (e.id === draggingId ? { ...e, date: newDateStr } : e))
      );
      toast.success("Evento movido!");
    }

    setDraggingId(null);
    setDragOverDay(null);
  }

  // ── Adicionar evento personalizado ────────────────────────────────────────

  function handleAdd() {
    if (!newTitle.trim() || !newDate) {
      toast.error("Preencha o título e a data");
      return;
    }
    setCustomEvents((prev) => [
      ...prev,
      {
        id: `custom-${Date.now()}`,
        title: newTitle.trim(),
        date: newDate,
        color: "#8b5cf6",
        type: "custom",
      },
    ]);
    setNewTitle("");
    setNewDate("");
    setAddOpen(false);
    toast.success("Evento adicionado!");
  }

  function openAddForDay(day: Date) {
    setNewDate(format(day, "yyyy-MM-dd"));
    setAddOpen(true);
  }

  const selectedEvents = selectedDay ? eventsForDay(selectedDay) : [];
  const WEEK_DAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

  return (
    <div className="flex flex-col gap-4 h-full overflow-hidden">
      <PageHeader
        title="Calendário"
        description="Ordens de serviço aparecem automaticamente. Arraste para reorganizar."
        actions={
          <Button
            className="bg-gradient-primary text-primary-foreground hover:opacity-90"
            onClick={() => setAddOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Novo Evento
          </Button>
        }
      />

      <div className="flex gap-4 flex-1 min-h-0">
        {/* ── Calendário ── */}
        <div className="flex-1 rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col">
          {/* Navegação de mês */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-border shrink-0">
            <Button variant="ghost" size="icon" onClick={() => setCurrentMonth((m) => subMonths(m, 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-sm font-semibold capitalize">
              {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
            </h2>
            <Button variant="ghost" size="icon" onClick={() => setCurrentMonth((m) => addMonths(m, 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Cabeçalho dias da semana */}
          <div className="grid grid-cols-7 border-b border-border shrink-0">
            {WEEK_DAYS.map((d) => (
              <div key={d} className="py-2 text-center text-[11px] font-semibold text-muted-foreground">
                {d}
              </div>
            ))}
          </div>

          {/* Grade de dias */}
          <div className="grid grid-cols-7 flex-1 content-start overflow-y-auto">
            {days.map((day, i) => {
              const inMonth = isSameMonth(day, currentMonth);
              const isToday = isSameDay(day, new Date());
              const isSelected = selectedDay ? isSameDay(day, selectedDay) : false;
              const dayKey = format(day, "yyyy-MM-dd");
              const isDragTarget = dragOverDay === dayKey;
              const dayEvents = eventsForDay(day);

              return (
                <div
                  key={i}
                  className={cn(
                    "min-h-[90px] p-1.5 border-b border-r border-border/40 cursor-pointer select-none transition-colors",
                    !inMonth && "bg-muted/20 opacity-40",
                    isSelected && "ring-1 ring-inset ring-primary/40 bg-primary/5",
                    isDragTarget && "bg-primary/10 ring-2 ring-inset ring-primary/60",
                    "hover:bg-muted/20",
                  )}
                  onClick={() => setSelectedDay(day)}
                  onDragOver={(e) => { e.preventDefault(); setDragOverDay(dayKey); }}
                  onDragLeave={() => setDragOverDay(null)}
                  onDrop={(e) => { e.preventDefault(); handleDrop(day); }}
                >
                  <div className={cn(
                    "w-6 h-6 flex items-center justify-center rounded-full text-xs font-semibold mb-1",
                    isToday ? "bg-primary text-primary-foreground" : "text-foreground",
                  )}>
                    {format(day, "d")}
                  </div>

                  <div className="space-y-0.5">
                    {dayEvents.slice(0, 3).map((ev) => (
                      <div
                        key={ev.id}
                        draggable
                        onDragStart={(e) => { e.stopPropagation(); setDraggingId(ev.id); }}
                        onDragEnd={() => { setDraggingId(null); setDragOverDay(null); }}
                        onClick={(e) => e.stopPropagation()}
                        title={ev.title}
                        className={cn(
                          "rounded px-1.5 py-0.5 text-[10px] font-medium text-white truncate cursor-grab active:cursor-grabbing transition-opacity",
                          draggingId === ev.id && "opacity-40",
                        )}
                        style={{ backgroundColor: ev.color }}
                      >
                        {ev.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-[10px] text-muted-foreground px-1">
                        +{dayEvents.length - 3} mais
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Painel lateral ── */}
        <div className="w-64 xl:w-72 shrink-0 rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col">
          <AnimatePresence mode="wait">
            {selectedDay ? (
              <motion.div
                key={format(selectedDay, "yyyy-MM-dd")}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
                className="flex flex-col h-full"
              >
                <div className="px-4 py-3 border-b border-border shrink-0">
                  <p className="text-sm font-semibold capitalize">
                    {format(selectedDay, "EEEE, d 'de' MMMM", { locale: ptBR })}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {selectedEvents.length} evento{selectedEvents.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {selectedEvents.length === 0 ? (
                    <div className="text-center py-8">
                      <CalendarDays className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">Nenhum evento neste dia</p>
                      <Button
                        variant="outline" size="sm" className="mt-3 text-xs"
                        onClick={() => openAddForDay(selectedDay)}
                      >
                        <Plus className="mr-1 h-3 w-3" /> Adicionar
                      </Button>
                    </div>
                  ) : (
                    selectedEvents.map((ev) => (
                      <div key={ev.id} className="rounded-lg border border-border p-2.5 bg-muted/20">
                        <div className="flex items-start gap-2">
                          <div
                            className="mt-0.5 h-2.5 w-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: ev.color }}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold truncate">{ev.title}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              {ev.type === "work_order"
                                ? `Ordem de Serviço${ev.priority ? ` · ${ev.priority}` : ""}`
                                : "Evento personalizado"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {selectedEvents.length > 0 && (
                  <div className="px-3 pb-3 shrink-0">
                    <Button
                      variant="outline" size="sm" className="w-full text-xs"
                      onClick={() => openAddForDay(selectedDay)}
                    >
                      <Plus className="mr-1 h-3 w-3" /> Novo evento neste dia
                    </Button>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-full p-6 text-center"
              >
                <CalendarDays className="h-10 w-10 text-muted-foreground/20 mb-3" />
                <p className="text-sm text-muted-foreground">Clique em um dia para ver os eventos</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Arraste eventos entre dias para reorganizar</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Legenda */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground shrink-0">
        {[
          { label: "Urgente", color: "#ef4444" },
          { label: "Alta",    color: "#f97316" },
          { label: "Média",   color: "#3b82f6" },
          { label: "Baixa",   color: "#6b7280" },
          { label: "Personalizado", color: "#8b5cf6" },
        ].map((item) => (
          <span key={item.label} className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
            {item.label}
          </span>
        ))}
      </div>

      {/* Dialog: novo evento personalizado */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-4 w-4" /> Novo Evento
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-1">
            <Input
              placeholder="Título do evento"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              autoFocus
            />
            <Input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
            />
            <div className="flex gap-2 pt-1">
              <Button variant="outline" className="flex-1" onClick={() => setAddOpen(false)}>
                Cancelar
              </Button>
              <Button
                className="flex-1 bg-gradient-primary text-primary-foreground"
                onClick={handleAdd}
                disabled={!newTitle.trim() || !newDate}
              >
                Adicionar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
