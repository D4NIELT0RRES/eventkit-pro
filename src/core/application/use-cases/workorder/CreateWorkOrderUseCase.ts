import { CreateWorkOrderDTO, WorkOrderResponseDTO } from '../dtos/WorkOrderDTO';
import { IWorkOrderRepository } from '../../domain/repositories/IWorkOrderRepository';
import { IEquipmentRepository } from '../../domain/repositories/IEquipmentRepository';
import { WorkOrderMapper } from '../mappers/WorkOrderMapper';
import { ValidationException, EquipmentNotFoundException } from '../../domain/exceptions';

export class CreateWorkOrderUseCase {
  constructor(
    private workOrderRepository: IWorkOrderRepository,
    private equipmentRepository: IEquipmentRepository
  ) {}

  async execute(input: CreateWorkOrderDTO): Promise<WorkOrderResponseDTO> {
    // 1. Validar entrada
    this.validateInput(input);

    // 2. Validar que todos os equipamentos existem
    for (const item of input.items) {
      const equipment = await this.equipmentRepository.findById(item.equipmentId);
      if (!equipment) {
        throw new EquipmentNotFoundException(item.equipmentId);
      }
    }

    // 3. Criar entity
    const workOrder = WorkOrderMapper.createDTOtoEntity(input);

    // 4. Persistir
    await this.workOrderRepository.save(workOrder);

    // 5. Retornar DTO
    return WorkOrderMapper.toResponseDTO(workOrder);
  }

  private validateInput(input: CreateWorkOrderDTO): void {
    const errors: Record<string, string[]> = {};

    if (!input.title || input.title.trim() === '') {
      errors.title = ['Título é obrigatório'];
    }

    if (!input.clientId) {
      errors.clientId = ['Cliente é obrigatório'];
    }

    if (!input.items || input.items.length === 0) {
      errors.items = ['Ordem de serviço deve ter pelo menos um item'];
    }

    for (let i = 0; i < (input.items?.length || 0); i++) {
      const item = input.items![i];
      if (!item.equipmentId) {
        errors[`items.${i}.equipmentId`] = ['ID do equipamento é obrigatório'];
      }
      if (!item.quantity || item.quantity <= 0) {
        errors[`items.${i}.quantity`] = ['Quantidade deve ser maior que zero'];
      }
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationException(errors);
    }
  }
}
