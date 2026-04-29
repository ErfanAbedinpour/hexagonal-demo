import { Body, Controller, Post } from '@nestjs/common';
import { SendEmailNotificationUseCase } from '../../../application/use-cases/send-email-notification.use-case';
import { SendNotificationDto } from '../../../application/dto/send-notif.dto';
import { ApiBody } from '@nestjs/swagger';
import { SendSmsNotificationUseCase } from '../../../application/use-cases/send-sms-notification.use-case';

@Controller('notifications')
export class NotificationController {
  constructor(
    private readonly sendNotificationUseCase: SendEmailNotificationUseCase,
    private readonly sendSmsNotificationUseCase: SendSmsNotificationUseCase,
  ) {}

  @Post('email')
  @ApiBody({ type: SendNotificationDto })
  sendEmailNotification(@Body() body: SendNotificationDto) {
    return this.sendNotificationUseCase.Execute(body.destination, body.message);
  }

  @Post('sms')
  @ApiBody({ type: SendNotificationDto })
  sendSmsNotification(@Body() body: SendNotificationDto) {
    return this.sendSmsNotificationUseCase.Execute(
      body.destination,
      body.message,
    );
  }
}
