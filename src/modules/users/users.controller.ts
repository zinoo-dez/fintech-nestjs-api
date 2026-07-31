import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { UsersService } from './users.service';

export class CreateUserDto {
  email: string;
  name: string;
  password?: string;
}

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getUsers() {
    return this.usersService.findAll();
  }

  @Get(':id')
  async getUser(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Post()
  async createUser(@Body() dto: CreateUserDto) {
    return this.usersService.createUser(dto.email, dto.name, dto.password);
  }
}
