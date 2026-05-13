import { Equipment } from '../entities/Equipment';
import { EquipmentStatus } from '../../shared/types/domain';
import { BusinessRuleException } from '../exceptions';

export class EquipmentLifecycleDomainService {
  /**
   * Valida se um equipamento pode ser marcado como inativo
   * Regras:
   * - Deve estar ativo
   * - Não pode ter quantidade disponível menor que total (estoque alocado)
   */
  validateCanMarkInactive(equipment: Equipment): void {
    if (equipment.status !== EquipmentStatus.ATIVO) {
      throw new BusinessRuleException('Equipamento já está inativo ou em manutenção');
    }

    if (equipment.usedQuantity > 0) {
      throw new BusinessRuleException(
        `Não é possível inativar equipamento com ${equipment.usedQuantity} unidade(s) em uso`
      );
    }
  }

  /**
   * Valida se um equipamento pode entrar em manutenção
   * Regras:
   * - Deve estar ativo
   * - Pode ter quantidade alocada
   */
  validateCanMarkMaintenance(equipment: Equipment): void {
    if (equipment.status !== EquipmentStatus.ATIVO) {
      throw new BusinessRuleException('Equipamento deve estar ativo para entrar em manutenção');
    }
  }

  /**
   * Valida se um equipamento pode ser descartado
   * Regras:
   * - Deve estar inativo ou em manutenção por mais de X dias
   * - Não pode ter quantidade disponível
   */
  validateCanMarkDiscarded(equipment: Equipment): void {
    if (equipment.status === EquipmentStatus.ATIVO) {
      throw new BusinessRuleException('Equipamento ativo não pode ser descartado');
    }

    if (equipment.availableQuantity > 0) {
      throw new BusinessRuleException(
        'Equipamento deve estar completamente utilizado antes de ser descartado'
      );
    }
  }

  /**
   * Calcula saúde do estoque
   * Retorna:
   * - 'crítico': menos de 20% disponível
   * - 'baixo': menos de 50% disponível
   * - 'normal': 50% ou mais disponível
   */
  calculateStockHealth(equipment: Equipment): 'crítico' | 'baixo' | 'normal' {
    const availablePercentage = (equipment.availableQuantity / equipment.quantity) * 100;

    if (availablePercentage < 20) return 'crítico';
    if (availablePercentage < 50) return 'baixo';
    return 'normal';
  }

  /**
   * Recomenda ações baseado na saúde do estoque
   */
  getStockRecommendation(equipment: Equipment): string {
    const health = this.calculateStockHealth(equipment);

    switch (health) {
      case 'crítico':
        return `CRÍTICO: Apenas ${equipment.availableQuantity} de ${equipment.quantity} disponíveis. Reposição urgente recomendada.`;
      case 'baixo':
        return `BAIXO: ${equipment.availableQuantity} de ${equipment.quantity} disponíveis. Considere fazer reposição.`;
      default:
        return 'Estoque em nível normal.';
    }
  }
}
