-- ============ WORK ORDER ITEMS TRACKING ============
ALTER TABLE public.work_order_items ADD COLUMN IF NOT EXISTS checked_out BOOLEAN DEFAULT FALSE;
ALTER TABLE public.work_order_items ADD COLUMN IF NOT EXISTS checked_in BOOLEAN DEFAULT FALSE;
ALTER TABLE public.work_order_items ADD COLUMN IF NOT EXISTS signed_out_at TIMESTAMPTZ;
ALTER TABLE public.work_order_items ADD COLUMN IF NOT EXISTS signed_in_at TIMESTAMPTZ;
ALTER TABLE public.work_order_items ADD COLUMN IF NOT EXISTS signature_out TEXT;
ALTER TABLE public.work_order_items ADD COLUMN IF NOT EXISTS signature_in TEXT;
ALTER TABLE public.work_order_items ADD COLUMN IF NOT EXISTS notes TEXT;

-- ============ STOCK TRACKING TABLE ============
CREATE TABLE IF NOT EXISTS public.stock_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id UUID NOT NULL REFERENCES public.equipments(id) ON DELETE CASCADE,
  total_stock INT NOT NULL DEFAULT 0,
  available_stock INT NOT NULL DEFAULT 0,
  reserved_stock INT NOT NULL DEFAULT 0,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(equipment_id)
);
ALTER TABLE public.stock_levels ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_stock_equipment ON public.stock_levels(equipment_id);

-- ============ UPDATE STOCK WHEN OS STATUS CHANGES ============
CREATE OR REPLACE FUNCTION public.update_stock_on_wo_status()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_item RECORD;
  v_reserved INT;
BEGIN
  -- When WO status changes to 'em_andamento' (checkout), reserve items
  IF NEW.status = 'em_andamento' AND OLD.status != 'em_andamento' THEN
    FOR v_item IN
      SELECT woi.equipment_id, woi.quantity
      FROM public.work_order_items woi
      WHERE woi.work_order_id = NEW.id AND woi.checked_out = true
    LOOP
      UPDATE public.stock_levels
      SET 
        available_stock = available_stock - v_item.quantity,
        reserved_stock = reserved_stock + v_item.quantity,
        last_updated = now()
      WHERE equipment_id = v_item.equipment_id;
    END LOOP;
  END IF;

  -- When WO status changes to 'finalizada' (check-in), return items
  IF NEW.status = 'finalizada' AND OLD.status != 'finalizada' THEN
    FOR v_item IN
      SELECT woi.equipment_id, woi.quantity
      FROM public.work_order_items woi
      WHERE woi.work_order_id = NEW.id AND woi.checked_in = true
    LOOP
      UPDATE public.stock_levels
      SET 
        available_stock = available_stock + v_item.quantity,
        reserved_stock = reserved_stock - v_item.quantity,
        last_updated = now()
      WHERE equipment_id = v_item.equipment_id;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_wo_status_stock ON public.work_orders;
CREATE TRIGGER trg_wo_status_stock AFTER UPDATE ON public.work_orders
  FOR EACH ROW EXECUTE FUNCTION public.update_stock_on_wo_status();

-- ============ INITIALIZE STOCK FROM CURRENT EQUIPMENTS ============
INSERT INTO public.stock_levels (equipment_id, total_stock, available_stock)
SELECT id, COALESCE(quantity, 0), COALESCE(available_qty, 0)
FROM public.equipments
ON CONFLICT (equipment_id) DO UPDATE SET
  total_stock = EXCLUDED.total_stock,
  available_stock = EXCLUDED.available_stock;

-- ============ WORK ORDER AUDIT TRAIL ============
CREATE TABLE IF NOT EXISTS public.wo_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_id UUID NOT NULL REFERENCES public.work_orders(id) ON DELETE CASCADE,
  work_order_item_id UUID REFERENCES public.work_order_items(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- 'item_added', 'item_removed', 'quantity_changed', 'checked_out', 'checked_in', 'signed_out', 'signed_in', 'status_changed'
  old_value JSONB,
  new_value JSONB,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.wo_audit_log ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_wo_audit_log_work_order ON public.wo_audit_log(work_order_id);

-- ============ EQUIPMENT SIGNATURES ============
CREATE TABLE IF NOT EXISTS public.digital_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_item_id UUID NOT NULL REFERENCES public.work_order_items(id) ON DELETE CASCADE,
  signature_type TEXT NOT NULL, -- 'checked_out' or 'checked_in'
  signature_data TEXT NOT NULL, -- base64 encoded image
  signed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  signed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  device_info JSONB -- {ip, userAgent, timestamp}
);
ALTER TABLE public.digital_signatures ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_signatures_work_order_item ON public.digital_signatures(work_order_item_id);
