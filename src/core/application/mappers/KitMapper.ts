import { Kit } from '../../domain/entities/Kit';
import { KitResponseDTO, CreateKitDTO } from '../dtos/KitDTO';

export class KitMapper {
  static toResponseDTO(kit: Kit): KitResponseDTO {
    return {
      id: kit.id,
      name: kit.name,
      description: kit.description,
      items: Array.from(kit.items),
      itemCount: kit.itemCount,
      status: kit.status,
      location: kit.location,
      notes: kit.notes,
      createdAt: kit.createdAt.toISOString(),
      updatedAt: kit.updatedAt.toISOString(),
      isActive: kit.isActive,
    };
  }

  static toPersistence(kit: Kit): Record<string, any> {
    return {
      id: kit.id,
      name: kit.name,
      description: kit.description,
      items: Array.from(kit.items),
      status: kit.status,
      location: kit.location,
      notes: kit.notes,
      created_at: kit.createdAt.toISOString(),
      updated_at: kit.updatedAt.toISOString(),
      deleted_at: kit.deletedAt?.toISOString() || null,
    };
  }

  static toDomain(raw: Record<string, any>): Kit {
    const kit = new Kit(
      {
        name: raw.name,
        description: raw.description,
        items: raw.items || [],
        status: raw.status,
        location: raw.location,
        notes: raw.notes,
      },
      raw.id,
      new Date(raw.created_at)
    );

    if (raw.deleted_at) {
      kit['_deletedAt'] = new Date(raw.deleted_at);
    }

    return kit;
  }

  static createDTOtoEntity(dto: CreateKitDTO): Kit {
    return new Kit({
      name: dto.name,
      description: dto.description,
      items: dto.items,
      status: 'ativo' as any,
      location: dto.location,
      notes: dto.notes,
    });
  }
}
