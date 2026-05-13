import { DomainException } from './DomainException';

export class InsufficientStockException extends DomainException {
  constructor(availableQuantity: number, requestedQuantity: number) {
    super(
      `Estoque insuficiente. Disponível: ${availableQuantity}, Solicitado: ${requestedQuantity}`
    );
    Object.setPrototypeOf(this, InsufficientStockException.prototype);
  }
}
