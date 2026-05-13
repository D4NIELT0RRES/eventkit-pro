import { WorkOrderListResponseDTO } from '../dtos/WorkOrderDTO';
import { IWorkOrderRepository, WorkOrderFilters } from '../../domain/repositories/IWorkOrderRepository';
import { WorkOrderMapper } from '../mappers/WorkOrderMapper';
import { PaginationParams } from '../../shared/types/domain';

export class ListWorkOrdersUseCase {
  constructor(private workOrderRepository: IWorkOrderRepository) {}

  async execute(
    filters: WorkOrderFilters = {},
    pagination: PaginationParams
  ): Promise<WorkOrderListResponseDTO> {
    const result = await this.workOrderRepository.list(filters, pagination);

    return {
      items: result.items.map((workOrder) => WorkOrderMapper.toResponseDTO(workOrder)),
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
      hasNextPage: result.hasNextPage,
      hasPreviousPage: result.hasPreviousPage,
    };
  }
}
