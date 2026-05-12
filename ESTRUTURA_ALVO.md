# EventKit Pro - Estrutura de Pastas Alvo
## Clean Architecture + Feature-Based Organization

```
eventkit-pro/
│
├── src/
│   │
│   ├── core/                              # ⭐ CORE DA APLICAÇÃO
│   │   │
│   │   ├── domain/                        # Entidades e Regras de Negócio
│   │   │   ├── entities/
│   │   │   │   ├── Equipment.ts          # Entity: Equipamento
│   │   │   │   ├── EquipmentMovement.ts  # Entity: Movimentação
│   │   │   │   ├── Kit.ts                # Entity: Kit
│   │   │   │   ├── WorkOrder.ts          # Entity: Ordem de Serviço
│   │   │   │   ├── Client.ts             # Entity: Cliente
│   │   │   │   ├── User.ts               # Entity: Usuário
│   │   │   │   ├── Category.ts           # Entity: Categoria
│   │   │   │   └── Maintenance.ts        # Entity: Manutenção
│   │   │   │
│   │   │   ├── exceptions/               # Exceções de Negócio
│   │   │   │   ├── DomainException.ts
│   │   │   │   ├── BusinessRuleException.ts
│   │   │   │   ├── ValidationException.ts
│   │   │   │   ├── InsufficientStockException.ts
│   │   │   │   ├── InvalidMovementException.ts
│   │   │   │   └── ConcurrencyException.ts
│   │   │   │
│   │   │   ├── repositories/             # Interfaces de Repositórios
│   │   │   │   ├── EquipmentRepository.ts (interface)
│   │   │   │   ├── MovementRepository.ts (interface)
│   │   │   │   ├── KitRepository.ts (interface)
│   │   │   │   ├── WorkOrderRepository.ts (interface)
│   │   │   │   ├── UserRepository.ts (interface)
│   │   │   │   ├── ClientRepository.ts (interface)
│   │   │   │   └── AuditLogRepository.ts (interface)
│   │   │   │
│   │   │   ├── specifications/           # Domain Specifications
│   │   │   │   ├─ EquipmentAvailabilitySpec.ts
│   │   │   │   ├─ MovementValidationSpec.ts
│   │   │   │   └─ KitCompletionSpec.ts
│   │   │   │
│   │   │   └── services/                 # Domain Services
│   │   │       ├── EquipmentMovementDomainService.ts
│   │   │       ├── StockValidationDomainService.ts
│   │   │       └── AuditDomainService.ts
│   │   │
│   │   ├── application/                  # Casos de Uso e Serviços de Aplicação
│   │   │   │
│   │   │   ├── dtos/                     # Data Transfer Objects
│   │   │   │   ├── equipment/
│   │   │   │   │   ├── CreateEquipmentDTO.ts
│   │   │   │   │   ├── UpdateEquipmentDTO.ts
│   │   │   │   │   ├── EquipmentResponseDTO.ts
│   │   │   │   │   └── EquipmentListItemDTO.ts
│   │   │   │   │
│   │   │   │   ├── movement/
│   │   │   │   │   ├── RegisterMovementDTO.ts
│   │   │   │   │   ├── MovementResponseDTO.ts
│   │   │   │   │   └── MovementHistoryDTO.ts
│   │   │   │   │
│   │   │   │   ├── kit/
│   │   │   │   │   ├── CreateKitDTO.ts
│   │   │   │   │   ├── KitResponseDTO.ts
│   │   │   │   │   └── KitWithItemsDTO.ts
│   │   │   │   │
│   │   │   │   ├── workOrder/
│   │   │   │   │   ├── CreateWorkOrderDTO.ts
│   │   │   │   │   ├── WorkOrderResponseDTO.ts
│   │   │   │   │   └── WorkOrderDetailDTO.ts
│   │   │   │   │
│   │   │   │   └── pagination/
│   │   │   │       ├── PaginatedDTO.ts
│   │   │   │       └── CursorPaginationDTO.ts
│   │   │   │
│   │   │   ├── use-cases/                # Casos de Uso
│   │   │   │   │
│   │   │   │   ├── equipment/
│   │   │   │   │   ├── CreateEquipmentUseCase.ts
│   │   │   │   │   ├── UpdateEquipmentUseCase.ts
│   │   │   │   │   ├── ListEquipmentsUseCase.ts
│   │   │   │   │   ├── GetEquipmentDetailUseCase.ts
│   │   │   │   │   ├── DeleteEquipmentUseCase.ts
│   │   │   │   │   └── SearchEquipmentsUseCase.ts
│   │   │   │   │
│   │   │   │   ├── movement/
│   │   │   │   │   ├── RegisterMovementUseCase.ts
│   │   │   │   │   ├── ListMovementsUseCase.ts
│   │   │   │   │   ├── GetMovementHistoryUseCase.ts
│   │   │   │   │   └── UndoMovementUseCase.ts
│   │   │   │   │
│   │   │   │   ├── kit/
│   │   │   │   │   ├── CreateKitUseCase.ts
│   │   │   │   │   ├── AddItemToKitUseCase.ts
│   │   │   │   │   ├── RemoveItemFromKitUseCase.ts
│   │   │   │   │   ├── CheckoutKitUseCase.ts
│   │   │   │   │   └── ReturnKitUseCase.ts
│   │   │   │   │
│   │   │   │   ├── workOrder/
│   │   │   │   │   ├── CreateWorkOrderUseCase.ts
│   │   │   │   │   ├── AssignEquipmentUseCase.ts
│   │   │   │   │   ├── CheckoutEquipmentUseCase.ts
│   │   │   │   │   ├── ReturnEquipmentUseCase.ts
│   │   │   │   │   ├── CompleteWorkOrderUseCase.ts
│   │   │   │   │   └── CancelWorkOrderUseCase.ts
│   │   │   │   │
│   │   │   │   └── auth/
│   │   │   │       ├── LoginUseCase.ts
│   │   │   │       ├── RegisterUseCase.ts
│   │   │   │       ├── LogoutUseCase.ts
│   │   │   │       └── RefreshTokenUseCase.ts
│   │   │   │
│   │   │   ├── mappers/                  # DTOs ↔ Entities
│   │   │   │   ├── EquipmentMapper.ts
│   │   │   │   ├── MovementMapper.ts
│   │   │   │   ├── KitMapper.ts
│   │   │   │   └── WorkOrderMapper.ts
│   │   │   │
│   │   │   ├── services/                 # Services de Aplicação
│   │   │   │   ├── EquipmentService.ts
│   │   │   │   ├── MovementService.ts
│   │   │   │   ├── KitService.ts
│   │   │   │   ├── WorkOrderService.ts
│   │   │   │   ├── ClientService.ts
│   │   │   │   ├── AuthService.ts
│   │   │   │   ├── AuditService.ts
│   │   │   │   └── ReportService.ts
│   │   │   │
│   │   │   └── ports/                   # Interfaces para acesso externo
│   │   │       ├── EquipmentServicePort.ts
│   │   │       ├── AuthServicePort.ts
│   │   │       └── AuditServicePort.ts
│   │   │
│   │   └── infrastructure/               # Implementação de Acesso a Dados
│   │       │
│   │       ├── persistence/
│   │       │   ├── repositories/         # Implementações concretas
│   │       │   │   ├── SupabaseEquipmentRepository.ts
│   │       │   │   ├── SupabaseMovementRepository.ts
│   │       │   │   ├── SupabaseKitRepository.ts
│   │       │   │   ├── SupabaseWorkOrderRepository.ts
│   │       │   │   ├── SupabaseUserRepository.ts
│   │       │   │   ├── SupabaseClientRepository.ts
│   │       │   │   └── SupabaseAuditLogRepository.ts
│   │       │   │
│   │       │   └── database/
│   │       │       ├── supabase.ts      # Client Supabase
│   │       │       ├── migrations/      # SQL migrations
│   │       │       │   ├── 001_initial_schema.sql
│   │       │       │   ├── 002_rls_policies.sql
│   │       │       │   ├── 003_audit_tables.sql
│   │       │       │   ├── 004_constraints.sql
│   │       │       │   ├── 005_indexes.sql
│   │       │       │   ├── 006_soft_deletes.sql
│   │       │       │   ├── 007_versioning.sql
│   │       │       │   └── 008_triggers.sql
│   │       │       │
│   │       │       └── types/
│   │       │           └── index.ts     # Database types (auto-generated)
│   │       │
│   │       ├── authentication/
│   │       │   ├── SupabaseAuthProvider.ts
│   │       │   ├── JwtDecoder.ts
│   │       │   └── TokenRefresher.ts
│   │       │
│   │       ├── logging/
│   │       │   ├── Logger.ts
│   │       │   ├── ConsoleLogger.ts
│   │       │   ├── FileLogger.ts
│   │       │   └── CloudLogger.ts
│   │       │
│   │       ├── external/
│   │       │   ├── EmailService.ts
│   │       │   ├── StorageService.ts (S3/Cloud storage)
│   │       │   └── NotificationService.ts
│   │       │
│   │       └── caching/
│   │           ├── CacheProvider.ts (interface)
│   │           ├── MemoryCacheProvider.ts
│   │           └── RedisCacheProvider.ts
│   │
│   ├── presentation/                     # ⭐ CAMADA DE APRESENTAÇÃO (React)
│   │   │
│   │   ├── routes/                       # TanStack Router
│   │   │   ├── __root.tsx               # Root layout
│   │   │   │
│   │   │   ├── _authenticated.tsx       # Auth guard layout
│   │   │   │
│   │   │   └── _authenticated/
│   │   │       ├── index.tsx            # Dashboard
│   │   │       ├── equipments.tsx
│   │   │       ├── kits.tsx
│   │   │       ├── movements.tsx
│   │   │       ├── work-orders.tsx
│   │   │       ├── users.tsx
│   │   │       ├── schedule.tsx
│   │   │       ├── maintenance.tsx
│   │   │       └── settings.tsx
│   │   │
│   │   ├── features/                     # Feature modules
│   │   │   │
│   │   │   ├── equipments/
│   │   │   │   ├── containers/          # Smart components
│   │   │   │   │   └── EquipmentsPage.tsx
│   │   │   │   │
│   │   │   │   ├── components/          # Dumb components
│   │   │   │   │   ├── EquipmentsList.tsx
│   │   │   │   │   ├── EquipmentRow.tsx
│   │   │   │   │   ├── EquipmentFilters.tsx
│   │   │   │   │   ├── CreateEquipmentDialog.tsx
│   │   │   │   │   ├── EditEquipmentDialog.tsx
│   │   │   │   │   ├── EquipmentDetail.tsx
│   │   │   │   │   └── DeleteEquipmentConfirm.tsx
│   │   │   │   │
│   │   │   │   ├── hooks/
│   │   │   │   │   ├── useEquipments.ts
│   │   │   │   │   ├── useEquipment.ts
│   │   │   │   │   ├── useCreateEquipment.ts
│   │   │   │   │   ├── useUpdateEquipment.ts
│   │   │   │   │   └── useDeleteEquipment.ts
│   │   │   │   │
│   │   │   │   └── types/
│   │   │   │       └── index.ts
│   │   │   │
│   │   │   ├── movements/
│   │   │   │   ├── containers/
│   │   │   │   │   └── MovementsPage.tsx
│   │   │   │   │
│   │   │   │   ├── components/
│   │   │   │   │   ├── MovementsList.tsx
│   │   │   │   │   ├── MovementRow.tsx
│   │   │   │   │   ├── RegisterMovementDialog.tsx
│   │   │   │   │   ├── MovementHistory.tsx
│   │   │   │   │   └── MovementDetail.tsx
│   │   │   │   │
│   │   │   │   ├── hooks/
│   │   │   │   │   ├── useMovements.ts
│   │   │   │   │   ├── useRegisterMovement.ts
│   │   │   │   │   └── useMovementHistory.ts
│   │   │   │   │
│   │   │   │   └── types/
│   │   │   │       └── index.ts
│   │   │   │
│   │   │   ├── kits/
│   │   │   │   ├── containers/
│   │   │   │   ├── components/
│   │   │   │   ├── hooks/
│   │   │   │   └── types/
│   │   │   │
│   │   │   ├── workOrders/
│   │   │   │   ├── containers/
│   │   │   │   ├── components/
│   │   │   │   ├── hooks/
│   │   │   │   └── types/
│   │   │   │
│   │   │   ├── users/
│   │   │   │   ├── containers/
│   │   │   │   ├── components/
│   │   │   │   ├── hooks/
│   │   │   │   └── types/
│   │   │   │
│   │   │   ├── maintenance/
│   │   │   │   ├── containers/
│   │   │   │   ├── components/
│   │   │   │   ├── hooks/
│   │   │   │   └── types/
│   │   │   │
│   │   │   ├── schedule/
│   │   │   │   ├── containers/
│   │   │   │   ├── components/
│   │   │   │   ├── hooks/
│   │   │   │   └── types/
│   │   │   │
│   │   │   ├── dashboard/
│   │   │   │   ├── containers/
│   │   │   │   │   └── DashboardPage.tsx
│   │   │   │   │
│   │   │   │   ├── components/
│   │   │   │   │   ├── DashboardGrid.tsx
│   │   │   │   │   ├── MetricsCard.tsx
│   │   │   │   │   ├── StockChart.tsx
│   │   │   │   │   ├── RecentMovements.tsx
│   │   │   │   │   ├── UpcomingSchedule.tsx
│   │   │   │   │   └── SystemHealth.tsx
│   │   │   │   │
│   │   │   │   ├── hooks/
│   │   │   │   │   ├── useDashboardMetrics.ts
│   │   │   │   │   └── useDashboardData.ts
│   │   │   │   │
│   │   │   │   └── types/
│   │   │   │       └── index.ts
│   │   │   │
│   │   │   └── auth/
│   │   │       ├── containers/
│   │   │       ├── components/
│   │   │       ├── hooks/
│   │   │       └── types/
│   │   │
│   │   ├── components/
│   │   │   ├── shared/                  # Componentes compartilhados
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── Footer.tsx
│   │   │   │   ├── Navigation.tsx
│   │   │   │   ├── Breadcrumb.tsx
│   │   │   │   ├── NotificationBell.tsx
│   │   │   │   ├── UserMenu.tsx
│   │   │   │   └── SearchBar.tsx
│   │   │   │
│   │   │   ├── layout/
│   │   │   │   ├── AppShell.tsx
│   │   │   │   ├── AppSidebar.tsx
│   │   │   │   ├── Topbar.tsx
│   │   │   │   ├── MainLayout.tsx
│   │   │   │   ├── AuthLayout.tsx
│   │   │   │   └── ErrorLayout.tsx
│   │   │   │
│   │   │   ├── data-display/            # Componentes de exibição
│   │   │   │   ├── DataTable.tsx
│   │   │   │   ├── DataGrid.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Stats.tsx
│   │   │   │   └── EmptyState.tsx
│   │   │   │
│   │   │   ├── forms/                   # Componentes de formulário
│   │   │   │   ├── FormField.tsx
│   │   │   │   ├── FormGrid.tsx
│   │   │   │   ├── FormSection.tsx
│   │   │   │   └── FileUpload.tsx
│   │   │   │
│   │   │   ├── modals/                  # Componentes de modal
│   │   │   │   ├── Modal.tsx
│   │   │   │   ├── ConfirmDialog.tsx
│   │   │   │   └── LoadingModal.tsx
│   │   │   │
│   │   │   ├── feedback/                # Feedback ao usuário
│   │   │   │   ├── Toast.tsx
│   │   │   │   ├── Alert.tsx
│   │   │   │   ├── Skeleton.tsx
│   │   │   │   └── LoadingSpinner.tsx
│   │   │   │
│   │   │   ├── ui/                      # Radix UI wrapped
│   │   │   │   ├── accordion.tsx
│   │   │   │   ├── alert.tsx
│   │   │   │   ├── badge.tsx
│   │   │   │   ├── button.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── checkbox.tsx
│   │   │   │   ├── dialog.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   ├── label.tsx
│   │   │   │   ├── popover.tsx
│   │   │   │   ├── select.tsx
│   │   │   │   ├── tabs.tsx
│   │   │   │   ├── textarea.tsx
│   │   │   │   ├── toggle.tsx
│   │   │   │   ├── tooltip.tsx
│   │   │   │   └── ... (mais componentes UI)
│   │   │   │
│   │   │   └── PageHeader.tsx            # Common page header
│   │   │
│   │   ├── hooks/                        # Custom Hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── useRoles.ts
│   │   │   ├── usePagination.ts
│   │   │   ├── useDebounce.ts
│   │   │   ├── useMutation.ts
│   │   │   ├── useNotification.ts
│   │   │   ├── useLocalStorage.ts
│   │   │   ├── useAsync.ts
│   │   │   ├── useFormik.ts
│   │   │   └── ... (mais hooks)
│   │   │
│   │   ├── context/                     # React Context
│   │   │   ├── AuthContext.tsx
│   │   │   ├── ThemeContext.tsx
│   │   │   ├── NotificationContext.tsx
│   │   │   └── ModalContext.tsx
│   │   │
│   │   ├── providers/                   # Context Providers
│   │   │   ├── AuthProvider.tsx
│   │   │   ├── ThemeProvider.tsx
│   │   │   ├── NotificationProvider.tsx
│   │   │   └── ModalProvider.tsx
│   │   │
│   │   └── styles/
│   │       └── ... (CSS/Tailwind)
│   │
│   ├── shared/                           # ⭐ CÓDIGO COMPARTILHADO
│   │   │
│   │   ├── constants/
│   │   │   ├── equipmentStatus.ts
│   │   │   ├── movementTypes.ts
│   │   │   ├── userRoles.ts
│   │   │   ├── workOrderPriorities.ts
│   │   │   ├── messages.ts
│   │   │   ├── validation.ts
│   │   │   └── api.ts
│   │   │
│   │   ├── types/
│   │   │   ├── common.ts                # Tipos comuns
│   │   │   ├── pagination.ts
│   │   │   ├── error.ts
│   │   │   ├── api.ts
│   │   │   ├── validation.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── validations/
│   │   │   ├── schemas/
│   │   │   │   ├── equipmentSchemas.ts  # Zod schemas
│   │   │   │   ├── movementSchemas.ts
│   │   │   │   ├── kitSchemas.ts
│   │   │   │   ├── workOrderSchemas.ts
│   │   │   │   ├── userSchemas.ts
│   │   │   │   └── authSchemas.ts
│   │   │   │
│   │   │   └── validators.ts
│   │   │
│   │   ├── utils/
│   │   │   ├── cn.ts
│   │   │   ├── formatters.ts
│   │   │   ├── dateHelpers.ts
│   │   │   ├── numberHelpers.ts
│   │   │   ├── stringHelpers.ts
│   │   │   ├── arrayHelpers.ts
│   │   │   ├── objectHelpers.ts
│   │   │   ├── parseHelpers.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── adapters/
│   │   │   ├── errorAdapter.ts
│   │   │   ├── dateAdapter.ts
│   │   │   ├── responseAdapter.ts
│   │   │   └── exceptionAdapter.ts
│   │   │
│   │   ├── errors/
│   │   │   ├── AppError.ts              # Base error
│   │   │   ├── ValidationError.ts
│   │   │   ├── NotFoundError.ts
│   │   │   ├── UnauthorizedError.ts
│   │   │   ├── ForbiddenError.ts
│   │   │   ├── ConflictError.ts
│   │   │   ├── ServerError.ts
│   │   │   └── NetworkError.ts
│   │   │
│   │   └── mocks/
│   │       ├── handlers.ts              # MSW handlers (testing)
│   │       ├── factories/
│   │       │   ├── EquipmentFactory.ts
│   │       │   ├── MovementFactory.ts
│   │       │   └── ...
│   │       └── data/
│   │           └── fixtures.ts
│   │
│   ├── config/                           # ⭐ CONFIGURAÇÃO
│   │   ├── di.ts                        # Dependency Injection container
│   │   ├── env.ts                       # Environment variables
│   │   ├── logger.ts                    # Logger setup
│   │   └── apollo.ts                    # (Opcional) GraphQL setup
│   │
│   ├── router.tsx                        # TanStack Router setup
│   ├── server.ts                         # SSR entry point
│   ├── start.ts                          # Client entry point
│   └── styles.css                        # Global styles
│
├── tests/                                 # ⭐ TESTES
│   ├── unit/
│   │   ├── core/
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   ├── exceptions/
│   │   │   │   └── services/
│   │   │   │
│   │   │   └── application/
│   │   │       ├── use-cases/
│   │   │       ├── services/
│   │   │       └── mappers/
│   │   │
│   │   └── shared/
│   │       ├── utils/
│   │       ├── validations/
│   │       └── adapters/
│   │
│   ├── integration/
│   │   ├── equipment/
│   │   ├── movement/
│   │   ├── kit/
│   │   ├── workOrder/
│   │   └── auth/
│   │
│   └── e2e/
│       ├── equipment-flow.spec.ts
│       ├── movement-flow.spec.ts
│       ├── kit-flow.spec.ts
│       ├── work-order-flow.spec.ts
│       └── auth-flow.spec.ts
│
├── docs/                                  # Documentação
│   ├── ARCHITECTURE.md
│   ├── API.md
│   ├── DATABASE.md
│   ├── SECURITY.md
│   ├── DEPLOYMENT.md
│   ├── CONTRIBUTING.md
│   ├── DOMAIN_RULES.md
│   └── TESTING.md
│
├── .github/
│   └── workflows/
│       ├── tests.yml
│       ├── lint.yml
│       └── deploy.yml
│
├── ANALISE_PROFISSIONAL.md               # Esta análise
├── SUMARIO_EXECUTIVO.md
├── ESTRUTURA_ALVO.md                     # Este documento
│
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
├── eslint.config.js
├── prettier.config.js
├── vitest.config.ts                      # Testing config
├── wrangler.jsonc
└── README.md
```

