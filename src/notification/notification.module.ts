import { Module } from '@nestjs/common';
import { NotificationController } from './infrastructure/http/controller/http-notification.controller';
import { NotificationRepository } from './domain/repositories/notification-repository.interface';
import { SmsProvider } from './application/ports/providers/sms-provider.port';
import { EmailProvider } from './application/ports/providers/email-provider.port';
import { NodemailerAdapter } from './infrastructure/email/nodemailer/nodemailer.adapter';
import { Cache } from './application/ports/cross-cutting/cache.port';
import { SendEmailNotificationUseCase } from './application/use-cases/send-email-notification.use-case';
import { MemcacheAdapter } from './infrastructure/cache/mem-cache/mem-cache.adapter';
import { SmsIrAdapter } from './infrastructure/sms/adapter/sms-ir.adapter';
import { SendSmsNotificationUseCase } from './application/use-cases/send-sms-notification.use-case';
import { UserService } from './application/ports/external/user-service.port';
import { UserServiceAdapter } from './application/adapters/external/user-service.adapter';
import { PrismaRepository } from './infrastructure/persistance/prisma/repository/prisma.repository';
import { LiaraSmtpServiceAdapter } from './infrastructure/email/liara/liara-smtp.adapter';

@Module({
  providers: [
    SendEmailNotificationUseCase,
    SendSmsNotificationUseCase,
    {
      provide: SmsProvider,
      // Or (MeliPayamak , SmsIr)
      useClass: SmsIrAdapter,
    },
    // {
    //   provide: 'UserRepository',
    //   useClass: InMemoryUserRepository,
    // },
    {
      provide: EmailProvider,
      // Or Another Liara
      useClass: LiaraSmtpServiceAdapter,
    },
    {
      provide: Cache,
      // Or memcache Adapter
      useClass: MemcacheAdapter,
    },
    {
      provide: NotificationRepository,
      // Or PrismaRepository
      useClass: PrismaRepository,
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
