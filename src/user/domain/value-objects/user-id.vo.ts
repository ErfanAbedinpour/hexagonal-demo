// src/user/domain/value-objects/user-id.vo.ts
export class UserId {
  private constructor(private readonly _value: string) {
    if (!this._value || this._value.length < 3) {
      throw new Error('Invalid user id');
    }
  }
  static create(value: string): UserId {
    return new UserId(value);
  }
  static generate(): UserId {
    return new UserId(Math.random().toString(36).substring(2, 15));
  }
  get value(): string {
    return this._value;
  }
  equals(other: UserId): boolean {
    return this._value === other._value;
  }
}
