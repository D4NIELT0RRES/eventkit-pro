-- Migration: Add soft delete support
-- This migration adds deleted_at columns to all main tables

ALTER TABLE equipments ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE equipment_movements ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE kits ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE kit_items ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE work_order_items ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Create indexes for soft deletes to improve query performance
CREATE INDEX IF NOT EXISTS idx_equipments_deleted ON equipments(deleted_at);
CREATE INDEX IF NOT EXISTS idx_movements_deleted ON equipment_movements(deleted_at);
CREATE INDEX IF NOT EXISTS idx_kits_deleted ON kits(deleted_at);
CREATE INDEX IF NOT EXISTS idx_work_orders_deleted ON work_orders(deleted_at);
