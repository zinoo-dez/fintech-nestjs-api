import { EventsService } from './events.service';
import { SeatsService } from '../seats/seats.service';
export declare class EventsController {
    private readonly eventsService;
    private readonly seatsService;
    constructor(eventsService: EventsService, seatsService: SeatsService);
    getEvents(): Promise<import("./entities/event.entity").Event[]>;
    getEventDetails(id: string): Promise<import("./entities/event.entity").Event>;
    getEventSeats(eventId: string): Promise<import("../seats/entities/seat.entity").Seat[]>;
}
