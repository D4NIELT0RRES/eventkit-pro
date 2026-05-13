import { createClient } from '@supabase/supabase-js';

// Load env variables - try multiple sources
const supabaseUrl = process.env.VITE_SUPABASE_URL || 
                   process.env.SUPABASE_URL ||
                   'https://yuwdkjdraskyziceqtvc.supabase.co';

const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
                   process.env.VITE_SUPABASE_ANON_KEY ||
                   process.env.SUPABASE_ANON_KEY ||
                   'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1d2RramRyYXNreXppY2VxdHZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1MzI1NDYsImV4cCI6MjA5NDEwODU0Nn0.H7HVd6FghwuMt2fH5PPd6CCB7Fih9mU3ATl9cReJQfM';

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

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

async function seedEquipments() {
  try {
    console.log('🌱 Starting database seeding...');

    // Fetch all categories
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('id, slug');

    if (categoriesError) {
      console.error('❌ Error fetching categories:', categoriesError);
      process.exit(1);
    }

    // Create a map of slug -> id
    const categoryMap = new Map(categories.map((cat: any) => [cat.slug, cat.id]));

    // Prepare equipments with proper structure
    const equipmentsToInsert: any[] = [];
    let totalCount = 0;

    for (const [categorySlug, items] of Object.entries(equipmentsDataMap)) {
      const categoryId = categoryMap.get(categorySlug);
      if (!categoryId) {
        console.warn(`⚠️  Category not found: ${categorySlug}`);
        continue;
      }

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
        totalCount++;
      }
    }

    console.log(`📦 Found ${totalCount} equipments to insert`);

    // Insert equipments in batches of 10 to avoid large single inserts
    const batchSize = 10;
    for (let i = 0; i < equipmentsToInsert.length; i += batchSize) {
      const batch = equipmentsToInsert.slice(i, i + batchSize);
      const { error: insertError } = await supabase
        .from('equipments')
        .insert(batch);

      if (insertError) {
        console.error(`❌ Error inserting batch ${i / batchSize + 1}:`, insertError);
        process.exit(1);
      }
      console.log(`✅ Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(equipmentsToInsert.length / batchSize)}`);
    }

    // Verify insertion
    const { data: verifyData, error: verifyError } = await supabase
      .from('equipments')
      .select('id, name, brand, category_id, quantity')
      .limit(10);

    if (verifyError) {
      console.error('❌ Error verifying equipments:', verifyError);
      process.exit(1);
    }

    console.log(`\n📋 Sample of inserted equipments (first 10):`);
    console.table(verifyData);

    const { count } = await supabase
      .from('equipments')
      .select('*', { count: 'exact', head: true });

    console.log(`\n✨ Seed completed successfully! Total equipments in database: ${count}`);
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

seedEquipments();
