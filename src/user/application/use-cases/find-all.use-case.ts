// src/user/application/use-cases/find-all.use-case.ts
import { Inject, Injectable } from '@nestjs/common';
import { UserRepository } from '../../domain/repositories/user-repository.interface';

@Injectable()
export class FindAllUsersUseCase {
  constructor(
    @Inject('UserRepository') private readonly userRepository: UserRepository,
  ) {}

  async execute(): Promise<any> {
    const users = await this.userRepository.findAll();
    return users.map((u) => ({
      identifier: u.identifier,
      id: u.id,
      name: u.name,
    }));
  }
}
