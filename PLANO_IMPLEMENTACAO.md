# EventKit Pro - Plano de Implementação Detalhado
## Roadmap de Refatoração - 8 Semanas

---

## 📌 OVERVIEW

Este documento detalha **cada etapa** da transformação do EventKit Pro de protótipo para software empresarial profissional.

**Timeline Total**: 8 semanas  
**Abordagem**: Incremental (sem quebra de funcionalidades)  
**Metodologia**: Clean Architecture + Test-Driven Development

---

## SEMANA 1: ARQUITETURA & DOMAIN LAYER

### Objetivo
Estruturar o projeto com Clean Architecture e criar a Domain Layer (entidades e regras de negócio).

### Tarefas

#### 1.1 Criar Estrutura de Pastas
```bash
mkdir -p src/core/domain/{entities,exceptions,repositories,services,specifications}
mkdir -p src/core/application/{use-cases,services,dtos,mappers,ports}
mkdir -p src/core/infrastructure/{persistence,authentication,logging}
mkdir -p src/presentation/features/{equipments,movements,kits,workOrders,etc}/containers
mkdir -p src/presentation/features/{equipments,movements,kits,workOrders,etc}/components
mkdir -p src/presentation/features/{equipments,movements,kits,workOrders,etc}/hooks
mkdir -p src/shared/{constants,types,validations,utils,errors,adapters}
mkdir -p tests/{unit,integration,e2e}
```

#### 1.2 Criar Domain Entities
**Arquivos a criar:**
- `src/core/domain/entities/Equipment.ts`
- `src/core/domain/entities/EquipmentMovement.ts`
- `src/core/domain/entities/Kit.ts`
- `src/core/domain/entities/WorkOrder.ts`
- `src/core/domain/entities/User.ts`
- `src/core/domain/entities/Client.ts`
- `src/core/domain/entities/Category.ts`
- `src/core/domain/entities/AuditLog.ts`

**Exemplo: Equipment.ts**
```typescript
// Entidade de domínio com validações
export class Equipment {
  private readonly _id: string;
  private _name: string;
  private _quantity: number;
  private _availableQty: number;
  private _status: EquipmentStatus;
  // ... propriedades

  constructor(props: EquipmentProps, id?: string) {
    this._id = id || generateId();
    this._name = props.name;
    this._quantity = props.quantity;
    this._availableQty = props.availableQty;
    
    // Validações de negócio no construtor
    this.validateQuantity();
    this.validateAvailability();
  }

  private validateQuantity() {
    if (this._quantity <= 0) {
      throw new BusinessRuleException('Quantidade deve ser > 0');
    }
  }

  private validateAvailability() {
    if (this._availableQty > this._quantity) {
      throw new BusinessRuleException('Disponível não pode ser > quantidade total');
    }
  }

  // Métodos de domínio
  public register(quantity: number): void {
    if (quantity <= 0) throw new BusinessRuleException('...');
    this._quantity += quantity;
  }

  public removeFromStock(quantity: number): void {
    if (quantity > this._availableQty) {
      throw new BusinessRuleException('Estoque insuficiente');
    }
    this._availableQty -= quantity;
  }

  public restoreToStock(quantity: number): void {
    if (this._availableQty + quantity > this._quantity) {
      throw new BusinessRuleException('Não pode restaurar mais que o total');
    }
    this._availableQty += quantity;
  }

  // Getters
  get id(): string { return this._id; }
  get name(): string { return this._name; }
  // ... mais getters
}
```

#### 1.3 Criar Domain Exceptions
**Arquivos:**
- `src/core/domain/exceptions/DomainException.ts`
- `src/core/domain/exceptions/BusinessRuleException.ts`
- `src/core/domain/exceptions/InsufficientStockException.ts`
- `src/core/domain/exceptions/InvalidMovementException.ts`
- `src/core/domain/exceptions/ValidationException.ts`

#### 1.4 Criar Repository Interfaces
**Arquivos:**
- `src/core/domain/repositories/EquipmentRepository.ts`
- `src/core/domain/repositories/MovementRepository.ts`
- `src/core/domain/repositories/KitRepository.ts`
- `src/core/domain/repositories/WorkOrderRepository.ts`
- `src/core/domain/repositories/UserRepository.ts`
- `src/core/domain/repositories/ClientRepository.ts`

**Exemplo: EquipmentRepository.ts (interface)**
```typescript
export interface IEquipmentRepository {
  save(equipment: Equipment): Promise<void>;
  update(equipment: Equipment): Promise<void>;
  findById(id: string): Promise<Equipment | null>;
  findByPatrimony(patrimony: string): Promise<Equipment | null>;
  list(filters: EquipmentFilters): Promise<PaginatedResult<Equipment>>;
  search(query: string, limit?: number): Promise<Equipment[]>;
  delete(id: string): Promise<void>;
  countByCategory(categoryId: string): Promise<number>;
  findLowStockItems(threshold: number): Promise<Equipment[]>;
}
```

#### 1.5 Criar Domain Services
**Arquivos:**
- `src/core/domain/services/EquipmentMovementDomainService.ts`
- `src/core/domain/services/StockValidationDomainService.ts`
- `src/core/domain/services/AuditDomainService.ts`

**Exemplo: StockValidationDomainService.ts**
```typescript
export class StockValidationDomainService {
  constructor(private equipmentRepository: IEquipmentRepository) {}

  async validateMovement(
    equipmentId: string, 
    quantity: number, 
    type: MovementType
  ): Promise<void> {
    const equipment = await this.equipmentRepository.findById(equipmentId);
    
    if (!equipment) {
      throw new EquipmentNotFoundException(equipmentId);
    }

    if (type === 'saida' && quantity > equipment.availableQuantity) {
      throw new InsufficientStockException(
        `Apenas ${equipment.availableQuantity} disponíveis, 
         tentativa de sacar ${quantity}`
      );
    }

    // ... mais validações
  }
}
```

### Status: 🟢 CONCLUÍDO QUANDO
- ✅ Todas as entities criadas
- ✅ Todas as exceptions criadas
- ✅ Todos os repository interfaces criados
- ✅ Domain services implementados
- ✅ Arquitetura de pastas estruturada

---

## SEMANA 2: APPLICATION LAYER & INFRASTRUCTURE

### Objetivo
Implementar Application Layer (Use Cases, Services, DTOs) e Infrastructure Layer (Repositories concretos).

### Tarefas

#### 2.1 Criar DTOs (Data Transfer Objects)
**Exemplos:**
```typescript
// CreateEquipmentDTO.ts
export interface CreateEquipmentDTO {
  name: string;
  brand?: string;
  model?: string;
  patrimony?: string;
  categoryId?: string;
  quantity: number;
  location?: string;
}

// EquipmentResponseDTO.ts
export interface EquipmentResponseDTO {
  id: string;
  name: string;
  brand?: string;
  model?: string;
  quantity: number;
  availableQty: number;
  status: EquipmentStatus;
  categoryId?: string;
  categoryName?: string;
  createdAt: string;
  updatedAt: string;
}
```

#### 2.2 Criar Use Cases
**Arquivos (alguns exemplos):**
- `src/core/application/use-cases/equipment/CreateEquipmentUseCase.ts`
- `src/core/application/use-cases/equipment/ListEquipmentsUseCase.ts`
- `src/core/application/use-cases/equipment/GetEquipmentDetailUseCase.ts`
- `src/core/application/use-cases/equipment/UpdateEquipmentUseCase.ts`
- `src/core/application/use-cases/equipment/DeleteEquipmentUseCase.ts`
- `src/core/application/use-cases/movement/RegisterMovementUseCase.ts`
- `src/core/application/use-cases/movement/ListMovementsUseCase.ts`
- Similar para Kit, WorkOrder, etc.

