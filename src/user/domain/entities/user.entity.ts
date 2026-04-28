// src/user/domain/entities/user.entity.ts

import { UserId } from '../value-objects/user-id.vo';
import { UserCreatedEvent } from '../events/user-created.event';

export class User {
  private _events: any[] = [];
  private constructor(
    private readonly _id: UserId,
    private _email: string,
    private _name: string,
  ) {}

  static create(id: UserId, email: string, name: string): User {
    const user = new User(id, email, name);
    user.addDomainEvent(new UserCreatedEvent(id, email));
    return user;
  }

  get id(): UserId {
    return this._id;
  }

  get email(): string {
    return this._email;
  }

  set email(email: string) {
    this._email = email;
  }

  get name(): string {
    return this._name;
  }

  set name(name: string) {
    this._name = name;
  }

  get domainEvents(): readonly any[] {
    return [...this._events];
  }

  addDomainEvent(event: any): void {
    this._events.push(event);
  }

  clearEvents(): void {
    this._events = [];
  }
}
