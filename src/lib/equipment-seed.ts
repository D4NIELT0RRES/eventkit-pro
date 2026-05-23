import { supabase } from '@/integrations/supabase/client';

// 14 categorias conforme o layout de OS
const CATEGORIES = [
  { name: 'Consoles', slug: 'consoles', icon: 'Sliders', color: '#3b82f6' },
  { name: 'Caixas de Som', slug: 'caixas-de-som', icon: 'Speaker', color: '#8b5cf6' },
  { name: 'Rack / Amplificadores', slug: 'rack-amplificadores', icon: 'Zap', color: '#f59e0b' },
  { name: 'Microfones', slug: 'microfones', icon: 'Mic', color: '#22c55e' },
  { name: 'Mic Sem Fio / IEM', slug: 'mic-sem-fio-iem', icon: 'Radio', color: '#10b981' },
  { name: 'AC / Energia', slug: 'ac-energia', icon: 'Plug', color: '#ef4444' },
  { name: 'Cabos AC / Speakers / Sinal', slug: 'cabos-ac-speakers-sinal', icon: 'Cable', color: '#64748b' },
  { name: 'Multi-Cabos / Sub Snake', slug: 'multi-cabos-sub-snake', icon: 'Network', color: '#0ea5e9' },
  { name: 'Periféricos / Processadores', slug: 'perifericos-processadores', icon: 'Cpu', color: '#a855f7' },
  { name: 'DJ / Playback', slug: 'dj-playback', icon: 'Disc3', color: '#06b6d4' },
  { name: 'Back Line', slug: 'back-line', icon: 'Guitar', color: '#f97316' },
  { name: 'Estrutura / Rigging', slug: 'estrutura-rigging', icon: 'Anchor', color: '#a855f7' },
  { name: 'Acessórios / Suportes', slug: 'acessorios-suportes', icon: 'Package', color: '#94a3b8' },
  { name: 'Consumíveis / Fitas', slug: 'consumiveis-fitas', icon: 'Scissors', color: '#737373' },
];

