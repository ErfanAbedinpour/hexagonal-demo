import { Inject, Injectable } from '@nestjs/common';
import {
  ISmsProvider,
  SmsProvider,
} from '../ports/providers/sms-provider.port';
import {
  UserService,
  UserServicePort,
} from '../ports/external/user-service.port';

@Injectable()
export class SendSmsNotificationUseCase {
  constructor(
    @Inject(SmsProvider) private readonly emailProvider: ISmsProvider,
    @Inject(UserService) private readonly userService: UserServicePort,
  ) {}

  async Execute(destination: string, message: string) {
    const user = await this.userService.getUserByEmail(destination);
    if (!user) {
      return new Error('User Not Found');
    }
    console.log(
      'Sending Sms notification to ',
      destination,
      ' with message: ',
      message,
      'with Provider: ',
      this.emailProvider.providerName,
    );
    await this.emailProvider.send(destination, message);
  }
}
