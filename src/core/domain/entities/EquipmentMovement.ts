import { MovementType } from '../../shared/types/domain';
import { BusinessRuleException } from '../domain/exceptions';

interface EquipmentMovementProps {
  equipmentId: string;
  quantity: number;
  type: MovementType;
  userId: string;
  workOrderId?: string;
  notes?: string;
  reference?: string;
}

export class EquipmentMovement {
  private readonly _id: string;
  private readonly _equipmentId: string;
  private readonly _quantity: number;
  private readonly _type: MovementType;
  private readonly _userId: string;
  private readonly _workOrderId?: string;
  private readonly _notes?: string;
  private readonly _reference?: string;
  private readonly _createdAt: Date;
  private _updatedAt: Date;
  private _deletedAt?: Date | null;

  constructor(props: EquipmentMovementProps, id?: string, createdAt?: Date) {
    this._id = id || this.generateId();
    this._equipmentId = props.equipmentId;
    this._quantity = props.quantity;
    this._type = props.type;
    this._userId = props.userId;
    this._workOrderId = props.workOrderId;
    this._notes = props.notes;
    this._reference = props.reference;
    this._createdAt = createdAt || new Date();
    this._updatedAt = new Date();

    this.validate();
  }

  private validate(): void {
    if (!this._equipmentId) {
      throw new BusinessRuleException('ID do equipamento é obrigatório');
    }

    if (this._quantity <= 0) {
      throw new BusinessRuleException('Quantidade deve ser maior que zero');
    }

    if (!this._userId) {
      throw new BusinessRuleException('ID do usuário é obrigatório');
    }

    if (!this._type) {
      throw new BusinessRuleException('Tipo de movimento é obrigatório');
    }
  }

  private generateId(): string {
    return `mov_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  public soft_delete(): void {
    this._deletedAt = new Date();
    this._updatedAt = new Date();
  }

  public restore(): void {
    this._deletedAt = null;
    this._updatedAt = new Date();
  }

  // Getters (imutáveis)
  get id(): string {
    return this._id;
  }

  get equipmentId(): string {
    return this._equipmentId;
  }

  get quantity(): number {
    return this._quantity;
  }

  get type(): MovementType {
    return this._type;
  }

  get userId(): string {
    return this._userId;
  }

  get workOrderId(): string | undefined {
    return this._workOrderId;
  }

  get notes(): string | undefined {
    return this._notes;
  }

  get reference(): string | undefined {
    return this._reference;
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

  get isEntry(): boolean {
    return this._type === MovementType.ENTRADA;
  }

  get isExit(): boolean {
    return this._type === MovementType.SAIDA;
  }

  get isReturn(): boolean {
    return this._type === MovementType.RETORNO;
  }

  get isAdjustment(): boolean {
    return this._type === MovementType.AJUSTE;
  }
}
