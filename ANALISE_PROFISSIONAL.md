# EventKit Pro - Análise Profissional Completa
## Por: Engenheiro de Software Sênior

**Data**: Maio 2026  
**Objetivo**: Transformar um projeto gerado pela Lovable em um software empresarial premium

---

## EXECUTIVE SUMMARY

O projeto **EventKit Pro** é um sistema de gerenciamento de equipamentos de eventos construído com stack moderno (React 19, TanStack, Supabase), porém apresenta **problemas arquiteturais críticos** que impedem escalabilidade e confiabilidade em ambiente de produção real.

### Severidade dos Problemas:
- **CRÍTICO** (impede produção): 7 problemas
- **GRAVE** (restringe escalabilidade): 6 problemas  
- **MODERADO** (afeta manutenção): 8 problemas

**Conclusão**: Refatoração profunda necessária antes de qualquer deploy de produção.

---

## PARTE 1: ANÁLISE ARQUITETURAL

### 1.1 Stack Atual

```
Tier de Apresentação:
├─ React 19 + TypeScript (strict mode)
├─ TanStack Router v1 (file-based routing)
├─ TanStack Query v5 (data fetching)
└─ Tailwind CSS + Radix UI (UI components)

Tier de Lógica:
├─ React Hooks (hooks/use-auth.tsx)
├─ React Context (AuthContext)
└─ React Hook Form + Zod (forms)

Tier de Dados:
├─ Supabase JS Client
└─ PostgreSQL (via Supabase)

Tier de Infraestrutura:
└─ Cloudflare Workers (SSR via TanStack Start)
```

### 1.2 Problemas de Arquitetura (CRÍTICO)

#### Problema 1: Falta de Clean Architecture
**Atual**: Lógica de negócio espalhada nos componentes React
```typescript
// ❌ RUIM: Lógica de negócio no componente
function EquipmentsPage() {
  const { data: items } = useQuery({
    queryKey: ["equipments", search, status, category],
    queryFn: async () => {
      let q = supabase.from("equipments")
        .select("*, categories(name,color)")
        .order("name");
      
      if (status !== "all") q = q.eq("status", status);
      if (category !== "all") q = q.eq("category_id", category);
      if (search) q = q.ilike("name", `%${search}%`);
      
      return (await q).data ?? [];
    },
  });

  const onCreate = async (e) => {
    const { error } = await supabase.from("equipments").insert(payload);
    // Sem validação, sem regras de negócio
  };
}
```

**Impacto:**
- Lógica de negócio não é testável
- Duplicação de código em múltiplos componentes
- Difícil de reutilizar entre diferentes interfaces
- Acoplamento alto com Supabase
- Impossível validar regras de negócio antes de persistir

**Solução**: Implementar separação em camadas:
- **Domain Layer**: Entities e regras de negócio
- **Application Layer**: Use Cases e Serviços
- **Infrastructure Layer**: Acesso a dados
- **Presentation Layer**: Componentes React

#### Problema 2: Sem Validação de Regras de Negócio

**Atual**: Qualquer valor é aceito no banco
```sql
-- Nada previne estoque negativo
UPDATE equipments SET available_qty = -10 WHERE id = '...';

-- Nada previne quantidade > disponível em movimentação
INSERT INTO equipment_movements (quantity) VALUES (9999);
```

**Impacto:**
- Inconsistência de dados
- Estoque pode ficar negativo
- Relatórios incorretos
- Impossível rastrear problemas
- Decisões de negócio baseadas em dados errados

#### Problema 3: Sem Injeção de Dependência

**Atual**: Hard-coded imports do Supabase
```typescript
import { supabase } from "@/integrations/supabase/client";
// Acoplado permanentemente com Supabase
```

**Impacto:**
- Impossível testar sem Supabase real
- Impossível trocar banco de dados
- Impossível mock dados em testes
- Difícil paralelizar trabalho

#### Problema 4: Sem Padrão de Organização

