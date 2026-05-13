import { UpdateEquipmentDTO, EquipmentResponseDTO } from '../dtos/EquipmentDTO';
import { IEquipmentRepository } from '../../domain/repositories/IEquipmentRepository';
import { EquipmentMapper } from '../mappers/EquipmentMapper';
import { EquipmentNotFoundException } from '../../domain/exceptions';

export class UpdateEquipmentUseCase {
  constructor(private equipmentRepository: IEquipmentRepository) {}

  async execute(id: string, input: UpdateEquipmentDTO): Promise<EquipmentResponseDTO> {
    const equipment = await this.equipmentRepository.findById(id);

    if (!equipment) {
      throw new EquipmentNotFoundException(id);
    }

    equipment.updateInfo(input);

    if (input.status) {
      equipment.changeStatus(input.status);
    }

    await this.equipmentRepository.update(equipment);

    return EquipmentMapper.toResponseDTO(equipment);
  }
}
