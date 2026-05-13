import { RegisterMovementDTO, MovementResponseDTO } from '../dtos/MovementDTO';
import { IMovementRepository } from '../../domain/repositories/IMovementRepository';
import { IEquipmentRepository } from '../../domain/repositories/IEquipmentRepository';
import { StockValidationDomainService } from '../../domain/services/StockValidationDomainService';
import { MovementMapper } from '../mappers/MovementMapper';
import { ValidationException } from '../../domain/exceptions';

export class RegisterMovementUseCase {
  constructor(
    private movementRepository: IMovementRepository,
    private equipmentRepository: IEquipmentRepository,
    private stockValidationService: StockValidationDomainService
  ) {}

  async execute(input: RegisterMovementDTO, userId: string): Promise<MovementResponseDTO> {
    // 1. Validar entrada
    this.validateInput(input);

    // 2. Validar regras de negócio de estoque
    await this.stockValidationService.validateMovement(
      input.equipmentId,
      input.quantity,
      input.type
    );

    // 3. Buscar equipamento
    const equipment = await this.equipmentRepository.findById(input.equipmentId);

    // 4. Executar movimento no equipamento
    if (input.type === 'saida') {
      equipment!.removeFromStock(input.quantity);
    } else if (input.type === 'retorno') {
      equipment!.restoreToStock(input.quantity);
    } else if (input.type === 'entrada') {
      equipment!.register(input.quantity);
    }

    // 5. Criar e persistir movimento
    const movement = MovementMapper.registerDTOtoEntity(input, userId);
    await this.movementRepository.save(movement);

    // 6. Persistir equipamento atualizado
    await this.equipmentRepository.update(equipment!);

    // 7. Retornar DTO
    return MovementMapper.toResponseDTO(movement);
  }

  private validateInput(input: RegisterMovementDTO): void {
    const errors: Record<string, string[]> = {};

    if (!input.equipmentId) {
      errors.equipmentId = ['ID do equipamento é obrigatório'];
    }

    if (!input.quantity || input.quantity <= 0) {
      errors.quantity = ['Quantidade deve ser maior que zero'];
    }

    if (!input.type) {
      errors.type = ['Tipo de movimento é obrigatório'];
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationException(errors);
    }
  }
}
