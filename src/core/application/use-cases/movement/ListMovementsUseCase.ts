import { MovementListResponseDTO, MovementResponseDTO } from '../dtos/MovementDTO';
import { IMovementRepository, MovementFilters } from '../../domain/repositories/IMovementRepository';
import { MovementMapper } from '../mappers/MovementMapper';
import { PaginationParams } from '../../shared/types/domain';

export class ListMovementsUseCase {
  constructor(private movementRepository: IMovementRepository) {}

  async execute(
    filters: MovementFilters = {},
    pagination: PaginationParams
  ): Promise<MovementListResponseDTO> {
    const result = await this.movementRepository.list(filters, pagination);

    return {
      items: result.items.map((movement) => MovementMapper.toResponseDTO(movement)),
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
      hasNextPage: result.hasNextPage,
      hasPreviousPage: result.hasPreviousPage,
    };
  }
}
