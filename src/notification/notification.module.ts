import { Module } from '@nestjs/common';
import { NotificationController } from './infra/http/controller/http-notification.controller';
import { NotificationRepository } from './domain/repositories/notification-repository.interface';
import { SmsProvider } from './application/ports/providers/sms-provider.port';
import { MeliPayamakAdapter } from './infra/sms/adapter/melipayamak.adapter';
import { EmailProvider } from './application/ports/providers/email-provider.port';
import { NodemailerAdapter } from './infra/email/nodemailer/nodemailer.adapter';
import { Cache } from './application/ports/cross-cutting/cache.port';
import { RedisAdapter } from './infra/cache/redis/redis.adapter';
import { TypeOrmRepository } from './infra/persistance/typeorm/repository/type-orm.repository';
import { SendEmailNotificationUseCase } from './application/use-cases/send-notification.use-case';
import { MemcacheAdapter } from './infra/cache/mem-cache/mem-cache.adapter';
import { SmsIrAdapter } from './infra/sms/adapter/sms-ir.adapter';
import { InMemoryUserRepository } from '../user/infrastructure/persistence/repositories/in-memory-user.repository';

@Module({
  providers: [
    SendEmailNotificationUseCase,
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
  ],
  controllers: [NotificationController],
})
export class NotificationModule {}