**Atual**: Estrutura flat por tipo de arquivo
```
src/
  components/          # 50+ componentes misturados
  routes/              # 9 rotas misturadas
  hooks/               # Hooks globais sem contexto
  integrations/        # Apenas Supabase
  lib/                 # Utils soltas
```

**Impacto:**
- Difícil encontrar código relacionado
- Sem contexto de feature
- Acoplamento global
- Difícil escalar para múltiplas empresas

#### Problema 5: Sem Tratamento de Erros Global

**Atual**: Cada componente trata seu erro
```typescript
const { error } = await supabase.from(...).insert(...);
if (error) toast.error(error.message);
```

**Impacto:**
- Tratamento inconsistente
- Erros não são logados
- Impossível analisar padrões
- Sem recuperação automática

#### Problema 6: Sem Tipos de Domínio

**Atual**: Usa tipos auto-gerados do Supabase
```typescript
// Types gerados automaticamente, sem validação
type Database = { public: { Tables: { ... } } };
```

**Impacto:**
- Sem contrato de dados
- Sem validação em tempo de execução
- Sem documentação de negócio
- Difícil evoluir schema

#### Problema 7: Sem Services/Repositories

**Atual**: Acesso a dados espalhado
```typescript
// Equipments page
supabase.from("equipments").select(...)

// Kits page
supabase.from("kits").select(...)

// Work Orders page
supabase.from("work_orders").select(...)
```

**Impacto:**
- Duplicação de queries
- Sem lugar para lógica de acesso
- Difícil adicionar cache
- Sem abstrações para múltiplos bancos

---

## PARTE 2: ANÁLISE DE BANCO DE DADOS

### 2.1 Problemas de RLS (CRÍTICO)

#### Problema 1: RLS Permissivo Demais

**Atual**:
```sql
-- ❌ Qualquer usuário autenticado pode fazer tudo
CREATE POLICY "Kits write" ON public.kits FOR ALL TO authenticated 
  USING (true) WITH CHECK (true);

CREATE POLICY "WO write" ON public.work_orders FOR ALL TO authenticated 
  USING (true) WITH CHECK (true);

CREATE POLICY "Clients write" ON public.clients FOR ALL TO authenticated 
  USING (true) WITH CHECK (true);
```

**Risco de Segurança**: 
- Um "operador" pode deletar ordens de serviço de outro
- Um "estoquista" pode modificar dados de manutenção
- Sem auditoria de quem fez o quê

**Solução**:
```sql
-- ✅ Apenas criador ou admin pode modificar
CREATE POLICY "Kits write" ON public.kits FOR ALL TO authenticated 
  USING (is_admin(auth.uid()) OR created_by = auth.uid()) 
  WITH CHECK (is_admin(auth.uid()) OR created_by = auth.uid());

-- ✅ Equipments apenas admin/estoquista
CREATE POLICY "Equipments write" ON public.equipments FOR ALL TO authenticated
  USING (is_admin(auth.uid()) OR has_role(auth.uid(), 'estoquista'))
  WITH CHECK (is_admin(auth.uid()) OR has_role(auth.uid(), 'estoquista'));
```

### 2.2 Problemas de Schema

#### Problema 1: Sem Soft Deletes

**Atual**: Deletar é permanente
```sql
DELETE FROM equipments WHERE id = '...'; -- Desaparece para sempre
```

**Impacto**:
- Impossível recuperar dados deletados acidentalmente
- Sem histórico completo
- Impossível auditoria de deletions
- LGPD/compliance complicado

**Solução**:
```sql
ALTER TABLE equipments ADD COLUMN deleted_at TIMESTAMPTZ;
-- Sempre filter: WHERE deleted_at IS NULL
```

#### Problema 2: Faltam Constraints de Negócio

**Atual**:
```sql
-- Nada previne:
-- - quantity < 0
-- - available_qty > quantity  
-- - available_qty < 0
CREATE TABLE equipments (
  quantity INT NOT NULL DEFAULT 1,
  available_qty INT NOT NULL DEFAULT 1
);
```

