import { DomainException } from './DomainException';

export class BusinessRuleException extends DomainException {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, BusinessRuleException.prototype);
  }
}