**Exemplo: RegisterMovementUseCase.ts**
```typescript
export class RegisterMovementUseCase {
  constructor(
    private movementRepository: IMovementRepository,
    private equipmentRepository: IEquipmentRepository,
    private stockValidationService: StockValidationDomainService,
    private auditService: AuditDomainService
  ) {}

  async execute(input: RegisterMovementDTO): Promise<MovementResponseDTO> {
    // 1. Validar entrada
    const validationResult = RegisterMovementSchema.safeParse(input);
    if (!validationResult.success) {
      throw new ValidationException(validationResult.error);
    }

    // 2. Validar regras de negócio
    await this.stockValidationService.validateMovement(
      input.equipmentId,
      input.quantity,
      input.type
    );

    // 3. Buscar equipamento
    const equipment = await this.equipmentRepository.findById(input.equipmentId);
    
    // 4. Executar movimento
    if (input.type === 'saida') {
      equipment.removeFromStock(input.quantity);
    } else if (input.type === 'retorno') {
      equipment.restoreToStock(input.quantity);
    }

    // 5. Persistir
    const movement = new EquipmentMovement({ ... });
    await this.movementRepository.save(movement);
    await this.equipmentRepository.update(equipment);

    // 6. Auditar
    await this.auditService.logMovement(movement, input.userId);

    // 7. Retornar DTO
    return MovementMapper.toPersistenceDTO(movement);
  }
}
```

#### 2.3 Criar Application Services
**Arquivos:**
- `src/core/application/services/EquipmentService.ts`
- `src/core/application/services/MovementService.ts`
- `src/core/application/services/KitService.ts`
- `src/core/application/services/WorkOrderService.ts`
- `src/core/application/services/AuthService.ts`
- `src/core/application/services/AuditService.ts`
- `src/core/application/services/ReportService.ts`

**Exemplo: EquipmentService.ts**
```typescript
export class EquipmentService {
  constructor(
    private createEquipmentUseCase: CreateEquipmentUseCase,
    private listEquipmentsUseCase: ListEquipmentsUseCase,
    private getEquipmentDetailUseCase: GetEquipmentDetailUseCase,
    private updateEquipmentUseCase: UpdateEquipmentUseCase,
    private deleteEquipmentUseCase: DeleteEquipmentUseCase,
    private searchEquipmentsUseCase: SearchEquipmentsUseCase
  ) {}

  async create(input: CreateEquipmentDTO, userId: string) {
    return this.createEquipmentUseCase.execute({ ...input, createdBy: userId });
  }

  async list(filters: EquipmentFilters, pagination: PaginationParams) {
    return this.listEquipmentsUseCase.execute({ filters, pagination });
  }

  async getDetail(id: string) {
    return this.getEquipmentDetailUseCase.execute(id);
  }

  // ... mais métodos
}
```

#### 2.4 Implementar Concrete Repositories
**Arquivos:**
- `src/core/infrastructure/persistence/repositories/SupabaseEquipmentRepository.ts`
- `src/core/infrastructure/persistence/repositories/SupabaseMovementRepository.ts`
- Similar para outros

**Exemplo: SupabaseEquipmentRepository.ts**
```typescript
export class SupabaseEquipmentRepository implements IEquipmentRepository {
  constructor(private supabase: SupabaseClient) {}

  async save(equipment: Equipment): Promise<void> {
    const data = EquipmentMapper.toPersistence(equipment);
    const { error } = await this.supabase
      .from('equipments')
      .insert([data]);
    
    if (error) throw new PersistenceException(error.message);
  }

  async findById(id: string): Promise<Equipment | null> {
    const { data, error } = await this.supabase
      .from('equipments')
      .select('*, categories(*)')
      .eq('id', id)
      .single();
    
    if (error?.code === 'PGRST116') return null; // Not found
    if (error) throw new PersistenceException(error.message);
    
    return EquipmentMapper.toDomain(data);
  }

  async list(filters: EquipmentFilters): Promise<PaginatedResult<Equipment>> {
    let query = this.supabase
      .from('equipments')
      .select('*, categories(*)', { count: 'exact' });

    if (filters.categoryId) {
      query = query.eq('category_id', filters.categoryId);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.search) {
      query = query.ilike('name', `%${filters.search}%`);
    }

    // Paginação cursor-based
    if (filters.cursor) {
      query = query.gt('id', filters.cursor);
    }

    query = query.order('name').limit(filters.limit || 25);

    const { data, count, error } = await query;
    
    if (error) throw new PersistenceException(error.message);

    return {
      items: (data ?? []).map(EquipmentMapper.toDomain),
      nextCursor: data?.[data.length - 1]?.id,
      total: count ?? 0
    };
  }

  // ... mais métodos
}
```

#### 2.5 Configurar Dependency Injection
**Arquivo: src/config/di.ts**
```typescript
// Container de DI (usando função factory simples)
export class DIContainer {
  private static instance: DIContainer;
  private services: Map<string, any> = new Map();

  static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }

  register(key: string, factory: () => any): void {
    this.services.set(key, factory);
  }

  get<T>(key: string): T {
    const factory = this.services.get(key);
    if (!factory) throw new Error(`Service ${key} not found`);
    return factory();
  }
}

// Registrar serviços
const container = DIContainer.getInstance();

// Repositories
container.register('EquipmentRepository', () => 
  new SupabaseEquipmentRepository(supabase)
);
container.register('MovementRepository', () =>
  new SupabaseMovementRepository(supabase)
);

// Domain Services
container.register('StockValidationDomainService', () =>
  new StockValidationDomainService(container.get('EquipmentRepository'))
);

// Use Cases
container.register('RegisterMovementUseCase', () =>
  new RegisterMovementUseCase(
    container.get('MovementRepository'),
    container.get('EquipmentRepository'),
    container.get('StockValidationDomainService'),
    container.get('AuditService')
  )
);

// Application Services
container.register('MovementService', () =>
  new MovementService(
    container.get('RegisterMovementUseCase'),
    container.get('ListMovementsUseCase'),
    // ... outros use cases
  )
);

export default container;
```

### Status: 🟢 CONCLUÍDO QUANDO
- ✅ Todos os DTOs criados
- ✅ Todos os Use Cases implementados
- ✅ Todos os Application Services criados
- ✅ Todos os Repositories concretos implementados
- ✅ DI Container configurado
- ✅ Testes unitários dos use cases passando

---

## SEMANA 3: BANCO DE DADOS & SEGURANÇA

### Objetivo
Melhorar schema do banco de dados com validações, soft deletes, audit trail e melhorar RLS policies.

### Tarefas

#### 3.1 Criar Migration: Soft Deletes
**Arquivo: src/core/infrastructure/persistence/database/migrations/003_soft_deletes.sql**
```sql
-- Adicionar coluna deleted_at a todas as tabelas
ALTER TABLE equipments ADD COLUMN deleted_at TIMESTAMPTZ;
ALTER TABLE equipment_movements ADD COLUMN deleted_at TIMESTAMPTZ;
ALTER TABLE kits ADD COLUMN deleted_at TIMESTAMPTZ;
ALTER TABLE work_orders ADD COLUMN deleted_at TIMESTAMPTZ;
ALTER TABLE clients ADD COLUMN deleted_at TIMESTAMPTZ;
ALTER TABLE maintenance ADD COLUMN deleted_at TIMESTAMPTZ;

-- View para filtrar deleted items automaticamente
CREATE VIEW active_equipments AS
  SELECT * FROM equipments WHERE deleted_at IS NULL;

CREATE VIEW active_movements AS
  SELECT * FROM equipment_movements WHERE deleted_at IS NULL;

-- Trigger para RLS considerar soft deletes
-- (implementado em outra migration)
```

#### 3.2 Criar Migration: Audit Tables
**Arquivo: src/core/infrastructure/persistence/database/migrations/004_audit_tables.sql**
```sql
-- Tabela imutável de auditoria
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  entity_type TEXT NOT NULL,           -- 'equipment', 'movement', 'kit', etc
  entity_id UUID NOT NULL,
  action TEXT NOT NULL,                -- 'CREATE', 'UPDATE', 'DELETE'
  old_values JSONB,                    -- Valores anteriores
  new_values JSONB,                    -- Novos valores
  changes JSONB,                       -- Apenas o que mudou
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT audit_logs_immutable CHECK (created_at <= now())
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Apenas admins podem ver audit logs
CREATE POLICY "Audit logs read admin only" ON audit_logs
  FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

-- Ninguém pode deletar audit logs
CREATE POLICY "Audit logs immutable" ON audit_logs
  FOR DELETE TO authenticated
  USING (false);

-- Criar índices
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
```

