-- ============ CATEGORIES ============
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
  ('Estruturas & Rigging','rigging','Anchor','#a855f7')
ON CONFLICT DO NOTHING;

-- ============ EQUIPMENTS ============
-- Mesas de Som
INSERT INTO public.equipments (name, brand, model, internal_code, category_id, quantity, available_qty, status) 
SELECT 
  'Console SSL2 Soundcraft', 'Soundcraft', 'SSL2', 'SSL2-2024', id, 2, 2, 'disponivel'
FROM public.categories WHERE slug = 'mesas-som';

INSERT INTO public.equipments (name, brand, model, internal_code, category_id, quantity, available_qty, status) 
SELECT 
  'Mesa de Som Allen & Heath 12', 'Allen & Heath', 'iLive-T112', 'AH-ILIVE-12', id, 1, 1, 'disponivel'
FROM public.categories WHERE slug = 'mesas-som';

INSERT INTO public.equipments (name, brand, model, internal_code, category_id, quantity, available_qty, status) 
SELECT 
  'Mixer Yamaha MG16XU', 'Yamaha', 'MG16XU', 'YAM-MG16XU', id, 3, 3, 'disponivel'
FROM public.categories WHERE slug = 'mesas-som';

-- Microfones
INSERT INTO public.equipments (name, brand, model, internal_code, category_id, quantity, available_qty, status) 
SELECT 
  'Microfone Shure SM7B', 'Shure', 'SM7B', 'SHURE-SM7B', id, 5, 5, 'disponivel'
FROM public.categories WHERE slug = 'microfones';

INSERT INTO public.equipments (name, brand, model, internal_code, category_id, quantity, available_qty, status) 
SELECT 
  'Microfone Neumann U87', 'Neumann', 'U87', 'NEUMANN-U87', id, 2, 2, 'disponivel'
FROM public.categories WHERE slug = 'microfones';

INSERT INTO public.equipments (name, brand, model, internal_code, category_id, quantity, available_qty, status) 
SELECT 
  'Microfone Sennheiser E835', 'Sennheiser', 'E835', 'SENN-E835', id, 8, 8, 'disponivel'
FROM public.categories WHERE slug = 'microfones';

INSERT INTO public.equipments (name, brand, model, internal_code, category_id, quantity, available_qty, status) 
SELECT 
  'Microfone Audio Technica AT4040', 'Audio Technica', 'AT4040', 'AT-4040', id, 3, 3, 'disponivel'
FROM public.categories WHERE slug = 'microfones';

-- Caixas Acústicas
INSERT INTO public.equipments (name, brand, model, internal_code, category_id, quantity, available_qty, status) 
SELECT 
  'Speaker JBL SRX835', 'JBL', 'SRX835', 'JBL-SRX835', id, 4, 4, 'disponivel'
FROM public.categories WHERE slug = 'caixas-acusticas';

INSERT INTO public.equipments (name, brand, model, internal_code, category_id, quantity, available_qty, status) 
SELECT 
  'Speaker Electro-Voice EKX-12', 'Electro-Voice', 'EKX-12', 'EV-EKX12', id, 6, 6, 'disponivel'
FROM public.categories WHERE slug = 'caixas-acusticas';

INSERT INTO public.equipments (name, brand, model, internal_code, category_id, quantity, available_qty, status) 
SELECT 
  'Speaker QSC KW12', 'QSC', 'KW12', 'QSC-KW12', id, 2, 2, 'disponivel'
FROM public.categories WHERE slug = 'caixas-acusticas';

INSERT INTO public.equipments (name, brand, model, internal_code, category_id, quantity, available_qty, status) 
SELECT 
  'Monitor Pessoal Shure PSM8', 'Shure', 'PSM8', 'SHURE-PSM8', id, 4, 4, 'disponivel'
FROM public.categories WHERE slug = 'caixas-acusticas';

-- Cabos
INSERT INTO public.equipments (name, brand, model, internal_code, category_id, quantity, available_qty, status) 
SELECT 
  'Cabo XLR 10m Neutrik', 'Neutrik', 'XLR10', 'NEUTRIK-XLR10', id, 20, 20, 'disponivel'
FROM public.categories WHERE slug = 'cabos';

