import { Equipment } from '../../domain/entities/Equipment';
import { EquipmentResponseDTO, CreateEquipmentDTO } from '../dtos/EquipmentDTO';

export class EquipmentMapper {
  static toResponseDTO(equipment: Equipment): EquipmentResponseDTO {
    return {
      id: equipment.id,
      name: equipment.name,
      patrimonyNo: equipment.patrimonyNo,
      brand: equipment.brand,
      model: equipment.model,
      description: equipment.description,
      quantity: equipment.quantity,
      availableQuantity: equipment.availableQuantity,
      usedQuantity: equipment.usedQuantity,
      status: equipment.status,
      categoryId: equipment.categoryId,
      location: equipment.location,
      notes: equipment.notes,
      createdAt: equipment.createdAt.toISOString(),
      updatedAt: equipment.updatedAt.toISOString(),
      isActive: equipment.isActive,
    };
  }

  static toPersistence(equipment: Equipment): Record<string, any> {
    return {
      id: equipment.id,
      name: equipment.name,
      patrimony_no: equipment.patrimonyNo,
      brand: equipment.brand,
      model: equipment.model,
      description: equipment.description,
      quantity: equipment.quantity,
      available_qty: equipment.availableQuantity,
      status: equipment.status,
      category_id: equipment.categoryId,
      location: equipment.location,
      notes: equipment.notes,
      created_at: equipment.createdAt.toISOString(),
      updated_at: equipment.updatedAt.toISOString(),
      deleted_at: equipment.deletedAt?.toISOString() || null,
    };
  }

  static toDomain(raw: Record<string, any>): Equipment {
    const equipment = new Equipment(
      {
        name: raw.name,
        patrimonyNo: raw.patrimony_no,
        brand: raw.brand,
        model: raw.model,
        description: raw.description,
        quantity: raw.quantity,
        availableQuantity: raw.available_qty,
        status: raw.status,
        categoryId: raw.category_id,
        location: raw.location,
        notes: raw.notes,
      },
      raw.id,
      new Date(raw.created_at)
    );

    // Restaurar estado deletado se necessário
    if (raw.deleted_at) {
      equipment['_deletedAt'] = new Date(raw.deleted_at);
    }

    return equipment;
  }

  static createDTOtoEntity(dto: CreateEquipmentDTO): Equipment {
    return new Equipment({
      name: dto.name,
      patrimonyNo: dto.patrimonyNo,
      brand: dto.brand,
      model: dto.model,
      description: dto.description,
      quantity: dto.quantity,
      availableQuantity: dto.quantity, // Inicialmente todo estoque está disponível
      status: 'ativo' as any,
      categoryId: dto.categoryId,
      location: dto.location,
      notes: dto.notes,
    });
  }
}
