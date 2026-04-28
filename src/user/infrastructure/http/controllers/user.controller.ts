// src/user/api/controllers/user.controller.ts
import { Controller, Post, Body, Get, Delete, Param } from '@nestjs/common';
import { CreateUserUseCase } from '../../../application/use-cases/create-user.use-case';
import { FindUserByIdUseCase } from '../../../application/use-cases/find-by-id-use-case';
import { DeleteUserUseCase } from '../../../application/use-cases/delete-user.use-case';
import { FindAllUsersUseCase } from '../../../application/use-cases/find-all.use-case';
import { CreateUserDto } from '../dto/users.dto';
import { ApiBody, ApiParam } from '@nestjs/swagger';

@Controller('users')
export class UserController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly findByIdUseCase: FindUserByIdUseCase,
    private readonly deleteByIdUseCase: DeleteUserUseCase,
    private readonly findAllUseCase: FindAllUsersUseCase,
  ) {}

  @Post()
  @ApiBody({ type: CreateUserDto })
  async create(@Body() body: CreateUserDto) {
    return this.createUserUseCase.execute(body.email, body.name);
  }

  @ApiParam({ name: 'id', type: 'string' })
  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.findByIdUseCase.execute(id);
  }

  @Get()
  async findAll() {
    return this.findAllUseCase.execute();
  }

  @ApiParam({ name: 'id', type: 'string' })
  @Delete(':id')
  async deleteById(@Param('id') id: string) {
    return this.deleteByIdUseCase.execute(id);
  }
}
