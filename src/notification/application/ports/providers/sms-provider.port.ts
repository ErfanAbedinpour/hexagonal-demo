export const SmsProvider = Symbol('ISmsProvider');
export interface ISmsProvider {
  send(
    destination: string,
    message: string,
  ): Promise<{ success: boolean; provider: string; error?: string }>;
}
