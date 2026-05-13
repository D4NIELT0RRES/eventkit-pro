import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yuwdkjdraskyziceqtvc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1d2RramRyYXNreXppY2VxdHZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1MzI1NDYsImV4cCI6MjA5NDEwODU0Nn0.H7HVd6FghwuMt2fH5PPd6CCB7Fih9mU3ATl9cReJQfM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  console.log('Checking database tables...\n');
  
  const { data: categories, error: catError } = await supabase.from('categories').select('*');
  console.log('📋 Categories:');
  console.log(`   Count: ${categories?.length || 0}`);
  console.log(`   Error: ${catError ? catError.message : 'None'}`);
  if (categories && categories.length > 0) {
    console.table(categories);
  }

  const { data: equipments, count: eqCount, error: eqError } = await supabase
    .from('equipments')
    .select('id, name, brand', { count: 'exact' })
    .limit(5);
  
  console.log('\n🔧 Equipments:');
  console.log(`   Count: ${eqCount || 0}`);
  console.log(`   Error: ${eqError ? eqError.message : 'None'}`);
  if (equipments && equipments.length > 0) {
    console.table(equipments);
  }
}

checkTables().catch(console.error);
