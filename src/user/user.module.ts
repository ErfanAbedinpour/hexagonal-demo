// src/user/user.module.ts
import { Module } from '@nestjs/common';
import { UserController } from './infrastructure/http/controllers/user.controller';
import { CreateUserUseCase } from './application/use-cases/create-user.use-case';
import { UserMapper } from './application/mappers/user.mapper';
import { InMemoryUserRepository } from './infrastructure/persistence/repositories/in-memory-user.repository';

@Module({
  controllers: [UserController],
  providers: [
    CreateUserUseCase,
    { provide: 'UserRepository', useClass: InMemoryUserRepository },
  ],
})
export class UserModule {}