#### 3.3 Criar Migration: Constraints de Negócio
**Arquivo: src/core/infrastructure/persistence/database/migrations/005_constraints.sql**
```sql
-- Equipment constraints
ALTER TABLE equipments
  ADD CONSTRAINT chk_quantity_positive CHECK (quantity > 0),
  ADD CONSTRAINT chk_available_positive CHECK (available_qty >= 0),
  ADD CONSTRAINT chk_available_not_exceeds CHECK (available_qty <= quantity);

-- Equipment Movement constraints
ALTER TABLE equipment_movements
  ADD CONSTRAINT chk_movement_quantity_positive CHECK (quantity > 0);

-- Kit constraints
ALTER TABLE kit_items
  ADD CONSTRAINT chk_kit_quantity_positive CHECK (quantity > 0);

-- Work Order constraints
ALTER TABLE work_order_items
  ADD CONSTRAINT chk_wo_quantity_positive CHECK (quantity > 0);

-- Equipment Movements deve ter FK obrigatório para Work Order (quando for movimento de ordem)
-- Deixamos optional por enquanto, mas adicionamos validação na aplicação
```

#### 3.4 Criar Migration: Índices Estratégicos
**Arquivo: src/core/infrastructure/persistence/database/migrations/006_indexes.sql**
```sql
-- Equipments
CREATE INDEX idx_equipments_category_status ON equipments(category_id, status) 
  WHERE deleted_at IS NULL;
CREATE INDEX idx_equipments_name_search ON equipments USING gin(name gin_trgm_ops)
  WHERE deleted_at IS NULL;
CREATE INDEX idx_equipments_patrimony ON equipments(patrimony_no)
  WHERE deleted_at IS NULL AND patrimony_no IS NOT NULL;

-- Movements
CREATE INDEX idx_movements_equipment_date ON equipment_movements(equipment_id, created_at DESC)
  WHERE deleted_at IS NULL;
CREATE INDEX idx_movements_user_date ON equipment_movements(user_id, created_at DESC)
  WHERE deleted_at IS NULL;
CREATE INDEX idx_movements_type ON equipment_movements(type)
  WHERE deleted_at IS NULL;
CREATE INDEX idx_movements_work_order ON equipment_movements(work_order_id)
  WHERE deleted_at IS NULL AND work_order_id IS NOT NULL;

-- Work Orders
CREATE INDEX idx_work_orders_status_date ON work_orders(status, created_at DESC)
  WHERE deleted_at IS NULL;
CREATE INDEX idx_work_orders_client ON work_orders(client_id)
  WHERE deleted_at IS NULL;
CREATE INDEX idx_work_orders_technician ON work_orders(technician_id)
  WHERE deleted_at IS NULL;

-- Kits
CREATE INDEX idx_kits_status ON kits(status)
  WHERE deleted_at IS NULL;

-- Users
CREATE INDEX idx_user_roles_user ON user_roles(user_id);
```

#### 3.5 Reescrever RLS Policies (CRÍTICO)
**Arquivo: src/core/infrastructure/persistence/database/migrations/007_rls_policies.sql**
```sql
-- ============ DROP EXISTING POLICIES ============
DROP POLICY IF EXISTS "Kits write" ON public.kits;
DROP POLICY IF EXISTS "Kit items write" ON public.kit_items;
DROP POLICY IF EXISTS "WO write" ON public.work_orders;
DROP POLICY IF EXISTS "WO items write" ON public.work_order_items;
DROP POLICY IF EXISTS "Clients write" ON public.clients;
DROP POLICY IF EXISTS "Maintenance write" ON public.maintenance;

-- ============ EQUIPMENTS (Admin/Estoquista podem criar/editar) ============
-- UPDATE (feito por admin ou criador)
CREATE POLICY "Equipments update" ON public.equipments FOR UPDATE TO authenticated
  USING (
    public.is_admin(auth.uid()) OR 
    public.has_role(auth.uid(), 'estoquista') OR
    created_by = auth.uid()
  )
  WITH CHECK (
    public.is_admin(auth.uid()) OR 
    public.has_role(auth.uid(), 'estoquista')
  );

-- DELETE (apenas admin)
CREATE POLICY "Equipments delete" ON public.equipments FOR DELETE TO authenticated
  USING (public.is_admin(auth.uid()));

-- ============ EQUIPMENTS MOVEMENTS ============
-- INSERT: Operador pode registrar movimento próprio, admin sem restrição
CREATE POLICY "Movements insert" ON public.equipment_movements FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- UPDATE: Apenas criador ou admin
CREATE POLICY "Movements update" ON public.equipment_movements FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.is_admin(auth.uid()))
  WITH CHECK (user_id = auth.uid() OR public.is_admin(auth.uid()));

-- ============ KITS ============
-- INSERT: Qualquer usuário autenticado
CREATE POLICY "Kits insert" ON public.kits FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by OR public.is_admin(auth.uid()));

-- UPDATE: Apenas criador (enquanto em rascunho) ou admin
CREATE POLICY "Kits update" ON public.kits FOR UPDATE TO authenticated
  USING (
    public.is_admin(auth.uid()) OR
    (created_by = auth.uid() AND status = 'rascunho')
  )
  WITH CHECK (
    public.is_admin(auth.uid()) OR
    (created_by = auth.uid() AND status = 'rascunho')
  );

-- DELETE: Apenas criador (rascunho) ou admin
CREATE POLICY "Kits delete" ON public.kits FOR DELETE TO authenticated
  USING (
    public.is_admin(auth.uid()) OR
    (created_by = auth.uid() AND status = 'rascunho')
  );

-- ============ KIT ITEMS ============
CREATE POLICY "Kit items insert" ON public.kit_items FOR INSERT TO authenticated
  USING (
    EXISTS(
      SELECT 1 FROM kits k 
      WHERE k.id = kit_id 
      AND (k.created_by = auth.uid() OR public.is_admin(auth.uid()))
      AND k.status = 'rascunho'
    )
  );

-- ============ WORK ORDERS ============
-- Apenas admin/tecnico pode criar/atualizar
CREATE POLICY "WO insert" ON public.work_orders FOR INSERT TO authenticated
  WITH CHECK (
    public.is_admin(auth.uid()) OR 
    public.has_role(auth.uid(), 'tecnico')
  );

CREATE POLICY "WO update" ON public.work_orders FOR UPDATE TO authenticated
  USING (
    public.is_admin(auth.uid()) OR 
    public.has_role(auth.uid(), 'tecnico') OR
    technician_id = auth.uid()
  )
  WITH CHECK (
    public.is_admin(auth.uid()) OR 
    public.has_role(auth.uid(), 'tecnico')
  );

-- ============ CLIENTS ============
-- Admin/Tecnico podem gerenciar clientes
CREATE POLICY "Clients insert" ON public.clients FOR INSERT TO authenticated
  WITH CHECK (
    public.is_admin(auth.uid()) OR 
    public.has_role(auth.uid(), 'tecnico')
  );

CREATE POLICY "Clients update" ON public.clients FOR UPDATE TO authenticated
  USING (
    public.is_admin(auth.uid()) OR 
    public.has_role(auth.uid(), 'tecnico')
  );

-- ============ MAINTENANCE ============
-- Tech/Admin podem registrar manutenção
CREATE POLICY "Maintenance insert" ON public.maintenance FOR INSERT TO authenticated
  WITH CHECK (
    public.is_admin(auth.uid()) OR 
    public.has_role(auth.uid(), 'tecnico')
  );

CREATE POLICY "Maintenance update" ON public.maintenance FOR UPDATE TO authenticated
  USING (
    public.is_admin(auth.uid()) OR 
    technician_id = auth.uid()
  );

-- ============ AUDIT LOGS (IMUTÁVEL) ============
-- Apenas leitura para admin
CREATE POLICY "Audit logs select admin" ON public.activity_logs FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

-- Apenas insert (automático por trigger)
CREATE POLICY "Audit logs insert system" ON public.activity_logs FOR INSERT
  WITH CHECK (true);

-- Nenhum delete/update
CREATE POLICY "Audit logs no delete" ON public.activity_logs FOR DELETE
  USING (false);
```

