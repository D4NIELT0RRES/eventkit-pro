import { KitListResponseDTO } from '../dtos/KitDTO';
import { IKitRepository, KitFilters } from '../../domain/repositories/IKitRepository';
import { KitMapper } from '../mappers/KitMapper';
import { PaginationParams } from '../../shared/types/domain';

export class ListKitsUseCase {
  constructor(private kitRepository: IKitRepository) {}

  async execute(
    filters: KitFilters = {},
    pagination: PaginationParams
  ): Promise<KitListResponseDTO> {
    const result = await this.kitRepository.list(filters, pagination);

    return {
      items: result.items.map((kit) => KitMapper.toResponseDTO(kit)),
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
      hasNextPage: result.hasNextPage,
      hasPreviousPage: result.hasPreviousPage,
    };
  }
}
