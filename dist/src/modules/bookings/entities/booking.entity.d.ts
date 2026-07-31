import { User } from '../../users/entities/user.entity';
import { Seat } from '../../seats/entities/seat.entity';
export declare enum BookingStatus {
    PENDING = "PENDING",
    CONFIRMED = "CONFIRMED",
    EXPIRED = "EXPIRED",
    CANCELLED = "CANCELLED"
}
export declare class Booking {
    id: string;
    userId: string;
    seatId: string;
    amount: number;
    status: BookingStatus;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
    user: User;
    seat: Seat;
}
