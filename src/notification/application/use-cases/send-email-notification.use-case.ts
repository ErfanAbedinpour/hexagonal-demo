import { Inject, Injectable } from '@nestjs/common';
import {
  EmailProvider,
  IEmailProvider,
} from '../ports/providers/email-provider.port';
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
import { ICache, Cache } from '../ports/cross-cutting/cache.port';

@Injectable()
export class SendEmailNotificationUseCase {
  constructor(
    @Inject(EmailProvider) private readonly emailProvider: IEmailProvider,
    @Inject(UserService) private readonly userService: UserServicePort,
    @Inject(NotificationRepository)
    private readonly notificationRepository: INotificationRepository,
    @Inject(Cache)
    private readonly cacheService: ICache,
  ) {}

  async Execute(destination: string, message: string) {
    const user = await this.userService.getUserByEmail(destination);
    console.log(user);
    if (!user) {
      return new ApplicationError('User Not Found');
    }

    const data = {
      email: destination,
      message,
      provider: this.emailProvider.providerName,
      sentAt: new Date(),
    };

    await this.emailProvider.send(destination, message);

    // using repository to save notification record
    await this.notificationRepository.save(
      new Notification(
        data.email,
        String(user.id),
        NotificationType.EMAIL,
        data.email,
        data.message,
        NotificationStatus.SENT,
        data.sentAt,
      ),
    );

    // only for use
    await this.cacheService.set(`email_notification_${user.id}`, true, 3600); // Cache for 1 hour

    return data;
  }
}
