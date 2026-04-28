// src/user/infrastructure/repositories/in-memory-user.repository.ts
import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../domain/repositories/user-repository.interface';
import { User } from '../../domain/entities/user.entity';
import { UserOrmEntity } from '../persistence/entities/user.orm-entity';
import { UserMapper } from '../../application/mappers/user.mapper';

@Injectable()
export class InMemoryUserRepository implements UserRepository {
  private users: Map<string, UserOrmEntity> = new Map();

  async findById(id: string): Promise<User | null> {
    return UserMapper.toDomain(this.users.get(id) as UserOrmEntity) || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.email === email) return UserMapper.toDomain(user);
    }
    return null;
  }

  async save(user: User): Promise<void> {
    this.users.set(user.id.value, UserMapper.toEntity(user) as UserOrmEntity);
  }

  async update(user: User): Promise<void> {
    this.users.set(user.id.value, UserMapper.toEntity(user) as UserOrmEntity);
  }

  async delete(id: string): Promise<void> {
    this.users.delete(id);
  }

  async findAll(): Promise<User[]> {
    return Array.from(this.users.values()).map(
      (user) => UserMapper.toDomain(user) as User,
    );
  }
}
