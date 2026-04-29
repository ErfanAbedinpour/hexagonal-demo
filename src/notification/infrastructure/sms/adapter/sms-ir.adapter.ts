import { ISmsProvider } from '../../../application/ports/providers/sms-provider.port';

export class SmsIrAdapter implements ISmsProvider {
  send(
    destination: string,
    message: string,
  ): Promise<{ success: boolean; provider: string; error?: string }> {
    // Simulate sending SMS via SmsIr API
    return new Promise((resolve) => {
      // Simulate API call delay
      setTimeout(() => {
        // Simulate success response
        resolve({ success: true, provider: 'SmsIr' });
      }, 1000);
    });
  }

  get providerName(): string {
    return 'SmsIr';
  }
}
