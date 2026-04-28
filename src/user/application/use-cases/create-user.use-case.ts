// src/user/application/use-cases/create-user.use-case.ts
import { Inject, Injectable } from '@nestjs/common';
import { UserRepository } from '../../domain/repositories/user-repository.interface';
import { User } from '../../domain/entities/user.entity';
import { UserId } from '../../domain/value-objects/user-id.vo';

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject('UserRepository') private readonly userRepository: UserRepository,
  ) {}

  async execute(email: string, name: string): Promise<any> {
    const IsUserExists = !!this.userRepository.findByEmail(email);

    if (IsUserExists) {
      throw new Error('User already exists');
    }

    const user = User.create(UserId.generate(), email, name);
    await this.userRepository.save(user);
    return user;
  }
}
