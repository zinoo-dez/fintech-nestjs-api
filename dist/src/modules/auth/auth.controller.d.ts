import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<import("../users/entities/user.entity").User>;
    login(dto: LoginDto): Promise<{
        accessToken: string;
        user: Omit<import("../users/entities/user.entity").User, "passwordHash">;
    }>;
    getProfile(req: any): any;
}
