import { EquipmentMovement } from '../../domain/entities/EquipmentMovement';
import { MovementResponseDTO, RegisterMovementDTO } from '../dtos/MovementDTO';

export class MovementMapper {
  static toResponseDTO(movement: EquipmentMovement): MovementResponseDTO {
    return {
      id: movement.id,
      equipmentId: movement.equipmentId,
      quantity: movement.quantity,
      type: movement.type,
      userId: movement.userId,
      workOrderId: movement.workOrderId,
      notes: movement.notes,
      reference: movement.reference,
      createdAt: movement.createdAt.toISOString(),
    };
  }

  static toPersistence(movement: EquipmentMovement): Record<string, any> {
    return {
      id: movement.id,
      equipment_id: movement.equipmentId,
      quantity: movement.quantity,
      type: movement.type,
      user_id: movement.userId,
      work_order_id: movement.workOrderId,
      notes: movement.notes,
      reference: movement.reference,
      created_at: movement.createdAt.toISOString(),
      updated_at: movement.updatedAt.toISOString(),
      deleted_at: movement.deletedAt?.toISOString() || null,
    };
  }

  static toDomain(raw: Record<string, any>): EquipmentMovement {
    const movement = new EquipmentMovement(
      {
        equipmentId: raw.equipment_id,
        quantity: raw.quantity,
        type: raw.type,
        userId: raw.user_id,
        workOrderId: raw.work_order_id,
        notes: raw.notes,
        reference: raw.reference,
      },
      raw.id,
      new Date(raw.created_at)
    );

    if (raw.deleted_at) {
      movement['_deletedAt'] = new Date(raw.deleted_at);
    }

    return movement;
  }

  static registerDTOtoEntity(dto: RegisterMovementDTO, userId: string): EquipmentMovement {
    return new EquipmentMovement({
      equipmentId: dto.equipmentId,
      quantity: dto.quantity,
      type: dto.type,
      userId,
      workOrderId: dto.workOrderId,
      notes: dto.notes,
      reference: dto.reference,
    });
  }
}