// Todos os equipamentos mapeados por slug de categoria
const EQUIPMENT_SEED: { name: string; slug: string; qty: number }[] = [
  // CONSOLES
  { name: 'Digico 338', slug: 'consoles', qty: 0 },
  { name: 'Digico SD9', slug: 'consoles', qty: 1 },
  { name: 'Yamaha Rivage PM5', slug: 'consoles', qty: 0 },
  { name: 'Yamaha PM5D RH', slug: 'consoles', qty: 1 },
  { name: 'Yamaha DM7', slug: 'consoles', qty: 0 },
  { name: 'Yamaha DM3', slug: 'consoles', qty: 0 },
  { name: 'Yamaha CL5', slug: 'consoles', qty: 0 },
  { name: 'Yamaha CL3', slug: 'consoles', qty: 5 },
  { name: 'Yamaha CL1', slug: 'consoles', qty: 0 },
  { name: 'Yamaha TF5', slug: 'consoles', qty: 0 },
  { name: 'Yamaha TF3', slug: 'consoles', qty: 0 },
  { name: 'Yamaha TF1', slug: 'consoles', qty: 0 },
  { name: 'Yamaha TF1 Rack', slug: 'consoles', qty: 0 },
  { name: 'Yamaha M7CL', slug: 'consoles', qty: 0 },
  { name: 'Yamaha LS9', slug: 'consoles', qty: 0 },
  { name: 'Yamaha 01v 96', slug: 'consoles', qty: 1 },
  { name: 'Yamaha MG166', slug: 'consoles', qty: 0 },
  { name: 'Behringer X32', slug: 'consoles', qty: 0 },
  { name: 'Digidesign Venue', slug: 'consoles', qty: 0 },
  { name: 'Midas 24', slug: 'consoles', qty: 0 },
  { name: 'Behringer 12', slug: 'consoles', qty: 0 },
  { name: 'Phonic 12', slug: 'consoles', qty: 0 },
  { name: 'Phonic 08', slug: 'consoles', qty: 0 },

  // CAIXAS DE SOM
  { name: 'D&B T10', slug: 'caixas-de-som', qty: 0 },
  { name: 'D&B B6', slug: 'caixas-de-som', qty: 0 },
  { name: 'D&B T-Sub', slug: 'caixas-de-som', qty: 0 },
  { name: 'L-Acoustic Kiva', slug: 'caixas-de-som', qty: 0 },
  { name: 'L-Acoustic', slug: 'caixas-de-som', qty: 0 },
  { name: 'Meyer UPA-1P/DLY', slug: 'caixas-de-som', qty: 0 },
  { name: 'Meyer UPM-1P/RT', slug: 'caixas-de-som', qty: 0 },
  { name: 'Meyer UPJunior/FRT', slug: 'caixas-de-som', qty: 0 },
  { name: 'Meyer MILO', slug: 'caixas-de-som', qty: 8 },
  { name: 'Meyer Mina / P.A. Stack', slug: 'caixas-de-som', qty: 0 },
  { name: 'Meyer CQ1', slug: 'caixas-de-som', qty: 2 },
  { name: 'Meyer MSL-2', slug: 'caixas-de-som', qty: 0 },
  { name: 'Meyer MSL-2A', slug: 'caixas-de-som', qty: 0 },
  { name: 'Meyer MSW', slug: 'caixas-de-som', qty: 0 },
  { name: 'Meyer MSW-2A', slug: 'caixas-de-som', qty: 0 },
  { name: 'Meyer HP 700 / Subs', slug: 'caixas-de-som', qty: 0 },
  { name: 'Meyer HP 700', slug: 'caixas-de-som', qty: 4 },
  { name: 'Meyer MM4', slug: 'caixas-de-som', qty: 0 },
  { name: 'Meyer MM-4 / Fonte', slug: 'caixas-de-som', qty: 4 },
  { name: 'Meyer lFC-1100', slug: 'caixas-de-som', qty: 0 },
  { name: 'Behringer EUROLIVE', slug: 'caixas-de-som', qty: 2 },
  { name: 'EAW KF850-VM', slug: 'caixas-de-som', qty: 0 },
  { name: 'EAW SB850', slug: 'caixas-de-som', qty: 0 },
  { name: 'EAW LA325', slug: 'caixas-de-som', qty: 0 },
  { name: 'EAW SUB LA118A', slug: 'caixas-de-som', qty: 0 },
  { name: 'FZ 102/RT', slug: 'caixas-de-som', qty: 5 },
  { name: 'FZ102 HPA / P.A', slug: 'caixas-de-som', qty: 6 },
  { name: 'FZ 18A Sub', slug: 'caixas-de-som', qty: 2 },
  { name: 'FZ108/DLY', slug: 'caixas-de-som', qty: 2 },
  { name: 'FZ 205/Copo', slug: 'caixas-de-som', qty: 0 },
  { name: 'FZ 205/Alça', slug: 'caixas-de-som', qty: 0 },
  { name: 'EV-1502', slug: 'caixas-de-som', qty: 0 },

  // RACK / AMPLIFICADORES
  { name: 'P6 HW', slug: 'rack-amplificadores', qty: 0 },
  { name: 'KF-MX800', slug: 'rack-amplificadores', qty: 0 },
  { name: 'MSL', slug: 'rack-amplificadores', qty: 0 },
  { name: 'UPA Stereo', slug: 'rack-amplificadores', qty: 0 },
  { name: 'UPM', slug: 'rack-amplificadores', qty: 0 },
  { name: '4 Multi', slug: 'rack-amplificadores', qty: 0 },
  { name: 'Lab Gruppen / com cabo', slug: 'rack-amplificadores', qty: 0 },

  // MICROFONES
  { name: 'Shure SM91B', slug: 'microfones', qty: 1 },
  { name: 'Shure RE 20', slug: 'microfones', qty: 0 },
  { name: 'Shure SM 98', slug: 'microfones', qty: 4 },
  { name: 'Shure SM 81', slug: 'microfones', qty: 2 },
  { name: 'Shure KSM 137', slug: 'microfones', qty: 1 },
  { name: 'Shure KSM 9', slug: 'microfones', qty: 0 },
  { name: 'Shure SM 87 Beta', slug: 'microfones', qty: 0 },
  { name: 'Shure SM 58', slug: 'microfones', qty: 0 },
  { name: 'Shure SM 57', slug: 'microfones', qty: 4 },
  { name: 'Shure SM 58 Beta', slug: 'microfones', qty: 6 },
  { name: 'Shure SM 57 Beta', slug: 'microfones', qty: 0 },
  { name: 'Neumann KM184', slug: 'microfones', qty: 3 },
  { name: 'AKG D 112', slug: 'microfones', qty: 0 },
  { name: 'AKG 418', slug: 'microfones', qty: 0 },
  { name: 'AKG C3000', slug: 'microfones', qty: 0 },
  { name: 'AKG 419/519', slug: 'microfones', qty: 0 },
  { name: 'AKG 414', slug: 'microfones', qty: 0 },
  { name: 'Sennheiser E 906', slug: 'microfones', qty: 0 },
  { name: 'Sennheiser MD 421', slug: 'microfones', qty: 0 },
  { name: 'Sennheiser MD 604', slug: 'microfones', qty: 3 },
  { name: 'Shotgun Sennheiser', slug: 'microfones', qty: 0 },
  { name: 'Gooseneck Shure MX412', slug: 'microfones', qty: 0 },
  { name: 'Lapela MK2 Gold', slug: 'microfones', qty: 0 },
  { name: 'Head Set PG30', slug: 'microfones', qty: 0 },
  { name: 'Countryman', slug: 'microfones', qty: 0 },
  { name: 'Lapela 184', slug: 'microfones', qty: 0 },
  { name: 'PZM JTS', slug: 'microfones', qty: 0 },

  // MIC SEM FIO / IEM
  { name: 'Shure UR4D-CH14', slug: 'mic-sem-fio-iem', qty: 4 },
  { name: 'Hand UR4 SM87', slug: 'mic-sem-fio-iem', qty: 0 },
  { name: 'Antena Omni', slug: 'mic-sem-fio-iem', qty: 2 },
  { name: 'Cachimbo', slug: 'mic-sem-fio-iem', qty: 0 },
  { name: 'Rack QLXD/CH4', slug: 'mic-sem-fio-iem', qty: 1 },
  { name: 'Hand QLXD/SM86', slug: 'mic-sem-fio-iem', qty: 4 },
  { name: 'Body Pack ULXD', slug: 'mic-sem-fio-iem', qty: 0 },
  { name: 'Splitter BNC/T', slug: 'mic-sem-fio-iem', qty: 0 },
  { name: 'Sennheiser G3 / Hands', slug: 'mic-sem-fio-iem', qty: 0 },
  { name: 'PSM 600', slug: 'mic-sem-fio-iem', qty: 0 },
  { name: 'PSM 900', slug: 'mic-sem-fio-iem', qty: 4 },
  { name: 'Fone Shure E5', slug: 'mic-sem-fio-iem', qty: 4 },
  { name: 'Fone Shure E3', slug: 'mic-sem-fio-iem', qty: 0 },
  { name: 'Fone Shure SE535', slug: 'mic-sem-fio-iem', qty: 0 },
  { name: 'Fone AKG K 414', slug: 'mic-sem-fio-iem', qty: 2 },
  { name: 'Fone Koss Porta Pro', slug: 'mic-sem-fio-iem', qty: 0 },

  // AC / ENERGIA
  { name: 'Main Reversor', slug: 'ac-energia', qty: 3 },
  { name: 'Sub Main Power 63AH', slug: 'ac-energia', qty: 0 },
  { name: 'Sub Main Power 150AH', slug: 'ac-energia', qty: 0 },
  { name: 'Main Power 5k DT/N1', slug: 'ac-energia', qty: 1 },
  { name: 'Main Power 5k', slug: 'ac-energia', qty: 0 },
  { name: 'Main Power 10k', slug: 'ac-energia', qty: 0 },
  { name: 'Maxi Power 1000', slug: 'ac-energia', qty: 0 },
  { name: 'Maxi Power 2000', slug: 'ac-energia', qty: 0 },
  { name: 'Caixa Steck 32x32A', slug: 'ac-energia', qty: 0 },
  { name: 'Caixa Steck 32x16A', slug: 'ac-energia', qty: 1 },
  { name: 'Steck Back to Back 63', slug: 'ac-energia', qty: 0 },
  { name: 'Prol. 32A 110v - 50m', slug: 'ac-energia', qty: 0 },
  { name: 'Prol. 32A 110v - 25m', slug: 'ac-energia', qty: 1 },
  { name: 'Prol. 32A 220v - 25m', slug: 'ac-energia', qty: 2 },
  { name: 'Prol. 32A 220v - 50m', slug: 'ac-energia', qty: 1 },
  { name: 'Prol. 32A 220v - 5m', slug: 'ac-energia', qty: 0 },
  { name: 'Prolonga 63A - 25m', slug: 'ac-energia', qty: 0 },
  { name: 'Canlock 150A 25m', slug: 'ac-energia', qty: 0 },
  { name: 'Rabicho Tripolar', slug: 'ac-energia', qty: 0 },
  { name: 'Rabicho 32A', slug: 'ac-energia', qty: 1 },
  { name: 'Rabicho 63A', slug: 'ac-energia', qty: 0 },
  { name: 'PP Amarela 10m', slug: 'ac-energia', qty: 8 },
  { name: 'PP Vermelho 20m', slug: 'ac-energia', qty: 10 },
  { name: 'Régua AC Pial PQ', slug: 'ac-energia', qty: 2 },
  { name: 'Régua AC Pial GRD', slug: 'ac-energia', qty: 2 },
  { name: 'Régua AM 16A PQ', slug: 'ac-energia', qty: 2 },
  { name: 'Régua AM 16A GRD', slug: 'ac-energia', qty: 2 },
  { name: 'Régua AZ 32A', slug: 'ac-energia', qty: 2 },
  { name: 'Régua AM 32A', slug: 'ac-energia', qty: 0 },

  // CABOS AC / SPEAKERS / SINAL
  { name: 'Steck 32 - 3 Powercon', slug: 'cabos-ac-speakers-sinal', qty: 0 },
  { name: 'Steck 32 - 2 Powercon', slug: 'cabos-ac-speakers-sinal', qty: 0 },
  { name: 'Steck 32 - 3 Hubble', slug: 'cabos-ac-speakers-sinal', qty: 0 },
  { name: 'Tripolar - Hubble 20F', slug: 'cabos-ac-speakers-sinal', qty: 0 },
  { name: 'Tripolar - Powercon', slug: 'cabos-ac-speakers-sinal', qty: 0 },
  { name: 'Hubble 20A - 20m', slug: 'cabos-ac-speakers-sinal', qty: 0 },
  { name: 'Link Powercon 3M', slug: 'cabos-ac-speakers-sinal', qty: 4 },
  { name: 'Link Powercon PQ', slug: 'cabos-ac-speakers-sinal', qty: 0 },
  { name: 'KF 10M', slug: 'cabos-ac-speakers-sinal', qty: 0 },
  { name: 'KF 25M', slug: 'cabos-ac-speakers-sinal', qty: 0 },
  { name: 'SB 20M', slug: 'cabos-ac-speakers-sinal', qty: 0 },
  { name: 'SB 10M', slug: 'cabos-ac-speakers-sinal', qty: 0 },
  { name: 'Link XLR', slug: 'cabos-ac-speakers-sinal', qty: 6 },
  { name: 'Sinal 05m', slug: 'cabos-ac-speakers-sinal', qty: 10 },
  { name: 'Sinal 10m', slug: 'cabos-ac-speakers-sinal', qty: 30 },
  { name: 'Sinal 20m', slug: 'cabos-ac-speakers-sinal', qty: 10 },
  { name: 'Sinal 50m', slug: 'cabos-ac-speakers-sinal', qty: 0 },
  { name: 'Speakon 05m', slug: 'cabos-ac-speakers-sinal', qty: 0 },
  { name: 'Speakon 10m', slug: 'cabos-ac-speakers-sinal', qty: 0 },
  { name: 'Speakon 20m', slug: 'cabos-ac-speakers-sinal', qty: 0 },
  { name: 'Speakon 50m', slug: 'cabos-ac-speakers-sinal', qty: 0 },
  { name: 'Can-Lok 25M', slug: 'cabos-ac-speakers-sinal', qty: 0 },

  // MULTI-CABOS / SUB SNAKE
  { name: 'Multi 12 vias 50m', slug: 'multi-cabos-sub-snake', qty: 0 },
  { name: 'Multi 20 vias 70m', slug: 'multi-cabos-sub-snake', qty: 0 },
  { name: 'Multi 27 vias c/ Split 30m', slug: 'multi-cabos-sub-snake', qty: 1 },
  { name: 'Multi 56 vias c/ Split 70m', slug: 'multi-cabos-sub-snake', qty: 1 },
  { name: 'Extensão W4/W4 - 15M', slug: 'multi-cabos-sub-snake', qty: 0 },
  { name: 'Extensão W4/W4 - 100M', slug: 'multi-cabos-sub-snake', qty: 0 },
  { name: 'Fan Outs / 58V', slug: 'multi-cabos-sub-snake', qty: 0 },
  { name: 'Super Tour Whirlwind Setup', slug: 'multi-cabos-sub-snake', qty: 0 },
  { name: 'Chuveirinho 2M', slug: 'multi-cabos-sub-snake', qty: 0 },
  { name: 'Chuveirinho 15M', slug: 'multi-cabos-sub-snake', qty: 0 },
  { name: 'Bandeja 15m', slug: 'multi-cabos-sub-snake', qty: 3 },
  { name: 'Bandeja Multi-pino 12V/AF', slug: 'multi-cabos-sub-snake', qty: 0 },
  { name: 'Multi-pino 12V/AF x XLR', slug: 'multi-cabos-sub-snake', qty: 0 },
  { name: 'Multi-pino 12V/W1 x W1', slug: 'multi-cabos-sub-snake', qty: 0 },

  // PERIFÉRICOS / PROCESSADORES
  { name: 'Galileo 616', slug: 'perifericos-processadores', qty: 1 },
  { name: 'Galileo 408', slug: 'perifericos-processadores', qty: 0 },
  { name: 'M-Audio 26/26', slug: 'perifericos-processadores', qty: 0 },
  { name: 'M-Audio 410', slug: 'perifericos-processadores', qty: 1 },
  { name: 'M-Audio Mob Pré', slug: 'perifericos-processadores', qty: 0 },
  { name: 'Behringer ADA 8000', slug: 'perifericos-processadores', qty: 1 },
  { name: 'Isolador 1U', slug: 'perifericos-processadores', qty: 2 },
  { name: 'Isolador 8U', slug: 'perifericos-processadores', qty: 0 },
  { name: 'Press Box', slug: 'perifericos-processadores', qty: 0 },
  { name: 'Lexicon PCM 80', slug: 'perifericos-processadores', qty: 0 },
  { name: 'SPX 1000', slug: 'perifericos-processadores', qty: 0 },
  { name: 'SPX 900', slug: 'perifericos-processadores', qty: 0 },
  { name: 'DBX DDP', slug: 'perifericos-processadores', qty: 0 },
  { name: 'Comp. BSS', slug: 'perifericos-processadores', qty: 0 },
  { name: 'Gate BSS', slug: 'perifericos-processadores', qty: 0 },
  { name: 'Presonus', slug: 'perifericos-processadores', qty: 0 },
  { name: 'Yamaha 2031', slug: 'perifericos-processadores', qty: 0 },
  { name: 'Comp DBX 160', slug: 'perifericos-processadores', qty: 0 },
  { name: 'Avalon 737', slug: 'perifericos-processadores', qty: 1 },
  { name: 'Adaptadores ABNT', slug: 'perifericos-processadores', qty: 4 },

  // DJ / PLAYBACK
  { name: 'Pioneer DJM 800', slug: 'dj-playback', qty: 0 },
  { name: 'Pioneer DJM 600', slug: 'dj-playback', qty: 1 },
  { name: 'Pioneer DJM 500', slug: 'dj-playback', qty: 0 },
  { name: 'Pioneer CDJ 1000', slug: 'dj-playback', qty: 0 },
  { name: 'Pioneer CDJ 400', slug: 'dj-playback', qty: 0 },
  { name: 'Pioneer CDJ 200', slug: 'dj-playback', qty: 2 },
  { name: 'Technics MKII', slug: 'dj-playback', qty: 0 },
  { name: 'Denon 2300', slug: 'dj-playback', qty: 0 },
  { name: 'CD Stanton', slug: 'dj-playback', qty: 0 },
  { name: 'DVD / Pen Drive', slug: 'dj-playback', qty: 0 },
  { name: 'Monitor 13"', slug: 'dj-playback', qty: 0 },
  { name: 'Decoder Gefen', slug: 'dj-playback', qty: 0 },

  // BACK LINE
  { name: 'Marshall JCM 900 Combo', slug: 'back-line', qty: 0 },
  { name: 'Jazz Chorus', slug: 'back-line', qty: 0 },
  { name: 'Fender Twin Reverb', slug: 'back-line', qty: 2 },
  { name: 'GK 800 Completo', slug: 'back-line', qty: 1 },
  { name: 'GK 1001 Completo', slug: 'back-line', qty: 0 },
  { name: 'Bateria Pearl Preta', slug: 'back-line', qty: 1 },
  { name: 'Estante de Caixa / Extra', slug: 'back-line', qty: 0 },
  { name: 'Estante de Prato / Extra', slug: 'back-line', qty: 2 },

  // ESTRUTURA / RIGGING
  { name: 'Yoke UPA', slug: 'estrutura-rigging', qty: 0 },
  { name: 'Manilha PQ', slug: 'estrutura-rigging', qty: 0 },
  { name: 'Manilha GRD', slug: 'estrutura-rigging', qty: 0 },
  { name: 'Garra G', slug: 'estrutura-rigging', qty: 0 },
  { name: 'Garra LP', slug: 'estrutura-rigging', qty: 2 },
  { name: 'Talha 10mts', slug: 'estrutura-rigging', qty: 0 },
  { name: 'Cano de 2MTS', slug: 'estrutura-rigging', qty: 0 },
  { name: 'Cano Sup. Caixa', slug: 'estrutura-rigging', qty: 2 },
  { name: 'Cinta Fly Talha 5MTS', slug: 'estrutura-rigging', qty: 0 },
  { name: 'Cinta Catraca PQ', slug: 'estrutura-rigging', qty: 0 },
  { name: 'Cinta Segurança', slug: 'estrutura-rigging', qty: 0 },
  { name: 'Grip Flyt FZ', slug: 'estrutura-rigging', qty: 0 },
  { name: 'Cabo de Aço PQ', slug: 'estrutura-rigging', qty: 0 },
  { name: 'Parafuso Q30', slug: 'estrutura-rigging', qty: 0 },
  { name: 'Gennie Nova 15MTS', slug: 'estrutura-rigging', qty: 0 },
  { name: 'Aranha MILO VM', slug: 'estrutura-rigging', qty: 2 },
  { name: 'Bumper Milo Original', slug: 'estrutura-rigging', qty: 0 },
  { name: 'Bumper Mina', slug: 'estrutura-rigging', qty: 0 },
  { name: 'Bumper KF', slug: 'estrutura-rigging', qty: 0 },
  { name: 'Andaime 6 MT', slug: 'estrutura-rigging', qty: 0 },
  { name: 'Corda 30MTS', slug: 'estrutura-rigging', qty: 0 },
  { name: 'Capacete', slug: 'estrutura-rigging', qty: 0 },
  { name: 'Barraca com Lona Lateral', slug: 'estrutura-rigging', qty: 0 },
  { name: 'Praticável Pantográfico', slug: 'estrutura-rigging', qty: 0 },
  { name: 'Lona Azul', slug: 'estrutura-rigging', qty: 0 },
  { name: 'Trava / Chave', slug: 'estrutura-rigging', qty: 0 },
  { name: 'Suporte FZ205', slug: 'estrutura-rigging', qty: 0 },
  { name: 'Gaveteiro GRD', slug: 'estrutura-rigging', qty: 0 },
  { name: 'Gaveteiro Milo', slug: 'estrutura-rigging', qty: 0 },
  { name: 'Gaveteiro Melodie', slug: 'estrutura-rigging', qty: 0 },

  // ACESSÓRIOS / SUPORTES
  { name: 'Sim 3', slug: 'acessorios-suportes', qty: 1 },
  { name: 'Monitor LCD', slug: 'acessorios-suportes', qty: 1 },
  { name: 'Microfone DPA 4007', slug: 'acessorios-suportes', qty: 0 },
  { name: 'Analisador de Espectro', slug: 'acessorios-suportes', qty: 0 },
  { name: 'SoundGrid / Digico', slug: 'acessorios-suportes', qty: 0 },
  { name: 'Digico Drack', slug: 'acessorios-suportes', qty: 0 },
  { name: 'Cabo Cat5 - 75m', slug: 'acessorios-suportes', qty: 2 },
  { name: 'Setup Intercom', slug: 'acessorios-suportes', qty: 1 },
  { name: 'Fone Intercom', slug: 'acessorios-suportes', qty: 4 },
  { name: 'Clearcom Sem Fio', slug: 'acessorios-suportes', qty: 0 },
  { name: 'Fita Métrica', slug: 'acessorios-suportes', qty: 0 },
  { name: 'Nível', slug: 'acessorios-suportes', qty: 0 },
  { name: 'Passa Cabo', slug: 'acessorios-suportes', qty: 0 },
  { name: 'Can Lock X Terminal', slug: 'acessorios-suportes', qty: 5 },
  { name: 'CAN LOCK 25MTS', slug: 'acessorios-suportes', qty: 5 },
  { name: 'Cabos Óticos', slug: 'acessorios-suportes', qty: 2 },
  { name: 'Technics MK2', slug: 'acessorios-suportes', qty: 0 },
  { name: 'Shells e Agulhas', slug: 'acessorios-suportes', qty: 0 },
  { name: 'Luminária', slug: 'acessorios-suportes', qty: 0 },
  { name: 'Back to Back - Speakon', slug: 'acessorios-suportes', qty: 0 },
  { name: 'D.I. Countryman', slug: 'acessorios-suportes', qty: 6 },
  { name: 'D.I. IMP2', slug: 'acessorios-suportes', qty: 0 },
  { name: 'D.I. Radial', slug: 'acessorios-suportes', qty: 0 },
  { name: 'Pedestal Girafa K&M', slug: 'acessorios-suportes', qty: 12 },
  { name: 'Pedestal Pequeno', slug: 'acessorios-suportes', qty: 4 },
  { name: 'Tripé', slug: 'acessorios-suportes', qty: 8 },
  { name: 'Roteador Wi-Fi', slug: 'acessorios-suportes', qty: 0 },
  { name: 'Antena UA In Ear', slug: 'acessorios-suportes', qty: 1 },
  { name: 'Antena UA870 Direcional', slug: 'acessorios-suportes', qty: 2 },
  { name: 'Antena H8089 Parabólica', slug: 'acessorios-suportes', qty: 0 },
  { name: 'Cabo de Antena 10m', slug: 'acessorios-suportes', qty: 3 },
  { name: 'Cabo de Antena 5m', slug: 'acessorios-suportes', qty: 0 },
  { name: 'Booster Sennheiser', slug: 'acessorios-suportes', qty: 0 },
  { name: 'Booster Shure', slug: 'acessorios-suportes', qty: 0 },
  { name: 'Pedestal Mesa', slug: 'acessorios-suportes', qty: 0 },
  { name: 'Adapt. RCA x XLR(M) Stereo', slug: 'acessorios-suportes', qty: 2 },
  { name: 'Adapt. P10 x XLR(M)', slug: 'acessorios-suportes', qty: 4 },
  { name: 'Adapt. P10 x P10', slug: 'acessorios-suportes', qty: 6 },
  { name: 'Splitter A/C', slug: 'acessorios-suportes', qty: 12 },

  // CONSUMÍVEIS / FITAS
  { name: 'Cartela 2 Pilhas AA', slug: 'consumiveis-fitas', qty: 12 },
  { name: 'Cartela 2 Pilhas AA Usadas', slug: 'consumiveis-fitas', qty: 12 },
  { name: 'Bateria 9V Nova', slug: 'consumiveis-fitas', qty: 0 },
  { name: 'Bateria 9V Usada', slug: 'consumiveis-fitas', qty: 0 },
  { name: 'Black Tape', slug: 'consumiveis-fitas', qty: 2 },
  { name: 'Silver Tape', slug: 'consumiveis-fitas', qty: 2 },
  { name: 'Fita Crepe', slug: 'consumiveis-fitas', qty: 1 },
  { name: 'Pacote Hellerman GRD', slug: 'consumiveis-fitas', qty: 1 },
  { name: 'Fita Isolante', slug: 'consumiveis-fitas', qty: 4 },
  { name: 'Fita Isolante Amarela', slug: 'consumiveis-fitas', qty: 2 },
  { name: 'Fita Isolante Branca', slug: 'consumiveis-fitas', qty: 2 },
];

