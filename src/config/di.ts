import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseEquipmentRepository } from '../infrastructure/persistence/repositories/SupabaseEquipmentRepository';
import { SupabaseMovementRepository } from '../infrastructure/persistence/repositories/SupabaseMovementRepository';
import { SupabaseKitRepository } from '../infrastructure/persistence/repositories/SupabaseKitRepository';
import { SupabaseWorkOrderRepository } from '../infrastructure/persistence/repositories/SupabaseWorkOrderRepository';
import { StockValidationDomainService } from '../domain/services/StockValidationDomainService';
import { WorkOrderValidationDomainService } from '../domain/services/WorkOrderValidationDomainService';
import { CreateEquipmentUseCase } from '../application/use-cases/equipment/CreateEquipmentUseCase';
import { ListEquipmentsUseCase } from '../application/use-cases/equipment/ListEquipmentsUseCase';
import { GetEquipmentDetailUseCase } from '../application/use-cases/equipment/GetEquipmentDetailUseCase';
import { UpdateEquipmentUseCase } from '../application/use-cases/equipment/UpdateEquipmentUseCase';
import { DeleteEquipmentUseCase } from '../application/use-cases/equipment/DeleteEquipmentUseCase';
import { AdjustStockUseCase } from '../application/use-cases/equipment/AdjustStockUseCase';
import { RegisterMovementUseCase } from '../application/use-cases/movement/RegisterMovementUseCase';
import { ListMovementsUseCase } from '../application/use-cases/movement/ListMovementsUseCase';
import { CreateKitUseCase } from '../application/use-cases/kit/CreateKitUseCase';
import { ListKitsUseCase } from '../application/use-cases/kit/ListKitsUseCase';
import { CreateWorkOrderUseCase } from '../application/use-cases/workorder/CreateWorkOrderUseCase';
import { ListWorkOrdersUseCase } from '../application/use-cases/workorder/ListWorkOrdersUseCase';
import { StartWorkOrderUseCase } from '../application/use-cases/workorder/StartWorkOrderUseCase';
import { CompleteWorkOrderUseCase } from '../application/use-cases/workorder/CompleteWorkOrderUseCase';
import { EquipmentService } from '../application/services/EquipmentService';
import { MovementService } from '../application/services/MovementService';

export interface DIContainer {
  equipmentRepository: SupabaseEquipmentRepository;
  movementRepository: SupabaseMovementRepository;
  kitRepository: SupabaseKitRepository;
  workOrderRepository: SupabaseWorkOrderRepository;
  stockValidationService: StockValidationDomainService;
  workOrderValidationService: WorkOrderValidationDomainService;
  createEquipmentUseCase: CreateEquipmentUseCase;
  listEquipmentsUseCase: ListEquipmentsUseCase;
  getEquipmentDetailUseCase: GetEquipmentDetailUseCase;
  updateEquipmentUseCase: UpdateEquipmentUseCase;
  deleteEquipmentUseCase: DeleteEquipmentUseCase;
  adjustStockUseCase: AdjustStockUseCase;
  registerMovementUseCase: RegisterMovementUseCase;
  listMovementsUseCase: ListMovementsUseCase;
  createKitUseCase: CreateKitUseCase;
  listKitsUseCase: ListKitsUseCase;
  createWorkOrderUseCase: CreateWorkOrderUseCase;
  listWorkOrdersUseCase: ListWorkOrdersUseCase;
  startWorkOrderUseCase: StartWorkOrderUseCase;
  completeWorkOrderUseCase: CompleteWorkOrderUseCase;
  equipmentService: EquipmentService;
  movementService: MovementService;
}

export function createDIContainer(supabase: SupabaseClient): DIContainer {
  // Repositories
  const equipmentRepository = new SupabaseEquipmentRepository(supabase);
  const movementRepository = new SupabaseMovementRepository(supabase);
  const kitRepository = new SupabaseKitRepository(supabase);
  const workOrderRepository = new SupabaseWorkOrderRepository(supabase);

  // Domain Services
  const stockValidationService = new StockValidationDomainService(equipmentRepository);
  const workOrderValidationService = new WorkOrderValidationDomainService(workOrderRepository);

  // Use Cases - Equipment
  const createEquipmentUseCase = new CreateEquipmentUseCase(equipmentRepository);
  const listEquipmentsUseCase = new ListEquipmentsUseCase(equipmentRepository);
  const getEquipmentDetailUseCase = new GetEquipmentDetailUseCase(equipmentRepository);
  const updateEquipmentUseCase = new UpdateEquipmentUseCase(equipmentRepository);
  const deleteEquipmentUseCase = new DeleteEquipmentUseCase(equipmentRepository);
  const adjustStockUseCase = new AdjustStockUseCase(equipmentRepository);

  // Use Cases - Movement
  const registerMovementUseCase = new RegisterMovementUseCase(
    movementRepository,
    equipmentRepository,
    stockValidationService
  );
  const listMovementsUseCase = new ListMovementsUseCase(movementRepository);

  // Use Cases - Kit
  const createKitUseCase = new CreateKitUseCase(kitRepository, equipmentRepository);
  const listKitsUseCase = new ListKitsUseCase(kitRepository);

  // Use Cases - WorkOrder
  const createWorkOrderUseCase = new CreateWorkOrderUseCase(workOrderRepository, equipmentRepository);
  const listWorkOrdersUseCase = new ListWorkOrdersUseCase(workOrderRepository);
  const startWorkOrderUseCase = new StartWorkOrderUseCase(workOrderRepository, workOrderValidationService);
  const completeWorkOrderUseCase = new CompleteWorkOrderUseCase(workOrderRepository, workOrderValidationService);

  // Application Services
  const equipmentService = new EquipmentService(
    createEquipmentUseCase,
    listEquipmentsUseCase,
    getEquipmentDetailUseCase,
    adjustStockUseCase
  );

  const movementService = new MovementService(registerMovementUseCase, listMovementsUseCase);

  return {
    equipmentRepository,
    movementRepository,
    kitRepository,
    workOrderRepository,
    stockValidationService,
    workOrderValidationService,
    createEquipmentUseCase,
    listEquipmentsUseCase,
    getEquipmentDetailUseCase,
    updateEquipmentUseCase,
    deleteEquipmentUseCase,
    adjustStockUseCase,
    registerMovementUseCase,
    listMovementsUseCase,
    createKitUseCase,
    listKitsUseCase,
    createWorkOrderUseCase,
    listWorkOrdersUseCase,
    startWorkOrderUseCase,
    completeWorkOrderUseCase,
    equipmentService,
    movementService,
  };
}