**Solução**:
```sql
ALTER TABLE equipments 
  ADD CONSTRAINT check_quantity_positive CHECK (quantity > 0),
  ADD CONSTRAINT check_available_positive CHECK (available_qty >= 0),
  ADD CONSTRAINT check_available_not_exceeds CHECK (available_qty <= quantity);
```

#### Problema 3: Faltam Índices

**Atual**: Não há índices além do necessário
```sql
-- Apenas estes:
CREATE INDEX idx_equipments_category ON equipments(category_id);
CREATE INDEX idx_equipments_status ON equipments(status);
```

**Impacto**: Queries lentas em dataset grande
- 10k equipamentos = varredura completa
- 100k movimentações = timeout
- Reports não executam em tempo aceitável

**Solução**: Adicionar índices estratégicos
```sql
-- Busca comum: categoria + status + nome
CREATE INDEX idx_equipments_search ON equipments(category_id, status, name);

-- Movimentações por período
CREATE INDEX idx_movements_date ON equipment_movements(created_at DESC);

-- Por usuário (auditoria)
CREATE INDEX idx_movements_user ON equipment_movements(user_id, created_at DESC);

-- FK lookups
CREATE INDEX idx_movements_equipment ON equipment_movements(equipment_id);
CREATE INDEX idx_kit_items_kit ON kit_items(kit_id);
CREATE INDEX idx_wo_items_wo ON work_order_items(work_order_id);
```

#### Problema 4: Sem Versionamento/Audit Trail

**Atual**: activity_logs apenas registra ação, não há histórico de valores
```sql
-- Não sabe o que mudou
{
  "action": "UPDATE",
  "entity": "equipment",
  "payload": null  -- Vazio!
}
```

**Impacto**:
- "Quem mudou a quantidade?" → Desconhecido
- "Qual era o preço anterior?" → Não existe
- "Quando mudou de categoria?" → Não sabe

#### Problema 5: Foreign Keys Opcionais

**Atual**:
```sql
ALTER TABLE equipment_movements
  ADD CONSTRAINT fk_movement_wo FOREIGN KEY (work_order_id) 
  REFERENCES work_orders(id) ON DELETE SET NULL;
```

**Impacto**: Movement pode existir sem Order de Serviço
- Rastreamento incompleto
- Inconsistência de dados
- Impossível saber "qual ordem gerou esta movimentação"

### 2.3 Problemas de Normalização

#### Problema 1: Dados Desnormalizados

**Atual**:
```sql
-- equipment_movements copia informações em vez de referenciar
quantity INT,              -- OK
from_location TEXT,        -- Deveria ser FK
to_location TEXT           -- Deveria ser FK
```

---

## PARTE 3: ANÁLISE DE SEGURANÇA

### 3.1 Vulnerabilidades Críticas

#### 1. SQL Injection (Risco ALTO)
**Atual**: RLS policies não validam entrada
```typescript
// Alguém pode enviar search com SQL malicioso
if (search) q = q.ilike("name", `%${search}%`);
```

**Mitigação**: Supabase JS client usa prepared statements, mas frontend precisa validar.

#### 2. RBAC Incompleto
**Atual**: Roles existem mas RLS não as usa totalmente
```sql
-- user_roles table existe com roles: admin, tecnico, operador, estoquista
-- Mas RLS só usa em algumas tabelas:
-- - categories ✅ (admin | estoquista)
-- - equipments ✅ (admin | estoquista)
-- - Outros ❌ (todos podem fazer tudo)
```

#### 3. Sem Validação de Entrada
**Atual**: Nenhuma validação antes de persistir
```typescript
// Nenhum schema Zod validando
const onCreate = async (e) => {
  const f = new FormData(e.currentTarget);
  const payload = { name: f.get("name") }; // Pode ser qualquer coisa
};
```

#### 4. Sem Rate Limiting
**Atual**: Qualquer usuário pode fazer requests ilimitadas
- 100k equipamentos podem ser criados em 1 segundo
- DOS attack via queries pesadas

#### 5. Sem Logs de Segurança
**Atual**: activity_logs não captura eventos de segurança
- Login não logged
- Mudanças de role não logged
- Tentativas de acesso negado não logged

