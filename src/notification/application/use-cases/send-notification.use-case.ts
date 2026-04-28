import { Injectable } from '@nestjs/common';
import { IEmailProvider } from '../ports/providers/email-provider.port';

@Injectable()
export class SendEmailNotificationUseCase {
  constructor(private readonly emailProvider: IEmailProvider) {}

  async Execute(destination: string, message: string) {
    await this.emailProvider.send(destination, message);
  }
}
