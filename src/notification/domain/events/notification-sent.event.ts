export class NotificationSentEvent {
  constructor(
    public readonly notificationId: string,
    public readonly userId: string,
    public readonly type: string,
    public readonly destination: string,
    public readonly provider: string,
    public readonly status: string,
  ) {}
}
