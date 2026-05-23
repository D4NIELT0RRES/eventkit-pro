-- ============================================================
-- AUTOMAÇÃO: condição no retorno + abertura automática de OS de manutenção
-- ============================================================

-- Condição em que o equipamento voltou do evento
DO $$ BEGIN
  CREATE TYPE public.return_condition AS ENUM ('ok','precisa_reparo','danificado','extraviado');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.work_order_items
  ADD COLUMN IF NOT EXISTS return_condition public.return_condition,
  ADD COLUMN IF NOT EXISTS return_notes TEXT;

CREATE INDEX IF NOT EXISTS idx_woi_return_condition
  ON public.work_order_items(return_condition)
  WHERE return_condition IS NOT NULL;

-- ============================================================
-- TRIGGER: ao registrar condição de retorno diferente de OK,
-- abre automaticamente um chamado de manutenção e ajusta status
-- do equipamento. Mantém o estoque coerente.
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_return_condition()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_user UUID;
  v_eq_status equipment_status;
BEGIN
  IF NEW.return_condition IS NULL THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE'
     AND OLD.return_condition IS NOT DISTINCT FROM NEW.return_condition THEN
    RETURN NEW;
  END IF;

  IF NEW.return_condition = 'ok' THEN
    RETURN NEW;
  END IF;

  v_user := auth.uid();
  v_eq_status := CASE NEW.return_condition
    WHEN 'precisa_reparo' THEN 'manutencao'::equipment_status
    WHEN 'danificado'    THEN 'danificado'::equipment_status
    WHEN 'extraviado'    THEN 'extraviado'::equipment_status
    ELSE 'disponivel'::equipment_status
  END;

  -- Abre um registro de manutenção (somente para reparo/danificado)
  IF NEW.return_condition IN ('precisa_reparo','danificado') THEN
    INSERT INTO public.maintenance (equipment_id, technician_id, status, report)
    VALUES (
      NEW.equipment_id,
      v_user,
      'aberta',
      COALESCE(
        'Retorno do evento — ' || NEW.return_condition::text
        || CASE WHEN NEW.return_notes IS NOT NULL
                THEN E'\nObs: ' || NEW.return_notes
                ELSE '' END,
        'Retorno do evento com necessidade de reparo'
      )
    );
  END IF;

  -- Atualiza o status do equipamento conforme a condição
  UPDATE public.equipments
  SET status = v_eq_status,
      updated_at = now()
  WHERE id = NEW.equipment_id;

  -- Para itens com problema, removemos do estoque livre
  IF NEW.return_condition IN ('precisa_reparo','danificado','extraviado') THEN
    UPDATE public.stock_levels
    SET available_stock = GREATEST(available_stock - NEW.quantity, 0),
        last_updated = now()
    WHERE equipment_id = NEW.equipment_id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_woi_return_condition ON public.work_order_items;
CREATE TRIGGER trg_woi_return_condition
  AFTER INSERT OR UPDATE OF return_condition ON public.work_order_items
  FOR EACH ROW EXECUTE FUNCTION public.handle_return_condition();

-- ============================================================
-- TRIGGER: quando manutenção é concluída, devolve o equipamento
-- ao estoque disponível e marca como 'disponivel'
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_maintenance_closed()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status = 'concluida' AND OLD.status <> 'concluida' THEN
    UPDATE public.equipments
    SET status = 'disponivel'::equipment_status,
        updated_at = now()
    WHERE id = NEW.equipment_id;

    UPDATE public.stock_levels
    SET available_stock = available_stock + 1,
        last_updated = now()
    WHERE equipment_id = NEW.equipment_id;

    NEW.closed_at := COALESCE(NEW.closed_at, now());
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_maintenance_closed ON public.maintenance;
CREATE TRIGGER trg_maintenance_closed
  BEFORE UPDATE OF status ON public.maintenance
  FOR EACH ROW EXECUTE FUNCTION public.handle_maintenance_closed();
