import { CreateKitDTO, KitResponseDTO } from '../dtos/KitDTO';
import { IKitRepository } from '../../domain/repositories/IKitRepository';
import { IEquipmentRepository } from '../../domain/repositories/IEquipmentRepository';
import { KitMapper } from '../mappers/KitMapper';
import { ValidationException, EquipmentNotFoundException } from '../../domain/exceptions';

export class CreateKitUseCase {
  constructor(
    private kitRepository: IKitRepository,
    private equipmentRepository: IEquipmentRepository
  ) {}

  async execute(input: CreateKitDTO): Promise<KitResponseDTO> {
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
    const kit = KitMapper.createDTOtoEntity(input);

    // 4. Persistir
    await this.kitRepository.save(kit);

    // 5. Retornar DTO
    return KitMapper.toResponseDTO(kit);
  }

  private validateInput(input: CreateKitDTO): void {
    const errors: Record<string, string[]> = {};

    if (!input.name || input.name.trim() === '') {
      errors.name = ['Nome é obrigatório'];
    }

    if (!input.items || input.items.length === 0) {
      errors.items = ['Kit deve ter pelo menos um item'];
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
