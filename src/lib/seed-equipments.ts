import { SupabaseClient } from '@supabase/supabase-js';

const EQUIPAMENTOS_SEED = [
  // Mesas e Consoles
  { name: 'Digico SD9', category: 'Mesas e Consoles', brand: 'Digico', quantity: 1 },
  { name: 'Digidesign Venue', category: 'Mesas e Consoles', brand: 'Digidesign', quantity: 1 },
  { name: 'Yamaha PM5D RH', category: 'Mesas e Consoles', brand: 'Yamaha', quantity: 1 },
  { name: 'Yamaha M7CL', category: 'Mesas e Consoles', brand: 'Yamaha', quantity: 1 },
  { name: 'Yamaha LS9', category: 'Mesas e Consoles', brand: 'Yamaha', quantity: 1 },
  { name: 'Yamaha 01V96', category: 'Mesas e Consoles', brand: 'Yamaha', quantity: 1 },
  { name: 'Behringer X32', category: 'Mesas e Consoles', brand: 'Behringer', quantity: 2 },
  { name: 'Yamaha MG166', category: 'Mesas e Consoles', brand: 'Yamaha', quantity: 1 },
  { name: 'Midas 24', category: 'Mesas e Consoles', brand: 'Midas', quantity: 1 },
  { name: 'Behringer 12', category: 'Mesas e Consoles', brand: 'Behringer', quantity: 3 },
  { name: 'Phonic 12', category: 'Mesas e Consoles', brand: 'Phonic', quantity: 2 },
  { name: 'Phonic 08', category: 'Mesas e Consoles', brand: 'Phonic', quantity: 1 },

  // Caixas de Som e P.A.
  { name: 'Meyer MILO', category: 'Caixas de Som e P.A.', brand: 'Meyer', quantity: 4 },
  { name: 'Meyer Mina/P.A.Stack', category: 'Caixas de Som e P.A.', brand: 'Meyer', quantity: 2 },
  { name: 'Meyer CQ1', category: 'Caixas de Som e P.A.', brand: 'Meyer', quantity: 3 },
  { name: 'Meyer MSL2', category: 'Caixas de Som e P.A.', brand: 'Meyer', quantity: 2 },
  { name: 'Meyer MSW', category: 'Caixas de Som e P.A.', brand: 'Meyer', quantity: 4 },
  { name: 'Meyer UPA-1P/DLY', category: 'Caixas de Som e P.A.', brand: 'Meyer', quantity: 2 },
  { name: 'Meyer UPM-1P/RT', category: 'Caixas de Som e P.A.', brand: 'Meyer', quantity: 2 },
  { name: 'Meyer UPJúnior/FRT', category: 'Caixas de Som e P.A.', brand: 'Meyer', quantity: 2 },
  { name: 'Meyer HP700', category: 'Caixas de Som e P.A.', brand: 'Meyer', quantity: 1 },
  { name: 'Meyer MM4', category: 'Caixas de Som e P.A.', brand: 'Meyer', quantity: 2 },
  { name: 'Meyer MM-4/Fonte', category: 'Caixas de Som e P.A.', brand: 'Meyer', quantity: 1 },
  { name: 'Meyer lFC-1100', category: 'Caixas de Som e P.A.', brand: 'Meyer', quantity: 1 },
  { name: 'Meyer MSL-2A', category: 'Caixas de Som e P.A.', brand: 'Meyer', quantity: 2 },
  { name: 'Meyer MSW-2A', category: 'Caixas de Som e P.A.', brand: 'Meyer', quantity: 2 },
  { name: 'Behringer EUROLIVE', category: 'Caixas de Som e P.A.', brand: 'Behringer', quantity: 6 },
  { name: 'EAW KF850-VM', category: 'Caixas de Som e P.A.', brand: 'EAW', quantity: 4 },
  { name: 'EAW SB850', category: 'Caixas de Som e P.A.', brand: 'EAW', quantity: 2 },
  { name: 'EAW LA325', category: 'Caixas de Som e P.A.', brand: 'EAW', quantity: 3 },
  { name: 'EAW SUB LA118A', category: 'Caixas de Som e P.A.', brand: 'EAW', quantity: 4 },
  { name: 'FZ 102/RT', category: 'Caixas de Som e P.A.', brand: 'FZ', quantity: 2 },
  { name: 'FZ102 HPA/P.A', category: 'Caixas de Som e P.A.', brand: 'FZ', quantity: 2 },
  { name: 'FZ 18A Sub', category: 'Caixas de Som e P.A.', brand: 'FZ', quantity: 4 },
  { name: 'FZ108/DLY', category: 'Caixas de Som e P.A.', brand: 'FZ', quantity: 2 },
  { name: 'FZ 205/Copo', category: 'Caixas de Som e P.A.', brand: 'FZ', quantity: 3 },
  { name: 'FZ 205/Alça', category: 'Caixas de Som e P.A.', brand: 'FZ', quantity: 3 },
  { name: 'EV-1502', category: 'Caixas de Som e P.A.', brand: 'EV', quantity: 2 },
  { name: 'KF-MX800', category: 'Caixas de Som e P.A.', brand: 'KF', quantity: 1 },
  { name: 'MSL', category: 'Caixas de Som e P.A.', brand: 'Meyer', quantity: 2 },
  { name: 'UPA stereo', category: 'Caixas de Som e P.A.', brand: 'Meyer', quantity: 2 },
  { name: 'UPM', category: 'Caixas de Som e P.A.', brand: 'Meyer', quantity: 2 },

  // Microfones
  { name: 'SM91B', category: 'Microfones', brand: 'Shure', quantity: 4 },
  { name: 'RE20', category: 'Microfones', brand: 'Electro-Voice', quantity: 3 },
  { name: 'SM98', category: 'Microfones', brand: 'Shure', quantity: 5 },
  { name: 'SM81', category: 'Microfones', brand: 'Shure', quantity: 8 },
  { name: 'KSM137', category: 'Microfones', brand: 'Shure', quantity: 4 },
  { name: 'KSM9', category: 'Microfones', brand: 'Shure', quantity: 3 },
  { name: 'SM87 Beta', category: 'Microfones', brand: 'Shure', quantity: 5 },
  { name: 'SM58', category: 'Microfones', brand: 'Shure', quantity: 12 },
  { name: 'SM57', category: 'Microfones', brand: 'Shure', quantity: 10 },
  { name: 'SM58 Beta', category: 'Microfones', brand: 'Shure', quantity: 3 },
  { name: 'SM57 Beta', category: 'Microfones', brand: 'Shure', quantity: 2 },
  { name: 'Neumann KM184', category: 'Microfones', brand: 'Neumann', quantity: 4 },
  { name: 'AKG D112', category: 'Microfones', brand: 'AKG', quantity: 3 },
  { name: 'AKG 418', category: 'Microfones', brand: 'AKG', quantity: 4 },
  { name: 'AKG C3000', category: 'Microfones', brand: 'AKG', quantity: 2 },
  { name: 'AKG 419/519', category: 'Microfones', brand: 'AKG', quantity: 3 },
  { name: 'Sennheiser E906', category: 'Microfones', brand: 'Sennheiser', quantity: 5 },
  { name: 'Sennheiser MD421', category: 'Microfones', brand: 'Sennheiser', quantity: 4 },
  { name: 'Sennheiser MD604', category: 'Microfones', brand: 'Sennheiser', quantity: 3 },
  { name: 'AKG 414', category: 'Microfones', brand: 'AKG', quantity: 2 },
  { name: 'PZM JTS', category: 'Microfones', brand: 'JTS', quantity: 4 },
  { name: 'Shotguns Sennheiser', category: 'Microfones', brand: 'Sennheiser', quantity: 3 },
  { name: 'Gooseneck Shure MX412', category: 'Microfones', brand: 'Shure', quantity: 6 },
  { name: 'Lapela MK2 Gold', category: 'Microfones', brand: 'Shure', quantity: 8 },
  { name: 'Headset PG30', category: 'Microfones', brand: 'Shure', quantity: 4 },
  { name: 'Countryman', category: 'Microfones', brand: 'Countryman', quantity: 6 },
  { name: 'Lapela 184', category: 'Microfones', brand: 'Shure', quantity: 5 },

  // Sistemas Sem Fio e In Ear
  { name: 'Rack Mic sem fio', category: 'Sistemas Sem Fio e In Ear', brand: 'Diversos', quantity: 2 },
  { name: 'Shure UR4D-CH14', category: 'Sistemas Sem Fio e In Ear', brand: 'Shure', quantity: 2 },
  { name: 'Hand UR4 SM87', category: 'Sistemas Sem Fio e In Ear', brand: 'Shure', quantity: 4 },
  { name: 'Antena omni', category: 'Sistemas Sem Fio e In Ear', brand: 'Diversos', quantity: 4 },
  { name: 'Rack QLXD/CH4', category: 'Sistemas Sem Fio e In Ear', brand: 'Shure', quantity: 2 },
  { name: 'Hand QLXD/SM86', category: 'Sistemas Sem Fio e In Ear', brand: 'Shure', quantity: 6 },
  { name: 'Body Pack ULXD', category: 'Sistemas Sem Fio e In Ear', brand: 'Shure', quantity: 8 },
  { name: 'Sennheiser G3/Hands', category: 'Sistemas Sem Fio e In Ear', brand: 'Sennheiser', quantity: 4 },
  { name: 'PSM600', category: 'Sistemas Sem Fio e In Ear', brand: 'Shure', quantity: 2 },
  { name: 'PSM900', category: 'Sistemas Sem Fio e In Ear', brand: 'Shure', quantity: 2 },
  { name: 'Fone E5', category: 'Sistemas Sem Fio e In Ear', brand: 'Shure', quantity: 8 },
  { name: 'Fone E3', category: 'Sistemas Sem Fio e In Ear', brand: 'Shure', quantity: 6 },
  { name: 'Fone SE535', category: 'Sistemas Sem Fio e In Ear', brand: 'Shure', quantity: 4 },
  { name: 'Fone K414', category: 'Sistemas Sem Fio e In Ear', brand: 'AKG', quantity: 3 },
  { name: 'Antena UA in Ear', category: 'Sistemas Sem Fio e In Ear', brand: 'Shure', quantity: 4 },
  { name: 'Antena UA870', category: 'Sistemas Sem Fio e In Ear', brand: 'Shure', quantity: 4 },
  { name: 'Antena H8089 Parabólica', category: 'Sistemas Sem Fio e In Ear', brand: 'Sennheiser', quantity: 2 },
  { name: 'Booster Sennheiser', category: 'Sistemas Sem Fio e In Ear', brand: 'Sennheiser', quantity: 1 },
  { name: 'Booster Shure', category: 'Sistemas Sem Fio e In Ear', brand: 'Shure', quantity: 1 },

  // Backline e Instrumentos
  { name: 'JCM900 Combo', category: 'Backline e Instrumentos', brand: 'Marshall', quantity: 1 },
  { name: 'Jazz Chorus', category: 'Backline e Instrumentos', brand: 'Roland', quantity: 1 },
  { name: 'Fender Twin Reverb', category: 'Backline e Instrumentos', brand: 'Fender', quantity: 1 },
  { name: 'GK800 Completo', category: 'Backline e Instrumentos', brand: 'Gallien-Krueger', quantity: 1 },
  { name: 'GK1001 Completo', category: 'Backline e Instrumentos', brand: 'Gallien-Krueger', quantity: 1 },
  { name: 'Bateria Pearl Preta', category: 'Backline e Instrumentos', brand: 'Pearl', quantity: 1 },
  { name: 'Estante de Caixa', category: 'Backline e Instrumentos', brand: 'Diversos', quantity: 3 },
  { name: 'Estante de Prato', category: 'Backline e Instrumentos', brand: 'Diversos', quantity: 3 },

  // Processadores e Periféricos
  { name: 'Galileo 616', category: 'Processadores e Periféricos', brand: 'Galileo', quantity: 1 },
  { name: 'Galileo 408', category: 'Processadores e Periféricos', brand: 'Galileo', quantity: 1 },
  { name: 'M-Audio 26/26', category: 'Processadores e Periféricos', brand: 'M-Audio', quantity: 1 },
  { name: 'M-Audio 410', category: 'Processadores e Periféricos', brand: 'M-Audio', quantity: 1 },
  { name: 'M-Audio Mob Pré', category: 'Processadores e Periféricos', brand: 'M-Audio', quantity: 2 },
  { name: 'Behringer ADA8000', category: 'Processadores e Periféricos', brand: 'Behringer', quantity: 2 },
  { name: 'Isolador 1U', category: 'Processadores e Periféricos', brand: 'Diversos', quantity: 2 },
  { name: 'Isolador 8U', category: 'Processadores e Periféricos', brand: 'Diversos', quantity: 1 },
  { name: 'Press Box', category: 'Processadores e Periféricos', brand: 'Diversos', quantity: 2 },
  { name: 'Lexicon PCM80', category: 'Processadores e Periféricos', brand: 'Lexicon', quantity: 1 },
  { name: 'SPX1000', category: 'Processadores e Periféricos', brand: 'Yamaha', quantity: 1 },
  { name: 'SPX900', category: 'Processadores e Periféricos', brand: 'Yamaha', quantity: 1 },
  { name: 'Dbx DDP', category: 'Processadores e Periféricos', brand: 'DBX', quantity: 1 },
  { name: 'Comp. BSS', category: 'Processadores e Periféricos', brand: 'BSS', quantity: 1 },
  { name: 'Gate BSS', category: 'Processadores e Periféricos', brand: 'BSS', quantity: 1 },
  { name: 'Pressonus', category: 'Processadores e Periféricos', brand: 'PreSonus', quantity: 1 },
  { name: 'Yamaha 2031', category: 'Processadores e Periféricos', brand: 'Yamaha', quantity: 1 },
  { name: 'COMP DBX160', category: 'Processadores e Periféricos', brand: 'DBX', quantity: 2 },
  { name: 'Avalon 737', category: 'Processadores e Periféricos', brand: 'Avalon', quantity: 1 },

  // Cabos e Conectividade
  { name: 'Cabo Cat5 75m', category: 'Cabos e Conectividade', brand: 'Diversos', quantity: 3 },
  { name: 'Multi-cabos', category: 'Cabos e Conectividade', brand: 'Diversos', quantity: 5 },
  { name: 'Sub Snake', category: 'Cabos e Conectividade', brand: 'Diversos', quantity: 2 },
  { name: 'Extensão W4/W4', category: 'Cabos e Conectividade', brand: 'Diversos', quantity: 4 },
  { name: 'Fan Outs', category: 'Cabos e Conectividade', brand: 'Diversos', quantity: 3 },
  { name: 'Super Tour Whirlwind', category: 'Cabos e Conectividade', brand: 'Whirlwind', quantity: 2 },
  { name: 'Speakon', category: 'Cabos e Conectividade', brand: 'Diversos', quantity: 10 },
  { name: 'Link XLR', category: 'Cabos e Conectividade', brand: 'Diversos', quantity: 8 },
  { name: 'Sinal 05m', category: 'Cabos e Conectividade', brand: 'Diversos', quantity: 15 },
  { name: 'Sinal 10m', category: 'Cabos e Conectividade', brand: 'Diversos', quantity: 12 },
  { name: 'Sinal 20m', category: 'Cabos e Conectividade', brand: 'Diversos', quantity: 8 },
  { name: 'Sinal 50m', category: 'Cabos e Conectividade', brand: 'Diversos', quantity: 4 },
  { name: 'Can-Lok 25m', category: 'Cabos e Conectividade', brand: 'Diversos', quantity: 3 },
  { name: 'Cabos Óticos', category: 'Cabos e Conectividade', brand: 'Diversos', quantity: 6 },
  { name: 'Cabo de Antena 10m', category: 'Cabos e Conectividade', brand: 'Diversos', quantity: 4 },
  { name: 'Cabo de Antena 05m', category: 'Cabos e Conectividade', brand: 'Diversos', quantity: 6 },

  // Energia e Distribuição
  { name: 'Main Reversor', category: 'Energia e Distribuição', brand: 'Diversos', quantity: 1 },
  { name: 'Sub M. Power 63AH', category: 'Energia e Distribuição', brand: 'Diversos', quantity: 1 },
  { name: 'Sub M. Power 150AH', category: 'Energia e Distribuição', brand: 'Diversos', quantity: 1 },
  { name: 'Main Power 5K', category: 'Energia e Distribuição', brand: 'Diversos', quantity: 1 },
  { name: 'Main Power 10K', category: 'Energia e Distribuição', brand: 'Diversos', quantity: 1 },
  { name: 'Maxi Power 1000', category: 'Energia e Distribuição', brand: 'Diversos', quantity: 2 },
  { name: 'Maxi Power 2000', category: 'Energia e Distribuição', brand: 'Diversos', quantity: 1 },
  { name: 'Caixa Steck', category: 'Energia e Distribuição', brand: 'Steck', quantity: 2 },
  { name: 'Prolongas 32A', category: 'Energia e Distribuição', brand: 'Diversos', quantity: 8 },
  { name: 'Canlock150A', category: 'Energia e Distribuição', brand: 'Diversos', quantity: 4 },
  { name: 'Rabichos', category: 'Energia e Distribuição', brand: 'Diversos', quantity: 10 },
  { name: 'Réguas AC', category: 'Energia e Distribuição', brand: 'Diversos', quantity: 6 },
  { name: 'AM 16A', category: 'Energia e Distribuição', brand: 'Diversos', quantity: 4 },
  { name: 'AM 32A', category: 'Energia e Distribuição', brand: 'Diversos', quantity: 4 },
  { name: 'Steck 32 Powercon', category: 'Energia e Distribuição', brand: 'Steck', quantity: 2 },
  { name: 'Tripolar Hubble', category: 'Energia e Distribuição', brand: 'Hubble', quantity: 2 },
  { name: 'Link Powercon', category: 'Energia e Distribuição', brand: 'Diversos', quantity: 6 },

  // Estruturas e Rigging
  { name: 'Yoke UPA', category: 'Estruturas e Rigging', brand: 'Meyer', quantity: 4 },
  { name: 'Manilha PQ', category: 'Estruturas e Rigging', brand: 'Diversos', quantity: 6 },
  { name: 'Garra G', category: 'Estruturas e Rigging', brand: 'Diversos', quantity: 8 },
  { name: 'Talha 10m', category: 'Estruturas e Rigging', brand: 'Diversos', quantity: 2 },
  { name: 'Cano 2m', category: 'Estruturas e Rigging', brand: 'Diversos', quantity: 12 },
  { name: 'Cinta Fly Talha', category: 'Estruturas e Rigging', brand: 'Diversos', quantity: 4 },
  { name: 'Grip Fly FZ', category: 'Estruturas e Rigging', brand: 'FZ', quantity: 4 },
  { name: 'Cabo de Aço', category: 'Estruturas e Rigging', brand: 'Diversos', quantity: 6 },
  { name: 'Cinta Catraca', category: 'Estruturas e Rigging', brand: 'Diversos', quantity: 8 },
  { name: 'Parafuso Q30', category: 'Estruturas e Rigging', brand: 'Diversos', quantity: 12 },
  { name: 'Manilha GRD', category: 'Estruturas e Rigging', brand: 'Diversos', quantity: 6 },
  { name: 'Gennie Nova 15m', category: 'Estruturas e Rigging', brand: 'Diversos', quantity: 1 },
  { name: 'Aranha MILO VM', category: 'Estruturas e Rigging', brand: 'Meyer', quantity: 4 },
  { name: 'Bumper Milo Original', category: 'Estruturas e Rigging', brand: 'Meyer', quantity: 4 },
  { name: 'Bumper Mina', category: 'Estruturas e Rigging', brand: 'Meyer', quantity: 2 },
  { name: 'Bumper KF', category: 'Estruturas e Rigging', brand: 'EAW', quantity: 2 },
  { name: 'Andaime 6m', category: 'Estruturas e Rigging', brand: 'Diversos', quantity: 2 },
  { name: 'Corda 30m', category: 'Estruturas e Rigging', brand: 'Diversos', quantity: 4 },
  { name: 'Cinta Segurança', category: 'Estruturas e Rigging', brand: 'Diversos', quantity: 6 },
  { name: 'Praticável Pantográfico', category: 'Estruturas e Rigging', brand: 'Diversos', quantity: 1 },
  { name: 'Suporte FZ205', category: 'Estruturas e Rigging', brand: 'FZ', quantity: 4 },

  // Acessórios e Diversos
  { name: 'Monitor LCD', category: 'Acessórios e Diversos', brand: 'Diversos', quantity: 2 },
  { name: 'Microfone DPA4007', category: 'Acessórios e Diversos', brand: 'DPA', quantity: 2 },
  { name: 'Analisador de Espectro', category: 'Acessórios e Diversos', brand: 'Diversos', quantity: 1 },
  { name: 'SoundGrid/Digico', category: 'Acessórios e Diversos', brand: 'Digico', quantity: 1 },
  { name: 'Digico Rack', category: 'Acessórios e Diversos', brand: 'Digico', quantity: 1 },
  { name: 'Setup Intercom', category: 'Acessórios e Diversos', brand: 'Clearcom', quantity: 2 },
  { name: 'Fone Intercom', category: 'Acessórios e Diversos', brand: 'Clearcom', quantity: 8 },
  { name: 'Clearcom Sem Fio', category: 'Acessórios e Diversos', brand: 'Clearcom', quantity: 4 },
  { name: 'Roteador Wi-Fi', category: 'Acessórios e Diversos', brand: 'Diversos', quantity: 2 },
  { name: 'LOA TOP PRÉ', category: 'Acessórios e Diversos', brand: 'Diversos', quantity: 2 },
  { name: 'Decoder Gefen', category: 'Acessórios e Diversos', brand: 'Gefen', quantity: 2 },
  { name: 'Adaptadores ABNT', category: 'Acessórios e Diversos', brand: 'Diversos', quantity: 10 },
  { name: 'D.I Countryman', category: 'Acessórios e Diversos', brand: 'Countryman', quantity: 6 },
  { name: 'D.I IMP2', category: 'Acessórios e Diversos', brand: 'Radial', quantity: 4 },
  { name: 'D.I Radial', category: 'Acessórios e Diversos', brand: 'Radial', quantity: 4 },
  { name: 'Pedestal Girafa K&M', category: 'Acessórios e Diversos', brand: 'K&M', quantity: 8 },
  { name: 'Pedestal Pequeno', category: 'Acessórios e Diversos', brand: 'Diversos', quantity: 6 },
  { name: 'Tripé', category: 'Acessórios e Diversos', brand: 'Diversos', quantity: 4 },
  { name: 'Garra LP', category: 'Acessórios e Diversos', brand: 'Diversos', quantity: 8 },
  { name: 'Luminária', category: 'Acessórios e Diversos', brand: 'Diversos', quantity: 6 },
  { name: 'Fita Isolante', category: 'Acessórios e Diversos', brand: 'Diversos', quantity: 20 },
  { name: 'Black Tape', category: 'Acessórios e Diversos', brand: 'Diversos', quantity: 15 },
  { name: 'Silver Tape', category: 'Acessórios e Diversos', brand: 'Diversos', quantity: 10 },
  { name: 'Fita Crepe', category: 'Acessórios e Diversos', brand: 'Diversos', quantity: 15 },
  { name: 'Pacote Hellerman', category: 'Acessórios e Diversos', brand: 'Hellerman', quantity: 10 },
];

