import { EquipmentStatus } from '../../shared/types/domain';
import { BusinessRuleException, InsufficientStockException } from '../domain/exceptions';

interface EquipmentProps {
  name: string;
  patrimonyNo?: string;
  brand?: string;
  model?: string;
  description?: string;
  quantity: number;
  availableQuantity: number;
  status: EquipmentStatus;
  categoryId?: string;
  location?: string;
  notes?: string;
}

export class Equipment {
  private readonly _id: string;
  private _name: string;
  private _patrimonyNo?: string;
  private _brand?: string;
  private _model?: string;
  private _description?: string;
  private _quantity: number;
  private _availableQuantity: number;
  private _status: EquipmentStatus;
  private _categoryId?: string;
  private _location?: string;
  private _notes?: string;
  private readonly _createdAt: Date;
  private _updatedAt: Date;
  private _deletedAt?: Date | null;

  constructor(props: EquipmentProps, id?: string, createdAt?: Date) {
    this._id = id || this.generateId();
    this._name = props.name;
    this._patrimonyNo = props.patrimonyNo;
    this._brand = props.brand;
    this._model = props.model;
    this._description = props.description;
    this._quantity = props.quantity;
    this._availableQuantity = props.availableQuantity;
    this._status = props.status;
    this._categoryId = props.categoryId;
    this._location = props.location;
    this._notes = props.notes;
    this._createdAt = createdAt || new Date();
    this._updatedAt = new Date();

    this.validate();
  }

  private validate(): void {
    if (!this._name || this._name.trim() === '') {
      throw new BusinessRuleException('Nome do equipamento é obrigatório');
    }

    if (this._quantity <= 0) {
      throw new BusinessRuleException('Quantidade deve ser maior que zero');
    }

    if (this._availableQuantity < 0) {
      throw new BusinessRuleException('Quantidade disponível não pode ser negativa');
    }

    if (this._availableQuantity > this._quantity) {
      throw new BusinessRuleException(
        'Quantidade disponível não pode ser maior que a quantidade total'
      );
    }
  }

  private generateId(): string {
    return `eq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  public register(quantity: number): void {
    if (quantity <= 0) {
      throw new BusinessRuleException('Quantidade de registro deve ser maior que zero');
    }
    this._quantity += quantity;
    this._availableQuantity += quantity;
    this._updatedAt = new Date();
  }

  public removeFromStock(quantity: number): void {
    if (quantity <= 0) {
      throw new BusinessRuleException('Quantidade de saída deve ser maior que zero');
    }

    if (quantity > this._availableQuantity) {
      throw new InsufficientStockException(this._availableQuantity, quantity);
    }

    this._availableQuantity -= quantity;
    this._updatedAt = new Date();
  }

  public restoreToStock(quantity: number): void {
    if (quantity <= 0) {
      throw new BusinessRuleException('Quantidade de retorno deve ser maior que zero');
    }

    if (this._availableQuantity + quantity > this._quantity) {
      throw new BusinessRuleException(
        `Não é possível restaurar ${quantity} unidades. Ultrapassaria a quantidade total de ${this._quantity}`
      );
    }

    this._availableQuantity += quantity;
    this._updatedAt = new Date();
  }

  public adjustStock(newQuantity: number, newAvailableQuantity: number): void {
    if (newQuantity <= 0) {
      throw new BusinessRuleException('Quantidade deve ser maior que zero');
    }

    if (newAvailableQuantity < 0) {
      throw new BusinessRuleException('Quantidade disponível não pode ser negativa');
    }

    if (newAvailableQuantity > newQuantity) {
      throw new BusinessRuleException(
        'Quantidade disponível não pode ser maior que a quantidade total'
      );
    }

    this._quantity = newQuantity;
    this._availableQuantity = newAvailableQuantity;
    this._updatedAt = new Date();
  }

  public changeStatus(status: EquipmentStatus): void {
    this._status = status;
    this._updatedAt = new Date();
  }

  public updateInfo(props: Partial<EquipmentProps>): void {
    if (props.name !== undefined) this._name = props.name;
    if (props.patrimonyNo !== undefined) this._patrimonyNo = props.patrimonyNo;
    if (props.brand !== undefined) this._brand = props.brand;
    if (props.model !== undefined) this._model = props.model;
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

  get patrimonyNo(): string | undefined {
    return this._patrimonyNo;
  }

  get brand(): string | undefined {
    return this._brand;
  }

  get model(): string | undefined {
    return this._model;
  }

  get description(): string | undefined {
    return this._description;
  }

  get quantity(): number {
    return this._quantity;
  }

  get availableQuantity(): number {
    return this._availableQuantity;
  }

  get usedQuantity(): number {
    return this._quantity - this._availableQuantity;
  }

  get status(): EquipmentStatus {
    return this._status;
  }

  get categoryId(): string | undefined {
    return this._categoryId;
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