export async function runEquipmentSeed(): Promise<{ inserted: number; errors: string[] }> {
  const errors: string[] = [];
  let inserted = 0;

  // 1. Upsert categorias
  const { data: catData, error: catError } = await supabase
    .from('categories')
    .upsert(CATEGORIES, { onConflict: 'slug' })
    .select('id, slug');

  if (catError) {
    errors.push('Categorias: ' + catError.message);
    return { inserted, errors };
  }

  const catMap = new Map((catData ?? []).map((c: any) => [c.slug, c.id]));

  // 2. Busca equipamentos já existentes para evitar duplicatas
  const { data: existing } = await supabase
    .from('equipments')
    .select('name, category_id');
  const existingSet = new Set(
    (existing ?? []).map((e: any) => `${e.name}||${e.category_id}`)
  );

  // 3. Insere equipamentos que não existem ainda
  const toInsert = EQUIPMENT_SEED
    .map(({ name, slug, qty }) => {
      const catId = catMap.get(slug);
      if (!catId) return null;
      if (existingSet.has(`${name}||${catId}`)) return null;
      return {
        name,
        category_id: catId,
        quantity: qty,
        available_qty: qty,
        status: 'disponivel' as const,
      };
    })
    .filter(Boolean) as any[];

  if (toInsert.length === 0) {
    return { inserted: 0, errors: [] };
  }

  // Insere em chunks de 50 para evitar timeout
  for (let i = 0; i < toInsert.length; i += 50) {
    const chunk = toInsert.slice(i, i + 50);
    const { data: insData, error: insError } = await supabase
      .from('equipments')
      .insert(chunk)
      .select('id, quantity, available_qty');

    if (insError) {
      errors.push(insError.message);
      continue;
    }

    inserted += chunk.length;

    // Inicializa stock_levels para cada equipamento inserido
    if (insData && insData.length > 0) {
      const stockRows = insData.map((eq: any) => ({
        equipment_id: eq.id,
        total_stock: eq.quantity ?? 0,
        available_stock: eq.available_qty ?? 0,
        reserved_stock: 0,
      }));
      await (supabase as any)
        .from('stock_levels')
        .upsert(stockRows, { onConflict: 'equipment_id' });
    }
  }

  return { inserted, errors };
}
