import { IEmailProvider } from '../../../application/ports/providers/email-provider.port';

export class NodemailerAdapter implements IEmailProvider {
  send(
    destination: string,
    message: string,
  ): Promise<{ success: boolean; provider: string; error?: string }> {
    // Simulate sending email via Nodemailer API
    return new Promise((resolve) => {
      // Simulate API call delay
      setTimeout(() => {
        // Simulate success response
        resolve({ success: true, provider: 'Nodemailer' });
      }, 1000);
    });
  }
}
