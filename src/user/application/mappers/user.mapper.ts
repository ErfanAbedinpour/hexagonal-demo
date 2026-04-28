// src/user/application/mappers/user.mapper.ts
import { Injectable } from '@nestjs/common';
import { User } from '../../domain/entities/user.entity';
import { UserOrmEntity } from '../../infrastructure/persistence/entities/user.orm-entity';
import { UserId } from '../../domain/value-objects/user-id.vo';

// this is should map a DB entity to a domain entity and vice versa
export class UserMapper {
  // this is for testing purposes
  static toDomain(user: UserOrmEntity): User {
    return User.create(UserId.create(user.id), user.email, user.name);
  }
  // this is for testing purposes
  static toEntity(user: User): UserOrmEntity {
    return {
      id: user.id.value,
      email: user.email,
      name: user.name,
    };
  }
}
