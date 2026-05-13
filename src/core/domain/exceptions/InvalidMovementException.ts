import { DomainException } from './DomainException';

export class InvalidMovementException extends DomainException {
  constructor(reason: string) {
    super(`Movimento inválido: ${reason}`);
    Object.setPrototypeOf(this, InvalidMovementException.prototype);
  }
}