---

## 📊 COMPARAÇÃO: ANTES vs DEPOIS

### ANTES (Atual)
```
src/
├── components/           (50+ files misturados)
├── routes/              (9 arquivos sem contexto)
├── hooks/               (2 hooks genéricos)
├── lib/                 (utils soltos)
└── integrations/        (apenas Supabase)

Problemas:
❌ Lógica espalhada
❌ Difícil de manter
❌ Sem testes
❌ Acoplamento alto
❌ Sem padrões
```

### DEPOIS (Refatorado)
```
src/
├── core/                (Domain + Application + Infrastructure)
├── presentation/        (Componentes + Routes + Hooks organizados)
├── shared/              (Constants + Types + Utils centralizados)
└── config/              (DI + Env + Logger)

Benefícios:
✅ Separação clara de responsabilidades
✅ Fácil de testar
✅ Fácil de manter
✅ Reutilizável
✅ Escalável
✅ Documentado
```

---

## 🎯 ORGANIZAÇÃO POR FEATURE

### Exemplo: Equipments Feature

```
src/presentation/features/equipments/
│
├── containers/
│   └── EquipmentsPage.tsx              # Página inteira (container)
│
├── components/
│   ├── EquipmentsList.tsx              # Lista de equipamentos
│   ├── EquipmentRow.tsx                # Linha da tabela
│   ├── EquipmentFilters.tsx            # Filtros
│   ├── CreateEquipmentDialog.tsx       # Modal de criação
│   ├── EditEquipmentDialog.tsx         # Modal de edição
│   ├── EquipmentDetail.tsx             # Detalhe completo
│   └── DeleteEquipmentConfirm.tsx      # Confirmação de deleção
│
├── hooks/
│   ├── useEquipments.ts                # Lista paginada
│   ├── useEquipment.ts                 # Detalhe
│   ├── useCreateEquipment.ts           # Criar
│   ├── useUpdateEquipment.ts           # Atualizar
│   ├── useDeleteEquipment.ts           # Deletar
│   └── useSearchEquipments.ts          # Busca
│
└── types/
    └── index.ts                        # Tipos específicos da feature
```