#### 6. Sem Proteção CSRF
**Atual**: Nenhuma proteção CSRF explícita
- Supabase auth token em localStorage é vulnerável

---

## PARTE 4: ANÁLISE DE REGRAS DE NEGÓCIO

### 4.1 Problemas Críticos

#### 1. Sem Controle Real de Estoque

**Cenário 1**: Sacar mais que disponível
```sql
UPDATE equipment SET available_qty = 10 WHERE id = 'eq1';
-- Alguém saca 15:
UPDATE equipment SET available_qty = -5 WHERE id = 'eq1'; -- ❌ Permitido!
```

**Cenário 2**: Devolver mais que saiu
```sql
-- Saiu 10 unidades
INSERT INTO equipment_movements (equipment_id, quantity, type) 
VALUES ('eq1', 10, 'saida');

-- Retornou 20 (???)
INSERT INTO equipment_movements (equipment_id, quantity, type) 
VALUES ('eq1', 20, 'retorno'); -- ❌ Permitido!
```

#### 2. Sem Rastreamento Imutável

**Problema**: Activity logs podem ser deletadas
```sql
DELETE FROM activity_logs WHERE id = '...'; -- Apaga evidência!
```

#### 3. Sem Validação de Movimentações

**Problema**: Qualquer movimento é aceito
```typescript
// Sacar equipamento em manutenção? OK!
// Sacar equipamento reservado? OK!
// Sacar equipamento extraviado? OK!
// Sacar quantidade > 0? Não validado
```

#### 4. Sem Status Automáticos

**Problema**: Status manual
```sql
-- Ninguém atualiza status quando:
-- - Todos os itens foram sacados (deveria ser "em_uso")
-- - Todos os itens foram devolvidos (deveria ser "finalizada")
-- - Kit foi retirado (deveria ser "em_uso")
```

#### 5. Sem Detecção de Inconsistências

**Problema**: Dados podem ficar inconsistentes
```sql
-- Equipamento com quantity=10, available_qty=50 (???)
-- Kit com 15 itens mas equipment_id deletado
-- Movement sem equipment_id (foreign key optional)
```

---

## PARTE 5: ANÁLISE DE PERFORMANCE

### 5.1 Problemas

#### 1. Sem Paginação

**Atual**:
```typescript
const { data: items } = useQuery({
  queryKey: ["equipments", ...filters],
  queryFn: async () => {
    const { data } = await supabase
      .from("equipments")
      .select("*, categories(name,color)")
      .order("name");
    return data ?? [];
  },
});
```

**Problema**:
- 1k equipamentos = 1 segundo de busca
- 10k equipamentos = 10 segundos
- 100k equipamentos = não carrega (timeout)
- Memória do frontend explode

**Solução**: Paginação cursor-based
```typescript
const { data, nextCursor } = await equipmentsService.list({
  limit: 25,
  cursor: lastEquipmentId,
  filters: { category, status, search }
});
```

#### 2. Sem Cache

**Atual**: Cada mudança invalida cache
```typescript
// 1 equipamento criado = re-fetch de todos os 1k
qc.invalidateQueries({ queryKey: ["equipments"] });
```

**Solução**: Cache granular
```typescript
// 1 equipamento criado = apenas adiciona à cache
queryClient.setQueryData(["equipments"], prev => [...prev, newEquipment]);
```

#### 3. Sem Lazy Loading

**Atual**: Tudo carrega ao abrir página
- Lista de equipamentos: carrega tudo
- Categorias: carrega ao iniciar
- Usuários: carrega ao iniciar

**Solução**: Load-on-demand
```typescript
// Carrega apenas quando necessário
<AsyncCombobox 
  loadOptions={async (search) => {
    return await equipmentsService.search(search);
  }}
/>
```

#### 4. Sem Virtualização

**Atual**: Renderiza todos os 100+ itens
```typescript
{items.map(item => <EquipmentRow key={item.id} item={item} />)}
```

**Problema**: Renderizar 1000 rows = travamento
**Solução**: Usar react-window ou react-virtual

#### 5. Sem Optimistic Updates

