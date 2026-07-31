import { OnApplicationBootstrap } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Event } from '../modules/events/entities/event.entity';
import { Seat } from '../modules/seats/entities/seat.entity';
import { User } from '../modules/users/entities/user.entity';
export declare class SeedService implements OnApplicationBootstrap {
    private readonly eventRepository;
    private readonly seatRepository;
    private readonly userRepository;
    private readonly logger;
    constructor(eventRepository: Repository<Event>, seatRepository: Repository<Seat>, userRepository: Repository<User>);
    onApplicationBootstrap(): Promise<void>;
    private seedData;
}