**Todos os arquivos da feature de equipamentos em um único folder!**

---

## 🔄 FLOW DE DADOS

### Antes (Atual)
```
Componente
    ↓
supabase.from().select()  ← Acoplado!
    ↓
Estado local
```

### Depois (Refatorado)
```
Componente (useEquipments hook)
    ↓
Equipment Service (Application Layer)
    ↓
Equipment Repository (Interface)
    ↓
SupabaseEquipmentRepository (Implementation)
    ↓
Supabase Client
```

**Separação clara de responsabilidades!**

---

## ✨ BENEFÍCIOS DA NOVA ESTRUTURA

| Aspecto | Antes | Depois |
|---------|-------|--------|
| **Testabilidade** | ❌ Impossível | ✅ Fácil (mocks, stubs) |
| **Reutilização** | ❌ Lógica duplicada | ✅ Services reutilizáveis |
| **Escalabilidade** | ❌ Crescimento difícil | ✅ Preparado para crescer |
| **Manutenção** | ❌ Lenta, perigosa | ✅ Rápida, segura |
| **Onboarding** | ❌ 3-4 semanas | ✅ 1 semana |
| **Refatoração** | ❌ Perigosa | ✅ Segura (testes) |
| **Performance** | ❌ Lenta | ✅ Otimizada |
| **Escalabilidade BD** | ❌ 100k max | ✅ Sem limite |

---

## 📝 PRÓXIMOS PASSOS

1. ✅ **FEITO**: Análise completa
2. ✅ **FEITO**: Documento de estrutura alvo
3. ⏭️ **PRÓXIMO**: Iniciar refatoração (Fase 1)
4. ⏭️ **DEPOIS**: Implementar todas as fases

---

**Estrutura salva em**: `/ESTRUTURA_ALVO.md`
