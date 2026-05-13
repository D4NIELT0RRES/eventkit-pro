import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yuwdkjdraskyziceqtvc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1d2RramRyYXNreXppY2VxdHZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1MzI1NDYsImV4cCI6MjA5NDEwODU0Nn0.H7HVd6FghwuMt2fH5PPd6CCB7Fih9mU3ATl9cReJQfM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedDatabase() {
  try {
    console.log('🌱 Seeding database...\n');

    console.log('📋 Creating and calling seed function...');
    
    // First, create the function
    const { error: funcError } = await supabase.rpc('seed_demo_data');
    
    if (funcError) {
      console.log('Note: Function might already exist or needs to be created in Supabase dashboard.');
      console.log('Attempting alternative approach...\n');
      
      // Alternative: Insert data directly through rpc or table insert
      console.log('🔧 Inserting categories...');
      
      const categories = [
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
      ];

      const { error: catError } = await supabase.from('categories').insert(categories);

      if (catError && !catError.message.includes('duplicate')) {
        console.error('❌ Error inserting categories:', catError);
      } else {
        console.log(`✅ Categories ready`);
      }

      // Fetch categories
      const { data: cats } = await supabase.from('categories').select('id, slug');
      const catMap = new Map(cats?.map((c: any) => [c.slug, c.id]) || []);

      // Simple equipment list
      const equipments = [
        { name: 'Console SSL2 Soundcraft', brand: 'Soundcraft', model: 'SSL2', sku: 'SSL2-2024', qty: 2, slug: 'mesas-som' },
        { name: 'Mixer Yamaha MG16XU', brand: 'Yamaha', model: 'MG16XU', sku: 'YAM-MG16XU', qty: 3, slug: 'mesas-som' },
        { name: 'Microfone Shure SM7B', brand: 'Shure', model: 'SM7B', sku: 'SHURE-SM7B', qty: 5, slug: 'microfones' },
        { name: 'Speaker JBL SRX835', brand: 'JBL', model: 'SRX835', sku: 'JBL-SRX835', qty: 4, slug: 'caixas-acusticas' },
        { name: 'Cabo XLR 10m', brand: 'Neutrik', model: 'XLR10', sku: 'NEUTRIK-XLR10', qty: 20, slug: 'cabos' },
      ];

      const toInsert = equipments.map(eq => ({
        name: eq.name,
        brand: eq.brand,
        model: eq.model,
        internal_code: eq.sku,
        category_id: catMap.get(eq.slug),
        quantity: eq.qty,
        available_qty: eq.qty,
        status: 'disponivel',
      }));

      const { error: eqError } = await supabase.from('equipments').insert(toInsert);
      if (eqError && !eqError.message.includes('duplicate')) {
        console.error('❌ Error inserting equipments:', eqError);
      } else {
        console.log(`✅ Equipments inserted`);
      }
    } else {
      console.log('✅ Seed function executed successfully');
    }

    // Verify
    const { count: eqCount } = await supabase
      .from('equipments')
      .select('*', { count: 'exact', head: true });

    const { count: catCount } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true });

    console.log(`\n✨ Database seeding completed!`);
    console.log(`   Categories: ${catCount}`);
    console.log(`   Equipments: ${eqCount}`);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

seedDatabase();
