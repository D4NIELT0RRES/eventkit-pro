import { WorkOrderStatus } from '../../shared/types/domain';

// Request DTOs
export interface WorkOrderItemDTO {
  equipmentId: string;
  quantity: number;
}

export interface CreateWorkOrderDTO {
  title: string;
  description?: string;
  clientId: string;
  technicianId?: string;
  items: WorkOrderItemDTO[];
  priority?: 'baixa' | 'media' | 'alta';
  dueDate?: string;
  notes?: string;
}

export interface UpdateWorkOrderDTO {
  title?: string;
  description?: string;
  priority?: 'baixa' | 'media' | 'alta';
  dueDate?: string;
  notes?: string;
}

export interface AssignTechnicianDTO {
  technicianId: string;
}

export interface RecordItemUsageDTO {
  equipmentId: string;
  usedQuantity: number;
}

// Response DTO
export interface WorkOrderResponseDTO {
  id: string;
  title: string;
  description?: string;
  clientId: string;
  clientName?: string;
  technicianId?: string;
  technicianName?: string;
  items: WorkOrderItemDTO[];
  itemCount: number;
  status: WorkOrderStatus;
  priority: string;
  dueDate?: string;
  notes?: string;
  isOverdue: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WorkOrderListResponseDTO {
  items: WorkOrderResponseDTO[];
  total: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
