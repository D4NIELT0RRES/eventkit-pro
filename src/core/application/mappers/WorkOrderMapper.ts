import { WorkOrder } from '../../domain/entities/WorkOrder';
import { WorkOrderResponseDTO, CreateWorkOrderDTO } from '../dtos/WorkOrderDTO';

export class WorkOrderMapper {
  static toResponseDTO(workOrder: WorkOrder): WorkOrderResponseDTO {
    return {
      id: workOrder.id,
      title: workOrder.title,
      description: workOrder.description,
      clientId: workOrder.clientId,
      technicianId: workOrder.technicianId,
      items: Array.from(workOrder.items),
      itemCount: workOrder.itemCount,
      status: workOrder.status,
      priority: workOrder.priority,
      dueDate: workOrder.dueDate?.toISOString(),
      notes: workOrder.notes,
      isOverdue: workOrder.isOverdue,
      createdAt: workOrder.createdAt.toISOString(),
      updatedAt: workOrder.updatedAt.toISOString(),
    };
  }

  static toPersistence(workOrder: WorkOrder): Record<string, any> {
    return {
      id: workOrder.id,
      title: workOrder.title,
      description: workOrder.description,
      client_id: workOrder.clientId,
      technician_id: workOrder.technicianId,
      items: Array.from(workOrder.items),
      status: workOrder.status,
      priority: workOrder.priority,
      due_date: workOrder.dueDate?.toISOString(),
      notes: workOrder.notes,
      created_at: workOrder.createdAt.toISOString(),
      updated_at: workOrder.updatedAt.toISOString(),
      deleted_at: workOrder.deletedAt?.toISOString() || null,
    };
  }

  static toDomain(raw: Record<string, any>): WorkOrder {
    const workOrder = new WorkOrder(
      {
        title: raw.title,
        description: raw.description,
        clientId: raw.client_id,
        technicianId: raw.technician_id,
        items: raw.items || [],
        status: raw.status,
        priority: raw.priority,
        dueDate: raw.due_date ? new Date(raw.due_date) : undefined,
        notes: raw.notes,
      },
      raw.id,
      new Date(raw.created_at)
    );

    if (raw.deleted_at) {
      workOrder['_deletedAt'] = new Date(raw.deleted_at);
    }

    return workOrder;
  }

  static createDTOtoEntity(dto: CreateWorkOrderDTO): WorkOrder {
    return new WorkOrder({
      title: dto.title,
      description: dto.description,
      clientId: dto.clientId,
      technicianId: dto.technicianId,
      items: dto.items,
      status: 'aberta' as any,
      priority: dto.priority,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      notes: dto.notes,
    });
  }
}
