import { CreateEquipmentDTO, AdjustStockDTO, EquipmentResponseDTO, EquipmentListResponseDTO } from '../dtos/EquipmentDTO';
import { CreateEquipmentUseCase } from '../use-cases/equipment/CreateEquipmentUseCase';
import { ListEquipmentsUseCase } from '../use-cases/equipment/ListEquipmentsUseCase';
import { GetEquipmentDetailUseCase } from '../use-cases/equipment/GetEquipmentDetailUseCase';
import { AdjustStockUseCase } from '../use-cases/equipment/AdjustStockUseCase';
import { EquipmentFilters } from '../../domain/repositories/IEquipmentRepository';
import { PaginationParams } from '../../shared/types/domain';

export class EquipmentService {
  constructor(
    private createEquipmentUseCase: CreateEquipmentUseCase,
    private listEquipmentsUseCase: ListEquipmentsUseCase,
    private getEquipmentDetailUseCase: GetEquipmentDetailUseCase,
    private adjustStockUseCase: AdjustStockUseCase
  ) {}

  async create(input: CreateEquipmentDTO): Promise<EquipmentResponseDTO> {
    return this.createEquipmentUseCase.execute(input);
  }

  async list(
    filters: EquipmentFilters = {},
    pagination: PaginationParams
  ): Promise<EquipmentListResponseDTO> {
    return this.listEquipmentsUseCase.execute(filters, pagination);
  }

  async getDetail(id: string): Promise<EquipmentResponseDTO> {
    return this.getEquipmentDetailUseCase.execute(id);
  }

  async adjustStock(id: string, input: AdjustStockDTO): Promise<EquipmentResponseDTO> {
    return this.adjustStockUseCase.execute(id, input);
  }
}
