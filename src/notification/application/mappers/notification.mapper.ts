import { Notification } from '../../domain/entities/notification.entity';
import { NotificationEntity } from '../../infrastructure/persistance/typeorm/entity/notificatin.entity';

export class NotificationMapper {
  static toDomain(notif: NotificationEntity): Notification {
    return new Notification(
      notif.id,
      notif.userId,
      notif.type,
      notif.content,
      notif.destination,
      notif.status,
      notif.createdAt,
    );
  }

  static toEntity(notification: Notification): NotificationEntity {
    const entity = new NotificationEntity();
    entity.id = notification.id;
    entity.userId = notification.userId;
    entity.type = notification.type;
    entity.destination = notification.destination;
    entity.status = notification.status;
    entity.createdAt = notification.createdAt;
    return entity;
  }
}
