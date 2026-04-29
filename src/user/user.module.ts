// src/user/user.module.ts
import { Global, Module } from '@nestjs/common';
import { UserController } from './infrastructure/http/controllers/user.controller';
import { CreateUserUseCase } from './application/use-cases/create-user.use-case';
import { UserMapper } from './application/mappers/user.mapper';
import { InMemoryUserRepository } from './infrastructure/persistence/repositories/in-memory-user.repository';
import { FindAllUsersUseCase } from './application/use-cases/find-all.use-case';
import { DeleteUserUseCase } from './application/use-cases/delete-user.use-case';
import { FindUserByIdUseCase } from './application/use-cases/find-by-id-use-case';

@Global()
@Module({
  controllers: [UserController],
  providers: [
    CreateUserUseCase,
    FindUserByIdUseCase,
    DeleteUserUseCase,
    FindAllUsersUseCase,
    { provide: 'UserRepository', useClass: InMemoryUserRepository },
  ],
  exports: ['UserRepository'],
})
export class UserModule {}
