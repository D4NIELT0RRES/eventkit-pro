
-- ============ ENUMS ============
CREATE TYPE public.app_role AS ENUM ('admin','tecnico','operador','estoquista');
CREATE TYPE public.equipment_status AS ENUM ('disponivel','em_uso','manutencao','reservado','extraviado','danificado');
CREATE TYPE public.movement_type AS ENUM ('saida','retorno','transferencia');
CREATE TYPE public.kit_status AS ENUM ('rascunho','reservado','em_uso','finalizado','cancelado');
CREATE TYPE public.wo_priority AS ENUM ('baixa','media','alta','urgente');
CREATE TYPE public.wo_status AS ENUM ('aberta','em_andamento','aguardando','finalizada','cancelada');
CREATE TYPE public.maintenance_status AS ENUM ('aberta','em_andamento','concluida','cancelada');
CREATE TYPE public.schedule_type AS ENUM ('preparacao','carregamento','evento','desmontagem','retorno');

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============ USER ROLES ============
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT public.has_role(_user_id,'admin'); $$;

-- ============ Auto-create profile + default role on signup ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  user_count INT;
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email,'@',1)));

  SELECT COUNT(*) INTO user_count FROM auth.users;
  IF user_count = 1 THEN
    INSERT INTO public.user_roles(user_id, role) VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles(user_id, role) VALUES (NEW.id, 'operador');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ CATEGORIES ============
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  color TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

INSERT INTO public.categories (name, slug, icon, color) VALUES
  ('Mesas de Som','mesas-som','Sliders','#3b82f6'),
  ('Microfones','microfones','Mic','#22c55e'),
  ('Caixas Acústicas','caixas-acusticas','Speaker','#8b5cf6'),
  ('Amplificação','amplificacao','Zap','#f59e0b'),
  ('Iluminação','iluminacao','Lightbulb','#eab308'),
  ('Vídeo & Projeção','video','MonitorPlay','#ec4899'),
  ('DJ','dj','Disc3','#06b6d4'),
  ('Cabos & Conexões','cabos','Cable','#64748b'),
  ('Acessórios','acessorios','Package','#94a3b8'),
  ('Intercom','intercom','Headphones','#10b981'),
  ('Energia & Power','energia','Plug','#ef4444'),
  ('Estruturas & Rigging','rigging','Anchor','#a855f7');

-- ============ EQUIPMENTS ============
CREATE TABLE public.equipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patrimony_no TEXT UNIQUE,
  internal_code TEXT,
  name TEXT NOT NULL,
  brand TEXT,
  model TEXT,
  serial_no TEXT,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  quantity INT NOT NULL DEFAULT 1,
  available_qty INT NOT NULL DEFAULT 1,
  status equipment_status NOT NULL DEFAULT 'disponivel',
  location TEXT,
  notes TEXT,
  image_url TEXT,
  qr_code TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.equipments ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_equipments_category ON public.equipments(category_id);
CREATE INDEX idx_equipments_status ON public.equipments(status);

-- ============ MOVEMENTS ============
CREATE TABLE public.equipment_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id UUID NOT NULL REFERENCES public.equipments(id) ON DELETE CASCADE,
  type movement_type NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  work_order_id UUID,
  from_location TEXT,
  to_location TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.equipment_movements ENABLE ROW LEVEL SECURITY;

-- ============ KITS ============
CREATE TABLE public.kits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  status kit_status NOT NULL DEFAULT 'rascunho',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.kits ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.kit_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kit_id UUID NOT NULL REFERENCES public.kits(id) ON DELETE CASCADE,
  equipment_id UUID NOT NULL REFERENCES public.equipments(id) ON DELETE CASCADE,
  quantity INT NOT NULL DEFAULT 1,
  UNIQUE(kit_id, equipment_id)
);
ALTER TABLE public.kit_items ENABLE ROW LEVEL SECURITY;

-- ============ CLIENTS ============
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact TEXT,
  email TEXT,
  phone TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- ============ WORK ORDERS ============
