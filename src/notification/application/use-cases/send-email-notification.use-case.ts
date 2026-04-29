import { Inject, Injectable } from '@nestjs/common';
import {
  EmailProvider,
  IEmailProvider,
} from '../ports/providers/email-provider.port';
import {
  UserService,
  UserServicePort,
} from '../ports/external/user-service.port';

@Injectable()
export class SendEmailNotificationUseCase {
  constructor(
    @Inject(EmailProvider) private readonly emailProvider: IEmailProvider,
    @Inject(UserService) private readonly userService: UserServicePort,
  ) {}

  async Execute(destination: string, message: string) {
    const user = await this.userService.getUserByEmail(destination);
    if (!user) {
      return new Error('User Not Found');
    }

    console.log(
      'Sending email notification to ',
      user.email,
      ' with message: ',
      message,
      'with Provider: ',
      this.emailProvider.providerName,
    );
    await this.emailProvider.send(destination, message);
  }
}
