import { AdjustStockDTO, EquipmentResponseDTO } from '../dtos/EquipmentDTO';
import { IEquipmentRepository } from '../../domain/repositories/IEquipmentRepository';
import { EquipmentMapper } from '../mappers/EquipmentMapper';
import { EquipmentNotFoundException } from '../../domain/exceptions';

export class AdjustStockUseCase {
  constructor(private equipmentRepository: IEquipmentRepository) {}

  async execute(id: string, input: AdjustStockDTO): Promise<EquipmentResponseDTO> {
    const equipment = await this.equipmentRepository.findById(id);

    if (!equipment) {
      throw new EquipmentNotFoundException(id);
    }

    equipment.adjustStock(input.quantity, input.availableQuantity);

    await this.equipmentRepository.update(equipment);

    return EquipmentMapper.toResponseDTO(equipment);
  }
}
