import { EquipmentStatus } from '../../shared/types/domain';

// Request DTOs
export interface KitItemDTO {
  equipmentId: string;
  quantity: number;
}

export interface CreateKitDTO {
  name: string;
  description?: string;
  items: KitItemDTO[];
  location?: string;
  notes?: string;
}

export interface UpdateKitDTO {
  name?: string;
  description?: string;
  location?: string;
  notes?: string;
  status?: EquipmentStatus;
}

export interface KitItemActionDTO {
  equipmentId: string;
  quantity: number;
}

// Response DTO
export interface KitResponseDTO {
  id: string;
  name: string;
  description?: string;
  items: KitItemDTO[];
  itemCount: number;
  status: EquipmentStatus;
  location?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface KitListResponseDTO {
  items: KitResponseDTO[];
  total: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
