// src/user/application/use-cases/create-user.use-case.ts
import { Inject, Injectable } from '@nestjs/common';
import { UserRepository } from '../../domain/repositories/user-repository.interface';
import { User } from '../../domain/entities/user.entity';
import { UserId } from '../../domain/value-objects/user-id.vo';
import { ApplicationError } from '../../../common/filters/application-error.filter';

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject('UserRepository') private readonly userRepository: UserRepository,
  ) {}

  async execute(identifier: string, name: string): Promise<any> {
    const isUserExists =
      !!(await this.userRepository.findByIdentifier(identifier));

    if (isUserExists) {
      throw new ApplicationError('User already exists');
    }

    const user = User.create(UserId.generate(), identifier, name);
    await this.userRepository.save(user);
    return {
      id: user.id.value,
      identifier: user.identifier,
      name: user.name,
    };
  }
}