**Atual**: Aguarda resposta do servidor
```typescript
await supabase.from("...").update(...);
// Usuário vê demora de 500ms
```

**Solução**: Update imediato
```typescript
// 1. Update local imediato
setEquipments(prev => prev.map(e => e.id === id ? {...e, ...updates} : e));

// 2. Sync com servidor
await supabase.from("...").update(updates);

// 3. Rollback se falhar
```

---

## PARTE 6: ANÁLISE DE ESCALABILIDADE

### 6.1 Problemas Estruturais

#### 1. Sem Multi-Tenancy

**Problema**: Toda conta compartilha banco de dados
```sql
-- Sem coluna company_id em lugar nenhum
SELECT * FROM equipments; -- Retorna equipamentos de TODOS
```

**Impacto para crescimento**:
- Impossível vender SaaS multi-empresa
- Segurança ruim (dados cruzados)
- Isolamento de dados difícil
- Migração de dados complexa

#### 2. Sem Segregação de Dados

**Problema**: RLS não pode segregar por empresa
```sql
-- Não há como garantir que usuário A não vê dados de B
```

#### 3. Estrutura Não Escala Horizontalmente

**Problema**: Cloudflare Workers é serverless, mas dados são em single DB
- Single PostgreSQL instance pode não escalar
- Sem read replicas
- Sem sharding preparado

#### 4. Sem API Contracts

**Problema**: Frontend e backend acoplados
```typescript
// Se backend mudar resposta, frontend quebra
const { data } = await supabase.from("equipments").select(...);
```

---

## PARTE 7: ANÁLISE DE QUALIDADE DE CÓDIGO

### 7.1 Problemas

#### 1. Componentes Monolíticos

**Exemplo**: equipments.tsx tem ~100 linhas em 1 arquivo
```typescript
// Faz tudo:
// - Search
// - Filter  
// - Query
// - Create form
// - List render
// - Error handling
```

**Solução**: Decompor
```
equipments/
  ├─ EquipmentsPage.tsx (container)
  ├─ EquipmentsList.tsx (list)
  ├─ EquipmentRow.tsx (item)
  ├─ CreateEquipmentDialog.tsx (form)
  └─ EquipmentFilters.tsx (filters)
```

#### 2. Sem Testes

**Atual**: Nenhum arquivo .test.ts
- Impossível refatorar com confiança
- Sem regression tests
- Sem contrato de comportamento

#### 3. Sem Documentação

**Atual**: Nenhum comentário explicando lógica
- Novo dev precisa ler código para entender
- Sem exemplos de uso
- Sem guias de arquitetura

#### 4. Sem Constants

**Atual**: Magic strings espalhados
```typescript
if (status !== "all") q = q.eq("status", status);
if (search) q = q.ilike("name", `%${search}%`);
```

**Solução**:
```typescript
const EQUIPMENT_STATUS = {
  AVAILABLE: 'disponivel',
  IN_USE: 'em_uso',
  MAINTENANCE: 'manutencao',
  // ...
} as const;
```

#### 5. Sem Validação Centralizada

**Atual**: Cada componente valida diferente
```typescript
// equipment page
required

// kit page  
nenhuma validação explícita

// work order
nenhuma validação explícita
```

---

## PLANO DE REFATORAÇÃO

### Fase 1: ARQUITETURA (Semana 1-2)
1. ✅ Criar estrutura Clean Architecture
2. ✅ Implementar Domain Layer
3. ✅ Implementar Application Layer
4. ✅ Implementar Infrastructure Layer
5. ✅ Implementar Presentation Layer

### Fase 2: BANCO DE DADOS (Semana 2-3)
1. ✅ Reescrever RLS policies
2. ✅ Adicionar soft deletes
3. ✅ Adicionar constraints
4. ✅ Adicionar índices
5. ✅ Adicionar audit trail completo
6. ✅ Adicionar versionamento

### Fase 3: SEGURANÇA (Semana 3-4)
1. ✅ Implementar RBAC completo
2. ✅ Validação robusta de entrada
3. ✅ Rate limiting
4. ✅ Logs de segurança
5. ✅ Auditoria automática