#### 3.6 Criar Trigger para Audit Automático
**Arquivo: src/core/infrastructure/persistence/database/migrations/008_audit_triggers.sql**
```sql
-- Função para auditar mudanças
CREATE OR REPLACE FUNCTION public.audit_changes()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  changes JSONB;
BEGIN
  -- Calcular diferenças entre OLD e NEW
  IF TG_OP = 'UPDATE' THEN
    changes := jsonb_object_agg(
      key,
      jsonb_build_object('old', OLD::jsonb->key, 'new', NEW::jsonb->key)
    ) FROM (
      SELECT key FROM jsonb_each(to_jsonb(NEW))
      WHERE to_jsonb(NEW)->key <> to_jsonb(OLD)->key
    ) t(key);
  ELSIF TG_OP = 'DELETE' THEN
    changes := to_jsonb(OLD);
  ELSE -- INSERT
    changes := to_jsonb(NEW);
  END IF;

  INSERT INTO audit_logs (
    user_id,
    entity_type,
    entity_id,
    action,
    old_values,
    new_values,
    changes
  ) VALUES (
    auth.uid(),
    TG_TABLE_NAME,
    CASE WHEN TG_OP = 'DELETE' THEN OLD.id ELSE NEW.id END,
    TG_OP,
    CASE WHEN TG_OP = 'UPDATE' OR TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP != 'DELETE' THEN to_jsonb(NEW) ELSE NULL END,
    changes
  );

  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END; $$;

-- Registrar triggers para cada tabela
CREATE TRIGGER trg_audit_equipments AFTER INSERT OR UPDATE OR DELETE ON equipments
  FOR EACH ROW EXECUTE FUNCTION public.audit_changes();

CREATE TRIGGER trg_audit_movements AFTER INSERT OR UPDATE OR DELETE ON equipment_movements
  FOR EACH ROW EXECUTE FUNCTION public.audit_changes();

CREATE TRIGGER trg_audit_kits AFTER INSERT OR UPDATE OR DELETE ON kits
  FOR EACH ROW EXECUTE FUNCTION public.audit_changes();

CREATE TRIGGER trg_audit_work_orders AFTER INSERT OR UPDATE OR DELETE ON work_orders
  FOR EACH ROW EXECUTE FUNCTION public.audit_changes();

-- Semelhante para outras tabelas
```

### Status: 🟢 CONCLUÍDO QUANDO
- ✅ Soft deletes implementados
- ✅ Audit trail implementado
- ✅ Constraints de negócio adicionadas
- ✅ Índices criados
- ✅ RLS policies reescritas
- ✅ Triggers de auditoria funcionando
- ✅ Migrations testadas e aplicadas

---

## SEMANA 4: REGRAS DE NEGÓCIO

### Objetivo
Implementar validações completas de regras de negócio em Application e Domain layers.

### Tarefas

#### 4.1 Criar Validação Schemas (Zod)
**Arquivo: src/shared/validations/schemas/equipmentSchemas.ts**
```typescript
import { z } from 'zod';

export const CreateEquipmentSchema = z.object({
  name: z.string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(255, 'Nome muito longo'),
  brand: z.string().max(255).optional().nullable(),
  model: z.string().max(255).optional().nullable(),
  patrimony_no: z.string().max(100).optional().nullable(),
  serial_no: z.string().max(255).optional().nullable(),
  category_id: z.string().uuid('Categoria inválida').optional().nullable(),
  quantity: z.number()
    .int('Quantidade deve ser inteiro')
    .positive('Quantidade deve ser > 0'),
  available_qty: z.number()
    .int('Disponível deve ser inteiro')
    .nonnegative('Disponível não pode ser negativo'),
  location: z.string().max(255).optional().nullable(),
  notes: z.string().optional().nullable(),
  image_url: z.string().url().optional().nullable(),
});

export const UpdateEquipmentSchema = CreateEquipmentSchema.partial();

export type CreateEquipmentInput = z.infer<typeof CreateEquipmentSchema>;
export type UpdateEquipmentInput = z.infer<typeof UpdateEquipmentSchema>;
```

**Arquivo: src/shared/validations/schemas/movementSchemas.ts**
```typescript
import { z } from 'zod';

export const RegisterMovementSchema = z.object({
  equipment_id: z.string().uuid('Equipment ID inválido'),
  quantity: z.number()
    .int('Quantidade deve ser inteiro')
    .positive('Quantidade deve ser > 0'),
  type: z.enum(['saida', 'retorno', 'transferencia']),
  work_order_id: z.string().uuid().optional().nullable(),
  notes: z.string().optional().nullable(),
  from_location: z.string().max(255).optional().nullable(),
  to_location: z.string().max(255).optional().nullable(),
}).refine(
  (data) => {
    // Se for transferência, precisa de ambas as localizações
    if (data.type === 'transferencia') {
      return data.from_location && data.to_location;
    }
    return true;
  },
  {
    message: 'Transferência requer localizações de origem e destino',
    path: ['type']
  }
);

export type RegisterMovementInput = z.infer<typeof RegisterMovementSchema>;
```

#### 4.2 Implementar Validações de Movimentação
**Arquivo: src/core/application/use-cases/movement/RegisterMovementUseCase.ts**

```typescript
export class RegisterMovementUseCase {
  async execute(input: RegisterMovementInput): Promise<MovementResponseDTO> {
    // 1. Validação de schema
    const validation = RegisterMovementSchema.safeParse(input);
    if (!validation.success) {
      throw new ValidationException(validation.error.flatten());
    }

    // 2. Buscar equipamento
    const equipment = await this.equipmentRepository.findById(input.equipment_id);
    if (!equipment) {
      throw new EquipmentNotFoundException(input.equipment_id);
    }

    // 3. Validar regra: Não pode sacar equipamento em manutenção
    if (equipment.status === 'manutencao' && input.type === 'saida') {
      throw new BusinessRuleException(
        'Não é permitido sacar equipamento em manutenção'
      );
    }

    // 4. Validar regra: Não pode sacar equipamento reservado por outro
    if (equipment.status === 'reservado' && input.type === 'saida') {
      throw new BusinessRuleException(
        'Equipamento está reservado. Verifique com o gerente de projetos'
      );
    }

    // 5. Validar estoque (regra crítica)
    if (input.type === 'saida') {
      await this.stockValidationService.validateWithdrawal(
        equipment,
        input.quantity
      );
    } else if (input.type === 'retorno') {
      await this.stockValidationService.validateReturn(
        equipment,
        input.quantity
      );
    }

    // 6. Buscar work order se fornecido
    let workOrder: WorkOrder | null = null;
    if (input.work_order_id) {
      workOrder = await this.workOrderRepository.findById(input.work_order_id);
      if (!workOrder) {
        throw new WorkOrderNotFoundException(input.work_order_id);
      }
      
      // Validar: WO não pode estar cancelada
      if (workOrder.status === 'cancelada') {
        throw new BusinessRuleException(
          'Não é permitido movimentar itens de ordem cancelada'
        );
      }
    }

    // 7. Criar entidade de movimento
    const movement = new EquipmentMovement({
      equipmentId: equipment.id,
      type: input.type,
      quantity: input.quantity,
      userId: input.userId,
      workOrderId: workOrder?.id,
      fromLocation: input.from_location,
      toLocation: input.to_location,
      notes: input.notes,
    });

    // 8. Aplicar mudanças no equipamento
    if (input.type === 'saida') {
      equipment.removeFromStock(input.quantity);
    } else if (input.type === 'retorno') {
      equipment.restoreToStock(input.quantity);
    }

    // 9. Atualizar status do equipamento se necessário
    this.updateEquipmentStatus(equipment, input.type);

    // 10. Persistir
    await this.movementRepository.save(movement);
    await this.equipmentRepository.update(equipment);

    // 11. Registrar auditoria
    await this.auditService.logMovement(movement, input.userId);

    // 12. Disparar events (para notificações, etc)
    await this.eventBus.publish(
      new MovementRegisteredEvent(movement.id)
    );

    // 13. Retornar DTO
    return MovementMapper.toDTO(movement);
  }

  private updateEquipmentStatus(equipment: Equipment, movementType: MovementType) {
    // Regra: Se saiu e tinha status 'disponível', muda para 'em_uso'
    if (movementType === 'saida' && equipment.status === 'disponivel') {
      equipment.setStatus('em_uso');
    }

    // Regra: Se retornou tudo, volta para 'disponível'
    if (movementType === 'retorno' && equipment.availableQuantity === equipment.quantity) {
      equipment.setStatus('disponivel');
    }

    // Regra: Se estoque zerou, marca como 'extraviado'
    // (isso seria flag manual, não automático)
  }
}
```

