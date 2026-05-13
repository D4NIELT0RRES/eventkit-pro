// Cache manager for optimizing performance
// This will integrate with Redis or similar solutions in the future

export interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class InMemoryCache {
  private cache: Map<string, CacheEntry<any>> = new Map();

  set<T>(key: string, value: T, ttlSeconds: number = 300): void {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.cache.set(key, { value, expiresAt });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) return null;

    // Check if expired
    if (entry.expiresAt < Date.now()) {
      this.cache.delete(key);
      return null;
    }

    return entry.value as T;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Clear all expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt < now) {
        this.cache.delete(key);
      }
    }
  }

  // Generate cache key helper
  static generateKey(...parts: string[]): string {
    return parts.join(':');
  }
}

// Cache key patterns
export const CacheKeys = {
  equipment: (id: string) => InMemoryCache.generateKey('equipment', id),
  equipmentList: (filters: string) => InMemoryCache.generateKey('equipments', filters),
  workOrder: (id: string) => InMemoryCache.generateKey('workorder', id),
  kit: (id: string) => InMemoryCache.generateKey('kit', id),
  movement: (id: string) => InMemoryCache.generateKey('movement', id),
};
