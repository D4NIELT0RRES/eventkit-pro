import { WorkOrder } from '../entities/WorkOrder';
import { PaginatedResult, PaginationParams, WorkOrderStatus } from '../../shared/types/domain';

export interface WorkOrderFilters {
  status?: WorkOrderStatus;
  clientId?: string;
  technicianId?: string;
  priority?: 'baixa' | 'media' | 'alta';
  search?: string;
}

export interface IWorkOrderRepository {
  save(workOrder: WorkOrder): Promise<void>;
  update(workOrder: WorkOrder): Promise<void>;
  findById(id: string): Promise<WorkOrder | null>;
  list(
    filters: WorkOrderFilters,
    pagination: PaginationParams
  ): Promise<PaginatedResult<WorkOrder>>;
  search(query: string, limit?: number): Promise<WorkOrder[]>;
  delete(id: string): Promise<void>;
  findByClientId(clientId: string, pagination: PaginationParams): Promise<PaginatedResult<WorkOrder>>;
  findByTechnicianId(
    technicianId: string,
    pagination: PaginationParams
  ): Promise<PaginatedResult<WorkOrder>>;
  findByStatus(status: WorkOrderStatus, pagination: PaginationParams): Promise<PaginatedResult<WorkOrder>>;
  findOverdueOrders(): Promise<WorkOrder[]>;
}
