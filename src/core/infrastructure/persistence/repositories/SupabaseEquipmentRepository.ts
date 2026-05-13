import { SupabaseClient } from '@supabase/supabase-js';
import { Equipment } from '../../../domain/entities/Equipment';
import { IEquipmentRepository, EquipmentFilters } from '../../../domain/repositories/IEquipmentRepository';
import { PaginatedResult, PaginationParams } from '../../../shared/types/domain';
import { EquipmentMapper } from '../../mappers/EquipmentMapper';

export class SupabaseEquipmentRepository implements IEquipmentRepository {
  constructor(private supabase: SupabaseClient) {}

  async save(equipment: Equipment): Promise<void> {
    const data = EquipmentMapper.toPersistence(equipment);

    const { error } = await this.supabase.from('equipments').insert([data]);

    if (error) {
      throw new Error(`Failed to save equipment: ${error.message}`);
    }
  }

  async update(equipment: Equipment): Promise<void> {
    const data = EquipmentMapper.toPersistence(equipment);

    const { error } = await this.supabase
      .from('equipments')
      .update(data)
      .eq('id', equipment.id);

    if (error) {
      throw new Error(`Failed to update equipment: ${error.message}`);
    }
  }

  async findById(id: string): Promise<Equipment | null> {
    const { data, error } = await this.supabase
      .from('equipments')
      .select('*')
      .eq('id', id)
      .single();

    if (error?.code === 'PGRST116') return null; // Not found
    if (error) throw new Error(`Failed to find equipment: ${error.message}`);

    return EquipmentMapper.toDomain(data);
  }

  async findByPatrimony(patrimony: string): Promise<Equipment | null> {
    const { data, error } = await this.supabase
      .from('equipments')
      .select('*')
      .eq('patrimony_no', patrimony)
      .eq('deleted_at', null)
      .single();

    if (error?.code === 'PGRST116') return null;
    if (error) throw new Error(`Failed to find equipment by patrimony: ${error.message}`);

    return EquipmentMapper.toDomain(data);
  }

  async list(
    filters: EquipmentFilters = {},
    pagination: PaginationParams
  ): Promise<PaginatedResult<Equipment>> {
    let query = this.supabase.from('equipments').select('*', { count: 'exact' });

    // Aplicar filtros
    if (filters.categoryId) {
      query = query.eq('category_id', filters.categoryId);
    }

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.search) {
      query = query.ilike('name', `%${filters.search}%`);
    }

    // Filtrar deletados
    query = query.eq('deleted_at', null);

    // Paginação
    const start = (pagination.page - 1) * pagination.limit;
    query = query.range(start, start + pagination.limit - 1).order('name');

    const { data, count, error } = await query;

    if (error) throw new Error(`Failed to list equipments: ${error.message}`);

    const totalPages = Math.ceil((count || 0) / pagination.limit);

    return {
      items: (data || []).map((item) => EquipmentMapper.toDomain(item)),
      total: count || 0,
      page: pagination.page,
      totalPages,
      hasNextPage: pagination.page < totalPages,
      hasPreviousPage: pagination.page > 1,
    };
  }

  async search(query: string, limit: number = 10): Promise<Equipment[]> {
    const { data, error } = await this.supabase
      .from('equipments')
      .select('*')
      .or(`name.ilike.%${query}%,patrimony_no.ilike.%${query}%`)
      .eq('deleted_at', null)
      .limit(limit);

    if (error) throw new Error(`Failed to search equipments: ${error.message}`);

    return (data || []).map((item) => EquipmentMapper.toDomain(item));
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('equipments')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw new Error(`Failed to delete equipment: ${error.message}`);
  }

  async countByCategory(categoryId: string): Promise<number> {
    const { count, error } = await this.supabase
      .from('equipments')
      .select('id', { count: 'exact' })
      .eq('category_id', categoryId)
      .eq('deleted_at', null);

    if (error) throw new Error(`Failed to count equipments: ${error.message}`);

    return count || 0;
  }

  async findLowStockItems(threshold: number): Promise<Equipment[]> {
    const { data, error } = await this.supabase
      .from('equipments')
      .select('*')
      .lt('available_qty', threshold)
      .eq('deleted_at', null);

    if (error) throw new Error(`Failed to find low stock items: ${error.message}`);

    return (data || []).map((item) => EquipmentMapper.toDomain(item));
  }

  async findByCategoryId(
    categoryId: string,
    pagination: PaginationParams
  ): Promise<PaginatedResult<Equipment>> {
    let query = this.supabase
      .from('equipments')
      .select('*', { count: 'exact' })
      .eq('category_id', categoryId)
      .eq('deleted_at', null);

    const start = (pagination.page - 1) * pagination.limit;
    query = query.range(start, start + pagination.limit - 1).order('name');

    const { data, count, error } = await query;

    if (error) throw new Error(`Failed to find equipment by category: ${error.message}`);

    const totalPages = Math.ceil((count || 0) / pagination.limit);

    return {
      items: (data || []).map((item) => EquipmentMapper.toDomain(item)),
      total: count || 0,
      page: pagination.page,
      totalPages,
      hasNextPage: pagination.page < totalPages,
      hasPreviousPage: pagination.page > 1,
    };
  }
}
