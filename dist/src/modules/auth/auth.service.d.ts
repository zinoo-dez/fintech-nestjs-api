import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '../users/entities/user.entity';
export declare class AuthService {
    private readonly usersService;
    private readonly jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    register(dto: RegisterDto): Promise<User>;
    validateUser(email: string, pass: string): Promise<User>;
    login(loginDto: LoginDto): Promise<{
        accessToken: string;
        user: Omit<User, 'passwordHash'>;
    }>;
}
