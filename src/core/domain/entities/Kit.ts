import { EquipmentStatus } from '../../shared/types/domain';
import { BusinessRuleException } from '../domain/exceptions';

interface KitItem {
  equipmentId: string;
  quantity: number;
}

interface KitProps {
  name: string;
  description?: string;
  items: KitItem[];
  status: EquipmentStatus;
  location?: string;
  notes?: string;
}

export class Kit {
  private readonly _id: string;
  private _name: string;
  private _description?: string;
  private _items: KitItem[];
  private _status: EquipmentStatus;
  private _location?: string;
  private _notes?: string;
  private readonly _createdAt: Date;
  private _updatedAt: Date;
  private _deletedAt?: Date | null;

  constructor(props: KitProps, id?: string, createdAt?: Date) {
    this._id = id || this.generateId();
    this._name = props.name;
    this._description = props.description;
    this._items = props.items;
    this._status = props.status;
    this._location = props.location;
    this._notes = props.notes;
    this._createdAt = createdAt || new Date();
    this._updatedAt = new Date();

    this.validate();
  }

  private validate(): void {
    if (!this._name || this._name.trim() === '') {
      throw new BusinessRuleException('Nome do kit é obrigatório');
    }

    if (!this._items || this._items.length === 0) {
      throw new BusinessRuleException('Kit deve ter pelo menos um item');
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
    return `kit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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
      throw new BusinessRuleException('Kit deve ter pelo menos um item');
    }

    this._updatedAt = new Date();
  }

  public updateItem(equipmentId: string, quantity: number): void {
    if (quantity <= 0) {
      throw new BusinessRuleException('Quantidade deve ser maior que zero');
    }

    const item = this._items.find((item) => item.equipmentId === equipmentId);

    if (!item) {
      throw new BusinessRuleException('Item não encontrado no kit');
    }

    item.quantity = quantity;
    this._updatedAt = new Date();
  }

  public changeStatus(status: EquipmentStatus): void {
    this._status = status;
    this._updatedAt = new Date();
  }

  public updateInfo(props: Partial<KitProps>): void {
    if (props.name !== undefined) this._name = props.name;
    if (props.description !== undefined) this._description = props.description;
    if (props.location !== undefined) this._location = props.location;
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

  get name(): string {
    return this._name;
  }

  get description(): string | undefined {
    return this._description;
  }

  get items(): ReadonlyArray<KitItem> {
    return Object.freeze([...this._items]);
  }

  get itemCount(): number {
    return this._items.length;
  }

  get status(): EquipmentStatus {
    return this._status;
  }

  get location(): string | undefined {
    return this._location;
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

  get isActive(): boolean {
    return this._status === EquipmentStatus.ATIVO && !this.isDeleted;
  }
}
