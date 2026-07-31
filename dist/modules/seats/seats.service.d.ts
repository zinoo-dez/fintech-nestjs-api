import { Repository } from 'typeorm';
import { Seat } from './entities/seat.entity';
export declare class SeatsService {
    private readonly seatRepository;
    constructor(seatRepository: Repository<Seat>);
    findByEvent(eventId: string): Promise<Seat[]>;
    findOne(id: string): Promise<Seat>;
}
