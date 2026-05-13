import { EquipmentListResponseDTO } from '../dtos/EquipmentDTO';
import { IEquipmentRepository, EquipmentFilters } from '../../domain/repositories/IEquipmentRepository';
import { EquipmentMapper } from '../mappers/EquipmentMapper';
import { PaginationParams } from '../../shared/types/domain';

export class ListEquipmentsUseCase {
  constructor(private equipmentRepository: IEquipmentRepository) {}

  async execute(
    filters: EquipmentFilters = {},
    pagination: PaginationParams
  ): Promise<EquipmentListResponseDTO> {
    const result = await this.equipmentRepository.list(filters, pagination);

    return {
      items: result.items.map((equipment) => EquipmentMapper.toResponseDTO(equipment)),
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
      hasNextPage: result.hasNextPage,
      hasPreviousPage: result.hasPreviousPage,
    };
  }
}
