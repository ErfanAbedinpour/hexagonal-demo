// src/user/domain/events/user-created.event.ts
import { UserId } from '../value-objects/user-id.vo';

export class UserCreatedEvent {
  public readonly eventName = 'user.created';
  constructor(
    public readonly userId: UserId,
    public readonly email: string,
  ) {}
}