### Fase 4: REGRAS DE NEGÓCIO (Semana 4-5)
1. ✅ Validação de movimentações
2. ✅ Prevenção de estoque negativo
3. ✅ Controle de devoluções
4. ✅ Rastreamento imutável
5. ✅ Status automáticos

### Fase 5: PERFORMANCE (Semana 5-6)
1. ✅ Paginação
2. ✅ Caching estratégico
3. ✅ Lazy loading
4. ✅ Virtualização
5. ✅ Otimização de queries

### Fase 6: ESCALABILIDADE (Semana 6-7)
1. ✅ Preparação multi-tenancy
2. ✅ API contracts
3. ✅ Documentação
4. ✅ Testes

### Fase 7: REFINAMENTO (Semana 7-8)
1. ✅ Testes completos
2. ✅ Documentação
3. ✅ Review final

---

## ESTRUTURA ALVO

```
src/
├─ core/                          # Core da aplicação
│  ├─ domain/                     # Entidades e regras
│  │  ├─ entities/
│  │  │  ├─ Equipment.ts
│  │  │  ├─ EquipmentMovement.ts
│  │  │  ├─ Kit.ts
│  │  │  ├─ WorkOrder.ts
│  │  │  ├─ User.ts
│  │  │  └─ Client.ts
│  │  ├─ exceptions/
│  │  │  ├─ DomainException.ts
│  │  │  ├─ BusinessRuleException.ts
│  │  │  └─ ValidationException.ts
│  │  ├─ repositories/
│  │  │  ├─ EquipmentRepository.ts (interface)
│  │  │  ├─ MovementRepository.ts (interface)
│  │  │  └─ ...
│  │  └─ specifications/
│  │     ├─ EquipmentSpecifications.ts
│  │     └─ ...
│  │
│  └─ application/                # Casos de uso
│     ├─ dtos/
│     │  ├─ CreateEquipmentDTO.ts
│     │  ├─ UpdateEquipmentDTO.ts
│     │  └─ ...
│     ├─ services/
│     │  ├─ EquipmentService.ts
│     │  ├─ MovementService.ts
│     │  ├─ AuthService.ts
│     │  └─ ...
│     ├─ use-cases/
│     │  ├─ equipment/
│     │  │  ├─ CreateEquipmentUseCase.ts
│     │  │  ├─ ListEquipmentsUseCase.ts
│     │  │  └─ ...
│     │  ├─ movement/
│     │  │  ├─ RegisterMovementUseCase.ts
│     │  │  └─ ...
│     │  └─ ...
│     └─ mappers/
│        ├─ EquipmentMapper.ts
│        └─ ...
│
├─ infrastructure/                # Acesso a dados
│  ├─ persistence/
│  │  ├─ repositories/
│  │  │  ├─ SupabaseEquipmentRepository.ts (implements)
│  │  │  ├─ SupabaseMovementRepository.ts (implements)
│  │  │  └─ ...
│  │  └─ database/
│  │     ├─ supabase.ts
│  │     ├─ migrations/
│  │     └─ seed/
│  ├─ http/
│  │  ├─ HttpClient.ts
│  │  └─ interceptors/
│  ├─ authentication/
│  │  └─ SupabaseAuthProvider.ts
│  └─ logging/
│     └─ Logger.ts
│
├─ presentation/                  # UI
│  ├─ routes/
│  │  ├─ __root.tsx
│  │  └─ _authenticated/
│  │     ├─ index.tsx
│  │     ├─ equipments.tsx
│  │     ├─ kits.tsx
│  │     ├─ movements.tsx
│  │     ├─ work-orders.tsx
│  │     ├─ users.tsx
│  │     ├─ schedule.tsx
│  │     ├─ maintenance.tsx
│  │     └─ settings.tsx
│  │
│  ├─ features/
│  │  ├─ equipments/
│  │  │  ├─ containers/
│  │  │  │  └─ EquipmentsPage.tsx
│  │  │  ├─ components/
│  │  │  │  ├─ EquipmentsList.tsx
│  │  │  │  ├─ EquipmentRow.tsx
│  │  │  │  ├─ EquipmentFilters.tsx
│  │  │  │  ├─ CreateEquipmentDialog.tsx
│  │  │  │  ├─ EditEquipmentDialog.tsx
│  │  │  │  └─ DeleteEquipmentConfirm.tsx
│  │  │  ├─ hooks/
│  │  │  │  ├─ useEquipments.ts
│  │  │  │  ├─ useCreateEquipment.ts
│  │  │  │  └─ ...
│  │  │  └─ types/
│  │  │     └─ index.ts
│  │  │
│  │  ├─ kits/
│  │  │  ├─ containers/
│  │  │  ├─ components/
│  │  │  ├─ hooks/
│  │  │  └─ types/
│  │  │
│  │  ├─ movements/
│  │  │  ├─ containers/
│  │  │  ├─ components/
│  │  │  ├─ hooks/
│  │  │  └─ types/
│  │  │
│  │  ├─ workOrders/
│  │  ├─ users/
│  │  ├─ maintenance/
│  │  ├─ schedule/
│  │  └─ dashboard/
│  │
│  ├─ components/
│  │  ├─ shared/
│  │  │  ├─ Header.tsx
│  │  │  ├─ Sidebar.tsx
│  │  │  ├─ Footer.tsx
│  │  │  └─ ...
│  │  ├─ layout/
│  │  │  ├─ AppShell.tsx
│  │  │  ├─ AppSidebar.tsx
│  │  │  ├─ Topbar.tsx
│  │  │  └─ ...
│  │  └─ ui/
│  │     └─ (componentes shadcn/ui)
│  │
│  ├─ hooks/
│  │  ├─ useAuth.ts
│  │  ├─ usePagination.ts
│  │  ├─ useDebounce.ts
│  │  ├─ useMutation.ts
│  │  └─ ...
│  │
│  ├─ context/
│  │  ├─ AuthContext.tsx
│  │  ├─ ThemeContext.tsx
│  │  └─ ...
│  │
│  └─ styles/
│     └─ ...
│
├─ shared/                        # Código compartilhado
│  ├─ constants/
│  │  ├─ equipmentStatus.ts
│  │  ├─ movementTypes.ts
│  │  ├─ userRoles.ts
│  │  ├─ messages.ts
│  │  └─ ...
│  │
│  ├─ types/
│  │  ├─ common.ts
│  │  ├─ pagination.ts
│  │  ├─ error.ts
│  │  ├─ api.ts
│  │  └─ ...
│  │
│  ├─ validations/
│  │  ├─ schemas/
│  │  │  ├─ equipmentSchemas.ts
│  │  │  ├─ movementSchemas.ts
│  │  │  ├─ workOrderSchemas.ts
│  │  │  └─ ...
│  │  └─ validators.ts
│  │
│  ├─ utils/
│  │  ├─ cn.ts
│  │  ├─ formatters.ts
│  │  ├─ dateHelpers.ts
│  │  ├─ numberHelpers.ts
│  │  └─ ...
│  │
│  ├─ adapters/
│  │  ├─ errorAdapter.ts
│  │  ├─ dateAdapter.ts
│  │  └─ ...
│  │
│  └─ errors/
│     ├─ AppError.ts
│     ├─ ValidationError.ts
│     ├─ NotFoundError.ts
│     ├─ UnauthorizedError.ts
│     └─ ...
│
└─ config/
   ├─ di.ts                       # Dependency Injection
   ├─ env.ts                      # Environment variables
   └─ logger.ts
```

---

## PRÓXIMAS ETAPAS

1. **Confirmar aprovação** desta análise
2. **Iniciar Fase 1** (Arquitetura)
3. Implementar Clean Architecture
4. Implementar Domain Layer
5. Implementar Application Layer
6. Implementar Infrastructure Layer
7. Refatorar Presentation Layer

---

**Versão**: 1.0  
**Status**: ✅ Análise Completa  
**Próximo**: Implementação Fase 1
