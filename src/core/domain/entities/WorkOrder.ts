import { WorkOrderStatus } from '../../shared/types/domain';
import { BusinessRuleException } from '../domain/exceptions';

interface WorkOrderItem {
  equipmentId: string;
  quantity: number;
  usedQuantity?: number;
}

interface WorkOrderProps {
  title: string;
  description?: string;
  clientId: string;
  technicianId?: string;
  items: WorkOrderItem[];
  status: WorkOrderStatus;
  priority?: 'baixa' | 'media' | 'alta';
  dueDate?: Date;
  notes?: string;
}

export class WorkOrder {
  private readonly _id: string;
  private _title: string;
  private _description?: string;
  private readonly _clientId: string;
  private _technicianId?: string;
  private _items: WorkOrderItem[];
  private _status: WorkOrderStatus;
  private _priority: 'baixa' | 'media' | 'alta' = 'media';
  private _dueDate?: Date;
  private _notes?: string;
  private readonly _createdAt: Date;
  private _updatedAt: Date;
  private _deletedAt?: Date | null;

  constructor(props: WorkOrderProps, id?: string, createdAt?: Date) {
    this._id = id || this.generateId();
    this._title = props.title;
    this._description = props.description;
    this._clientId = props.clientId;
    this._technicianId = props.technicianId;
    this._items = props.items;
    this._status = props.status;
    this._priority = props.priority || 'media';
    this._dueDate = props.dueDate;
    this._notes = props.notes;
    this._createdAt = createdAt || new Date();
    this._updatedAt = new Date();

    this.validate();
  }

  private validate(): void {
    if (!this._title || this._title.trim() === '') {
      throw new BusinessRuleException('Título da ordem de serviço é obrigatório');
    }

    if (!this._clientId) {
      throw new BusinessRuleException('Cliente é obrigatório');
    }

    if (!this._items || this._items.length === 0) {
      throw new BusinessRuleException('Ordem de serviço deve ter pelo menos um item');
    }

    for (const item of this._items) {
      if (!item.equipmentId) {
        throw new BusinessRuleException('ID do equipamento do item é obrigatório');
      }
      if (item.quantity <= 0) {
        throw new BusinessRuleException('Quantidade do item deve ser maior que zero');
      }
    }
  }

  private generateId(): string {
    return `wo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  public assignTechnician(technicianId: string): void {
    if (this._status !== WorkOrderStatus.ABERTA) {
      throw new BusinessRuleException(
        'Só é possível atribuir técnico em ordem de serviço aberta'
      );
    }
    this._technicianId = technicianId;
    this._updatedAt = new Date();
  }

  public start(): void {
    if (this._status !== WorkOrderStatus.ABERTA) {
      throw new BusinessRuleException('Ordem de serviço já foi iniciada');
    }
    if (!this._technicianId) {
      throw new BusinessRuleException('Técnico deve ser atribuído antes de iniciar');
    }
    this._status = WorkOrderStatus.EM_PROGRESSO;
    this._updatedAt = new Date();
  }

  public complete(): void {
    if (this._status !== WorkOrderStatus.EM_PROGRESSO) {
      throw new BusinessRuleException('Apenas ordens em progresso podem ser concluídas');
    }
    this._status = WorkOrderStatus.CONCLUIDA;
    this._updatedAt = new Date();
  }

  public cancel(): void {
    if (
      this._status === WorkOrderStatus.CONCLUIDA ||
      this._status === WorkOrderStatus.CANCELADA
    ) {
      throw new BusinessRuleException('Ordem finalizada ou cancelada não pode ser cancelada');
    }
    this._status = WorkOrderStatus.CANCELADA;
    this._updatedAt = new Date();
  }

  public addItem(equipmentId: string, quantity: number): void {
    if (quantity <= 0) {
      throw new BusinessRuleException('Quantidade deve ser maior que zero');
    }

    const existingItem = this._items.find((item) => item.equipmentId === equipmentId);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this._items.push({ equipmentId, quantity });
    }

    this._updatedAt = new Date();
  }

  public removeItem(equipmentId: string): void {
    this._items = this._items.filter((item) => item.equipmentId !== equipmentId);

    if (this._items.length === 0) {
      throw new BusinessRuleException('Ordem de serviço deve ter pelo menos um item');
    }

    this._updatedAt = new Date();
  }

  public updateItem(equipmentId: string, quantity: number): void {
    if (quantity <= 0) {
      throw new BusinessRuleException('Quantidade deve ser maior que zero');
    }

    const item = this._items.find((item) => item.equipmentId === equipmentId);

    if (!item) {
      throw new BusinessRuleException('Item não encontrado na ordem de serviço');
    }

    item.quantity = quantity;
    this._updatedAt = new Date();
  }

  public recordItemUsage(equipmentId: string, usedQuantity: number): void {
    if (usedQuantity < 0) {
      throw new BusinessRuleException('Quantidade usada não pode ser negativa');
    }

    const item = this._items.find((item) => item.equipmentId === equipmentId);

    if (!item) {
      throw new BusinessRuleException('Item não encontrado na ordem de serviço');
    }

    if (usedQuantity > item.quantity) {
      throw new BusinessRuleException(
        `Quantidade usada (${usedQuantity}) não pode exceder quantidade alocada (${item.quantity})`
      );
    }

    item.usedQuantity = usedQuantity;
    this._updatedAt = new Date();
  }

  public updateInfo(props: Partial<WorkOrderProps>): void {
    if (props.title !== undefined) this._title = props.title;
    if (props.description !== undefined) this._description = props.description;
    if (props.priority !== undefined) this._priority = props.priority;
    if (props.dueDate !== undefined) this._dueDate = props.dueDate;
    if (props.notes !== undefined) this._notes = props.notes;

    this.validate();
    this._updatedAt = new Date();
  }

  public soft_delete(): void {
    this._deletedAt = new Date();
    this._updatedAt = new Date();
  }

  public restore(): void {
    this._deletedAt = null;
    this._updatedAt = new Date();
  }

  // Getters
  get id(): string {
    return this._id;
  }

  get title(): string {
    return this._title;
  }

  get description(): string | undefined {
    return this._description;
  }

  get clientId(): string {
    return this._clientId;
  }

  get technicianId(): string | undefined {
    return this._technicianId;
  }

  get items(): ReadonlyArray<WorkOrderItem> {
    return Object.freeze([...this._items]);
  }

  get itemCount(): number {
    return this._items.length;
  }

  get status(): WorkOrderStatus {
    return this._status;
  }

  get priority(): string {
    return this._priority;
  }

  get dueDate(): Date | undefined {
    return this._dueDate;
  }

  get notes(): string | undefined {
    return this._notes;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  get deletedAt(): Date | null | undefined {
    return this._deletedAt;
  }

  get isDeleted(): boolean {
    return this._deletedAt != null;
  }

  get isOpen(): boolean {
    return this._status === WorkOrderStatus.ABERTA && !this.isDeleted;
  }

  get isInProgress(): boolean {
    return this._status === WorkOrderStatus.EM_PROGRESSO;
  }

  get isCompleted(): boolean {
    return this._status === WorkOrderStatus.CONCLUIDA;
  }

  get isCancelled(): boolean {
    return this._status === WorkOrderStatus.CANCELADA;
  }

  get isOverdue(): boolean {
    return this._dueDate && new Date() > this._dueDate && !this.isCompleted;
  }
}
