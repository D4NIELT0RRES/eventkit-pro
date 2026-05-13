import { RegisterMovementDTO, MovementResponseDTO, MovementListResponseDTO } from '../dtos/MovementDTO';
import { RegisterMovementUseCase } from '../use-cases/movement/RegisterMovementUseCase';
import { ListMovementsUseCase } from '../use-cases/movement/ListMovementsUseCase';
import { MovementFilters } from '../../domain/repositories/IMovementRepository';
import { PaginationParams } from '../../shared/types/domain';

export class MovementService {
  constructor(
    private registerMovementUseCase: RegisterMovementUseCase,
    private listMovementsUseCase: ListMovementsUseCase
  ) {}

  async registerMovement(input: RegisterMovementDTO, userId: string): Promise<MovementResponseDTO> {
    return this.registerMovementUseCase.execute(input, userId);
  }

  async listMovements(
    filters: MovementFilters = {},
    pagination: PaginationParams
  ): Promise<MovementListResponseDTO> {
    return this.listMovementsUseCase.execute(filters, pagination);
  }
}
