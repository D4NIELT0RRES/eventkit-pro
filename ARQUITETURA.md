# EventKit Pro - Arquitetura Empresarial

## 📋 Overview da Arquitetura

EventKit Pro foi refatorado de um protótipo Lovable para uma arquitetura empresarial completa baseada em **Clean Architecture** com separação clara de responsabilidades.

```
┌─────────────────────────────────────────────────────────────┐
│                  PRESENTATION LAYER                          │
│  React Components, Hooks, Feature-based Organization        │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│               APPLICATION LAYER                              │
│ Use Cases, DTOs, Mappers, Application Services              │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                DOMAIN LAYER                                  │
│ Entities, Business Rules, Domain Services, Exceptions       │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│            INFRASTRUCTURE LAYER                              │
│  Repositories (Supabase), Database, External Services       │
└─────────────────────────────────────────────────────────────┘
```

## 🏗️ Estrutura de Pastas

```
src/
├── core/
│   ├── domain/                    # Camada de Domínio
│   │   ├── entities/             # Entidades de negócio
│   │   ├── exceptions/           # Exceções de domínio
│   │   ├── repositories/         # Interfaces de repositórios
│   │   └── services/             # Serviços de domínio
│   ├── application/              # Camada de Aplicação
│   │   ├── dtos/                 # Data Transfer Objects
│   │   ├── mappers/              # Mapeadores Entity ↔ DTO
│   │   ├── services/             # Serviços de Aplicação
│   │   └── use-cases/            # Casos de Uso
│   ├── infrastructure/           # Camada de Infraestrutura
│   │   └── persistence/
│   │       └── repositories/     # Implementações Supabase
│   └── index.ts                  # Re-exports centralizados
├── presentation/                  # Camada de Apresentação
│   └── features/
│       ├── equipments/
│       ├── movements/
│       ├── kits/
│       └── workOrders/
├── shared/                        # Código compartilhado
│   ├── types/                    # TypeScript types e interfaces
│   ├── utils/                    # Utilitários (cache, paginação)
│   ├── validations/              # Schemas Zod
│   └── errors/                   # Error handling
├── hooks/                         # React hooks customizados
├── config/
│   └── di.ts                     # Dependency Injection Container
└── router.tsx                    # Roteamento TanStack Router
```

## 🔑 Conceitos Principais

### Entities (Domínio)
As entities contêm toda a lógica de negócio e validações. Exemplos:
- `Equipment` - Equipamentos com validações de estoque
- `EquipmentMovement` - Movimentações com auditoria
- `WorkOrder` - Ordens de serviço com ciclo de vida
- `Kit` - Kits de equipamentos

### Use Cases (Aplicação)
Cada Use Case implementa um fluxo de negócio específico:
- `RegisterMovementUseCase` - Registra movimento de equipamento
- `CreateEquipmentUseCase` - Cria novo equipamento
- `StartWorkOrderUseCase` - Inicia ordem de serviço
- `CompleteWorkOrderUseCase` - Conclui ordem de serviço

### Domain Services (Domínio)
Serviços que encapsulam lógica de negócio complexa:
- `StockValidationDomainService` - Valida movimentos de estoque
- `EquipmentLifecycleDomainService` - Gerencia ciclo de vida de equipamentos
- `WorkOrderValidationDomainService` - Valida regras de ordens

### DTOs (Aplicação)
Transferem dados entre camadas com type-safety:
- `CreateEquipmentDTO`, `EquipmentResponseDTO`
- `RegisterMovementDTO`, `MovementResponseDTO`
- `CreateWorkOrderDTO`, `WorkOrderResponseDTO`

### Repositories (Infraestrutura)
Implementam acesso a dados com Supabase:
- `SupabaseEquipmentRepository`
- `SupabaseMovementRepository`
- `SupabaseKitRepository`
- `SupabaseWorkOrderRepository`

## 💉 Dependency Injection

O `DI Container` em `src/config/di.ts` centraliza a criação de todas as instâncias:

```typescript
const container = createDIContainer(supabase);
const equipmentService = container.equipmentService;
```

Use o hook `useDI()` no React para acessar:
```typescript
const { di } = useAppContext();
const equipmentService = di.equipmentService;
```

## 🔒 Business Rules Implementadas

### Equipments
- ✅ Quantidade total > 0
- ✅ Quantidade disponível ≤ quantidade total
- ✅ Patrimônio único
- ✅ Não pode remover mais estoque que disponível
- ✅ Saúde do estoque (crítico/baixo/normal)

### Movements
- ✅ Valida tipo de movimento (saída/entrada/retorno/ajuste)
- ✅ Verifica disponibilidade antes de saída
- ✅ Registra auditoria de cada movimento
- ✅ Impede estoque negativo

### Work Orders
- ✅ Ciclo de vida (aberta → em progresso → concluída/cancelada)
- ✅ Requer técnico para iniciar
- ✅ Valida disponibilidade de equipamentos
- ✅ Detecta ordens atrasadas
- ✅ Prioridade efetiva aumentada se atrasada

### Kits
- ✅ Requer pelo menos um item
- ✅ Validação de equipamentos existentes
- ✅ Adição/remoção de itens com consistência

## 📊 Database Schema Melhorado

### Migrations Criadas
- ✅ `20260512_add_soft_deletes.sql` - Suporte a soft delete
- ✅ `20260512_add_business_constraints.sql` - Constraints de negócio
- ✅ `20260512_create_audit_logs.sql` - Auditoria imutável
- ✅ `20260512_add_performance_indexes.sql` - Índices de performance
- ✅ `20260512_improve_rls_policies.sql` - RLS seguro

### Índices Estratégicos
- Equipments por categoria + status
- Movements por equipamento + data
- Work Orders por status + data
- Busca full-text em equipamentos

## 🎯 Próximos Passos (Semanas 5-8)

1. **Semana 5** - Performance & Caching
   - Redis integration para cache
   - Query optimization
   - Lazy loading de dados

2. **Semana 6** - UI Components
   - Refatorar componentes para usar novos services
   - Formulários com validações
   - Listagens com paginação

3. **Semana 7** - Testes & Documentação
   - Unit tests para entities
   - Integration tests para use cases
   - E2E tests para fluxos críticos

4. **Semana 8** - Deployment & Refinamento
   - Deploy para produção
   - Monitoring e logging
   - Otimizações finais

## 🚀 Como Usar

### Criar um Equipamento
```typescript
const service = container.equipmentService;
const equipment = await service.create({
  name: 'Laptop Dell XPS',
  brand: 'Dell',
  quantity: 10,
  categoryId: 'cat-123'
});
```

### Registrar um Movimento
```typescript
const service = container.movementService;
const movement = await service.registerMovement({
  equipmentId: 'eq-123',
  quantity: 2,
  type: 'saida'
}, userId);
```

### Listar Equipamentos
```typescript
const result = await service.list(
  { status: 'ativo' },
  { page: 1, limit: 25 }
);
```

## ✅ Benefícios da Nova Arquitetura

- **Testabilidade**: Camadas bem separadas facilitam testes unitários
- **Manutenibilidade**: Lógica de negócio centralizada em entities e services
- **Escalabilidade**: Fácil adicionar novas features sem quebrar existentes
- **Segurança**: RLS melhorado, validações em múltiplas camadas
- **Performance**: Índices estratégicos, cache pronto para implementação
- **Auditoria**: Rastreamento completo de mudanças
- **Type Safety**: TypeScript strict em toda a aplicação
