import { Module } from '@nestjs/common';
import { NotificationModule } from './notification/notification.module';

@Module({
  providers: [NotificationModule],
})
export class AppModule {}
