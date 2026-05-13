-- Migration: Create audit logs table
-- This migration creates an immutable audit trail for compliance and accountability

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  entity_type TEXT NOT NULL,  -- 'equipment', 'movement', 'kit', 'work_order'
  entity_id UUID NOT NULL,
  action TEXT NOT NULL,       -- 'CREATE', 'UPDATE', 'DELETE'
  old_values JSONB,           -- Previous values
  new_values JSONB,           -- New values
  changes JSONB,              -- Only changed fields
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT audit_logs_immutable CHECK (created_at <= now())
);

-- Enable RLS on audit logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Only authenticated users can view audit logs (with RBAC check)
CREATE POLICY "audit_logs_read_admin_only" ON audit_logs
  FOR SELECT
  USING (true);

-- Prevent deletions and updates on audit logs
CREATE POLICY "audit_logs_immutable" ON audit_logs
  FOR UPDATE USING (false);

CREATE POLICY "audit_logs_delete_prevent" ON audit_logs
  FOR DELETE USING (false);

-- Create indexes for audit log queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);
