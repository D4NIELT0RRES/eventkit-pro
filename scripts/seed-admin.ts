import { createClient } from '@supabase/supabase-js';

// Use the service role key for administrative operations
const supabaseUrl = 'https://yuwdkjdraskyziceqtvc.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1d2RramRyYXNreXppY2VxdHZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODUzMjU0NiwiZXhwIjoyMDk0MTA4NTQ2fQ.XC_WzswpfuXh7NYMgrKHGR7xL6aPVXMD-8Gfu2QUc3Y';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
});

async function seedDatabase() {
  try {
    console.log('🌱 Seeding database with service role...\n');

    // Read the SQL file and execute
    const seedSQL = `
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

-- Get category IDs for inserting equipments
WITH category_ids AS (
  SELECT id, slug FROM public.categories
)
INSERT INTO public.equipments (name, brand, model, internal_code, category_id, quantity, available_qty, status) 
SELECT 'Console SSL2 Soundcraft', 'Soundcraft', 'SSL2', 'SSL2-2024', (SELECT id FROM category_ids WHERE slug = 'mesas-som'), 2, 2, 'disponivel'
UNION ALL SELECT 'Mesa de Som Allen & Heath 12', 'Allen & Heath', 'iLive-T112', 'AH-ILIVE-12', (SELECT id FROM category_ids WHERE slug = 'mesas-som'), 1, 1, 'disponivel'
UNION ALL SELECT 'Mixer Yamaha MG16XU', 'Yamaha', 'MG16XU', 'YAM-MG16XU', (SELECT id FROM category_ids WHERE slug = 'mesas-som'), 3, 3, 'disponivel'
UNION ALL SELECT 'Microfone Shure SM7B', 'Shure', 'SM7B', 'SHURE-SM7B', (SELECT id FROM category_ids WHERE slug = 'microfones'), 5, 5, 'disponivel'
UNION ALL SELECT 'Microfone Neumann U87', 'Neumann', 'U87', 'NEUMANN-U87', (SELECT id FROM category_ids WHERE slug = 'microfones'), 2, 2, 'disponivel'
UNION ALL SELECT 'Microfone Sennheiser E835', 'Sennheiser', 'E835', 'SENN-E835', (SELECT id FROM category_ids WHERE slug = 'microfones'), 8, 8, 'disponivel'
UNION ALL SELECT 'Microfone Audio Technica AT4040', 'Audio Technica', 'AT4040', 'AT-4040', (SELECT id FROM category_ids WHERE slug = 'microfones'), 3, 3, 'disponivel'
UNION ALL SELECT 'Speaker JBL SRX835', 'JBL', 'SRX835', 'JBL-SRX835', (SELECT id FROM category_ids WHERE slug = 'caixas-acusticas'), 4, 4, 'disponivel'
UNION ALL SELECT 'Speaker Electro-Voice EKX-12', 'Electro-Voice', 'EKX-12', 'EV-EKX12', (SELECT id FROM category_ids WHERE slug = 'caixas-acusticas'), 6, 6, 'disponivel'
UNION ALL SELECT 'Speaker QSC KW12', 'QSC', 'KW12', 'QSC-KW12', (SELECT id FROM category_ids WHERE slug = 'caixas-acusticas'), 2, 2, 'disponivel'
UNION ALL SELECT 'Monitor Pessoal Shure PSM8', 'Shure', 'PSM8', 'SHURE-PSM8', (SELECT id FROM category_ids WHERE slug = 'caixas-acusticas'), 4, 4, 'disponivel'
UNION ALL SELECT 'Cabo XLR 10m Neutrik', 'Neutrik', 'XLR10', 'NEUTRIK-XLR10', (SELECT id FROM category_ids WHERE slug = 'cabos'), 20, 20, 'disponivel'
UNION ALL SELECT 'Cabo HDMI 2.1 10m', 'Generic', 'HDMI21-10', 'HDMI-21-10', (SELECT id FROM category_ids WHERE slug = 'cabos'), 15, 15, 'disponivel'
UNION ALL SELECT 'Cabo Ethernet CAT6 30m', 'Generic', 'CAT6-30', 'ETH-CAT6-30', (SELECT id FROM category_ids WHERE slug = 'cabos'), 10, 10, 'disponivel'
UNION ALL SELECT 'Cabo USB 3.0 5m', 'Generic', 'USB3-5', 'USB-3-5M', (SELECT id FROM category_ids WHERE slug = 'cabos'), 12, 12, 'disponivel'
UNION ALL SELECT 'DI Box Radial ProD2', 'Radial', 'ProD2', 'RADIAL-PROD2', (SELECT id FROM category_ids WHERE slug = 'acessorios'), 4, 4, 'disponivel'
UNION ALL SELECT 'Pedestal Microfone Konig Meyer K&M', 'König & Meyer', 'K&M-210', 'KM-210', (SELECT id FROM category_ids WHERE slug = 'acessorios'), 8, 8, 'disponivel'
UNION ALL SELECT 'Pedestal Speaker Gator Frameworks', 'Gator Frameworks', 'GFW-SPK-4000', 'GATOR-SPK4000', (SELECT id FROM category_ids WHERE slug = 'acessorios'), 6, 6, 'disponivel'
UNION ALL SELECT 'Monitor Stand Yamaha', 'Yamaha', 'MS-60W', 'YAM-MS60', (SELECT id FROM category_ids WHERE slug = 'acessorios'), 4, 4, 'disponivel'
UNION ALL SELECT 'Arandela de Palco ETC Source Four', 'ETC', 'Source Four', 'ETC-SF50', (SELECT id FROM category_ids WHERE slug = 'iluminacao'), 12, 12, 'disponivel'
UNION ALL SELECT 'Projetor 4K BenQ LK970', 'BenQ', 'LK970', 'BENQ-LK970', (SELECT id FROM category_ids WHERE slug = 'video'), 2, 2, 'disponivel'
UNION ALL SELECT 'Câmera PTZ Sony EVI-D100', 'Sony', 'EVI-D100', 'SONY-EVID100', (SELECT id FROM category_ids WHERE slug = 'video'), 3, 3, 'disponivel'
UNION ALL SELECT 'Headphone AKG K812', 'AKG', 'K812', 'AKG-K812', (SELECT id FROM category_ids WHERE slug = 'intercom'), 3, 3, 'disponivel'
UNION ALL SELECT 'Headphone Sony MDR-Z1R', 'Sony', 'MDR-Z1R', 'SONY-MDRZ1R', (SELECT id FROM category_ids WHERE slug = 'intercom'), 2, 2, 'disponivel'
UNION ALL SELECT 'In-Ear Monitor Shure SE846', 'Shure', 'SE846', 'SHURE-SE846', (SELECT id FROM category_ids WHERE slug = 'intercom'), 6, 6, 'disponivel'
ON CONFLICT DO NOTHING;
    `;

    const { error } = await supabase.rpc('exec_sql', { sql: seedSQL });
    
    if (error) {
      console.error('Note: exec_sql not available, trying direct inserts...');
    } else {
      console.log('✅ Seed executed successfully!');
      return;
    }

    // If exec_sql is not available, use the direct insert approach
    console.log('📋 Inserting categories...');
    const { error: catError } = await supabase.from('categories').insert([
      { name: 'Mesas de Som', slug: 'mesas-som', icon: 'Sliders', color: '#3b82f6' },
      { name: 'Microfones', slug: 'microfones', icon: 'Mic', color: '#22c55e' },
      { name: 'Caixas Acústicas', slug: 'caixas-acusticas', icon: 'Speaker', color: '#8b5cf6' },
      { name: 'Amplificação', slug: 'amplificacao', icon: 'Zap', color: '#f59e0b' },
      { name: 'Iluminação', slug: 'iluminacao', icon: 'Lightbulb', color: '#eab308' },
      { name: 'Vídeo & Projeção', slug: 'video', icon: 'MonitorPlay', color: '#ec4899' },
      { name: 'DJ', slug: 'dj', icon: 'Disc3', color: '#06b6d4' },
      { name: 'Cabos & Conexões', slug: 'cabos', icon: 'Cable', color: '#64748b' },
      { name: 'Acessórios', slug: 'acessorios', icon: 'Package', color: '#94a3b8' },
      { name: 'Intercom', slug: 'intercom', icon: 'Headphones', color: '#10b981' },
      { name: 'Energia & Power', slug: 'energia', icon: 'Plug', color: '#ef4444' },
      { name: 'Estruturas & Rigging', slug: 'rigging', icon: 'Anchor', color: '#a855f7' },
    ]);

    if (catError && catError.code !== '23505') { // 23505 = unique violation, which is okay
      console.error('❌ Error inserting categories:', catError);
      process.exit(1);
    }
    console.log('✅ Categories inserted');

    // Fetch category IDs
    const { data: categories } = await supabase.from('categories').select('id, slug');
    const categoryMap = new Map(categories?.map((cat: any) => [cat.slug, cat.id]) || []);

    // Insert equipments
    const equipmentsDataMap = {
      'mesas-som': [
        { name: 'Console SSL2 Soundcraft', brand: 'Soundcraft', model: 'SSL2', sku: 'SSL2-2024', qty: 2 },
        { name: 'Mesa de Som Allen & Heath 12', brand: 'Allen & Heath', model: 'iLive-T112', sku: 'AH-ILIVE-12', qty: 1 },
        { name: 'Mixer Yamaha MG16XU', brand: 'Yamaha', model: 'MG16XU', sku: 'YAM-MG16XU', qty: 3 },
      ],
      'microfones': [
        { name: 'Microfone Shure SM7B', brand: 'Shure', model: 'SM7B', sku: 'SHURE-SM7B', qty: 5 },
        { name: 'Microfone Neumann U87', brand: 'Neumann', model: 'U87', sku: 'NEUMANN-U87', qty: 2 },
        { name: 'Microfone Sennheiser E835', brand: 'Sennheiser', model: 'E835', sku: 'SENN-E835', qty: 8 },
        { name: 'Microfone Audio Technica AT4040', brand: 'Audio Technica', model: 'AT4040', sku: 'AT-4040', qty: 3 },
      ],
      'caixas-acusticas': [
        { name: 'Speaker JBL SRX835', brand: 'JBL', model: 'SRX835', sku: 'JBL-SRX835', qty: 4 },
        { name: 'Speaker Electro-Voice EKX-12', brand: 'Electro-Voice', model: 'EKX-12', sku: 'EV-EKX12', qty: 6 },
        { name: 'Speaker QSC KW12', brand: 'QSC', model: 'KW12', sku: 'QSC-KW12', qty: 2 },
        { name: 'Monitor Pessoal Shure PSM8', brand: 'Shure', model: 'PSM8', sku: 'SHURE-PSM8', qty: 4 },
      ],
      'cabos': [
        { name: 'Cabo XLR 10m Neutrik', brand: 'Neutrik', model: 'XLR10', sku: 'NEUTRIK-XLR10', qty: 20 },
        { name: 'Cabo HDMI 2.1 10m', brand: 'Generic', model: 'HDMI21-10', sku: 'HDMI-21-10', qty: 15 },
        { name: 'Cabo Ethernet CAT6 30m', brand: 'Generic', model: 'CAT6-30', sku: 'ETH-CAT6-30', qty: 10 },
        { name: 'Cabo USB 3.0 5m', brand: 'Generic', model: 'USB3-5', sku: 'USB-3-5M', qty: 12 },
      ],
      'acessorios': [
        { name: 'DI Box Radial ProD2', brand: 'Radial', model: 'ProD2', sku: 'RADIAL-PROD2', qty: 4 },
        { name: 'Pedestal Microfone Konig Meyer K&M', brand: 'König & Meyer', model: 'K&M-210', sku: 'KM-210', qty: 8 },
        { name: 'Pedestal Speaker Gator Frameworks', brand: 'Gator Frameworks', model: 'GFW-SPK-4000', sku: 'GATOR-SPK4000', qty: 6 },
        { name: 'Monitor Stand Yamaha', brand: 'Yamaha', model: 'MS-60W', sku: 'YAM-MS60', qty: 4 },
      ],
      'iluminacao': [
        { name: 'Arandela de Palco ETC Source Four', brand: 'ETC', model: 'Source Four', sku: 'ETC-SF50', qty: 12 },
      ],
      'video': [
        { name: 'Projetor 4K BenQ LK970', brand: 'BenQ', model: 'LK970', sku: 'BENQ-LK970', qty: 2 },
        { name: 'Câmera PTZ Sony EVI-D100', brand: 'Sony', model: 'EVI-D100', sku: 'SONY-EVID100', qty: 3 },
      ],
      'intercom': [
        { name: 'Headphone AKG K812', brand: 'AKG', model: 'K812', sku: 'AKG-K812', qty: 3 },
        { name: 'Headphone Sony MDR-Z1R', brand: 'Sony', model: 'MDR-Z1R', sku: 'SONY-MDRZ1R', qty: 2 },
        { name: 'In-Ear Monitor Shure SE846', brand: 'Shure', model: 'SE846', sku: 'SHURE-SE846', qty: 6 },
      ],
    };

    const equipmentsToInsert: any[] = [];
    for (const [categorySlug, items] of Object.entries(equipmentsDataMap)) {
      const categoryId = categoryMap.get(categorySlug);
      if (!categoryId) continue;

      for (const item of items) {
        equipmentsToInsert.push({
          name: item.name,
          brand: item.brand,
          model: item.model,
          internal_code: item.sku,
          category_id: categoryId,
          quantity: item.qty,
          available_qty: item.qty,
          status: 'disponivel',
        });
      }
    }

    console.log(`🔧 Inserting ${equipmentsToInsert.length} equipments...`);
    const batchSize = 10;
    for (let i = 0; i < equipmentsToInsert.length; i += batchSize) {
      const batch = equipmentsToInsert.slice(i, i + batchSize);
      const { error: insertError } = await supabase.from('equipments').insert(batch);

      if (insertError && insertError.code !== '23505') {
        console.error(`❌ Error inserting batch:`, insertError);
      } else {
        console.log(`   ✅ Batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(equipmentsToInsert.length / batchSize)} inserted`);
      }
    }

    // Verify
    const { count } = await supabase
      .from('equipments')
      .select('*', { count: 'exact', head: true });

    console.log(`\n✨ Seeding completed! Total equipments: ${count}`);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

seedDatabase();
