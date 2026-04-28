import { Module } from '@nestjs/common';
import { NotificationModule } from './notification/notification.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [NotificationModule, UserModule],
})
export class AppModule {}