INSERT INTO public.equipments (name, brand, model, internal_code, category_id, quantity, available_qty, status) 
SELECT 
  'Cabo HDMI 2.1 10m', 'Generic', 'HDMI21-10', 'HDMI-21-10', id, 15, 15, 'disponivel'
FROM public.categories WHERE slug = 'cabos';

INSERT INTO public.equipments (name, brand, model, internal_code, category_id, quantity, available_qty, status) 
SELECT 
  'Cabo Ethernet CAT6 30m', 'Generic', 'CAT6-30', 'ETH-CAT6-30', id, 10, 10, 'disponivel'
FROM public.categories WHERE slug = 'cabos';

INSERT INTO public.equipments (name, brand, model, internal_code, category_id, quantity, available_qty, status) 
SELECT 
  'Cabo USB 3.0 5m', 'Generic', 'USB3-5', 'USB-3-5M', id, 12, 12, 'disponivel'
FROM public.categories WHERE slug = 'cabos';

-- Acessórios
INSERT INTO public.equipments (name, brand, model, internal_code, category_id, quantity, available_qty, status) 
SELECT 
  'DI Box Radial ProD2', 'Radial', 'ProD2', 'RADIAL-PROD2', id, 4, 4, 'disponivel'
FROM public.categories WHERE slug = 'acessorios';

INSERT INTO public.equipments (name, brand, model, internal_code, category_id, quantity, available_qty, status) 
SELECT 
  'Pedestal Microfone Konig Meyer K&M', 'König & Meyer', 'K&M-210', 'KM-210', id, 8, 8, 'disponivel'
FROM public.categories WHERE slug = 'acessorios';

INSERT INTO public.equipments (name, brand, model, internal_code, category_id, quantity, available_qty, status) 
SELECT 
  'Pedestal Speaker Gator Frameworks', 'Gator Frameworks', 'GFW-SPK-4000', 'GATOR-SPK4000', id, 6, 6, 'disponivel'
FROM public.categories WHERE slug = 'acessorios';

INSERT INTO public.equipments (name, brand, model, internal_code, category_id, quantity, available_qty, status) 
SELECT 
  'Monitor Stand Yamaha', 'Yamaha', 'MS-60W', 'YAM-MS60', id, 4, 4, 'disponivel'
FROM public.categories WHERE slug = 'acessorios';

-- Iluminação
INSERT INTO public.equipments (name, brand, model, internal_code, category_id, quantity, available_qty, status) 
SELECT 
  'Arandela de Palco ETC Source Four', 'ETC', 'Source Four', 'ETC-SF50', id, 12, 12, 'disponivel'
FROM public.categories WHERE slug = 'iluminacao';

-- Vídeo
INSERT INTO public.equipments (name, brand, model, internal_code, category_id, quantity, available_qty, status) 
SELECT 
  'Projetor 4K BenQ LK970', 'BenQ', 'LK970', 'BENQ-LK970', id, 2, 2, 'disponivel'
FROM public.categories WHERE slug = 'video';

INSERT INTO public.equipments (name, brand, model, internal_code, category_id, quantity, available_qty, status) 
SELECT 
  'Câmera PTZ Sony EVI-D100', 'Sony', 'EVI-D100', 'SONY-EVID100', id, 3, 3, 'disponivel'
FROM public.categories WHERE slug = 'video';

-- Intercom
INSERT INTO public.equipments (name, brand, model, internal_code, category_id, quantity, available_qty, status) 
SELECT 
  'Headphone AKG K812', 'AKG', 'K812', 'AKG-K812', id, 3, 3, 'disponivel'
FROM public.categories WHERE slug = 'intercom';

INSERT INTO public.equipments (name, brand, model, internal_code, category_id, quantity, available_qty, status) 
SELECT 
  'Headphone Sony MDR-Z1R', 'Sony', 'MDR-Z1R', 'SONY-MDRZ1R', id, 2, 2, 'disponivel'
FROM public.categories WHERE slug = 'intercom';

INSERT INTO public.equipments (name, brand, model, internal_code, category_id, quantity, available_qty, status) 
SELECT 
  'In-Ear Monitor Shure SE846', 'Shure', 'SE846', 'SHURE-SE846', id, 6, 6, 'disponivel'
FROM public.categories WHERE slug = 'intercom';