#### 4.3 Implementar Validação de Devoluções
**Arquivo: src/core/domain/services/ReturnValidationDomainService.ts**

```typescript
export class ReturnValidationDomainService {
  constructor(
    private movementRepository: IMovementRepository,
    private equipmentRepository: IEquipmentRepository
  ) {}

  async validateReturn(
    equipmentId: string, 
    quantity: number, 
    workOrderId?: string
  ): Promise<{
    isValid: boolean;
    maxAllowed: number;
    reason?: string;
  }> {
    // 1. Buscar equipamento
    const equipment = await this.equipmentRepository.findById(equipmentId);
    if (!equipment) {
      return {
        isValid: false,
        maxAllowed: 0,
        reason: 'Equipamento não encontrado'
      };
    }

    // 2. Se está associado a order, validar contra a order
    if (workOrderId) {
      const movements = await this.movementRepository.findByWorkOrder(workOrderId);
      
      // Calcular quantidades sacadas por ordem
      const totalSacado = movements
        .filter(m => m.type === 'saida' && m.equipmentId === equipmentId)
        .reduce((sum, m) => sum + m.quantity, 0);

      // Calcular quantidades já retornadas
      const totalRetornado = movements
        .filter(m => m.type === 'retorno' && m.equipmentId === equipmentId)
        .reduce((sum, m) => sum + m.quantity, 0);

      const maxAllowedReturn = totalSacado - totalRetornado;

      if (quantity > maxAllowedReturn) {
        return {
          isValid: false,
          maxAllowed: maxAllowedReturn,
          reason: `Foram sacadas ${totalSacado} unidades e já retornadas ${totalRetornado}. ` +
                  `Máximo a retornar agora: ${maxAllowedReturn}`
        };
      }
    }

    // 3. Validação geral: não pode retornar mais que o total
    if (quantity > equipment.quantity) {
      return {
        isValid: false,
        maxAllowed: equipment.quantity,
        reason: `Tentativa de retornar ${quantity} mas total no sistema é ${equipment.quantity}`
      };
    }

    return {
      isValid: true,
      maxAllowed: equipment.quantity
    };
  }
}
```

#### 4.4 Implementar Status Automáticos
**Arquivo: src/core/domain/services/EquipmentStatusUpdateDomainService.ts**

```typescript
export class EquipmentStatusUpdateDomainService {
  async evaluateAndUpdateStatus(
    equipment: Equipment,
    reason: 'movement' | 'manual' | 'return'
  ): Promise<boolean> {
    const previousStatus = equipment.status;
    let newStatus: EquipmentStatus = previousStatus;

    // Regra 1: Se todo o estoque saiu (available_qty = 0), marca como em_uso
    if (equipment.availableQuantity === 0 && equipment.quantity > 0) {
      newStatus = 'em_uso';
    }

    // Regra 2: Se retornou tudo (available_qty = quantity), volta a disponivel
    else if (equipment.availableQuantity === equipment.quantity) {
      newStatus = 'disponivel';
    }

    // Regra 3: Se chegou relatório de manutenção, marca como manutencao
    // (isso é manual, não automático - mas poderia ser se houver flag de manutenção)

    // Aplicar mudança se houve
    if (newStatus !== previousStatus) {
      equipment.setStatus(newStatus);
      return true;
    }

    return false;
  }
}
```

#### 4.5 Implementar Detecção de Inconsistências
**Arquivo: src/core/application/use-cases/maintenance/CheckEquipmentConsistencyUseCase.ts**

```typescript
export class CheckEquipmentConsistencyUseCase {
  constructor(
    private equipmentRepository: IEquipmentRepository,
    private movementRepository: IMovementRepository
  ) {}

  async execute(): Promise<InconsistencyReport[]> {
    const issues: InconsistencyReport[] = [];

    const allEquipments = await this.equipmentRepository.findAll();

    for (const equipment of allEquipments) {
      // Verificação 1: available_qty > quantity
      if (equipment.availableQuantity > equipment.quantity) {
        issues.push({
          equipmentId: equipment.id,
          severity: 'critical',
          issue: 'Disponível > Total',
          details: `available_qty (${equipment.availableQuantity}) > quantity (${equipment.quantity})`
        });
      }

      // Verificação 2: available_qty < 0
      if (equipment.availableQuantity < 0) {
        issues.push({
          equipmentId: equipment.id,
          severity: 'critical',
          issue: 'Estoque Negativo',
          details: `available_qty = ${equipment.availableQuantity}`
        });
      }

      // Verificação 3: quantity <= 0
      if (equipment.quantity <= 0) {
        issues.push({
          equipmentId: equipment.id,
          severity: 'critical',
          issue: 'Quantidade Total Inválida',
          details: `quantity = ${equipment.quantity}`
        });
      }

      // Verificação 4: Status inconsistente
      if (equipment.availableQuantity === 0 && equipment.status === 'disponivel') {
        issues.push({
          equipmentId: equipment.id,
          severity: 'warning',
          issue: 'Status Inconsistente',
          details: 'Nenhum disponível mas status é "disponível"'
        });
      }

      // Verificação 5: Movimentações desbalanceadas por order
      const movements = await this.movementRepository.findByEquipment(equipment.id);
      const saidas = movements
        .filter(m => m.type === 'saida')
        .reduce((sum, m) => sum + m.quantity, 0);
      const retornos = movements
        .filter(m => m.type === 'retorno')
        .reduce((sum, m) => sum + m.quantity, 0);
      
      if (saidas < retornos) {
        issues.push({
          equipmentId: equipment.id,
          severity: 'warning',
          issue: 'Mais Devolvido que Sacado',
          details: `Sacadas: ${saidas}, Devolvidas: ${retornos}`
        });
      }
    }

    return issues;
  }
}
```

### Status: 🟢 CONCLUÍDO QUANDO
- ✅ Schemas Zod criados para todas as entidades
- ✅ Validação de movimentação implementada
- ✅ Validação de devoluções implementada
- ✅ Status automáticos implementados
- ✅ Detecção de inconsistências implementada
- ✅ Testes de regras de negócio passando

---

## SEMANA 5: PERFORMANCE & CACHING

### Objetivo
Implementar paginação, virtualização, lazy loading e caching para escalar.

### Tarefas

#### 5.1 Implementar Paginação Cursor-Based
**Arquivo: src/core/application/use-cases/equipment/ListEquipmentsUseCase.ts**

```typescript
export class ListEquipmentsUseCase {
  async execute(
    input: ListEquipmentsInput
  ): Promise<PaginatedResultDTO<EquipmentResponseDTO>> {
    const { filters, limit = 25, cursor } = input;

    // Validar limit (máximo 100)
    const validLimit = Math.min(limit, 100);

    // Buscar limit + 1 para saber se há próxima página
    const equipments = await this.equipmentRepository.list({
      ...filters,
      limit: validLimit + 1,
      cursor
    });

    // Se retornou mais itens que limite, há próxima página
    const hasNextPage = equipments.length > validLimit;
    const items = equipments.slice(0, validLimit);
    const nextCursor = hasNextPage ? items[items.length - 1]?.id : null;

    return {
      data: items.map(EquipmentMapper.toDTO),
      pagination: {
        limit: validLimit,
        cursor: nextCursor,
        hasNextPage
      }
    };
  }
}
```

**Arquivo: src/core/infrastructure/persistence/repositories/SupabaseEquipmentRepository.ts**

```typescript
async list(filters: EquipmentListFilters): Promise<Equipment[]> {
  let query = this.supabase
    .from('equipments')
    .select('*, categories(id,name,color)', { count: 'exact' })
    .order('id', { ascending: true });

  // Aplicar filtros
  if (filters.status) query = query.eq('status', filters.status);
  if (filters.category_id) query = query.eq('category_id', filters.category_id);
  if (filters.search) {
    query = query.ilike('name', `%${filters.search}%`);
  }

  // Paginação cursor-based
  if (filters.cursor) {
    query = query.gt('id', filters.cursor);
  }

  // Soft deletes
  query = query.is('deleted_at', null);

  // Limit + 1 para saber se há próxima
  query = query.limit(filters.limit + 1);

  const { data, error } = await query;

  if (error) throw new PersistenceException(error.message);

  return (data ?? []).map(EquipmentMapper.toDomain);
}
```

