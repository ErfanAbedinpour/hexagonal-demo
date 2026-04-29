// src/notification/application/ports/user-service.port.ts
import { User } from '../../../../user/domain/entities/user.entity';

export const UserService = Symbol('UserService');

export interface UserServicePort {
  getUserByEmail(email: string): Promise<User | null>;
}
