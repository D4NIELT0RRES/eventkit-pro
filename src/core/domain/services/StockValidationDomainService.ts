import { IEquipmentRepository } from '../repositories/IEquipmentRepository';
import { MovementType } from '../../shared/types/domain';
import {
  InsufficientStockException,
  EquipmentNotFoundException,
  InvalidMovementException,
} from '../exceptions';

export class StockValidationDomainService {
  constructor(private equipmentRepository: IEquipmentRepository) {}

  async validateMovement(
    equipmentId: string,
    quantity: number,
    type: MovementType
  ): Promise<void> {
    const equipment = await this.equipmentRepository.findById(equipmentId);

    if (!equipment) {
      throw new EquipmentNotFoundException(equipmentId);
    }

    if (type === MovementType.SAIDA && quantity > equipment.availableQuantity) {
      throw new InsufficientStockException(equipment.availableQuantity, quantity);
    }

    if (type === MovementType.RETORNO) {
      const wouldExceed = equipment.availableQuantity + quantity > equipment.quantity;
      if (wouldExceed) {
        throw new InvalidMovementException(
          `Retorno de ${quantity} unidades ultrapassaria o total de ${equipment.quantity}`
        );
      }
    }

    if (quantity <= 0) {
      throw new InvalidMovementException('Quantidade deve ser maior que zero');
    }
  }

  async validateStockLevel(equipmentId: string, minimumThreshold: number): Promise<boolean> {
    const equipment = await this.equipmentRepository.findById(equipmentId);

    if (!equipment) {
      throw new EquipmentNotFoundException(equipmentId);
    }

    return equipment.availableQuantity >= minimumThreshold;
  }
}
