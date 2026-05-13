import { EquipmentResponseDTO } from '../dtos/EquipmentDTO';
import { IEquipmentRepository } from '../../domain/repositories/IEquipmentRepository';
import { EquipmentMapper } from '../mappers/EquipmentMapper';
import { EquipmentNotFoundException } from '../../domain/exceptions';

export class GetEquipmentDetailUseCase {
  constructor(private equipmentRepository: IEquipmentRepository) {}

  async execute(id: string): Promise<EquipmentResponseDTO> {
    const equipment = await this.equipmentRepository.findById(id);

    if (!equipment) {
      throw new EquipmentNotFoundException(id);
    }

    return EquipmentMapper.toResponseDTO(equipment);
  }
}
