import { DomainException } from './DomainException';

export class ValidationException extends DomainException {
  constructor(public errors: Record<string, string[]>) {
    super('Erro de validação');
    Object.setPrototypeOf(this, ValidationException.prototype);
  }
}
