import { IEquipmentRepository } from '../../domain/repositories/IEquipmentRepository';
import { EquipmentNotFoundException } from '../../domain/exceptions';

export class DeleteEquipmentUseCase {
  constructor(private equipmentRepository: IEquipmentRepository) {}

  async execute(id: string): Promise<void> {
    const equipment = await this.equipmentRepository.findById(id);

    if (!equipment) {
      throw new EquipmentNotFoundException(id);
    }

    equipment.soft_delete();

    await this.equipmentRepository.update(equipment);
  }
}
