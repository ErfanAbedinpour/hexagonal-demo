import { Body, Controller, Post } from '@nestjs/common';
import { SendEmailNotificationUseCase } from '../../../application/use-cases/send-notification.use-case';
import { SendNotificationDto } from '../../../application/dto/send-notif.dto';

@Controller('notifications')
export class NotificationController {
  constructor(
    private readonly sendNotificationUseCase: SendEmailNotificationUseCase,
  ) {}
  @Post()
  sendNotification(@Body() body: SendNotificationDto) {
    return this.sendNotificationUseCase.Execute(body.destination, body.message);
  }
}
