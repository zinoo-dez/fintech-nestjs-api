import { Event } from '../../events/entities/event.entity';
export declare enum SeatStatus {
    AVAILABLE = "AVAILABLE",
    HELD = "HELD",
    BOOKED = "BOOKED"
}
export declare class Seat {
    id: string;
    eventId: string;
    seatNumber: string;
    price: number;
    status: SeatStatus;
    heldByUserId: string | null;
    heldUntil: Date | null;
    version: number;
    createdAt: Date;
    updatedAt: Date;
    event: Event;
}
