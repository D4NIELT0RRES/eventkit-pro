import { SupabaseClient } from '@supabase/supabase-js';
import { WorkOrder } from '../../../domain/entities/WorkOrder';
import { IWorkOrderRepository, WorkOrderFilters } from '../../../domain/repositories/IWorkOrderRepository';
import { PaginatedResult, PaginationParams, WorkOrderStatus } from '../../../shared/types/domain';
import { WorkOrderMapper } from '../../application/mappers/WorkOrderMapper';

export class SupabaseWorkOrderRepository implements IWorkOrderRepository {
  constructor(private supabase: SupabaseClient) {}

  async save(workOrder: WorkOrder): Promise<void> {
    const data = WorkOrderMapper.toPersistence(workOrder);

    const { error } = await this.supabase.from('work_orders').insert([data]);

    if (error) {
      throw new Error(`Failed to save work order: ${error.message}`);
    }
  }

  async update(workOrder: WorkOrder): Promise<void> {
    const data = WorkOrderMapper.toPersistence(workOrder);

    const { error } = await this.supabase
      .from('work_orders')
      .update(data)
      .eq('id', workOrder.id);

    if (error) {
      throw new Error(`Failed to update work order: ${error.message}`);
    }
  }

  async findById(id: string): Promise<WorkOrder | null> {
    const { data, error } = await this.supabase
      .from('work_orders')
      .select('*')
      .eq('id', id)
      .single();

    if (error?.code === 'PGRST116') return null;
    if (error) throw new Error(`Failed to find work order: ${error.message}`);

    return WorkOrderMapper.toDomain(data);
  }

  async list(
    filters: WorkOrderFilters = {},
    pagination: PaginationParams
  ): Promise<PaginatedResult<WorkOrder>> {
    let query = this.supabase.from('work_orders').select('*', { count: 'exact' });

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.clientId) {
      query = query.eq('client_id', filters.clientId);
    }

    if (filters.technicianId) {
      query = query.eq('technician_id', filters.technicianId);
    }

    if (filters.priority) {
      query = query.eq('priority', filters.priority);
    }

    if (filters.search) {
      query = query.ilike('title', `%${filters.search}%`);
    }

    query = query.eq('deleted_at', null);

    const start = (pagination.page - 1) * pagination.limit;
    query = query.range(start, start + pagination.limit - 1).order('created_at', { ascending: false });

    const { data, count, error } = await query;

    if (error) throw new Error(`Failed to list work orders: ${error.message}`);

    const totalPages = Math.ceil((count || 0) / pagination.limit);

    return {
      items: (data || []).map((item) => WorkOrderMapper.toDomain(item)),
      total: count || 0,
      page: pagination.page,
      totalPages,
      hasNextPage: pagination.page < totalPages,
      hasPreviousPage: pagination.page > 1,
    };
  }

  async search(query: string, limit: number = 10): Promise<WorkOrder[]> {
    const { data, error } = await this.supabase
      .from('work_orders')
      .select('*')
      .ilike('title', `%${query}%`)
      .eq('deleted_at', null)
      .limit(limit);

    if (error) throw new Error(`Failed to search work orders: ${error.message}`);

    return (data || []).map((item) => WorkOrderMapper.toDomain(item));
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('work_orders')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw new Error(`Failed to delete work order: ${error.message}`);
  }

  async findByClientId(
    clientId: string,
    pagination: PaginationParams
  ): Promise<PaginatedResult<WorkOrder>> {
    let query = this.supabase
      .from('work_orders')
      .select('*', { count: 'exact' })
      .eq('client_id', clientId)
      .eq('deleted_at', null);

    const start = (pagination.page - 1) * pagination.limit;
    query = query
      .range(start, start + pagination.limit - 1)
      .order('created_at', { ascending: false });

    const { data, count, error } = await query;

    if (error) throw new Error(`Failed to find work orders by client: ${error.message}`);

    const totalPages = Math.ceil((count || 0) / pagination.limit);

    return {
      items: (data || []).map((item) => WorkOrderMapper.toDomain(item)),
      total: count || 0,
      page: pagination.page,
      totalPages,
      hasNextPage: pagination.page < totalPages,
      hasPreviousPage: pagination.page > 1,
    };
  }

  async findByTechnicianId(
    technicianId: string,
    pagination: PaginationParams
  ): Promise<PaginatedResult<WorkOrder>> {
    let query = this.supabase
      .from('work_orders')
      .select('*', { count: 'exact' })
      .eq('technician_id', technicianId)
      .eq('deleted_at', null);

    const start = (pagination.page - 1) * pagination.limit;
    query = query
      .range(start, start + pagination.limit - 1)
      .order('created_at', { ascending: false });

    const { data, count, error } = await query;

    if (error) throw new Error(`Failed to find work orders by technician: ${error.message}`);

    const totalPages = Math.ceil((count || 0) / pagination.limit);

    return {
      items: (data || []).map((item) => WorkOrderMapper.toDomain(item)),
      total: count || 0,
      page: pagination.page,
      totalPages,
      hasNextPage: pagination.page < totalPages,
      hasPreviousPage: pagination.page > 1,
    };
  }

  async findByStatus(
    status: WorkOrderStatus,
    pagination: PaginationParams
  ): Promise<PaginatedResult<WorkOrder>> {
    let query = this.supabase
      .from('work_orders')
      .select('*', { count: 'exact' })
      .eq('status', status)
      .eq('deleted_at', null);

    const start = (pagination.page - 1) * pagination.limit;
    query = query
      .range(start, start + pagination.limit - 1)
      .order('created_at', { ascending: false });

    const { data, count, error } = await query;

    if (error) throw new Error(`Failed to find work orders by status: ${error.message}`);

    const totalPages = Math.ceil((count || 0) / pagination.limit);

    return {
      items: (data || []).map((item) => WorkOrderMapper.toDomain(item)),
      total: count || 0,
      page: pagination.page,
      totalPages,
      hasNextPage: pagination.page < totalPages,
      hasPreviousPage: pagination.page > 1,
    };
  }

  async findOverdueOrders(): Promise<WorkOrder[]> {
    const now = new Date().toISOString();

    const { data, error } = await this.supabase
      .from('work_orders')
      .select('*')
      .lt('due_date', now)
      .neq('status', 'concluida')
      .eq('deleted_at', null);

    if (error) throw new Error(`Failed to find overdue orders: ${error.message}`);

    return (data || []).map((item) => WorkOrderMapper.toDomain(item));
  }
}