export async function seedEquipments(supabase: SupabaseClient) {
  try {
    console.log('🌱 Iniciando seed de equipamentos...');

    // Primeiro criar as categorias se não existirem
    const categories = Array.from(new Set(EQUIPAMENTOS_SEED.map((e) => e.category)));

    for (const category of categories) {
      const { data: existing } = await supabase
        .from('categories')
        .select('id')
        .eq('name', category)
        .single();

      if (!existing) {
        await supabase.from('categories').insert({ name: category });
      }
    }

    // Buscar os IDs das categorias
    const { data: categoryData } = await supabase.from('categories').select('id, name');
    const categoryMap = new Map(categoryData?.map((c) => [c.name, c.id]) || []);

    // Preparar dados dos equipamentos
    const equipmentsToInsert = EQUIPAMENTOS_SEED.map((eq) => ({
      name: eq.name,
      brand: eq.brand,
      quantity: eq.quantity,
      available_qty: eq.quantity,
      status: 'ativo',
      category_id: categoryMap.get(eq.category),
    }));

    // Inserir equipamentos em chunks para evitar erro de payload muito grande
    const chunkSize = 50;
    for (let i = 0; i < equipmentsToInsert.length; i += chunkSize) {
      const chunk = equipmentsToInsert.slice(i, i + chunkSize);
      const { error } = await supabase.from('equipments').insert(chunk);

      if (error) {
        console.error(`❌ Erro ao inserir chunk ${i / chunkSize + 1}:`, error);
        throw error;
      }

      console.log(`✅ Inserted ${Math.min(chunkSize, equipmentsToInsert.length - i)} equipments`);
    }

    console.log(`✅ Seed concluído! ${equipmentsToInsert.length} equipamentos inseridos.`);
    return true;
  } catch (error) {
    console.error('❌ Erro durante seed:', error);
    throw error;
  }
}
