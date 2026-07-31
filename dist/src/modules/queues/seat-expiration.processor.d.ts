import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Repository } from 'typeorm';
import { Seat } from '../seats/entities/seat.entity';
import { Booking } from '../bookings/entities/booking.entity';
export declare const SEAT_EXPIRATION_QUEUE = "seat-expiration";
export interface SeatExpirationJobData {
    seatId: string;
    bookingId: string;
}
export declare class SeatExpirationProcessor extends WorkerHost {
    private readonly seatRepository;
    private readonly bookingRepository;
    private readonly logger;
    constructor(seatRepository: Repository<Seat>, bookingRepository: Repository<Booking>);
    process(job: Job<SeatExpirationJobData>): Promise<void>;
}
