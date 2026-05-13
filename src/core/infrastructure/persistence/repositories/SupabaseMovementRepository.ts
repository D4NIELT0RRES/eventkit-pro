import { SupabaseClient } from '@supabase/supabase-js';
import { EquipmentMovement } from '../../../domain/entities/EquipmentMovement';
import { IMovementRepository, MovementFilters } from '../../../domain/repositories/IMovementRepository';
import { PaginatedResult, PaginationParams } from '../../../shared/types/domain';
import { MovementMapper } from '../../application/mappers/MovementMapper';

export class SupabaseMovementRepository implements IMovementRepository {
  constructor(private supabase: SupabaseClient) {}

  async save(movement: EquipmentMovement): Promise<void> {
    const data = MovementMapper.toPersistence(movement);

    const { error } = await this.supabase.from('equipment_movements').insert([data]);

    if (error) {
      throw new Error(`Failed to save movement: ${error.message}`);
    }
  }

  async findById(id: string): Promise<EquipmentMovement | null> {
    const { data, error } = await this.supabase
      .from('equipment_movements')
      .select('*')
      .eq('id', id)
      .single();

    if (error?.code === 'PGRST116') return null;
    if (error) throw new Error(`Failed to find movement: ${error.message}`);

    return MovementMapper.toDomain(data);
  }

  async list(
    filters: MovementFilters = {},
    pagination: PaginationParams
  ): Promise<PaginatedResult<EquipmentMovement>> {
    let query = this.supabase.from('equipment_movements').select('*', { count: 'exact' });

    // Aplicar filtros
    if (filters.equipmentId) {
      query = query.eq('equipment_id', filters.equipmentId);
    }

    if (filters.userId) {
      query = query.eq('user_id', filters.userId);
    }

    if (filters.type) {
      query = query.eq('type', filters.type);
    }

    if (filters.workOrderId) {
      query = query.eq('work_order_id', filters.workOrderId);
    }

    if (filters.startDate && filters.endDate) {
      query = query
        .gte('created_at', filters.startDate.toISOString())
        .lte('created_at', filters.endDate.toISOString());
    }

    // Filtrar deletados
    query = query.eq('deleted_at', null);

    // Paginação
    const start = (pagination.page - 1) * pagination.limit;
    query = query
      .range(start, start + pagination.limit - 1)
      .order('created_at', { ascending: false });

    const { data, count, error } = await query;

    if (error) throw new Error(`Failed to list movements: ${error.message}`);

    const totalPages = Math.ceil((count || 0) / pagination.limit);

    return {
      items: (data || []).map((item) => MovementMapper.toDomain(item)),
      total: count || 0,
      page: pagination.page,
      totalPages,
      hasNextPage: pagination.page < totalPages,
      hasPreviousPage: pagination.page > 1,
    };
  }

  async findByEquipmentId(
    equipmentId: string,
    pagination: PaginationParams
  ): Promise<PaginatedResult<EquipmentMovement>> {
    let query = this.supabase
      .from('equipment_movements')
      .select('*', { count: 'exact' })
      .eq('equipment_id', equipmentId)
      .eq('deleted_at', null);

    const start = (pagination.page - 1) * pagination.limit;
    query = query
      .range(start, start + pagination.limit - 1)
      .order('created_at', { ascending: false });

    const { data, count, error } = await query;

    if (error) throw new Error(`Failed to find movements by equipment: ${error.message}`);

    const totalPages = Math.ceil((count || 0) / pagination.limit);

    return {
      items: (data || []).map((item) => MovementMapper.toDomain(item)),
      total: count || 0,
      page: pagination.page,
      totalPages,
      hasNextPage: pagination.page < totalPages,
      hasPreviousPage: pagination.page > 1,
    };
  }

  async findByWorkOrderId(
    workOrderId: string,
    pagination: PaginationParams
  ): Promise<PaginatedResult<EquipmentMovement>> {
    let query = this.supabase
      .from('equipment_movements')
      .select('*', { count: 'exact' })
      .eq('work_order_id', workOrderId)
      .eq('deleted_at', null);

    const start = (pagination.page - 1) * pagination.limit;
    query = query
      .range(start, start + pagination.limit - 1)
      .order('created_at', { ascending: false });

    const { data, count, error } = await query;

    if (error) throw new Error(`Failed to find movements by work order: ${error.message}`);

    const totalPages = Math.ceil((count || 0) / pagination.limit);

    return {
      items: (data || []).map((item) => MovementMapper.toDomain(item)),
      total: count || 0,
      page: pagination.page,
      totalPages,
      hasNextPage: pagination.page < totalPages,
      hasPreviousPage: pagination.page > 1,
    };
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('equipment_movements')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw new Error(`Failed to delete movement: ${error.message}`);
  }

  async findRecentMovements(limit: number): Promise<EquipmentMovement[]> {
    const { data, error } = await this.supabase
      .from('equipment_movements')
      .select('*')
      .eq('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw new Error(`Failed to find recent movements: ${error.message}`);

    return (data || []).map((item) => MovementMapper.toDomain(item));
  }

  async findMovementsByDateRange(
    startDate: Date,
    endDate: Date,
    pagination: PaginationParams
  ): Promise<PaginatedResult<EquipmentMovement>> {
    let query = this.supabase
      .from('equipment_movements')
      .select('*', { count: 'exact' })
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .eq('deleted_at', null);

    const start = (pagination.page - 1) * pagination.limit;
    query = query
      .range(start, start + pagination.limit - 1)
      .order('created_at', { ascending: false });

    const { data, count, error } = await query;

    if (error) throw new Error(`Failed to find movements by date range: ${error.message}`);

    const totalPages = Math.ceil((count || 0) / pagination.limit);

    return {
      items: (data || []).map((item) => MovementMapper.toDomain(item)),
      total: count || 0,
      page: pagination.page,
      totalPages,
      hasNextPage: pagination.page < totalPages,
      hasPreviousPage: pagination.page > 1,
    };
  }
}
