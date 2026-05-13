import { EquipmentStatus } from '../../shared/types/domain';

// Request DTOs
export interface CreateEquipmentDTO {
  name: string;
  patrimonyNo?: string;
  brand?: string;
  model?: string;
  description?: string;
  quantity: number;
  categoryId?: string;
  location?: string;
  notes?: string;
}

export interface UpdateEquipmentDTO {
  name?: string;
  patrimonyNo?: string;
  brand?: string;
  model?: string;
  description?: string;
  location?: string;
  notes?: string;
  status?: EquipmentStatus;
}

export interface AdjustStockDTO {
  quantity: number;
  availableQuantity: number;
  reason: string;
}

// Response DTO
export interface EquipmentResponseDTO {
  id: string;
  name: string;
  patrimonyNo?: string;
  brand?: string;
  model?: string;
  description?: string;
  quantity: number;
  availableQuantity: number;
  usedQuantity: number;
  status: EquipmentStatus;
  categoryId?: string;
  location?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface EquipmentListResponseDTO {
  items: EquipmentResponseDTO[];
  total: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
