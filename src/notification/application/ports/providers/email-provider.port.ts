export const EmailProvider = Symbol('EmailProvider');
export interface IEmailProvider {
  send(
    destination: string,
    message: string,
  ): Promise<{ success: boolean; provider: string; error?: string }>;

  get providerName(): string;
}
