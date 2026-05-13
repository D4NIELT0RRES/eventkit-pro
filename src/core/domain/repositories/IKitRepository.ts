import { Kit } from '../entities/Kit';
import { PaginatedResult, PaginationParams, EquipmentStatus } from '../../shared/types/domain';

export interface KitFilters {
  status?: EquipmentStatus;
  search?: string;
}

export interface IKitRepository {
  save(kit: Kit): Promise<void>;
  update(kit: Kit): Promise<void>;
  findById(id: string): Promise<Kit | null>;
  list(
    filters: KitFilters,
    pagination: PaginationParams
  ): Promise<PaginatedResult<Kit>>;
  search(query: string, limit?: number): Promise<Kit[]>;
  delete(id: string): Promise<void>;
  findByEquipmentId(equipmentId: string): Promise<Kit[]>;
  findActive(): Promise<Kit[]>;
}
