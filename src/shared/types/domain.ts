// Tipos e enums do domínio

export enum EquipmentStatus {
  ATIVO = 'ativo',
  INATIVO = 'inativo',
  MANUTENCAO = 'manutencao',
  DESCARTADO = 'descartado',
}

export enum MovementType {
  SAIDA = 'saida',
  ENTRADA = 'entrada',
  RETORNO = 'retorno',
  AJUSTE = 'ajuste',
}

export enum WorkOrderStatus {
  ABERTA = 'aberta',
  EM_PROGRESSO = 'em_progresso',
  CONCLUIDA = 'concluida',
  CANCELADA = 'cancelada',
}

export enum UserRole {
  ADMIN = 'admin',
  ESTOQUISTA = 'estoquista',
  TECNICO = 'tecnico',
  GERENTE = 'gerente',
  USUARIO = 'usuario',
}

export type Entity<T> = T & {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
};

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
