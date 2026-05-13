import { CreateEquipmentDTO, EquipmentResponseDTO } from '../dtos/EquipmentDTO';
import { IEquipmentRepository } from '../../domain/repositories/IEquipmentRepository';
import { EquipmentMapper } from '../mappers/EquipmentMapper';
import { ValidationException } from '../../domain/exceptions';

export class CreateEquipmentUseCase {
  constructor(private equipmentRepository: IEquipmentRepository) {}

  async execute(input: CreateEquipmentDTO): Promise<EquipmentResponseDTO> {
    // 1. Validar entrada
    this.validateInput(input);

    // 2. Validar patrimônio único (se fornecido)
    if (input.patrimonyNo) {
      const existing = await this.equipmentRepository.findByPatrimony(input.patrimonyNo);
      if (existing) {
        throw new ValidationException({
          patrimonyNo: ['Patrimônio já existe no sistema'],
        });
      }
    }

    // 3. Criar entity
    const equipment = EquipmentMapper.createDTOtoEntity(input);

    // 4. Persistir
    await this.equipmentRepository.save(equipment);

    // 5. Retornar DTO
    return EquipmentMapper.toResponseDTO(equipment);
  }

  private validateInput(input: CreateEquipmentDTO): void {
    const errors: Record<string, string[]> = {};

    if (!input.name || input.name.trim() === '') {
      errors.name = ['Nome é obrigatório'];
    }

    if (!input.quantity || input.quantity <= 0) {
      errors.quantity = ['Quantidade deve ser maior que zero'];
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationException(errors);
    }
  }
}