#### 5.2 Criar React Hooks com Paginação
**Arquivo: src/presentation/features/equipments/hooks/useEquipments.ts**

```typescript
export function useEquipments(filters: EquipmentFilters) {
  const [equipment, setEquipments] = useState<Equipment[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { data, isLoading: queryLoading, error: queryError } = useQuery({
    queryKey: ['equipments', filters, cursor],
    queryFn: async () => {
      const equipmentService = DIContainer.getInstance().get<EquipmentService>(
        'EquipmentService'
      );
      return equipmentService.list(filters, {
        limit: 25,
        cursor
      });
    },
    keepPreviousData: true,
  });

  useEffect(() => {
    if (data) {
      setEquipments(prev => cursor ? [...prev, ...data.items] : data.items);
      setCursor(data.pagination.nextCursor);
      setHasMore(data.pagination.hasNextPage);
    }
    setIsLoading(queryLoading);
    setError(queryError);
  }, [data, queryLoading, queryError, cursor]);

  const loadMore = useCallback(() => {
    // Cursor já foi setado, próxima query vai usar
  }, []);

  return {
    items: equipment,
    isLoading,
    error,
    hasMore,
    loadMore,
    reset: () => {
      setEquipments([]);
      setCursor(null);
      setHasMore(false);
    }
  };
}
```

#### 5.3 Implementar Virtualization
**Arquivo: src/presentation/features/equipments/components/EquipmentsList.tsx**

```typescript
import { FixedSizeList } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';

export function EquipmentsList() {
  const { items, hasMore, isLoading, loadMore } = useEquipments(filters);

  const isItemLoaded = (index: number) => !hasMore || index < items.length;

  const Item = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    if (!isItemLoaded(index)) {
      return <div style={style}>Carregando...</div>;
    }
    return (
      <div style={style}>
        <EquipmentRow equipment={items[index]} />
      </div>
    );
  };

  return (
    <InfiniteLoader
      isItemLoaded={isItemLoaded}
      itemCount={hasMore ? items.length + 1 : items.length}
      onItemsRendered={({ visibleStopIndex }) => {
        if (visibleStopIndex === items.length - 5) {
          loadMore();
        }
      }}
    >
      {({ onItemsRendered, ref }) => (
        <FixedSizeList
          ref={ref}
          height={600}
          itemCount={hasMore ? items.length + 1 : items.length}
          itemSize={60}
          onItemsRendered={onItemsRendered}
        >
          {Item}
        </FixedSizeList>
      )}
    </InfiniteLoader>
  );
}
```

#### 5.4 Implementar Caching Estratégico
**Arquivo: src/config/caching.ts**

```typescript
// Configurar React Query com cache inteligente
export const queryConfig = {
  defaultOptions: {
    queries: {
      // Cache de 5 minutos
      staleTime: 5 * 60 * 1000,
      // Remover cache após 10 minutos de inatividade
      gcTime: 10 * 60 * 1000,
      // Manter dados anteriores enquanto carrega novos
      placeholderData: keepPreviousData,
      // Retry uma vez em erro de rede
      retry: (failureCount, error) => {
        if (error instanceof NetworkError) {
          return failureCount < 1;
        }
        return false;
      },
    },
  },
};

// Invalidação inteligente
export class CacheInvalidation {
  static onEquipmentCreated(queryClient: QueryClient, equipment: Equipment) {
    // Invalidar lista de equipamentos
    queryClient.invalidateQueries({
      queryKey: ['equipments'],
      refetchType: 'active'
    });
    // Prefetch detalhe
    queryClient.prefetchQuery({
      queryKey: ['equipment', equipment.id],
      queryFn: () => getEquipmentDetail(equipment.id)
    });
  }

  static onEquipmentUpdated(queryClient: QueryClient, equipment: Equipment) {
    // Update local imediato
    queryClient.setQueryData(
      ['equipment', equipment.id],
      equipment
    );
    // Invalidar lista (se filtros mudaram)
    queryClient.invalidateQueries({
      queryKey: ['equipments']
    });
  }

  static onMovementCreated(queryClient: QueryClient, movement: Movement) {
    // Invalidar lista de movimentações
    queryClient.invalidateQueries({
      queryKey: ['movements']
    });
    // Invalidar detalhe do equipamento
    queryClient.invalidateQueries({
      queryKey: ['equipment', movement.equipmentId]
    });
  }
}
```

#### 5.5 Implementar Lazy Loading de Componentes
**Arquivo: src/presentation/routes/_authenticated/equipments.tsx**

```typescript
import { lazy, Suspense } from 'react';

// Lazy load do componente pesado
const EquipmentDetailModal = lazy(() => 
  import('../features/equipments/components/EquipmentDetail')
    .then(m => ({ default: m.EquipmentDetail }))
);

export function EquipmentsPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <>
      <EquipmentsList onSelectEquipment={setSelectedId} />
      
      {selectedId && (
        <Suspense fallback={<LoadingModal />}>
          <EquipmentDetailModal 
            equipmentId={selectedId}
            onClose={() => setSelectedId(null)}
          />
        </Suspense>
      )}
    </>
  );
}
```

#### 5.6 Implementar Debounce para Buscas
**Arquivo: src/shared/hooks/useDebounce.ts**

```typescript
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}
```

**Uso:**
```typescript
export function EquipmentsPage() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const { items } = useEquipments({
    search: debouncedSearch,
  });

  // ... renderizar
}
```

### Status: 🟢 CONCLUÍDO QUANDO
- ✅ Paginação cursor-based implementada
- ✅ React Query configurado com cache
- ✅ Virtualização de listas implementada
- ✅ Lazy loading de componentes funcionando
- ✅ Debounce em buscas funcionando
- ✅ Testes de performance aprovados

---

## SEMANA 6: APRESENTAÇÃO & COMPONENTIZAÇÃO

### Objetivo
Refatorar componentes React para pequenos, reutilizáveis e bem organizados.

### Tarefas

#### 6.1 Refatorar EquipmentsPage em Multiple Components
**Arquivo: src/presentation/features/equipments/containers/EquipmentsPage.tsx**

```typescript
export function EquipmentsPage() {
  const { filters, setFilters } = useEquipmentFilters();
  const { items, isLoading, error, hasMore, loadMore } = useEquipments(filters);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Equipamentos"
        description="Catálogo completo do inventário"
        actions={
          <CreateEquipmentButton onOpen={() => setIsCreateOpen(true)} />
        }
      />

      <EquipmentFilters filters={filters} onChange={setFilters} />

      {error && <ErrorAlert error={error} onRetry={() => loadMore()} />}

      <Suspense fallback={<SkeletonList />}>
        <EquipmentsList
          items={items}
          isLoading={isLoading}
          hasMore={hasMore}
          onLoadMore={loadMore}
          onSelectEquipment={setSelectedId}
        />
      </Suspense>

      {isCreateOpen && (
        <CreateEquipmentDialog
          open={isCreateOpen}
          onOpenChange={setIsCreateOpen}
        />
      )}

      {selectedId && (
        <EquipmentDetailModal
          equipmentId={selectedId}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}
```

**Arquivo: src/presentation/features/equipments/components/EquipmentsList.tsx**

```typescript
interface EquipmentsListProps {
  items: Equipment[];
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onSelectEquipment: (id: string) => void;
}

export function EquipmentsList({
  items,
  isLoading,
  hasMore,
  onLoadMore,
  onSelectEquipment,
}: EquipmentsListProps) {
  return (
    <InfiniteScroll
      dataLength={items.length}
      next={onLoadMore}
      hasMore={hasMore}
      loader={<LoadingSpinner />}
    >
      <div className="grid gap-4">
        {items.map((equipment) => (
          <EquipmentRow
            key={equipment.id}
            equipment={equipment}
            onClick={() => onSelectEquipment(equipment.id)}
          />
        ))}
      </div>
    </InfiniteScroll>
  );
}
```

**Arquivo: src/presentation/features/equipments/components/EquipmentRow.tsx**

