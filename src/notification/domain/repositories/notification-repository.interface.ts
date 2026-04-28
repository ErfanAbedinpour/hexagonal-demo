import { Notification } from '../entities/notification.entity';

export const NotificationRepository = Symbol('NotificationRepository');
export interface INotificationRepository {
  save(notification: Notification): Promise<void>;
  findById(id: string): Promise<Notification | null>;
  findByUserId(userId: string): Promise<Notification[]>;
}
