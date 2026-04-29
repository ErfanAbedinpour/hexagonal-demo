// src/user/domain/entities/user.entity.ts

import { UserId } from '../value-objects/user-id.vo';
import { UserCreatedEvent } from '../events/user-created.event';

export class User {
  private constructor(
    public readonly id: UserId,
    public identifier: string,
    public name: string,
  ) {}

  static create(id: UserId, identifier: string, name: string): User {
    const user = new User(id, identifier, name);
    return user;
  }
}
