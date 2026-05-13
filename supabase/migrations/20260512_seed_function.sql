-- Create a function to seed categories and equipments with SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.seed_demo_data()
RETURNS TABLE(categories_inserted INT, equipments_inserted INT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cat_count INT := 0;
  v_eq_count INT := 0;
BEGIN
  -- Insert categories
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
  
  GET DIAGNOSTICS v_cat_count = ROW_COUNT;

  -- Insert equipments
  INSERT INTO public.equipments (name, brand, model, internal_code, category_id, quantity, available_qty, status) 
  SELECT 'Console SSL2 Soundcraft', 'Soundcraft', 'SSL2', 'SSL2-2024', (SELECT id FROM categories WHERE slug = 'mesas-som'), 2, 2, 'disponivel'
  UNION ALL SELECT 'Mesa de Som Allen & Heath 12', 'Allen & Heath', 'iLive-T112', 'AH-ILIVE-12', (SELECT id FROM categories WHERE slug = 'mesas-som'), 1, 1, 'disponivel'
  UNION ALL SELECT 'Mixer Yamaha MG16XU', 'Yamaha', 'MG16XU', 'YAM-MG16XU', (SELECT id FROM categories WHERE slug = 'mesas-som'), 3, 3, 'disponivel'
  UNION ALL SELECT 'Microfone Shure SM7B', 'Shure', 'SM7B', 'SHURE-SM7B', (SELECT id FROM categories WHERE slug = 'microfones'), 5, 5, 'disponivel'
  UNION ALL SELECT 'Microfone Neumann U87', 'Neumann', 'U87', 'NEUMANN-U87', (SELECT id FROM categories WHERE slug = 'microfones'), 2, 2, 'disponivel'
  UNION ALL SELECT 'Microfone Sennheiser E835', 'Sennheiser', 'E835', 'SENN-E835', (SELECT id FROM categories WHERE slug = 'microfones'), 8, 8, 'disponivel'
  UNION ALL SELECT 'Microfone Audio Technica AT4040', 'Audio Technica', 'AT4040', 'AT-4040', (SELECT id FROM categories WHERE slug = 'microfones'), 3, 3, 'disponivel'
  UNION ALL SELECT 'Speaker JBL SRX835', 'JBL', 'SRX835', 'JBL-SRX835', (SELECT id FROM categories WHERE slug = 'caixas-acusticas'), 4, 4, 'disponivel'
  UNION ALL SELECT 'Speaker Electro-Voice EKX-12', 'Electro-Voice', 'EKX-12', 'EV-EKX12', (SELECT id FROM categories WHERE slug = 'caixas-acusticas'), 6, 6, 'disponivel'
  UNION ALL SELECT 'Speaker QSC KW12', 'QSC', 'KW12', 'QSC-KW12', (SELECT id FROM categories WHERE slug = 'caixas-acusticas'), 2, 2, 'disponivel'
  UNION ALL SELECT 'Monitor Pessoal Shure PSM8', 'Shure', 'PSM8', 'SHURE-PSM8', (SELECT id FROM categories WHERE slug = 'caixas-acusticas'), 4, 4, 'disponivel'
  UNION ALL SELECT 'Cabo XLR 10m Neutrik', 'Neutrik', 'XLR10', 'NEUTRIK-XLR10', (SELECT id FROM categories WHERE slug = 'cabos'), 20, 20, 'disponivel'
  UNION ALL SELECT 'Cabo HDMI 2.1 10m', 'Generic', 'HDMI21-10', 'HDMI-21-10', (SELECT id FROM categories WHERE slug = 'cabos'), 15, 15, 'disponivel'
  UNION ALL SELECT 'Cabo Ethernet CAT6 30m', 'Generic', 'CAT6-30', 'ETH-CAT6-30', (SELECT id FROM categories WHERE slug = 'cabos'), 10, 10, 'disponivel'
  UNION ALL SELECT 'Cabo USB 3.0 5m', 'Generic', 'USB3-5', 'USB-3-5M', (SELECT id FROM categories WHERE slug = 'cabos'), 12, 12, 'disponivel'
  UNION ALL SELECT 'DI Box Radial ProD2', 'Radial', 'ProD2', 'RADIAL-PROD2', (SELECT id FROM categories WHERE slug = 'acessorios'), 4, 4, 'disponivel'
  UNION ALL SELECT 'Pedestal Microfone Konig Meyer K&M', 'König & Meyer', 'K&M-210', 'KM-210', (SELECT id FROM categories WHERE slug = 'acessorios'), 8, 8, 'disponivel'
  UNION ALL SELECT 'Pedestal Speaker Gator Frameworks', 'Gator Frameworks', 'GFW-SPK-4000', 'GATOR-SPK4000', (SELECT id FROM categories WHERE slug = 'acessorios'), 6, 6, 'disponivel'
  UNION ALL SELECT 'Monitor Stand Yamaha', 'Yamaha', 'MS-60W', 'YAM-MS60', (SELECT id FROM categories WHERE slug = 'acessorios'), 4, 4, 'disponivel'
  UNION ALL SELECT 'Arandela de Palco ETC Source Four', 'ETC', 'Source Four', 'ETC-SF50', (SELECT id FROM categories WHERE slug = 'iluminacao'), 12, 12, 'disponivel'
  UNION ALL SELECT 'Projetor 4K BenQ LK970', 'BenQ', 'LK970', 'BENQ-LK970', (SELECT id FROM categories WHERE slug = 'video'), 2, 2, 'disponivel'
  UNION ALL SELECT 'Câmera PTZ Sony EVI-D100', 'Sony', 'EVI-D100', 'SONY-EVID100', (SELECT id FROM categories WHERE slug = 'video'), 3, 3, 'disponivel'
  UNION ALL SELECT 'Headphone AKG K812', 'AKG', 'K812', 'AKG-K812', (SELECT id FROM categories WHERE slug = 'intercom'), 3, 3, 'disponivel'
  UNION ALL SELECT 'Headphone Sony MDR-Z1R', 'Sony', 'MDR-Z1R', 'SONY-MDRZ1R', (SELECT id FROM categories WHERE slug = 'intercom'), 2, 2, 'disponivel'
  UNION ALL SELECT 'In-Ear Monitor Shure SE846', 'Shure', 'SE846', 'SHURE-SE846', (SELECT id FROM categories WHERE slug = 'intercom'), 6, 6, 'disponivel'
  ON CONFLICT DO NOTHING;
  
  GET DIAGNOSTICS v_eq_count = ROW_COUNT;
  
  RETURN QUERY SELECT v_cat_count, v_eq_count;
END;
$$;

-- Call the function to seed data
SELECT * FROM public.seed_demo_data();
