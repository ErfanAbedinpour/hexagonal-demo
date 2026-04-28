// src/user/api/controllers/user.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { CreateUserUseCase } from '../../../application/use-cases/create-user.use-case';

@Controller('users')
export class UserController {
  constructor(private readonly createUserUseCase: CreateUserUseCase) {}

  @Post()
  async create(@Body() body: { email: string; name: string }) {
    return this.createUserUseCase.execute(body.email, body.name);
  }
}
