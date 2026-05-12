export const STATUS_LABEL: Record<string, string> = {
  disponivel: "Disponível",
  em_uso: "Em uso",
  manutencao: "Manutenção",
  reservado: "Reservado",
  extraviado: "Extraviado",
  danificado: "Danificado",
  aberta: "Aberta",
  em_andamento: "Em andamento",
  aguardando: "Aguardando",
  finalizada: "Finalizada",
  concluida: "Concluída",
  cancelada: "Cancelada",
  rascunho: "Rascunho",
  reservado_kit: "Reservado",
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
  urgente: "Urgente",
  saida: "Saída",
  retorno: "Retorno",
  transferencia: "Transferência",
};

export const STATUS_TONE: Record<string, "success" | "warning" | "info" | "destructive" | "muted" | "primary"> = {
  disponivel: "success",
  em_uso: "info",
  manutencao: "warning",
  reservado: "primary",
  extraviado: "destructive",
  danificado: "destructive",
  aberta: "info",
  em_andamento: "primary",
  aguardando: "warning",
  finalizada: "success",
  concluida: "success",
  cancelada: "muted",
  baixa: "muted",
  media: "info",
  alta: "warning",
  urgente: "destructive",
  saida: "warning",
  retorno: "success",
  transferencia: "info",
};

export const ROLE_LABEL: Record<string, string> = {
  admin: "Administrador",
  tecnico: "Técnico",
  operador: "Operador",
  estoquista: "Estoquista",
};

export function formatDate(d: string | Date | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}
export function formatDateTime(d: string | Date | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}
export function formatCurrency(n: number | null | undefined) {
  if (n == null) return "—";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);
}
