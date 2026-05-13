-- Migration: Improve RLS policies
-- This migration updates RLS policies for better security

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = $1 AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is estoquista or admin
CREATE OR REPLACE FUNCTION public.is_estoquista_or_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = $1 AND role IN ('estoquista', 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Equipment RLS Policies
ALTER TABLE equipments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Equipments read all authenticated" ON equipments;
DROP POLICY IF EXISTS "Equipments write estoquista admin" ON equipments;

CREATE POLICY "Equipments read all authenticated" ON equipments
  FOR SELECT
  USING (auth.role() = 'authenticated' AND deleted_at IS NULL);

CREATE POLICY "Equipments write estoquista admin" ON equipments
  FOR INSERT
  WITH CHECK (public.is_estoquista_or_admin(auth.uid()));

CREATE POLICY "Equipments update estoquista admin" ON equipments
  FOR UPDATE
  USING (public.is_estoquista_or_admin(auth.uid()))
  WITH CHECK (public.is_estoquista_or_admin(auth.uid()));

-- Equipment Movements RLS Policies
ALTER TABLE equipment_movements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Movements read all authenticated" ON equipment_movements;
DROP POLICY IF EXISTS "Movements write all authenticated" ON equipment_movements;

CREATE POLICY "Movements read all authenticated" ON equipment_movements
  FOR SELECT
  USING (auth.role() = 'authenticated' AND deleted_at IS NULL);

CREATE POLICY "Movements insert all authenticated" ON equipment_movements
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND user_id = auth.uid());

-- Kits RLS Policies
ALTER TABLE kits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Kits read all authenticated" ON kits;
DROP POLICY IF EXISTS "Kits write estoquista admin" ON kits;

CREATE POLICY "Kits read all authenticated" ON kits
  FOR SELECT
  USING (auth.role() = 'authenticated' AND deleted_at IS NULL);

CREATE POLICY "Kits write estoquista admin" ON kits
  FOR INSERT
  WITH CHECK (public.is_estoquista_or_admin(auth.uid()));

CREATE POLICY "Kits update estoquista admin" ON kits
  FOR UPDATE
  USING (public.is_estoquista_or_admin(auth.uid()))
  WITH CHECK (public.is_estoquista_or_admin(auth.uid()));

-- Work Orders RLS Policies
ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Work orders read all authenticated" ON work_orders;
DROP POLICY IF EXISTS "Work orders write gerente admin" ON work_orders;

CREATE POLICY "Work orders read all authenticated" ON work_orders
  FOR SELECT
  USING (auth.role() = 'authenticated' AND deleted_at IS NULL);

CREATE POLICY "Work orders write gerente admin" ON work_orders
  FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()) OR 
              EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'gerente'));

CREATE POLICY "Work orders update gerente admin" ON work_orders
  FOR UPDATE
  USING (public.is_admin(auth.uid()) OR 
         EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'gerente'))
  WITH CHECK (public.is_admin(auth.uid()) OR 
              EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'gerente'));
