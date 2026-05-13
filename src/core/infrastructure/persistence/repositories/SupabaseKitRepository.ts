import { SupabaseClient } from '@supabase/supabase-js';
import { Kit } from '../../../domain/entities/Kit';
import { IKitRepository, KitFilters } from '../../../domain/repositories/IKitRepository';
import { PaginatedResult, PaginationParams } from '../../../shared/types/domain';
import { KitMapper } from '../../application/mappers/KitMapper';

export class SupabaseKitRepository implements IKitRepository {
  constructor(private supabase: SupabaseClient) {}

  async save(kit: Kit): Promise<void> {
    const data = KitMapper.toPersistence(kit);

    const { error } = await this.supabase.from('kits').insert([data]);

    if (error) {
      throw new Error(`Failed to save kit: ${error.message}`);
    }
  }

  async update(kit: Kit): Promise<void> {
    const data = KitMapper.toPersistence(kit);

    const { error } = await this.supabase.from('kits').update(data).eq('id', kit.id);

    if (error) {
      throw new Error(`Failed to update kit: ${error.message}`);
    }
  }

  async findById(id: string): Promise<Kit | null> {
    const { data, error } = await this.supabase.from('kits').select('*').eq('id', id).single();

    if (error?.code === 'PGRST116') return null;
    if (error) throw new Error(`Failed to find kit: ${error.message}`);

    return KitMapper.toDomain(data);
  }

  async list(
    filters: KitFilters = {},
    pagination: PaginationParams
  ): Promise<PaginatedResult<Kit>> {
    let query = this.supabase.from('kits').select('*', { count: 'exact' });

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.search) {
      query = query.ilike('name', `%${filters.search}%`);
    }

    query = query.eq('deleted_at', null);

    const start = (pagination.page - 1) * pagination.limit;
    query = query.range(start, start + pagination.limit - 1).order('name');

    const { data, count, error } = await query;

    if (error) throw new Error(`Failed to list kits: ${error.message}`);

    const totalPages = Math.ceil((count || 0) / pagination.limit);

    return {
      items: (data || []).map((item) => KitMapper.toDomain(item)),
      total: count || 0,
      page: pagination.page,
      totalPages,
      hasNextPage: pagination.page < totalPages,
      hasPreviousPage: pagination.page > 1,
    };
  }

  async search(query: string, limit: number = 10): Promise<Kit[]> {
    const { data, error } = await this.supabase
      .from('kits')
      .select('*')
      .ilike('name', `%${query}%`)
      .eq('deleted_at', null)
      .limit(limit);

    if (error) throw new Error(`Failed to search kits: ${error.message}`);

    return (data || []).map((item) => KitMapper.toDomain(item));
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('kits')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw new Error(`Failed to delete kit: ${error.message}`);
  }

  async findByEquipmentId(equipmentId: string): Promise<Kit[]> {
    const { data, error } = await this.supabase
      .from('kits')
      .select('*')
      .contains('items', [{ equipmentId }])
      .eq('deleted_at', null);

    if (error) throw new Error(`Failed to find kits by equipment: ${error.message}`);

    return (data || []).map((item) => KitMapper.toDomain(item));
  }

  async findActive(): Promise<Kit[]> {
    const { data, error } = await this.supabase
      .from('kits')
      .select('*')
      .eq('status', 'ativo')
      .eq('deleted_at', null);

    if (error) throw new Error(`Failed to find active kits: ${error.message}`);

    return (data || []).map((item) => KitMapper.toDomain(item));
  }
}