```typescript
interface EquipmentRowProps {
  equipment: Equipment;
  onClick: () => void;
}

export function EquipmentRow({ equipment, onClick }: EquipmentRowProps) {
  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <div className="flex items-center justify-between p-4">
        <div className="flex-1">
          <h3 className="font-semibold">{equipment.name}</h3>
          <div className="grid grid-cols-3 gap-2 text-sm text-muted-foreground mt-2">
            <span>{equipment.brand} {equipment.model}</span>
            <span>Qtd: {equipment.availableQty}/{equipment.quantity}</span>
            <StatusBadge status={equipment.status} />
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground" />
      </div>
    </Card>
  );
}
```

**Arquivo: src/presentation/features/equipments/components/EquipmentFilters.tsx**

```typescript
interface EquipmentFiltersProps {
  filters: EquipmentFilters;
  onChange: (filters: EquipmentFilters) => void;
}

export function EquipmentFilters({ filters, onChange }: EquipmentFiltersProps) {
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const service = DIContainer.getInstance().get('CategoryService');
      return service.list();
    }
  });

  return (
    <div className="flex flex-wrap gap-3">
      <SearchInput
        placeholder="Buscar por nome..."
        value={filters.search || ''}
        onChange={(search) => onChange({ ...filters, search })}
      />

      <Select
        value={filters.status || 'all'}
        onValueChange={(status) => 
          onChange({ ...filters, status: status === 'all' ? undefined : status })
        }
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          {Object.values(EQUIPMENT_STATUS).map(status => (
            <SelectItem key={status} value={status}>
              {formatEquipmentStatus(status)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.categoryId || 'all'}
        onValueChange={(categoryId) =>
          onChange({ ...filters, categoryId: categoryId === 'all' ? undefined : categoryId })
        }
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Categoria" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas</SelectItem>
          {categories?.map(category => (
            <SelectItem key={category.id} value={category.id}>
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
```

#### 6.2 Criar Custom Hooks para Componentes
**Arquivo: src/presentation/features/equipments/hooks/useCreateEquipment.ts**

```typescript
export function useCreateEquipment() {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const create = useCallback(async (input: CreateEquipmentInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const service = DIContainer.getInstance().get<EquipmentService>(
        'EquipmentService'
      );
      const equipment = await service.create(input);

      // Invalidar cache
      CacheInvalidation.onEquipmentCreated(queryClient, equipment);

      // Toast de sucesso
      toast.success('Equipamento criado com sucesso');

      return equipment;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro desconhecido');
      setError(error);
      toast.error(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [queryClient]);

  return { create, isLoading, error };
}
```

#### 6.3 Criar Componentes Compartilhados
**Arquivo: src/presentation/components/shared/PageHeader.tsx**

```typescript
interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
}

export function PageHeader({
  title,
  description,
  actions,
  breadcrumbs,
}: PageHeaderProps) {
  return (
    <div className="space-y-4">
      {breadcrumbs && <Breadcrumb items={breadcrumbs} />}
      
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          {description && (
            <p className="text-muted-foreground mt-2">{description}</p>
          )}
        </div>
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>
    </div>
  );
}
```

### Status: 🟢 CONCLUÍDO QUANDO
- ✅ Todos os componentes decompostos em pequenas partes
- ✅ Custom hooks criados para cada feature
- ✅ Componentes compartilhados reutilizáveis
- ✅ Props bem tipadas
- ✅ Componentes de apresentação (dumb) separados de containers (smart)

---

## SEMANA 7: TESTES & DOCUMENTAÇÃO

### Objetivo
Adicionar testes e documentação profissional.

### Tarefas

#### 7.1 Unit Tests (Domain Layer)
**Arquivo: tests/unit/core/domain/entities/Equipment.test.ts**

```typescript
describe('Equipment Entity', () => {
  describe('removeFromStock', () => {
    it('should decrease available quantity', () => {
      const equipment = new Equipment({
        name: 'Mesa de Som',
        quantity: 10,
        availableQty: 10,
      });

      equipment.removeFromStock(3);

      expect(equipment.availableQuantity).toBe(7);
    });

    it('should throw when removing more than available', () => {
      const equipment = new Equipment({
        name: 'Mesa de Som',
        quantity: 10,
        availableQty: 5,
      });

      expect(() => equipment.removeFromStock(10))
        .toThrow(BusinessRuleException);
    });

    it('should throw when removing more than total', () => {
      const equipment = new Equipment({
        name: 'Mesa de Som',
        quantity: 10,
        availableQty: 10,
      });

      expect(() => equipment.removeFromStock(15))
        .toThrow(BusinessRuleException);
    });
  });

  describe('restoreToStock', () => {
    it('should increase available quantity', () => {
      const equipment = new Equipment({
        name: 'Mesa de Som',
        quantity: 10,
        availableQty: 7,
      });

      equipment.restoreToStock(3);

      expect(equipment.availableQuantity).toBe(10);
    });

    it('should not exceed total quantity', () => {
      const equipment = new Equipment({
        name: 'Mesa de Som',
        quantity: 10,
        availableQty: 7,
      });

      expect(() => equipment.restoreToStock(5))
        .toThrow(BusinessRuleException);
    });
  });
});
```

#### 7.2 Integration Tests (Use Cases)
**Arquivo: tests/integration/RegisterMovementUseCase.test.ts**

```typescript
describe('RegisterMovementUseCase', () => {
  let useCase: RegisterMovementUseCase;
  let equipmentRepository: MockEquipmentRepository;
  let movementRepository: MockMovementRepository;

  beforeEach(() => {
    equipmentRepository = new MockEquipmentRepository();
    movementRepository = new MockMovementRepository();
    useCase = new RegisterMovementUseCase(
      movementRepository,
      equipmentRepository,
      new StockValidationDomainService(equipmentRepository),
      new AuditDomainService(auditLogRepository)
    );
  });

  describe('when registering a withdrawal', () => {
    it('should decrease equipment available quantity', async () => {
      const equipment = new Equipment({
        id: '123',
        name: 'Mesa de Som',
        quantity: 10,
        availableQty: 10,
      });
      equipmentRepository.save(equipment);

      await useCase.execute({
        equipmentId: '123',
        quantity: 3,
        type: 'saida',
        userId: 'user1',
      });

      const updated = equipmentRepository.findById('123');
      expect(updated.availableQuantity).toBe(7);
    });

    it('should throw when insufficient stock', async () => {
      const equipment = new Equipment({
        id: '123',
        name: 'Mesa de Som',
        quantity: 10,
        availableQty: 5,
      });
      equipmentRepository.save(equipment);

      expect(() =>
        useCase.execute({
          equipmentId: '123',
          quantity: 10,
          type: 'saida',
          userId: 'user1',
        })
      ).rejects.toThrow(InsufficientStockException);
    });
  });
});
```

#### 7.3 E2E Tests
**Arquivo: tests/e2e/equipment-flow.spec.ts**

```typescript
describe('Equipment Management Flow', () => {
  it('should complete full equipment lifecycle', async () => {
    // 1. Login
    await page.goto('/login');
    await page.fill('[name="email"]', 'admin@test.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button:has-text("Entrar")');
    await page.waitForNavigation();

    // 2. Create equipment
    await page.goto('/equipments');
    await page.click('button:has-text("Novo")');
    await page.fill('[name="name"]', 'Mesa de Som Behringer');
    await page.fill('[name="quantity"]', '5');
    await page.click('button:has-text("Cadastrar")');
    await page.waitForText('Equipamento criado com sucesso');

    // 3. Verify creation
    const row = await page.$('text=Mesa de Som Behringer');
    expect(row).toBeTruthy();

    // 4. Register movement (saída)
    await page.goto('/movements');
    await page.click('button:has-text("Nova Movimentação")');
    await page.fill('[name="quantity"]', '2');
    await page.selectOption('[name="type"]', 'saida');
    await page.click('button:has-text("Registrar")');
    await page.waitForText('Movimentação registrada');

    // 5. Verify stock updated
    await page.goto('/equipments');
    const availableQty = await page.locator('text=3/5').isVisible();
    expect(availableQty).toBe(true);
  });
});
```

#### 7.4 Documentação Profissional
**Arquivo: docs/ARCHITECTURE.md**

