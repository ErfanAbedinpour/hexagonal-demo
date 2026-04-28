// src/notification/application/ports/user-service.port.ts
import { User } from '../../../../user/domain/entities/user.entity';

export interface UserServicePort {
  getUserById(id: string): Promise<User | null>;
  findAllUsers(): Promise<User[]>;
}
