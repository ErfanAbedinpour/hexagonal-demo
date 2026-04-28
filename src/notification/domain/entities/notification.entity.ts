import { NotificationType } from '../value-objects/notification-type.vo';
import { NotificationStatus } from '../value-objects/notification-status.vo';

export class Notification {
  constructor(
    readonly id: string,
    readonly userId: string,
    readonly type: NotificationType,
    readonly destination: string,
    readonly message: string,
    private _status: NotificationStatus,
    readonly createdAt: Date = new Date(),
    readonly provider: string = '',
  ) {}

  get status(): NotificationStatus {
    return this._status;
  }

  markSent() {
    this._status = NotificationStatus.SENT;
  }

  markFailed() {
    this._status = NotificationStatus.FAILED;
  }
}
