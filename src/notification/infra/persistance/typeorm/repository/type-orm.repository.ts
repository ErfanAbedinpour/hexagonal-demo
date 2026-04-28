import { Notification } from '../../../../domain/entities/notification.entity';
import { INotificationRepository } from '../../../../domain/repositories/notification-repository.interface';

export class TypeOrmRepository implements INotificationRepository {
  // typeorm driver
  constructor() {
    // Initialize your TypeORM connection here
  }

  findById(id: string): Promise<Notification | null> {
    return Promise.resolve(null);
  }

  findByUserId(userId: string): Promise<Notification[]> {
    return Promise.resolve([]);
  }

  save(notification: Notification): Promise<void> {
    return Promise.resolve();
  }
}
