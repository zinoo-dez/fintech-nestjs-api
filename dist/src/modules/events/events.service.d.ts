import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';
export declare class EventsService {
    private readonly eventRepository;
    constructor(eventRepository: Repository<Event>);
    findAll(): Promise<Event[]>;
    findOne(id: string): Promise<Event>;
}
