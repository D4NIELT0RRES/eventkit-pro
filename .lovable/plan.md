
# EventOS — Sistema de Gerenciamento de Equipamentos de Eventos

Sistema web empresarial inspirado em Linear/Notion/Monday, com backend Lovable Cloud (Postgres + Auth + Storage), focado no controle de equipamentos de áudio, vídeo, iluminação e logística para produção de eventos. A arquitetura foi modelada a partir do PDF "Exemplo de OS" (mesas Digico/Yamaha, microfones Shure/AKG/Neumann, caixas Meyer, amplificação, cabos, intercom, DJ, etc.).

## Escopo da entrega (V1)

Como o pedido é muito amplo, V1 entrega o **núcleo funcional completo e navegável** com base sólida para expansão. Telas mais profundas (laudos, assinatura digital, QR Code scan nativo) ficam como ganchos prontos.

### V1 — Incluso e funcional
1. **Design system premium** (dark mode default, tokens em `oklch`, Sidebar + Topbar SaaS, cards animados, skeletons, empty states, toasts, modais)
2. **Autenticação** Lovable Cloud: login, signup, logout, recuperação de senha, sessão persistente, rota protegida `_authenticated`
3. **Perfis e permissões**: tabela `user_roles` separada + enum `app_role` (admin, técnico, operador, estoquista) + `has_role()` security definer
4. **Dashboard** com KPIs (totais, disponíveis, em uso, manutenção, reservados), gráfico de movimentações (Recharts), alertas e atividades recentes
5. **Equipamentos**: CRUD completo, upload de imagem (Storage), QR Code gerado, filtros por categoria/status/localização, busca em tempo real, paginação
6. **Categorias** pré-populadas (Mesas de Som, Microfones, Caixas Acústicas, Amplificação, Iluminação, Vídeo, DJ, Cabos, Acessórios, Intercom)
7. **Movimentações** (saída/retorno/transferência) com validação de estoque e log automático
8. **Kits de Eventos**: criar kit, adicionar itens com quantidades, reservar, verificação de disponibilidade
9. **Ordens de Serviço**: cliente, evento, técnico, prioridade, status, datas, checklist de equipamentos vinculados
10. **Agenda / Logística**: calendário de eventos, checklist de saída e retorno
11. **Manutenção**: registros técnicos, custo, técnico responsável, anexos
12. **Usuários**: gestão (admin), atribuição de roles, logs de atividade
13. **Configurações**: perfil do usuário, tema
14. **Logs de atividade** automáticos via triggers nas tabelas principais

### Fora da V1 (ganchos prontos para iterar)
- Assinatura digital em canvas no retorno (UI prevista, sem persistência)
- Scanner QR via câmera (o QR Code é gerado e exibido)
- Relatórios PDF exportáveis
- Notificações em tempo real (realtime channels)

## Modelo de dados (Lovable Cloud)

```text
profiles(id PK→auth.users, full_name, avatar_url, phone)
app_role  ENUM('admin','tecnico','operador','estoquista')
user_roles(id, user_id→auth.users, role, UNIQUE(user_id,role))
has_role(_user_id, _role) SECURITY DEFINER

categories(id, name, slug, icon, color)
equipments(id, patrimony_no UNIQUE, internal_code, name, brand, model,
           serial_no, category_id→categories, quantity, available_qty,
           status ENUM, location, notes, image_url, qr_code, created_at)
equipment_movements(id, equipment_id, type ENUM(out,in,transfer),
                    quantity, user_id, work_order_id NULL,
                    from_location, to_location, notes, created_at)

kits(id, name, description, status ENUM, created_by, created_at)
kit_items(id, kit_id, equipment_id, quantity)

clients(id, name, contact, email, phone)
work_orders(id, code, client_id, event_name, event_date, location,
            technician_id, priority ENUM, status ENUM,
            start_date, end_date, notes, created_by, created_at)
work_order_items(id, work_order_id, equipment_id, quantity, checked_out, checked_in)

maintenance(id, equipment_id, technician_id, opened_at, closed_at,
            cost, report, status, attachments jsonb)

event_schedule(id, work_order_id, type ENUM(prep,load_out,event,load_in,return),
               scheduled_at, responsible_id, checklist jsonb, status)

activity_logs(id, user_id, entity, entity_id, action, payload jsonb, created_at)
```

Todas as tabelas com RLS habilitado. Policies: usuários autenticados podem ler tudo; apenas roles `admin`/`estoquista` podem criar/editar equipamentos; admin gerencia usuários; técnicos atualizam OS atribuídas.

Storage bucket público `equipment-images` para fotos de patrimônio.

## Estrutura de rotas (TanStack Router)

```text
/login, /signup, /forgot-password, /reset-password
/_authenticated/
  ├ index            → Dashboard
  ├ equipments       → lista + filtros
  ├ equipments/$id   → detalhe + histórico
  ├ kits
  ├ movements
  ├ work-orders
  ├ work-orders/$id
  ├ schedule         → agenda/logística
  ├ maintenance
  ├ users            → admin only
  └ settings
```

## Stack e organização de código

- TanStack Start (já no template) + React 19 + TS estrito
- Tailwind v4 + Shadcn UI (variantes premium customizadas)
- Framer Motion para transições de páginas e cards
- React Hook Form + Zod para validação
- Recharts para gráficos
- Lovable Cloud client (`@/integrations/supabase/client`) para auth/queries client-side
- `qrcode` package para gerar QR Codes
- Layout: `src/components/layout/{AppSidebar,Topbar,AppShell}.tsx`
- Features modulares em `src/features/{equipments,kits,movements,...}`

## Visual

- Dark mode default, opção light
- Paleta: background quase-preto azulado, primary azul-elétrico (oklch ~0.65 0.18 250), accent ciano, sucesso verde, alerta âmbar
- Tipografia Inter (já disponível via system stack)
- Sidebar colapsível com ícones Lucide, indicador de rota ativa, separação por grupos (Operação / Cadastro / Admin)
- Cards com gradiente sutil e shadow-elegant; tabelas com zebra suave; status como badges coloridos

## Etapas de execução

1. Habilitar Lovable Cloud
2. Criar migração SQL: enums, tabelas, RLS, triggers de log, seed de categorias
3. Criar bucket de storage
4. Design system em `src/styles.css` (tokens dark/light, gradientes, shadows)
5. Hook de auth + AuthProvider + rotas `_authenticated`
6. Layout (Sidebar + Topbar) + páginas Login/Signup/Forgot
7. Dashboard com KPIs e gráficos
8. Módulo Equipamentos (lista, form, detalhe, upload, QR)
9. Movimentações + Kits
10. Ordens de Serviço + Agenda
11. Manutenção + Usuários + Configurações
12. Polimento (skeletons, empty states, toasts, animações)

Após sua aprovação eu começo pela Cloud + schema e construo as telas em ondas.
