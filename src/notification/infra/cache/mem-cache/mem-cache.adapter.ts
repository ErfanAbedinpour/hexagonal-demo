import { ICache } from '../../../application/ports/cross-cutting/cache.port';

export class MemcacheAdapter implements ICache {
  delete(key: string): Promise<void> {
    return Promise.resolve();
  }

  get<T>(key: string): Promise<T | null> {
    return Promise.resolve(null);
  }

  set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    return Promise.resolve();
  }
}
