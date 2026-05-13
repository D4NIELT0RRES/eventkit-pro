import { MovementType } from '../../shared/types/domain';

// Request DTOs
export interface RegisterMovementDTO {
  equipmentId: string;
  quantity: number;
  type: MovementType;
  workOrderId?: string;
  notes?: string;
  reference?: string;
}

// Response DTO
export interface MovementResponseDTO {
  id: string;
  equipmentId: string;
  equipmentName?: string;
  quantity: number;
  type: MovementType;
  userId: string;
  userName?: string;
  workOrderId?: string;
  notes?: string;
  reference?: string;
  createdAt: string;
}

export interface MovementListResponseDTO {
  items: MovementResponseDTO[];
  total: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
