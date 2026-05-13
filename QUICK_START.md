# 🎯 GUIA RÁPIDO - Populating Database & Using the System

## ⚡ Quick Start - 5 Minutos

### Passo 1: Popular o Banco de Dados

1. **Abra Supabase Dashboard:**
   - URL: https://app.supabase.com
   - Projeto: `yuwdkjdraskyziceqtvc`

2. **Acesse SQL Editor:**
   - Painel esquerdo → `SQL Editor`
   - Botão verde `+ New Query`

3. **Execute o SQL:**
   - Copie TODO o conteúdo abaixo
   - Cole no editor
   - Pressione `Cmd+Enter` (macOS) ou `Ctrl+Enter` (Windows)

```sql
-- Disable RLS temporarily for seeding
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipments DISABLE ROW LEVEL SECURITY;

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

-- Re-enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipments ENABLE ROW LEVEL SECURITY;
```

4. **Resultado Esperado:**
   - ✅ 12 categorias inseridas
   - ✅ 25 equipamentos cadastrados
   - ✅ Mensagem: "Query executed successfully"

---

### Passo 2: Acessar o Sistema

1. **Abra no navegador:**
   - http://localhost:8080/

2. **Login:**
   - Use suas credenciais de test user
   - Ou crie uma nova conta (first user será admin)

3. **Navegue:**
   - 🏠 **Dashboard** → Veja estatísticas gerais
   - 📦 **Equipamentos** → Veja os 25 equipamentos cadastrados
   - 📋 **Ordens de Serviço** → Crie uma nova OS

---

## 🎮 Como Usar Cada Funcionalidade

### 📦 Gerenciar Equipamentos

**Ver todos os equipamentos:**
1. Clique em "Equipamentos" no menu lateral
2. Veja a lista com 25 itens

**Buscar equipamento:**
1. Digite o nome na caixa de busca (ex: "Soundcraft")
2. Lista filtra em tempo real

**Filtrar por categoria:**
1. Use o dropdown "Todas categorias"
2. Selecione ex: "Mesas de Som"
3. Veja apenas equipamentos dessa categoria

**Filtrar por status:**
1. Use o dropdown "Todos status"
2. Opções: Disponível, Em uso, Manutenção, Reservado, Danificado

**Criar novo equipamento:**
1. Clique botão verde "+ Novo"
2. Preencha:
   - Nome * (obrigatório): "Soundboard Behringer"
   - Marca: "Behringer"
   - Modelo: "X32"
   - Patrimônio: "PAT-2024-001"
   - Quantidade: 2
   - Categoria: "Mesas de Som"
   - Localização: "Galpão A, Prateleira 3"
3. Clique "Cadastrar"
4. Equipamento aparecerá na lista

---

### 📋 Gerenciar Ordens de Serviço

**Ver todas as OSes:**
1. Clique em "Ordens de Serviço" no menu
2. Veja lista com todas as ordens

**Criar nova OS:**
1. Clique botão "+ Nova OS"
2. Preencha:
   - Título da OS * (obrigatório): "Show Johnny Maracujá - Allianz Parque"
   - Descrição: "Locação de PA, iluminação e 2 DJ"
   - Prioridade: "Alta"
3. Clique "Criar"
4. Nova OS aparecerá no topo da lista

**Status da OS:**
- 🟢 Aberta (recém-criada)
- 🔵 Em andamento (trabalho começou)
- 🟡 Aguardando (esperando cliente/parte)
- ✅ Finalizada (concluída)
- ❌ Cancelada

---

## 🔍 Dicas Úteis

### Busca Rápida
- Digite qualquer parte do nome
- Busca é case-insensitive (maiúscula/minúscula)
- Busca é instantânea (sem clicar)

### Filtros Combinados
- Pode usar busca + status + categoria simultaneamente
- Exemplo: "Microfone" + Status "Em uso" + Categoria "Microfones"

### Quantidade vs Disponível
- **Quantidade**: total de items no inventário
- **Disponível**: quantos estão disponíveis para usar
- Ao criar OS, a quantidade disponível diminui

---

## 🚨 Se Algo Não Funcionar

**Banco de dados vazio (sem equipamentos)?**
- Verifique se executou o SQL no Supabase
- Atualize a página (F5)
- Verifique se está no projeto correto

**Erro de permissão?**
- Faça logout e login novamente
- Limpe cookies do navegador

**Servidor não responde?**
- Verifique se `npm run dev` está rodando
- Terminal deve mostrar "VITE ready in XXXms"

---

## 📞 Arquivos Importantes

```
/Users/danieltorres/eventkit-pro/
├── src/
│   ├── routes/_authenticated/
│   │   ├── equipments.tsx       ← Página de Equipamentos
│   │   └── work-orders.tsx      ← Página de Ordens de Serviço
│   └── components/layout/
│       └── AppSidebar.tsx       ← Menu lateral
├── SETUP_COMPLETE.md            ← Este arquivo
└── package.json                 ← Dependências
```

---

✨ **Tudo pronto!** Sistema em produção e funcionando! 🚀
