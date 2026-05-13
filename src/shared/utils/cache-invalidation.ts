// Cache invalidation manager
export class CacheInvalidationManager {
  private invalidationPatterns: Map<string, Set<string>> = new Map();

  /**
   * Registra que um padrão de cache depende de outro
   * Exemplo: ao deletar equipment, invalidar cache de lists
   */
  registerDependency(pattern: string, dependsOn: string): void {
    if (!this.invalidationPatterns.has(dependsOn)) {
      this.invalidationPatterns.set(dependsOn, new Set());
    }
    this.invalidationPatterns.get(dependsOn)!.add(pattern);
  }

  /**
   * Retorna todos os padrões que devem ser invalidados quando um padrão muda
   */
  getInvalidatedPatterns(changedPattern: string): string[] {
    const result = [changedPattern];
    const dependents = this.invalidationPatterns.get(changedPattern);

    if (dependents) {
      result.push(...dependents);
    }

    return result;
  }
}

// Instance global
export const cacheInvalidationManager = new CacheInvalidationManager();

// Configurar relações de dependência
cacheInvalidationManager.registerDependency('equipments:list', 'equipment:*');
cacheInvalidationManager.registerDependency('work_orders:list', 'work_order:*');
cacheInvalidationManager.registerDependency('kits:list', 'kit:*');
cacheInvalidationManager.registerDependency('equipments:list', 'movements:*');
