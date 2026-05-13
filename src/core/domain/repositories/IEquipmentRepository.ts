import { Equipment } from '../entities/Equipment';
import { PaginatedResult, PaginationParams, EquipmentStatus } from '../../shared/types/domain';

export interface EquipmentFilters {
  categoryId?: string;
  status?: EquipmentStatus;
  search?: string;
}

export interface IEquipmentRepository {
  save(equipment: Equipment): Promise<void>;
  update(equipment: Equipment): Promise<void>;
  findById(id: string): Promise<Equipment | null>;
  findByPatrimony(patrimony: string): Promise<Equipment | null>;
  list(
    filters: EquipmentFilters,
    pagination: PaginationParams
  ): Promise<PaginatedResult<Equipment>>;
  search(query: string, limit?: number): Promise<Equipment[]>;
  delete(id: string): Promise<void>;
  countByCategory(categoryId: string): Promise<number>;
  findLowStockItems(threshold: number): Promise<Equipment[]>;
  findByCategoryId(categoryId: string, pagination: PaginationParams): Promise<PaginatedResult<Equipment>>;
}
