import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<User> {
    return this.usersService.createUser(dto.email, dto.name, dto.password);
  }

  async validateUser(email: string, pass: string): Promise<User> {
    const user = await this.usersService.findByEmailWithPassword(email);
    if (user && (await bcrypt.compare(pass, user.passwordHash))) {
      const { passwordHash, ...result } = user as any;
      return result;
    }
    throw new UnauthorizedException('Invalid email or password');
  }

  async login(loginDto: LoginDto): Promise<{ accessToken: string; user: Omit<User, 'passwordHash'> }> {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    const payload = { sub: user.id, email: user.email };

    return {
      accessToken: this.jwtService.sign(payload),
      user,
    };
  }
}
