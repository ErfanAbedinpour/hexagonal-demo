import { Module } from '@nestjs/common';
import { NotificationController } from './infrastructure/http/controller/http-notification.controller';
import { NotificationRepository } from './domain/repositories/notification-repository.interface';
import { SmsProvider } from './application/ports/providers/sms-provider.port';
import { MeliPayamakAdapter } from './infrastructure/sms/adapter/melipayamak.adapter';
import { EmailProvider } from './application/ports/providers/email-provider.port';
import { NodemailerAdapter } from './infrastructure/email/nodemailer/nodemailer.adapter';
import { Cache } from './application/ports/cross-cutting/cache.port';
import { RedisAdapter } from './infrastructure/cache/redis/redis.adapter';
import { TypeOrmRepository } from './infrastructure/persistance/typeorm/repository/type-orm.repository';
import { SendEmailNotificationUseCase } from './application/use-cases/send-email-notification.use-case';
import { MemcacheAdapter } from './infrastructure/cache/mem-cache/mem-cache.adapter';
import { SmsIrAdapter } from './infrastructure/sms/adapter/sms-ir.adapter';
import { InMemoryUserRepository } from '../user/infrastructure/persistence/repositories/in-memory-user.repository';
import { SendSmsNotificationUseCase } from './application/use-cases/send-sms-notification.use-case';
import { UserService } from './application/ports/external/user-service.port';
import { UserServiceAdapter } from './application/adapters/external/user-service.adapter';

@Module({
  providers: [
    SendEmailNotificationUseCase,
    SendSmsNotificationUseCase,
    {
      provide: SmsProvider,
      // Or SmsIrAdapter
      useClass: SmsIrAdapter,
    },
    {
      provide: 'UserRepository',
      useClass: InMemoryUserRepository,
    },
    {
      provide: EmailProvider,
      // Or Another adapter
      useClass: NodemailerAdapter,
    },
    {
      provide: Cache,
      // Or memcache Adapter
      useClass: MemcacheAdapter,
    },
    {
      provide: NotificationRepository,
      // Or PrismaRepository
      useClass: TypeOrmRepository,
    },
    {
      provide: UserService,
      // Or PrismaRepository
      useClass: UserServiceAdapter,
    },
  ],
  controllers: [NotificationController],
})
export class NotificationModule {}
