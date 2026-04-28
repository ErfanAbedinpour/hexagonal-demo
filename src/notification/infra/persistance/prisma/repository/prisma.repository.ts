import { Notification } from '../../../../domain/entities/notification.entity';
import { INotificationRepository } from '../../../../domain/repositories/notification-repository.interface';

export class PrismaRepository implements INotificationRepository {
  // prisma driver
  constructor() {}
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