CREATE TABLE public.work_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL DEFAULT ('OS-' || lpad((floor(random()*99999))::text,5,'0')),
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  event_name TEXT NOT NULL,
  event_date DATE,
  location TEXT,
  technician_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  priority wo_priority NOT NULL DEFAULT 'media',
  status wo_status NOT NULL DEFAULT 'aberta',
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.work_orders ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.work_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_id UUID NOT NULL REFERENCES public.work_orders(id) ON DELETE CASCADE,
  equipment_id UUID NOT NULL REFERENCES public.equipments(id) ON DELETE CASCADE,
  quantity INT NOT NULL DEFAULT 1,
  checked_out BOOLEAN DEFAULT FALSE,
  checked_in BOOLEAN DEFAULT FALSE
);
ALTER TABLE public.work_order_items ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.equipment_movements
  ADD CONSTRAINT fk_movement_wo FOREIGN KEY (work_order_id) REFERENCES public.work_orders(id) ON DELETE SET NULL;

-- ============ MAINTENANCE ============
CREATE TABLE public.maintenance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id UUID NOT NULL REFERENCES public.equipments(id) ON DELETE CASCADE,
  technician_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  opened_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_at TIMESTAMPTZ,
  cost NUMERIC(12,2),
  report TEXT,
  status maintenance_status NOT NULL DEFAULT 'aberta',
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.maintenance ENABLE ROW LEVEL SECURITY;

-- ============ SCHEDULE ============
CREATE TABLE public.event_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_id UUID REFERENCES public.work_orders(id) ON DELETE CASCADE,
  type schedule_type NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  responsible_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  checklist JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'pendente',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.event_schedule ENABLE ROW LEVEL SECURITY;

-- ============ ACTIVITY LOGS ============
CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  entity TEXT NOT NULL,
  entity_id UUID,
  action TEXT NOT NULL,
  payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- ============ updated_at trigger ============
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_equipments_updated BEFORE UPDATE ON public.equipments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_kits_updated BEFORE UPDATE ON public.kits
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_wo_updated BEFORE UPDATE ON public.work_orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ RLS POLICIES ============
-- profiles
CREATE POLICY "Profiles viewable by authenticated" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Admins manage profiles" ON public.profiles FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- user_roles
CREATE POLICY "Roles viewable by authenticated" ON public.user_roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- categories: read all, write admin/estoquista
CREATE POLICY "Categories read" ON public.categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Categories write" ON public.categories FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()) OR public.has_role(auth.uid(),'estoquista'))
  WITH CHECK (public.is_admin(auth.uid()) OR public.has_role(auth.uid(),'estoquista'));

-- equipments
CREATE POLICY "Equipments read" ON public.equipments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Equipments write" ON public.equipments FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()) OR public.has_role(auth.uid(),'estoquista'))
  WITH CHECK (public.is_admin(auth.uid()) OR public.has_role(auth.uid(),'estoquista'));

-- movements
CREATE POLICY "Movements read" ON public.equipment_movements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Movements insert" ON public.equipment_movements FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- kits & items
CREATE POLICY "Kits read" ON public.kits FOR SELECT TO authenticated USING (true);
CREATE POLICY "Kits write" ON public.kits FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Kit items read" ON public.kit_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Kit items write" ON public.kit_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- clients
CREATE POLICY "Clients read" ON public.clients FOR SELECT TO authenticated USING (true);
CREATE POLICY "Clients write" ON public.clients FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- work_orders
CREATE POLICY "WO read" ON public.work_orders FOR SELECT TO authenticated USING (true);
CREATE POLICY "WO write" ON public.work_orders FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "WO items read" ON public.work_order_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "WO items write" ON public.work_order_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- maintenance
CREATE POLICY "Maintenance read" ON public.maintenance FOR SELECT TO authenticated USING (true);
CREATE POLICY "Maintenance write" ON public.maintenance FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- schedule
CREATE POLICY "Schedule read" ON public.event_schedule FOR SELECT TO authenticated USING (true);
CREATE POLICY "Schedule write" ON public.event_schedule FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- activity_logs
CREATE POLICY "Logs read" ON public.activity_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Logs insert" ON public.activity_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- ============ STORAGE BUCKET ============
INSERT INTO storage.buckets (id, name, public) VALUES ('equipment-images','equipment-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Equipment images public read" ON storage.objects FOR SELECT TO public USING (bucket_id = 'equipment-images');
CREATE POLICY "Equipment images authenticated upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'equipment-images');
CREATE POLICY "Equipment images authenticated update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'equipment-images');
CREATE POLICY "Equipment images authenticated delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'equipment-images');
