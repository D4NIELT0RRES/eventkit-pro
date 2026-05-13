import { WorkOrderResponseDTO } from '../dtos/WorkOrderDTO';
import { IWorkOrderRepository } from '../../domain/repositories/IWorkOrderRepository';
import { WorkOrderValidationDomainService } from '../../domain/services/WorkOrderValidationDomainService';
import { WorkOrderMapper } from '../mappers/WorkOrderMapper';
import { WorkOrderNotFoundException } from '../../domain/exceptions';

export class CompleteWorkOrderUseCase {
  constructor(
    private workOrderRepository: IWorkOrderRepository,
    private workOrderValidationService: WorkOrderValidationDomainService
  ) {}

  async execute(workOrderId: string): Promise<WorkOrderResponseDTO> {
    const workOrder = await this.workOrderRepository.findById(workOrderId);

    if (!workOrder) {
      throw new WorkOrderNotFoundException(workOrderId);
    }

    // Validar se pode ser concluída
    this.workOrderValidationService.validateCanComplete(workOrder);

    // Concluir
    workOrder.complete();

    // Persistir
    await this.workOrderRepository.update(workOrder);

    return WorkOrderMapper.toResponseDTO(workOrder);
  }
}
