import { WorkOrder } from '../entities/WorkOrder';
import { IEquipmentRepository } from '../repositories/IEquipmentRepository';
import { BusinessRuleException } from '../exceptions';

export class WorkOrderValidationDomainService {
  constructor(private equipmentRepository: IEquipmentRepository) {}

  /**
   * Valida se todos os equipamentos da ordem têm quantidade suficiente disponível
   */
  async validateEquipmentAvailability(workOrder: WorkOrder): Promise<void> {
    for (const item of workOrder.items) {
      const equipment = await this.equipmentRepository.findById(item.equipmentId);

      if (!equipment) {
        throw new BusinessRuleException(`Equipamento ${item.equipmentId} não encontrado`);
      }

      if (item.quantity > equipment.availableQuantity) {
        throw new BusinessRuleException(
          `Equipamento "${equipment.name}" tem apenas ${equipment.availableQuantity} disponíveis, mas foram solicitadas ${item.quantity} unidades`
        );
      }
    }
  }

  /**
   * Valida se uma ordem pode ser iniciada
   * Regras:
   * - Deve estar aberta
   * - Deve ter técnico atribuído
   * - Todos os equipamentos devem estar disponíveis
   */
  async validateCanStart(workOrder: WorkOrder): Promise<void> {
    if (!workOrder.isOpen) {
      throw new BusinessRuleException('Apenas ordens abertas podem ser iniciadas');
    }

    if (!workOrder.technicianId) {
      throw new BusinessRuleException('Técnico deve ser atribuído antes de iniciar');
    }

    await this.validateEquipmentAvailability(workOrder);
  }

  /**
   * Calcula a prioridade efetiva baseada em fatores
   */
  calculateEffectivePriority(
    workOrder: WorkOrder
  ): 'crítica' | 'alta' | 'média' | 'baixa' {
    // Se está atrasado, elevar prioridade
    if (workOrder.isOverdue) {
      if (workOrder.priority === 'alta') return 'crítica';
      if (workOrder.priority === 'media') return 'alta';
      if (workOrder.priority === 'baixa') return 'media';
    }

    return (workOrder.priority as any) || 'media';
  }

  /**
   * Validar se ordem pode ser concluída
   * Regras:
   * - Deve estar em progresso
   * - Equipamentos devem ter sido marcados como utilizados (opcional mas recomendado)
   */
  validateCanComplete(workOrder: WorkOrder): void {
    if (!workOrder.isInProgress) {
      throw new BusinessRuleException('Apenas ordens em progresso podem ser concluídas');
    }
  }
}