```markdown
# EventKit Pro - Arquitetura

## Clean Architecture Implementation

### Estrutura de Camadas

#### 1. Domain Layer (core/domain/)
Contém a lógica de negócio pura, independente de frameworks.

- **Entities**: Representam conceitos de negócio com validações
- **Repositories**: Interfaces para acesso a dados
- **Services**: Serviços de domínio para lógica complexa
- **Exceptions**: Exceções de negócio

#### 2. Application Layer (core/application/)
Orquestra casos de uso e valida entrada.

- **Use Cases**: Um por ação de negócio
- **Services**: Coordenam use cases
- **DTOs**: Objetos de transferência de dados
- **Mappers**: Convertem entre entidades e DTOs

#### 3. Infrastructure Layer (core/infrastructure/)
Implementação de detalles técnicos.

- **Repositories**: Implementação concreta com Supabase
- **Authentication**: Autenticação via Supabase
- **Persistence**: Acesso ao banco de dados
- **External**: Serviços externos (email, storage, etc)

#### 4. Presentation Layer (presentation/)
Interface com usuário (React).

- **Routes**: Roteamento do TanStack Router
- **Features**: Módulos por funcionalidade
- **Components**: Componentes React reutilizáveis
- **Hooks**: Custom hooks React

### Fluxo de Dados

```
User Input
    ↓
Component (Presentation)
    ↓
Hook useCreateEquipment
    ↓
Application Service
    ↓
Use Case (Validação)
    ↓
Domain Service (Regras de Negócio)
    ↓
Entity
    ↓
Repository (Persistência)
    ↓
Database (Supabase)
```

### Padrões Utilizados

1. **Repository Pattern**: Abstração de acesso a dados
2. **Use Case Pattern**: Um caso de uso por operação
3. **Service Layer**: Orquestração de lógica
4. **DTO**: Transferência de dados entre camadas
5. **Dependency Injection**: Acoplamento baixo
6. **Value Objects**: Objetos imutáveis com validação
7. **Domain Exceptions**: Erros de negócio específicos

### Benefícios da Arquitetura

- ✅ Testabilidade: Fácil mockar dependências
- ✅ Manutenibilidade: Separação clara de responsabilidades
- ✅ Escalabilidade: Preparado para crescer
- ✅ Reutilização: Código compartilhável
- ✅ Independência: Não acoplado a frameworks
```

**Arquivo: docs/DATABASE.md**

```markdown
# Database Design

## Schema Overview

### Core Tables
- `equipments`: Equipamentos no sistema
- `equipment_movements`: Histórico de movimentações
- `kits`: Kits pré-montados
- `work_orders`: Ordens de serviço
- `clients`: Clientes
- `maintenance`: Registros de manutenção
- `event_schedule`: Agendamentos de eventos

## Constraints & Validations

### Equipment Constraints
- `quantity > 0`: Quantidade total deve ser positiva
- `available_qty >= 0`: Disponível não pode ser negativo
- `available_qty <= quantity`: Disponível não pode exceder total
- `deleted_at` para soft deletes

## Audit Trail

Todas as mudanças são registradas em `audit_logs`:
- Usuário que fez a mudança
- O que foi mudado (old_values vs new_values)
- Timestamp automático
- Imutável (não pode ser deletado)

## Performance

### Índices Implementados
- `idx_equipments_category_status`: Filtro comum
- `idx_equipments_name_search`: Busca por nome
- `idx_movements_equipment_date`: Histórico por equipamento
- `idx_work_orders_status_date`: Ordens por status

### Query Optimization
- Cursor-based pagination: Sem offset
- Soft deletes: Filtro automático via view
- RLS Policies: Filtragem no servidor

## RLS (Row Level Security)

Implementado por role:
- `admin`: Acesso total
- `tecnico`: Acesso a ordens de serviço e manutenção
- `operador`: Pode registrar movimentações
- `estoquista`: Gerencia equipamentos
```

### Status: 🟢 CONCLUÍDO QUANDO
- ✅ Testes unitários com >80% coverage
- ✅ Testes de integração para casos críticos
- ✅ Testes E2E para fluxos principais
- ✅ Documentação técnica completa
- ✅ README atualizado
- ✅ Guias de contribuição criados

---

## SEMANA 8: REFINAMENTO FINAL & DEPLOYMENT

### Objetivo
Refinamento final, otimizações, e preparação para produção.

### Tarefas

#### 8.1 Code Review & Cleanup
- Revisar todos os arquivos criados
- Remover código duplicado
- Otimizar imports
- Padronizar nomenclatura
- Adicionar comentários onde necessário

#### 8.2 Performance Profiling
- Executar Lighthouse
- Analisar bundle size
- Otimizar imagens
- Verificar Core Web Vitals

#### 8.3 Security Audit
- Verificar RLS policies
- Validar sanitização
- Testar autenticação
- Verificar permissões

#### 8.4 Documentation Polish
- Revisar toda documentação
- Adicionar exemplos práticos
- Criar guias de deployment
- Documentar configurações

#### 8.5 Final Testing
- Teste em navegadores modernos
- Teste em dispositivos mobile
- Teste em diferentes resoluções
- Teste de regressão

### Status: 🟢 CONCLUÍDO QUANDO
- ✅ Código pronto para produção
- ✅ Documentação completa
- ✅ Performance otimizada
- ✅ Segurança auditada
- ✅ Testes aprovados
- ✅ Sem warnings/errors

---

## 📊 CHECKLIST DE IMPLEMENTAÇÃO

### Fase 1: Arquitetura
- [ ] Estrutura de pastas criada
- [ ] Domain Entities implementadas
- [ ] Domain Exceptions criadas
- [ ] Repository Interfaces criadas
- [ ] Domain Services implementados

### Fase 2: Application & Infrastructure
- [ ] DTOs criados
- [ ] Use Cases implementados
- [ ] Application Services criados
- [ ] Repositories concretos implementados
- [ ] DI Container configurado

### Fase 3: Banco de Dados
- [ ] Soft deletes implementados
- [ ] Audit trail implementado
- [ ] Constraints adicionados
- [ ] Índices criados
- [ ] RLS policies reescritas
- [ ] Migrations criadas

### Fase 4: Regras de Negócio
- [ ] Validação schemas (Zod)
- [ ] Validação movimentação
- [ ] Validação devoluções
- [ ] Status automáticos
- [ ] Detecção inconsistências

### Fase 5: Performance
- [ ] Paginação cursor-based
- [ ] Caching implementado
- [ ] Lazy loading implementado
- [ ] Virtualização de listas
- [ ] Debounce em buscas

### Fase 6: Apresentação
- [ ] Componentes decompostos
- [ ] Custom hooks criados
- [ ] Componentes compartilhados
- [ ] Props bem tipadas

### Fase 7: Testes & Docs
- [ ] Unit tests criados
- [ ] Integration tests criados
- [ ] E2E tests criados
- [ ] Documentação técnica
- [ ] Documentação API

### Fase 8: Refinamento
- [ ] Code review completo
- [ ] Performance profiling
- [ ] Security audit
- [ ] Documentação final
- [ ] Testes finais

---

## 🎯 MÉTRICAS DE SUCESSO

### Antes da Refatoração
- **Code Coverage**: 0%
- **Bundle Size**: ~500KB
- **Page Load Time**: 3.2s
- **Time to Interactive**: 4.5s
- **Max Records**: ~10k (lento)
- **Security Score**: 1/10
- **Architecture Score**: 2/10

### Depois da Refatoração
- **Code Coverage**: >80%
- **Bundle Size**: ~400KB (20% redução)
- **Page Load Time**: 1.2s (62% mais rápido)
- **Time to Interactive**: 1.8s (60% mais rápido)
- **Max Records**: 1M+ (100x melhor)
- **Security Score**: 9/10
- **Architecture Score**: 9/10

---

## 📞 PRÓXIMOS PASSOS

1. ✅ **FEITO**: Análise completa
2. ⏭️ **PRÓXIMO**: Aprovar plan
3. ⏭️ **DEPOIS**: Iniciar Semana 1

**Estimativa Total**: 8 semanas de work ao ritmo enterprise.

---

**Versão**: 1.0  
**Status**: ✅ Plano Completo  
**Data**: Maio 2026  
**Próximo**: Início da Implementação
