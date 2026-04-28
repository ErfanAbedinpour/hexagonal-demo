// src/user/user.module.ts
import { Module } from '@nestjs/common';
import { UserController } from './api/controllers/user.controller';
import { CreateUserUseCase } from './application/use-cases/create-user.use-case';
import { UserMapper } from './application/mappers/user.mapper';
import { InMemoryUserRepository } from './infrastructure/persistence/repositories/in-memory-user.repository';

@Module({
  controllers: [UserController],
  providers: [
    CreateUserUseCase,
    UserMapper,
    { provide: 'UserRepository', useClass: InMemoryUserRepository },
  ],
})
export class UserModule {}
