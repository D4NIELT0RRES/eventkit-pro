import { Bot, User, CheckCircle2, Package, MapPin, Hash, Tag, Trash2, Edit3 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import type { AIAction, EquipmentRow } from "@/lib/ai-agent.server";

// ─── Types ────────────────────────────────────────────────────────────────────

export type LocalMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  action?: AIAction;
  loading?: boolean;
};

// ─── Status helpers ───────────────────────────────────────────────────────────

const STATUS_LABEL: Record<string, string> = {
  disponivel: "Disponível",
  em_uso: "Em Uso",
  manutencao: "Manutenção",
  reservado: "Reservado",
  extraviado: "Extraviado",
  danificado: "Danificado",
};

// ─── Equipment Card (for add/update confirmations) ────────────────────────────

function EquipmentConfirmCard({
  equipment,
  type,
}: {
  equipment: EquipmentRow;
  type: "added" | "updated";
}) {
  const cat = equipment.categories as { name: string; color: string | null } | null;
  const isAdded = type === "added";

  return (
    <motion.div
      initial={{ opacity: 0, y: 4, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, delay: 0.1 }}
      className={cn(
        "mt-2 rounded-lg border p-3",
        isAdded
          ? "border-success/30 bg-success/5"
          : "border-primary/30 bg-primary/5"
      )}
    >
      <div className="flex items-start gap-2.5">
        {isAdded ? (
          <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
        ) : (
          <Edit3 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
        )}
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-sm truncate">{equipment.name}</p>
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5">
            {cat?.name && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Tag className="h-3 w-3" />
                {cat.name}
              </span>
            )}
            {equipment.location && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {equipment.location}
              </span>
            )}
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Hash className="h-3 w-3" />
              {equipment.quantity} unidade{equipment.quantity !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                isAdded ? "bg-success/20 text-success" : "bg-primary/20 text-primary"
              )}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", isAdded ? "bg-success" : "bg-primary")} />
              {STATUS_LABEL[equipment.status] ?? equipment.status}
            </span>
            {(equipment.brand || equipment.model) && (
              <span className="text-[10px] text-muted-foreground">
                {[equipment.brand, equipment.model].filter(Boolean).join(" · ")}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Equipment List (for list_equipments results) ─────────────────────────────

function EquipmentListResult({
  equipments,
  total,
}: {
  equipments: EquipmentRow[];
  total: number;
}) {
  if (total === 0) {
    return (
      <div className="mt-2 rounded-lg border border-border p-3 text-sm text-muted-foreground">
        Nenhum equipamento encontrado.
      </div>
    );
  }

  const shown = equipments.slice(0, 8);
  const remaining = total - shown.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: 0.1 }}
      className="mt-2 rounded-lg border border-border overflow-hidden"
    >
      <div className="px-3 py-1.5 bg-muted/40 text-xs font-medium text-muted-foreground border-b border-border">
        {total} equipamento{total !== 1 ? "s" : ""}
      </div>
      <ul className="divide-y divide-border/50">
        {shown.map((eq) => {
          const cat = eq.categories as { name: string } | null;
          return (
            <li key={eq.id} className="flex items-center gap-3 px-3 py-2 text-sm">
              <Package className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="flex-1 truncate font-medium text-sm">{eq.name}</span>
              {cat?.name && (
                <span className="text-xs text-muted-foreground shrink-0">{cat.name}</span>
              )}
              <span className="text-xs text-muted-foreground shrink-0 tabular-nums">
                {eq.quantity} un.
              </span>
            </li>
          );
        })}
      </ul>
      {remaining > 0 && (
        <div className="px-3 py-1.5 text-xs text-muted-foreground border-t border-border bg-muted/20">
          +{remaining} mais não exibido{remaining !== 1 ? "s" : ""}
        </div>
      )}
    </motion.div>
  );
}

// ─── Summary Card ─────────────────────────────────────────────────────────────

function SummaryCard({
  total,
  byStatus,
  byCategory,
}: {
  total: number;
  byStatus: Record<string, number>;
  byCategory: Record<string, number>;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: 0.1 }}
      className="mt-2 rounded-lg border border-border overflow-hidden"
    >
      <div className="px-3 py-1.5 bg-muted/40 text-xs font-medium text-muted-foreground border-b border-border flex items-center justify-between">
        <span>Resumo do Inventário</span>
        <span className="font-semibold text-foreground">{total} unidades</span>
      </div>
      {Object.keys(byCategory).length > 0 && (
        <div className="divide-y divide-border/50">
          {Object.entries(byCategory)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 6)
            .map(([cat, qty]) => (
              <div key={cat} className="flex items-center justify-between px-3 py-1.5 text-xs">
                <span className="text-muted-foreground">{cat}</span>
                <span className="font-medium tabular-nums">{qty} un.</span>
              </div>
            ))}
        </div>
      )}
    </motion.div>
  );
}

// ─── Remove Confirmation ──────────────────────────────────────────────────────

function RemoveConfirmation({ name }: { name: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: 0.1 }}
      className="mt-2 rounded-lg border border-destructive/25 bg-destructive/5 p-2.5 flex items-center gap-2"
    >
      <Trash2 className="h-3.5 w-3.5 text-destructive shrink-0" />
      <span className="text-xs text-destructive font-medium">{name} removido do inventário</span>
    </motion.div>
  );
}

// ─── Main ChatMessage Component ───────────────────────────────────────────────

export function ChatMessage({ message }: { message: LocalMessage }) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className={cn("flex gap-2.5", isUser ? "flex-row-reverse" : "flex-row")}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full mt-0.5",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted border border-border"
        )}
      >
        {isUser ? (
          <User className="h-3.5 w-3.5" />
        ) : (
          <Bot className="h-3.5 w-3.5 text-muted-foreground" />
        )}
      </div>

      {/* Content */}
      <div className={cn("max-w-[85%] flex flex-col", isUser ? "items-end" : "items-start")}>
        {/* Bubble */}
        {message.loading ? (
          <div className="rounded-xl bg-muted px-3 py-2.5 space-y-1.5 min-w-[100px]">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-3 w-20" />
          </div>
        ) : (
          <div
            className={cn(
              "rounded-xl px-3 py-2.5 text-sm leading-relaxed whitespace-pre-wrap",
              isUser
                ? "bg-primary text-primary-foreground rounded-br-sm"
                : "bg-muted text-foreground rounded-bl-sm"
            )}
          >
            {message.content}
          </div>
        )}

        {/* Action results */}
        {message.action?.type === "added" && (
          <EquipmentConfirmCard equipment={message.action.equipment} type="added" />
        )}
        {message.action?.type === "updated" && (
          <EquipmentConfirmCard equipment={message.action.equipment} type="updated" />
        )}
        {message.action?.type === "removed" && (
          <RemoveConfirmation name={message.action.name} />
        )}
        {message.action?.type === "listed" && (
          <EquipmentListResult
            equipments={message.action.equipments}
            total={message.action.total}
          />
        )}
        {message.action?.type === "summary" && (
          <SummaryCard
            total={message.action.total}
            byStatus={message.action.byStatus}
            byCategory={message.action.byCategory}
          />
        )}
      </div>
    </motion.div>
  );
}
