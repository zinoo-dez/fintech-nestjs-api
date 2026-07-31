import { SeatsService } from './seats.service';
import { HoldSeatDto } from './dto/hold-seat.dto';
export declare class SeatsController {
    private readonly seatsService;
    constructor(seatsService: SeatsService);
    holdSeat(seatId: string, holdSeatDto: HoldSeatDto): Promise<{
        seat: import("./entities/seat.entity").Seat;
        booking: import("../bookings/entities/booking.entity").Booking;
    }>;
}
