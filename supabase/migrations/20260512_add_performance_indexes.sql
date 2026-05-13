-- Migration: Add performance indexes
-- This migration adds strategic indexes to improve query performance

-- Equipment indexes
CREATE INDEX IF NOT EXISTS idx_equipments_category_status 
  ON equipments(category_id, status) 
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_equipments_status 
  ON equipments(status) 
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_equipments_created_at
  ON equipments(created_at DESC)
  WHERE deleted_at IS NULL;

-- Equipment search with full-text search capability (if text search installed)
CREATE INDEX IF NOT EXISTS idx_equipments_name_search 
  ON equipments USING gin(to_tsvector('portuguese', name || ' ' || COALESCE(brand, '') || ' ' || COALESCE(model, '')))
  WHERE deleted_at IS NULL;

-- Equipment Movement indexes
CREATE INDEX IF NOT EXISTS idx_movements_equipment_date 
  ON equipment_movements(equipment_id, created_at DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_movements_user_date 
  ON equipment_movements(user_id, created_at DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_movements_type 
  ON equipment_movements(type)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_movements_work_order 
  ON equipment_movements(work_order_id)
  WHERE deleted_at IS NULL AND work_order_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_movements_created
  ON equipment_movements(created_at DESC)
  WHERE deleted_at IS NULL;

-- Work Orders indexes
CREATE INDEX IF NOT EXISTS idx_work_orders_status_date 
  ON work_orders(status, created_at DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_work_orders_client 
  ON work_orders(client_id)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_work_orders_technician 
  ON work_orders(technician_id)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_work_orders_due_date
  ON work_orders(due_date)
  WHERE deleted_at IS NULL AND due_date IS NOT NULL;

-- Kits indexes
CREATE INDEX IF NOT EXISTS idx_kits_status 
  ON kits(status)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_kits_created
  ON kits(created_at DESC)
  WHERE deleted_at IS NULL;
