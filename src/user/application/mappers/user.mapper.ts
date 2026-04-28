// src/user/application/mappers/user.mapper.ts
import { Injectable } from '@nestjs/common';
import { User } from '../../domain/entities/user.entity';
import { UserOrmEntity } from '../../infrastructure/persistence/entities/user.orm-entity';

// this is should map a DB entity to a domain entity and vice versa
export class UserMapper {
  // this is for testing purposes
  static toDomain(user: UserOrmEntity): User | null {
    return null;
  }
  // this is for testing purposes
  static toEntity(user: User): UserOrmEntity | null {
    return null;
  }
}
