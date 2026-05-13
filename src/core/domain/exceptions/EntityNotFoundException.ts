import { DomainException } from './DomainException';

export class EntityNotFoundException extends DomainException {
  constructor(entityName: string, id: string) {
    super(`${entityName} com ID ${id} não encontrado`);
    Object.setPrototypeOf(this, EntityNotFoundException.prototype);
  }
}

export class EquipmentNotFoundException extends EntityNotFoundException {
  constructor(id: string) {
    super('Equipamento', id);
    Object.setPrototypeOf(this, EquipmentNotFoundException.prototype);
  }
}

export class MovementNotFoundException extends EntityNotFoundException {
  constructor(id: string) {
    super('Movimento', id);
    Object.setPrototypeOf(this, MovementNotFoundException.prototype);
  }
}

export class KitNotFoundException extends EntityNotFoundException {
  constructor(id: string) {
    super('Kit', id);
    Object.setPrototypeOf(this, KitNotFoundException.prototype);
  }
}

export class WorkOrderNotFoundException extends EntityNotFoundException {
  constructor(id: string) {
    super('Ordem de Serviço', id);
    Object.setPrototypeOf(this, WorkOrderNotFoundException.prototype);
  }
}

export class UserNotFoundException extends EntityNotFoundException {
  constructor(id: string) {
    super('Usuário', id);
    Object.setPrototypeOf(this, UserNotFoundException.prototype);
  }
}
