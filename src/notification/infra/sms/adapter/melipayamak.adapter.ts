import { ISmsProvider } from '../../../application/ports/providers/sms-provider.port';

export class MeliPayamakAdapter implements ISmsProvider {
  send(
    destination: string,
    message: string,
  ): Promise<{ success: boolean; provider: string; error?: string }> {
    // Simulate sending SMS via MeliPayamak API
    return new Promise((resolve) => {
      // Simulate API call delay
      setTimeout(() => {
        // Simulate success response
        resolve({ success: true, provider: 'MeliPayamak' });
      }, 1000);
    });
  }
}
