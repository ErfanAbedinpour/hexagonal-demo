import { ICache } from '../../../application/ports/cross-cutting/cache.port';

export class RedisAdapter implements ICache {
  delete(key: string): Promise<void> {
    // mock for redis implementation
    return Promise.resolve();
  }
  get<T>(key: string): Promise<T | null> {
    // mock redis implementation
    return Promise.resolve(null);
  }
  set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    // Mock
    return Promise.resolve();
  }
}
