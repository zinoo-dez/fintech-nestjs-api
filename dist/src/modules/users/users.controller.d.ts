import { UsersService } from './users.service';
export declare class CreateUserDto {
    email: string;
    name: string;
    password?: string;
}
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getUsers(): Promise<import("./entities/user.entity").User[]>;
    getUser(id: string): Promise<import("./entities/user.entity").User>;
    createUser(dto: CreateUserDto): Promise<import("./entities/user.entity").User>;
}
