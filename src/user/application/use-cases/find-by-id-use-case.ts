// src/user/application/use-cases/create-user.use-case.ts
import { Inject, Injectable } from '@nestjs/common';
import { UserRepository } from '../../domain/repositories/user-repository.interface';

@Injectable()
export class FindUserByIdUseCase {
  constructor(
    @Inject('UserRepository') private readonly userRepository: UserRepository,
  ) {}

  async execute(id: string): Promise<any> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }
}
