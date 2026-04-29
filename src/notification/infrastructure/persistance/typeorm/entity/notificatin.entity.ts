import { NotificationStatus } from '../../../../domain/value-objects/notification-status.vo';
import { NotificationType } from '../../../../domain/value-objects/notification-type.vo';

export class NotificationEntity {
  id: string;
  content: string;

  userId: string;
  type: NotificationType;

  destination: string;

  status: NotificationStatus;

  createdAt: Date;

  provider: string;
}
