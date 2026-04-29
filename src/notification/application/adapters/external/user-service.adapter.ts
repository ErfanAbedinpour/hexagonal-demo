// src/notification/application/adapters/user-service.adapter.ts
import { Injectable, Inject } from '@nestjs/common';
import { UserServicePort } from '../../ports/external/user-service.port';
import { UserRepository } from '../../../../user/domain/repositories/user-repository.interface';
import { User } from '../../../../user/domain/entities/user.entity';

@Injectable()
export class UserServiceAdapter implements UserServicePort {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
  ) {}

  async getUserByIdentifier(identifier: string): Promise<User | null> {
    return this.userRepository.findByIdentifier(identifier);
  }
}
