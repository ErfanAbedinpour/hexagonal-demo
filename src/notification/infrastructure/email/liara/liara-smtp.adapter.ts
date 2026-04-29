import { IEmailProvider } from '../../../application/ports/providers/email-provider.port';

export class LiaraSmtpServiceAdapter implements IEmailProvider {
  send(
    destination: string,
    message: string,
  ): Promise<{
    success: boolean;
    provider: string;
    error?: string;
    dest: string;
    message: string;
  }> {
    // Simulate sending email via Nodemailer API
    return new Promise((resolve) => {
      // Simulate API call delay
      setTimeout(() => {
        // Simulate success response
        resolve({
          success: true,
          provider: 'Liara',
          dest: destination,
          message,
        });
      }, 1000);
    });
  }

  get providerName(): string {
    return 'Liara';
  }
}
