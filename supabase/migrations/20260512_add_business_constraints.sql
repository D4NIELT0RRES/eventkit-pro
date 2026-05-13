-- Migration: Add business rule constraints
-- This migration adds database-level constraints to enforce business rules

-- Equipment constraints
ALTER TABLE equipments
  ADD CONSTRAINT chk_equipment_quantity_positive CHECK (quantity > 0);

ALTER TABLE equipments
  ADD CONSTRAINT chk_equipment_available_positive CHECK (available_qty >= 0);

ALTER TABLE equipments
  ADD CONSTRAINT chk_equipment_available_not_exceeds CHECK (available_qty <= quantity);

-- Equipment Movement constraints
ALTER TABLE equipment_movements
  ADD CONSTRAINT chk_movement_quantity_positive CHECK (quantity > 0);

-- Kit Item constraints
ALTER TABLE kit_items
  ADD CONSTRAINT chk_kit_item_quantity_positive CHECK (quantity > 0);

-- Work Order Item constraints
ALTER TABLE work_order_items
  ADD CONSTRAINT chk_work_order_item_quantity_positive CHECK (quantity > 0);

-- Add uniqueness constraints
CREATE UNIQUE INDEX IF NOT EXISTS idx_equipment_patrimony_unique 
  ON equipments(patrimony_no) 
  WHERE deleted_at IS NULL AND patrimony_no IS NOT NULL;
