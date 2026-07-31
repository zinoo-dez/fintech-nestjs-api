import { Seat } from '../../seats/entities/seat.entity';
export declare class Event {
    id: string;
    title: string;
    description: string;
    venue: string;
    eventDate: Date;
    totalSeats: number;
    createdAt: Date;
    updatedAt: Date;
    seats: Seat[];
}
