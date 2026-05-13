import { EquipmentMovement } from '../entities/EquipmentMovement';
import { PaginatedResult, PaginationParams, MovementType } from '../../shared/types/domain';

export interface MovementFilters {
  equipmentId?: string;
  userId?: string;
  type?: MovementType;
  workOrderId?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface IMovementRepository {
  save(movement: EquipmentMovement): Promise<void>;
  findById(id: string): Promise<EquipmentMovement | null>;
  list(
    filters: MovementFilters,
    pagination: PaginationParams
  ): Promise<PaginatedResult<EquipmentMovement>>;
  findByEquipmentId(
    equipmentId: string,
    pagination: PaginationParams
  ): Promise<PaginatedResult<EquipmentMovement>>;
  findByWorkOrderId(
    workOrderId: string,
    pagination: PaginationParams
  ): Promise<PaginatedResult<EquipmentMovement>>;
  delete(id: string): Promise<void>;
  findRecentMovements(limit: number): Promise<EquipmentMovement[]>;
  findMovementsByDateRange(
    startDate: Date,
    endDate: Date,
    pagination: PaginationParams
  ): Promise<PaginatedResult<EquipmentMovement>>;
}
