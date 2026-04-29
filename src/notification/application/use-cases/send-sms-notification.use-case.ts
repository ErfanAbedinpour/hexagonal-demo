import { Inject, Injectable } from '@nestjs/common';
import {
  ISmsProvider,
  SmsProvider,
} from '../ports/providers/sms-provider.port';
import {
  UserService,
  UserServicePort,
} from '../ports/external/user-service.port';
import { ApplicationError } from '../../../common/filters/application-error.filter';
import {
  INotificationRepository,
  NotificationRepository,
} from '../../domain/repositories/notification-repository.interface';
import { Notification } from '../../domain/entities/notification.entity';
import { NotificationType } from '../../domain/value-objects/notification-type.vo';
import { NotificationStatus } from '../../domain/value-objects/notification-status.vo';
import { Cache, ICache } from '../ports/cross-cutting/cache.port';

@Injectable()
export class SendSmsNotificationUseCase {
  constructor(
    @Inject(SmsProvider) private readonly emailProvider: ISmsProvider,
    @Inject(UserService) private readonly userService: UserServicePort,
    @Inject(NotificationRepository)
    private readonly notificationRepository: INotificationRepository,
    @Inject(Cache)
    private readonly cacheService: ICache,
  ) {}

  async Execute(destination: string, message: string) {
    const user = await this.userService.getUserByIdentifier(destination);
    if (!user) {
      return new ApplicationError('User Not Found');
    }

    const data = {
      identifier: destination,
      message,
      provider: this.emailProvider.providerName,
      sentAt: new Date(),
    };
    await this.emailProvider.send(destination, message);

    // for mock
    // using repository to save notification record
    await this.notificationRepository.save(
      new Notification(
        data.identifier,
        String(user.id),
        NotificationType.EMAIL,
        data.identifier,
        data.message,
        NotificationStatus.SENT,
        data.sentAt,
      ),
    );
    // only for use
    await this.cacheService.set(`sms_notification_${user.id}`, true, 3600); // Cache for 1 hour
    return data;
  }
}
