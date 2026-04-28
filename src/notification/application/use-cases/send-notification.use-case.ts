import { Inject, Injectable } from '@nestjs/common';
import {
  EmailProvider,
  IEmailProvider,
} from '../ports/providers/email-provider.port';

@Injectable()
export class SendEmailNotificationUseCase {
  constructor(
    @Inject(EmailProvider) private readonly emailProvider: IEmailProvider,
  ) {}

  async Execute(destination: string, message: string) {
    await this.emailProvider.send(destination, message);
  }
}
